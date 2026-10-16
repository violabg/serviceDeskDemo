// Bootstrap 10.0.0 upgrade (approved 2026-10-16): Claude Code moves to the skill route.
// Refreshes the changed source snapshots, updates the preservation recipe (AGENTS.md template
// hash and AGENT_ROSTER, planning-skill ROLE_ACTIVATION), and re-renders those three canonical
// copies through the shipped fillCanonicalCopy. Run from the repository root:
//   node .agentic-system-maintenance/scripts/render-10.0.mjs
import { createHash } from "node:crypto";
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { fillCanonicalCopy } from "./verify-canonical-copies.mjs";

const INSTALLED = ".agents/skills/bootstrap-agentic-system/";
const SOURCES = ".agentic-system-maintenance/sources/";
const PLAN = ".agentic-system-maintenance/preservation-plan.json";

// Snapshot files whose installed source changed between 9.4.0 and 10.0.0.
const CHANGED_SOURCES = [
  "contracts/platform-compatibility.md",
  "contracts/context-boundaries.md",
  "registry/capabilities.yaml",
  "registry/placeholders.yaml",
  "templates/bootstrap-file-plan.md",
  "templates/instructions/AGENTS.md",
];
for (const path of CHANGED_SOURCES) copyFileSync(INSTALLED + path, SOURCES + path);

const normalize = (text) => text.replace(/\r\n?/g, "\n");
const sha = (path) => createHash("sha256").update(normalize(readFileSync(path, "utf8"))).digest("hex");

const OLD_ROSTER_SENTENCE =
  "Native registrations may carry a client suffix (Claude Code: `<role>-claude`); the selected binding names them.";
const NEW_ROSTER_SENTENCE =
  "Copilot selects each role natively in its Agent dropdown. Claude Code has no role agents: Planner starts only " +
  "through the `plan-bug-from-id` and `plan-user-story-from-id` skills, and every other role through its user-invoked " +
  "`demo-<role>-claude` role skill. The selected binding names each start step.";

const ROLE_ACTIVATION =
  "The active environment binding (`docs/agents/bindings/<environment>.md`, for the environment the root router " +
  "resolved) names this environment's role route. On a native route, run it only when this conversation is already " +
  "working as the Planner role (`demo-planner`); otherwise stop and tell the user the binding's exact Planner start " +
  "step. On the skill route, this skill is the Planner's entrypoint: if this conversation already runs any role, load " +
  "nothing, stop, and tell the user to open a new conversation; otherwise first read the binding and the complete " +
  "Planner contract `docs/agents/canonical/<environment>/agents/demo-planner.agent.md`, follow them as this " +
  "conversation's role, then continue with this skill. The binding records whether the Planner tool limits are " +
  "runtime-enforced or instruction-only.";

const plan = JSON.parse(readFileSync(PLAN, "utf8"));
const touched = [];
for (const copy of plan.copies) {
  if (copy.output === "AGENTS.md") {
    if (!copy.values.AGENT_ROSTER.includes(OLD_ROSTER_SENTENCE)) throw new Error("AGENT_ROSTER sentence not found");
    copy.values.AGENT_ROSTER = copy.values.AGENT_ROSTER.replace(OLD_ROSTER_SENTENCE, NEW_ROSTER_SENTENCE);
    copy.sha256 = sha(SOURCES + copy.template);
    touched.push(copy);
  } else if (/plan-(bug|user-story)-from-id/.test(copy.output)) {
    copy.values.ROLE_ACTIVATION = ROLE_ACTIVATION;
    touched.push(copy);
  }
}
if (touched.length !== 3) throw new Error(`expected 3 recipe entries, found ${touched.length}`);
for (const copy of touched) {
  writeFileSync(copy.output, fillCanonicalCopy(readFileSync(SOURCES + copy.template, "utf8"), copy));
}
writeFileSync(PLAN, JSON.stringify(plan, null, 2) + "\n");
console.log(`Refreshed ${CHANGED_SOURCES.length} snapshots; re-rendered ${touched.map((c) => c.output).join(", ")}`);
