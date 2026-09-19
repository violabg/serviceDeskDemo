---
name: author-repo-skill
description: "Use when: adding a new repository-local skill, or reworking an existing one, so a repeatable procedure lives in a skill instead of being retyped into prompts or grafted onto an agent contract."
disable-model-invocation: true
---

# Author Repo Skill

Use this skill to create or evolve a repository-local skill in this repository's Agentic System.

A skill is a procedure the repository runs more than once and wants to run the same way every time. Anything used once belongs in a prompt. Anything an agent must always obey belongs in that agent's contract or in a scoped instruction file.

## Decide Whether A Skill Is The Right Home

<!-- CANONICAL-TEMPLATE-SLOT: SKILL_ROOT START replaces=none -->
Search `{{SKILL_ROOT}}` for a near-duplicate before adding a new skill, and write the result there as one directory per skill.
<!-- CANONICAL-TEMPLATE-SLOT: SKILL_ROOT END -->
Answer these before writing anything. If the answer to the first is no, stop and say which of the other homes fits.

- Is the procedure repeated? A one-off request is a prompt, not a skill.
- Is it invoked deliberately? A rule that must apply to every edit under a path is an instruction file with an `applyTo` scope.
- Does it belong to one role? A constraint that defines what a role may do is part of that role's agent contract.
- Does it have a definite output? A skill that cannot name its artifact or its finished state will not be reusable.
- Does it already exist? Search the skill directory first. Extending an existing skill beats adding a near-duplicate.

Two skills that differ only in a noun are one skill with a parameter.

## Gather Before Writing

<!-- CANONICAL-TEMPLATE-SLOT: KNOWLEDGE_SOURCE START replaces=none -->
Read relevant project knowledge through `{{KNOWLEDGE_SOURCE}}` before writing a procedure that depends on repository conventions.
<!-- CANONICAL-TEMPLATE-SLOT: KNOWLEDGE_SOURCE END -->
<!-- CANONICAL-TEMPLATE-SLOT: REPOSITORY_SEARCH_TOOL START replaces=none -->
Use `{{REPOSITORY_SEARCH_TOOL}}` to confirm that every path, command, and role the skill names exists in this repository.
<!-- CANONICAL-TEMPLATE-SLOT: REPOSITORY_SEARCH_TOOL END -->
Collect the repository facts the procedure depends on, and cite where each came from:

- the existing skills, so the new one matches their structure and does not overlap,
- the agent roster, so the skill names the roles allowed to invoke it,
- the conventions the procedure must respect: session rules, artifact paths, plan schema, context glossary, validation commands,
- the concrete example that motivated the request, so the skill is written against real repository work rather than an imagined case.

Do not invent a tool, path, tracker, or command that discovery did not find. An unavailable capability is recorded as a recommendation, never as a requirement.

## Required Shape

Every generated skill has:

- YAML frontmatter with `name`, a `description` that begins `Use when:` and states the triggering situation, and `disable-model-invocation: true` when the skill must be invoked deliberately rather than chosen by the model,
- a one-line statement of what the skill produces,
- the preconditions that must hold before it runs, and what to do when one is missing,
- the procedure as ordered steps, each with an observable result,
- the output artifact: its path, its shape, and what makes it complete,
- the failure modes: what makes the skill stop and ask instead of guessing.

Rules for frontmatter:

- Do not add `tools:` frontmatter to a skill that a single agent invokes. Tool surface belongs to the agent, and duplicating it in the skill lets the two drift apart.
- When a step needs work the calling agent should not do inline, delegate it with an explicit subagent instruction in the skill body and state what the subagent returns.

## Write It Repo-Specific

A skill that would read identically in any repository has failed. Name this repository's paths, commands, adapters, roles, and vocabulary. Prefer the repository's own wording over generic agent-system terms.

Keep it short enough to stay true. A long skill accumulates statements nobody verifies. Cut anything the reader can find in the agent contract or the instruction files, and point at it instead.

## Evolving An Existing Skill

Changing a skill is the same procedure with one addition: state what breaks.

- Name every caller: agents, other skills, instruction files, and documented workflows that reference it.
- Say whether the change is compatible, and if not, what each caller must do.
- Keep the skill's name and invocation stable unless the change makes the old name wrong. Renaming costs every caller.
- If the change removes a rule, say why it is no longer needed. A removed rule with no reason gets reintroduced later by someone who hits the original problem.

When the repository has a customization register, record the new or changed skill there, so a later maintenance run can tell a deliberate repository addition from generated content.

## Approval And Validation

<!-- CANONICAL-TEMPLATE-SLOT: VALIDATION_COMMANDS START replaces=none -->
Validate the written skill with the repository commands `{{VALIDATION_COMMANDS}}` where they apply, and record a reason for each command that was skipped.
<!-- CANONICAL-TEMPLATE-SLOT: VALIDATION_COMMANDS END -->
Propose the file plan and wait for explicit approval before writing. Approval is false by default.

After writing, verify:

- frontmatter parses and `description` states when to use the skill,
- every path, command, tool, and role named in the skill exists in this repository,
- no rule contradicts the agent contracts or the instruction files,
- the skill declares who may invoke it,
- the output artifact is described precisely enough that two runs produce the same shape,
- the repository's own validation commands were run where they apply, or each skipped command has a reason,
- the skill directory has no near-duplicate of the new skill.

Report the created or changed files, the callers affected, the validation results, and anything left deferred.
