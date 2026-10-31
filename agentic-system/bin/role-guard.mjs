#!/usr/bin/env node
// A client hook for a role whose only terminal use is the runtime: it allows one runtime command the role may
// run and blocks every other shell command. Input: the hook's JSON on stdin ({ tool_input: { command } }).
// Exit 2 blocks the call and shows the reason to the agent (contracts/workflow-loop.md, Roles).
//
//   node role-guard.mjs <role>
import { readFileSync } from "node:fs";
import { createContext } from "../lib/context.mjs";

function refusal(role, command, roles) {
  const tokens = roles?.[role];
  if (!tokens) return `no runtime commands are recorded for the role '${role}'`;
  const match = /^node\s+"?[^\s";&|]*agentic-system\.mjs"?\s+([a-z-]+)(\s[^;&|`$<>\n]*)?$/.exec(command.trim());
  if (!match) return "this role may only run one runtime command at a time, with nothing chained, piped or redirected";
  if (!tokens.includes(match[1])) return `'${match[1]}' is not available to the ${role} role. Its runtime commands: ${tokens.join(", ")}`;
  return null;
}

const role = process.argv[2];
const input = JSON.parse(readFileSync(0, "utf8") || "{}");
const reason = refusal(role, String(input.tool_input?.command ?? ""), createContext().roles);
if (reason) {
  console.error(`Blocked: ${reason}.`);
  process.exit(2);
}
