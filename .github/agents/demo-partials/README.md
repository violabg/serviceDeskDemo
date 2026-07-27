# Demo Partials

Prompt-scoped instruction modules for the generated Demo agents.

- `shared/` contains cross-role modules that must be loaded whenever a role depends on session rules, glossary or knowledge loading, approval metadata, or the handoff envelope.
- Role folders contain prompt-specific procedures that are not worth loading on every request.
- `vision/` contains the visual extraction contract and session artifact format used by Demo Vision and consumed by non-vision roles.
