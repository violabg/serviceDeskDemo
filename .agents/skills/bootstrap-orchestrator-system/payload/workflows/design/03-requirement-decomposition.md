Given a functional requirement R, you must decompose it into the complete set of atomic,
independently checkable obligations that R imposes.
Also, you must identify any open points or ambiguities in R that will be resolved at the design review before implementation.

**R-lock (execute first).** Before decomposing, persist R verbatim as a session artifact by calling `#capability:session-artifact-write` with name `requirement_R_lock`, description `Verbatim functional requirement R`, intended use `immutable source of truth for R`, MIME type `text/markdown`, and R itself (byte-for-byte) as the content. Never summarize, translate, reorder or reformat R. R is read from this artifact instead of relying on conversation recall. R changes only on an explicit user revision, which replaces the artifact.

---

**DECOMPOSITION RULES**
1. ATOMIC - one obligation = one independently falsifiable condition. If a yes/no
   answer requires evaluating two or more independent conditions of R, SPLIT. Do not
   split a single condition into fragments that cannot be true or false on their own.
   If two different implementations could satisfy one part of a claim and violate
   another, it is two obligations. A claim must never join two independently
   falsifiable conditions, not even with "and" / "e" or a comma.
2. NO FUSION - never merge two distinct rules into one obligation, even within one
   sentence or one bullet.
3. NO DUPLICATION - never emit two obligations with the same meaning. If R restates a
   rule ("as in X", "same as above") without adding a distinct condition, emit it
   once; if the restatement adds a nuance, emit only the additional condition. A
   redundant negation of the same predicate is not a second obligation. Do not
   deduplicate by string similarity; deduplicate only by meaning. EXCEPTIONS ARE NOT
   DUPLICATES: when R states an exception ("except", "only", "unless", "with the
   exception of") for part of a rule, never merge it into the general rule and never
   drop it; emit the general rule and the exception as distinct obligations, and keep
   the excepted class explicit in each claim.
4. COMPLETE COVERAGE (no loss) - cover EVERY normative part of R: nested rules,
   sub-bullets, exceptions, "rules" sections, table rows, notes, defaults, limits,
   thresholds, ordering, error cases, and conditions embedded in examples. Never
   skip a part as minor, obvious or redundant. Never summarize.
5. NO INVENTION (no excess) - use only what R states or directly and necessarily
   implies. Do not add domain assumptions, regulations, standards, best practices,
   generic quality goals, or conditions R does not impose. If R does not determine a
   detail that verification would need, do not invent it: keep the obligation as R
   states it and record the missing detail as an open point. Conservative inclusion:
   never silently drop content.
6. INDEPENDENT - an obligation's truth must not depend on another obligation's truth.
7. LANGUAGE - write the claim in the SAME LANGUAGE as the source passage of
   R; never translate, transliterate or force code-switching. In a multilingual R,
   follow each passage's own language. Never assume R is in English and never change
   extraction based on language.
8. NO ARTIFACT ANCHORING - describe the required behavior as trigger -> behavior ->
   observable effect (state transition, data flow, guard, notification, output).
   Never formulate an obligation as "the design contains / mentions / names X", "there
   is a test named Y", or anything whose truth depends on the presence of an
   identifier, comment or test title. If R mentions an identifier, translate it into
   the behavior R intends to bind. The negative case is also about the effect ("no
   further automatic action occurs after the top is reached"), never about the
   absence of a symbol.
9. EXAMPLES AND VALUES - an illustrative value ("for example", "e.g.", a sample
   number) is an instance of a BINDING rule, not an optional one: record the parameter
   itself inside the claim. Treat a rule as optional, recommended, permissible or
   merely possible ONLY when R genuinely makes it so, judged by MEANING in any
   language (never by matching specific words).
10. NEGATIVE / CONDITIONAL - a prohibition, exclusion or restriction expressed in any
    way, in any language, by polarity or by construction, is a full obligation. A
    behavior that holds only under a condition keeps the condition together with the
    guaranteed effect in the claim, unless condition and effect are independently
    falsifiable, in which case split them.
11. SOURCES OF CONTENT - extract obligations only for what the system (or a role) is
    required, recommended, permitted or forbidden to do. Background, rationale,
    history, references and quoted third-party text are context, not obligations,
    unless R adopts them normatively. An explicit exclusion ("out of scope: X") is an
    obligation of absence, not the absence of an obligation.
12. STRUCTURE IS NOT MEANING - do not impose or search for any structural vocabulary.
    Treat every part at the same normative level: main statement, list items,
    exceptions, tables, notes and binding examples. For tabular R, convert the
    row/column relations that constrain behavior into obligations. State, status and
    lifecycle rows are normative: emit EXACTLY ONE obligation per state that R
    defines, and make ALL the state's elements explicit inside that single claim -
    both every coordinated element of its meaning and its terminal or non-terminal
    status - without fusing them into a weaker phrase and without dropping any of
    them. Example of a faithful claim: "The state 'Clarification requested' means the
    request is waiting for update AND for resubmission, and it is non-terminal"; a
    claim like "the state is for clarification" is a fusion and is forbidden. Only
    purely descriptive rows that constrain no behavior (glossary, background, field
    lists) remain context.
13. TAUTOLOGY - if no implementation could fail the condition ("must be correct", "must work"),
    it is not an obligation. Do not emit it.
14. FALSIFIABLE AND UNBOUNDED - every claim must be a closed yes/no proposition about
    the system that an implementation can observably fail. Do not target a specific number of
    obligations and do not paraphrase a condition into something trivially true.
15. BICONDITIONALS ARE TWO DIRECTIONS - when a rule states a two-way relation ("and
    vice versa", "if and only if", "when X then Y and when Y then X", "together ...
    and vice versa"), the claim must keep BOTH directions explicit; never collapse it
    into one direction. Keep the recipient class of each direction explicit.
16. NECESSARY ELEMENTS - decompose EVERY obligation into its necessary elements: the
    conditions of its claim that are independently checkable and demand a DISTINCT
    realization in code. Apply the grammar of the claim, in order:
    (a) COORDINATION - split every "A and B", "both A and B", "A together with B" into
        one element per coordinated part; its `kind` is `Conjunct`;
    (b) BICONDITIONAL - split every "when A then B, and vice versa", "if and only if",
        "together" into one element per direction; its `kind` is `Direction`;
    (c) QUANTIFIER - for every "all / every / only / none / at least one", one element
        that states exactly what is whole-class and for whom; its `kind` is `Quantifier`;
    (d) CONDITION - one element for every "if / when / after / once / while"; its `kind` is
        `Guard`; one for every "unless / except", whose `kind` is `Exception`;
    (e) OBSERVABLE OUTCOME - one element for every thing that must happen, arrive or be
        visible; its text must name the trigger that reaches it; its `kind` is `Effect`;
    (f) STATE SEMANTICS - one element for every definitional clause ("means X", "is terminal
        / non-terminal"); its `kind` is `StateSemantics` (never write `Definition`, it is not a value).
    An element is valid ONLY if it is independently checkable and requires a distinct
    realization (a different guard, branch or path): never split modifiers that share
    one realization. NEVER drop an element because it seems implied by another -
    "implied" is exactly how directions and coordinated parts get lost. Aim for 2 to 6
    elements per obligation; more means over-atomizing. Never write an obligation
    without its elements.

---

**Output – Job Design Artifact (structured, managed by the server)**

The job design artifact is a structured artifact managed by the server. Do NOT write it as a file and do NOT reprint it in the chat. Add the rows through the tools, passing the session id and the job id (operation names are Pascal-case and case-sensitive: `Add`, `Update`, `Delete`, `Read`):

- **Obligations.** Add each obligation as a row with `#capability:design-obligations` (operation `Add`). A row has:
  - `behavior`: one atomic, closed yes/no behavior the system must exhibit, derived only from R. It states the ACTOR, the TRIGGER/CONDITION, the OBSERVABLE EFFECT (state transition, data flow, guard, notification, output), the CLASS/QUANTIFIER it ranges over (all / every / only / none / at least one), and its BOUNDARIES (exceptions, order/concurrency, terminal states), using the exact phrasing of R where possible. One behavior per normative rule; never aggregate two behaviors into one row. Functional only: no code and no file, class, method or symbol names.
  - `class`: the class/quantifier the behavior ranges over.
  - `boundaries`: exceptions, order/concurrency, terminal states.
  - `sourceRef`: the fragment of R the behavior comes from.
  - `elements`: the necessary elements of the behavior (rule 16), in order. Each element is `{ kind, text, sourceSpan }`: `kind` is exactly one of `Direction | Conjunct | Quantifier | Guard | Effect | StateSemantics | Exception` — any other value (in particular `Definition`) is rejected before the tool runs; definitional clauses (rule 16f) use `StateSemantics`. `text` is the element as a closed, independently checkable condition, and `sourceSpan` is the exact fragment of R it comes from. Enumerate every element produced by rule 16; never leave the list empty.
  The server assigns the immutable obligation id (`O1`, `O2`, ...) in order; never renumber, reuse or reorder a published id. This id is the obligation identity. The k-th element of an obligation (1-based, in the order written) is referred to as `<O#>.k` (e.g. `O3.2`); elements are written once, here, and are invariant afterwards. Element identity is stable: an `Update` patches an element in place by its `id`, an element sent with no `id` is appended, and an element flagged `removed: true` is deleted; a removed id is never reused and editing or reordering never remaps an existing reference.

- **Open points.** Add each question the requirement raises with `#capability:design-open-points` (operation `Add`): `question` (the gap, phrased as a question) and `whyAskingMySelf` (why you are asking it). Open points are a running list of every question — about R, architecture, implementation, or the situation (the codebase, the knowledge base, the environment, the process) — and are never closed here.

**The emergence rule.** Beyond the gaps in R, record as an open point every construction choice the requirement does not fix: where the change will act, how the code will be organised, which abstractions, dependencies, contracts and state it introduces, what it reuses, when it runs, how it evolves. For each, ask: *was this imposed by R, or will I have to choose it?* If you will have to choose it, it is a question and belongs on the list. Questions about the **situation** — the codebase, the environment, the knowledge base, the process — are questions too: record them; the decision consolidation marks them as `blocking`.

**Failure arms.** Never proceed silently on a failed write.
- `#capability:session-artifact-write` (the R-lock) fails or is refused: repair the arguments and retry once; if it still fails, record a blocker and halt.
- A `#capability:design-obligations` (`Add`) or `#capability:design-open-points` (`Add`) call is rejected: repair the payload and retry once; if it still fails, record a blocker and halt.

---

**Constraint Enforcement**
No output outside the tool calls. No "implied" or "obvious" markers. No aggregation. No splitting unless explicit enumeration exists. No code, no external context, no inference. Leave blank fields untouched. Execute deterministically.

After completing ALL the provided instructions, call the tool `#capability:workflow-step-next` again to receive the next instruction. Do not deviate from these instructions or take any action they do not authorize.
