# Bootstrap Discovery And Decisions

Covers Phase A through Phase C. No files are written in these phases.

## Phase A: Intake And Scope

Confirm the request is agent-system design or installation. Stop or redirect if the user asks for application implementation, product testing, database work, runtime configuration, or approval bypass.

Capture these initial facts:

- target repository and working root,
- preferred agent platform or unknown platform,
- output language,
- desired custom agent prefix or permission for Bootstrap to propose one,
- known workflow risks,
- whether the user wants planning only or approved generation.

Do not write files in this phase.

## Phase B: Bounded Discovery

Run read-only discovery. Use bounded hidden subagents when the platform supports them; otherwise perform the same checks inline and report that subagent delegation was unavailable.

Discovery lanes:

- Platform and Tooling: customization folders, agent platform conventions, MCP config, tool allowlists, and platform constraints.
- Tracker and Session: GitHub, Jira, Linear, Azure DevOps, Notion, local Markdown issue models, session roots, ID patterns, and current-session-only restrictions.
- Knowledge and Glossary: `CONTEXT.md`, glossaries, ADRs, docs, source-of-truth boundaries, repeated repository vocabulary, aliases, and ambiguous terms.
- Visual Artifacts: screenshots, mockups, diagrams, UI snapshots, image assets, issue attachments, browser screenshots, annotated QA evidence, and whether image evidence affects planning or testing.
- Validation Surface: package scripts, CI, lint/test commands, PR templates, contribution docs, and commands generated agents should run.
- Role Capability Scope: read each selected agent mirror's `## Role Tooling Intent` profile, then audit its `## Capability Substitutions` table. For every profile category and token, record source role, supported operation, whether that role needs it for its selected workflow, and target-repository evidence for candidate tools or services. Profiles and tokens describe capability needs, not names of MCP servers to install.
- Vision model support: when Vision is selected, inspect existing target-platform Vision agents and model configuration so Bootstrap can recommend whether the canonical Vision default is supported or the platform default should be used.

For every role capability need, search target MCP configuration, existing agent tool lists and repository skills, tracker and knowledge sources, package manifests, lockfiles, and project documentation before proposing a candidate. A framework, vendor, library, or API dependency may justify a documentation capability for the role that needs current external contracts. Do not infer a specific provider from the source mirror; prefer an already configured target-repository service, then a platform-native tool, then a documented fallback.

Before leaving this phase, produce a candidate tool and integration matrix. List role, source capability token, discovered MCPs, platform tools, built-in tool surfaces, candidate generated agents or skills that might receive each tool, why each tool helps, risks from adding authority, intentionally omitted tools, and unknown integrations. This matrix is discovery output only, not approval.

## Phase C: Decision Register

Turn discovery into bounded decisions before proposing files. Ask only questions that materially change the generated system.

Ask one unresolved material decision at a time. Present routine evidence-backed defaults, such as names and paths, together for explicit approval; do not interview separately for values the user can approve as a group. Each question must state discovery evidence, Bootstrap's recommendation when one exists, the decision impact, and allow a free-form answer. A recommendation is never an approval or a user answer. Record recommendation, user answer, impact, and resolved status. Do not enter proposal or file-plan mode while any blocking decision remains unresolved.

Required decisions for the selected workflow (mark conditional items not applicable when their workflow is omitted):

- target agent platform,
- custom agent prefix,
- root instruction strategy (`AGENTS.md` by default, or approved platform equivalent),
- tracker/session model,
- selected work-item adapter and exact approved retrieval tools, or local Markdown adapter name, only when tracker-backed or ID-based planning is selected,
- External Issue ID format, validation, required retrieved fields, and current-issue-only scope, only for ID-based planning,
- Planning Session ID prefix: for ID-based planning, recommend `bug-<external-issue-id>` and `us-<external-issue-id>` after type retrieval; for free-form planning use a user-approved request slug; record any user-approved custom prefix,
- local Markdown issue root, ID format, and lookup/index rule only when ID-based planning is selected without an external tracker,
- approved MCP and platform integration assignments by exact tool name,
- context glossary action: create, update, no change, or defer,
- terminology normalization for competing or ambiguous repository terms,
- knowledge-index path and first-install contents,
- plan-schema destination path, and a compatible test-plan schema path when Integration Tester is selected,
- session root and current-session-only restriction,
- maintenance baseline location: the `docs/agents/` root that will hold the manifest, the answers file, and the `.baseline/` directory,
- Vision support: Vision agent, smaller visual-intake skill, defer, or no change,
- Vision model: the approved exact model for the generated Vision agent, or an explicit platform-default/omitted-model decision when Vision is selected,
- Canonical Template Mirror skills to generate, skip, or defer,
- approval owner and batch approval plan, including each batch's composition, order, split/combine/skip/defer choices, and approval checkpoint.

Use bounded choices where possible. Do not enter proposal or file-plan approval while blocking decisions remain unresolved. Tool decisions must use choices such as `add`, `omit`, `move to another agent or skill`, `recommend only`, `defer`, or `needs more discovery`.

Drive slot decisions from `registry/placeholders.yaml`. For every slot the selected mirrors actually use, inspect the entry's `infer_from` evidence in the target repository first, then resolve any material uncertainty with the entry's `question`, or include a routine default in the grouped approval, while stating the evidence found, the entry's `recommend` default adjusted to that evidence, and what changes if the user answers differently. Ask only for slots that materially change the generated system; record the inferred default, the user's answer, and the evidence in the decision register.

Resolve `APPROVED_MCP_TOOLS` role by role. Start from that role's Role Tooling Intent profile, using Capability Substitutions tokens as the audit trail, and use Phase B evidence to recommend only a least-privilege candidate that satisfies the needed operation. A token may resolve to a configured MCP, a platform tool, an existing repository skill, a repository-local contract, or its declared capability fallback. For a skill or contract, record its path, invocation, supported operation, and required underlying tools; the existence of a skill alone does not prove it can perform the operation. A framework, vendor, library, or API dependency can add a documentation need only when it helps that role verify current external contracts. Never assign a tool to a role solely because another role uses it, never turn a source private service name into a target requirement, and never add an unapproved candidate to frontmatter.

Resolve capability coverage from `registry/capabilities.yaml` in the same phase. For the selected platform, propose the listed tool defaults for confirmation; when the platform entry is empty or the user rejects a tool, propose the capability's `fallback` for approval instead of removing the behaviour, and record that substitution. A fallback is usable only if its prerequisites exist; otherwise report the capability as unresolved and block the affected workflow. Capability Substitutions tables describe operation-level bindings; check every required operation, including schema reads and session writes, rather than treating a category name as proof of coverage.

After user confirmation, create an approved decision register. Every approved tool or integration assignment with choice `add` or `move to another agent or skill` becomes a planned file change and must appear by exact string name in the generated target file's `tools:` frontmatter or required-tool section.

The decision register is the source of the answers file written in Phase E. Every resolved slot must carry its final value, how it was settled (discovery, user answer, accepted recommendation, or capability fallback), and the evidence behind it, so no decision has to be re-interviewed during later maintenance.

Resolve platform invocation slots alongside capability assignments. `PLATFORM_TOOLS` is role-specific: load the matching Baseline Tool Surface row in `templates/agent-role-contracts.md` as the source operation list, then preserve supported baseline tools and translate unsupported names only to discovered equivalents for the same operations. `QUESTION_TOOL`, `WORK_ITEM_GATHERING`, `KNOWLEDGE_DISCOVERY_DELEGATION`, and `VISION_INVOCATION` must name working native invocations or explicit inline/manual procedures. A platform without subagents runs the same bounded evidence tasks inline; it does not keep an instruction to invoke an unavailable subagent.

When Integration Tester is selected, inspect an existing target test-plan schema against `templates/test-plan-schema.md` and the Tester lifecycle. Prefer a compatible existing schema; otherwise propose copying the shipped local fallback. Never bind schema retrieval to a document that only discusses gates. Record incompatibilities as blocking decisions or explicitly approved runtime adaptations.
