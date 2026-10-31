# Knowledge catalogue

Lab-authored contract, derived from the captured knowledge catalogue. The runtime implements it in `runtime/lib/knowledge.mjs`.

Project knowledge is a set of markdown documents under `knowledge`. Each document declares its tier in its front matter:

```markdown
---
title: "coding standards"
tier: MustHave | PerContext | PerComponent
keywords: [coding standard, clean code]
intent: "When writing new code or reviewing existing code."
editable: true
---
<the knowledge>
```

| Tier | Meaning |
| --- | --- |
| `MustHave` | Mandatory knowledges for the project. Agent must always apply them: every workflow reads all of them in full. |
| `PerContext` | Context depending knowledges. Agent must evaluate them as context evolves. |
| `PerComponent` | Component depending knowledges. Agent must evaluate them based on the component involved in its implementation. |

A document without a valid `tier` is `PerContext`. `README.md` files are not knowledge. `knowledge/kbsettings.yaml` may exclude documents with relative glob patterns:

```yaml
excludes:
  - "External/**/*.md"
```

## catalog

`#capability:knowledge-catalog` — no arguments. List the documents (path order, excludes applied), assign `file_id` 1, 2, 3, ... in that order, and answer:

```yaml
MustHave:
  section_description: Mandatory knowledges for the project. Agent must always apply them
  knowledges:
  - file_id: 1
    keywords: changelog, user story
    intent: When implementing or planning any new User Story or Bug.
    IsEditable: true
PerContext:
  ...
PerComponent:
  ...
```

The catalogue is rebuilt on every call, so a `file_id` is valid only for the current index: adding, renaming or excluding a document renumbers the ids. Re-read the catalogue before using an id from an earlier session. The last index is cached in `agentic-system-sessions/.cache/knowledge-catalog.yaml` for humans; a read never writes into the knowledge folder.

## read

`#capability:knowledge-read` — arguments `fileIds` (one id, a list, or a comma-separated string), optional `sessionId` and `part`. Answer each document in full under a `# file_id <n> — <title>` heading, separated by `---`. Every line of the document, front matter included, is prefixed with its number as `<n>| ` (Lab-authored: the served instructions register a knowledge reference by "the numbered lines returned by the read tool", and the captured read shows none). An id missing from the current index says so; it is never answered with another document. A long answer is served in parts that each start at a document (`contracts/workflow-loop.md`, Parts); a document longer than one part continues under the same heading.

A document is recorded by path in `sessions/<sessionId>/knowledge-reads.json` (Lab-authored) when the part holding its last line is served, not when it is requested, in the session named by `sessionId` or, without one, the most recently activated session; with no session nothing is recorded. A refused part records nothing. Name the session whenever it is known: another job's activation can change the most recent one. The verification view uses the record to show the verifier the knowledge the design was built on (`contracts/projections.md`).

## write

`#capability:knowledge-create` — arguments `title`, `content`, `tier`, optional `keywords`, `intent`, `folder`. Create `<folder>/<title as snake case>.md` with the front matter above; refuse when the file exists. Answer the new `file_id`.

`#capability:knowledge-update` — arguments `fileId`, `content`, optional `intent`. Replace the document's content, keeping its front matter; refuse a document with `editable: false`.

Only the knowledge roles create or update knowledge.

## rebuild

`#capability:knowledge-index-rebuild` — no arguments. Rebuild the index and answer the number of documents.
