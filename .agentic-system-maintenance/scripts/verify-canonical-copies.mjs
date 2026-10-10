// No dependencies. Run with Node.js:
// node verify-canonical-copies.mjs <skill-or-snapshot-root> <repo-root> <preservation-plan.json>
// Plan: {version: 1, canonical_outputs: ["path/from/approved/file-inventory"],
// copies: [{template, sha256, output, values: {SLOT: "value"},
//   blocks: [{slot: "BLOCK_SLOT", occurrence: 0, value: "approved block content"}]}]}
// APPROVED_MCP_TOOLS is an array of names; every other inline value is a string.
// Block occurrence is zero-based for that slot. No arbitrary text replacements.
import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const normalize = (text) => text.replace(/\r\n?/g, "\n");
const hash = (text) => createHash("sha256").update(normalize(text)).digest("hex");
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

export function fillCanonicalCopy(source, record) {
  if (hash(source) !== record.sha256) throw new Error("source hash differs from approved template");
  let text = normalize(source);
  const values = record.values ?? {};
  const blocks = record.blocks ?? [];
  if (!values || typeof values !== "object" || Array.isArray(values) || !Array.isArray(blocks)) {
    throw new Error("values must be an object and blocks must be an array");
  }
  const declared = new Set([...text.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)].map((match) => match[1]));
  for (const key of Object.keys(values)) {
    if (!declared.has(key)) throw new Error(`undeclared inline slot ${key}`);
  }

  // Scan markers as a stack so a malformed or nested region cannot hide fixed text.
  const lines = text.split("\n");
  const output = [];
  const counts = new Map();
  const usedBlocks = new Set();
  let region;
  for (const line of lines) {
    const start = /^<!-- CANONICAL-TEMPLATE-SLOT: ([A-Z0-9_]+) START replaces=(?:none|sha256:[a-f0-9]+ lines=\d+) -->$/.exec(line);
    const end = /^<!-- CANONICAL-TEMPLATE-SLOT: ([A-Z0-9_]+) END -->$/.exec(line);
    if (start) {
      if (region) throw new Error("nested slot markers are not supported");
      const slot = start[1];
      const occurrence = counts.get(slot) ?? 0;
      counts.set(slot, occurrence + 1);
      const matches = blocks.map((block, index) => ({ block, index }))
        .filter(({ block }) => block.slot === slot && block.occurrence === occurrence);
      if (matches.length > 1) throw new Error(`duplicate block fill ${slot}:${occurrence}`);
      region = { slot, lines: [], fill: matches[0] };
    } else if (end) {
      if (!region || region.slot !== end[1]) throw new Error("unmatched slot end");
      if (region.fill) {
        const { block, index } = region.fill;
        if (typeof block.value !== "string") throw new Error("block value must be a string");
        usedBlocks.add(index);
        if (block.value !== "") output.push(normalize(block.value));
      } else output.push(...region.lines);
      region = undefined;
    } else {
      if (line.includes("CANONICAL-TEMPLATE-SLOT")) throw new Error("malformed slot marker");
      (region ? region.lines : output).push(line);
    }
  }
  if (region) throw new Error("unclosed slot marker");
  if (usedBlocks.size !== blocks.length) throw new Error("block fill does not match a declared occurrence");
  text = output.join("\n");

  // The shipped mirrors quote the optional MCP slot as one list item. Expand
  // just that item, preserving all other frontmatter text and its ordering.
  if (text.includes('"{{APPROVED_MCP_TOOLS}}"')) {
    const tools = values.APPROVED_MCP_TOOLS;
    if (!Array.isArray(tools) || tools.some((tool) => typeof tool !== "string" || !tool.trim())) {
      throw new Error("APPROVED_MCP_TOOLS must be an array of nonempty tool names");
    }
    const serialized = tools.map((tool) => JSON.stringify(tool)).join(", ");
    if (values.PLATFORM_TOOLS === "") {
      text = text.replace(/\{\{PLATFORM_TOOLS\}\}, "\{\{APPROVED_MCP_TOOLS\}\}"/g, () => serialized);
    }
    text = text.replace(/, "\{\{APPROVED_MCP_TOOLS\}\}"/g, () => serialized ? `, ${serialized}` : "");
    text = text.replace(/"\{\{APPROVED_MCP_TOOLS\}\}"/g, () => serialized);
  }
  text = text.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, slot) => {
    if (!own(values, slot) || typeof values[slot] !== "string") throw new Error(`missing string value for ${slot}`);
    return normalize(values[slot]);
  });
  if (/\{\{[A-Z0-9_]+\}\}|CANONICAL-TEMPLATE-SLOT/.test(text)) throw new Error("unresolved or introduced slot");
  return text;
}

function containedFile(root, path) {
  if (typeof path !== "string" || !path || isAbsolute(path)) throw new Error("expected a relative file path");
  const base = realpathSync(root);
  const file = realpathSync(resolve(base, path));
  const rel = relative(base, file);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error("file escapes declared root");
  return file;
}

export function verifyCanonicalCopies(templateRoot, repoRoot, plan) {
  if (plan.version !== 1 || !Array.isArray(plan.copies) || plan.copies.length === 0) {
    throw new Error("expected preservation plan version 1 with nonempty copies");
  }
  if (!Array.isArray(plan.canonical_outputs) || plan.canonical_outputs.some((path) => typeof path !== "string") ||
      new Set(plan.canonical_outputs).size !== plan.canonical_outputs.length ||
      plan.canonical_outputs.length !== plan.copies.length ||
      plan.canonical_outputs.some((path) => !plan.copies.some((copy) => copy.output === path))) {
    throw new Error("copies must cover the approved canonical_outputs inventory exactly once");
  }
  const seen = new Set();
  for (const record of plan.copies) {
    const target = containedFile(repoRoot, record.output);
    if (seen.has(target)) throw new Error(`duplicate output ${record.output}`);
    seen.add(target);
    const source = readFileSync(containedFile(templateRoot, record.template), "utf8");
    const expected = fillCanonicalCopy(source, record);
    const actual = normalize(readFileSync(target, "utf8"));
    if (actual !== expected) {
      const wanted = expected.split("\n");
      const got = actual.split("\n");
      let line = 0;
      while (line < wanted.length && line < got.length && wanted[line] === got[line]) line++;
      throw new Error(`${record.output}: canonical preservation failed at line ${line + 1}`);
    }
  }
  return plan.copies.length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [templateRoot, repoRoot, planPath, ...extra] = process.argv.slice(2);
    if (!templateRoot || !repoRoot || !planPath || extra.length) {
      throw new Error("usage: node verify-canonical-copies.mjs <template-root> <repo-root> <plan.json>");
    }
    const count = verifyCanonicalCopies(templateRoot, repoRoot, JSON.parse(readFileSync(planPath, "utf8")));
    console.log(`Canonical preservation passed (${count} copies). Native runtime compatibility requires separate verification.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
