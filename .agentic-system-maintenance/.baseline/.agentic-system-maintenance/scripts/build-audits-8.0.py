#!/usr/bin/env python3
"""Build the 2026-10-11 environment-binding and context-boundary audit plans from the approved
runtime inventory (independent of file contents). Writes environment-audit.json and context-audit.json."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MAINT = ROOT / '.agentic-system-maintenance'
OLD_CTX = json.loads((MAINT / 'history/2026-10-11-before-8.0/.agentic-system-maintenance/context-audit.json').read_text())

ENVS = ['codex', 'copilot', 'claude-code']
ROLES = ['planner', 'implementor', 'direct-implementor', 'integration-tester', 'knowledge-builder', 'ask']
SKILLS = ['author-repo-skill', 'plan-bug-from-id', 'plan-user-story-from-id', 'user-story-analysis',
          'integration-test-knowledge-checklist', 'manage-work-item']
TRACKER = ['planner', 'implementor', 'direct-implementor']
NATIVE = {'codex': '.codex/agents/demo-{r}.toml', 'copilot': '.github/agents/demo-{r}.agent.md',
          'claude-code': '.claude/agents/demo-{r}-claude.md'}
INSTR = ['knowledge-guard', 'planning-sessions']
SHARED = ['docs/agents/integration-bindings.md', 'docs/agents/integration-policy.md', 'docs/agents/github-issues-adapter.md',
          'docs/agents/context-glossary.md', 'docs/agents/plan-schema.md', 'docs/agents/test-plan-schema.md',
          'docs/agents/artifact-gates.md', 'docs/agents/knowledge-index-schema.md', 'knowledge/knowledge-index.md',
          'docs/agents/instructions/agent-integrations.md'] + [f'docs/agents/instructions/{n}.instructions.md' for n in INSTR] + \
         [f'.agents/skills/{s}/SKILL.md' for s in SKILLS]

files = []


def add(output, envs, refs=()):
    files.append(dict(output=output, environments=list(envs), references=list(refs)))


def binding(env):
    return f'docs/agents/bindings/{env}.md'


root_refs = [{'output': binding(e), 'environments': [e]} for e in ENVS]
root_refs += [{'output': f'docs/agents/canonical/{e}/agents/demo-{r}.agent.md', 'environments': [e]} for e in ENVS for r in ROLES]
root_refs += ['docs/agents/integration-bindings.md', 'knowledge/knowledge-index.md', 'docs/agents/context-glossary.md',
              'docs/agents/plan-schema.md', 'docs/agents/artifact-gates.md', '.agents/skills/manage-work-item/SKILL.md'] + \
             [f'docs/agents/instructions/{n}.instructions.md' for n in INSTR]
add('AGENTS.md', ENVS, root_refs)
for path in SHARED:
    refs = []
    if path == 'docs/agents/integration-bindings.md':
        refs = [{'output': binding(e), 'environments': [e]} for e in ENVS] + ['docs/agents/integration-policy.md']
    if path.startswith('.agents/skills/plan-') or path.endswith('manage-work-item/SKILL.md'):
        refs = ['docs/agents/github-issues-adapter.md', 'docs/agents/integration-bindings.md']
    add(path, ENVS, refs)
for e in ENVS:
    add(binding(e), [e], ['docs/agents/integration-policy.md', 'docs/agents/github-issues-adapter.md'])
    for r in ROLES:
        copy = f'docs/agents/canonical/{e}/agents/demo-{r}.agent.md'
        refs = [binding(e), 'docs/agents/integration-policy.md', 'knowledge/knowledge-index.md', 'docs/agents/context-glossary.md']
        if r == 'planner':
            refs.append('docs/agents/plan-schema.md')
        if r in ('integration-tester', 'knowledge-builder', 'ask'):
            refs.append('docs/agents/test-plan-schema.md')
        if r in TRACKER:
            refs.append('docs/agents/github-issues-adapter.md')
        add(copy, [e], refs)
        add(NATIVE[e].format(r=r), [e], [copy])
for n in INSTR + ['agent-integrations']:
    add(f'.github/instructions/{n}.instructions.md', ['copilot'],
        [binding('copilot')] if n == 'agent-integrations' else [])
    add(f'.claude/rules/{n}.md', ['claude-code'], [binding('claude-code')] if n == 'agent-integrations' else [])
add('.codex/config.toml', ['codex'])
add('.claude/settings.json', ['claude-code'])
add('.mcp.json', ['claude-code'])

GH_SHARED = ['mcp__github__issue_read', 'mcp__github__issue_write', 'mcp__neon__']
env_audit = dict(version=1, runtime_outputs=[f['output'] for f in files], environments=[
    dict(id='codex', literals=['functions.exec', 'tools.exec_command', 'tools.apply_patch', 'tools.view_image', 'tools.web__run',
                               'collaboration.spawn_agent', 'collaboration.wait_agent', 'collaboration.send_message',
                               'mcp__next_devtools__', 'bearer_token_env_var', 'default_tools_enabled'] + GH_SHARED, delegation=[]),
    dict(id='copilot', literals=['vscode/askQuestions', 'read/readFile', 'search/fileSearch', 'search/listDirectory', 'search/textSearch',
                                 'search/usages', 'edit/createDirectory', 'edit/createFile', 'edit/editFiles', 'edit/rename',
                                 'execute/runInTerminal', 'execute/getTerminalOutput', 'read/problems', 'vscode/installExtension',
                                 'vscode/newWorkspace', 'vscode/runCommand', 'read/terminalSelection', 'read/terminalLastCommand',
                                 'web/fetch', 'agent/runSubagent', 'agentName', 'github/issue_read', 'github/issue_write',
                                 'neondatabase/mcp-server-neon/', 'io.github.vercel/next-devtools-mcp/'],
         delegation=[dict(tool='agent/runSubagent', selector='agentName', targets=[])]),
    dict(id='claude-code', literals=['AskUserQuestion', 'WebFetch', 'mcp__next-devtools__', 'claude --agent', '`Agent`', 'subagent_type'] + GH_SHARED,
         delegation=[dict(tool='`Agent`', selector='subagent_type', targets=['general-purpose'])]),
    # Retired bindings: no runtime file may contain them.
    dict(id='retired', literals=['mcp__codex_apps__', 'gh issue create', 'demo-vision', 'gpt-6-luna', 'GPT-6 Luna', 'SlimUI',
                                 'create-work-item-from-description'], delegation=[]),
], files=files)
(MAINT / 'environment-audit.json').write_text(json.dumps(env_audit, indent=2) + '\n')

def index_entries():
    import re
    text = (ROOT / 'knowledge/knowledge-index.md').read_text()
    section = re.search(r'^## Knowledge Entries\s*\n([\s\S]*?)(?=^## |\Z)', text, re.M).group(1)
    out = []
    for line in section.split('\n'):
        if not line.strip().startswith('|'):
            continue
        cell = line.split('|')[2].strip()
        if not cell or cell == 'Path' or re.fullmatch(r':?-+:?', cell):
            continue
        m = re.fullmatch(r'\[[^\]]*\]\(([^)]+)\)', cell)
        out.append(m.group(1).split('#')[0] if m else cell.strip('`'))
    return out


# Context audit: keep pre-run maintenance/knowledge records that still exist; replace runtime records.
removed = {'.agents/skills/create-work-item-from-description/SKILL.md', '.agents/skills/create-work-item-from-description/CHANGELOG.md'}
keep = [f for f in OLD_CTX['files'] if f['kind'] in ('maintenance', 'knowledge') and f['output'] not in removed
        and (ROOT / f['output']).exists()]
ctx_files = [dict(f, references=[r for r in f['references'] if r['output'] not in removed and (ROOT / r['output']).exists()]) for f in keep]
for path in ['.agentic-system-maintenance/scripts/render-8.0.py', '.agentic-system-maintenance/scripts/build-audits-8.0.py',
             '.agentic-system-maintenance/maintenance-plan-2026-10-11-upgrade-8.0-claude.md']:
    if not any(f['output'] == path for f in ctx_files):
        ctx_files.append(dict(output=path, kind='maintenance', references=[]))
known = {f['output'] for f in ctx_files}
for f in files:
    refs = []
    for r in f['references']:
        out = r if isinstance(r, str) else r['output']
        if out not in [x['output'] for x in refs]:
            refs.append(dict(output=out, when='ordinary'))
    rec = dict(output=f['output'], kind='knowledge' if f['output'].startswith('knowledge/') else 'runtime', references=refs)
    if f['output'] in known:
        continue
    if f['output'] == 'AGENTS.md':
        rec['maintenance_router'] = True
        rec['references'] += [dict(output='.agentic-system-maintenance/agentic-system-manifest.md', when='maintenance'),
                              dict(output='.agents/skills/bootstrap-agentic-system/SKILL.md', when='maintenance'),
                              dict(output='.agents/skills/maintain-agentic-system/SKILL.md', when='maintenance')]
    ctx_files.append(rec)
for extra in ['.agentic-system-maintenance/agentic-system-manifest.md', '.agents/skills/bootstrap-agentic-system/SKILL.md',
              '.agents/skills/maintain-agentic-system/SKILL.md']:
    if not any(f['output'] == extra for f in ctx_files):
        ctx_files.append(dict(output=extra, kind='maintenance', references=[]))
ctx = dict(version=1, knowledge_root='knowledge', knowledge_index='knowledge/knowledge-index.md',
           maintenance_root='.agentic-system-maintenance', excluded_roots=OLD_CTX['excluded_roots'],
           outputs=[f['output'] for f in ctx_files], files=ctx_files, knowledge_entries=index_entries())
(MAINT / 'context-audit.json').write_text(json.dumps(ctx, indent=2) + '\n')
print('environment audit files:', len(files), '; context audit files:', len(ctx_files))
