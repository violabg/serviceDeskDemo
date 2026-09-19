# Platform Compatibility

This is the shared compatibility contract for Bootstrap and Maintainer. Load it only when selecting, adapting, or verifying target environments. Platform documentation supplies configuration facts; it never overrides the canonical workflow.

## Selection And Evidence

Ask which environments the repository must support, allowing multiple selections from `registry/capabilities.yaml`'s `platform_choices`. Include GitHub Copilot in VS Code, Claude Code, Codex, OpenCode, Cursor, and Other. Other requires the user to enter one or more platform names; it is not an unsupported-platform rejection. The choices are suggestions, not a closed compatibility list. Do not select an environment merely because Bootstrap is running in it or a customization folder exists.

Record the execution host separately from the selected targets. Give each target an environment ID that distinguishes client, version, and execution context where needed; two clients of the same product may need separate records. Inspect available versions, repository configuration, discovery roots, effective permissions, integrations, and role-level tool availability. An unknown version stays unknown.

Retrieve official documentation for only the selected environments at the time of the run. Prefer documentation matching the installed or explicitly requested version. Record source URL, retrieval date, applicable version, the specific supported behavior, and local evidence confirming or contradicting it. User-provided official excerpts can supply evidence when browsing is unavailable; record their provenance and limitations. Never fill gaps from remembered tool names, an unrelated product, or the host's tool inventory. Unavailable documentation or runtime verification leaves the relevant claim unverified.

Discover native agent registration and invocation, instruction loading and path scoping, skill discovery and metadata, tool identifiers and configuration, permissions, delegation, question routing, model selection when needed, and reload requirements. Record findings in the target repository's answers and compatibility evidence, not in a growing platform reference catalog in these skills. Research is bounded by the selected workflow's actual requirements.

## Canonical Preservation

The installed public mirrors are the canonical-derived source for target generation. Never copy raw upstream material or invent a replacement agent. Every selected agent, instruction, and skill must have a complete repo-local canonical copy produced from its shipped mirror.

Only these transformations are allowed in that copy:

1. Fill declared Personalization Slots and placeholders with approved repository- or environment-specific values, including paths, names, and configuration.
2. Resolve platform tool bindings and invocation syntax through the declared tooling slots, preserving the operation, evidence task, outputs, gates, and role authority.
3. Remove source-only slot marker comments.

Preserve every other line, heading, ordering, instruction, and workflow requirement. Platform research is not permission to paraphrase, summarize, split, remove, or weaken content. Do not add arbitrary replacement patterns or widen slot boundaries to make a comparison pass. If a necessary tool adaptation is outside a declared slot, report the missing slot as a source-contract gap; do not rewrite the copy. Repository extensions belong in separate files and must not override canonical rules.

Use one shared copy whenever filled content is identical. When an approved placeholder or tool binding differs, keep a complete copy for each distinct binding and record its environments. Common knowledge, schemas, session contracts, scripts, and skill resources have one maintained source. Sharing a session format does not authorize concurrent writes to the same session.

If a platform cannot consume the copy's native format, generate a separate minimal registration adapter. Its only purposes are native registration, instruction loading or lossless embedding, instruction scope, skill discovery, and approved tool/permission configuration. Keep the complete canonical copy in the repository. Native metadata may encode the same canonical meaning in the documented format, but must not change authority, selection rules, or workflow semantics. Verify that the adapter loads or embeds the entire instruction body, in order, before the role operates; a link alone is not evidence of loading. Do not author alternative workflow prose in adapters; any required embedding is generated verbatim from the complete canonical instruction body. Check embedded text after decoding, not only the serialized file bytes. Verify relative references to scripts, resources, and other instructions from their canonical location; an adapter must not break those references by changing the loading base.

A registration adapter is not a new authored version of Planner, Implementor, a skill, or an instruction file. If the platform cannot honor the required content and capabilities, mark the affected workflow blocked. Do not manufacture compatibility by weakening it.

## Capability Resolution

Resolve capabilities by environment, role, and required operation. `registry/capabilities.yaml` defines stable needs and possible fallback procedures, not tool defaults. Read the selected mirrors' Role Tooling Intent and Capability Substitutions as the operation inventory. Existing baseline tool names are source evidence, not a target allowlist.

For each operation record its tool or procedure, exact invocation, inputs, outputs, configuration/permission prerequisites, assigned role, evidence, and verification status. A skill or MCP declaration is not proof that its underlying tools are installed, authenticated, permitted, or available in that role. Do not copy credentials into provenance files. Reuse existing configuration and scope proposed configuration changes to agent-system settings; never broaden global permissions automatically.

Planner must be able to read/search repository evidence and persist the plan, artifacts, memory, and logs required by its canonical contract while retaining its restriction on application edits. Implementor needs the canonical editing, execution, validation, and session capabilities. Preserve the corresponding requirements of every other selected role. Distinguish a runtime-enforced permission boundary from an instruction-only restriction; do not claim the latter is enforced by an allowlist.

Check whether a role runs as the main agent, a foreground delegate, or a background delegate. Tool access, questions, and delegation may differ. When required interaction must go through a coordinator, bind the relevant declared invocation slot to that route without changing the question or approval gate. A fallback requires working prerequisites and explicit approval; never silently switch procedures or drop a required operation.

## Verification And Provenance

The file plan must list selected environments, shared canonical copies, per-environment copies where needed, native adapters, source hashes, exact slot values, tool assignments, and evidence/verification paths. Native formats and directories come from the recorded research, not a fixed folder table. Account for existing user files and for clients that discover another platform's configuration. Ensure each intended role/skill resolves unambiguously and common instructions are not loaded repeatedly through competing entrypoints. Use links only when their discovery and loading behavior works for the selected clients and repository operating systems; otherwise generate tracked copies from the same source.

Before generation, prepare an approved preservation plan for `scripts/verify-canonical-copies.mjs`. The JSON plan uses `version: 1`, `canonical_outputs` (the complete canonical-copy output list from the approved file inventory), and `copies`. Each copy record contains `template`, `sha256`, `output`, `values`, and optional `blocks` records with `slot`, `occurrence`, and `value`. No native adapter belongs in the canonical-copy list. Persist the exact source templates (with markers) in a non-discoverable provenance location for future offline verification. Normalize line endings to LF before calculating template SHA-256 values, as the verifier does. Store inline values as strings, except `APPROVED_MCP_TOOLS`, which is an array of exact tool names. Block fills identify the declared slot and its zero-based occurrence; never use arbitrary search-and-replace edits. The plan is derived from approved answers, never from the generated file being checked. Record its path and hash in the manifest.

Run `node <bootstrap-skill>/scripts/verify-canonical-copies.mjs <template-snapshot-root> <target-repo-root> <preservation-plan.json>` against all canonical copies. Coverage must match the generated-file inventory: no selected mirror or duplicate platform copy may be omitted. The verifier checks exact content after declared substitutions and marker removal, allowing only line-ending normalization; it does not prove native loading or tool availability. If its runtime is unavailable, use an equivalent deterministic comparison with the same coverage and record the method. A visual review alone is insufficient.

Verify native syntax using the platform's documented validation mechanism where available. Then verify discovery, complete instruction loading, effective tool access, artifact operations, and role handoffs in the actual selected environment. Use an isolated disposable fixture for behavioral checks, never product changes or live session artifacts. A source-hash check is not an execution test. Maintainer must keep these checks outside existing session folders.

Record each environment/role/operation as `verified-native`, `verified-fallback`, `blocked`, or `unverified`, with method, result, date, and reason. Report installation separately from verification. A partially verified installation must identify the exact remaining workflows and may not be called fully compatible. Missing required operations block their workflows; absent access to a client leaves execution unverified even if its files parse.

## Maintenance

Use the saved answers, source hashes, adapters, preservation plan, evidence, and baseline to reproduce the existing installation before adapting it. Refresh relevant official documentation when assessing a selected environment's compatibility or a client/version change. Treat canonical changes, platform changes, and repository customizations as separate delta causes.

Do not upgrade a target version because current documentation describes a newer release. Adding or removing an environment is an explicit selection decision; re-check shared-file ownership and discovery collisions before changing files. Never remove a shared file still used by another selected environment.

Migrate version-1 answers by treating the recorded singular `platform` as one environment, retaining its roots, per-file slot values, capability decisions, and baselines. Do not infer additional selected platforms from folders. Record old unverified bindings as such rather than promoting them to verified results. Missing evidence requires discovery, not invented history. Write the version-2 record only with the approved maintenance operation.

Legacy non-slot customizations remain visible in the three-way merge. Do not erase them, absorb them into a new pristine canonical baseline, or label them compliant. Report the preservation conflict and resolve it explicitly; retaining an override leaves that copy outside canonical compliance. Refresh baseline and compatibility evidence only after verification of the approved result, retaining blocked, deferred, and unverified outcomes honestly.
