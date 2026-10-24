#!/usr/bin/env node
// Installs the orchestrator agentic system into a target repository from an answers file. Zero dependencies.
//
//   node install.mjs plan  [--repo <dir>] [--answers <file>] [--json]
//   node install.mjs apply [--repo <dir>] [--answers <file>] [--take <path>]... [--keep <path>]...
//   node install.mjs check [--repo <dir>] [--answers <file>] [--json]
//   node install.mjs show  <path> [--repo <dir>] [--answers <file>]     print the new render of one output
//
// --repo defaults to the current directory; --answers to <maintenance root>/answers.json under the repo
// (default maintenance root .agentic-system-maintenance). plan and check never write.
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { normalizeAnswers } from "./lib/answers.mjs";
import { loadKit } from "./lib/kit.mjs";
import { apply, check, plan } from "./lib/plan.mjs";
import { render } from "./lib/render.mjs";
import { InstallError, readJson } from "./lib/util.mjs";

function parse(argv) {
  const [command, ...rest] = argv;
  const options = { command, take: [], keep: [], json: false, positional: [] };
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--json") options.json = true;
    else if (["--repo", "--answers", "--take", "--keep"].includes(arg)) {
      const value = rest[++i];
      if (value === undefined) throw new InstallError(`${arg} needs a value`);
      if (arg === "--take" || arg === "--keep") options[arg.slice(2)].push(value);
      else options[arg.slice(2)] = value;
    } else if (arg.startsWith("--")) throw new InstallError(`unknown option ${arg}`);
    else options.positional.push(arg);
  }
  return options;
}

function summary(entries) {
  const counts = {};
  for (const e of entries) counts[e.action] = (counts[e.action] ?? 0) + 1;
  return Object.entries(counts).map(([action, n]) => `${n} ${action}`).join(", ");
}

function print(result, { json, problems }) {
  if (json) {
    const entries = result.entries.map(({ path, action, reason, kind, envs, scope }) => ({ path, action, reason, kind, envs, scope }));
    console.log(JSON.stringify({ entries, errors: result.errors, warnings: result.warnings, problems }, null, 2));
    return;
  }
  for (const e of result.entries) {
    if (e.action === "unchanged") continue;
    console.log(`${e.action.padEnd(9)} ${e.path}${e.envs?.length ? `  [${e.envs.join(", ")}]` : ""}${e.scope === "user" ? "  (user folder)" : ""}${e.reason ? `\n          ${e.reason}` : ""}`);
  }
  for (const w of result.warnings) console.log(`warning   ${w}`);
  for (const err of result.errors) console.log(`error     ${err}`);
  if (problems) for (const p of problems) console.log(`problem   ${p}`);
  console.log(`\n${summary(result.entries) || "nothing to do"}`);
}

function main() {
  const options = parse(process.argv.slice(2));
  const repo = resolve(options.repo ?? process.cwd());
  const kit = loadKit();
  const answersFile = resolve(options.answers ?? join(repo, ".agentic-system-maintenance", "answers.json"));
  if (!existsSync(answersFile)) throw new InstallError(`answers file not found: ${answersFile}`);
  const answers = normalizeAnswers(readJson(answersFile), kit.profiles);

  switch (options.command) {
    case "plan": {
      const result = plan(kit, answers, repo);
      print(result, options);
      return result.errors.length ? 1 : 0;
    }
    case "apply": {
      const result = apply(kit, answers, repo, options);
      print(result, options);
      return 0;
    }
    case "check": {
      const result = check(kit, answers, repo);
      print(result, { ...options, problems: result.problems });
      return result.problems.length ? 1 : 0;
    }
    case "show": {
      const path = options.positional[0];
      const output = render(kit, answers).outputs.find((o) => o.path === path);
      if (!output) throw new InstallError(`${path} is not rendered by this answers file`);
      process.stdout.write(output.content ?? `${JSON.stringify(output.add, null, 2)}\n`);
      return 0;
    }
    default:
      throw new InstallError("usage: node install.mjs <plan|apply|check|show> [--repo <dir>] [--answers <file>]");
  }
}

try {
  process.exitCode = main();
} catch (error) {
  if (!(error instanceof InstallError)) throw error;
  console.error(error.message);
  process.exitCode = 2;
}
