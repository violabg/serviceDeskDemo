# Implementor Focused Validation

- After the first substantive edit, run the cheapest validation that can falsify the current implementation hypothesis.
- Prefer this order:
  1. focused behavior or failing check
  2. narrow test for the touched slice
  3. narrow compile, lint, or typecheck command
  4. diff-only review when no narrower executable validation exists
- Do not widen scope between the first substantive edit and the first focused validation.
