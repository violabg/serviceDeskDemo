# Agentic System Manifest Template

Copy or adapt this file into the target repository during Bootstrap so Maintainer can compare the installed system against later public skill versions.

Keep this manifest about repo-local Agentic System provenance and current contract state. Do not use it as a knowledge index, context glossary, implementation plan, or changelog replacement.

This file does not update itself. Bootstrap initializes it, and Maintainer updates it after approved maintenance so the repository always carries its current applied baseline.

```markdown
# Agentic System Manifest

## Source Package

- Package: `agentic-system-kit`
- Installed Bootstrap Skill Path: `<path-to-bootstrap-agentic-system>/SKILL.md`
- Installed Bootstrap Skill Changelog Path: `<path-to-bootstrap-agentic-system>/CHANGELOG.md`
- Installed Maintain Skill Path: none | `<path-to-maintain-agentic-system>/SKILL.md`
- Installed Maintain Skill Changelog Path: none | `<path-to-maintain-agentic-system>/CHANGELOG.md`
- Package Changelog Path For Context: none | `<path-to-installed-or-source-package>/CHANGELOG.md`

## Installed Contract Versions

- Bootstrap Skill Version Used: `<x.y.z>`
- Bootstrap Contract Applied Through: `<x.y.z>`
- Bootstrap Snapshot Source Status: copied from installed skill changelog | inferred from repo evidence | unknown
- Maintain Skill Version Last Applied: none | `<x.y.z>`
- Last Maintenance Date: none | `<YYYY-MM-DD>`

## Generated System Paths

- Root Instructions: `AGENTS.md` | `<platform-equivalent-path>`
- Context Glossary: none | `<path>`
- Knowledge Index: `<path>`
- Plan Schema: `<template-dir>/plan-schema.md`
- Question Schema: `<template-dir>/question-schema.md`
- Artifact Gates: none | `<template-dir>/artifact-gates.md`
- Agent Directory: `<agent-dir>`
- Skill Directory: none | `<skill-dir>`
- Bootstrap Changelog Snapshot: `<path>`
- Session Root: `<session-root>`

## Maintenance History

| Date | Maintain Skill Version | Bootstrap Contract Before | Bootstrap Contract After | Plan Or Summary Path | Notes |
| --- | --- | --- | --- | --- | --- |
| `<YYYY-MM-DD>` | `<x.y.z>` | `<x.y.z>` | `<x.y.z>` | `<path>` | Initial manifest creation. |
```

Bootstrap should read the installed Bootstrap skill `CHANGELOG.md` once, copy it to the repo-local Bootstrap changelog snapshot path when available, and fill known paths and versions before asking for file-plan approval. If no installed skill changelog is available, Bootstrap should infer the initial baseline from repository evidence and record `Bootstrap Snapshot Source Status: inferred from repo evidence` or `unknown`.

Maintainer should compare the repo-local Bootstrap changelog snapshot against the currently installed Bootstrap skill `CHANGELOG.md` when available, but it must still inspect the current repository files and may mark a changelog entry `applied` when the repo already satisfies that release requirement even if the snapshot is missing, stale, or incomplete.

After approved maintenance succeeds, Maintainer should refresh the repo-local Bootstrap changelog snapshot to the latest installed Bootstrap skill `CHANGELOG.md` when available and then update `Bootstrap Contract Applied Through`, `Maintain Skill Version Last Applied`, `Last Maintenance Date`, and `Maintenance History` in the manifest so the next run starts from the new baseline.