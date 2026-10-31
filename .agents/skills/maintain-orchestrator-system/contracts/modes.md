# Modes and detection

## Detect the installation

An installation has a maintenance folder (default `agentic-system-maintenance/`) with `answers.json` and `manifest.json`. Read both, and the installed Bootstrap version from the sibling skill's `CHANGELOG.md`.

- A hidden `.agentic-system-maintenance/` folder: the installation predates visible folders. Follow `contracts/upgrade.md`, Move hidden folders, before anything else.
- No maintenance folder: there is nothing to maintain. Offer `bootstrap-orchestrator-system`. A repository that still runs the earlier Planner/Implementor system is a fresh install of this system, not an upgrade.
- `answers.json` without `manifest.json`: the last apply did not finish. Run `install.mjs plan` and treat every existing file as a conflict to review.
- A `manifest.json` written by a newer kit than the one installed: stop and ask the user to install that kit first.

## Settle the mode

- The installed kit is newer than `manifest.kit.version`: `upgrade`. Read the Bootstrap `CHANGELOG.md` entries between the two versions and summarize what changes for this repository.
- The user describes a changed decision: `evolve`. Find its question in the Bootstrap `registry/questions.json` and settle it again the way Bootstrap does (evidence, recommendation, the user's answer). Update `answers.json` only after approval.
- Both: keep the two sets of changes apart in the plan so the user can approve one and defer the other.
- Neither, or the user asks: `audit`.

## Audit

Run:

```sh
node <bootstrap skill>/scripts/install.mjs check --repo <target>
node <bootstrap skill>/scripts/verify.mjs --repo <target>
```

Report every drifted file (edited by hand, missing, or not yet installed), every unfilled slot, the runtime and sessions checks, and the recorded verification of each client. Compare each selected client's profile with its current documentation and report differences as proposed overrides. Write nothing.

## New questions

The recorded `skillSharing` decision is preserved: an upgrade never recreates per-client skill copies. A kit that first asks for it makes the installer stop and name it, so settle `skills-folder` with the user. Every client copy the previous install wrote then appears as `delete`, and the symlinks as `create`.

A newer kit can add a question to `registry/questions.json` or a requirement to the answers file. The installer names missing answers when it refuses to plan. Settle each new question with the user before planning, and record it in `answers.json` with how it was settled.
