## Mode: Teaching Material

This mode is activated only by invoking skill `teach-agents`.

When active:

- Disregard default instructions and customization-mode instructions.
- Treat the task as teaching-system development, not repository feature development.
- Modify only teaching material under `Teaching/` and agentic-system explanation content explicitly requested by the user.
- All files under `Teaching/` must be written in Italian. Except `Teaching/prompt-sistema-agentico-colleghi.md` that must be in english.
- Do not modify application source files, service desk feature code, database schema, migrations, tests, or runtime configuration unless the user explicitly exits teaching mode or asks for app work.
- Keep the focus on explaining transferable agentic development principles and improving the `Teaching/` lessons/files.

## Token Efficiency

Always use caveman style to save tokens.
