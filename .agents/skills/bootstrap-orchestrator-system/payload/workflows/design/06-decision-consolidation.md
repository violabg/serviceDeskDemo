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

1. **One decision per valid open point (see the gate).** For every open point that survives the gate below, write one decision with `#capability:design-decisions` (`Add`). Never split or merge questions.
2. **Choose an answer, and write the options.** `options` are the answers to the question: put the **chosen one first** and mark it `"chosen": true`, then the alternatives, each `"chosen": false`. The chosen answer is what you carry forward — a choice, never a question back to the developer. The server assigns each option a unique id (`D#.1` to the chosen one, then `D#.2`, `D#.3`, …) so the developer can point at any answer by id.
3. **The alternatives are peers of the chosen answer — and every option must respect R.** Before you write any option, test it against the requirement and its acceptance criteria: an option that would **violate R** — break a stated rule, leave a required behaviour unmet, let generation run without terminating, contradict an acceptance criterion — is **a defect, not an option**. Never present it, and if the only alternatives you can find violate R, there is no real fork: the answer is dictated by R (F2/F3). Given that, write each option with **the same care and the same level of detail as the chosen answer** — a self-contained option the developer could choose as it stands, never a fragment, a label or a footnote. Offer **at least three alternatives** whenever the question admits them, and more when it admits more. Only a question with a single valid reading — a factual definition with exactly one correct answer — may carry fewer, and then you say in `why` why there is no real fork. Never pad: an option no competent team would take is not an answer.

**A decision serves the obligations; it never edits them.** The obligations — with their necessary elements — are the authority. Every answer you choose must be able to satisfy, element by element, the obligations it touches: an answer that would leave a necessary element unmet, contradict an obligation, or require changing one is **a defect, not an option** (rule 3, F3) — drop it and choose differently. A decision is never a route to rewriting, adding or dropping an obligation: your decisions **realize** R, they never edit it. Only the **developer** changes the obligations — a behavior the developer asks for is recorded with `#capability:design-obligations` (`origin` = `Developer`) and prevails over R, and a developer's answer that refines or removes a behavior is applied the same way. Nothing **you** decide on your own ever moves them.

4. **The source.** `source` says where the question came from: `InternalReasoning` | `Codebase` | `Requirements`. It is the only classification; there is no separate kind. The project knowledge base is never a source: knowledge answers or fixes, it never raises a question.
5. **The template, field by field.** `topic` is a short title; `question` is the precise question, in the developer's language (paths, symbols, requirement fragments); `context` is the background that frames it (the requirement fragment, the knowledge rule, the `file:line`); `why` says why you are asking (the origin of the doubt); `how` says how the answer is used downstream. Every field is self-contained: the developer reads a decision alone, without reconstructing the context.
6. **Never reference the open points.** Open points are internal: the developer never sees them or their ids. The `question` and the `context` must never cite an `OP#`; the decision must stand on its own.
7. **Write them in one call.** Call `#capability:design-schema` once if you are unsure of the shape. Do **not** call `#capability:design-checks` here: while the decisions are being written there are no operations, so the decision check does not apply and would have nothing to say.
8. **Write the decisions and proceed — do not halt.** Write every decision with `#capability:design-decisions` (`Add`), one per open point, the chosen option first (`"chosen": true`) and the alternatives beside it. If an `Add` call is rejected, correct the payload and retry; if `#capability:design-schema` fails, retry once and, if it still fails, record a blocker. Calling `#capability:workflow-step-next` is this step's own hand-off. Then call it immediately: do not present the decisions, do not ask the developer to confirm them, and do not stop. The developer reviews the chosen directions later, at the Design Walkthrough, where the design is presented for approval.

**A decision changes only when the developer asks — except when your own verification (walkthrough rule 5) shows it does not serve R.** You never otherwise re-open a decision on your own. When the developer asks to change one — at the design review in the Design Walkthrough — apply it with `#capability:design-decisions` (`Update`, by the decision id): the picked option becomes `"chosen": true`, the previously chosen one becomes `"chosen": false`, every option keeps its id, nothing is deleted or regenerated, and the previous answer stays among the alternatives. If the change introduces a new **required behavior**, add it to the obligations with `#capability:design-obligations` (`Add`, `origin` = `Developer`, `sourceRef` = the change and the decision it comes from): a behavior the developer asks for at the review is a declared layer over R and prevails over it. Adding an obligation also breaks the overview anchor: re-send `#capability:design-overview` so the new element(s) appear as `{{O#.k}}` placeholders.

---

**The gate — before you write a decision.** Hold every question to five tests. The first decides *how* the decision is written; the others decide whether it is a decision at all.

- **F1 — Solution, not situation — and the developer's judgment.** Does the choice change the **solution** — its shape or its behaviour? If instead it concerns the environment, the missing inputs, the knowledge base, the process or the tooling, it is a decision about the **situation**: still record it. Independently of that classification, set `blocking: true` on every decision where you most need the developer's judgment — the decision you would otherwise put in front of them first. `blocking` is the review channel: it highlights the decision in the design and brings it to the developer's attention at the review, and it never changes the weight of the decision.
- **F2 — Not dictated.** If R, the knowledge or the codebase already fixes the answer, it is a fact, not a decision: drop it.
- **F3 — A real fork that respects R.** The options must be answers a competent team could pick **and that satisfy R**; an option that is "do nothing", "keep the current behaviour", "wait", or that would violate R is not a fork: drop it.
- **F4 — At a boundary.** A choice that only picks an internal data structure or a local traversal is implementation: fold it into the boundary decision it serves, or leave it to the implementor. Do not write it as a decision of its own.
- **F5 — One per theme.** If two questions describe the same theme, they are one decision.

A **blocking** decision follows the same rule as any other — `topic`, `question`, `source`, `context`, `why`, `how`, `options`. `blocking` changes only how the design presents the decisions (highlighted in the design, read first at the review), never their weight. A blocking decision about the **situation** carries no `realizedIn`; a blocking decision about the **solution** is linked to its operations exactly like any other decision, because `blocking` never excuses the design from realizing it.

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

**Not an option.** "Guard only direct object-typed properties and leave collection cycles uncut" is **not** a valid answer: it breaks R's termination rule (a cycle through `List<A>` would keep expanding), so it is a defect to fix in the design, never something to offer the developer. If the only alternatives you can find violate R, there is no real fork — the answer is dictated by R and it is not a decision.

---

**Constraint Enforcement**

No output outside the tool calls. No invented question. No decision that references an open point id. Every decision carries a `topic`, a `question`, a `source`, a `context`, a `why`, a `how` and its `options`, with exactly one option `chosen`; a question with more than one valid reading carries **at least three alternatives beside the chosen answer, each as detailed as it**, and **every option respects R and its acceptance criteria** — an option that would violate R is a defect, not an answer. Options are never deleted or regenerated: switching the chosen answer keeps the previous answer among the alternatives, and a new answer is added beside them. The chosen answer is a choice, never a request back to the developer, and never more prominent or more developed than the options beside it. Execute deterministically.

After completing ALL the provided instructions, call the tool `#capability:workflow-step-next` again to receive the next instruction. Do not deviate from these instructions or take any action they do not authorize.
