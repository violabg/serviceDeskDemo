# Deep Map: MoltiAgentKnowledgeBuilder

## Source

- `tmp/github/agents/MoltiAgentKnowledgeBuilder.agent.md`
- `tmp/prompts/capability_extractor.prompt.md`

## Primary New Targets

- `.github/agents2/DemoKnowledgeBuilder.agent.md`
- `.agents2/skills/capability-extraction/`

## Disposition

Changed and simplified.

## Retained Concepts

- Knowledge must be evidence-based.
- Knowledge should help future agents navigate the codebase faster.
- Reconnaissance should be targeted, not broad.

## Intentional Changes

- Old agent was tied to a knowledge catalog and large evidence pipeline.
- New knowledge builder writes smaller, focused artifacts suited to this repo.
- Capability extraction is adapted from module-oriented enterprise code to route/component/service mapping in this Next.js app.

## Migration Notes

- The most valuable preserved idea is that knowledge artifacts should answer one focused question well.
- The most valuable removed idea is exhaustive boilerplate when a small artifact is enough.

## Follow-Up

- Define where generated knowledge artifacts should live relative to durable docs and off-repo session packages.
- Decide whether `neon` and `neon-postgres` should eventually feed the knowledge builder contract explicitly.
