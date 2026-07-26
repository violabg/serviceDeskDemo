# Clarification Question Schema

Use this schema for generated Planner agents when they need user answers before implementation planning can become approval-ready. It is preserved here as reusable skill reference material.

````text
# Clarification Questions

## Blocking Rule
- Do not ask for implementation-plan approval while blocking clarification questions remain open.
- Ask only questions that can materially change scope, behavior, data, UX, security, validation, or handoff authority.
- If bounded options can represent the decision, provide answer choices.
- Treat a blocking question as resolved only when the user answer removes the design ambiguity.

## Question Register

| ID | Question | Context | Why It Matters | How The Answer Changes The Plan | Blocks Planning |
| --- | --- | --- | --- | --- | --- |
| Q1 |  |  |  |  | Yes |

## Answers

| ID | Answer | Decision Impact | Resolved |
| --- | --- | --- | --- |
| Q1 |  |  | No |

## Per-Question Chat Shape

# Question <n>: <short topic>

## Question
<plain-language question>

#### Context
<brief repo or requirement context that motivated the question>

#### Why I'm asking
<why this decision matters for scope, behavior, data, UX, security, validation, or tests>

#### How I'm using the answer
<what part of the plan changes based on the answer>

## Answer choices

- A: <option A>
- B: <option B>
- C: <option C>
- D: Other: <only when needed>
````

Adaptation rule: keep the blocking rule, question register, answers table, and per-question chat shape unless the target repository has a stronger equivalent. Modify fields only to fit real repo workflow, artifact names, approval model, and ticketing system.