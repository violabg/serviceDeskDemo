#!/usr/bin/env node
// Thin CLI adapter over lib/api.mjs.
//
//   node agentic-system.mjs <token> [--json <file> | --json -] [--<argument> <value> ...]
//
// The JSON payload is the operation's argument object (e.g. { "sessionId", "jobId", "request" }). Flags
// set top-level arguments and override the payload. Large payloads must go through a file or stdin:
// inline JSON flags are refused above INLINE_LIMIT characters so shell quoting never mangles a design.
import { readFileSync } from "node:fs";
import { call, handlers } from "../lib/api.mjs";
import { createContext } from "../lib/context.mjs";

const INLINE_LIMIT = 2000;

function usage() {
  return [
    "usage: node agentic-system.mjs <command> [--json <file>|-] [--<argument> <value> ...]",
    "",
    "commands:",
    ...Object.keys(handlers).map((name) => `  ${name}`),
  ].join("\n");
}

function flagValue(name, value) {
  if ((value.startsWith("{") || value.startsWith("[")) && value.length > INLINE_LIMIT) {
    throw new Error(`--${name} carries ${value.length} characters of inline JSON; write it to a file and pass --json <file>`);
  }
  try {
    return value.startsWith("{") || value.startsWith("[") ? JSON.parse(value) : value;
  } catch {
    return value;
  }
}

// A flag takes every value up to the next flag, and a repeated flag adds to the earlier ones, so
// `--fileIds 6 11` and `--fileIds 6 --fileIds 11` both pass [6, 11]; a single value stays a scalar.
function parse(argv) {
  const [token, ...rest] = argv;
  const values = new Map();
  let payload = {};
  for (let i = 0; i < rest.length; i++) {
    const flag = rest[i];
    if (!flag.startsWith("--")) throw new Error(`unexpected argument '${flag}'`);
    const name = flag.slice(2);
    const taken = [];
    while (i + 1 < rest.length && !rest[i + 1].startsWith("--")) taken.push(rest[++i]);
    if (name === "json") {
      if (taken.length !== 1) throw new Error("--json takes exactly one value: a file path, or - for stdin");
      payload = JSON.parse(taken[0] === "-" ? readFileSync(0, "utf8") : readFileSync(taken[0], "utf8"));
      continue;
    }
    if (!values.has(name)) values.set(name, []);
    values.get(name).push(...(taken.length ? taken.map((v) => flagValue(name, v)) : ["true"]));
  }
  const args = Object.fromEntries([...values].map(([name, list]) => [name, list.length === 1 ? list[0] : list.flat()]));
  return { token, args: { ...payload, ...args } };
}

const argv = process.argv.slice(2);
if (argv.length === 0 || argv[0] === "--help" || argv[0] === "help") {
  console.log(usage());
  process.exit(argv.length === 0 ? 2 : 0);
}
let parsed;
try {
  parsed = parse(argv);
} catch (error) {
  console.error(`agentic-system: ${error.message}`);
  process.exit(2);
}
const result = await call(createContext(), parsed.token, parsed.args);
const stream = result.exitCode === 0 ? process.stdout : process.stderr;
// Writes to a pipe are asynchronous: exit only once the output is flushed, or a reader gets the first 64 KB.
stream.write(result.output.endsWith("\n") ? result.output : `${result.output}\n`, () => process.exit(result.exitCode));
