// THE runtime contract: one handler per runtime capability token (system/canonical/capabilities.yaml).
// A handler receives the context and the upstream argument object, and returns the response text, or
// { output, exitCode } for a structured refusal. Adapters (the CLI today, an MCP server if ever needed)
// only translate transport around this table and hold no logic of their own.
import * as codebase from "./codebase.mjs";
import * as design from "./design.mjs";
import * as documentation from "./documentation.mjs";
import * as knowledge from "./knowledge.mjs";
import * as session from "./session.mjs";
import * as workflow from "./workflow.mjs";

export const handlers = {
  "session-list": (ctx) => session.sessionList(ctx),
  "session-activate": (ctx, args) => session.sessionActivate(ctx, args),
  "session-memory-read": (ctx, args) => session.memoryRead(ctx, args),
  "session-memory-append": (ctx, args) => session.memoryAppend(ctx, args),
  "session-event-log": (ctx, args) => session.eventLog(ctx, args),
  "session-artifact-write": (ctx, args) => session.artifactWrite(ctx, args),
  "session-artifact-read": (ctx, args) => session.artifactRead(ctx, args),
  "session-artifact-list": (ctx, args) => session.artifactList(ctx, args),
  "session-image-attach": (ctx, args) => session.imageAttach(ctx, args),
  "session-execution-report-read": (ctx, args) => session.executionReport(ctx, args),

  "workflow-types-list": (ctx) => workflow.workflowTypesList(ctx),
  "workflow-job-activate": (ctx, args) => workflow.jobActivate(ctx, args),
  "workflow-step-pending": (ctx, args) => workflow.stepPending(ctx, args),
  "workflow-step-next": (ctx, args) => workflow.stepNext(ctx, args),

  "design-obligations": (ctx, args) => design.rowTool(ctx, "design-obligations", args),
  "design-open-points": (ctx, args) => design.rowTool(ctx, "design-open-points", args),
  "design-file-references": (ctx, args) => design.rowTool(ctx, "design-file-references", args),
  "design-decisions": (ctx, args) => design.rowTool(ctx, "design-decisions", args),
  "design-overview": (ctx, args) => design.overview(ctx, args),
  "design-submit": (ctx, args) => design.submit(ctx, args),
  "design-schema": (ctx) => design.schemaTool(ctx),
  "design-checks": (ctx, args) => design.checksTool(ctx, args),
  "design-snapshot": (ctx, args) => design.snapshotTool(ctx, args),
  "design-verification-view": (ctx, args) => design.verificationViewTool(ctx, args),
  "design-document": (ctx, args) => design.documentTool(ctx, args),
  "design-approve": (ctx, args) => design.approve(ctx, args),
  "design-operation-status": (ctx, args) => design.operationStatus(ctx, args),
  "design-iteration-open": (ctx, args) => design.iterationOpen(ctx, args),
  "design-iteration-close": (ctx, args) => design.iterationClose(ctx, args),

  "knowledge-catalog": (ctx) => knowledge.catalog(ctx),
  "knowledge-read": (ctx, args) => knowledge.read(ctx, args),
  "knowledge-create": (ctx, args) => knowledge.create(ctx, args),
  "knowledge-update": (ctx, args) => knowledge.update(ctx, args),
  "knowledge-index-rebuild": (ctx) => knowledge.rebuild(ctx),

  "codebase-clusters": (ctx, args) => codebase.clusters(ctx, args),
  "codebase-cluster-files": (ctx, args) => codebase.clusterFiles(ctx, args),

  "documentation-templates-list": (ctx, args) => documentation.listTemplates(ctx, args),
  "documentation-template-read": (ctx, args) => documentation.readTemplate(ctx, args),
  "documentation-check": (ctx, args) => documentation.checkDocument(ctx, args),
};

// The design operations whose arguments are { sessionId, jobId, request }. Every other token takes its
// arguments at the top level.
export const REQUEST_TOKENS = new Set([
  "design-obligations",
  "design-open-points",
  "design-file-references",
  "design-decisions",
  "design-overview",
  "design-submit",
  "design-approve",
  "design-operation-status",
  "design-iteration-open",
  "design-iteration-close",
]);

// Agents learn the design envelope and send it to every token. For a token without a request, the fields
// inside `request` are read as top-level arguments (a top-level value wins), instead of being ignored.
function unwrapRequest(token, args) {
  const request = args?.request;
  if (REQUEST_TOKENS.has(token) || !request || typeof request !== "object" || Array.isArray(request)) return args;
  const { request: _, ...rest } = args;
  return { ...request, ...rest };
}

// The neutral operations a role runs with its client's own tools (conversion.yaml `valid_operations` minus
// `runtime`). Agents send them here when they read `#operation:<op>` as a runtime token.
export const HOST_OPERATIONS = new Set(["read", "search", "write", "terminal", "question", "delegate"]);

// An unknown token is a wrong call, never a missing runtime: the answer says so, or agents halt on the
// availability guard.
function unknownCommand(token) {
  const commands = `Runtime commands: ${Object.keys(handlers).join(", ")}`;
  if (HOST_OPERATIONS.has(token)) {
    const how = token === "question" ? "ask the user with your client's own question tool" : `use your client's own tool for \`#operation:${token}\``;
    return `'${token}' is not a runtime command: it is a host operation, so ${how} (the Bindings section of your role file names it). The runtime is installed and working; this is not a runtime outage. ${commands}`;
  }
  return `unknown command '${token}'. The runtime is installed and working; this is not a runtime outage. ${commands}`;
}

// Runs one token and normalizes the result to { output, exitCode }.
export async function call(ctx, token, args = {}) {
  const handler = handlers[token];
  if (!handler) return { output: unknownCommand(token), exitCode: 2 };
  try {
    const result = await handler(ctx, unwrapRequest(token, args));
    return typeof result === "string" ? { output: result, exitCode: 0 } : result;
  } catch (error) {
    if (error && "payload" in error) {
      return { output: error.payload ? JSON.stringify(error.payload, null, 2) : error.message, exitCode: 1 };
    }
    throw error;
  }
}
