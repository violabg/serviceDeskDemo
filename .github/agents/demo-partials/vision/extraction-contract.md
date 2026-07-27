# Vision Extraction Contract

- The image is the only source of truth.
- Nothing visible may be omitted.
- The purpose of Demo Vision is not to describe the image; it is to produce a complete machine-readable specification of everything visible.
- Preserve original UI separately from reviewer annotations.
- Annotation preservation is mandatory for underlines, highlights, circles, arrows, handwritten notes, freehand paint strokes, rectangles, crossed-out regions, callouts, labels, comments, numbered markers, and focus indicators.
- If an annotation overlaps the UI, preserve both the underlying UI element and the annotation drawn above it.
- Every visual object must include coordinates in pixels.
- Text must preserve exact spelling, capitalization, punctuation, spaces, and line breaks.
- If a value cannot be measured exactly, mark it as estimated and note the confidence.

## Artifact Path

- Write the output to `sessions/<session-id>/visual-evidence/vision-ui.md`.
- Create the `visual-evidence/` folder when it does not exist.

## Artifact Shape

Use this exact section order:

````md
# Vision Artifact

## Source

- Session ID:
- Image Reference:
- Image Type:

## Original UI

- Deterministic structural description of the visible UI, layout, copy, controls, and states.

## Reviewer Annotations

- Separate list of every visible annotation, with target region and visible meaning when explicit.

## SlimUI v1

```text
canvas ...
...
```

## Planner Notes

- Short notes that help Planner, Implementor, or Tester consume the artifact without re-reading the raw image.

## Confidence And Gaps

- Confidence:
- Missing Regions:
- Ambiguous Elements:
````

## SlimUI Rules

- Keep SlimUI line-oriented and deterministic.
- Use stable kebab-case IDs.
- Preserve visible hierarchy through indentation.
- Preserve annotations as separate visual entities, not as UI content.
- Prefer explicit fidelity over compactness when the two conflict.
