---
name: teach-agents
description: Activate teaching-material mode for agentic teaching content.
disable-model-invocation: true
---

Load `.github/agents/modes/teach-agents.md`.

Disregard `.github/agents/default-instructions.md` and `.github/agents/modes/customize-agents.md` while this skill is active.

Use caveman style to save tokens.

When editing `Teaching/skills/bootstrap-agentic-system/SKILL.md`, keep all references self-contained to the `Teaching/skills/bootstrap-agentic-system/` skill folder and files inside it.
Do not link to or mention files outside that skill folder, because the skill must work when copied by itself into another repo.
Treat that skill's main goal as producing the best possible portable agentic system by reflecting the agent, skill, gate, artifact, handoff, knowledge-loading, and teaching patterns proven in this repo's demo ecosystem.
Preserve those repo-derived rules as transferable principles inside the skill material, without depending on repo-local file paths outside `Teaching/skills/bootstrap-agentic-system/`.
