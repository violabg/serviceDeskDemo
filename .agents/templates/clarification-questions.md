# Clarification Questions

## Session Information

- Session ID:
- Created At:

## Blocking Status

- Blocking Questions Open: true
- Approval Ready: false

| ID | Question | Why It Matters | Blocks Planning |
| --- | --- | --- | --- |
| Q1 | Pending question text | Pending rationale | Yes |

## Answers

| ID | Answer | Decision Impact |
| --- | --- | --- |
| Q1 | Pending answer | Pending decision impact |

## Per-Question Prompt Template

```text
# Question <n>: <short topic>

## Question
<plain-language question>

#### Context
<brief repo or requirement context that motivated the question>

#### Why I'm asking
<why this decision matters for scope, behavior, data, UX, security, or tests>

#### How I'm using the answer
<what part of the plan changes based on the answer>

## Answer choices

- A: <option A>
- B: <option B>
- C: <option C>
- D: Other: <only when needed>
```

Do not request implementation-plan approval while blocking questions remain open.
