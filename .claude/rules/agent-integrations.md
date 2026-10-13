# Agent Integration Routing

Owner: claude-code. Load only docs/agents/bindings/claude-code.md and the complete selected role contract under docs/agents/canonical/claude-code/agents/. Roles run as `claude --agent demo-<role>-claude`.

Scope: all selected agent-system workflows. Use English and preserve the selected role's authority boundaries. Load the current role's full contract and only its already selected environment binding before acting.

Planner uses GitHub Issues through docs/agents/github-issues-adapter.md. Direct Implementor is an explicitly selected separate route and does not require a plan document. Planning approval never authorizes product implementation.

Before image-dependent work, inspect the image with the selected binding's image-inspection procedure; there is no Vision agent. Follow the visual-evidence rules in docs/agents/integration-policy.md.

Configured skills are the complete original-name copies under .agents/skills: author-repo-skill, plan-bug-from-id, plan-user-story-from-id, user-story-analysis, integration-test-knowledge-checklist and manage-work-item. Packaged Bootstrap templates are source mirrors; always resolve configured skills by their exact path. Planning skills belong to demo-planner; manage-work-item runs only on explicit invocation in the default agent.

Path-scoped rules apply through `.claude/rules/` `paths` frontmatter. Never load a foreign environment binding.
