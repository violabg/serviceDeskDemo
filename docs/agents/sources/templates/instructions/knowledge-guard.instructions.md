---
applyTo: "{{KNOWLEDGE_FILE_GLOB}}"
---

# Knowledge File Guard

- Read knowledge files only through `{{KNOWLEDGE_SOURCE}}`.
- Edit knowledge files only through `{{KNOWLEDGE_SOURCE}}`.
- Register every new or renamed knowledge file in `{{KNOWLEDGE_INDEX_PATH}}` with a `When to read` trigger specific enough to keep unrelated requests from loading it.
- Keep one subject per knowledge file. Split a file that answers unrelated questions instead of growing it.
- Record the source of every stated fact. Remove a claim that no longer matches the repository instead of leaving it unverified.

When the approved knowledge source is unavailable, stop and report:

> Cannot proceed: the approved knowledge source is unavailable. Restore access before reading or editing knowledge files.
