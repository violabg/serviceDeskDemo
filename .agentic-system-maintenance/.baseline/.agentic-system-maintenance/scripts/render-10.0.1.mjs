// Bootstrap 10.0.1 upgrade (approved 2026-10-16): Planner session persistence and planning-skill intake order.
// Refreshes the changed source snapshots, updates the preservation recipe (template hashes for the Planner,
// AGENTS.md and both planning skills; planning-skill ROLE_ACTIVATION and WORK_ITEM_GATHERING), re-renders those
// five canonical copies through the shipped fillCanonicalCopy, and re-embeds the Copilot native Planner body.
// Run from the repository root:
//   node .agentic-system-maintenance/scripts/render-10.0.1.mjs
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { fillCanonicalCopy } from "./verify-canonical-copies.mjs";

const INSTALLED = ".agents/skills/bootstrap-agentic-system/";
const SOURCES = ".agentic-system-maintenance/sources/";
const PLAN = ".agentic-system-maintenance/preservation-plan.json";
const ADAPTERS = ".agentic-system-maintenance/native-adapters.json";

// Snapshot files whose installed source changed between 10.0.0 and 10.0.1 (contracts/generation.md has no snapshot).
const CHANGED_SOURCES = [
  "contracts/platform-compatibility.md",
  "registry/placeholders.yaml",
  "templates/agents/planner.agent.md",
  "templates/artifact-gates.md",
  "templates/instructions/AGENTS.md",
  "templates/skills/plan-bug-from-id/SKILL.md",
  "templates/skills/plan-user-story-from-id/SKILL.md",
];
for (const path of CHANGED_SOURCES) {
  if (!existsSync(SOURCES + path)) throw new Error(`no snapshot for ${path}`);
  copyFileSync(INSTALLED + path, SOURCES + path);
}

const normalize = (text) => text.replace(/\r\n?/g, "\n");
const sha = (text) => createHash("sha256").update(normalize(text)).digest("hex");

// C034 retired: 10.0.1 ships the evidence-task hand-back and session capabilities in the templates, so the
// slot keeps the C029 route dispatch and takes the 10.0.1 governance statement.
const OLD_TAIL =
  " The binding records whether the Planner tool limits are runtime-enforced or instruction-only. From then on,";
const NEW_TAIL =
  " From then on, the Planner contract governs gate order, stop points, and session persistence over this skill's " +
  "intake and over the client's built-in defaults: this skill supplies only its intake and the stops it names, and a " +
  "client default, such as its own memory feature, never replaces a contract operation. The binding records whether " +
  "the Planner tool limits are runtime-enforced or instruction-only.";
const GATHERING_ADDITION =
  " When the task runs inline, its hand-back is an internal step, so read the artifact and continue in the same turn " +
  "instead of stopping there.";

const RERENDERED = new Set([
  "templates/agents/planner.agent.md",
  "templates/instructions/AGENTS.md",
  "templates/skills/plan-bug-from-id/SKILL.md",
  "templates/skills/plan-user-story-from-id/SKILL.md",
]);

const plan = JSON.parse(readFileSync(PLAN, "utf8"));
const bodies = {};
const touched = [];
for (const copy of plan.copies) {
  if (!RERENDERED.has(copy.template)) continue;
  const source = readFileSync(SOURCES + copy.template, "utf8");
  copy.sha256 = sha(source);
  if (/plan-(bug|user-story)-from-id/.test(copy.output)) {
    const value = copy.values.ROLE_ACTIVATION;
    const at = value.indexOf(OLD_TAIL);
    if (at < 0) throw new Error(`ROLE_ACTIVATION anchor not found in ${copy.output}`);
    copy.values.ROLE_ACTIVATION = value.slice(0, at) + NEW_TAIL;
    if (copy.values.WORK_ITEM_GATHERING.endsWith(GATHERING_ADDITION)) throw new Error("WORK_ITEM_GATHERING already updated");
    copy.values.WORK_ITEM_GATHERING += GATHERING_ADDITION;
  }
  const rendered = fillCanonicalCopy(source, copy);
  writeFileSync(copy.output, rendered);
  touched.push(copy.output);
  if (rendered.startsWith("---\n")) {
    const rest = rendered.slice(4);
    bodies[copy.output] = rest.slice(rest.indexOf("\n---\n") + 5);
  }
}
if (touched.length !== 5) throw new Error(`expected 5 recipe entries, found ${touched.length}`);

const adapters = JSON.parse(readFileSync(ADAPTERS, "utf8"));
for (const adapter of adapters) {
  const body = bodies[adapter.canonical_copy];
  if (body === undefined) continue;
  const current = readFileSync(adapter.path, "utf8");
  const head = current.slice(0, 4 + current.slice(4).indexOf("\n---\n") + 5);
  writeFileSync(adapter.path, head + body);
  adapter.body_sha256 = sha(body);
  touched.push(adapter.path);
}

writeFileSync(PLAN, JSON.stringify(plan, null, 2) + "\n");
writeFileSync(ADAPTERS, JSON.stringify(adapters, null, 2) + "\n");
console.log(`Refreshed ${CHANGED_SOURCES.length} snapshots; re-rendered ${touched.join(", ")}`);
