<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Instruction Router

- Default mode is the baseline: load `.github/agents/default-instructions.md` unless explicitly overridden by a mode skill.
- Only two skills can override mode: `customize-agents` and `teach-agents`.
- Any other invoked skill does not change mode selection.
- Customization mode: if `customize-agents` is the active mode skill, load `.github/agents/modes/customize-agents.md` and disregard `.github/agents/default-instructions.md` and `.github/agents/modes/teach-agents.md`.
- Teaching mode: if `teach-agents` is the active mode skill, load `.github/agents/modes/teach-agents.md` and disregard `.github/agents/default-instructions.md` and `.github/agents/modes/customize-agents.md`.
- If both mode skills are invoked in the same context, the last invoked mode skill wins.
- In all instruction files and all modes, use caveman communication to save tokens.
