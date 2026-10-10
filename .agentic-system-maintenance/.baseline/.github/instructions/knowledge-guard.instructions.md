---
applyTo: "knowledge/**/*.md"
---

# Knowledge File Guard

Generated project knowledge lives under `knowledge/`. Keep maintenance records and the installed Bootstrap/Maintainer skill bodies out of ordinary knowledge discovery and indexing.

- Read knowledge files only through `knowledge/knowledge-index.md`.
- Edit knowledge files only through `knowledge/knowledge-index.md`.
- Register every new or renamed knowledge file in `knowledge/knowledge-index.md` with a `When to read` trigger specific enough to keep unrelated requests from loading it.
- Keep one subject per knowledge file. Split a file that answers unrelated questions instead of growing it.
- Record the source of every stated fact. Remove a claim that no longer matches the repository instead of leaving it unverified.

When the approved knowledge source is unavailable, stop and report:

> Cannot proceed: the approved knowledge source is unavailable. Restore access before reading or editing knowledge files.
