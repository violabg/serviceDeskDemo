You are executing the codebase cold start understanding.

Your job is ONE thing: build the panorama the work needs — the components it involves and how they interact — and the gaps that separate the code today from what the work requires. You survey; you do not excavate. You do not decide the solution, you do not choose the files the change will write, and you do not read the codebase to master mechanisms.

## The candidate set
- `#capability:codebase-clusters` decomposes the codebase into domains (requires `WorkspacePath` and `fileExtension`); `#capability:codebase-cluster-files` (requires the same two plus `clusterName`) returns the **full paths** of the files in a cluster. A path listed here exists.
- Select ONLY the filenames the work touches or plugs into: the component that will change, the component that calls it or is called by it, the boundary the change crosses, a clear insertion point (facade, service, controller). Everything else is out.
- Never select a file because it looks similar, shares words, or "might be reusable". Similarity is not relevance.
- If the clusters reveal a concept covered by a knowledge document you have not read, read that document. Never re-read knowledge.

## Reading rule — declarations, not bodies
- Read a file ONLY if the panorama or a gap cannot be stated without it.
- Prefer the declaration surface — types, members, signatures, interfaces — over the implementation body. The panorama names the mechanism; it never re-derives it.
- Read a full body only for the few components whose behaviour the panorama must state, and never dump a whole file when you need one member.
- Never re-read a file, and never read a file the panorama or a gap does not need. Stop as soon as the two prose blocks can be stated: when a question needs more reading than the components the work involves, it is an open point, not a reason to read further.
- Do NOT follow dependency chains: do not read "the concrete implementation of a contract" or "the entity behind a facade" unless that file is one of the components above.

## Locate and read efficiently
- **Enumerate live, ignore-aware, scoped.** Enumerate files with ripgrep's ignore-aware walker — `rg --files [<subtree>]` — or `git ls-files` when the workspace is a git repository. Do NOT run `Get-ChildItem -Recurse` over the whole workspace and do NOT materialize a workspace-wide index: the walk must respect the repository ignore rules (excluding `bin/`, `obj/`, `node_modules/`, `.git/` and similar) and stay scoped to the subtree you need.
- **Search content with `rg`, scoped.** To locate a symbol, use `rg -l "<Symbol>" <subtree>`; to see its occurrences, `rg -n "<Symbol>" <subtree>`. Scope every search to the smallest subtree that can contain the answer; NEVER scan the whole workspace — neither with `Select-String -Path` nor with an unscoped `rg`.
- **Read a window, not the body.** Do not try to extract a file's "declarations" with a language-specific regex: it fails on members that carry no access modifier (interfaces) and it is not portable across languages. Locate the member you need with `rg -n "<identifier>"` and read a bounded window of lines around it.
- **One channel per file.** When the panorama genuinely needs a file's content, read it with the dedicated `read` tool, not by re-dumping it through `bash`: the same read is then reusable if you later edit that file. Use `bash` for enumeration and search.
- Batch one round into ONE `bash` command (print only the regions you need under a `===== <path> =====` banner); and when a round has independent lookups, issue them in parallel in the same message instead of one per turn.
- If a command output is truncated, read the ephemeral file with the `read` tool; never re-dump a file you already read. If a command fails, fix it and retry once; if it still fails, fall back to `git ls-files`/`rg` when available, otherwise record a blocker and halt.

## Failure arms
- `#capability:codebase-clusters` or `#capability:codebase-cluster-files` fails: retry once; if it still fails, state that the panorama cannot be built, record a blocker and halt.
- A `read` of a selected file fails: retry once; if it still fails, record a blocker and halt.
- A `#capability:design-open-points` (`Add`) call is rejected: repair the payload and retry once; if it still fails, record a blocker and halt.

---

## The overview — write it now
Call `#capability:design-overview` and write two prose blocks. They are the context every later step reads first, and nothing else in the document gives it.

- `currentState` — what exists today **only for the components this work involves**, or that a reader needs to understand the flow the change plugs into: the mechanism each one carries and how they interact. Exclude everything that is merely a **reference**: classes that follow a similar pattern, similar business logic for other features, unit and integration tests, sibling modules the change does not touch. If the codebase has nothing reusable or intersecting, say exactly that — DRY: state plainly that there is no existing component to reuse or modify, instead of dressing an unrelated file as relevant.
- `gaps` — what is missing for the work, stated as **what is missing** and never as the mechanism that would resolve it: "there is no entity that…", "a check is missing that…", "the <xyz> algorithm cannot…". Say how each gap sits against what exists.
  **The anchor to the obligations.** Name, in the gaps, every necessary element of every obligation the artifact already carries, as a placeholder `{{O#.k}}` — write `{{O1.2}}`, the element id between double braces — followed by the gap sentence that element leaves open. This is the binding constraint: `#capability:design-overview` **refuses the write** while a known element is missing or a placeholder names no element, so two placeholders closer than a few words are an error (a list of placeholders followed by a generic sentence is not a description). When the artifact carries no obligation yet, there is nothing to anchor: write the gaps as prose and invent no placeholder. **The anchor is a standing invariant.** It holds for the obligations the artifact carries when you write the gaps; whenever a new obligation is added later — a `Developer` behavior in the decision consolidation, a `design-gap` in the walkthrough — re-send `#capability:design-overview` so its necessary elements appear as `{{O#.k}}` placeholders too. The gaps must never drift from the obligation set.

Both are **structured prose**: whole sentences a developer understands without the code; no code, no diffs, no file dumps, and no terse fragments that carry no information. Cite every component you name — in `currentState` **and** in `gaps` — as a markdown link `[<component_name>](<path_to_containing_file>)`, so the document renders it as a chip showing the component name and reveals the containing file on hover.

## The file references — record them now
Call `#capability:design-file-references` and record the **file references**: for every symbol at member granularity (e.g. `IUnitOfWork.SaveAsync`) that the implementation will need, at least one source file that references or uses it (best effort up to two). This is what lets the implementation subagent avoid re-walking the repository: it must be ready in the design snapshot.
- One row per symbol, keyed by `Type.Member` (member granularity): give the `symbol` and its `files`.
- The files to touch are **not** recorded here: the files the implementation creates or modifies are the filesystem stage, not the file references. Here you record real files where the symbol is referenced or used, so the implementor has a concrete example.
- Record **at least one** referencing/using file per symbol (best effort up to two).
- Give the file **path only**, never a line number, and do not repeat a path within a symbol.

---

## What this observation raises — the open points
Record, with `#capability:design-open-points` (`Add`), every question the codebase raises: a convention to follow, a boundary or layer that constrains the change, a mechanism to reuse or avoid, an inconsistency between the code and the work — `question` and `whyAskingMySelf`. Record especially every **reuse candidate** you noticed but did NOT read in depth: a symbol that may already do part of the work, or that may need extending. Do not resolve them here, and do not read the implementation to answer them — a later step will. The open points are a running list and are never closed here.

**The emergence rule.** Beyond the codebase facts, record as an open point every construction choice the work and the code do not fix: where the change will act, how the code will be organised, which abstractions, dependencies, contracts and state it introduces, what it reuses, when it runs, how it evolves. For each, ask: *was this imposed, or will I have to choose it?* If you will have to choose it, it is a question and belongs on the list. Questions about the **situation** — the codebase, the environment, the process, the knowledge base — are questions too: record them; a later step decides which are blocking.

After completing ALL the provided instructions, call the tool `#capability:workflow-step-next` again to receive the next instruction. Do not deviate from these instructions or take any action they do not authorize.
