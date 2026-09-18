---
description: "Implementation Executor Agent for the application development workflow"
tools:
  [
    vscode/installExtension,
    vscode/newWorkspace,
    vscode/runCommand,
    vscode/askQuestions,
    execute/getTerminalOutput,
    execute/runInTerminal,
    read/problems,
    read/readFile,
    read/terminalSelection,
    read/terminalLastCommand,
    agent,
    edit/createDirectory,
    edit/createFile,
    edit/editFiles,
    edit/rename,
    search/fileSearch,
    search/listDirectory,
    search/textSearch,
    search/usages,
  ]
disable-model-invocation: true
---

# demo-implementor

Before starting, read and follow [the shared role contract](../../.agents/roles/demo-implementor.md) and [the Copilot bindings](../../.agents/platforms/copilot.md). All workflow gates and role restrictions in those files are mandatory. Paths inside those contracts are repository-root relative.
