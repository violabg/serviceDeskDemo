# Codex bindings

Read `.agents/platforms/capabilities.md`. Native custom agents are `.codex/agents/*.toml`; each loads the same shared role used by Copilot. Agent files intentionally omit model, reasoning effort, sandbox, and MCP overrides so the active parent configuration is inherited. In particular, the Copilot Vision model spelling is not copied to Codex; Codex Vision inherits the parent's model and requires image capability.

- Repository search and file reads: native file tools or `rg`, `rg --files`, and bounded reads through the available execution tool. Never enumerate sessions during maintenance; ordinary workflows access only their explicit active session.
- Writes: native patch/file tools or bounded filesystem operations, subject to role and approval restrictions.
- Terminal: the available execution tool and its continuation mechanism. Run only commands allowed by the role.
- Diagnostics: run `pnpm typecheck` and relevant lint/test commands as required by the current role; use their actual compiler/linter output in place of editor diagnostics. Preserve the Compiler Recovery Policy and do not invent a `read/problems` tool.
- Ask-user: an available user-input tool in a mode where it is supported; otherwise ask directly. Wait for required answers/approvals.
- Delegation: use the exposed native agent-spawn tool, selecting the configured `demo-*` role when its schema supports a custom-agent selector. If the host only accepts a task/message, explicitly supply the matching shared role and this adapter as instructions to the child. If delegation is absent, follow the bounded inline procedure.
- GitHub: discover the actual GitHub MCP issue/details/comments read tools and inspect their schemas. Use them under the shared capability contract; do not guess a Copilot namespace.
- Visual: native image intake or an available image-read tool (for example `view_image`), plus available browser tools when capture is required. Never substitute generated images for observed evidence.

`.codex/config.toml` projects the repository's MCP server inventory. All additional enabled user/plugin MCP servers remain inherited. No role sets MCP tool filters. Configuration does not authenticate a server, bypass host policy, or hot-load tools into an already running conversation. When required tools are missing, report the specific server/operation and follow `docs/agents/platform-support.md`.

Use the root `AGENTS.md` router to load `.github/instructions/*.instructions.md` only for matching paths; Copilot `applyTo` metadata is not automatic Codex enforcement. Shared skill `agents/openai.yaml` files preserve explicit-only invocation where requested.
