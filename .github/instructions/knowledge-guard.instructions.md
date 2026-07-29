---
applyTo: "docs/agents/knowledge/**/*.md"
---

# Knowledge File Guard

- Read knowledge files only through `docs/agents/knowledge/README.md` and its selected knowledge documents.
- Edit knowledge files only through `docs/agents/knowledge/README.md` and its selected knowledge documents.
- Register every new or renamed knowledge file in `docs/agents/knowledge/README.md` with a `When to read` trigger specific enough to keep unrelated requests from loading it.
- Keep one subject per knowledge file. Split a file that answers unrelated questions instead of growing it.
- Record the source of every stated fact. Remove a claim that no longer matches the repository instead of leaving it unverified.

When the approved knowledge source is unavailable, stop and report:

> Cannot proceed: the approved knowledge source is unavailable. Restore access before reading or editing knowledge files.
