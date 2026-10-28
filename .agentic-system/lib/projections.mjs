// Markdown projections of the design (contracts/projections.md). They are regenerated on every write.
import { isHighlighted, placeholders, runChecks } from "./checks.mjs";
import { weightOf } from "./plan.mjs";
import { shortTime } from "./util.mjs";

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
  if (p.filesystem.intro) out.push(oneLine(p.filesystem.intro));
  for (const f of p.filesystem.files) {
    out.push(`- ${f.id} | ${lower(f.status)} | ${f.path} | module: ${f.module ?? ""} | reason: ${oneLine(f.reason)} | change: ${oneLine(f.change)} | impact: ${oneLine(f.impact)}`);
  }
}

function decisionsSection(design, out) {
  out.push("", "## Decisions");
  for (const d of design.decisions) {
    const options = d.options.map((o) => `${o.id}${o.chosen ? " (chosen)" : ""}: ${oneLine(o.text)}`).join(" || ");
    out.push(
      `- ${d.id} | ${lower(d.source)} | highlight: ${isHighlighted(d)} | topic: ${oneLine(d.topic)} | question: ${oneLine(d.question)} | context: ${oneLine(d.context)} | why: ${oneLine(d.why)} | how: ${oneLine(d.how)} | realizedIn: ${join(d.realizedIn)} | options: ${options}`,
    );
  }
}

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
  out.push("", "## Obligations");
  for (const o of design.obligations) {
    out.push(`- ${o.id} | ${lower(o.origin ?? "Requirement")} | ${oneLine(o.behavior)} | class: ${oneLine(o.class)} | boundaries: ${oneLine(o.boundaries)} | source: ${oneLine(o.sourceRef)} | ${elementsLine(o)}`);
  }
  out.push("", "## Open points");
  for (const op of design.openPoints) out.push(`- ${op.id} | ${oneLine(op.question)} | why: ${oneLine(op.whyAskingMySelf)}`);
  fileReferencesSection(design, out);
  out.push("", "## Knowledge references");
  for (const k of design.knowledgeReferences ?? []) {
    out.push(`- kid ${k.kid} | fId ${k.fId} | ${k.filePath ?? "(no path)"} | lines ${k.range.s}–${k.range.e} | scope: ${lower(k.scope ?? "Production")}`);
  }
  contractsSection(design, out);
  filesystemSection(design, out);
  out.push("", "## Operations");
  if (p.operationsIntro) out.push(oneLine(p.operationsIntro));
  for (const op of p.operations) {
    const arms = failureArms(op);
    out.push(
      `- ${op.id} | ${lower(op.kind)} | weight: ${weightOf(op)} | ${oneLine(op.operation)} | status: ${op.implementationStatus ?? "not started"} | dependsOn: ${join(op.dependsOn)} | files: ${join(op.files)} | implements: ${join([...(op.refObligations ?? []), ...(op.refElements ?? [])])} | knowledge: ${join((op.knowledgeReferences ?? []).map((kid) => `kid ${kid}`))}` +
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
    out.push("", `Read every document above before judging: call knowledge-read with these file ids (CLI: --fileIds ${ids}) and follow its parts.`);
  }
  out.push("");
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
    out.push("- mechanisms (failure arms, contracts, files and decisions under Operations and Decisions):");
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
  out.push("# Operations", "");
  for (const op of p.operations.filter((o) => addressing.has(o.id))) {
    const files = new Set(op.files ?? []);
    out.push(`## "${oneLine(op.operation)}" (${lower(op.kind)})`);
    const arms = failureArms(op);
    out.push("- failure arms:");
    if (arms.length === 0) out.push("  - none");
    for (const arm of arms) out.push(`  - ${arm}`);
    const contracts = p.contracts.filter((c) => files.has(c.file));
    out.push("- contracts:");
    if (contracts.length === 0) out.push("  - none");
    for (const c of contracts) out.push(`  - ${oneLine(c.promises)} | signature: ${oneLine(c.signature)}`);
    const fsRows = p.filesystem.files.filter((f) => files.has(f.path));
    out.push("- files:");
    if (fsRows.length === 0) out.push("  - none");
    for (const f of fsRows) out.push(`  - ${f.path} (${lower(f.status)}): ${oneLine(f.change)}`);
    out.push("");
  }
  const operationName = new Map(p.operations.map((op) => [op.id, `"${oneLine(op.operation)}"`]));
  const decisions = design.decisions.filter((d) => (d.realizedIn ?? []).some((r) => addressing.has(r)));
  out.push("# Decisions", "");
  if (decisions.length === 0) out.push("- none");
  for (const d of decisions) {
    const chosen = d.options.find((o) => o.chosen);
    const realizedIn = (d.realizedIn ?? []).filter((r) => addressing.has(r)).map((r) => operationName.get(r));
    out.push(`- ${oneLine(d.question)} → ${oneLine(chosen?.text)} | realized in: ${realizedIn.join(", ")}`);
  }
  out.push("");
  return `${out.join("\n")}`;
}

// The implementor's projection (captured shape): the file references split by scope, then the contracts, the
// public APIs, the filesystem and the decisions, without any operation, obligation or knowledge reference. The
// operations arrive one at a time from design-implementation-operation, so the future stays masked.
export function implementationContext(design) {
  const out = [`# DESIGN SNAPSHOT — ${design.path.title || "(untitled)"}`];
  for (const [heading, scope] of [["File references for the code", "Production"], ["File references for the tests", "Test"]]) {
    const rows = design.fileReferences.filter((fr) => (fr.scope ?? "Production") === scope);
    if (scope === "Test") out.push("");
    out.push(`## ${heading}`, ...(rows.length ? rows.map(fileReferenceLine) : ["- (none)"]));
  }
  contractsSection(design, out);
  filesystemSection(design, out);
  decisionsSection(design, out);
  return `${out.join("\n")}\n`;
}

// One served operation, with the text of every knowledge reference it declares already expanded.
export function servedOperation(op, { weight, authorisation, knowledge, note }) {
  const out = [`# Operation ${op.id} — ${oneLine(op.operation)}`];
  if (note) out.push(note);
  out.push(`- kind: ${op.kind} | weight: ${weight} | authorisation: ${authorisation}`);
  out.push(`- dependsOn: ${join(op.dependsOn)} | files: ${join(op.files)} | implements: ${join([...(op.refObligations ?? []), ...(op.refElements ?? [])])}`);
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
