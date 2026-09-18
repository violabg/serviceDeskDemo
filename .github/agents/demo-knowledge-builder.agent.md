---
description: "Agent specialized in building knowledges for projects"
tools:
  [
    vscode/askQuestions,
    read/readFile,
    agent,
    edit/createDirectory,
    edit/createFile,
    edit/editFiles,
    edit/rename,
    search/listDirectory,
    search/usages,
    "io.github.vercel/next-devtools-mcp/*",
    "neondatabase/mcp-server-neon/*",
    "context7/*",
    vscodeGeneral/rename,
    vscodeGeneral/usages,
  ]
disable-model-invocation: true
---

# demo-knowledge-builder

Before starting, read and follow [the shared role contract](../../.agents/roles/demo-knowledge-builder.md) and [the Copilot bindings](../../.agents/platforms/copilot.md). All workflow gates and role restrictions in those files are mandatory. Paths inside those contracts are repository-root relative.
