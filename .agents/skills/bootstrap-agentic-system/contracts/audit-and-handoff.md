# Bootstrap Audit And Handoff

Covers Phase F through Phase H. These phases audit the generated system, not the source templates.

## Phase F: Runtime Schema And Knowledge Enforcement

Required Planner checks:

- Planner names the generated knowledge-index path before any knowledge-file loading instruction.
- Planner states that the knowledge index is derived from `templates/knowledge-index-schema.md` or an approved repo-local equivalent.
- Planner requires index-first selection by `When to read` triggers and forbids bulk-loading all knowledge files.
- Planner records selected and skipped relevant knowledge candidates in planning artifacts.
- Planner names the generated implementation-plan schema path copied from `templates/plan-schema.md` or an approved repo-local equivalent.
- Planner states plan-schema compliance overrides markdown cleanup for required filesystem-tree links, File Details anchors, backlinks, approval metadata, operations, validation, and risks.
- Planner carries the per-question clarification format in its own body and no generated file restates it.
- Planner forbids requesting plan approval while blocking questions remain unresolved.

Missing schema paths or generic phrases such as "use the repo template" are blocking validation failures.

## Phase G: Contract Audit And Validation

Validate the generated files against the approved file plan, the user's decisions, and this Bootstrap contract. Use a Contract Auditor subagent when available; otherwise run the checklist inline.

Required checks:

- Every approved file operation was completed, skipped with an approved reason, or reported as blocked.
- Root `AGENTS.md` generated from `templates/instructions/AGENTS.md` exists, or the approved platform-equivalent root instruction file exists with the reason for not creating `AGENTS.md`.
- Every generated modular instruction file declares an `applyTo` scope that matches the paths its rules govern, and no rule that belongs in a modular file was inlined into the root instructions.
- Root instructions name generated agents, generated skills or skill directory, session rules, validation expectations, context glossary path when one exists, knowledge-index path, schema paths, and manifest path without duplicating full agent contracts.
- Root instructions are prompt-sensitive and navigational: they tell agents which generated agents, skills, schemas, knowledge-index entries, glossary, and partial instruction files to consult for the current request, and they do not bulk-load repository facts or full role contracts into every request.
- Manifest exists at the approved path and follows `templates/agentic-system-manifest.md` or an approved equivalent.
- Manifest records Bootstrap skill version used, Bootstrap contract applied through, installed Bootstrap changelog path, repo-local Bootstrap changelog snapshot path, answers file path, baseline directory path, generated paths, slot decisions, marker stripping, generated/skipped/deferred mirrors, and maintenance history.
- Answers file exists at the approved path and records every slot the generated system uses, how each value was settled, every capability resolution including fallback substitutions, and one generated-to-baseline path pair per generated file.
- Baseline directory contains one pristine copy per generated file, at the matching repository-relative path, taken before any post-generation hand edit.
- Every generated file appears in both the answers file and the baseline directory, and neither contains an entry for a file Bootstrap did not generate.
- Customization register exists in the manifest, with a row for every deliberate deviation approved during this run, or an explicit statement that this install has none.
- Repo-local Bootstrap changelog snapshot exists when the installed changelog was available, or the manifest records why the baseline was inferred or unknown.
- Generated runtime files from mirrors contain no `CANONICAL-TEMPLATE-SLOT` markers.
- Generated runtime files preserve mirrored non-slot canonical wording unless the file plan records explicit user approval for a non-slot change.
- Every generated agent has the required baseline tool surface or an approved reduction.
- Every approved MCP or platform tool assignment appears by exact string name in the approved target agent or required-tool section.
- Every omitted, deferred, or recommendation-only integration is absent from generated tool surfaces and recorded with a reason.
- Every `tools:` frontmatter item is a string.
- Tracker/session contract names the external adapter or local Markdown issue root, ID format, lookup/index rule, required fields, and missing-ID behavior when ID-based skills are generated.
- Tracker/session contract distinguishes External Issue ID from Planning Session ID, limits default retrieval to current issue, records explicitly referenced dependency retrieval without recursion, and limits session access to current Planning Session ID folder with direct resume.
- Context glossary operation or no-op matches the approved decision; any glossary is primarily repository code/domain vocabulary and records preferred terms, avoided terms, aliases, and distinctions when ambiguity was resolved.
- Knowledge index exists when planned and includes purpose, token budget rule, knowledge entries, `When to read` triggers, selection workflow, and artifact record.
- Plan schema exists at the approved path, preserves the required content from `templates/plan-schema.md` or an approved stronger equivalent, and is explicitly referenced by Planner.
- Vision decision is reflected in generated files or recorded as an intentional no-op.
- Knowledge Builder contract requires repository scanning, knowledge-index creation or refinement, context-glossary term suggestions, and bounded questions for missing knowledge areas.
- Generated work-item planning skills preserve tracker/local adapter, session, evidence, Planner-only, no-skill-tools-frontmatter, and `#tool:agent/runSubagent` requirements.
- Generated Planner and work-item planning skills ask clarification only for genuine blocking uncertainty; otherwise complete mandatory gates, artifacts, and implementation plan before requesting review or approval.
- Validation commands from the file plan were run where available, or each skipped command has a reason.

Treat missing required contract elements as blocking failures unless the user explicitly approved the omission.

## Phase H: Maintenance Handoff

Finish by recording maintenance evidence and future recommendations.

The final handoff must include:

- changed files,
- generated/skipped/deferred mirrors,
- validation results,
- Bootstrap contract version applied through,
- manifest path,
- answers file path,
- baseline directory path,
- repo-local Bootstrap changelog snapshot path,
- deferred decisions,
- remaining risks,
- post-bootstrap recommendations.

Always recommend:

- run the generated Knowledge Builder agent to scan repository knowledge, refine the knowledge index, suggest context-glossary terms, and ask bounded questions for missing knowledge boundaries,
- use `create-work-item-from-description` when the team wants repeatable creation of user-story or bug tickets from clarified work,
- use the installed `author-repo-skill` when the team wants a new repository-local skill, or wants to rework a generated one such as `plan-bug-from-id` or `plan-user-story-from-id`,
- keep the answers file, baseline directory, and customization register updated whenever the generated system is edited by hand, so the next maintenance run can still classify the change.

Future upstream, schema, template, or changelog changes belong to `maintain-agentic-system`. Maintainer must classify each Bootstrap contract delta as `applied`, `not applicable`, `deferred`, `superseded`, `unknown`, or `requires update` using the manifest, answers file, baseline directory, customization register, repo-local snapshot, current installed changelog, and direct repository evidence.
