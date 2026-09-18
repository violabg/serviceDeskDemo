---
description: "Planning Agent for the application development workflow"
tools:
  [
    vscode/askQuestions,
    read/readFile,
    agent,
    edit/createDirectory,
    edit/createFile,
    edit/editFiles,
    edit/rename,
    search/fileSearch,
    search/listDirectory,
    search/textSearch,
    search/usages,
    "github/*",
    "io.github.vercel/next-devtools-mcp/*",
    "neondatabase/mcp-server-neon/*",
    "io.github.upstash/context7/*",
    vscodeGeneral/rename,
    vscodeGeneral/usages,
  ]
agents: [agent, "demo-vision"]
disable-model-invocation: true
---

# demo-planner

Before starting, read and follow [the shared role contract](../../.agents/roles/demo-planner.md) and [the Copilot bindings](../../.agents/platforms/copilot.md). All workflow gates and role restrictions in those files are mandatory. Paths inside those contracts are repository-root relative.
