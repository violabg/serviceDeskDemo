# Contract Audit

## Result

Pass for the approved file inventory and structural Bootstrap contract checks. Native runtime compatibility remains unverified.

## Checks

| Check | Result | Evidence | Fix Needed |
| --- | --- | --- | --- |
| Required first-batch roles | Pass | Seven generated roles per target, including Planner, Implementor, Direct Implementor, Integration Tester, Knowledge Builder, Ask and Vision | None |
| Selected skills | Pass | Five `demo-` skills generated; business-logic gap detector recorded as deferred | None |
| Canonical preservation | Pass | 22 source-hash and exact-copy checks in `validation-report.md` | None |
| Planner schema/index gates | Pass | Both Planner copies name the existing index and plan schema before their use | None |
| Tracker/session contract | Pass | `github-issues-adapter.md` distinguishes issue and session IDs, bounds linked-issue retrieval and requires direct resume | None |
| Knowledge/glossary separation | Pass | Existing index is preserved; glossary is separate and vocabulary-focused | None |
| Maintenance baseline | Pass | 93 generated entries have matching pristine files under `.baseline/` | None |
| Vision decision | Pass | Luna registrations are present; Copilot adapter carries the explicit invocation override and it is in the customization register | None |
| Client and MCP behavior | Unverified | `compatibility.md` lists reload, discovery, role, tool, handoff and live-MCP checks still required | Run the listed disposable-fixture checks in each selected client |

## Approved Exceptions And Deferrals

- `demo-vision` may be callable as a Copilot subagent because the user explicitly overrode the canonical `disable-model-invocation` value in its native adapter. The canonical copy remains unchanged.
- Planner and Direct Implementor process images inline when their active model supports image input. Otherwise, they require a discovered `demo-vision` role using Luna. The pre-install Codex host did not expose custom roles, so it must be reloaded and verified before that delegation path is used.
- The business-logic gap detector skill is deferred.
- No free-form or local-Markdown planning adapter, tracker-write grant, Neon project-management grant or Next.js upgrade grant is installed.

## Validation Limits

The independent Python verifier passed 616 structural checks. The shipped Node verifier could not run because this sandbox blocked Node, including the requested elevation. Product lint, typecheck, tests and build were not run because the approved changes are limited to agent-system files and documentation.
