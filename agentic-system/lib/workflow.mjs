// Workflow loop: workflow types, jobs, and step serving (contracts/workflow-loop.md).
// The runtime is the only clock: it serves one instruction at a time and never shows a future step.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createDesign, designExists } from "./design-store.mjs";
import { readArtifactBody, requireSession } from "./session.mjs";
import { RuntimeError, arg, iso, jobFlags, readJson, requireId, requireString, servePart, writeJson } from "./util.mjs";

// workflow-types.yaml is generated with a fixed, simple shape; this reader accepts exactly that shape.
function loadWorkflowTypes(ctx) {
  const path = join(ctx.workflowsRoot, "workflow-types.yaml");
  if (!existsSync(path)) throw new RuntimeError(`workflow files are missing: ${path}`);
  const types = [];
  let current = null;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    let match;
    if ((match = line.match(/^ {2}- id: (\S+)$/))) types.push((current = { id: match[1], steps: [] }));
    else if (current && (match = line.match(/^ {4}(name|description): (.+)$/))) current[match[1]] = JSON.parse(match[2]);
    else if (current && (match = line.match(/^ {6}- (\S+)$/))) current.steps.push(match[1]);
  }
  return types;
}

export function workflowTypesList(ctx) {
  const lines = loadWorkflowTypes(ctx).map((t) => `- ${t.id}: ${t.name}. ${t.description}`);
  return `Available workflow types:\n${lines.join("\n")}`;
}

function jobPath(ctx, sessionId, jobId) {
  return join(ctx.sessionsRoot, sessionId, "jobs", `${jobId}.json`);
}

export function loadJob(ctx, args, tool) {
  const sessionId = arg(args, "sessionId");
  requireSession(ctx, sessionId, tool);
  const jobId = requireId(arg(args, "jobId"), "jobId", tool);
  const job = readJson(jobPath(ctx, sessionId, jobId), null);
  if (!job) throw new RuntimeError(`${tool} failed: job '${jobId}' does not exist in session '${sessionId}'. Activate it with workflow-job-activate.`);
  return job;
}

function saveJob(ctx, job) {
  writeJson(jobPath(ctx, job.sessionId, job.jobId), job);
}

// A DESIGN job builds its design; a FAST_IMPLEMENTATION job keeps its obligations, open points and knowledge
// references in a job design of its own, with no approval gate. DOCUMENTATION jobs have none.
const JOB_DESIGN_WORKFLOWS = new Set(["DESIGN", "FAST_IMPLEMENTATION"]);

export function jobActivate(ctx, args) {
  const tool = "workflow-job-activate";
  const sessionId = arg(args, "sessionId");
  requireSession(ctx, sessionId, tool);
  const jobId = requireId(arg(args, "jobId"), "jobId", tool);
  const workflowType = requireString(arg(args, "workflowType"), "workflowType", tool);
  const type = loadWorkflowTypes(ctx).find((t) => t.id === workflowType);
  if (!type) {
    throw new RuntimeError(`${tool} failed: unknown workflowType '${workflowType}'. Call workflow-types-list and ask the developer which workflow to start.`);
  }
  const requestedDesign = arg(args, "designId");
  const existing = readJson(jobPath(ctx, sessionId, jobId), null);
  if (existing) {
    if (existing.workflowType !== workflowType) {
      throw new RuntimeError(`${tool} failed: job '${jobId}' already runs ${existing.workflowType}; start a new job for ${workflowType}.`);
    }
    return `Agent job resumed;\nJobId: ${jobId}\nDesignId: ${existing.designId ?? "<none>"}\nCurrent instruction: ${existing.currentStep}/${existing.steps.length}`;
  }
  let designId = null;
  if (requestedDesign) {
    requireId(requestedDesign, "designId", tool);
    if (!designExists(ctx, sessionId, requestedDesign)) throw new RuntimeError(`${tool} failed: design '${requestedDesign}' does not exist in session '${sessionId}'.`);
    designId = requestedDesign;
  } else if (JOB_DESIGN_WORKFLOWS.has(workflowType)) {
    designId = jobId;
    if (!designExists(ctx, sessionId, designId)) createDesign(ctx, sessionId, designId, jobId);
  }
  saveJob(ctx, {
    jobId,
    sessionId,
    agentName: arg(args, "agentName") ?? "orchestrator",
    workflowType,
    designId,
    steps: type.steps,
    currentStep: 0,
    createdAt: iso(ctx.now()),
  });
  return `Agent job created;\nJobId: ${jobId}\nDesignId: ${requestedDesign ?? "<none>"}`;
}

function serve(ctx, job) {
  const ref = job.steps[job.currentStep - 1];
  const path = join(ctx.workflowsRoot, `${ref}.md`);
  if (!existsSync(path)) throw new RuntimeError(`instruction file is missing: ${path}`);
  let text = `Instruction ${job.currentStep}/${job.steps.length}.\n${readFileSync(path, "utf8").trimEnd()}\n`;
  if (job.currentStep > 1) {
    const name = `user_instruction_register_${job.jobId}`;
    const register = readArtifactBody(ctx, job.sessionId, name);
    text += `\n---\n\n## ACTIVE USER INSTRUCTION REGISTER\n\n`;
    text += register === null ? `(no session artifact '${name}' exists: the register was never created)\n` : `${register.trimEnd()}\n`;
  }
  return text;
}

// A long instruction is served in parts that start at a paragraph. workflow-step-next always serves part 1;
// the rest of the same instruction comes from workflow-step-pending, which never advances the workflow.
function servePartOf(ctx, job, args, tool, caller) {
  return servePart(serve(ctx, job), args, {
    tool,
    limit: ctx.partLimit,
    starts: (line, previous) => line.trim() !== "" && previous !== undefined && previous.trim() === "",
    next: (k) => `call workflow-step-pending with part ${k} (CLI: ${jobFlags(job, caller)} --part ${k}) to read the rest of instruction ${job.currentStep}; it does not advance the workflow.`,
  });
}

export function stepPending(ctx, args, caller) {
  const job = loadJob(ctx, args, "workflow-step-pending");
  if (job.currentStep === 0) {
    job.currentStep = 1;
    saveJob(ctx, job);
  }
  return servePartOf(ctx, job, args, "workflow-step-pending", caller);
}

export function stepNext(ctx, args, caller) {
  const job = loadJob(ctx, args, "workflow-step-next");
  if (job.currentStep === 0) throw new RuntimeError("workflow-step-next failed: request the first instruction with workflow-step-pending.");
  if (job.currentStep >= job.steps.length) {
    throw new RuntimeError(
      `workflow-step-next failed: the workflow is complete. Instruction ${job.steps.length}/${job.steps.length} was the final instruction; do not call workflow-step-next again.`,
    );
  }
  job.currentStep += 1;
  saveJob(ctx, job);
  return servePartOf(ctx, job, { part: 1 }, "workflow-step-next", caller);
}
