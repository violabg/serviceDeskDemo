Enrich the job design artifact using project knowledge.
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

**Knowledge references (binding).**

In the Design workflow every knowledge read is decomposed into the prescriptions it carries, and only the prescriptions that are coherent with, applicable to or necessary for this requirement and this design become knowledge references of the design artifact.

Knowledge is a source of the design itself, not only material assigned to the operations: its prescriptions constrain the contracts, the public APIs, the filesystem, the operations and the decisions exactly as they constrain the implementation. The knowledgeReferences table is the single source of the knowledge of the design: the prescriptions applied to the design are the references registered there, and no application of a prescription exists outside that table.

1. **After every read.** After every call to `#capability:knowledge-read` follows, without exceptions, a call to `#capability:design-knowledge-references`. The call always follows the read; it may register nothing. This holds in this step and in every later step of the workflow, including when you read a knowledge delta before a decision or during the walkthrough.
2. **The unit is the prescription, not the file.** Read the numbered lines you received and split the knowledge into the prescriptions it states: a rule, a constraint, a required procedure, an invariant, an example that fixes a behaviour. A reference is one such prescription that is coherent with, applicable to or necessary for the requirement and the design under work. A knowledge may yield zero, one or many references; the whole file is a reference only when the whole file is a single prescription.
3. **What to register.** For each applicable prescription call `#capability:design-knowledge-references` with `operation` = `Add`, one reference per contiguous run of lines that carries it. Each reference carries a `kid` you assign (a distinct positive integer), the `fId` of the knowledge file read from the catalog, and the `range` of that run, where `s` is the first line and `e` is the last line, both inclusive and both taken from the numbered lines returned by the read tool. The range is the minimal span that carries the prescription: include the heading line only when, without it, the resolved text is unintelligible on its own, and never extend the range to reach an unrelated neighbour.
4. **Nothing applies.** When a read yields no prescription that applies to the requirement or the design, call `#capability:design-knowledge-references` with an empty list: the call is still made, and no row is created. Never register a knowledge only because it was read, and never register a whole file as a shortcut for the prescriptions it contains.
5. **Later steps.** When a later step re-reads a knowledge, register only the prescriptions the new context makes applicable. If a reference for the same `fId` and the same, or an overlapping, contiguous run already exists, use `Update` by `kid` instead of adding a duplicate; add a new `kid` only for a distinct run, including each separate contiguous run of a prescription that is not contiguous.
6. **Applicability to the design.** A prescription is applicable to the design when it constrains a choice the design produces — the contracts, the public APIs, the filesystem, the operations or the decisions. A prescription that constrains only how the code is written or verified stays with the implementor and does not bind a design section.
7. **Consult before writing, section by section.** Before you compose or modify any section of the design, rebuild the knowledge already read in this job, re-read from the catalogue only the delta the section at hand makes relevant, and consult the applicable prescriptions before you write the section. No design section is written first and reconciled with the knowledge afterwards.
8. **Every applicable prescription is applied.** When you write a design section, apply every prescription applicable to it, and make the section declare the prescriptions it is founded on by their `kid`. A design that realizes the requirement but leaves an applicable prescription unapplied is incomplete, and a design that contradicts an applicable prescription is rejected.
9. **Knowledge before the workflow instruction.** When a prescription conflicts with an instruction of the workflow, record the conflict explicitly before you proceed — the prescription, the instruction and the choice that resolves it — and apply the prescription. The conflicting instruction is not applied, and the conflict and its resolution are named in the design so the developer and the verifier can read it. This precedence holds for every section, including the order of the operations when a prescription dictates a sequence.
10. **Failure.** If `#capability:design-knowledge-references` fails, retry the call once. If it still fails, record a blocker and halt: a prescription the design applies and did not register leaves the design incomplete.

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

**Test context**

**The test context is collected with the same discipline as the production context.**

- **Scope on every reference.** Every knowledge reference and every file reference carries a `scope`: `Production` for what governs the production code, `Test` for what governs the tests. A reference added without a scope reads as `Production`; an existing reference keeps its stored scope until it is updated.
- **The prescriptions that govern the tests.** A knowledge whose rule binds how the code is tested is registered with scope `Test` and linked to every operation that writes code, exactly as a functional prescription is registered with scope `Production`.
- **The test infrastructure is a reference.** When the codebase exploration encounters the module's test infrastructure, record it with scope `Test`: the test class of the same area to imitate, the test base, the helpers, the builders and the fakes. Each row keeps its files, its `why` and its `purpose`, so the implementor knows what to imitate and how to use it.
- **One to one with the production classes.** Every production class with executable logic gets a dedicated test file; the test file corresponds to the class by name and lives in the mirrored folder of the test project. No test file covers more than one production class.
- **No test for code without logic.** A pure contract, a DTO and a marker carry no executable logic and get no test file.

When a knowledge prescribes how something is tested, register its reference with scope `Test`; the functional prescriptions keep scope `Production`. The walkthrough links each test prescription to every operation that writes code.

**Step rules**

1. **Behavior Enrichment** – The obligations hold ONLY required behaviors (functional, no implementation detail). They are updated exclusively when knowledge reveals an implicit *functional* requirement (a functional scope change): add the new behavior, or refine the functional phrasing of an existing behavior with functional precision. Never add implementation details to an obligation.

2. **No Implementation Items** – Do not create or modify implementation items in this step. Record only what the knowledge changes functionally (the obligations).

3. **No Open Points** – This step never creates or modifies an open point, with one exception: a knowledge-versus-requirement conflict (Knowledge discipline, *Conflicts*) is recorded as an open point for the decision consolidation to resolve. Knowledge otherwise answers or fixes; it does not raise questions here. Do not call `#capability:design-open-points` for anything else.

4. **No Code Generation** – No code, pseudocode, or implementation details beyond what knowledge describes.

5. **Traceable Changes** – Every enrichment, resolution, or split must trace to a specific knowledge source.

6. **No Codebase Exploration** – This step reads the project knowledge base, not the codebase. Never inspect, list, open or search source files, and never call codebase tools (`#capability:codebase-clusters`, `#capability:codebase-cluster-files`). Any reasoning here is grounded in the provided knowledge and the requirement only.

7. **Knowledge Becomes Design Constraints** – Every prescription loaded here is a constraint on the design itself, not only material assigned to the operations. For each applicable prescription state the design choice it binds — a contract, a public API, the filesystem, an operation or a decision — so the later steps apply it while they write the design sections. Never treat a prescription as material for the implementor alone and never leave it without the design constraint it imposes.

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
