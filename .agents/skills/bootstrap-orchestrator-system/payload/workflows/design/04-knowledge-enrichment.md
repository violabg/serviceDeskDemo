Enrich the job design artifact using project knowledge.
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

**Conflicts** — When knowledge contradicts the requirement (or the design), do not remove or modify the behavior and do not resolve it silently: record the conflict as an open point for the decision consolidation, which resolves it.

**Step rules**

1. **Behavior Enrichment** – The obligations hold ONLY required behaviors (functional, no implementation detail). They are updated exclusively when knowledge reveals an implicit *functional* requirement (a functional scope change): add the new behavior, or refine the functional phrasing of an existing behavior with functional precision. Never add implementation details to an obligation.

2. **No Implementation Items** – Do not create or modify implementation items in this step. Record only what the knowledge changes functionally (the obligations).

3. **No Open Points** – This step never creates or modifies an open point, with one exception: a knowledge-versus-requirement conflict (Knowledge discipline, *Conflicts*) is recorded as an open point for the decision consolidation to resolve. Knowledge otherwise answers or fixes; it does not raise questions here. Do not call `#capability:design-open-points` for anything else.

4. **No Code Generation** – No code, pseudocode, or implementation details beyond what knowledge describes.

5. **Traceable Changes** – Every enrichment, resolution, or split must trace to a specific knowledge source.

6. **No Codebase Exploration** – This step reads the project knowledge base, not the codebase. Never inspect, list, open or search source files, and never call codebase tools (`#capability:codebase-clusters`, `#capability:codebase-cluster-files`). Any reasoning here is grounded in the provided knowledge and the requirement only.

**Failure arms.**
- `#capability:knowledge-catalog` fails: retry once; if it still fails, record a blocker and halt.
- The catalogue is empty or exposes no `MustHave` entry: state the absence and continue with the requirement and any applicable `PerContext`/`PerComponent` entries.
- A knowledge document cannot be read: retry once; if it still fails, record a blocker and halt.
- A `#capability:design-obligations` `Add`/`Update` is rejected: repair the payload and retry once; if it still fails, record a blocker and halt.

---

**Output – Update the Job Design Artifact (structured, managed by the server)**

The job design artifact is managed by the server. Do NOT write it as a file and do NOT reprint it in the chat. Read the current state with `#capability:design-obligations` (operation `Read`), then apply only the new or changed rows through the tools, passing the session id and the job id:

- **Functional scope change (a new or refined required behavior).** Use `#capability:design-obligations`: `Add` for a new behavior, `Update` (by `id`) to refine the functional phrasing of an existing one. Never add implementation details to a behavior.
- **Do NOT create implementation items / mechanisms in this step.**
- **Do NOT record open points here.** Questions are raised in the other steps, not in this one.

Obligation ids (`O1`, `O2`, ...) are immutable: never renumber, reuse or reorder them.

---

**Constraint Enforcement**
No output outside the tool calls. No implied or obvious markers. No aggregation. No external knowledge. No codebase exploration. No code. No open points. Leave blank fields untouched. Execute deterministically.

After completing ALL the provided instructions, call the tool `#capability:workflow-step-next` again to receive the next instruction. Do not deviate from these instructions or take any action they do not authorize.
