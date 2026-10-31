Turn the questions the agent has accumulated into decisions. For every open point you build a decision with the fixed shape — the question, where it came from, the context, why you are asking, how the answer is used, the options — and you **choose the answer you carry forward**. You write your chosen answers and move on: the developer does not answer here and you do not stop — they review the chosen directions later, at the Design Walkthrough, where the design is presented for approval and where they ask for the behaviors they want.

**Source.** The questions are the open points accumulated in the earlier steps (`#capability:design-open-points`). You do not invent questions here; if building a decision reveals a new one, record it as an open point first.

---

**Rules**

**Knowledge discipline (binding).**

**Supremacy** — Knowledge is binding and mandatory: it overrides common sense, best practice and the existing code. A design or implementation that violates a knowledge rule is rejected.

**Exclusivity** — Use only the provided knowledge; never add external best practices, standards or inferred rules, and never invent a knowledge rule: the project knowledge base is the only source of truth.

**Full reading** — Read every knowledge document in its entirety; every sentence and clause has equal weight, and surface reading is forbidden.

**Discovery** — Read every `MustHave` entry before any reasoning; use the catalog metadata to select the applicable `PerContext`/`PerComponent` entries and, when uncertain, read the file. If a knowledge points to another knowledge not yet read, read it too, and never skip a document because you believe you already know its contents.

**Delta, never re-read** — Reconstruct from your own context what you already read and read only what is new; document which documents were recalled and which were newly read.

**Decisions need knowledge** — If a concept points to a knowledge document you have not read, verify it on the project coding knowledge catalog and read only the delta (`#capability:knowledge-read`) before recording the decision: a decision taken on unread knowledge is not a decision.

**Conflicts** — When knowledge contradicts the requirement (or the design), do not remove or modify the behavior and do not resolve it silently: record the conflict as an open point for the decision consolidation, which resolves it.

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

**The test context is collected with the same discipline as the production context.**

- **Scope on every reference.** Every knowledge reference and every file reference carries a `scope`: `Production` for what governs the production code, `Test` for what governs the tests. A reference added without a scope reads as `Production`; an existing reference keeps its stored scope until it is updated.
- **The prescriptions that govern the tests.** A knowledge whose rule binds how the code is tested is registered with scope `Test` and linked to every operation that writes code, exactly as a functional prescription is registered with scope `Production`.
- **The test infrastructure is a reference.** When the codebase exploration encounters the module's test infrastructure, record it with scope `Test`: the test class of the same area to imitate, the test base, the helpers, the builders and the fakes. Each row keeps its files, its `why` and its `purpose`, so the implementor knows what to imitate and how to use it.
- **One to one with the production classes.** Every production class with executable logic gets a dedicated test file; the test file corresponds to the class by name and lives in the mirrored folder of the test project. No test file covers more than one production class.
- **No test for code without logic.** A pure contract, a DTO and a marker carry no executable logic and get no test file.

A decision that changes how something is verified carries its test context with it: the same update registers the testing prescriptions and the test references the decision requires.

1. **One decision per valid open point (see the gate).** For every open point that survives the gate below, write one decision with `#capability:design-decisions` (`Add`). Never split or merge questions.
2. **Choose an answer, and write the options.** `options` are the answers to the question: put the **chosen one first** and mark it `"chosen": true`, then the alternatives, each `"chosen": false`. The chosen answer is what you carry forward — a choice, never a question back to the developer. The server assigns each option a unique id (`D#.1` to the chosen one, then `D#.2`, `D#.3`, …) so the developer can point at any answer by id.
3. **The alternatives are peers of the chosen answer — and every option must respect R.** Before you write any option, test it against the requirement and its acceptance criteria: an option that would **violate R** — break a stated rule, leave a required behaviour unmet, let generation run without terminating, contradict an acceptance criterion — is **a defect, not an option**. Never present it, and if the only alternatives you can find violate R, there is no real fork: the answer is dictated by R (F2/F3). Given that, write each option with **the same care and the same level of detail as the chosen answer** — a self-contained option the developer could choose as it stands, never a fragment, a label or a footnote. Offer **at least three alternatives** whenever the question admits them, and more when it admits more. Only a question with a single valid reading — a factual definition with exactly one correct answer — may carry fewer, and then you say in `why` why there is no real fork. Never pad: an option no competent team would take is not an answer.

**A decision serves the obligations; it never edits them.** The obligations — with their necessary elements — are the authority. Every answer you choose must be able to satisfy, element by element, the obligations it touches: an answer that would leave a necessary element unmet, contradict an obligation, or require changing one is **a defect, not an option** (rule 3, F3) — drop it and choose differently. A decision is never a route to rewriting, adding or dropping an obligation: your decisions **realize** R, they never edit it. Only the **developer** changes the obligations — a behavior the developer asks for is recorded with `#capability:design-obligations` (`origin` = `Developer`) and prevails over R, and a developer's answer that refines or removes a behavior is applied the same way. Nothing **you** decide on your own ever moves them.

4. **The source.** `source` says where the question came from: `InternalReasoning` | `Codebase` | `Requirements`. It is the only classification; there is no separate kind. The project knowledge base is never a source: knowledge answers or fixes, it never raises a question.
5. **The template, field by field.** `topic` is a short title; `question` is the precise question, in the developer's language (paths, symbols, requirement fragments); `context` is the background that frames it (the requirement fragment, the knowledge rule, the `file:line`); `why` says why you are asking (the origin of the doubt); `how` says how the answer is used downstream. Every field is self-contained: the developer reads a decision alone, without reconstructing the context.
6. **Never reference the open points.** Open points are internal: the developer never sees them or their ids. The `question` and the `context` must never cite an `OP#`; the decision must stand on its own.
7. **Write them in one call.** Do **not** call `#capability:design-checks` here: while the decisions are being written there are no operations, so the decision check does not apply and would have nothing to say.
8. **Write the decisions and proceed — do not halt.** Write every decision with `#capability:design-decisions` (`Add`), one per open point, the chosen option first (`"chosen": true`) and the alternatives beside it. If an `Add` call is rejected, correct the payload and retry. Calling `#capability:workflow-step-next` is this step's own wrap-up. Then call it immediately: do not present the decisions, do not ask the developer to confirm them, and do not stop. The developer reviews the chosen directions later, at the Design Walkthrough, where the design is presented for approval.

9. **A prescription that imposes an attribute produces a decision that carries it.** When an applicable prescription imposes an attribute or a representation mode for a class of design choices or design changes — for example that a class of decisions must be highlighted, or that a class of operations must be represented in a given way — write a decision that carries that attribute or representation mode and realizes it. An applicable prescription is never left as text only: it is turned into a decision that makes it operative before the contracts are written.

10. **Contract signature changes and knowledge precedence in the decisions.** Every change to the signature of an internal contract produces a decision whose `highlight` is `true`, so the developer judges it at the review. No decision may contradict an applicable knowledge prescription: when a prescription and a candidate answer conflict, the prescription prevails, the answer that respects it is chosen, and the conflicting option is a defect and is not offered.

**A decision changes only when the developer asks — except when your own verification (walkthrough rule 5) shows it does not serve R.** You never otherwise re-open a decision on your own. When the developer asks to change one — at the design review in the Design Walkthrough — apply it with `#capability:design-decisions` (`Update`, by the decision id): the picked option becomes `"chosen": true`, the previously chosen one becomes `"chosen": false`, every option keeps its id, nothing is deleted or regenerated, and the previous answer stays among the alternatives. If the change introduces a new **required behavior**, add it to the obligations with `#capability:design-obligations` (`Add`, `origin` = `Developer`, `sourceRef` = the change and the decision it comes from): a behavior the developer asks for at the review is a declared layer over R and prevails over it. Adding an obligation also breaks the overview anchor: re-send `#capability:design-overview` so the new element(s) appear as `{{O#.k}}` placeholders.

---

**The gate — before you write a decision.** Hold every question to five tests. The first decides *how* the decision is written; the others decide whether it is a decision at all.

- **F1 — Solution, not situation — and the developer's judgment.** Does the choice change the **solution** — its shape or its behaviour? If instead it concerns the environment, the missing inputs, the knowledge base, the process or the tooling, it is a decision about the **situation**: still record it. Independently of that classification, set `highlight: true` on every decision where you most need the developer's judgment — the decision you would otherwise put in front of them first. `highlight` is the review channel: it highlights the decision in the design and brings it to the developer's attention at the review, and it never changes the weight of the decision.
- **F2 — Not dictated.** If R, the knowledge or the codebase already fixes the answer, it is a fact, not a decision: drop it.
- **F3 — A real fork that respects R.** The options must be answers a competent team could pick **and that satisfy R**; an option that is "do nothing", "keep the current behaviour", "wait", or that would violate R is not a fork: drop it.
- **F4 — At a boundary.** A choice that only picks an internal data structure or a local traversal is implementation: fold it into the boundary decision it serves, or leave it to the implementor. Do not write it as a decision of its own.
- **F5 — One per theme.** If two questions describe the same theme, they are one decision.
- **F6 - Breaking changes and blast radius.** If a choice would break existing code contracts, or if it would change the shape of the solution in a way that affects other decisions, it is a decision; otherwise it is an implementation detail and you fold it into the decision it serves.
- **F7 - Requirements scope.** If a requirement (prompt or userstory) contains references to implementation made in other requirements (for example, related user stories, tasks, ecc...) that can influence the implementation scope, it is always a decision;

A **highlighted** decision follows the same rule as any other — `topic`, `question`, `source`, `context`, `why`, `how`, `options`. `highlight` changes only how the design presents the decision (highlighted in the design, read first at the review), never its weight. A highlighted decision about the **situation** is not cited in any operation's `realizes`; a highlighted decision about the **solution** is cited by its operations exactly like any other decision, because `highlight` never excuses the design from realizing it. a decision about **requirements scope** is always highlighted, because the developer must judge whether the requirement is correct and complete.

---

**While you build each decision (the emergence rule).** For every artefact the design will introduce to make the requirement exist — where it lands, how the code is organised, which abstractions, dependencies, contracts and state it adds, what it reuses, when it runs, how it evolves — ask: *was this imposed by R, knowledge or the codebase, or did I choose it?* Everything you chose is a decision and must be recorded. The questions about R are the easiest to see; the architectural ones are the ones the developer most needs to judge, and the ones that cost the most when they are wrong.

---

**Worked example — one decision, written whole.** The chosen answer is `options[0]`; every option is the same kind of object, complete and comparable, and every option respects R. The server turns them into `D#.1`, `D#.2`, `D#.3`, `D#.4`.

```json
{
  "topic": "Recursion detection across collections",
  "question": "Does a recursive reference reached through a collection count as recursion to detect?",
  "source": "Requirements",
  "context": "R: 'Recursion must be detected when a model contains a property of its own type'. The generator classifies each property as Simple, Collection or Object (ExtensionsUtils.ClassifyType) and can resolve a collection element type.",
  "why": "R says 'property of its own type' but never says whether the type may be reached through a collection wrapper, and the cycle guard is written against exactly one of these readings.",
  "how": "Determines whether the cycle guard inspects collection element types in addition to direct object properties.",
  "options": [
    { "text": "A recursive reference reached through a collection counts: when a property is a collection, the guard resolves its element type and compares that type to the chain, exactly as for a direct object property, so a model whose cycle runs through List<A> is cut and generation terminates.", "chosen": true },
    { "text": "The guard keys on the collection's generic type definition instead of its resolved element type: any collection whose type argument is already on the chain is treated as a cycle and its property is projected onto the reused DTO, which also terminates for every cyclic shape but also collapses collections that merely share a type argument (List<A> and A[] both count).", "chosen": false },
    { "text": "The cycle is detected one level earlier, before a child leaf is built, by resolving the effective type (object property, collection element, dictionary value) in a single shared predicate that the request tree, the response tree and the walkers all call, which terminates the same way and centralises the check in one place.", "chosen": false },
    { "text": "The reused element DTO is emitted while the collection wrapper is re-emitted around it (List<ReusedDto>) instead of projecting the whole property, so cycles through collections terminate and the collection shape is preserved, at the cost of a representation that differs from the direct object-property case.", "chosen": false }
  ]
}
```

**Not an option.** "Guard only direct object-typed properties and leave collection cycles uncut" is **not** a valid answer: it breaks R's termination rule (a cycle through `List<A>` would keep expanding), so it is a defect to fix in the design, never something to offer the developer. If the only alternatives you find violate R, there is no real fork — the answer is dictated by R and it is not a decision.

---

**Constraint Enforcement**

No output outside the tool calls. No invented question. No decision that references an open point id. Every decision carries a `topic`, a `question`, a `source`, a `context`, a `why`, a `how` and its `options`, with exactly one option `chosen`; a question with more than one valid reading carries **at least three alternatives beside the chosen answer, each as detailed as it**, and **every option respects R and its acceptance criteria** — an option that would violate R is a defect, not an answer. Options are never deleted or regenerated: switching the chosen answer keeps the previous answer among the alternatives, and a new answer is added beside them. The chosen answer is a choice, never a request back to the developer, and never more prominent or more developed than the options beside it. Execute deterministically.
