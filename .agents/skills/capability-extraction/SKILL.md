---
name: capability-extraction
description: "Use when: extracting functional capabilities from a Next.js service desk codebase, mapping user-facing capabilities to routes, components, server actions, services, Prisma models, and tests."
argument-hint: "Provide a module, route, or feature area"
---

# Capability Extraction

Use this skill to build knowledge artifacts that explain what the application can do.

Follow `docs/agents/governance.md` as the durable workflow policy source.

## Procedure

1. Identify the feature area: dashboard, tickets, clients, technicians, assets, reports, or administration.
2. Map visible routes and screens.
3. Map server actions, route handlers, services, and Prisma models involved.
4. Extract user-facing capabilities without dumping implementation details.
5. Capture where each capability is implemented and which tests cover it.
6. Store durable cross-session capability knowledge in repo docs only when it remains broadly reusable; keep one-session evidence in the session artifact package instead.

## Output Format

```markdown
# Functional Capability Catalog: <area>

| Capability | What | Where | How | Test Evidence |
| ---------- | ---- | ----- | --- | ------------- |
| ...        | ...  | ...   | ... | ...           |
```

Keep `What` business-oriented. Keep `Where` and `How` concise enough for future agents to navigate the codebase.
