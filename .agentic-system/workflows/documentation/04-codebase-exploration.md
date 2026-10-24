You are executing the documentation codebase exploration: gather the code evidence each placeholder directive asks for. This step is driven by the directives, not by curiosity.

---

**Mechanics (reused from the generic codebase understanding)**

- `#capability:codebase-clusters` (requires `WorkspacePath` and `fileExtension`) decomposes the codebase into domains; `#capability:codebase-cluster-files` (requires the same two plus `clusterName`) returns the filenames of a cluster. A filename listed there exists.
- Enumerate once: run a SINGLE recursive listing of the workspace and write the file list to a temporary file. Every later command reads that file and filters it in memory. Delete the temporary file before the end of the step. If deleting the temporary file fails, record it and continue; do not block the step.
- Search content with `rg` (ripgrep), scoped to the smallest subtree that can contain the answer: `rg -l "<symbol>" <subtree>` to locate, `rg -n "<symbol>" <subtree>` to show occurrences. Never run a whole-workspace content search with `Select-String`; the single recursive listing above is the only whole-workspace pass allowed. A no-match (empty) result means the directive is ungrounded: mark it ungrounded, record it and explain it in the final document.
- Read declarations, not bodies: prefer types, members and signatures. Read a full body only for the few components whose behaviour a directive must state.
- Ground every fact in a `file:line` you actually saw; never emit file references in the document unless the user explicitly asks for them (see the authoring rules).

---

**Rules**

1. **Directive-driven evidence.** For every placeholder directive that needs code evidence, gather exactly the evidence the directive asks for: an endpoint, an end-to-end flow, a component map, a root cause, a verbatim snippet, a configuration table.

2. **Document, do not design.** Do not design and do not propose changes; you document what exists.

3. **Stop when grounded.** Stop as soon as every directive has its evidence. If a directive cannot be grounded in the code, record it and explain why in the final document.

---

**Output**

The evidence mapped to each placeholder directive.

After completing ALL the provided instructions, call the tool `#capability:workflow-step-next` again to receive the next instruction. Do not deviate from these instructions or take any action they do not authorize.
