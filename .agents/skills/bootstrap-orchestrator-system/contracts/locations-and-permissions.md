# Locations and permissions

Where each part of the system lives, and what makes a location outside the repository work.

## Location groups

| Group | Location | Choice |
| --- | --- | --- |
| Client discovery files: role files, skills, `AGENTS.md` / `CLAUDE.md`, client settings | where each client discovers them, in the repository | none |
| Runtime, its `config.json`, workflows, contracts | `locations.runtimeRoot`, default `.agentic-system/`, tracked | derived |
| Sessions and the runtime cache | `locations.sessionsRoot` | **the user chooses** |
| Installation records: answers, manifest, baselines | `locations.maintenanceRoot`, default `.agentic-system-maintenance/`, tracked | derived |
| Project knowledge | `locations.knowledgeRoot`, default `knowledge/`, tracked | derived |
| Client guides | `locations.guideRoot`, default `docs/agentic-system/`, tracked | derived |
| Example documentation templates | the user folder (`locations.userRuntimeRoot`) or the workspace folder `<runtime root>/documentation/templates/` | the user chooses |

The runtime, the records, the knowledge and the guides stay in the repository so that a teammate's clone works and anyone can run maintenance.

## Sessions

Recommend a folder outside the repository, `~/.agentic-system/sessions/<repo-name>`. Sessions belong to one developer, change constantly and must not pollute the repository or its search results. The alternative is a repository folder such as `.agentic-system-sessions/`; the installer then adds it to `.gitignore` inside a managed block.

The runtime keeps its cache in `<sessions root>/.cache`, so the tracked runtime folder never receives generated files.

## Locations outside the repository

A location outside the repository works only when all of these hold:

1. **Recorded.** It is in the answers file and in `<runtime root>/config.json`, which the runtime reads. The installer writes the config.
2. **Portable.** It is written with `~` (or another path that resolves on every teammate's machine), never as one person's absolute path. The runtime expands `~`.
3. **Reachable.** Every selected client may read and write it from the roles that need it. The installer adds the client setting where the profile names one: `additionalDirectories` for Claude Code, `writable_roots` for the Codex sandbox, `external_directory` for OpenCode. For a client without a project permission file the user approves on first use; record that.
4. **Verified.** `verify.mjs` creates a session through the runtime; phase F repeats it from each client.

Some clients may not expand `~` in their own settings. When phase B finds that, record an override with the form the client documents and say in the guide what each developer does once on their machine.

## Runtime command

Every role that uses the runtime runs `node <runtime root>/bin/agentic-system.mjs <command>` from the repository root. The installer allows exactly that command in the client settings where the profile has a permission file (`Bash(node .agentic-system/bin/agentic-system.mjs *)` for Claude Code, a terminal auto-approve entry for VS Code, a `bash` permission for OpenCode). Never allow a broader shell pattern for it. Settings files are merged: existing entries stay, and a value already set differently is a conflict for the user to resolve.
