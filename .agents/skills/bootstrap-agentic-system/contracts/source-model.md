# Bootstrap Source Model

Load source assets only when their output is needed.

## Primary Templates

- `templates/generated-system-blueprint.md`: first-install structure, batch order, directory strategy, and generated-system map.
- `templates/bootstrap-file-plan.md`: proposal and approval plan shape.
- `templates/agents/`: Canonical Template Mirrors for generated agents.
- `templates/skills/`: Canonical Template Mirrors for generated skills.
- `templates/instructions/`: Canonical Template Mirrors for the root instruction router and the modular instruction files it routes to.
- `templates/agentic-system-manifest.md`: provenance ledger, customization register, and maintenance handoff.
- `templates/agentic-system-answers.md`: machine-readable record of every approved slot value, capability resolution, and generated-to-baseline path pair.
- `templates/knowledge-index-schema.md`: bounded knowledge-loading index.
- `templates/plan-schema.md`: implementation-plan artifact contract.
- `templates/artifact-gates.md`: artifact, gate, and handoff conventions.
- `templates/agent-role-contracts.md`: baseline role, tool, and delegation reference for roles without mirrors or for validating mirrored frontmatter.
- `templates/agent-contracts.md`: custom agent contract reference when no mirror exists.

## Personalization Registry

- `registry/placeholders.yaml`: every Personalization Slot with its decision question, the target-repository evidence to inspect (`infer_from`), and the default proposal to state (`recommend`).
- `registry/capabilities.yaml`: capabilities the generated system needs, per-platform tool defaults, and the fallback to install when a platform lacks a native tool.

A `recommend` value is a proposal, never an approval. Essential capabilities are never dropped: when the target platform has no native tool, install the declared fallback instead.

## Provenance Input

The installed Bootstrap `CHANGELOG.md` is a provenance input. Read it once during generation, copy it to the target repository's snapshot path, and record both paths in the manifest. After bootstrap, the manifest, answers file, baseline directory, and repo-local snapshot are the durable local baseline for Maintainer.

## Vocabulary

- Canonical Template Mirror: a public-safe generated-agent, generated-skill, or generated-instruction source file under `templates/agents/`, `templates/skills/`, or `templates/instructions/` whose non-slot wording must be preserved.
- Personalization Slot: an approved `{{PLACEHOLDER}}` value or `CANONICAL-TEMPLATE-SLOT` block that Bootstrap may fill from target-repository evidence or explicit user approval.
- Preserved Canonical Body: every non-slot line, heading, frontmatter baseline, gate, and rule copied from a mirror.
- Generated Runtime File: the target repository file produced from a mirror after placeholder fill and marker stripping.
- Schema Gate: validation that generated Planner and artifacts explicitly cite and obey the generated knowledge-index and plan-schema paths.
- Contract Delta: a future Bootstrap, template, schema, or changelog change that Maintainer must classify against an existing generated system.
- Maintenance Baseline: the answers file, the pristine `.baseline/` copies, and the customization register, written together so a later maintenance run can separate repository customization from untouched generated content.
