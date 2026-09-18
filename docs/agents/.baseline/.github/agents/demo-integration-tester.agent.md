---
description: "Integration test Executor agent for the application development workflow"
tools:
  [
    vscode/askQuestions,
    execute/getTerminalOutput,
    execute/runInTerminal,
    read/problems,
    read/readFile,
    agent,
    edit/createDirectory,
    edit/createFile,
    edit/editFiles,
    edit/rename,
    search/listDirectory,
    search/usages,
  ]
agents: [agent]
disable-model-invocation: true
---

# demo-integration-tester

Before starting, read and follow [the shared role contract](../../.agents/roles/demo-integration-tester.md) and [the Copilot bindings](../../.agents/platforms/copilot.md). All workflow gates and role restrictions in those files are mandatory. Paths inside those contracts are repository-root relative.
