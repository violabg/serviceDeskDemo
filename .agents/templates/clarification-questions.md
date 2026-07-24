# Clarification Questions

This template is derived from `templates/question-schema.md`.

## Session Information

- Session ID:
- Created At:

## Blocking Rule

- Blocking Questions Open: true
- Approval Ready: false
- Do not request implementation-plan approval while blocking questions remain open.
- Ask only questions that can materially change scope, behavior, data, UX, security, validation, or handoff authority.

## Question Register

| ID | Question | Context | Why It Matters | How The Answer Changes The Plan | Blocks Planning |
| --- | --- | --- | --- | --- | --- |
| Q1 | Pending question text | Pending context | Pending rationale | Pending planning impact | Yes |

## Answers

| ID | Answer | Decision Impact | Resolved |
| --- | --- | --- | --- |
| Q1 | Pending answer | Pending decision impact | No |

## Per-Question Prompt Template

```text
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
```
