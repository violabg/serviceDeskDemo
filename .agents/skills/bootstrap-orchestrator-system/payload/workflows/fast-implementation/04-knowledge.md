You are executing the knowledge step of the Fast Implementation workflow: gather the project knowledge that governs the implementation. This workflow has no approval gate and no rendered design document: the obligations we produced in the decomposition are the requirement of the FAST, and this step only collects the knowledge that the implementation and its verification must obey.

---

**Knowledge Discovery**

1. Call `#capability:knowledge-catalog`.
2. Read every `MustHave` knowledge entry before any reasoning.
3. Use catalog metadata to identify applicable `PerContext` and `PerComponent` knowledge files for the request or artifact. When uncertain, read the file.
4. If reading a knowledge you catch a new concept that points to another knowledge file not yet read, read it. Knowledges can reference each other.
5. Do not skip any knowledge file because you believe you already know its contents.
6. **Do not explore the codebase in this step.** This step reads the project knowledge base only.

**CRITICAL: Maximize batch-reading.**
Do not call `#capability:knowledge-read` for a single file at a time: read all the files you need in one batch, and register their prescriptions in one batch. The server can handle large batches, and the round-trip time is significant.

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

1. **The design obligations are the requirement.** The obligations of the job design are the requirement of the FAST: read them with `#capability:design-obligations` or `#capability:design-snapshot` whenever the implementation or its verification needs them. Do not add, remove or modify them here.

2. **Keep the sources.** Keep the list of knowledge sources you used; carry them forward to the implementation step.

---

**Output**

The applicable knowledges and the rules each contributes to the implementation. Merge them into ONE knowledge bundle that the implementation subagent and the verification subagent of the following steps will both receive.
