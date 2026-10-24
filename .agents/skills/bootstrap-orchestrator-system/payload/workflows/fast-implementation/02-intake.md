You are executing the intake of the Fast Implementation workflow. This workflow has no approval gate and no design document — the requirement is the only authority, and you never wait for an approval.

**Requirement freeze (execute first).** Before doing anything else, persist R — the user's requirement, byte-for-byte — as a session artifact by calling `#capability:session-artifact-write` with name `requirement_R_lock`, description `Verbatim functional requirement R`, intended use `immutable source of truth for R`, MIME type `text/markdown`, and R itself as the content. Never summarize, translate, reorder or reformat R. R is read from this artifact instead of relying on conversation recall. R changes only on an explicit user revision, which replaces the artifact.

Inspect the user request for image and Figma artifacts.
For every provided image, immediately follow the IMAGE_INTAKE_INSTRUCTION below.
For every Figma link, ask the user the following, substituting each `[figma_links_N]` slot with its corresponding link:

The request contains the following figma links:

[figma_links_1]
[figma_links_2]
but I cannot access them because of technological limitations.
Please save the figma design screenshot in a folder that I can access and tell me the path.

After receiving the screenshot path(s), apply the IMAGE_INTAKE_INSTRUCTION below to every screenshot.

IMAGE_INTAKE_INSTRUCTION:
For every provided image:
1. Call `#capability:visual-evidence` with the local file path or the web URL of the image to obtain its image resource content.
2. Analyze the returned image resource content to understand the image.
3. Choose an artifact name and an artifact description that reflect the image content; make the name unique in the session, adding its origin and a uniqueness suffix when needed.
4. Call `#capability:session-image-attach` for that image, passing the same local file path or web URL in `blobUrl` and an `artifactFrontMatter` populated with the chosen name and description.
5. Keep the returned image resource content and record the artifact name, its origin and its purpose in the session memory, so later steps can retrieve it with `#capability:session-artifact-read` and pass the name to subagents.
Repeat the sequence for every image: one `#capability:visual-evidence` call and one `#capability:session-image-attach` call per image.
Never read an image in any other way: OCR, external vision models, binary file reading and any other method are invalid. `#capability:visual-evidence` is the only way to look at the image, followed by `#capability:session-image-attach` to persist it in the session.

Failure arms:
- A provided image path, URL or screenshot path is unreachable or unreadable, or the tool returns an error or a textual error block: report it to the user and ask for a valid path; if no valid resource is provided, record a blocker and do not draw conclusions from that image.
- The Figma screenshot-path request is never answered: wait, then ask once more; if there is still no answer, continue intake and carry the missing screenshots as an open point for a later step.

STOP POINT (only if triggered): the Figma screenshot-path request requires waiting for the user. If it was triggered, WAIT for the user's response before calling `#capability:workflow-step-next` again.

**Halt protocol.** A step may end at an explicit halt: you present the required artifact or message and stop, waiting for the developer. At a halt you must NOT call `#capability:workflow-step-next` until the developer responds. Everywhere else you keep executing and chaining tool calls until the step's work is done: a message with no tool call ends the workflow and is a violation.

IMPORTANT:
If you have retrieved a workitem from the work item tracker (or another source), directly or through a subagent, after the retrieval check whether the workitem (or the artifact the subagent produced) contains any image or figma artifact, and apply the above instructions to every artifact found.
Do not assume that, because the prompt carries no image or figma artifact, the retrieved workitem carries none either.

Also, from now on, every time you receive an image path or URL, follow the IMAGE_INTAKE_INSTRUCTION above to process it.

After completing ALL the provided instructions, call the tool `#capability:workflow-step-next` again to receive the next instruction. Do not deviate from these instructions or take any action they do not authorize.
