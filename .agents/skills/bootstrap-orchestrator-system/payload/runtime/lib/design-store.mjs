// Persistence of the structured design (contracts/design-model.md). Every write goes through saveDesign,
// which records an integrity hash and re-renders the projections, so a reader never sees a stale view.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { designGrounding, resolveKnowledgeReference } from "./knowledge.mjs";
import { renderDocument } from "./render.mjs";
import { snapshot, verificationView } from "./projections.mjs";
import { RuntimeError, iso, readJson, sha256, writeJson, writeText } from "./util.mjs";

export const SCHEMA_VERSION = 2;

export function designDir(ctx, sessionId, designId) {
  return join(ctx.sessionsRoot, sessionId, "designs", designId);
}

export function designPaths(ctx, sessionId, designId) {
  const dir = designDir(ctx, sessionId, designId);
  return {
    dir,
    json: join(dir, "design.json"),
    integrity: join(dir, "design.integrity.json"),
    html: join(dir, "design.html"),
    snapshot: join(dir, "snapshot.md"),
    verification: join(dir, "verification-view.md"),
    iterations: join(dir, "iterations"),
  };
}

export function designExists(ctx, sessionId, designId) {
  return existsSync(designPaths(ctx, sessionId, designId).json);
}

export function emptyDesign(sessionId, designId, jobId, now) {
  return {
    schemaVersion: SCHEMA_VERSION,
    sessionId,
    designId,
    status: "Draft",
    approvedAt: null,
    planName: null,
    planDescription: null,
    modifiedAfterApproval: false,
    originJobId: jobId,
    createdAt: now,
    updatedAt: now,
    counters: { obligation: 0, openPoint: 0, contract: 0, api: 0, pathFile: 0, operation: 0, decision: 0, fileReference: 0, iteration: 0 },
    obligations: [],
    openPoints: [],
    fileReferences: [],
    knowledgeReferences: [],
    overview: { currentState: "", gaps: "" },
    decisions: [],
    path: { title: null, generator: null, requirementRef: null, contracts: [], apis: [], filesystem: { files: [] }, operations: [] },
    iterations: [],
    servedOperation: null,
    history: [],
  };
}

export function createDesign(ctx, sessionId, designId, jobId) {
  const design = emptyDesign(sessionId, designId, jobId, iso(ctx.now()));
  design.history.push({ at: design.createdAt, action: "created", summary: `design created for job ${jobId}` });
  saveDesign(ctx, design);
  return design;
}

// Loads a design and refuses when design.json changed outside the runtime (an out-of-band edit would
// bypass ID assignment, validation and the gates). `acceptExternalEdit` re-seals the current file.
export function loadDesign(ctx, sessionId, designId, { acceptExternalEdit = false } = {}) {
  const paths = designPaths(ctx, sessionId, designId);
  if (!existsSync(paths.json)) throw new RuntimeError(`design '${designId}' does not exist in session '${sessionId}'.`);
  const text = readFileSync(paths.json, "utf8");
  const seal = readJson(paths.integrity, null);
  if (seal && seal.sha256 !== sha256(text) && !acceptExternalEdit) {
    throw new RuntimeError("design-out-of-band-edit", {
      status: "Rejected",
      errors: [
        {
          rule: "design-out-of-band-edit",
          element: designId,
          detail:
            "design.json was modified outside the runtime, so its IDs, validation and gates cannot be trusted. Revert the manual edit, or re-run design-checks with --acceptExternalEdit true after reviewing it.",
        },
      ],
    });
  }
  return withDefaults(JSON.parse(text));
}

// A design stored before knowledge references and the served operation existed reads as having none.
function withDefaults(design) {
  design.knowledgeReferences ??= [];
  design.servedOperation ??= null;
  return design;
}

export function saveDesign(ctx, design) {
  const paths = designPaths(ctx, design.sessionId, design.designId);
  const text = `${JSON.stringify(design, null, 2)}\n`;
  writeText(paths.json, text);
  writeJson(paths.integrity, { sha256: sha256(text), sealedAt: iso(ctx.now()) });
  writeText(paths.snapshot, snapshot(design));
  writeText(paths.verification, verificationView(design, designGrounding(ctx, design)));
  const template = readFileSync(join(ctx.assetsRoot, "design-review.html"), "utf8");
  const knowledge = design.knowledgeReferences.map((ref) => ({ kid: ref.kid, ...resolveKnowledgeReference(ctx, ref) }));
  writeText(paths.html, renderDocument(template, design, { knowledge }));
  return paths;
}

// Implementation progress — flags, the served operation, iterations — is recorded in the history but is not a
// change of the design, so it never marks an approved design as modified.
const PROGRESS_ACTIONS = new Set(["status", "served", "operation-closed", "iteration-open", "iteration-close"]);

// Records a content change: bumps updatedAt, appends history and marks an approved design as modified.
export function touch(ctx, design, action, summary) {
  const at = iso(ctx.now());
  design.updatedAt = at;
  if (design.status === "Approved" && action !== "approved" && !PROGRESS_ACTIONS.has(action)) design.modifiedAfterApproval = true;
  design.history.push({ at, action, summary });
}
