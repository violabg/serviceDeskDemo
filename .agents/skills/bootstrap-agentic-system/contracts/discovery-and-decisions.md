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

For every role capability need, search target MCP configuration, existing agent tool lists, tracker and knowledge sources, package manifests, lockfiles, and project documentation before proposing a candidate. A framework, vendor, library, or API dependency may justify a documentation capability for the role that needs current external contracts. Do not infer a specific provider from the source mirror; prefer an already configured target-repository service, then a platform-native tool, then a documented fallback.

Before leaving this phase, produce a candidate tool and integration matrix. List role, source capability token, discovered MCPs, platform tools, built-in tool surfaces, candidate generated agents or skills that might receive each tool, why each tool helps, risks from adding authority, intentionally omitted tools, and unknown integrations. This matrix is discovery output only, not approval.

## Phase C: Decision Register

Turn discovery into bounded decisions before proposing files. Ask only questions that materially change the generated system.

Ask one unresolved decision at a time. Each question must state discovery evidence, Bootstrap's recommendation when one exists, the decision impact, and allow a free-form answer. A recommendation is never an approval or a user answer. Record recommendation, user answer, impact, and resolved status. Do not enter proposal or file-plan mode while any blocking decision remains unresolved.

Required decisions:

- target agent platform,
- custom agent prefix,
- root instruction strategy (`AGENTS.md` by default, or approved platform equivalent),
- tracker/session model,
- selected work-item adapter and exact approved retrieval tools, or local Markdown adapter name,
- External Issue ID format, validation, required retrieved fields, and current-issue-only scope,
- Planning Session ID prefix: recommend `bug-<external-issue-id>` and `us-<external-issue-id>` after type retrieval; record any user-approved custom prefix,
- local Markdown issue root, ID format, and lookup/index rule when no external tracker is configured,
- approved MCP and platform integration assignments by exact tool name,
- context glossary action: create, update, no change, or defer,
- terminology normalization for competing or ambiguous repository terms,
- knowledge-index path and first-install contents,
- plan-schema destination path,
- session root and current-session-only restriction,
- maintenance baseline location: the `docs/agents/` root that will hold the manifest, the answers file, and the `.baseline/` directory,
- Vision support: Vision agent, smaller visual-intake skill, defer, or no change,
- Canonical Template Mirror skills to generate, skip, or defer,
- approval owner and batch approval plan, including each batch's composition, order, split/combine/skip/defer choices, and approval checkpoint.

Use bounded choices where possible. Do not enter proposal or file-plan approval while blocking decisions remain unresolved. Tool decisions must use choices such as `add`, `omit`, `move to another agent or skill`, `recommend only`, `defer`, or `needs more discovery`.

Drive slot decisions from `registry/placeholders.yaml`. For every slot the selected mirrors actually use, inspect the entry's `infer_from` evidence in the target repository first, then ask the entry's `question` while stating the evidence found, the entry's `recommend` default adjusted to that evidence, and what changes if the user answers differently. Ask only for slots that materially change the generated system; record the inferred default, the user's answer, and the evidence in the decision register.

Resolve `APPROVED_MCP_TOOLS` role by role. Start from that role's Role Tooling Intent profile, using Capability Substitutions tokens as the audit trail, and use Phase B evidence to recommend only a least-privilege candidate that satisfies the needed operation. A token may resolve to a configured MCP, a platform tool, a repository-local contract, or its declared capability fallback. A framework, vendor, library, or API dependency can add a documentation need only when it helps that role verify current external contracts. Never assign a tool to a role solely because another role uses it, never turn a source private service name into a target requirement, and never add an unapproved candidate to frontmatter.

Resolve capability coverage from `registry/capabilities.yaml` in the same phase. For the selected platform, propose the listed tool defaults for confirmation; when the platform entry is empty or the user rejects a tool, install the capability's `fallback` instead of removing the behaviour, and record that substitution.

After user confirmation, create an approved decision register. Every approved tool or integration assignment with choice `add` or `move to another agent or skill` becomes a planned file change and must appear by exact string name in the generated target file's `tools:` frontmatter or required-tool section.

The decision register is the source of the answers file written in Phase E. Every resolved slot must carry its final value, how it was settled (discovery, user answer, accepted recommendation, or capability fallback), and the evidence behind it, so no decision has to be re-interviewed during later maintenance.
