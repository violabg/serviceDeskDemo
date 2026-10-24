# Plan, merge and apply

## Plan

```sh
node <bootstrap skill>/scripts/install.mjs plan --repo <target>
```

The installer renders the files from the current kit and answers, and compares each with the repository and the manifest:

| Action | Meaning | What to do |
| --- | --- | --- |
| `unchanged` | Already matches. | Nothing. |
| `create` | New in this kit or for this decision. | Approve. |
| `update` | The repository copy is untouched since the last apply. | Approve. |
| `delete` | No longer installed, untouched. | Approve. |
| `merge` | A customizable file (router block, skill) was edited by hand and the render changed. | Merge, below. |
| `conflict` | A non-customizable file (role, workflow, contract, runtime, config) was edited by hand, a removed file was edited, or a settings value is set differently. | The user decides, below. |

The maintenance plan states the mode and why, the kit versions, the changed answers, every entry other than `unchanged` with its reason, the clients to re-verify, and rollback notes (git restores every tracked file; files in the user folder are listed separately). Approval is false by default.

## Merge a customizable file

Three versions exist:

- **base**: `<maintenance root>/baseline/<path>`, the copy installed last time;
- **mine**: the file in the repository now;
- **theirs**: the new render, printed by `install.mjs show <path>`.

Compare by section. A section only theirs changed: take theirs. A section only mine changed: keep mine. A section both changed: show the user both and the kit's reason (from the changelog), and let them choose or merge. Write the merged result into the repository file, then apply with `--keep <path>` so the installer records it as a kept customization.

## Decide a conflict

Show what the repository changed (`git diff`, or the file against `install.mjs show <path>`). The user chooses:

- `--take <path>`: the kit's version replaces the edit. Recommended for roles, workflows, contracts and the runtime: the system depends on their exact text.
- `--keep <path>`: the edit stays and is recorded. It is asked again whenever the kit changes that file.

A repository-specific procedure belongs in its own skill (`author-repo-skill`), never in an edited installed file.

## Apply

```sh
node <bootstrap skill>/scripts/install.mjs apply --repo <target> [--take <path>]... [--keep <path>]...
```

Apply refuses while an entry is unresolved. It refreshes the manifest and the baselines only for what it applied.

When sessions move (evolve), move the existing session folders to the new location after the apply, with the user's approval, without reading their contents. Remove the old `.gitignore` block or client permissions only through the installer: they disappear from the plan when they are no longer rendered.

## After

Run `verify.mjs`, then the native checks for every client the change touched, record the results in `answers.json` and apply once more so the guides show them. Report what changed, what was kept, what was deferred, and the new kit version in the manifest.
