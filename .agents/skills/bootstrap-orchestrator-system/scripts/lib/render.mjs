// Renders every target file from the payload, the client profiles and the answers. Pure: reads the kit, never the target.
import { join } from "node:path";
import { bindingFor, isLocalTracker, slotValues } from "./answers.mjs";
import { agentFile, enforcesTools, permissionOutput } from "./formats.mjs";
import { fillSlots, isOutside, readText, runtimeRelative, splitFrontmatter, yamlFrontmatter } from "./util.mjs";

const operationNames = { read: "read files", search: "search files", write: "write files", terminal: "run terminal commands", question: "ask the user", runtime: "run the runtime command" };

export function render(kit, answers) {
  const { index } = kit;
  const payload = (path) => readText(join(kit.payloadDir, path));
  const base = slotValues(answers);
  const rt = answers.locations.runtimeRoot;
  const runtimeCommand = fillSlots(index.runtimeCommand, base);
  const outsidePaths = [answers.locations.sessionsRoot].filter(isOutside);
  const outputs = [];
  const errors = [];
  const warnings = [];
  const add = (output) => outputs.push({ scope: "repo", customizable: false, mode: "file", envs: [], ...output });
  const enabled = (skill) => !["skip", "defer"].includes(answers.skills[skill.name]);

  for (const env of answers.environments) {
    const { profile } = env;
    const slots = { ...base, AGENT_ROOT: profile.agents.dir, SKILL_ROOT: profile.skills.dir };
    const nativeName = (role) => `${answers.prefix}${role}`;
    // A skill's installed name: env.skillSuffix tells this client's system skills apart from another client's in a shared discovery folder.
    const skillName = (name) => `${name}${env.skillSuffix}`;
    const skillNames = [...index.skills.map((s) => s.name), ...(env.route === "skill" ? index.roles.filter((r) => r.invocation === "user").map((r) => nativeName(r.name)) : [])];
    const suffixMentions = (text) => (env.skillSuffix ? skillNames.reduce((out, name) => out.replaceAll(`\`${name}\``, `\`${skillName(name)}\``), text) : text);
    const delegates = index.roles.filter((r) => r.invocation === "delegate");

    const delegationText = () => {
      const map = delegates.map((r) => `\`${r.name}\` → \`${nativeName(r.name)}\``);
      const general = profile.delegation.generalPurpose
        ? `\`general-purpose\` → the built-in \`${profile.delegation.generalPurpose}\` agent`
        : "`general-purpose` → the client's default subagent (name no agent)";
      const how =
        env.delegation === "subprocess"
          ? `Start each delegate as a separate process with \`${profile.delegation.subprocess}\`: its prompt first tells it to read and follow the role's file under \`${profile.agents.dir}\` as its complete instructions, then carries the prompt the step gives, unchanged. The process output is the report. A process cannot be resumed: re-run the same role with the complete correction prompt, as the step's arm for a host without resume says.`
          : profile.delegation.native.replaceAll("{name}", nativeName("code-implementor"));
      return `${how} Role names here: ${[...map, general].join("; ")}. A delegate sees only its own file, not this section: when the prompt you pass names a \`#capability:<token>\` its file does not bind (always the case for \`general-purpose\`), append that token's line from this section to the prompt.`;
    };

    const bindingsSection = (tokens, role) => {
      const lines = ["", "## Bindings", "", `Installed for ${profile.label}. This is how each \`#capability:<token>\` in this file runs here.`, ""];
      const runtimeTokens = tokens.filter((t) => index.tokens[t]?.kind === "runtime");
      if (runtimeTokens.length || role?.operations.includes("runtime")) {
        lines.push(`- Runtime operations: run \`${runtimeCommand} <token>\` from the repository root, where \`<token>\` is the capability name; pass large payloads with \`--json <file>\`. The JSON payload is the operation's argument object, defined in \`${rt}/contracts/\`: design operations take \`{ "sessionId", "jobId", "request": { ... } }\`, and fields such as \`operation\`, \`rows\` and \`ids\` go inside \`request\`; every other operation takes its arguments at the top level, and \`${runtimeCommand} <token> --help\` prints them. A long answer arrives in parts: when it ends with \`[part N of M. The answer continues: …]\`, make the call it names and read every part before acting on any of it; never cut an answer with \`head\`, \`tail\` or a byte count. The runtime is required; when it cannot run, follow the procedure its contract under \`${rt}/contracts/\` gives and record that the gate ran instruction-only.`);
      }
      for (const token of tokens.filter((t) => index.tokens[t]?.kind === "host")) {
        if (token === "delegate") {
          lines.push(`- \`#capability:delegate\`: ${delegationText()}`);
          continue;
        }
        const binding = bindingFor(env, token);
        if (!binding) errors.push(`${env.id}: no binding for #capability:${token} (add it to answers.environments[].bindings, or { "none": "<reason>" })`);
        else if (binding.none) lines.push(`- \`#capability:${token}\`: not available in this repository (${binding.none}). Skip any step that needs it and say so.`);
        else lines.push(`- \`#capability:${token}\`: ${binding.text}`);
      }
      if (role) {
        const granted = role.operations.map((op) => operationNames[op]).join(", ");
        const enforced = enforcesTools(env) && (role.invocation === "delegate" || env.route === "native");
        lines.push(`- Tool limits: this role may ${granted || "use no file or terminal tools"}${role.delegates.length ? ", and start its delegates" : ""}. ${enforced ? "The client enforces the tool list in this file." : "The client does not enforce them here, so they are instructions: stay within them."}`);
        if (role.operations.includes("runtime") && !role.operations.includes("terminal")) lines.push("- Use the terminal only to run the runtime command above.");
      }
      return lines.length > 5 ? `${lines.join("\n")}\n` : "";
    };

    const toolsFor = (role) => {
      const tools = new Set();
      for (const op of role.operations) for (const tool of profile.tools[op] ?? []) tools.add(tool);
      if (role.delegates.length) for (const tool of profile.tools.delegate ?? []) tools.add(tool);
      for (const token of role.tokens) for (const tool of bindingFor(env, token)?.tools ?? []) tools.add(tool);
      for (const tool of env.roleTools[role.name] ?? []) tools.add(tool);
      return [...tools];
    };

    const manualOnly = (skillDir) => {
      const rule = profile.skills.manualOnly;
      if (!rule) {
        warnings.push(`${env.id}: ${profile.label} cannot prevent automatic skill invocation; record the gap`);
        return { frontmatter: {}, extra: [] };
      }
      return {
        frontmatter: rule.frontmatter ?? {},
        extra: rule.file ? [{ path: `${skillDir}/${rule.file.path}`, content: rule.file.content }] : [],
      };
    };

    if (env.route === "skill") {
      for (const role of Object.keys(env.roleTools)) {
        if (index.roles.find((r) => r.name === role)?.invocation === "user") warnings.push(`${env.id}: roleTools for ${role} have no tool list to go in on the skill route; make those tools available at client level and record it`);
      }
    }

    for (const role of index.roles) {
      const body = fillSlots(splitFrontmatter(payload(role.file)).body, slots) + bindingsSection(role.tokens, role);
      const isDelegate = role.invocation === "delegate";
      if (isDelegate || env.route === "native") {
        const file = agentFile(env, {
          role,
          name: nativeName(role.name),
          description: role.description,
          body,
          tools: toolsFor(role),
          delegates: role.delegates.map((d) => (d === "general-purpose" ? profile.delegation.generalPurpose : nativeName(d))).filter(Boolean),
          isDelegate,
          runtimeCommand,
        });
        add({ ...file, kind: isDelegate ? "delegate" : "role", envs: [env.id] });
      } else {
        const dir = `${profile.skills.dir}/${skillName(nativeName(role.name))}`;
        const rule = manualOnly(dir);
        const intro = `# ${skillName(nativeName(role.name))}\n\nThis skill starts the \`${role.name}\` role in this conversation. If this conversation already runs a role, stop and tell the user to open a new conversation. Otherwise the contract below is your complete role for the rest of the conversation: it governs every step, halt point and session operation, and the client's own defaults, such as its memory feature, never replace a contract operation.\n\n`;
        add({
          path: `${dir}/SKILL.md`,
          kind: "role-skill",
          envs: [env.id],
          content: yamlFrontmatter({ name: skillName(nativeName(role.name)), description: `Start the ${role.name} role. ${role.description}`, ...rule.frontmatter }) + intro + body,
        });
        for (const extra of rule.extra) add({ ...extra, kind: "role-skill", envs: [env.id] });
      }
    }

    for (const skill of index.skills.filter(enabled)) {
      const dir = `${profile.skills.dir}/${skillName(skill.name)}`;
      const rule = manualOnly(dir);
      for (const file of skill.files) {
        const target = `${dir}/${file.slice(skill.dir.length + 1)}`;
        let content = fillSlots(payload(file), slots);
        if (file === `${skill.dir}/SKILL.md`) {
          const { body } = splitFrontmatter(content);
          let activation = "";
          if (skill.role) {
            const name = nativeName(skill.role);
            activation =
              env.route === "skill"
                ? `## Role activation\n\nThis skill runs under the \`${skill.role}\` role. If this conversation runs a different role, stop and tell the user to open a new conversation. If the \`${skillName(name)}\` skill is not loaded in this conversation yet, read \`${profile.skills.dir}/${skillName(name)}/SKILL.md\` and follow it as your complete role contract before you continue. The role contract governs step order, halt points and session persistence; this skill supplies only its intake.\n\n`
                : `## Role activation\n\nThis skill runs under the \`${name}\` agent. If this conversation is not running it, stop and tell the user to ${profile.routes.nativeStart.replaceAll("{name}", name)}, then invoke this skill again.\n\n`;
          }
          content = yamlFrontmatter({ name: skillName(skill.name), description: skill.description, ...rule.frontmatter }) + activation + suffixMentions(body) + bindingsSection(skill.tokens, null);
        }
        add({ path: target, kind: "skill", envs: [env.id], customizable: true, content });
      }
      for (const extra of rule.extra) add({ ...extra, kind: "skill", envs: [env.id] });
    }

    if (profile.router.import) add({ path: profile.router.file, kind: "router", envs: [env.id], customizable: true, mode: "block", syntax: "html", content: `${profile.router.import}\n` });
    if (profile.scopedInstructions) {
      add({ path: `${profile.scopedInstructions.dir}/sessions.instructions.md`, kind: "instruction", envs: [env.id], content: fillSlots(payload("instructions/sessions.instructions.md"), slots) });
    }
    const permission = permissionOutput(env, runtimeCommand, outsidePaths);
    if (permission) add({ ...permission, kind: "permissions", envs: [env.id] });
    else warnings.push(`${env.id}: ${profile.label} has no project permission file; approve the runtime command${outsidePaths.length ? " and the outside sessions folder" : ""} on first use and record it`);
  }

  // Shared files. Root slots that differ per client list every selected client.
  const perClient = (key) =>
    answers.environments.length === 1
      ? answers.environments[0].profile[key].dir
      : answers.environments.map((env) => `${env.profile[key].dir} (${env.profile.label})`).join(", ");
  const routerSlots = { ...base, AGENT_ROOT: perClient("agents"), SKILL_ROOT: perClient("skills") };
  add({ path: "AGENTS.md", kind: "router", customizable: true, mode: "block", syntax: "html", content: fillSlots(payload("instructions/AGENTS.md"), routerSlots) });
  add({ path: `${rt}/instructions/sessions.instructions.md`, kind: "instruction", content: fillSlots(payload("instructions/sessions.instructions.md"), base) });
  for (const file of index.runtime) add({ path: `${rt}/${file.slice("runtime/".length)}`, kind: "runtime", content: payload(file) });
  for (const file of index.workflows) add({ path: `${rt}/${file}`, kind: "workflow", content: fillSlots(payload(file), base) });
  for (const file of index.contracts) add({ path: `${rt}/${file}`, kind: "contract", content: fillSlots(payload(file), base) });
  const config = {
    workspaceRoot: runtimeRelative(rt, "."),
    knowledgeRoot: runtimeRelative(rt, answers.locations.knowledgeRoot),
    sessionsRoot: runtimeRelative(rt, answers.locations.sessionsRoot),
    userRoot: answers.locations.userRuntimeRoot,
    workflowsRoot: "workflows",
  };
  add({ path: `${rt}/config.json`, kind: "config", content: `${JSON.stringify(config, null, 2)}\n` });
  const templateRoot = answers.locations.documentationTemplates === "user" ? `${answers.locations.userRuntimeRoot}/documentation/templates` : `${rt}/documentation/templates`;
  for (const file of index.documentationTemplates) {
    add({ path: `${templateRoot}/${file.split("/").pop()}`, kind: "template", scope: isOutside(templateRoot) ? "user" : "repo", content: payload(file) });
  }
  if (isLocalTracker(answers)) add({ path: answers.tracker.localContract, kind: "tracker", customizable: true, content: fillSlots(readText(join(kit.templatesDir, "local-markdown-tracker.md")), base) });
  if (!isOutside(answers.locations.sessionsRoot)) {
    add({ path: ".gitignore", kind: "gitignore", mode: "block", syntax: "hash", content: `${answers.locations.sessionsRoot}/\n` });
  }
  for (const output of guides(kit, answers, base, runtimeCommand)) add(output);

  for (const env of answers.environments) {
    for (const dir of env.profile.alsoDiscovers) {
      const writers = outputs.filter((o) => o.path.startsWith(`${dir}/`) && !o.envs.includes(env.id));
      if (writers.length) warnings.push(`${env.id}: ${env.profile.label} also discovers ${dir}/, where ${[...new Set(writers.flatMap((w) => w.envs))].join(", ")} installs files; check for duplicate roles or skills`);
    }
  }
  return { outputs: dedupe(outputs, errors), errors, warnings: [...new Set(warnings)] };
}

// Two clients may install the same file (for example a shared skills folder); identical content is one output.
function dedupe(outputs, errors) {
  const byPath = new Map();
  for (const output of outputs) {
    const existing = byPath.get(output.path);
    if (!existing) byPath.set(output.path, output);
    else if (existing.content === output.content && JSON.stringify(existing.add) === JSON.stringify(output.add)) existing.envs = [...new Set([...existing.envs, ...output.envs])];
    else errors.push(`${output.path}: rendered differently for ${existing.envs.join(", ")} and ${output.envs.join(", ")}; choose different folders`);
  }
  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

function guides(kit, answers, base, runtimeCommand) {
  const root = answers.locations.guideRoot;
  const template = (name) => readText(join(kit.templatesDir, name));
  const start = (env, role) => {
    const name = `${answers.prefix}${role}`;
    return env.route === "native"
      ? `${env.profile.routes.nativeStart.replaceAll("{name}", name)}`
      : `invoke the \`${name}${env.skillSuffix}\` skill in a new conversation`;
  };
  const statusLines = (env) => {
    const entries = Object.entries(env.verification);
    if (!entries.length) return "- Not verified yet. Bootstrap records each check here after it runs it.";
    return entries.map(([check, result]) => `- ${check}: ${typeof result === "string" ? result : `${result.status}${result.note ? ` (${result.note})` : ""}`}`).join("\n");
  };
  const outputs = [];
  const list = answers.environments.map((env) => `- [${env.profile.label}](${env.id}.md)`).join("\n");
  outputs.push({ path: `${root}/README.md`, kind: "guide", content: fillSlots(template("guide-readme.md"), { ...base, CLIENT_LIST: list }) });
  for (const env of answers.environments) {
    const values = {
      ...base,
      CLIENT: env.profile.label,
      ROUTE: env.route === "native" ? "native agents (the client's agent picker)" : "role skills you invoke by name",
      START_ORCHESTRATOR: start(env, "orchestrator"),
      START_ASK: start(env, "ask"),
      START_KNOWLEDGE_BUILDER: start(env, "knowledge-builder"),
      PLAN_SKILLS: env.route === "native" ? `select \`${answers.prefix}orchestrator\` first, then invoke \`plan-bug-from-id${env.skillSuffix}\` or \`plan-user-story-from-id${env.skillSuffix}\`` : `invoke \`plan-bug-from-id${env.skillSuffix}\` or \`plan-user-story-from-id${env.skillSuffix}\` in a new conversation; each loads the orchestrator itself`,
      DELEGATION: env.delegation === "subprocess" ? `separate \`${env.profile.delegation.subprocess}\` processes` : "native subagents, each with its own context",
      RUNTIME_COMMAND: runtimeCommand,
      VERIFICATION: statusLines(env),
    };
    outputs.push({ path: `${root}/${env.id}.md`, kind: "guide", content: fillSlots(template("guide-environment.md"), values) });
  }
  return outputs;
}
