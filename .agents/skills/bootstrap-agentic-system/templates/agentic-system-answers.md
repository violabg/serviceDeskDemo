# Agentic System Answers Template

Copy this file into the target repository as `agentic-system.answers.yaml` beside the manifest during Bootstrap.

The manifest is the human ledger. This file is the machine-readable record of every resolved decision, so Maintainer can re-render any template with the same answers instead of re-interviewing the user. Bootstrap writes it in the same run that generates the system; Maintainer refreshes it after approved maintenance.

Record the answer that was actually approved, not the recommendation that was proposed. Every slot the generated system uses must appear here, including slots that were resolved to an intentional no-op.

```yaml
version: 2
bootstrap:
  skill_version: <x.y.z>
  contract_applied_through: <x.y.z>
  generated_on: <YYYY-MM-DD>
execution_host: <client-running-this-workflow>

# Only explicitly selected environments. Keys are open user-defined IDs.
environments:
  <environment-id>:
    platform: <selected-name-including-user-entered-Other>
    client: <client-and-execution-context>
    version: <detected-or-requested-version | unknown>
    roots:
      agents: <verified-path>
      skills: <verified-path | none>
      instructions: <verified-path>
    evidence:
      - url: <official-source-url>
        retrieved_on: <YYYY-MM-DD>
        applies_to: <client-version>
        claim: <format-loading-or-tool-behavior>
        local_result: <observed-result | unverified>
    compatibility: <verified-native | verified-fallback | blocked | unverified>
    verification: <method-result-date-and-limitations-or-evidence-path>

# Shared scalar or exact canonical-copy path map; never reuse another environment's value.
slots:
  <SLOT_NAME>:
    value: <approved-value-or-per-file-map>
    source: <discovery | user | recommend-accepted | fallback>
    evidence: <supporting-evidence>

# Resolve each needed operation for each environment and role.
capabilities:
  <environment-id>:
    <role>:
      <operation>:
        capability: <registry-id-or-source-capability-token>
        binding: <native-tool | integration | repo-skill | local-contract | fallback>
        invocation: <exact-tool-or-procedure>
        inputs_outputs: <required-inputs-and-artifacts>
        prerequisites: <configuration-authentication-and-effective-permissions-no-secrets>
        status: <verified-native | verified-fallback | blocked | unverified>
        evidence: <source-and-verification-result-date>

preservation:
  plan: <path-to-approved-preservation-plan.json>
  plan_sha256: <hash-of-approved-plan>
  sources: <non-discoverable-template-snapshot-root>
  verification: <command-result-date>

# One owner per physical file. Shared files list all consuming environments.
generated:
  - path: <repo-relative-path>
    kind: <canonical-copy | native-adapter | shared-resource | provenance>
    environments: [<environment-id>]
    template: <templates/...-path | authored>
    source_sha256: <hash | not-applicable>
    canonical_copy: <path-for-adapter | not-applicable>
    loading: <direct | verified-import | lossless-embedding | not-applicable>
    baseline: <baseline-dir>/<repo-relative-path>

deferred:
  - environment: <id | shared>
    decision: <what-was-deferred>
    reason: <why>
```

For version-1 migration, follow `contracts/platform-compatibility.md`: retain the recorded single platform, roots, decisions, and baselines as one environment; do not infer new selections or verified results.

Keep this file in sync with `.baseline/`. A file listed in `generated` with no pristine copy under the baseline directory, or a baseline copy with no entry here, is a broken maintenance baseline and must be reported rather than ignored.
