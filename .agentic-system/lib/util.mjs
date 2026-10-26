import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// A refusal the caller can repair. The CLI prints `payload` (or `message`) and exits with code 1.
export class RuntimeError extends Error {
  constructor(message, payload) {
    super(message);
    this.payload = payload;
  }
}

export const ID_PATTERN = /^[A-Za-z0-9_]{1,100}$/;
export const ARTIFACT_PATTERN = /^[A-Za-z0-9_.-]{1,150}$/;

export function requireId(value, field, tool) {
  if (typeof value !== "string" || value.length === 0) {
    throw new RuntimeError(`${tool} failed: '${field}' is required.`);
  }
  if (!ID_PATTERN.test(value)) {
    throw new RuntimeError(
      `${tool} failed: ${field} contains unsupported characters. Allowed format: ^[A-Za-z0-9_]{1,100}$. Provided value: '${value}'.`,
    );
  }
  return value;
}

export function requireString(value, field, tool) {
  if (typeof value !== "string" || value.trim().length === 0) throw new RuntimeError(`${tool} failed: '${field}' is required.`);
  return value;
}

export function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

export function writeText(path, text) {
  mkdirSync(dirname(path), { recursive: true });
  const temp = `${path}.tmp-${process.pid}`;
  writeFileSync(temp, text);
  renameSync(temp, path);
}

export function writeJson(path, value) {
  writeText(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

export function iso(date) {
  return date.toISOString();
}

// `2026-10-20 15:13:05Z`, the timestamp form used in the projections.
export function shortTime(value) {
  if (!value) return "";
  return `${value.slice(0, 10)} ${value.slice(11, 19)}Z`;
}

export function frontmatter(data) {
  const lines = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
  return `---\n${lines.join("\n")}\n---\n`;
}

export function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) return { data: {}, body: text };
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) return { data: {}, body: text };
  const data = {};
  for (const line of text.slice(4, end).split("\n")) {
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;
    const raw = match[2].trim();
    try {
      data[match[1]] = JSON.parse(raw);
    } catch {
      // YAML flow list of plain scalars: [a, b c, d]
      data[match[1]] = /^\[.*\]$/.test(raw)
        ? raw.slice(1, -1).split(",").map((item) => item.trim().replace(/^["']|["']$/g, "")).filter(Boolean)
        : raw.replace(/^["']|["']$/g, "");
    }
  }
  return { data, body: text.slice(end + 5) };
}

// Case-insensitive lookup of an argument, so `WorkspacePath` and `workspacePath` are both accepted.
export function arg(source, name) {
  if (!source || typeof source !== "object") return undefined;
  if (name in source) return source[name];
  const key = Object.keys(source).find((k) => k.toLowerCase() === name.toLowerCase());
  return key === undefined ? undefined : source[key];
}

// Lab-authored: the largest part a long answer is served in. Shell hosts cap a command's visible output
// (about 30,000 characters in Claude Code) and spill the rest to a file the agent then slices by hand,
// losing text; a part below the cap arrives whole.
export const PART_LIMIT = 24000;

// Splits text into parts of at most PART_LIMIT characters. A part only ever starts at a unit boundary
// (`starts(line, previous)` is true); a single unit longer than the limit is a part of its own.
export function splitParts(text, starts) {
  const lines = text.split("\n");
  const units = [];
  let unit = [];
  lines.forEach((line, index) => {
    if (unit.length && starts(line, lines[index - 1])) {
      units.push(unit.join("\n"));
      unit = [];
    }
    unit.push(line);
  });
  units.push(unit.join("\n"));
  const parts = [];
  let current = null;
  for (const u of units) {
    if (current !== null && current.length + 1 + u.length > PART_LIMIT) {
      parts.push(current);
      current = u;
    } else current = current === null ? u : `${current}\n${u}`;
  }
  parts.push(current);
  return parts;
}

// Serves part `args.part` (default 1, or "all") of a long answer, with a header and a footer that say where
// the text continues. `next(k)` says how to request part k. An answer that fits is returned unchanged.
export function servePart(text, args, { tool, starts, next }) {
  const requested = arg(args, "part");
  if (requested !== undefined && String(requested).toLowerCase() === "all") return text;
  const parts = splitParts(text, starts);
  const n = requested === undefined ? 1 : Number(requested);
  if (!Number.isInteger(n) || n < 1 || n > parts.length) {
    throw new RuntimeError(`${tool} failed: part must be a whole number from 1 to ${parts.length}, or "all". Provided value: '${requested}'.`);
  }
  if (parts.length === 1) return text;
  const header = n > 1 ? `[part ${n} of ${parts.length}]\n` : "";
  const body = parts[n - 1].replace(/\n+$/, "");
  const footer =
    n < parts.length
      ? `[part ${n} of ${parts.length}. The answer continues: ${next(n + 1)} Read every part before acting on any of it.]`
      : `[part ${n} of ${parts.length}: end of the answer.]`;
  return `${header}${body}\n\n${footer}\n`;
}
