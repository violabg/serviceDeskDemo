// Design operations (contracts/design-model.md): row writes with server-assigned immutable ids, the design
// submission, approval, operation status and implementation iterations.
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, readdirSync, readlinkSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { crowdedPlaceholders, overviewFindings, runChecks } from "./checks.mjs";
import { designPaths, loadDesign, saveDesign, touch } from "./design-store.mjs";
import { designGrounding, knowledgeFile, resolveKnowledgeReference } from "./knowledge.mjs";
import { authorisationOf, isAutomatic, isDone, unmetDependencies, weightOf } from "./plan.mjs";
import { implementationContext, servedOperation, snapshot, snapshotSelection, verificationView } from "./projections.mjs";
import { validate } from "./schema.mjs";
import { RuntimeError, arg, iso, jobFlags, linedJson, readJson, servePart, sha256, writeJson } from "./util.mjs";
import { loadJob } from "./workflow.mjs";

let cachedSchema = null;
function schema(ctx) {
  cachedSchema ??= JSON.parse(readFileSync(join(ctx.assetsRoot, "design-requests.schema.json"), "utf8"));
  return cachedSchema;
}

function check(ctx, defName, value, tool, path = "") {
  const root = schema(ctx);
  const errors = validate(defName ? root.$defs[defName] : root, value, root, path);
  if (errors.length) {
    throw new RuntimeError(`${tool} rejected`, {
      status: "Rejected",
      errors: errors.map((detail) => ({ rule: "invalid-request", element: tool, detail })),
      applied: "nothing was applied",
    });
  }
}

// Every design operation takes { sessionId, jobId, request }. A request field sent beside sessionId and jobId
// is named as misplaced instead of validating an empty request, whose errors would point the caller the wrong way.
function requestOf(ctx, args, defName, tool, extras = []) {
  const fields = Object.keys(schema(ctx).$defs[defName].properties ?? {}).map((k) => k.toLowerCase());
  const misplaced = Object.keys(args ?? {}).filter((k) => !["sessionid", "jobid", "request"].includes(k.toLowerCase()) && fields.includes(k.toLowerCase()));
  if (misplaced.length) {
    throw new RuntimeError(`${tool} rejected`, {
      status: "Rejected",
      errors: misplaced.map((key) => ({ rule: "invalid-request", element: tool, detail: `/${key}: '${key}' was sent beside sessionId and jobId; it belongs inside request: { "sessionId": "...", "jobId": "...", "request": { "${key}": ... } }` })),
      applied: "nothing was applied",
    });
  }
  refuseUnknown(args, tool, extras);
  const request = arg(args, "request") ?? {};
  check(ctx, defName, request, tool, "/request");
  return request;
}

function refuseUnknown(args, tool, extras = []) {
  const unknown = Object.keys(args ?? {}).filter((k) => !["sessionid", "jobid", "request", ...extras.map((e) => e.toLowerCase())].includes(k.toLowerCase()));
  if (unknown.length) throw new RuntimeError(`${tool} failed: unknown argument ${unknown.map((k) => `'${k}'`).join(", ")}. Nothing was applied. Arguments: sessionId, jobId, request.`);
}

// Resolves the design of a job. DOCUMENTATION jobs have none.
function jobDesign(ctx, args, tool, options) {
  const job = loadJob(ctx, args, tool);
  if (!job.designId) {
    throw new RuntimeError(`${tool} failed: job '${job.jobId}' runs ${job.workflowType}, which has no design artifact; no design operation is allowed in this workflow.`);
  }
  return { job, design: loadDesign(ctx, job.sessionId, job.designId, options) };
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
  if (incoming.scope) row.scope = incoming.scope;
  row.files = [...new Set([...(row.files ?? []), ...(incoming.files ?? []), ...(incoming.details ?? []).map((d) => d.path)])];
  const details = new Map((row.details ?? []).map((d) => [d.path, d]));
  for (const detail of incoming.details ?? []) details.set(detail.path, { ...details.get(detail.path), ...detail });
  row.details = [...details.values()];
}

// Lab-authored: `outline` answers the ids a later anchor needs, one obligation per line, so an agent does not read
// and script over every row to get them. Agents did this by hand in both issue 11 sessions.
function obligationOutline(obligations, ids) {
  const selected = ids.length ? obligations.filter((o) => ids.includes(o.id)) : obligations;
  return selected.map((o) => `${o.id}: ${o.elements?.length ? o.elements.map((e) => `${o.id}.${e.id} ${e.kind}`).join(", ") : "(no elements)"}`).join("\n");
}

export function rowTool(ctx, tool, args) {
  const table = ROW_TABLES[tool];
  const { design } = jobDesign(ctx, args, tool);
  const canOutline = tool === "design-obligations";
  const outline = canOutline && String(arg(args, "outline") ?? "false") === "true";
  const request = requestOf(ctx, args, "rowRequest", tool, canOutline ? ["outline"] : []);
  if (outline && request.operation !== "Read") throw new RuntimeError(`${tool} rejected: outline applies to the operation Read only. Nothing was applied.`);
  const rows = request.rows ?? [];
  const ids = request.ids ?? [];
  const collection = design[table.collection];
  rows.forEach((row, index) => check(ctx, table.def, row, tool, `/request/rows/${index}`));

  switch (request.operation) {
    case "Read": {
      if (outline) return obligationOutline(collection, ids);
      const selected = ids.length ? collection.filter((r) => ids.includes(r.id)) : collection;
      return linedJson(selected);
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
          record.highlight = Boolean(record.highlight);
          applyOptions(record, options ?? []);
        }
        if (tool === "design-file-references") {
          record.files = [];
          record.details = [];
          record.scope = "Production";
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

// --- knowledge references -----------------------------------------------------------------------------

// A reference names one file of the current catalogue and a range inside it; its path is kept so the text still
// resolves after a rebuild renumbers the file ids. Answers the reason it cannot be placed, or null.
function placeReference(ctx, reference) {
  const file = knowledgeFile(ctx, reference.fId);
  if (!file) return `has an unresolvable file id: ${reference.fId} is not in the current knowledge index; call knowledge-catalog again`;
  const { s, e } = reference.range;
  if (!Number.isInteger(s) || !Number.isInteger(e) || s < 1 || e < s) return `has an unresolvable range: ${s}-${e} is not an inclusive line range`;
  if (e > file.lines) return `has an unresolvable range: The requested range ${s}-${e} is outside the knowledge file, which has ${file.lines} line(s).`;
  reference.filePath = file.path;
  return null;
}

// `references` carries the rows on Add and Update, the kids on Read and Delete (empty = all). A row that cannot be
// applied is reported in `errors` and the other rows still apply.
export function knowledgeReferences(ctx, args) {
  const tool = "design-knowledge-references";
  const { design } = jobDesign(ctx, args, tool);
  const request = requestOf(ctx, args, "knowledgeReferencesRequest", tool);
  const items = request.references ?? [];
  const { operation } = request;
  const result = { added: 0, updated: 0, deleted: 0, unlinkedOperations: [], errors: [] };
  const fail = (detail) => result.errors.push(`${operation}: ${detail}`);
  const rows = items.filter((item) => {
    if (operation === "Read" || operation === "Delete" ? Number.isInteger(item) : item !== null && typeof item === "object") return true;
    fail(`${JSON.stringify(item)} is not ${operation === "Read" || operation === "Delete" ? "a kid" : "a reference row"}`);
    return false;
  });
  const references = design.knowledgeReferences;
  const changed = [];
  switch (operation) {
    case "Read": {
      const missing = rows.filter((kid) => !references.some((r) => r.kid === kid));
      for (const kid of missing) fail(`kid ${kid} does not exist`);
      const selected = rows.length ? references.filter((r) => rows.includes(r.kid)) : references;
      return linedJson({ references: selected.map((r) => ({ ...r, ...resolveKnowledgeReference(ctx, r) })), errors: result.errors });
    }
    case "Add":
      for (const row of rows) {
        if (!Number.isInteger(row.kid) || row.kid < 1) fail(`kid ${row.kid ?? "(none)"} is not a positive integer; assign a distinct one`);
        else if (references.some((r) => r.kid === row.kid)) fail(`kid ${row.kid} already exists; use Update to change it, or assign a new kid to a distinct range`);
        else if (row.fId === undefined || !row.range) fail(`kid ${row.kid} needs its fId and its range { s, e }`);
        else {
          const reference = { kid: row.kid, fId: row.fId, range: { s: row.range.s, e: row.range.e }, filePath: null, scope: row.scope ?? "Production" };
          const problem = placeReference(ctx, reference);
          if (problem) fail(`kid ${row.kid} ${problem}`);
          else {
            references.push(reference);
            changed.push(row.kid);
            result.added++;
          }
        }
      }
      break;
    case "Update":
      for (const row of rows) {
        const current = references.find((r) => r.kid === row.kid);
        if (!current) {
          fail(`kid ${row.kid ?? "(none)"} does not exist`);
          continue;
        }
        // An existing reference keeps every field the update does not send, its stored scope included.
        const next = { ...current, fId: row.fId ?? current.fId, range: row.range ?? current.range, scope: row.scope ?? current.scope };
        const problem = row.fId !== undefined || row.range ? placeReference(ctx, next) : null;
        if (problem) fail(`kid ${row.kid} ${problem}`);
        else {
          Object.assign(current, next);
          changed.push(row.kid);
          result.updated++;
        }
      }
      break;
    case "Delete": {
      for (const kid of rows) if (!references.some((r) => r.kid === kid)) fail(`kid ${kid} does not exist`);
      const kids = rows.length ? rows.filter((kid) => references.some((r) => r.kid === kid)) : references.map((r) => r.kid);
      // An operation that declared a deleted kid loses it and is reported, so its knowledge can be registered again.
      for (const op of design.path.operations) {
        const kept = (op.knowledgeReferences ?? []).filter((kid) => !kids.includes(kid));
        if (kept.length !== (op.knowledgeReferences ?? []).length) {
          op.knowledgeReferences = kept;
          result.unlinkedOperations.push(op.id);
        }
      }
      design.knowledgeReferences = references.filter((r) => !kids.includes(r.kid));
      changed.push(...kids);
      result.deleted = kids.length;
      break;
    }
  }
  if (changed.length) {
    touch(ctx, design, { Add: "added", Update: "updated", Delete: "deleted" }[operation], `${tool}: ${changed.join(", ")}`);
    saveDesign(ctx, design);
  }
  return JSON.stringify(result);
}

// --- overview ---------------------------------------------------------------------------------------

export function overview(ctx, args) {
  const tool = "design-overview";
  const { design } = jobDesign(ctx, args, tool);
  const request = requestOf(ctx, args, "overview", tool);
  if (request.operation === "Read") return linedJson(design.overview);
  const gaps = request.gaps ?? design.overview.gaps;
  const errors = request.gaps !== undefined ? overviewFindings(design, gaps) : [];
  if (request.gaps !== undefined && design.obligations.length === 0) {
    for (const ref of crowdedPlaceholders(gaps)) errors.push({ rule: "overview-gap-placeholders-crowded", element: "gaps", detail: `{{${ref}}} is too close to the next placeholder` });
  }
  if (errors.length) return { output: linedJson({ status: "Rejected", errors }), exitCode: 1 };
  if (request.currentState !== undefined) design.overview.currentState = request.currentState;
  if (request.gaps !== undefined) design.overview.gaps = request.gaps;
  touch(ctx, design, "updated", "design-overview");
  saveDesign(ctx, design);
  return JSON.stringify({ status: design.status, currentState: Boolean(design.overview.currentState), gaps: Boolean(design.overview.gaps) });
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
  refuseUnknown(args, tool);
  const request = arg(args, "request");
  if (!request || typeof request !== "object" || Object.keys(request).length === 0) {
    throw new RuntimeError(`${tool} rejected: an empty request is never acceptable; send sessionId, jobId and request.`);
  }
  const { design } = jobDesign(ctx, args, tool);
  // Validate the envelope; row-level problems are reported per row as `rejected`, not as a failed call.
  const root = schema(ctx);
  const envelope = { header: request.header, delete: request.delete };
  check(ctx, null, { sessionId: arg(args, "sessionId"), jobId: arg(args, "jobId"), request: Object.fromEntries(Object.entries(envelope).filter(([, v]) => v !== undefined)) }, tool);
  for (const key of Object.keys(request)) {
    if (!["header", "add", "patch", "delete"].includes(key)) {
      throw new RuntimeError(`${tool} rejected`, { status: "Rejected", errors: [{ rule: "invalid-request", element: tool, detail: `/request/${key}: the JSON property '${key}' could not be mapped; the allowed properties are header, add, patch, delete` }] });
    }
  }
  const applied = { added: [], patched: [], deleted: [] };
  const rejected = [];

  if (request.header) {
    for (const [key, value] of Object.entries(request.header)) if (value) design.path[key] = value;
  }

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
        rejected.push({ path: `${mode}.${table}`, id: null, reason: `the JSON property '${table}' could not be mapped; the allowed properties are ${Object.keys(SUBMIT_TABLES).join(", ")}` });
        continue;
      }
      const accepted = [];
      (rows ?? []).forEach((row, index) => {
        const errors = validate(root.$defs.submitRows.properties[table].items, row, root, `${mode}.${table}[${index}]`);
        const id = Number.isInteger(row?.id) ? `${spec.prefix}${row.id}` : null;
        if (errors.length) {
          rejected.push({ path: `${mode}.${table}[${index}]`, id, reason: errors.join("; ") });
          return;
        }
        const unknownKids = (row.knowledgeReferences ?? []).filter((kid) => !design.knowledgeReferences.some((r) => r.kid === kid));
        if (unknownKids.length) {
          rejected.push({ path: `${mode}.${table}[${index}]`, id, reason: `knowledgeReferences names kid ${unknownKids.join(", ")}, which no knowledge reference registers; register it with design-knowledge-references first` });
          return;
        }
        const unknownDecisions = (row.realizes ?? []).filter((ref) => !design.decisions.some((d) => d.id === ref));
        if (unknownDecisions.length) {
          rejected.push({ path: `${mode}.${table}[${index}]`, id, reason: `realizes names ${unknownDecisions.join(", ")}, which no decision declares; write the decision with design-decisions first` });
          return;
        }
        const current = spec.get(design);
        const existing = current.find((r) => r.id === id);
        if (mode === "add") {
          if (existing || accepted.some((r) => r.id === id)) {
            rejected.push({ path: `${mode}.${table}[${index}]`, id, reason: "already exists" });
            return;
          }
          const record = { id, ...persistRow(table, row) };
          if (table === "operations") record.implementationStatus ??= null;
          accepted.push(record);
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
      // A call's rows keep their order and go before the first stored row with a higher id, so parallel calls
      // with disjoint ranges build the same plan whichever arrives first. Stored rows are never reordered.
      if (accepted.length) {
        const cardinal = (record) => Number(record.id.slice(spec.prefix.length));
        const lowest = Math.min(...accepted.map(cardinal));
        const current = spec.get(design);
        const at = current.findIndex((record) => cardinal(record) > lowest);
        current.splice(at === -1 ? current.length : at, 0, ...accepted);
      }
    }
  }
  const changed = applied.added.length + applied.patched.length + applied.deleted.length > 0 || request.header;
  if (changed) {
    touch(ctx, design, "submitted", `design-submit: +${applied.added.join(",") || "-"} ~${applied.patched.join(",") || "-"} x${applied.deleted.join(",") || "-"}`);
    saveDesign(ctx, design);
  }
  const findings = runChecks(design);
  return linedJson({ status: design.status, applied, rejected, errors: findings.errors, warnings: findings.warnings, coverage: findings.coverage });
}

// --- reads --------------------------------------------------------------------------------------------

export function checksTool(ctx, args) {
  const accept = String(arg(args, "acceptExternalEdit") ?? "false") === "true";
  const { design } = jobDesign(ctx, args, "design-checks", { acceptExternalEdit: accept });
  if (accept) {
    const errors = validateDesignShape(design);
    if (errors.length) throw new RuntimeError("design-checks: the edited design.json is not a valid design", { status: "Rejected", errors });
    touch(ctx, design, "resealed", "external edit accepted after review");
    saveDesign(ctx, design);
  }
  return linedJson(runChecks(design));
}

function validateDesignShape(design) {
  const errors = [];
  for (const key of ["obligations", "openPoints", "fileReferences", "decisions", "iterations"]) {
    if (!Array.isArray(design[key])) errors.push({ rule: "invalid-design", element: key, detail: `${key} must be an array` });
  }
  if (!design.path || !Array.isArray(design.path.operations)) errors.push({ rule: "invalid-design", element: "path", detail: "path.operations must be an array" });
  return errors;
}

// The parts of a projection belong to one revision of the design: a later part of an older revision is refused,
// so text from two revisions is never read as one answer.
function revisionGuard(design, args, tool, caller) {
  const revision = arg(args, "revision");
  if (revision !== undefined && revision !== design.updatedAt) {
    throw new RuntimeError(`${tool} failed: the design changed after the earlier parts were served (revision '${revision}', now '${design.updatedAt}'). Start again from part 1.`);
  }
  return { tool, next: (k) => `call ${tool} again with part ${k} and revision ${design.updatedAt} (CLI: ${jobFlags(args, caller)} --part ${k} --revision ${design.updatedAt}).` };
}

export function snapshotTool(ctx, args, caller) {
  const job = loadJob(ctx, args, "design-snapshot");
  if (!job.designId) {
    return `# Design snapshot\nThis job runs ${job.workflowType}, which has no design artifact. There is nothing to project.\n`;
  }
  // Parts start at a section heading or at an item, so a row is never split.
  const design = loadDesign(ctx, job.sessionId, job.designId);
  const guard = revisionGuard(design, args, "design-snapshot", caller);
  const section = arg(args, "section");
  const ids = arg(args, "ids");
  const selecting = section !== undefined || ids !== undefined;
  const same = `${section !== undefined ? ` --section "${section}"` : ""}${ids !== undefined ? ` --ids ${[ids].flat().join(",")}` : ""}`;
  return servePart(selecting ? snapshotSelection(snapshot(design), { section, ids }) : snapshot(design), args, {
    ...guard,
    limit: ctx.partLimit,
    starts: (line) => /^## /.test(line) || /^- /.test(line),
    ...(selecting
      ? { next: (k) => `call design-snapshot again with the same selection, part ${k} and revision ${design.updatedAt} (CLI: ${jobFlags(args, caller)}${same} --part ${k} --revision ${design.updatedAt}).` }
      : { hint: "To read one section or item instead, call it with --section Operations or --ids IM3,CT1." }),
  });
}

export function verificationViewTool(ctx, args, caller) {
  const { design } = jobDesign(ctx, args, "design-verification-view");
  // Parts start at an obligation, an operation or a section heading, so none of them is ever split.
  return servePart(verificationView(design, designGrounding(ctx, design)), args, {
    ...revisionGuard(design, args, "design-verification-view", caller),
    limit: ctx.partLimit,
    starts: (line) => /^#{1,2} /.test(line),
  });
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
  const { design } = jobDesign(ctx, args, tool);
  const request = requestOf(ctx, args, "approve", tool);
  if (!/^[A-Za-z0-9_]{1,100}$/.test(request.planName)) {
    throw new RuntimeError(`${tool} rejected: planName must match ^[A-Za-z0-9_]{1,100}$. Provided value: '${request.planName}'.`);
  }
  const findings = runChecks(design);
  if (findings.errors.length) {
    return {
      output: linedJson({ status: "Rejected", reason: "the design still has integrity errors; fix them and approve again", errors: findings.errors }),
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
  saveDesign(ctx, design);
  return `Design approved (${at.slice(0, 10)} ${at.slice(11, 19)}Z).`;
}

export function operationStatus(ctx, args) {
  const tool = "design-operation-status";
  const { design } = jobDesign(ctx, args, tool);
  const request = requestOf(ctx, args, "operationStatus", tool);
  const unknown = request.ids.filter((id) => !design.path.operations.some((o) => o.id === id));
  if (unknown.length) throw new RuntimeError(`${tool} rejected: unknown operation ids ${unknown.join(", ")}; no flag changed`);
  for (const operation of design.path.operations) if (request.ids.includes(operation.id)) operation.implementationStatus = request.status;
  touch(ctx, design, "status", `${request.ids.join(", ")} -> ${request.status}`);
  saveDesign(ctx, design);
  return JSON.stringify(request.ids);
}

// --- implementation loop ------------------------------------------------------------------------------

export function implementationContextTool(ctx, args, caller) {
  const tool = "design-implementation-context";
  const { job, design } = jobDesign(ctx, args, tool);
  // Parts start at a section heading or at an item, so a row is never split.
  return servePart(implementationContext(design, { withRequirement: job.workflowType === "FAST_IMPLEMENTATION" }), args, {
    ...revisionGuard(design, args, tool, caller),
    limit: ctx.partLimit,
    starts: (line) => /^## /.test(line) || /^- /.test(line),
  });
}

// The operation text is computed without the re-serve note, so a part means the same text on every call.
function serveText(ctx, design, operation, note, args, caller) {
  const tool = "design-implementation-operation";
  const weight = weightOf(operation);
  const knowledge = (operation.knowledgeReferences ?? []).map((kid) => {
    const reference = design.knowledgeReferences.find((r) => r.kid === kid);
    return reference ? { ...reference, ...resolveKnowledgeReference(ctx, reference) } : { kid, text: null, resolutionNote: `kid ${kid} is not registered` };
  });
  const answer = servePart(servedOperation(operation, { weight, authorisation: authorisationOf(weight), knowledge }), args, {
    tool,
    limit: ctx.partLimit,
    starts: (line) => /^#{1,3} /.test(line),
    next: (k) => `call ${tool} again with part ${k} (CLI: ${jobFlags(args, caller)} --part ${k}); it serves the rest of ${operation.id} and does not advance the plan.`,
    onServed: (n, parts) => recordOperationPart(ctx, design, operation, n, parts.length),
  });
  return note ? answer.replace("\n", `\n${note}\n`) : answer;
}

// A long operation may only be closed once all of its parts were served.
function recordOperationPart(ctx, design, operation, n, total) {
  if (total === 1) return;
  const known = design.servedParts?.operation === operation.id ? design.servedParts.seen : [];
  design.servedParts = { operation: operation.id, total, seen: [...new Set([...known, n])].sort((a, b) => a - b) };
  saveDesign(ctx, design);
}

export function implementationOperation(ctx, args, caller) {
  const tool = "design-implementation-operation";
  const { design } = jobDesign(ctx, args, tool);
  const operations = design.path.operations;
  const requested = arg(args, "operationId") ?? arg(args, "id");
  const served = design.servedOperation ? operations.find((op) => op.id === design.servedOperation) : null;
  if (served) {
    if (requested && requested !== served.id) {
      throw new RuntimeError(`${tool} rejected: ${served.id} is served and not closed yet; close it with design-implementation-operation-close before asking for ${requested}.`);
    }
    const note = arg(args, "part") === undefined ? `${served.id} was already served and is not closed: implement it, then call design-implementation-operation-close.` : null;
    return serveText(ctx, design, served, note, args, caller);
  }
  let operation;
  if (requested) {
    operation = operations.find((op) => op.id === requested);
    if (!operation) throw new RuntimeError(`${tool} rejected: operation ${requested} does not exist.`);
    // The loop asks again with the same id after closing it: the authorised work is done, never reopened.
    if (isDone(operation)) {
      return `batch-complete: ${requested} is already ${operation.implementationStatus}, so the operation this delegation authorised is done; a closed operation is never reopened (a correction runs outside the loop). Return the control.`;
    }
    const unmet = unmetDependencies(operations, operation);
    if (unmet.length) throw new RuntimeError(`${tool} rejected: ${requested} depends on ${unmet.join(", ")}, which are not implemented yet; a declared dependency prevails over the developer's selection.`);
  } else {
    operation = operations.find((op) => isAutomatic(op) && !isDone(op) && unmetDependencies(operations, op).length === 0);
    if (!operation) {
      return operations.some((op) => !isDone(op))
        ? "batch-complete: the automatic batch is exhausted. The operations that remain require the developer's explicit authorisation; return the control."
        : "complete: every operation of the plan is implemented. Return the control.";
    }
  }
  operation.implementationStatus = "InProgress";
  design.servedOperation = operation.id;
  touch(ctx, design, "served", `${operation.id} served${requested ? " on the developer's authorisation" : ""}`);
  saveDesign(ctx, design);
  return serveText(ctx, design, operation, null, args, caller);
}

export function implementationOperationClose(ctx, args) {
  const tool = "design-implementation-operation-close";
  const { design } = jobDesign(ctx, args, tool);
  const operation = design.servedOperation ? design.path.operations.find((op) => op.id === design.servedOperation) : null;
  if (!operation) throw new RuntimeError(`${tool} rejected: no operation is served; call design-implementation-operation first.`);
  const parts = design.servedParts?.operation === operation.id ? design.servedParts : null;
  const unread = parts ? Array.from({ length: parts.total }, (_, i) => i + 1).filter((n) => !parts.seen.includes(n)) : [];
  if (unread.length) throw new RuntimeError(`${tool} rejected: ${operation.id} has parts that were never served (${unread.join(", ")}). Read them with design-implementation-operation before closing it.`);
  operation.implementationStatus = "Implemented";
  design.servedOperation = null;
  delete design.servedParts;
  touch(ctx, design, "operation-closed", `${operation.id} -> Implemented`);
  saveDesign(ctx, design);
  return `${operation.id} closed as Implemented. Call design-implementation-operation for the next operation.`;
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
  const { design } = jobDesign(ctx, args, tool);
  const request = requestOf(ctx, args, "iterationOpen", tool);
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
  const { design } = jobDesign(ctx, args, tool);
  const request = requestOf(ctx, args, "iterationClose", tool);
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
