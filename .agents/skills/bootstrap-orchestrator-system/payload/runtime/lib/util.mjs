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
