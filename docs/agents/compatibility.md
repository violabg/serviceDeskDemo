# Environment Compatibility Evidence

Discovery: 2026-09-18. Installation: 2026-09-19. Selected targets: Codex and GitHub Copilot in VS Code. Execution host for installation: Codex in a VS Code Insiders agent host (environment SDK path reports 0.153.0); the previously inspected standalone Codex CLI was 0.155.0 and VS Code stable 1.138.0. Do not conflate those clients. The current sandbox blocks Node and Git even after escalation requests; Python file operations remain available.

| Evidence source | Established behavior | Local result |
| --- | --- | --- |
| https://learn.chatgpt.com/docs/agent-configuration/subagents | Project `.codex/agents/*.toml`, name/description/developer_instructions, model and per-agent config layers | Registrations generated; actual discovery, layer inheritance and execution unverified |
| https://learn.chatgpt.com/docs/agent-configuration/agents-md | Root AGENTS.md and scoped instruction chain | Root router generated; request-sensitive modular reads are an instruction procedure, not native applyTo |
| https://learn.chatgpt.com/docs/build-skills | `.agents/skills` discovery; duplicate names remain separate | Unique demo-prefixed native skill names avoid collisions with Bootstrap mirrors; actual picker check pending |
| https://code.visualstudio.com/docs/agent-customization/custom-agents | `.github/agents`, tool strings, delegation allowlist, complete body loading, model and invocation metadata | Syntax/body checks available; actual client loading and tool access unverified |
| https://code.visualstudio.com/docs/agent-customization/custom-instructions | Root AGENTS.md and `.github/instructions` applyTo | Requires enabled chat.useAgentsMdFile/chat.includeApplyingInstructions and appropriate client harness; not changed globally |
| https://code.visualstudio.com/docs/agent-customization/agent-skills | Shared `.agents/skills` supported | Native adapters generated, discovery unverified |
| https://code.visualstudio.com/docs/agents/run/subagents | Coordinator routing for delegate questions; nested delegation off by default | Explicit coordinator route installed; behavioral execution pending |
| https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet | Built-in file/search/execution tools | Source baseline preserved; client can silently ignore absent tools, so diagnostics required |
| https://docs.github.com/en/copilot/reference/ai-models/supported-models | GPT-5.6 Luna, minimum VS Code 1.128.0 | Previous stable VS Code version meets minimum; account access and current Insiders picker unverified |
| https://developers.openai.com/api/docs/models/gpt-5.6-luna | Image input support | Previous local Codex model catalog listed gpt-5.6-luna with text/image input; generated delegate execution unverified |
| https://github.com/github/github-mcp-server | issue_read operation | Configured GitHub server; tool was exposed during discovery but is not exposed in current installation inventory |
| https://mcp.neon.tech/api/list-tools | Exact raw Neon tools and migration lifecycle | Public catalog confirmed; configured server not exposed in this session; qualified names unverified |
| https://github.com/vercel/next-devtools-mcp/blob/v0.3.6/src/tools/nextjs-docs.ts | Pinned v0.3.6 documentation tool | Existing config version preserved; Next tools exposed in host, per-role execution not performed |

## Required client verification

1. Reload each selected client; confirm seven demo agents and five demo skills. Do not select similarly named Bootstrap source templates.
2. Inspect Copilot Chat Diagnostics and the tool picker: exact configured MCP names, full agent loading, AGENTS.md and applicable instruction loading. Missing tools are not silently accepted.
3. In a disposable fixture outside sessions, test one read/search, one authorized artifact write, question/coordinator routing and an approved handoff. Test Ask's effective read-only boundary separately.
4. Verify Codex role-layer MCP inheritance actually narrows existing server definitions without losing transports; verify no unrelated inherited tool is mistaken for a granted role capability.
5. Verify Luna availability and conditional invocation from a model lacking image input. Verify inline image processing from an image-capable model. Keep test images and artifacts in the disposable fixture.
6. Verify the connected Neon and GitHub tools on the exact intended context before using those dependent workflows. Do not mutate data merely to test connectivity.

Until these checks succeed, both installations have status **unverified**, not fully compatible. A missing required tool blocks only operations that depend on it. Canonical preservation and native instruction-body equality are separate structural checks.

## 2026-09-25 Maintenance Evidence

- Selected targets remain Codex and GitHub Copilot in VS Code. Official Codex subagent documentation (`https://learn.chatgpt.com/docs/agent-configuration/subagents`, retrieved 2026-09-25) documents project TOML registrations, per-agent model selection and inherited tools. The GPT-6 Luna model page (`https://developers.openai.com/api/docs/models/gpt-6-luna`, retrieved 2026-09-25) lists image input. The Codex Vision registration now selects `gpt-6-luna`; its actual discovery and native image-viewing access are unverified.
- Official VS Code custom-agent documentation (`https://code.visualstudio.com/docs/agent-customization/custom-agents`, retrieved 2026-09-25) documents `model`, `tools` and `disable-model-invocation`, and warns that unavailable tools can be ignored. The user-selected Copilot Vision model and repository retrieval tools require a live model/tool picker check; no image processing has been verified in that role.
- Bootstrap 5.2.0 permits bounded native file/path and text search without cluster metadata; `docs/agents/integration-bindings.md` retains the approved Copilot and Codex commands and locally derived grouping. No search MCP is required. Test Planner and Direct Implementor search in their generated roles using a disposable fixture outside existing session folders; their effective runtime access is still unverified.
- Bootstrap 5.2.0 also requires a selected visual role to fetch and inspect remote issue-image bytes with repository permissions, or request an inaccessible image from the user. The source registry, canonical role text and bindings now state this rule; no private issue image was provided for a permissions/image-input test. Codex and Copilot Vision remote-image access remains unverified and must not be inferred from issue lookup or URL access alone.
