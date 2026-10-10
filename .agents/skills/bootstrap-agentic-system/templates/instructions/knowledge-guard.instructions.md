---
applyTo: "{{KNOWLEDGE_FILE_GLOB}}"
---

# Knowledge File Guard

<!-- CANONICAL-TEMPLATE-SLOT: MAINTENANCE_ROOT START replaces=none -->
- Generated project knowledge and its index live under top-level `knowledge/`. Existing authoritative project docs may be indexed in place.
- Never read, search, index, summarize, or link `{{MAINTENANCE_ROOT}}` or installed Bootstrap/Maintainer bodies, resources, and aliases during ordinary knowledge work. Exclude them before retrieval and pass exclusions to delegates; only initial Bootstrap or explicit agent-system maintenance may access them.
<!-- CANONICAL-TEMPLATE-SLOT: MAINTENANCE_ROOT END -->
- Read knowledge files only through `{{KNOWLEDGE_SOURCE}}`.
- Edit knowledge files only through `{{KNOWLEDGE_SOURCE}}`.
- Register every new or renamed knowledge file in `{{KNOWLEDGE_INDEX_PATH}}` with a `When to read` trigger specific enough to keep unrelated requests from loading it.
- Keep one subject per knowledge file. Split a file that answers unrelated questions instead of growing it.
- Record the source of every stated fact. Remove a claim that no longer matches the repository instead of leaving it unverified.

When the approved knowledge source is unavailable, stop and report:

> Cannot proceed: the approved knowledge source is unavailable. Restore access before reading or editing knowledge files.
