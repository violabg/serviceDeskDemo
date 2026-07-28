# Context Glossary

Use this file for stable repository code and domain vocabulary. Keep knowledge index separate.

## Preferred Terms

| Term | Meaning | Use | Avoid | Notes |
| --- | --- | --- | --- | --- |
| Service Desk | Demo application domain | Planning, docs, agent prompts, knowledge | helpdesk when referring to this repo's product name | Use repo language consistently |
| customer | Business actor receiving or requesting service | Domain docs, plans, agents, knowledge | client | `client` reserved for technical meanings such as API client, HTTP client, DB client |
| ticket | Work item in service desk domain | Product and domain discussions | case unless external system requires it | Distinct from GitHub issue |
| GitHub issue | Tracker work item in repository workflow | Tracker, session, planning intake | ticket when referring to repository tracker object | Use precise tracker vocabulary |
| session | Local planning and implementation artifact package | Agent workflow, handoff, approval, artifact discussion | run, job | Stored under `sessions/<session-id>/` |
| session artifact | Durable file inside session package | Handoff, approval, execution status | note, scratch file | Not committed product knowledge |
| implementation plan | Approved artifact that gates code work | Planner and implementor workflow | spec when approval-gated file is meant | Uses repo-local plan schema |
| knowledge index | Routing file for bounded knowledge loading | Agent workflow | glossary | Current path: `docs/agents/knowledge/README.md` |
| common knowledge | Durable cross-session workflow knowledge | Agent system docs | session artifact | Current path: `docs/agents/common-knowledge.md` |
| application user | Local signed-in user as evaluated by access-control workflow | Access, auth, pending-access, admin planning | customer when referring to signed-in actor inside system | Distinct from business actor `customer` |
| effective permissions | Allow-only union of permission keys granted through assigned roles | Access-control logic, route gating, navigation gating | flags, capabilities | Derived set, not free-form state |
| pending access | Authenticated user state without dashboard read access | Login redirect, route gating, access onboarding | unauthorized, logged out | Route: `/pending-access`; unauthenticated users still go to `/login`; new protected sections should not rely on this state until seeded permission keys exist |
| base permissions | Code-defined permission set generated from `ACCESS_SECTIONS` × `ACCESS_OPERATIONS` | Access-control planning, seeding, admin scope discussions | manual permissions | Not created directly from UI input; when adding new protected routes or sections, run seed/bootstrap so keys are created and attached to Admin role / initial admin user |
| service desk navigation | Permission-gated grouped navigation model for dashboard surfaces | Navigation, access-control, section planning | menu when permission model matters | Current source: `lib/service-desk-navigation.ts` |
| dashboard | Main grouped application area | Route, navigation, permissions, UI docs | admin when non-admin area intended | Keep route ownership precise |
| admin | Admin-only application area | Route, permissions, planning, knowledge | dashboard when admin-only area intended | Separate from general dashboard |
| section permission flow | Rule set for adding new dashboard or admin areas | Planning, knowledge, access-control work | access setup | Tied to `docs/agents/knowledge/dashboard-section-permission-flow-checklist.md` |

## Source-Of-Truth Boundaries

- Repository tracker workflow: `docs/agents/issue-tracker.md`
- Durable agent workflow rules: `docs/agents/common-knowledge.md`
- Knowledge loading rules: `docs/agents/knowledge/README.md`
- Domain-doc consumption rules: `docs/agents/domain.md`

## Agentic System Terms Kept Separate From Product Domain

- `agent`: workflow role, not product actor
- `knowledge`: durable repository guidance, not session notes
- `artifact gates`: workflow approval and handoff contract, not product feature behavior
