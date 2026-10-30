// Compares the rendered outputs with the target repository and its manifest, then applies an approved plan.
//
// Actions: create, update, unchanged, merge (a customizable file was edited by hand and the kit changed it),
// conflict (a non-customizable file was edited by hand, or an unmanaged file is in the way), delete (a file
// the previous install wrote and nothing renders any more). merge and conflict need --take or --keep.
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { render } from "./render.mjs";
import { InstallError, absolutePath, contains, mergeInto, readText, sha256, writeText } from "./util.mjs";

const markers = {
  html: ["<!-- agentic-system:start -->", "<!-- agentic-system:end -->"],
  hash: ["# agentic-system:start", "# agentic-system:end"],
};

function readBlock(text, syntax) {
  const [start, end] = markers[syntax];
  const from = text.indexOf(`${start}\n`);
  const to = text.indexOf(`${end}`, from);
  if (from === -1 || to === -1) return null;
  return { content: text.slice(from + start.length + 1, to), before: text.slice(0, from), after: text.slice(to + end.length) };
}

function writeBlock(text, syntax, content) {
  const [start, end] = markers[syntax];
  const block = `${start}\n${content}${end}`;
  const existing = text === null ? null : readBlock(text, syntax);
  if (existing) return `${existing.before}${block}${existing.after}`;
  if (text === null || text === "") return `${block}\n`;
  return `${text.endsWith("\n") ? text : `${text}\n`}\n${block}\n`;
}

function removeBlock(text, syntax) {
  const block = readBlock(text, syntax);
  return block ? `${block.before}${block.after.replace(/^\n/, "")}` : text;
}

export function manifestPath(repo, answers) {
  return join(repo, answers.locations.maintenanceRoot, "manifest.json");
}

export function loadManifest(repo, answers) {
  const path = manifestPath(repo, answers);
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : { version: 1, files: {} };
}

// The current state of one output in the target: the comparable content, or null when absent.
function current(repo, output) {
  const path = absolutePath(repo, output.path);
  if (!existsSync(path)) return { exists: false, value: null, text: null };
  const text = readText(path);
  if (output.mode === "block") return { exists: true, value: readBlock(text, output.syntax)?.content ?? null, text };
  if (output.mode === "json-merge") {
    try {
      return { exists: true, value: JSON.parse(text), text };
    } catch {
      return { exists: true, value: undefined, text, unparseable: true };
    }
  }
  return { exists: true, value: text, text };
}

export function plan(kit, answers, repo) {
  const { outputs, errors, warnings } = render(kit, answers);
  const manifest = loadManifest(repo, answers);
  const entries = [];
  for (const output of outputs) {
    const state = current(repo, output);
    const recorded = manifest.files[output.path];
    let action;
    let reason = "";
    if (output.mode === "json-merge") {
      const hash = sha256(JSON.stringify(output.add));
      output.sha256 = hash;
      if (state.unparseable) [action, reason] = ["conflict", "the settings file is not plain JSON; add the entries by hand"];
      else if (!state.exists) action = "create";
      else if (contains(state.value, output.add)) action = "unchanged";
      else {
        const conflicts = mergeInto(structuredClone(state.value), output.add);
        [action, reason] = conflicts.length ? ["conflict", `already set differently: ${conflicts.join(", ")}`] : ["update", ""];
      }
    } else {
      const hash = sha256(output.content);
      output.sha256 = hash;
      const onDisk = state.value === null ? null : sha256(state.value);
      if (output.mode === "block" && output.conflictsWith && state.text) {
        const outside = state.value === null ? state.text : state.text.replace(state.value, "");
        if (output.conflictsWith.test(outside)) {
          entries.push({ ...output, action: "conflict", reason: "the file already defines this table outside the managed block; merge it by hand" });
          continue;
        }
      }
      if (onDisk === null) action = state.exists && output.mode === "file" ? "conflict" : "create";
      else if (onDisk === hash) action = "unchanged";
      else if (recorded && onDisk === recorded.keptSha256 && hash === recorded.sha256) [action, reason] = ["unchanged", "local customization kept"];
      else if (recorded && onDisk === recorded.sha256) action = "update";
      else action = output.customizable ? "merge" : "conflict";
      if (action === "conflict" && !reason) reason = recorded ? "edited by hand since the last install" : "a file the agentic system did not write is already there";
      if (action === "merge") reason = "edited by hand; compare the baseline, the current file and the new render";
    }
    entries.push({ ...output, action, reason });
  }
  const rendered = new Set(outputs.map((o) => o.path));
  for (const [path, recorded] of Object.entries(manifest.files)) {
    if (rendered.has(path) || recorded.mode === "json-merge") continue;
    const state = current(repo, { path, mode: recorded.mode, syntax: recorded.syntax });
    if (state.value === null) continue;
    const untouched = sha256(state.value) === recorded.sha256;
    entries.push({ path, mode: recorded.mode, syntax: recorded.syntax, kind: recorded.kind, envs: recorded.envs ?? [], action: untouched ? "delete" : "conflict", reason: untouched ? "no longer installed" : "no longer installed, but edited by hand" });
  }
  entries.sort((a, b) => a.path.localeCompare(b.path));
  return { entries, errors, warnings, manifest };
}

export function apply(kit, answers, repo, { take = [], keep = [] } = {}) {
  const result = plan(kit, answers, repo);
  if (result.errors.length) throw new InstallError(`the render has errors:\n${result.errors.join("\n")}`);
  const unknown = [...take, ...keep].filter((path) => !result.entries.some((e) => e.path === path));
  if (unknown.length) throw new InstallError(`--take/--keep name paths that are not in the plan: ${unknown.join(", ")}`);
  const open = result.entries.filter((e) => ["merge", "conflict"].includes(e.action) && !take.includes(e.path) && !keep.includes(e.path));
  if (open.length) throw new InstallError(`unresolved entries (decide each with --take <path> or --keep <path>):\n${open.map((e) => `  ${e.action} ${e.path}: ${e.reason}`).join("\n")}`);

  const files = {};
  const baselineRoot = join(repo, answers.locations.maintenanceRoot, "baseline");
  for (const entry of result.entries) {
    const target = absolutePath(repo, entry.path);
    const kept = keep.includes(entry.path);
    if (entry.action === "delete" || (entry.action === "conflict" && entry.sha256 === undefined)) {
      if (!kept) {
        if (entry.mode === "block") writeText(target, removeBlock(readText(target), entry.syntax));
        else rmSync(target);
      }
      continue;
    }
    const write = ["create", "update"].includes(entry.action) || (take.includes(entry.path) && !kept);
    if (write) {
      if (entry.mode === "json-merge") {
        const value = existsSync(target) ? JSON.parse(readFileSync(target, "utf8")) : {};
        mergeInto(value, entry.add);
        writeText(target, `${JSON.stringify(value, null, 2)}\n`);
      } else if (entry.mode === "block") writeText(target, writeBlock(existsSync(target) ? readText(target) : null, entry.syntax, entry.content));
      else writeText(target, entry.content);
    }
    const record = { sha256: entry.sha256, kind: entry.kind, mode: entry.mode, envs: entry.envs, customizable: entry.customizable };
    if (entry.mode === "block") record.syntax = entry.syntax;
    if (entry.mode === "json-merge") record.add = entry.add;
    if (kept) {
      const state = current(repo, entry);
      record.keptSha256 = state.value === null ? null : sha256(state.value);
    } else if (entry.action === "unchanged" && result.manifest.files[entry.path]?.keptSha256) {
      record.keptSha256 = result.manifest.files[entry.path].keptSha256;
    }
    if (entry.customizable && entry.scope === "repo") writeText(join(baselineRoot, entry.path), entry.content);
    files[entry.path] = record;
  }
  const manifest = { version: 1, kit: { skill: "bootstrap-orchestrator-system", version: kit.version }, appliedOn: new Date().toISOString().slice(0, 10), answersSha256: sha256(JSON.stringify(answers.raw)), files };
  writeText(manifestPath(repo, answers), `${JSON.stringify(manifest, null, 2)}\n`);
  return { ...result, manifest };
}

// Drift and unfilled slots in the installed tree. An empty list means the target matches the answers.
export function check(kit, answers, repo) {
  const result = plan(kit, answers, repo);
  const problems = [...result.errors];
  for (const entry of result.entries) if (entry.action !== "unchanged") problems.push(`${entry.action} ${entry.path}${entry.reason ? `: ${entry.reason}` : ""}`);
  // Only declared slots count: workflow text also carries design placeholders such as {{O1}}.
  const slots = new Set(Object.keys(kit.index.slots));
  for (const entry of result.entries) {
    if (entry.kind === "runtime" || entry.content === undefined) continue;
    for (const match of entry.content.matchAll(/\{\{([A-Z][A-Z0-9_]*)\}\}/g)) if (slots.has(match[1])) problems.push(`${entry.path}: unfilled slot {{${match[1]}}}`);
  }
  return { ...result, problems };
}
