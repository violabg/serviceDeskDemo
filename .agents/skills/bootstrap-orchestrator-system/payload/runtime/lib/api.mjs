// THE runtime contract: one handler per runtime capability token (system/canonical/capabilities.yaml).
// A handler receives the context, the upstream argument object and the caller ({ role }), and returns the
// response text, or { output, exitCode } for a structured refusal. Adapters (the CLI today, an MCP server if ever needed)
// only translate transport around this table and hold no logic of their own.
import { join } from "node:path";
import * as codebase from "./codebase.mjs";
import * as design from "./design.mjs";
import * as documentation from "./documentation.mjs";
import * as knowledge from "./knowledge.mjs";
import { bounded, storedPart } from "./responses.mjs";
import * as session from "./session.mjs";
import { arg, linedJson, withLock } from "./util.mjs";
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
  "design-knowledge-references": (ctx, args) => design.knowledgeReferences(ctx, args),
  "design-overview": (ctx, args) => design.overview(ctx, args),
  "design-submit": (ctx, args) => design.submit(ctx, args),
  "design-checks": (ctx, args) => design.checksTool(ctx, args),
  "design-snapshot": (ctx, args) => design.snapshotTool(ctx, args),
  "design-verification-view": (ctx, args) => design.verificationViewTool(ctx, args),
  "design-implementation-context": (ctx, args) => design.implementationContextTool(ctx, args),
  "design-implementation-operation": (ctx, args) => design.implementationOperation(ctx, args),
  "design-implementation-operation-close": (ctx, args) => design.implementationOperationClose(ctx, args),
  "design-document": (ctx, args) => design.documentTool(ctx, args),
  "design-approve": (ctx, args) => design.approve(ctx, args),
  "design-operation-status": (ctx, args) => design.operationStatus(ctx, args),
  "design-iteration-open": (ctx, args) => design.iterationOpen(ctx, args),
  "design-iteration-close": (ctx, args) => design.iterationClose(ctx, args),

  "knowledge-catalog": (ctx) => knowledge.catalog(ctx),
  "knowledge-read": (ctx, args, caller) => knowledge.read(ctx, args, caller),
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
  "design-knowledge-references",
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

// The arguments each token accepts (the upstream contract: an unknown property applies nothing and is an
// error). Names compare case-insensitively, as `arg` reads them. null: the handler takes free-form text.
const SESSION = ["sessionId"];
const JOB = ["sessionId", "jobId"];
const FRONT_MATTER = ["artifactFrontMatter", "name", "artifactName", "description", "intendedUse", "intended_use", "use", "mimeType", "mime_type", "origin"];
export const ARGUMENTS = {
  "session-list": [],
  "session-activate": SESSION,
  "session-memory-read": SESSION,
  "session-memory-append": null,
  "session-event-log": null,
  "session-artifact-write": [...SESSION, ...FRONT_MATTER, "content", "contentFile"],
  "session-artifact-read": [...SESSION, "artifact", "artifactId", "artifactName", "name"],
  "session-artifact-list": SESSION,
  "session-image-attach": [...SESSION, ...FRONT_MATTER, "blobUrl"],
  "session-execution-report-read": SESSION,
  "workflow-types-list": [],
  "workflow-job-activate": [...JOB, "agentName", "designId", "workflowType"],
  "workflow-step-pending": [...JOB, "part"],
  "workflow-step-next": JOB,
  "design-checks": [...JOB, "acceptExternalEdit"],
  "design-snapshot": [...JOB, "part", "revision", "section", "ids"],
  "design-verification-view": [...JOB, "part", "revision"],
  "design-implementation-context": [...JOB, "part", "revision"],
  "design-implementation-operation": [...JOB, "operationId", "id", "part"],
  "design-implementation-operation-close": JOB,
  "design-document": JOB,
  "knowledge-catalog": [],
  "knowledge-read": [...SESSION, "fileIds", "fileId", "ids", "id", "part"],
  "knowledge-create": ["title", "content", "tier", "folder", "keywords", "intent"],
  "knowledge-update": ["fileId", "fileIds", "id", "ids", "content", "intent"],
  "knowledge-index-rebuild": [],
  "codebase-clusters": ["WorkspacePath", "fileExtension"],
  "codebase-cluster-files": ["WorkspacePath", "fileExtension", "clusterName"],
  "documentation-templates-list": ["templatesDirectory"],
  "documentation-template-read": ["templateNameOrPath"],
  "documentation-check": ["templateNameOrPath", "outputFile", "outputContent", "mode"],
};
// Agents learn the design envelope and send it to every token, so its fields are never unknown: `sessionId`
// and `jobId` are ignored where they mean nothing, and `request` is unwrapped. A design operation checks its own
// arguments, because it also says which field belongs inside `request`.
function unknownArguments(token, args) {
  const allowed = ARGUMENTS[token];
  if (allowed === null || allowed === undefined) return null;
  const known = new Set([...allowed, ...JOB, "request"].map((name) => name.toLowerCase()));
  const unknown = Object.keys(args ?? {}).filter((name) => !known.has(name.toLowerCase()));
  if (!unknown.length) return null;
  return `${token} failed: unknown argument ${unknown.map((name) => `'${name}'`).join(", ")}. Nothing was applied. Arguments: ${allowed.join(", ") || "none"}.`;
}

// A role runs only the tokens its contract names (`roles` in the runtime config, rendered by Bootstrap). The
// roles are named by the agents themselves, so this stops a wrong call, not a hostile one; the client's own tool
// limits are the stronger layer where it has them. Without a table, nothing is restricted.
export function roleRefusal(ctx, role, token) {
  if (role === undefined || !ctx.roles || !handlers[token]) return null;
  const tokens = ctx.roles[role];
  if (!tokens) return `unknown role '${role}'. Roles: ${Object.keys(ctx.roles).join(", ")}.`;
  if (tokens.includes(token)) return null;
  return `'${token}' is not available to the ${role} role, and nothing was applied. Its runtime commands: ${tokens.join(", ") || "none"}.`;
}

// The neutral operations a role runs with its client's own tools (conversion.yaml `valid_operations` minus
// `runtime`). Agents send them here when they read `#operation:<op>` as a runtime token.
const HOST_OPERATIONS = new Set(["read", "search", "write", "terminal", "question", "delegate"]);

// The capability tokens a client binds to its own tools (`kind: host` in capabilities.yaml, the operations above aside).
const CLIENT_TOOLS = new Set(["visual-evidence", "work-item-retrieval", "work-item-type-retrieval", "work-item-batch-retrieval", "work-item-comment-retrieval", "work-item-create", "work-item-update", "wiki-catalog-read", "wiki-page-list", "wiki-page-read"]);

// An unknown token is a wrong call, never a missing runtime: the answer says so, or agents halt on the
// availability guard.
function unknownCommand(token) {
  const commands = `Runtime commands: ${Object.keys(handlers).join(", ")}`;
  if (HOST_OPERATIONS.has(token)) {
    const how = token === "question" ? "ask the user with your client's own question tool" : `use your client's own tool for \`#operation:${token}\``;
    return `'${token}' is not a runtime command: it is a host operation, so ${how} (the Bindings section of your role file names it). The runtime is installed and working; this is not a runtime outage. ${commands}`;
  }
  if (CLIENT_TOOLS.has(token)) {
    return `'${token}' is not a runtime command: it is a client tool, bound in your role file or in the prompt that started you. The runtime is installed and working; this is not a runtime outage.`;
  }
  return `unknown command '${token}'. The runtime is installed and working; this is not a runtime outage. ${commands}. \`--help\` alone lists the arguments of every command.`;
}

// Runs one token and normalizes the result to { output, exitCode }, never longer than the part limit: `caller.role`
// is the role named by the adapter, and `responseId` serves a part of an earlier long response without running
// the operation again (contracts/workflow-loop.md, Parts).
export async function call(ctx, token, args = {}, caller = {}) {
  const handler = handlers[token];
  if (!handler) return { output: unknownCommand(token), exitCode: 2 };
  if (arg(args, "responseId") !== undefined) return storedPart(ctx, token, args);
  const refused = unknownArguments(token, args);
  if (refused) return { output: refused, exitCode: 1 };
  try {
    // A design call reads, changes and seals design.json: parallel design-submit calls run one after the other.
    const run = () => handler(ctx, unwrapRequest(token, args), caller);
    const result = await (token.startsWith("design-") ? withLock(join(ctx.runtimeRoot, ".design-lock"), run) : run());
    return bounded(ctx, token, typeof result === "string" ? { output: result, exitCode: 0 } : result);
  } catch (error) {
    if (error && "payload" in error) {
      return bounded(ctx, token, { output: error.payload ? linedJson(error.payload) : error.message, exitCode: 1 });
    }
    throw error;
  }
}
