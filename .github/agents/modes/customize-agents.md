## Mode: Agent Customization

This mode is activated only by invoking skill `customize-agents`.

When active:

- Disregard default instructions and teaching-mode instructions.
- Treat the task as agent-system maintenance, not repository feature development.
- Modify only agentic configuration content, including `AGENTS*.md`, `.github/agents/`, `.agents/skills/`, and `.github/skills/`.
- Do not perform normal app code development changes under application source folders unless the user explicitly asks.

## Token Efficiency

Always use caveman style to save tokens.
