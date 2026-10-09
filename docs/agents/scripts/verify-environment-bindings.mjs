// Static audit against a separately approved, discovery-derived runtime inventory.
// This does not discover tools or certify that a client can execute them.
import { readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const strings = (values) => Array.isArray(values) && values.every((v) => typeof v === "string" && v.trim()) && new Set(values).size === values.length;
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function contained(root, path) {
  if (typeof path !== "string" || !path || isAbsolute(path)) throw new Error("expected relative runtime path");
  const base = realpathSync(root);
  const file = realpathSync(resolve(base, path));
  const rel = relative(base, file);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error("runtime file escapes repository");
  return file;
}
function inspectionText(raw, encoding) {
  if (encoding === "json") {
    const decoded = [];
    const visit = (value) => {
      if (typeof value === "string") decoded.push(value);
      else if (value && typeof value === "object") Object.values(value).forEach(visit);
    };
    visit(JSON.parse(raw));
    return [raw, ...decoded].join("\n");
  }
  if (encoding !== undefined && encoding !== "text") throw new Error("unsupported inspection encoding");
  // Also inspect JSON-compatible quoted bodies, as used by basic TOML strings.
  // Other native embeddings require a separately verified decoded audit file.
  const decoded = [...raw.matchAll(/"(?:[^"\\]|\\.)*"/g)].map((m) => {
    try { return JSON.parse(m[0]); } catch { return ""; }
  });
  return [raw, ...decoded].join("\n");
}

export function verifyEnvironmentBindings(repoRoot, plan) {
  if (plan.version !== 1 || !Array.isArray(plan.environments) || !plan.environments.length || !Array.isArray(plan.files) || !plan.files.length) {
    throw new Error("expected environment audit version 1 with environments and files");
  }
  const environments = new Map();
  const owners = new Map();
  for (const env of plan.environments) {
    if (typeof env.id !== "string" || !env.id.trim() || environments.has(env.id) || !strings(env.literals) || !Array.isArray(env.delegation)) {
      throw new Error("invalid environment binding inventory");
    }
    for (const binding of env.delegation) {
      if (!env.literals.includes(binding.tool) || !env.literals.includes(binding.selector) || !strings(binding.targets)) {
        throw new Error("delegation requires inventoried tool, selector and inspected targets");
      }
    }
    environments.set(env.id, env);
    for (const literal of env.literals) {
      if (!owners.has(literal)) owners.set(literal, new Set());
      owners.get(literal).add(env.id);
    }
  }
  if (!strings(plan.runtime_outputs) || plan.runtime_outputs.length !== plan.files.length ||
      new Set(plan.files.map((f) => f.output)).size !== plan.files.length ||
      plan.files.some((f) => !plan.runtime_outputs.includes(f.output))) {
    throw new Error("files must cover the approved runtime_outputs inventory exactly once");
  }
  const files = new Map(plan.files.map((f) => [f.output, f]));
  const physical = new Set();
  for (const file of plan.files) {
    if (!strings(file.environments) || !file.environments.length || file.environments.some((id) => !environments.has(id))) {
      throw new Error(`${file.output}: unknown environment or missing consumers`);
    }
    if (!Array.isArray(file.references ?? [])) throw new Error(`${file.output}: invalid references`);
    for (const reference of file.references ?? []) {
      const output = typeof reference === "string" ? reference : reference?.output;
      const consumers = typeof reference === "string" ? file.environments : reference?.environments;
      const resource = files.get(output);
      if (!strings(consumers) || !consumers.length || consumers.some((id) => !file.environments.includes(id)) ||
          !resource || !Array.isArray(resource.environments) || consumers.some((id) => !resource.environments.includes(id))) {
        throw new Error(`${file.output}: reference ownership mismatch for ${output}`);
      }
    }
    const path = contained(repoRoot, file.output);
    if (physical.has(path)) throw new Error("runtime inventory repeats the same physical file");
    physical.add(path);
    const text = inspectionText(readFileSync(path, "utf8"), file.encoding);
    for (const [literal, allowed] of owners) {
      if (text.includes(literal) && file.environments.some((id) => !allowed.has(id))) {
        throw new Error(`${file.output}: foreign binding ${literal}`);
      }
    }
    for (const id of file.environments) {
      for (const binding of environments.get(id).delegation) {
        const selectors = new RegExp(`(?<![A-Za-z0-9_])["']?${escape(binding.selector)}["']?\\s*(?:=|:)\\s*["']([^"']+)["']`, "g");
        for (const match of text.matchAll(selectors)) {
          if (!binding.targets.includes(match[1])) throw new Error(`${file.output}: unregistered delegate ${match[1]} in ${id}`);
        }
      }
    }
  }
  return plan.files.length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [repoRoot, planPath, ...extra] = process.argv.slice(2);
    if (!repoRoot || !planPath || extra.length) throw new Error("usage: node verify-environment-bindings.mjs <repo-root> <audit-plan.json>");
    const count = verifyEnvironmentBindings(repoRoot, JSON.parse(readFileSync(planPath, "utf8")));
    console.log(`Environment binding audit passed (${count} runtime files). Runtime discovery requires separate verification.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
