---
tier: "PerComponent"
intent: "Before creating any new UI component in pages, navigation or app chrome, to reuse existing shared primitives and decide where a shared component lives."
---
# Shared Components

- Check the existing wrappers and primitives first and reuse them when behaviour matches; extend them through props and class composition instead of adding variants.
- Compose classes through the shared merging helper rather than a local one.
- One component serves two similar surfaces, in the same feature too; do not wait for a second feature. Prefer a thin wrapper over an isolated custom control.
- A shared component lives in a `_components` folder at the lowest route folder containing every route that uses it. Bounded to one route, it stays beside that route; used across features, it sits at dashboard level. Generic primitives stay in the shared UI layer.
- When a new consumer sits outside the folder, move the component up to the nearest common folder. Never copy it into another route or import it from a sibling.
