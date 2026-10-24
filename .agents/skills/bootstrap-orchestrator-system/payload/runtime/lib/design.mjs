// Design operations (contracts/design-model.md): row writes with server-assigned immutable ids, the single
// design submission, approval, operation status and implementation iterations.
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, readdirSync, readlinkSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { crowdedPlaceholders, overviewFindings, runChecks } from "./checks.mjs";
import { designPaths, loadDesign, saveDesign, touch } from "./design-store.mjs";
import { snapshot, verificationView } from "./projections.mjs";
import { validate } from "./schema.mjs";
import { RuntimeError, arg, iso, readJson, sha256, writeJson } from "./util.mjs";
import { loadJob } from "./workflow.mjs";

let cachedSchema = null;
function schema(ctx) {
  cachedSchema ??= JSON.parse(readFileSync(join(ctx.assetsRoot, "design-requests.schema.json"), "utf8"));
  return cachedSchema;
}

function check(ctx, defName, value, tool) {
  const root = schema(ctx);
  const errors = validate(defName ? root.$defs[defName] : root, value, root);
  if (errors.length) {
    throw new RuntimeError(`${tool} rejected`, {
      status: "Rejected",
      errors: errors.map((detail) => ({ rule: "invalid-request", element: tool, detail })),
      applied: "nothing was applied",
    });
  }
}

// Resolves the design of a job. FAST_IMPLEMENTATION and DOCUMENTATION jobs have none.
function jobDesign(ctx, args, tool, options) {
  const job = loadJob(ctx, args, tool);
  if (!job.designId) {
    throw new RuntimeError(`${tool} failed: job '${job.jobId}' runs ${job.workflowType}, which has no design artifact; no design operation is allowed in this workflow.`);
  }
  return { job, design: loadDesign(ctx, job.sessionId, job.designId, options) };
}

function documentPath(ctx, design) {
  return designPaths(ctx, design.sessionId, design.designId).html;
}

// --- row tools --------------------------------------------------------------------------------------

const ROW_TABLES = {
  "design-obligations": { def: "obligation", collection: "obligations", counter: "obligation", prefix: "O" },
  "design-open-points": { def: "openPoint", collection: "openPoints", counter: "openPoint", prefix: "OP" },
  "design-file-references": { def: "fileReference", collection: "fileReferences", counter: "fileReference", prefix: "FR" },
  "design-decisions": { def: "decision", collection: "decisions", counter: "decision", prefix: "D" },
};

function applyElements(target, elements, tool) {
  target.elements ??= [];
  target.elementCounter ??= target.elements.reduce((max, e) => Math.max(max, e.id), 0);
  for (const element of elements) {
    if (element.id !== undefined) {
      const index = target.elements.findIndex((e) => e.id === element.id);
      if (index === -1) throw new RuntimeError(`${tool} rejected: ${target.id} has no element ${element.id}`);
      if (element.removed) target.elements.splice(index, 1);
      else Object.assign(target.elements[index], { ...element, id: element.id });
    } else if (!element.removed) {
      target.elementCounter += 1;
      target.elements.push({ id: target.elementCounter, kind: element.kind, text: element.text, sourceSpan: element.sourceSpan });
    }
  }
}

function applyOptions(decision, options) {
  decision.options ??= [];
  decision.optionCounter ??= decision.options.length;
  for (const option of options) {
    const existing = option.id ? decision.options.find((o) => o.id === option.id) : null;
    if (existing) Object.assign(existing, option);
    else {
      decision.optionCounter += 1;
      decision.options.push({ id: `${decision.id}.${decision.optionCounter}`, text: option.text, chosen: Boolean(option.chosen) });
    }
  }
  // Exactly one chosen option: the last option sent as chosen wins; the others become alternatives.
  const chosenSent = options.filter((o) => o.chosen).map((o) => o.id ?? decision.options.find((x) => x.text === o.text)?.id);
  if (chosenSent.length) {
    const winner = chosenSent[chosenSent.length - 1];
    for (const o of decision.options) o.chosen = o.id === winner;
  }
}

function mergeFileReference(row, incoming) {
  row.files = [...new Set([...(row.files ?? []), ...(incoming.files ?? []), ...(incoming.details ?? []).map((d) => d.path)])];
  const details = new Map((row.details ?? []).map((d) => [d.path, d]));
  for (const detail of incoming.details ?? []) details.set(detail.path, { ...details.get(detail.path), ...detail });
  row.details = [...details.values()];
}

export function rowTool(ctx, tool, args) {
  const table = ROW_TABLES[tool];
  const request = arg(args, "request");
  const { design } = jobDesign(ctx, args, tool);
  check(ctx, "rowRequest", request ?? {}, tool);
  const rows = request.rows ?? [];
  const ids = request.ids ?? [];
  const collection = design[table.collection];
  rows.forEach((row) => check(ctx, table.def, row, tool));

  switch (request.operation) {
    case "Read": {
      const selected = ids.length ? collection.filter((r) => ids.includes(r.id)) : collection;
      return JSON.stringify({ rows: selected }, null, 2);
    }
    case "Add": {
      const added = [];
      for (const row of rows) {
        if (row.id !== undefined) throw new RuntimeError(`${tool} rejected: an Add row carries no id; the runtime assigns ${table.prefix}# ids`);
        if (tool === "design-file-references") {
          const existing = collection.find((r) => r.symbol === row.symbol);
          if (existing) {
            mergeFileReference(existing, row);
            added.push(existing.id);
            continue;
          }
        }
        design.counters[table.counter] += 1;
        const id = `${table.prefix}${design.counters[table.counter]}`;
        const { elements, options, ...fields } = row;
        const record = { id, ...fields };
        if (tool === "design-obligations") {
          record.origin ??= "Requirement";
          applyElements(record, elements ?? [], tool);
        }
        if (tool === "design-decisions") {
          record.blocking = Boolean(record.blocking);
          record.highlight = Boolean(record.highlight);
          record.realizedIn ??= [];
          applyOptions(record, options ?? []);
        }
        if (tool === "design-file-references") {
          record.files = [];
          record.details = [];
          mergeFileReference(record, row);
        }
        collection.push(record);
        added.push(id);
      }
      touch(ctx, design, "added", `${tool}: ${added.join(", ")}`);
      saveDesign(ctx, design);
      return JSON.stringify({ added });
    }
    case "Update": {
      const updated = [];
      for (const row of rows) {
        const record = collection.find((r) => r.id === row.id);
        if (!record) throw new RuntimeError(`${tool} rejected: ${row.id ?? "(no id)"} does not exist`);
        const { id, elements, options, ...fields } = row;
        if (tool === "design-file-references") mergeFileReference(record, row);
        else Object.assign(record, fields);
        if (elements) applyElements(record, elements, tool);
        if (options) applyOptions(record, options);
        updated.push(id);
      }
      touch(ctx, design, "updated", `${tool}: ${updated.join(", ")}`);
      saveDesign(ctx, design);
      return JSON.stringify({ updated });
    }
    case "Delete": {
      if (!ids.length) throw new RuntimeError(`${tool} rejected: Delete needs the ids to remove`);
      const missing = ids.filter((id) => !collection.some((r) => r.id === id));
      if (missing.length) throw new RuntimeError(`${tool} rejected: ${missing.join(", ")} do not exist`);
      design[table.collection] = collection.filter((r) => !ids.includes(r.id));
      touch(ctx, design, "deleted", `${tool}: ${ids.join(", ")}`);
      saveDesign(ctx, design);
      return JSON.stringify({ deleted: ids });
    }
  }
}

// --- overview ---------------------------------------------------------------------------------------

export function overview(ctx, args) {
  const tool = "design-overview";
  const request = arg(args, "request") ?? {};
  const { design } = jobDesign(ctx, args, tool);
  check(ctx, "overview", request, tool);
  if (request.operation === "Read") return JSON.stringify(design.overview, null, 2);
  const gaps = request.gaps ?? design.overview.gaps;
  const errors = request.gaps !== undefined ? overviewFindings(design, gaps) : [];
  if (request.gaps !== undefined && design.obligations.length === 0) {
    for (const ref of crowdedPlaceholders(gaps)) errors.push({ rule: "overview-gap-placeholders-crowded", element: "gaps", detail: `{{${ref}}} is too close to the next placeholder` });
  }
  if (errors.length) return { output: JSON.stringify({ status: "Rejected", errors }, null, 2), exitCode: 1 };
  if (request.currentState !== undefined) design.overview.currentState = request.currentState;
  if (request.gaps !== undefined) design.overview.gaps = request.gaps;
  touch(ctx, design, "updated", "design-overview");
  saveDesign(ctx, design);
  return JSON.stringify({ status: design.status, document: documentPath(ctx, design), currentState: Boolean(design.overview.currentState), gaps: Boolean(design.overview.gaps) });
}

// --- design submit ----------------------------------------------------------------------------------

const SUBMIT_TABLES = {
  contracts: { prefix: "CT", counter: "contract", get: (d) => d.path.contracts, set: (d, v) => (d.path.contracts = v) },
  apis: { prefix: "API", counter: "api", get: (d) => d.path.apis, set: (d, v) => (d.path.apis = v) },
  files: { prefix: "FS", counter: "pathFile", get: (d) => d.path.filesystem.files, set: (d, v) => (d.path.filesystem.files = v) },
  operations: { prefix: "IM", counter: "operation", get: (d) => d.path.operations, set: (d, v) => (d.path.operations = v) },
};

// Converts cardinal references to the persisted prefixed form.
function persistRow(table, row) {
  const { id, ...fields } = row;
  const record = { ...fields };
  if (table === "operations") {
    if (fields.dependsOn) record.dependsOn = fields.dependsOn.map((n) => `IM${n}`);
    if (fields.refObligations) record.refObligations = fields.refObligations.map((n) => `O${n}`);
    if (fields.refElements) record.refElements = fields.refElements.map((r) => `O${r.obligation}.${r.element}`);
  }
  return record;
}

export function submit(ctx, args) {
  const tool = "design-submit";
  const request = arg(args, "request");
  if (!request || typeof request !== "object" || Object.keys(request).length === 0) {
    throw new RuntimeError(`${tool} rejected: an empty request is never acceptable; send sessionId, jobId and request.`);
  }
  const { design } = jobDesign(ctx, args, tool);
  // Validate the envelope; row-level problems are reported per row as `rejected`, not as a failed call.
  const root = schema(ctx);
  const envelope = { header: request.header, intros: request.intros, delete: request.delete };
  check(ctx, null, { sessionId: arg(args, "sessionId"), jobId: arg(args, "jobId"), request: Object.fromEntries(Object.entries(envelope).filter(([, v]) => v !== undefined)) }, tool);
  for (const key of Object.keys(request)) {
    if (!["header", "intros", "add", "patch", "delete"].includes(key)) {
      throw new RuntimeError(`${tool} rejected`, { status: "Rejected", errors: [{ rule: "invalid-request", element: tool, detail: `/request/${key}: the JSON property '${key}' could not be mapped` }] });
    }
  }
  const applied = { added: [], patched: [], deleted: [] };
  const rejected = [];

  if (request.header) {
    for (const [key, value] of Object.entries(request.header)) if (value) design.path[key] = value;
  }
  if (request.intros?.filesystem) design.path.filesystem.intro = request.intros.filesystem;
  if (request.intros?.operations) design.path.operationsIntro = request.intros.operations;

  for (const [table, rows] of Object.entries(request.delete ?? {})) {
    const spec = SUBMIT_TABLES[table];
    for (const n of rows) {
      const id = `${spec.prefix}${n}`;
      const current = spec.get(design);
      if (!current.some((r) => r.id === id)) rejected.push({ path: `delete.${table}`, id, reason: "does not exist" });
      else {
        spec.set(design, current.filter((r) => r.id !== id));
        applied.deleted.push(id);
      }
    }
  }
  for (const mode of ["add", "patch"]) {
    const block = request[mode];
    if (!block) continue;
    if (typeof block !== "object" || Array.isArray(block)) {
      rejected.push({ path: mode, id: null, reason: "must be an object of tables" });
      continue;
    }
    for (const [table, rows] of Object.entries(block)) {
      const spec = SUBMIT_TABLES[table];
      if (!spec) {
        rejected.push({ path: `${mode}.${table}`, id: null, reason: `the JSON property '${table}' could not be mapped` });
        continue;
      }
      (rows ?? []).forEach((row, index) => {
        const errors = validate(root.$defs.submitRows.properties[table].items, row, root, `${mode}.${table}[${index}]`);
        const id = Number.isInteger(row?.id) ? `${spec.prefix}${row.id}` : null;
        if (errors.length) {
          rejected.push({ path: `${mode}.${table}[${index}]`, id, reason: errors.join("; ") });
          return;
        }
        const current = spec.get(design);
        const existing = current.find((r) => r.id === id);
        if (mode === "add") {
          if (existing) {
            rejected.push({ path: `${mode}.${table}[${index}]`, id, reason: "already exists" });
            return;
          }
          const record = { id, ...persistRow(table, row) };
          if (table === "operations") record.implementationStatus ??= null;
          current.push(record);
          design.counters[spec.counter] = Math.max(design.counters[spec.counter], row.id);
          applied.added.push(id);
        } else {
          if (!existing) {
            rejected.push({ path: `${mode}.${table}[${index}]`, id, reason: "does not exist" });
            return;
          }
          Object.assign(existing, persistRow(table, row));
          applied.patched.push(id);
        }
      });
    }
  }
  const changed = applied.added.length + applied.patched.length + applied.deleted.length > 0 || request.header || request.intros;
  if (changed) {
    touch(ctx, design, "submitted", `design-submit: +${applied.added.join(",") || "-"} ~${applied.patched.join(",") || "-"} x${applied.deleted.join(",") || "-"}`);
    saveDesign(ctx, design);
  }
  const findings = runChecks(design);
  return JSON.stringify(
    { applied, rejected, errors: findings.errors, warnings: findings.warnings, coverage: findings.coverage, status: design.status, document: documentPath(ctx, design) },
    null,
    2,
  );
}

// --- reads --------------------------------------------------------------------------------------------

export function schemaTool(ctx) {
  return JSON.stringify(schema(ctx), null, 2);
}

export function checksTool(ctx, args) {
  const accept = String(arg(args, "acceptExternalEdit") ?? "false") === "true";
  const { design } = jobDesign(ctx, args, "design-checks", { acceptExternalEdit: accept });
  if (accept) {
    const errors = validateDesignShape(design);
    if (errors.length) throw new RuntimeError("design-checks: the edited design.json is not a valid design", { status: "Rejected", errors });
    touch(ctx, design, "resealed", "external edit accepted after review");
    saveDesign(ctx, design);
  }
  return JSON.stringify(runChecks(design), null, 2);
}

function validateDesignShape(design) {
  const errors = [];
  for (const key of ["obligations", "openPoints", "fileReferences", "decisions", "iterations"]) {
    if (!Array.isArray(design[key])) errors.push({ rule: "invalid-design", element: key, detail: `${key} must be an array` });
  }
  if (!design.path || !Array.isArray(design.path.operations)) errors.push({ rule: "invalid-design", element: "path", detail: "path.operations must be an array" });
  return errors;
}

export function snapshotTool(ctx, args) {
  const job = loadJob(ctx, args, "design-snapshot");
  if (!job.designId) {
    return `# Design snapshot\nThis job runs ${job.workflowType}, which has no design artifact. There is nothing to project.\n`;
  }
  return snapshot(loadDesign(ctx, job.sessionId, job.designId));
}

export function verificationViewTool(ctx, args) {
  const { design } = jobDesign(ctx, args, "design-verification-view");
  return verificationView(design);
}

export function documentTool(ctx, args) {
  const { design } = jobDesign(ctx, args, "design-document");
  const paths = saveDesign(ctx, design);
  const status = design.status === "Approved" && design.modifiedAfterApproval ? "Approved, modified after approval" : design.status;
  return `Design document (${status}): ${paths.html}`;
}

// --- approval -----------------------------------------------------------------------------------------

export function approve(ctx, args) {
  const tool = "design-approve";
  const request = arg(args, "request") ?? {};
  if (!/^[A-Za-z0-9_]{1,100}$/.test(request.planName)) {
    throw new RuntimeError(`${tool} rejected: planName must match ^[A-Za-z0-9_]{1,100}$. Provided value: '${request.planName}'.`);
  }
  const { design } = jobDesign(ctx, args, tool);
  check(ctx, "approve", request, tool);
  const findings = runChecks(design);
  if (findings.errors.length) {
    return {
      output: JSON.stringify({ status: "Rejected", reason: "the design still has integrity errors; fix them and approve again", errors: findings.errors }, null, 2),
      exitCode: 1,
    };
  }
  const at = iso(ctx.now());
  design.status = "Approved";
  design.approvedAt = at;
  design.planName = request.planName;
  design.planDescription = request.description ?? null;
  design.modifiedAfterApproval = false;
  touch(ctx, design, "approved", `approved as ${request.planName}`);
  const paths = saveDesign(ctx, design);
  return `Design approved (${at.slice(0, 10)} ${at.slice(11, 19)}Z). Design document: ${paths.html}`;
}

export function operationStatus(ctx, args) {
  const tool = "design-operation-status";
  const request = arg(args, "request") ?? {};
  const { design } = jobDesign(ctx, args, tool);
  check(ctx, "operationStatus", request, tool);
  const unknown = request.ids.filter((id) => !design.path.operations.some((o) => o.id === id));
  if (unknown.length) throw new RuntimeError(`${tool} rejected: unknown operation ids ${unknown.join(", ")}; no flag changed`);
  for (const operation of design.path.operations) if (request.ids.includes(operation.id)) operation.implementationStatus = request.status;
  touch(ctx, design, "status", `${request.ids.join(", ")} -> ${request.status}`);
  saveDesign(ctx, design);
  return JSON.stringify(request.ids);
}

// --- iterations ---------------------------------------------------------------------------------------

const WALK_EXCLUDES = new Set([".git", "node_modules", "bin", "obj", "dist", ".DS_Store"]);

function workspaceFiles(workspace, excludeRoot) {
  let files;
  try {
    files = execFileSync("git", ["ls-files", "-co", "--exclude-standard", "-z"], { cwd: workspace, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 256 * 1024 * 1024 })
      .split("\0")
      .filter(Boolean);
  } catch {
    files = [];
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (WALK_EXCLUDES.has(entry.name)) continue;
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else files.push(relative(workspace, path).split("\\").join("/"));
      }
    };
    walk(workspace);
  }
  const excluded = excludeRoot ? relative(workspace, excludeRoot).split("\\").join("/") : null;
  const result = {};
  for (const file of files) {
    if (excluded && !excluded.startsWith("..") && excluded !== "" && (file === excluded || file.startsWith(`${excluded}/`))) continue;
    const hash = entryHash(join(workspace, file));
    if (hash) result[file] = hash;
  }
  return result;
}

// A symlink is recorded by its target path, as git stores it, and never followed: a link to a directory (the
// skills installer links .claude/skills/<name> to .agents/skills/<name>) is not a file to read. Anything that
// is neither a file nor a link (a submodule, a deleted path) is left out.
function entryHash(path) {
  const stat = lstatSync(path, { throwIfNoEntry: false });
  if (stat?.isSymbolicLink()) return sha256(`symlink:${readlinkSync(path)}`);
  return stat?.isFile() ? sha256(readFileSync(path)) : null;
}

export function iterationOpen(ctx, args) {
  const tool = "design-iteration-open";
  const request = arg(args, "request") ?? {};
  const { design } = jobDesign(ctx, args, tool);
  check(ctx, "iterationOpen", request, tool);
  const open = design.iterations.find((it) => it.status === "Open");
  if (open) throw new RuntimeError(`${tool} rejected: iteration ${open.id} is still open; close it with design-iteration-close first.`);
  const requested = arg(request, "workspacePath");
  const workspace = requested ? (isAbsolute(requested) ? requested : resolve(ctx.workspaceRoot, requested)) : ctx.workspaceRoot;
  if (!existsSync(workspace)) throw new RuntimeError(`${tool} rejected: workspacePath does not exist: ${workspace}`);
  design.counters.iteration += 1;
  const id = `IT${design.counters.iteration}`;
  const createdAt = iso(ctx.now());
  writeJson(join(designPaths(ctx, design.sessionId, design.designId).iterations, `${id}.snapshot.json`), workspaceFiles(workspace, ctx.runtimeRoot));
  design.iterations.push({ id, request: request.request, workspacePath: workspace, createdAt, closedAt: null, status: "Open", files: [], verifications: [], blocks: [], notes: "" });
  touch(ctx, design, "iteration-open", `${id}: ${request.request}`);
  saveDesign(ctx, design);
  return JSON.stringify({ iterationId: id, createdAt });
}

export function iterationClose(ctx, args) {
  const tool = "design-iteration-close";
  const request = arg(args, "request") ?? {};
  const { design } = jobDesign(ctx, args, tool);
  check(ctx, "iterationClose", request, tool);
  const iteration = design.iterations.find((it) => it.id === request.iterationId);
  if (!iteration) throw new RuntimeError(`${tool} rejected: iteration ${request.iterationId} does not exist`);
  if (iteration.status === "Closed") throw new RuntimeError(`${tool} rejected: iteration ${iteration.id} is already closed; nothing was modified`);
  const before = readJson(join(designPaths(ctx, design.sessionId, design.designId).iterations, `${iteration.id}.snapshot.json`), {});
  const after = workspaceFiles(iteration.workspacePath, ctx.runtimeRoot);
  const files = [];
  for (const [path, hash] of Object.entries(after)) {
    if (!(path in before)) files.push({ path, change: "Added", detail: null });
    else if (before[path] !== hash) files.push({ path, change: "Modified", detail: null });
  }
  for (const path of Object.keys(before)) if (!(path in after)) files.push({ path, change: "Deleted", detail: null });
  files.sort((a, b) => a.path.localeCompare(b.path));
  const closedAt = iso(ctx.now());
  Object.assign(iteration, { closedAt, status: "Closed", files, verifications: request.verifications ?? [], blocks: request.blocks ?? [], notes: request.notes ?? "" });
  touch(ctx, design, "iteration-close", `${iteration.id}: ${files.length} file(s)`);
  saveDesign(ctx, design);
  return JSON.stringify({ iterationId: iteration.id, closedAt });
}
