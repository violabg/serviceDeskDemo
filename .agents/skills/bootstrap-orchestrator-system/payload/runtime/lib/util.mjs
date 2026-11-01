import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// A refusal the caller can repair. The CLI prints `payload` (or `message`) and exits with code 1.
export class RuntimeError extends Error {
  constructor(message, payload) {
    super(message);
    this.payload = payload;
  }
}

const ID_PATTERN = /^[A-Za-z0-9_]{1,100}$/;
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

// Lab-authored: a stale lock is one left by a process that died; no design call holds it this long.
const STALE_LOCK_MS = 120_000;
const LOCK_WAIT = new Int32Array(new SharedArrayBuffer(4));

// Runs a synchronous function holding a directory lock shared between runtime processes.
export function withLock(path, run) {
  mkdirSync(dirname(path), { recursive: true });
  for (;;) {
    try {
      mkdirSync(path);
      break;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      const stat = statSync(path, { throwIfNoEntry: false });
      if (stat && Date.now() - stat.mtimeMs > STALE_LOCK_MS) rmSync(path, { recursive: true, force: true });
      else Atomics.wait(LOCK_WAIT, 0, 0, 20);
    }
  }
  try {
    return run();
  } finally {
    rmSync(path, { recursive: true, force: true });
  }
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
// The flags that name a job in the call for a later part, so that call can be run exactly as printed. The role travels
// with it: a role's calls must name the role (contracts/workflow-loop.md, Parts and Roles).
export function jobFlags(source, { role } = {}) {
  return `--sessionId ${arg(source, "sessionId")} --jobId ${arg(source, "jobId")}${role ? ` --role ${role}` : ""}`;
}

export function arg(source, name) {
  if (!source || typeof source !== "object") return undefined;
  if (name in source) return source[name];
  const key = Object.keys(source).find((k) => k.toLowerCase() === name.toLowerCase());
  return key === undefined ? undefined : source[key];
}

// JSON with one array element per line: as valid and as complete as the indented form, smaller, and split at a
// row boundary when the answer is served in parts.
export function linedJson(value) {
  const rows = (list) => (list.length ? `[\n${list.map((row) => JSON.stringify(row)).join(",\n")}\n]` : "[]");
  if (Array.isArray(value)) return rows(value);
  const fields = Object.entries(value).map(([key, field]) => `${JSON.stringify(key)}:${Array.isArray(field) ? rows(field) : JSON.stringify(field)}`);
  return `{${fields.join(",\n")}}`;
}

// Lab-authored: the default size of a part, in UTF-8 bytes, including its markers. Shell hosts cap the output
// they show of one command and spill the rest to a file the agent may not be able to read: about 30,000
// characters in Claude Code, about 8 KB in Copilot CLI. `partLimit` in the runtime config overrides it, and
// Bootstrap sets it to the smallest limit of the selected clients.
export const PART_LIMIT = 24000;

// The header and footer of a part, kept out of the room its text may use.
const PART_MARGIN = 600;
const bytes = (text) => Buffer.byteLength(text, "utf8");

// A heading repeated at the top of a later piece of a split unit, so the piece names what it continues.
const continuation = (first) => (/^#{1,6} /.test(first) && first.length <= 200 ? `${first} (continued)` : null);

// Cuts one line longer than the limit, after a space when one is near and else at a character boundary, so a
// word or a {{O1.2}} anchor stays whole. Rare: only prose stored on a single line.
function cutLine(line, limit) {
  const pieces = [];
  let piece = "";
  let size = 0;
  for (const char of line) {
    const width = bytes(char);
    if (size + width > limit) {
      const space = piece.lastIndexOf(" ");
      const at = space >= piece.length / 2 ? space + 1 : piece.length;
      pieces.push(piece.slice(0, at));
      piece = piece.slice(at);
      size = bytes(piece);
    }
    piece += char;
    size += width;
  }
  pieces.push(piece);
  return pieces;
}

// A unit that fits stays whole; a longer one continues on line boundaries and loses no text.
function piecesOf(unit, limit) {
  if (bytes(unit) <= limit) return [unit];
  const lines = unit.split("\n");
  const heading = continuation(lines[0]);
  const room = heading ? limit - bytes(heading) - 1 : limit;
  const pieces = [];
  let current = null;
  for (const line of lines.flatMap((l) => (bytes(l) > room ? cutLine(l, room) : [l]))) {
    if (current !== null && bytes(current) + 1 + bytes(line) > room) {
      pieces.push(current);
      current = line;
    } else current = current === null ? line : `${current}\n${line}`;
  }
  pieces.push(current);
  return pieces.map((piece, index) => (index > 0 && heading ? `${heading}\n${piece}` : piece));
}

// Splits text into parts of at most `limit` bytes. A part starts at a unit boundary (`starts(line, previous)`
// is true), except inside a unit longer than the limit, which continues over several parts.
export function splitParts(text, starts, limit = PART_LIMIT) {
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
  for (const piece of units.flatMap((u) => piecesOf(u, limit))) {
    if (current !== null && bytes(current) + 1 + bytes(piece) > limit) {
      parts.push(current);
      current = piece;
    } else current = current === null ? piece : `${current}\n${piece}`;
  }
  parts.push(current);
  return parts;
}

// Serves part `args.part` (default 1) of a long answer, with a header and a footer that say where the text
// continues. `next(k)` says how to request part k. An answer that fits is returned unchanged. `onServed(n, parts)`
// runs only for a valid part, so a refused request records nothing.
// Lab-authored: the footer asks for each call as a command of its own, because an agent that loops over parts or
// pipes them through `head`, `cut` or `dd` exceeds the host cap again and loses text. Part 1 asks for every other
// part at once: a client that runs tool calls in parallel then spends one turn on them instead of one per part.
export function servePart(text, args, { tool, starts, next, limit = PART_LIMIT, onServed }) {
  const requested = arg(args, "part");
  const parts = splitParts(text, starts, limit - PART_MARGIN);
  const n = requested === undefined ? 1 : Number(requested);
  if (!Number.isInteger(n) || n < 1 || n > parts.length) {
    throw new RuntimeError(`${tool} failed: part must be a whole number from 1 to ${parts.length}. Provided value: '${requested}'.`);
  }
  onServed?.(n, parts);
  if (parts.length === 1) return text;
  const header = n > 1 ? `[part ${n} of ${parts.length}]\n` : "";
  const body = parts[n - 1].replace(/\n+$/, "");
  const total = parts.length;
  const alone = "as a shell command of its own, with nothing chained and no pipe";
  let footer = `[part ${n} of ${total}: end of the answer.]`;
  if (n === 1 && total === 2) footer = `[part 1 of 2. The answer continues in part 2: ${next(2)} Run it ${alone}. Read every part before acting on any of it.]`;
  else if (n === 1) footer = `[part 1 of ${total}. The answer continues in parts 2 to ${total}: ${next(2)} Request each remaining part the same way, ${alone}: all in this turn as parallel tool calls if your client allows it, or else one by one. Read every part before acting on any of it.]`;
  else if (n < total) footer = `[part ${n} of ${total}. Parts ${n + 1} to ${total} follow, if you have not requested them yet: ${next(n + 1)} Run each ${alone}.]`;
  return `${header}${body}\n\n${footer}\n`;
}
