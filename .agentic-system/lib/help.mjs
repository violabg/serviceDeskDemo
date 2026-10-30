// `<token> --help`: the token's own definition, read from the runtime contracts, so an agent learns the
// arguments from the source of truth instead of guessing them.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { REQUEST_TOKENS } from "./api.mjs";

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
