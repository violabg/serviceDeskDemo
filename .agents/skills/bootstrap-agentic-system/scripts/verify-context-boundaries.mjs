// Static boundaries from an approved inventory; native loading/search need separate checks.
import { readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const strings = (values) => Array.isArray(values) && values.every((v) => typeof v === "string" && v.trim()) && new Set(values).size === values.length;
const within = (root, path) => { const rel = relative(root, path); return rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel); };
function repoPath(path) {
  if (typeof path !== "string" || !path || isAbsolute(path) || path.includes("\\") || path.split("/").some((p) => !p || p === "." || p === "..")) {
    throw new Error(`expected normalized repository-relative path: ${path}`);
  }
  return path;
}
function entryPaths(index) {
  const section = index.match(/^## Knowledge Entries\s*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m)?.[1];
  if (section === undefined) throw new Error("knowledge index requires Knowledge Entries section");
  const paths = [];
  for (const line of section.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    const cell = line.split("|")[2]?.trim();
    if (!cell || cell === "Path" || /^:?-+:?$/.test(cell)) continue;
    const link = cell.match(/^\[[^\]]*\]\(([^)]+)\)$/);
    const path = link ? decodeURIComponent(link[1].split("#")[0]) : cell.replace(/^`(.*)`$/, "$1");
    paths.push(repoPath(path));
  }
  if (new Set(paths).size !== paths.length) throw new Error("knowledge index repeats a path");
  return paths;
}

export function verifyContextBoundaries(repoRoot, plan) {
  if (plan.version !== 1 || plan.knowledge_root !== "knowledge" || !strings(plan.outputs) || !plan.outputs.length || !Array.isArray(plan.files) ||
      !strings(plan.excluded_roots) || !strings(plan.knowledge_entries)) throw new Error("expected context audit version 1 with complete inventories");
  const base = realpathSync(repoRoot);
  const physical = (path) => {
    const file = realpathSync(resolve(base, repoPath(path)));
    if (!within(base, file)) throw new Error(`${path}: path escapes repository`);
    return file;
  };
  repoPath(plan.maintenance_root);
  if (plan.maintenance_root.includes("/") || plan.maintenance_root === "knowledge" || !plan.excluded_roots.includes(plan.maintenance_root)) {
    throw new Error("maintenance root must be a separate top-level excluded directory");
  }
  const knowledge = physical("knowledge");
  const excluded = plan.excluded_roots.map(physical);
  for (const root of [knowledge, ...excluded]) if (!statSync(root).isDirectory()) throw new Error("context roots must be directories");
  if (excluded.some((root) => within(root, knowledge) || within(knowledge, root))) throw new Error("knowledge and maintenance roots overlap physically");
  const isExcluded = (path) => excluded.some((root) => within(root, path));
  const records = new Map(plan.files.map((file) => [repoPath(file.output), file]));
  if (records.size !== plan.files.length || records.size !== plan.outputs.length || plan.outputs.some((path) => !records.has(repoPath(path)))) {
    throw new Error("files must cover the approved outputs inventory exactly once");
  }
  const indexFile = records.get(plan.knowledge_index);
  if (indexFile?.kind !== "knowledge" || !plan.knowledge_index.startsWith("knowledge/")) throw new Error("knowledge index must be a knowledge output under knowledge/");
  const maintenanceEntrypoints = new Set(plan.files.filter((file) => file.kind === "maintenance-entrypoint").map((file) => physical(file.output)));
  const seen = new Set();
  for (const file of plan.files) {
    const path = physical(file.output);
    if (!statSync(path).isFile() || seen.has(path)) throw new Error("context inventory requires unique physical files");
    seen.add(path);
    if (!["runtime", "knowledge", "maintenance", "maintenance-entrypoint"].includes(file.kind) || !Array.isArray(file.references)) throw new Error(`${file.output}: invalid kind or references`);
    if (file.kind === "maintenance" && !isExcluded(path)) throw new Error(`${file.output}: maintenance material outside excluded roots`);
    if (file.kind !== "maintenance" && isExcluded(path)) throw new Error(`${file.output}: ordinary output in maintenance area`);
    if (file.kind === "knowledge" && (!file.output.startsWith("knowledge/") || !within(knowledge, path))) throw new Error(`${file.output}: generated knowledge outside knowledge/`);
    if (within(knowledge, path) && file.kind !== "knowledge") throw new Error(`${file.output}: non-knowledge material in knowledge/`);
    for (const reference of file.references) {
      if (!["ordinary", "maintenance"].includes(reference?.when)) throw new Error(`${file.output}: reference needs an explicit context`);
      const target = records.get(reference.output);
      if (!target && !plan.knowledge_entries.includes(reference.output)) throw new Error(`${file.output}: reference omitted from inventory`);
      const targetPath = physical(reference.output);
      const maintenanceTarget = isExcluded(targetPath) || maintenanceEntrypoints.has(targetPath);
      if (file.kind === "knowledge" && (maintenanceTarget || reference.when === "maintenance")) throw new Error(`${file.output}: knowledge references maintenance`);
      if (file.kind === "maintenance") continue;
      if (reference.when === "ordinary" && maintenanceTarget) throw new Error(`${file.output}: ordinary reference loads maintenance`);
      if (reference.when === "maintenance" && !(file.maintenance_router === true && ["runtime", "maintenance-entrypoint"].includes(file.kind))) {
        throw new Error(`${file.output}: maintenance reference requires explicit routing`);
      }
      if (file.kind === "maintenance-entrypoint" && reference.when !== "maintenance") throw new Error(`${file.output}: maintenance entrypoint has an eager reference`);
    }
  }
  // The native audit must additionally prove maintenance entrypoints are never eagerly loaded.
  const actualEntries = entryPaths(readFileSync(physical(plan.knowledge_index), "utf8"));
  if (actualEntries.length !== plan.knowledge_entries.length || actualEntries.some((path) => !plan.knowledge_entries.includes(path))) throw new Error("knowledge_entries must match the actual index paths");
  for (const entry of actualEntries) {
    const path = physical(entry);
    if (!statSync(path).isFile() || isExcluded(path) || maintenanceEntrypoints.has(path)) throw new Error(`${entry}: knowledge index loads maintenance or a non-file`);
  }
  // Reject ordinary aliases into excluded roots, even outside Knowledge Entries.
  for (const file of plan.files.filter((f) => f.kind === "knowledge")) {
    const text = readFileSync(physical(file.output), "utf8");
    for (const link of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = decodeURIComponent(link[1].split("#")[0]);
      if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
      // Path cells use repository-relative paths; other links use normal document-relative URLs.
      const candidate = actualEntries.includes(target) ? resolve(base, target) : resolve(physical(file.output), "..", target);
      if (!within(base, candidate)) throw new Error(`${file.output}: knowledge link escapes repository`);
      const targetPath = realpathSync(candidate);
      if (!within(base, targetPath) || isExcluded(targetPath) || maintenanceEntrypoints.has(targetPath)) throw new Error(`${file.output}: knowledge link loads maintenance or escapes repository`);
    }
  }
  return plan.files.length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [repoRoot, planPath, ...extra] = process.argv.slice(2);
    if (!repoRoot || !planPath || extra.length) throw new Error("usage: node verify-context-boundaries.mjs <repo-root> <context-audit.json>");
    const count = verifyContextBoundaries(repoRoot, JSON.parse(readFileSync(planPath, "utf8")));
    console.log(`Context boundary audit passed (${count} files). Native loading and search exclusions require separate verification.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
