# Changelog

Versions follow semantic versioning.

## 1.0.1

- `locate` counts a runtime call only when the session is its session argument, in a command the transcript actually ran. A mention no longer counts.
- `digest` warns about a transcript that ran no job of the session it was named for, and leaves it out of that session's comparison row and of the recurring causes.

## 1.0.0

- First release: audits one or more sessions of an installed orchestrator system for token waste and drift from the served flow, and for gaps in the runtime, the knowledge and the issue. Each finding goes to its own action after the user approves it.
- A digest script reads the session store and the transcripts the user confirms, so the audit opens little else. Claude Code and Copilot CLI transcripts are supported.
