// Markdown projections of the design (contracts/projections.md), built from the design on each call.
import { isHighlighted, placeholders, runChecks } from "./checks.mjs";
import { weightOf } from "./plan.mjs";
import { RuntimeError, shortTime } from "./util.mjs";

const lower = (value) => (value ?? "").toString().toLowerCase();
const join = (items) => (items?.length ? items.join(", ") : "none");
const oneLine = (text) => (text ?? "").replace(/\s*\n\s*/g, " ").trim();

function elementsLine(obligation) {
  if (!obligation.elements?.length) return "elements: none";
  return `elements: ${obligation.elements.map((e) => `${obligation.id}.${e.id} (${lower(e.kind)}) ${oneLine(e.text)}`).join("; ")}`;
}

function failureArms(operation) {
  const parts = [];
  for (const b of operation.branches ?? []) {
    parts.push(`branch: ${oneLine(b.question)} → yes: ${oneLine(b.yes?.label)} (${oneLine(b.yes?.note)}) / no: ${oneLine(b.no?.label)} (${oneLine(b.no?.note)}) — why: ${oneLine(b.why)}`);
  }
  for (const n of operation.negatives ?? []) parts.push(`negative: ${oneLine(n.cause)} → ${oneLine(n.behavior)} (impact ${n.impact ?? "n/a"})`);
  for (const x of operation.exceptions ?? []) parts.push(`exception: ${oneLine(x.trigger)} → ${oneLine(x.recovery)}`);
  return parts;
}

function fileReferenceLine(fr) {
  const details = (fr.files ?? []).map((file) => {
    const d = (fr.details ?? []).find((x) => x.path === file);
    return `${file} (why: ${oneLine(d?.why) || "(not recorded)"} | purpose: ${oneLine(d?.purpose) || "(not recorded)"})`;
  });
  return `- ${fr.id} | scope: ${lower(fr.scope ?? "Production")} | symbol: ${fr.symbol} | files: ${details.join("; ") || "none"}`;
}

function fileReferencesSection(design, out) {
  out.push("", "## File references");
  for (const fr of design.fileReferences) out.push(fileReferenceLine(fr));
}

function contractsSection(design, out) {
  const p = design.path;
  out.push("", "## Contracts");
  for (const c of p.contracts) {
    const premortem = (c.premortem ?? []).map((m) => `${oneLine(m.what)} → ${oneLine(m.mitigation)}`).join("; ");
    out.push(`- ${c.id} | ${lower(c.type)} | module: ${c.module ?? ""} | file: ${c.file ?? ""} | promises: ${oneLine(c.promises)} | signature: ${oneLine(c.signature)} | premortem: ${premortem || "none"} | confidence: ${c.confidence ?? "n/a"} | evidence: ${c.evidence ?? "n/a"}${c.evidenceNote ? ` (${oneLine(c.evidenceNote)})` : ""}`);
  }
  out.push("", "## Public APIs");
  for (const a of p.apis) {
    const responses = (a.responses ?? []).map((r) => `${r.status} ${oneLine(r.description)}${r.body ? ` body: ${oneLine(r.body)}` : ""}`).join("; ");
    out.push(`- ${a.id} | ${a.method} ${a.path} | purpose: ${oneLine(a.purpose)} | auth: ${oneLine(a.auth)} | request: ${oneLine(a.request)} | responses: ${responses || "none"} | confidence: ${a.confidence ?? "n/a"} | evidence: ${a.evidence ?? "n/a"}`);
  }
}

function filesystemSection(design, out) {
  const p = design.path;
  out.push("", "## Filesystem");
  for (const f of p.filesystem.files) {
    out.push(`- ${f.id} | ${lower(f.status)} | ${f.path} | module: ${f.module ?? ""} | reason: ${oneLine(f.reason)} | change: ${oneLine(f.change)} | impact: ${oneLine(f.impact)}`);
  }
}

function decisionsSection(design, out) {
  out.push("", "## Decisions");
  const realizing = (d) => design.path.operations.filter((op) => (op.realizes ?? []).includes(d.id)).map((op) => op.id);
  for (const d of design.decisions) {
    const options = d.options.map((o) => `${o.id}${o.chosen ? " (chosen)" : ""}: ${oneLine(o.text)}`).join(" || ");
    out.push(
      `- ${d.id} | ${lower(d.source)} | highlight: ${isHighlighted(d)} | topic: ${oneLine(d.topic)} | question: ${oneLine(d.question)} | context: ${oneLine(d.context)} | why: ${oneLine(d.why)} | how: ${oneLine(d.how)} | realized by: ${join(realizing(d))} | options: ${options}`,
    );
  }
}

const obligationRows = (design) =>
  design.obligations.map((o) => `- ${o.id} | ${lower(o.origin ?? "Requirement")} | ${oneLine(o.behavior)} | class: ${oneLine(o.class)} | boundaries: ${oneLine(o.boundaries)} | source: ${oneLine(o.sourceRef)} | ${elementsLine(o)}`);
const openPointRows = (design) => design.openPoints.map((op) => `- ${op.id} | ${oneLine(op.question)} | why: ${oneLine(op.whyAskingMySelf)}`);

export function snapshot(design) {
  const { coverage } = runChecks(design);
  const p = design.path;
  const out = [];
  out.push(`# Design snapshot — ${design.designId}`);
  out.push(
    `status: ${design.status}${design.modifiedAfterApproval ? " (modified after approval)" : ""}` +
      (design.planName ? ` | plan: ${design.planName}` : "") +
      (design.approvedAt ? ` | approved: ${shortTime(design.approvedAt)}` : "") +
      (p.title ? ` | title: ${p.title}` : "") +
      (p.requirementRef ? ` | requirement: ${p.requirementRef}` : ""),
  );
  out.push("", "## Overview");
  out.push(`- current codebase: ${oneLine(design.overview.currentState) || "(not recorded)"}`);
  out.push(`- gaps: ${oneLine(design.overview.gaps) || "(not recorded)"}`);
  out.push("", "## Obligations", ...obligationRows(design));
  out.push("", "## Open points", ...openPointRows(design));
  fileReferencesSection(design, out);
  out.push("", "## Knowledge references");
  for (const k of design.knowledgeReferences ?? []) {
    out.push(`- kid ${k.kid} | fId ${k.fId} | ${k.filePath ?? "(no path)"} | lines ${k.range.s}–${k.range.e} | scope: ${lower(k.scope ?? "Production")}`);
  }
  contractsSection(design, out);
  filesystemSection(design, out);
  out.push("", "## Operations");
  for (const op of p.operations) {
    const arms = failureArms(op);
    out.push(
      `- ${op.id} | ${lower(op.kind)}${op.testType ? ` | test type: ${op.testType}` : ""} | weight: ${weightOf(op)} | ${oneLine(op.operation)} | status: ${op.implementationStatus ?? "not started"} | dependsOn: ${join(op.dependsOn)} | files: ${join(op.files)} | implements: ${join([...(op.refObligations ?? []), ...(op.refElements ?? [])])} | knowledge: ${join((op.knowledgeReferences ?? []).map((kid) => `kid ${kid}`))} | realizes: ${join(op.realizes)}` +
        (op.source ? ` | source: ${op.source}${op.sourceRef ? ` (${oneLine(op.sourceRef)})` : ""}` : "") +
        ` | instructions: ${oneLine(op.instructions)}` +
        (arms.length ? ` | ${arms.join(" | ")}` : ""),
    );
  }
  decisionsSection(design, out);
  out.push("", "## History");
  for (const it of design.iterations) {
    const files = (it.files ?? []).map((f) => `${lower(f.change)} ${f.path}`).join("; ");
    const verifications = (it.verifications ?? []).map((v) => `${v.kind} ${v.name}: ${oneLine(v.outcome)}`).join("; ");
    out.push(
      `- ${it.id} | ${lower(it.status)} | request: ${oneLine(it.request)} | created: ${shortTime(it.createdAt)} | closed: ${shortTime(it.closedAt) || "open"} | files: ${files || "none"} | verifications: ${verifications || "none"} | blocks: ${join(it.blocks)} | notes: ${oneLine(it.notes) || "none"}`,
    );
  }
  out.push("", "## Coverage");
  out.push(`- obligations ${coverage.obligationsRealized}/${coverage.obligationsTotal} | elements ${coverage.elementsRealized}/${coverage.elementsTotal}`);
  return `${out.join("\n")}\n`;
}

// Lab-authored: part of the snapshot, by section and by item id, read from the snapshot itself so a row reads the same
// either way. A row's id is its first field (`IM3`, `CT1`, `kid 7`). A selection that finds nothing refuses, naming
// what exists, and an id that is missing is reported beside the rows that were found.
const listOf = (value) => [value].flat().flatMap((item) => String(item).split(",")).map((item) => item.trim()).filter(Boolean);

export function snapshotSelection(text, { section, ids }) {
  const [head, ...blocks] = text.replace(/\n+$/, "").split(/\n(?=## )/);
  const sections = blocks.map((block) => {
    const [heading, ...rows] = block.split("\n");
    return { name: heading.slice(3), rows: rows.filter(Boolean) };
  });
  const wanted = section === undefined ? null : listOf(section).map((name) => name.toLowerCase());
  const unknown = (wanted ?? []).filter((name) => !sections.some((s) => s.name.toLowerCase() === name));
  if (unknown.length) throw new RuntimeError(`design-snapshot failed: no section '${unknown.join("', '")}'. Sections: ${sections.map((s) => s.name).join(", ")}.`);
  const items = ids === undefined ? null : listOf(ids).map((id) => id.toLowerCase());
  const found = new Set();
  const out = [head.trimEnd()];
  for (const s of sections) {
    if (wanted && !wanted.includes(s.name.toLowerCase())) continue;
    const rows = items === null ? s.rows : s.rows.filter((row) => {
      const id = row.slice(2).split(" | ")[0].trim().toLowerCase();
      if (!row.startsWith("- ") || !items.includes(id)) return false;
      found.add(id);
      return true;
    });
    if (items === null || rows.length) out.push("", `## ${s.name}`, ...rows);
  }
  const missing = (items ?? []).filter((id) => !found.has(id));
  if (items && found.size === 0) throw new RuntimeError(`design-snapshot failed: no item '${missing.join("', '")}'${wanted ? " in that section" : ""}. A row's id is its first field: O1, OP1, FR1, kid 1, CT1, API1, FS1, IM1, D1, IT1.`);
  if (missing.length) out.push("", `Not found: ${missing.join(", ")}.`);
  return `${out.join("\n")}\n`;
}

// The text each of the given anchors owns in an operation's instructions: from its placeholder to the next
// placeholder. Instructions that name none of the anchors are returned whole.
function mechanisms(instructions, refs) {
  const text = instructions ?? "";
  const found = placeholders(text);
  const owned = found.flatMap((p, index) => (refs.has(p.ref) ? [oneLine(text.slice(p.start, found[index + 1]?.start ?? text.length))] : []));
  return owned.length ? owned : [oneLine(text)];
}

// The view the design verifier judges. Only obligation and element labels are kept: the verifier judges the
// content presented, never the internal mapping. Each obligation carries only the mechanisms its own
// placeholders introduce; what an operation shares across obligations (failure arms, contracts, files) is
// printed once, under the operation's name, so the view grows with the design and not with its fan-out.
export function verificationView(design, grounding = []) {
  const p = design.path;
  const out = [`# Design verification view`, ""];
  if (design.obligations.length === 0) {
    out.push("The design carries no obligation yet.");
    return `${out.join("\n")}\n`;
  }
  // The knowledge the whole design grounds in, beside the per-obligation grounding below: read each one.
  out.push("## Knowledge grounding");
  if (grounding.length === 0) out.push("- none");
  for (const k of grounding) out.push(`- file_id ${k.file_id}: ${k.path} (${k.why.join(", ")})`);
  // Lab-authored: name the call, so the verifier reads the documents instead of grepping or skipping them.
  if (grounding.length) {
    const ids = grounding.map((k) => k.file_id).join(",");
    out.push("", `Read every document above before judging: call knowledge-read with these file ids and this session (CLI: --fileIds ${ids} --sessionId ${design.sessionId}) and follow its parts.`);
  }
  out.push("", "Under each obligation, mechanisms shows the text that addresses it. Its failure arms, contracts and files are under Operations, and its decisions under Decisions.", "");
  const addressing = new Set();
  for (const obligation of design.obligations) {
    const refs = new Set([obligation.id, ...(obligation.elements ?? []).map((e) => `${obligation.id}.${e.id}`)]);
    const operations = p.operations.filter(
      (op) => (op.refObligations ?? []).includes(obligation.id) || (op.refElements ?? []).some((r) => refs.has(r)),
    );
    const files = new Set(operations.flatMap((op) => op.files ?? []));
    out.push(`## ${obligation.id}`);
    out.push(`- claim: ${oneLine(obligation.behavior)}`);
    if (obligation.class) out.push(`- class: ${oneLine(obligation.class)}`);
    if (obligation.boundaries) out.push(`- boundaries: ${oneLine(obligation.boundaries)}`);
    out.push(`- origin: ${obligation.origin ?? "Requirement"}`);
    out.push("- required elements:");
    for (const e of obligation.elements ?? []) out.push(`  - ${obligation.id}.${e.id} (${lower(e.kind)}) ${oneLine(e.text)}`);
    if (!obligation.elements?.length) out.push("  - none");
    out.push("- mechanisms:");
    if (operations.length === 0) out.push("  - none");
    for (const op of operations) {
      addressing.add(op.id);
      out.push(`  - in "${oneLine(op.operation)}" (${lower(op.kind)}):`);
      for (const mechanism of mechanisms(op.instructions, refs)) out.push(`    - ${mechanism}`);
    }
    const contracts = p.contracts.filter((c) => files.has(c.file));
    const grounding = operations.filter((op) => op.source === "Knowledge").map((op) => oneLine(op.sourceRef));
    for (const c of contracts) if (["Docs", "DocsPartial", "TeamKnowledge"].includes(c.evidence) && c.evidenceNote) grounding.push(oneLine(c.evidenceNote));
    out.push(`- knowledge grounding: ${grounding.length ? [...new Set(grounding)].join("; ") : "none"}`);
    out.push("");
  }
  // The conformance comparison covers every section and every planned element, in plan order, whether or not it
  // addresses an obligation: a build or test step can break a sequencing or representation prescription too.
  const names = new Map(p.operations.map((op) => [op.id, `"${oneLine(op.operation)}"`]));
  const planned = new Set(p.operations.flatMap((op) => op.files ?? []));
  out.push("# Operations", "");
  p.operations.forEach((op, index) => {
    const files = new Set(op.files ?? []);
    out.push(`## "${oneLine(op.operation)}" (${lower(op.kind)})`);
    out.push(`- plan position: ${index + 1} of ${p.operations.length}${op.testType ? ` | test type: ${lower(op.testType)}` : ""} | depends on: ${join((op.dependsOn ?? []).map((id) => names.get(id) ?? "(unknown operation)"))}`);
    if (!addressing.has(op.id)) out.push("- addresses no obligation", `- instructions: ${oneLine(op.instructions) || "none"}`);
    if (op.source) out.push(`- source: ${lower(op.source)}${op.sourceRef ? ` (${oneLine(op.sourceRef)})` : ""}`);
    const cited = (op.knowledgeReferences ?? []).map((kid) => (design.knowledgeReferences ?? []).find((r) => r.kid === kid)).filter(Boolean);
    if (cited.length) out.push(`- knowledge: ${cited.map((r) => `${r.filePath ?? "(no file)"} lines ${r.range?.s}–${r.range?.e}`).join("; ")}`);
    const arms = failureArms(op);
    out.push("- failure arms:");
    if (arms.length === 0) out.push("  - none");
    for (const arm of arms) out.push(`  - ${arm}`);
    const contracts = p.contracts.filter((c) => files.has(c.file));
    out.push("- contracts:");
    if (contracts.length === 0) out.push("  - none");
    for (const c of contracts) out.push(`  - ${oneLine(c.promises)} | signature: ${oneLine(c.signature)}${c.type ? ` | type: ${lower(c.type)}` : ""}`);
    const fsRows = p.filesystem.files.filter((f) => files.has(f.path));
    out.push("- files:");
    if (fsRows.length === 0) out.push("  - none");
    for (const f of fsRows) out.push(`  - ${f.path} (${lower(f.status)}): ${oneLine(f.change)}`);
    out.push("");
  });
  const looseContracts = p.contracts.filter((c) => !planned.has(c.file));
  const looseFiles = p.filesystem.files.filter((f) => !planned.has(f.path));
  if (looseContracts.length) {
    out.push("# Contracts in no operation", "");
    for (const c of looseContracts) out.push(`- ${oneLine(c.promises)} | signature: ${oneLine(c.signature)}${c.type ? ` | type: ${lower(c.type)}` : ""} | file: ${c.file ?? "none"}`);
    out.push("");
  }
  if (looseFiles.length) {
    out.push("# Files in no operation", "");
    for (const f of looseFiles) out.push(`- ${f.path} (${lower(f.status)}): ${oneLine(f.change)}`);
    out.push("");
  }
  // Lab-authored, like the two sections above: the verifier reads the documents whole, and only this says which of
  // the prescriptions the design registered as applying no operation carries.
  const citing = p.operations.flatMap((op) => [...(op.knowledgeReferences ?? []), ...(op.source === "Knowledge" ? [String(op.sourceRef ?? "").trim()] : [])]).map(String);
  const looseKnowledge = (design.knowledgeReferences ?? []).filter((r) => !citing.includes(String(r.kid)));
  if (looseKnowledge.length) {
    out.push("# Knowledge references in no operation", "", "The design registered these prescriptions as applying to it, and no operation cites them.", "");
    for (const r of looseKnowledge) out.push(`- ${r.filePath ?? "(no file)"} lines ${r.range?.s}–${r.range?.e} (${lower(r.scope ?? "Production")})`);
    out.push("");
  }
  if (p.apis.length) {
    out.push("# Public APIs", "");
    for (const a of p.apis) out.push(`- ${a.method} ${a.path} | purpose: ${oneLine(a.purpose)} | auth: ${oneLine(a.auth)} | request: ${oneLine(a.request)}`);
    out.push("");
  }
  out.push("# Decisions", "");
  if (design.decisions.length === 0) out.push("- none");
  for (const d of design.decisions) {
    const chosen = d.options.find((o) => o.chosen);
    const realizedBy = p.operations.filter((op) => (op.realizes ?? []).includes(d.id)).map((op) => `"${oneLine(op.operation)}"`);
    out.push(`- ${oneLine(d.question)} → ${oneLine(chosen?.text)} | realized in: ${join(realizedBy)} | source: ${lower(d.source) || "none"} | highlight: ${isHighlighted(d)}`);
  }
  out.push("");
  return `${out.join("\n")}`;
}

// The rows of the implementor's projection, in the captured shape: a file reference with one line per file, a
// contract without its premortem and evidence, a decision without its question and options.
function contextFileReference(fr) {
  const rows = [`- ${fr.id} | symbol: ${fr.symbol} | files: ${join(fr.files)}`];
  for (const file of fr.files ?? []) {
    const d = (fr.details ?? []).find((x) => x.path === file);
    rows.push(`  - file: ${file} | why: ${oneLine(d?.why) || "(not recorded)"} | purpose: ${oneLine(d?.purpose) || "(not recorded)"}`);
  }
  return rows;
}

function contextContracts(design, out) {
  const p = design.path;
  out.push("", "## Contracts");
  for (const c of p.contracts) out.push(`- ${c.id} | ${lower(c.type)} | module: ${c.module ?? ""} | file: ${c.file ?? ""} | promises: ${oneLine(c.promises)} | signature: ${oneLine(c.signature)}`);
  out.push("", "## Public APIs");
  for (const a of p.apis) {
    const responses = (a.responses ?? []).map((r) => `${r.status} ${oneLine(r.description)}${r.body ? ` body: ${oneLine(r.body)}` : ""}`).join("; ");
    out.push(`- ${a.id} | ${a.method} ${a.path} | purpose: ${oneLine(a.purpose)} | auth: ${oneLine(a.auth)} | request: ${oneLine(a.request)} | responses: ${responses || "none"}`);
  }
}

function contextDecisions(design, out) {
  out.push("", "## Decisions");
  for (const d of design.decisions) out.push(`- ${d.id} | ${lower(d.source)} | highlight: ${isHighlighted(d)} | topic: ${oneLine(d.topic)}`);
}

// The implementor's projection (captured shape): the file references split by scope, then the contracts, the
// public APIs, the filesystem and the decisions, without any operation, obligation or knowledge reference. The
// operations arrive one at a time from design-implementation-operation, so the future stays masked.
// `withRequirement`: a FAST_IMPLEMENTATION job has no operations, so its obligations are the implementor's specification.
export function implementationContext(design, { withRequirement = false } = {}) {
  const out = [`# DESIGN SNAPSHOT — ${design.path.title || "(untitled)"}`];
  if (withRequirement) out.push("## Obligations", ...obligationRows(design), "", "## Open points", ...openPointRows(design), "");
  for (const [heading, scope] of [["File references for the code", "Production"], ["File references for the tests", "Test"]]) {
    const rows = design.fileReferences.filter((fr) => (fr.scope ?? "Production") === scope);
    if (scope === "Test") out.push("");
    out.push(`## ${heading}`, ...(rows.length ? rows.flatMap(contextFileReference) : ["- (none)"]));
  }
  contextContracts(design, out);
  filesystemSection(design, out);
  contextDecisions(design, out);
  return `${out.join("\n")}\n`;
}

// One served operation, with the text of every knowledge reference it declares already expanded.
export function servedOperation(op, { weight, authorisation, knowledge }) {
  const out = [`# Operation ${op.id} — ${oneLine(op.operation)}`];
  out.push(`- kind: ${op.kind}${op.testType ? ` | test type: ${op.testType}` : ""} | weight: ${weight} | authorisation: ${authorisation}`);
  out.push(`- dependsOn: ${join(op.dependsOn)} | files: ${join(op.files)} | implements: ${join([...(op.refObligations ?? []), ...(op.refElements ?? [])])} | realizes: ${join(op.realizes)}`);
  if (op.source) out.push(`- source: ${op.source}${op.sourceRef ? ` (${oneLine(op.sourceRef)})` : ""}`);
  out.push("", "## Instructions", op.instructions ?? "(none)");
  const arms = failureArms(op);
  out.push("", "## Failure arms");
  out.push(...(arms.length ? arms.map((arm) => `- ${arm}`) : ["- none"]));
  out.push("", "## Knowledge references");
  if (!knowledge.length) out.push("- none: this operation declares no knowledge reference");
  for (const k of knowledge) {
    out.push("", `### kid ${k.kid}${k.filePath ? ` — ${k.filePath}, lines ${k.range.s}–${k.range.e}` : ""} (${lower(k.scope ?? "Production")})`);
    out.push(k.text ?? `(not resolved: ${k.resolutionNote})`);
  }
  out.push("", "When it is implemented, call design-implementation-operation-close.");
  return `${out.join("\n")}\n`;
}
