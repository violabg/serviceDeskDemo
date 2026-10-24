// Workflow loop: workflow types, jobs, and step serving (contracts/workflow-loop.md).
// The runtime is the only clock: it serves one instruction at a time and never shows a future step.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createDesign, designExists } from "./design-store.mjs";
import { readArtifactBody, requireSession } from "./session.mjs";
import { RuntimeError, arg, iso, readJson, requireId, requireString, writeJson } from "./util.mjs";

// workflow-types.yaml is generated with a fixed, simple shape; this reader accepts exactly that shape.
export function loadWorkflowTypes(ctx) {
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

export function jobPath(ctx, sessionId, jobId) {
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

export function saveJob(ctx, job) {
  writeJson(jobPath(ctx, job.sessionId, job.jobId), job);
}

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
  } else if (workflowType === "DESIGN") {
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
    delegates: {},
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

export function stepPending(ctx, args) {
  const job = loadJob(ctx, args, "workflow-step-pending");
  if (job.currentStep === 0) {
    job.currentStep = 1;
    job.servedAt = { ...(job.servedAt ?? {}), 1: iso(ctx.now()) };
    saveJob(ctx, job);
  }
  return serve(ctx, job);
}

export function stepNext(ctx, args) {
  const job = loadJob(ctx, args, "workflow-step-next");
  if (job.currentStep === 0) throw new RuntimeError("workflow-step-next failed: request the first instruction with workflow-step-pending.");
  if (job.currentStep >= job.steps.length) {
    throw new RuntimeError(
      `workflow-step-next failed: the workflow is complete. Instruction ${job.steps.length}/${job.steps.length} was the final instruction; do not call workflow-step-next again.`,
    );
  }
  job.currentStep += 1;
  job.servedAt = { ...(job.servedAt ?? {}), [job.currentStep]: iso(ctx.now()) };
  saveJob(ctx, job);
  return serve(ctx, job);
}
