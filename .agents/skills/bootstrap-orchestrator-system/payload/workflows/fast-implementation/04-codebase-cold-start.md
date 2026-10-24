You are executing the codebase cold start understanding of the Fast Implementation workflow. Your job is ONE thing: build the panorama the work needs — the components it involves and how they interact — and the gaps that separate the code today from what the work requires. You survey; you do not excavate. You do not decide the solution and you do not choose the files the change will write. This workflow has no design document: you record the panorama for the implementation step, you write it into no design artifact.

## The candidate set
- `#capability:codebase-clusters` decomposes the codebase into domains (requires `WorkspacePath` and `fileExtension`); `#capability:codebase-cluster-files` (requires the same two plus `clusterName`) returns the **full paths** of the files in a cluster. A path listed here exists.
- Select ONLY the filenames the work touches or plugs into: the component that will change, the component that calls it or is called by it, the boundary the change crosses, a clear insertion point (facade, service, controller). Everything else is out.
- Never select a file because it looks similar, shares words, or "might be reusable". Similarity is not relevance.
- If the clusters reveal a concept covered by a knowledge document you have not read, read that document. Never re-read knowledge.

## Reading rule — declarations, not bodies
- Read a file ONLY if the panorama or a gap cannot be stated without it.
- Prefer the declaration surface — types, members, signatures, interfaces — over the implementation body. The panorama names the mechanism; it never re-derives it.
- Read a full body only for the few components whose behaviour the panorama must state, and never dump a whole file when you need one member.
- Never re-read a file, and never read a file the panorama or a gap does not need. Stop as soon as the two prose blocks can be stated: when a question needs more reading than the components the work involves, it is a note, not a reason to read further.
- Do NOT follow dependency chains: do not read "the concrete implementation of a contract" or "the entity behind a facade" unless that file is one of the components above.

## Locate and read efficiently
- **Enumerate live, ignore-aware, scoped.** Enumerate files with ripgrep's ignore-aware walker — `rg --files [<subtree>]` — or `git ls-files` when the workspace is a git repository. Do NOT run `Get-ChildItem -Recurse` over the whole workspace and do NOT materialize a workspace-wide index: the walk must respect the repository ignore rules (excluding `bin/`, `obj/`, `node_modules/`, `.git/` and similar) and stay scoped to the subtree you need.
- **Search content with `rg`, scoped.** To locate a symbol, use `rg -l "<Symbol>" <subtree>`; to see its occurrences, `rg -n "<Symbol>" <subtree>`. Scope every search to the smallest subtree that can contain the answer; NEVER scan the whole workspace — neither with `Select-String -Path` nor with an unscoped `rg`.
- **Read a window, not the body.** Do not try to extract a file's "declarations" with a language-specific regex: it fails on members that carry no access modifier (interfaces) and it is not portable across languages. Locate the member you need with `rg -n "<identifier>"` and read a bounded window of lines around it.
- **One channel per file.** When the panorama genuinely needs a file's content, read it with the dedicated `read` tool, not by re-dumping it through `bash`: the same read is then reusable if you later edit that file. Use `bash` for enumeration and search.
- **Batch one round into ONE `bash` command** (print only the regions you need under a `===== <path> =====` banner); and when a round has independent lookups, issue them in parallel in the same message instead of one per turn.
- If a command output is truncated, read the ephemeral file with the `read` tool; never re-dump a file you already read. If a command fails, fix it and retry once; if it still fails, fall back to `git ls-files`/`rg` when available, otherwise record a blocker and halt.

## Failure arms
- `#capability:codebase-clusters` or `#capability:codebase-cluster-files` fails: retry once; if it still fails, state that the panorama cannot be built, record a blocker and halt.
- A `read` of a selected file fails: retry once; if it still fails, record a blocker and halt.

---

## What this step raises — the notes

Record, in agent memory (`#capability:session-memory-append`), the panorama and the gaps as structured prose, together with every **reuse candidate** you noticed but did NOT read in depth: a symbol that may already do part of the work, or that may need extending. Do not resolve them here, and do not read the implementation to answer them — the implementation step will. This is a running list and is never closed here.

Do not call any `#capability:design-*` operation.

After completing ALL the provided instructions, call the tool `#capability:workflow-step-next` again to receive the next instruction. Do not deviate from these instructions or take any action they do not authorize.
