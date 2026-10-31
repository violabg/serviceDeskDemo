// `<token> --help`: the token's own definition, read from the runtime contracts, so an agent learns the
// arguments from the source of truth instead of guessing them.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ARGUMENTS, REQUEST_TOKENS, handlers } from "./api.mjs";

const usage = (token) => `usage: node agentic-system.mjs ${token} [--json <file>|-] [--<argument> <value> ...]`;

// The `## <token>` section of a contract, or else the paragraph that defines the token
// (`#capability:<token>` or `<token>` followed by " —", or a paragraph that lists it among others).
function definition(text, token) {
  const lines = text.split("\n");
  const heading = lines.findIndex((l) => l.trim() === `## ${token}`);
  if (heading !== -1) {
    const end = lines.findIndex((l, i) => i > heading && /^## /.test(l));
    return lines.slice(heading, end === -1 ? undefined : end).join("\n").trim();
  }
  const paragraphs = text.split(/\n\s*\n/);
  const defines = new RegExp(`^\`(#capability:)?${token}\` —`);
  return (
    paragraphs.find((p) => defines.test(p.trim())) ??
    paragraphs.find((p) => p.split("\n")[0].includes(`\`#capability:${token}\``))
  )?.trim();
}

// The fields of `request` for each design operation that takes one, read from the request schema.
const REQUEST_DEFS = {
  "design-obligations": "rowRequest",
  "design-open-points": "rowRequest",
  "design-file-references": "rowRequest",
  "design-decisions": "rowRequest",
  "design-knowledge-references": "knowledgeReferencesRequest",
  "design-overview": "overview",
  "design-approve": "approve",
  "design-operation-status": "operationStatus",
  "design-iteration-open": "iterationOpen",
  "design-iteration-close": "iterationClose",
};

function requestFields(ctx, token) {
  const schema = JSON.parse(readFileSync(join(ctx.assetsRoot, "design-requests.schema.json"), "utf8"));
  const def = token === "design-submit" ? schema.properties.request : schema.$defs[REQUEST_DEFS[token]];
  return Object.keys(def?.properties ?? {});
}

// One line per command with the arguments it accepts (from `ARGUMENTS` and the request schema), so an agent learns
// every command's arguments in one call, or from its role file, instead of one `--help` call per command.
export function commandArguments(ctx, role) {
  const allowed = role ? ctx.roles?.[role] : null;
  const tokens = Object.keys(handlers).filter((token) => !allowed || allowed.includes(token));
  return tokens.map((token) => {
    if (REQUEST_TOKENS.has(token)) {
      const extra = token === "design-obligations" ? ", outline" : "";
      return `${token}: sessionId, jobId, request { ${requestFields(ctx, token).join(", ")} }${extra}`;
    }
    const list = ARGUMENTS[token];
    if (list === null) return `${token}: sessionId, and the text under any field name`;
    return `${token}: ${list?.length ? list.join(", ") : "no arguments"}`;
  });
}

export function commandsHelp(ctx, role) {
  return [
    "usage: node agentic-system.mjs <command> [--json <file>|-|'<inline JSON>'] [--<argument> <value> ...]",
    "       node agentic-system.mjs <command> --help   (one command's full definition, from its contract)",
    "",
    "commands and their arguments:",
    ...commandArguments(ctx, role).map((line) => `  ${line}`),
  ].join("\n");
}

export function tokenHelp(ctx, token) {
  const shape = REQUEST_TOKENS.has(token)
    ? 'Arguments: { "sessionId", "jobId", "request": { ... } }; the fields below go inside request.'
    : "Arguments are top-level: never wrap them in request.";
  const root = ctx.contractsRoot;
  const files = existsSync(root) ? readdirSync(root).filter((f) => f.endsWith(".md")).sort() : [];
  for (const file of files) {
    const found = definition(readFileSync(join(root, file), "utf8"), token);
    if (found) return `${usage(token)}\n${shape}\n\nFrom ${join(root, file)}:\n\n${found}\n`;
  }
  return `${usage(token)}\n${shape}\n\nNo contract section defines ${token}; read the contracts in ${root}.\n`;
}
