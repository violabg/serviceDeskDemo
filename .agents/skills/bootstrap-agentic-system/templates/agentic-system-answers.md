# Agentic System Answers Template

Copy this file into the target repository as `agentic-system.answers.yaml` beside the manifest during Bootstrap.

The manifest is the human ledger. This file is the machine-readable record of every resolved decision, so Maintainer can re-render any template with the same answers instead of re-interviewing the user. Bootstrap writes it in the same run that generates the system; Maintainer refreshes it after approved maintenance.

Record the answer that was actually approved, not the recommendation that was proposed. Every slot the generated system uses must appear here, including slots that were resolved to an intentional no-op.

```yaml
# Machine-readable record of the approved Bootstrap decisions. Do not hand-edit
# without also refreshing docs/agents/.baseline/ and the manifest.
version: 1

bootstrap:
  skill_version: <x.y.z>
  contract_applied_through: <x.y.z>
  generated_on: <YYYY-MM-DD>

platform:
  target: <github-copilot | claude-code | cursor | other>
  agent_root: <path>
  skill_root: <path | none>
  instruction_root: <path>

# One entry per Personalization Slot in registry/placeholders.yaml that the
# generated system uses. `source` records how the value was settled.
slots:
  <SLOT_NAME>:
    value: <approved-value>
    source: <discovery | user | recommend-accepted | fallback>
    evidence: <what-in-the-repository-justified-it | none>

# One entry per capability in registry/capabilities.yaml. When the platform has
# no native tool, record the installed fallback rather than dropping the capability.
capabilities:
  <capability-name>:
    resolution: <native-tool | fallback | user-supplied>
    tool: <exact-tool-name | none>
    note: <why | none>

# Files this run generated, in the order they were written. Maintainer uses this
# list to pair each live file with its pristine copy under .baseline/.
generated:
  - path: <repo-relative-path>
    template: <templates/...-path | authored>
    baseline: <baseline-dir>/<repo-relative-path>

deferred:
  - decision: <what-was-deferred>
    reason: <why>
```

Keep this file in sync with `.baseline/`. A file listed in `generated` with no pristine copy under the baseline directory, or a baseline copy with no entry here, is a broken maintenance baseline and must be reported rather than ignored.
