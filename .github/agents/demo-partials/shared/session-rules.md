# Shared Session Rules

- Use one current session folder only: `sessions/<session-id>/`.
- For GitHub-driven workflows, the GitHub issue number is the canonical session ID.
- Reuse the existing session folder when it already exists.
- Session artifacts remain local and gitignored.
- Approved artifacts are immutable. If approved scope changes, create a revision artifact instead of silently editing the approved one in place.
