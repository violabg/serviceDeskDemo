# Bootstrap Generation

Covers Phase D and Phase E. Nothing here runs before the file plan is approved.

## Phase D: Proposal And File Plan

Load `templates/generated-system-blueprint.md` and `templates/bootstrap-file-plan.md`. Produce a concise proposal plus a file plan. Mark approval false by default.

The proposal must cover:

- costly repository workflow failures Bootstrap is addressing,
- selected environments, compatibility evidence, shared canonical copies, native adapters, and instruction hierarchy,
- selected custom agent prefix,
- root instruction strategy,
- tracker/session contract,
- context glossary decision,
- knowledge-index strategy,
- visual artifact strategy,
- selected Canonical Template Mirror agents and skills,
- tool and integration assignment register,
- agentic-system manifest, answers file, baseline directory, and Bootstrap changelog snapshot strategy,
- staged batch plan,
- validation commands,
- post-bootstrap recommendations.

The file plan must include:

- generated path map with environment ownership and shared-file consumers,
- preservation plan with hashed sources and exact approved substitutions, following `contracts/platform-compatibility.md`,
- preservation matrix for this run,
- source template path for every generated mirror,
- approved placeholder values and slot replacements,
- source-only marker stripping decisions,
- files generated, skipped, or deferred,
- schema file destination copied from `templates/plan-schema.md`, plus any approved repo-local equivalent or adaptation; include `templates/test-plan-schema.md` or a verified compatible local schema when Integration Tester is selected,
- context glossary operation or no-op reason,
- issue tracker or local Markdown adapter contract,
- maintenance baseline plan: answers file path, baseline directory path, and the promise that every generated file gets a pristine copy,
- batch approval checkpoints,
- rollback notes.

Default batch order:

1. Core System: root instructions copied from `templates/instructions/AGENTS.md`, the modular instruction files selected from `templates/instructions/`, manifest, Bootstrap changelog snapshot, knowledge index shell, the repo-local schema file copied from `templates/plan-schema.md`, the resolved test-plan schema when Integration Tester is selected, Planner, Implementor, Tester or Integration Tester, Knowledge Builder, Ask when selected, and context glossary only when resolved.
2. Vision Evidence: Vision agent or visual-intake skill when selected.
3. Knowledge Builder Bootstrap: initial knowledge files and index entries when evidence supports them; otherwise recommend running generated Knowledge Builder.
4. Skill Template Generation: selected skills from `templates/skills/`.
5. Maintenance Baseline: answers file, pristine `.baseline/` copies of every file written in earlier batches, and the customization register in the manifest.
6. Contract Audit: final preservation, schema, manifest, tool, tracker, glossary, knowledge, baseline, and validation checks.

Present default batches as recommendations only. Let the user select, defer, skip, reorder, split, or combine every proposed batch. Reflect approved composition and checkpoints in proposal and file plan. Ask for explicit approval before any write batch. Do not write generated files while the plan is unapproved.

The maintenance baseline batch may be merged into another batch, but it cannot be skipped or deferred past handoff. Without it the repository has no way to tell a later customization apart from generated content.

## Phase E: Copy-First Generation

After approval, apply only the approved batch.

For every generated agent or skill with a matching mirror:

- read the mirror from `templates/agents/` or `templates/skills/`,
- copy the mirror into the planned canonical-copy path; share identical filled copies and create environment-specific copies only when bindings differ,
- replace inline placeholders from the approved decision register,
- fill or remove approved block slots,
- strip `CANONICAL-TEMPLATE-SLOT` marker comments from final generated runtime files,
- preserve non-slot canonical wording and heading order,
- fill `PLATFORM_TOOLS` with exact approved quoted YAML tool-name strings for that role; preserve supported baseline operations and record translated names or approved manual fallbacks,
- retain canonical frontmatter outside declared slots; put native registration, unsupported source metadata handling, and delegation configuration in the separately verified adapter when required,
- replace `"{{APPROVED_MCP_TOOLS}}"` with exact quoted string tool names or remove it if no additional tools are approved; deduplicate with `PLATFORM_TOOLS` and remove empty list items,
- fill invocation slots with the approved native syntax or explicit inline/manual procedure; using plain chat for `QUESTION_TOOL` must not leave a fictitious tool reference,
- replace `"{{VISION_AGENT_NAME}}"` with the generated Vision agent name when Vision is selected, or fill that placeholder with an empty value and configure the native adapter to omit that unselected delegate,
- replace `"{{VISION_MODEL}}"` with the approved exact model when Vision is selected; if the user approves the target platform default, fill that placeholder with an empty value in the canonical copy and omit the native adapter's model setting; record this default decision in the manifest,
- use a verified native adapter whenever retained canonical metadata is not directly loadable (including empty optional model/delegate values); never register an invalid copy directly,
- record all decisions in the manifest.

For generated work-item planning skills:

- do not add skill-level `tools:` frontmatter,
- name the selected external tracker adapter or local Markdown adapter in the body,
- preserve Planner-only invocation,
- fill `WORK_ITEM_GATHERING` with the approved target invocation or an explicit inline gathering instruction; preserve the following evidence task and its artifact contract,
- define adapter name, exact approved retrieval tools when available, supported issue types, External Issue ID format, required retrieved fields, rich-content and attachment Markdown conversion, missing/duplicate/unreadable/invalid-ID behavior, and local lookup rules when applicable,
- retrieve only requested External Issue ID by default. Read each issue explicitly referenced or linked by the current issue before deciding relevance; record retrieval reason as dependency evidence and do not recurse,
- distinguish External Issue ID from Planning Session ID. Determine issue type before recommending `bug-<external-issue-id>` or `us-<external-issue-id>`, allow approved custom prefix, and record resulting identity in current-session artifact,
- create or resume only current Planning Session ID folder under approved session root; resume directly from known Planning Session ID and never enumerate other session folders.

For generated instruction files:

- copy `templates/instructions/AGENTS.md` to the approved root instruction path, or to the approved platform-equivalent path when the platform does not read `AGENTS.md`,
- preserve selected instruction mirrors and their scope values; when native instruction discovery uses another format, encode the same scope in a verified registration adapter instead of rewriting the copy,
- fill the roster slot with only the agents approved in the generation batch, one line each, naming the request type that should reach the agent,
- omit unselected targets within the declared roster slot; do not delete fixed non-slot routing lines,
- keep the root instruction file navigational: move any repository-specific rule into a modular instruction file or a knowledge file instead of expanding the router.

For generated runtime schema files:

- copy `templates/plan-schema.md` to the approved implementation-plan schema path,
- when Integration Tester is selected, copy `templates/test-plan-schema.md` to `TEST_PLAN_SCHEMA_PATH`, or verify the approved existing schema there; record whether it is the shipped local fallback or a compatible repository contract,
- preserve the plan schema's filesystem-tree links, File Details anchors, backlinks, approval metadata, operations, validation, and risks,
- do not generate a separate clarification-question schema: the generated Planner already carries that format, and a second copy drifts from it,
- record any approved stronger repo-local equivalent or adaptation in the manifest.

For generated files without a mirror, adapt `templates/agent-role-contracts.md`, `templates/agent-contracts.md`, or a user-approved local equivalent. Non-mirrored additions may use partial files, but partials must not replace mirrored canonical content. Native adapters follow `contracts/platform-compatibility.md` and cannot become alternative workflow definitions.

## Maintenance Baseline Writes

Write the maintenance baseline from `templates/agentic-system-answers.md` and the manifest template once the generated files exist.

- Write the answers file at the approved path. For a slot whose value differs by role or file, store its `value` as a map keyed by generated repository-relative path; otherwise store a scalar. Resolve the exact file entry during future template filling. Use answers schema version 2. Record the Bootstrap skill version, execution host, selected environments and their roots/evidence, shared sources and adapters, every slot the generated system uses with its value, `source`, and evidence, every required environment/role/operation with its binding, prerequisites, evidence, verification status, and installed fallback, every generated path paired with its baseline path, and every deferred decision.
- Copy each generated file into the baseline directory under its repository-relative path, byte for byte, before any post-generation hand edit. A baseline copy taken after a manual edit silently turns a customization into part of the baseline.
- Do not copy files Bootstrap did not generate. The baseline describes what Bootstrap produced, not the repository.
- Initialize the customization register in the manifest. A first install normally has no rows; add one row for every deliberate deviation approved during this run, including slot overrides that contradict a template default and separate repo-local extensions. A non-slot change in a canonical copy is a blocking preservation failure, not an accepted platform adaptation.
- Record the answers file path and baseline directory path in the manifest under Generated System Paths.

When a slot value changes later, the answers file, the baseline copy, and the manifest must be refreshed together. Refreshing one without the others is a blocking failure, not a partial success.
