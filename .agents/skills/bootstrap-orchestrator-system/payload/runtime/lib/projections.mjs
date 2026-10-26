// Markdown projections of the design (contracts/projections.md). They are regenerated on every write.
import { placeholders, runChecks } from "./checks.mjs";
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
  out.push("", "## File references");
  for (const fr of design.fileReferences) {
    const details = (fr.files ?? []).map((file) => {
      const d = (fr.details ?? []).find((x) => x.path === file);
      return `${file} (why: ${oneLine(d?.why) || "(not recorded)"} | purpose: ${oneLine(d?.purpose) || "(not recorded)"})`;
    });
    out.push(`- ${fr.id} | symbol: ${fr.symbol} | files: ${details.join("; ") || "none"}`);
  }
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
  out.push("", "## Filesystem");
  if (p.filesystem.intro) out.push(oneLine(p.filesystem.intro));
  for (const f of p.filesystem.files) {
    out.push(`- ${f.id} | ${lower(f.status)} | ${f.path} | module: ${f.module ?? ""} | reason: ${oneLine(f.reason)} | change: ${oneLine(f.change)} | impact: ${oneLine(f.impact)}`);
  }
  out.push("", "## Operations");
  if (p.operationsIntro) out.push(oneLine(p.operationsIntro));
  for (const op of p.operations) {
    const arms = failureArms(op);
    out.push(
      `- ${op.id} | ${lower(op.kind)} | ${oneLine(op.operation)} | status: ${op.implementationStatus ?? "not started"} | dependsOn: ${join(op.dependsOn)} | files: ${join(op.files)} | implements: ${join([...(op.refObligations ?? []), ...(op.refElements ?? [])])}` +
        (op.source ? ` | source: ${op.source}${op.sourceRef ? ` (${oneLine(op.sourceRef)})` : ""}` : "") +
        ` | instructions: ${oneLine(op.instructions)}` +
        (arms.length ? ` | ${arms.join(" | ")}` : ""),
    );
  }
  out.push("", "## Decisions");
  for (const d of design.decisions) {
    const options = d.options.map((o) => `${o.id}${o.chosen ? " (chosen)" : ""}: ${oneLine(o.text)}`).join(" || ");
    out.push(
      `- ${d.id} | ${lower(d.source)} | blocking: ${Boolean(d.blocking)} | highlight: ${Boolean(d.highlight)} | topic: ${oneLine(d.topic)} | question: ${oneLine(d.question)} | context: ${oneLine(d.context)} | why: ${oneLine(d.why)} | how: ${oneLine(d.how)} | realizedIn: ${join(d.realizedIn)} | options: ${options}`,
    );
  }
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
