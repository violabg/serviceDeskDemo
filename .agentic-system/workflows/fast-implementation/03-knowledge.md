You are executing the knowledge step of the Fast Implementation workflow: gather the project knowledge that governs the implementation. This workflow has no design document: this step enriches no design artifact, it only collects the knowledge that the implementation and its verification must obey.

---

**Knowledge Discovery**

1. Call `#capability:knowledge-catalog`.
2. Read every `MustHave` knowledge entry before any reasoning.
3. Use catalog metadata to identify applicable `PerContext` and `PerComponent` knowledge files for the request or artifact. When uncertain, read the file.
4. If reading a knowledge you catch a new concept that points to another knowledge file not yet read, read it. Knowledges can reference each other.
5. Do not skip any knowledge file because you believe you already know its contents.
6. **Do not explore the codebase in this step.** This step reads the project knowledge base only. Do not call codebase tools (`#capability:codebase-clusters`, `#capability:codebase-cluster-files`) and do not read, grep or glob source files.

---

**Knowledge discipline**

**Knowledge discipline (binding).**

**Supremacy** — Knowledge is binding and mandatory: it overrides common sense, best practice and the existing code. A design or implementation that violates a knowledge rule is rejected.

**Exclusivity** — Use only the provided knowledge; never add external best practices, standards or inferred rules, and never invent a knowledge rule: the project knowledge base is the only source of truth.

**Full reading** — Read every knowledge document in its entirety; every sentence and clause has equal weight, and surface reading is forbidden.

**Discovery** — Read every `MustHave` entry before any reasoning; use the catalog metadata to select the applicable `PerContext`/`PerComponent` entries and, when uncertain, read the file. If a knowledge points to another knowledge not yet read, read it too, and never skip a document because you believe you already know its contents.

**Delta, never re-read** — Reconstruct from your own context what you already read and read only what is new; document which documents were recalled and which were newly read.

**Decisions need knowledge** — If a concept points to a knowledge document you have not read, verify it on the project coding knowledge catalog and read only the delta (`#capability:knowledge-read`) before recording the decision: a decision taken on unread knowledge is not a decision.

**Conflicts** — When knowledge contradicts the requirement (or the design), do not remove or modify the behavior and do not resolve it silently: record the conflict as a blocker in agent memory and log the event; the implementation step halts on it as a contradictory fact.

---

**Rules**

1. **No design artifact.** Do NOT call any `#capability:design-*` operation and do NOT create or modify any design artifact.

2. **Keep the sources.** Keep the list of knowledge sources you used; carry them forward to the implementation step.

---

**Output**

The applicable knowledges and the rules each contributes to the implementation. Merge them into ONE knowledge bundle that the implementation subagent and the verification subagent of the following steps will both receive.

After completing ALL the provided instructions, call the tool `#capability:workflow-step-next` again to receive the next instruction. Do not deviate from these instructions or take any action they do not authorize.
