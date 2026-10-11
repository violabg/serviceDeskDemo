#!/usr/bin/env python3
"""Maintenance renderer for the approved 2026-10-11 run.

Set U: Bootstrap 8.0.0 upgrade. Set E: claude-code environment, Vision retirement,
Codex GitHub via MCP. See ../maintenance-plan-2026-10-11-upgrade-8.0-claude.md.

Three-way guard: a runtime file is overwritten only when its current bytes equal its
baseline copy (MINE == BASE), or when a register row resolves the region (ALLOW_CUSTOM).
Template-derived outputs only; authored binding docs are written separately.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SKILL = ROOT / '.agents/skills/bootstrap-agentic-system'
MAINT = ROOT / '.agentic-system-maintenance'
BASE = MAINT / '.baseline'
# Pre-run recipe (slot values and blocks recorded before this run), kept in the rollback snapshot.
OLD = json.loads((MAINT / 'history/2026-10-11-before-8.0/.agentic-system-maintenance/preservation-plan.json').read_text())
CURRENT = json.loads((MAINT / 'preservation-plan.json').read_text())
OLD_COPIES = {c['output']: c for c in OLD['copies']}

ENVS = ['codex', 'copilot', 'claude-code']
ROLES = ['planner', 'implementor', 'direct-implementor', 'integration-tester', 'knowledge-builder', 'ask']
SKILLS = ['author-repo-skill', 'plan-bug-from-id', 'plan-user-story-from-id', 'user-story-analysis',
          'integration-test-knowledge-checklist', 'manage-work-item']
IMPL = ['implementor', 'direct-implementor']
TRACKER_ROLES = ['planner'] + IMPL
MCP_ROLES = ['ask', 'planner', 'implementor', 'direct-implementor', 'knowledge-builder']
DELEGATING = ['planner', 'direct-implementor', 'integration-tester', 'knowledge-builder']
NEON_READ = ['list_docs_resources', 'get_doc_resource', 'get_database_tables', 'describe_table_schema', 'list_branches', 'compare_database_schema']
NEON_WRITE = ['prepare_database_migration', 'run_sql', 'complete_database_migration']
NEXT_READ = ['init', 'nextjs_docs', 'nextjs_index', 'nextjs_call']
GITHUB_MCP_URL = 'https://api.githubcopilot.com/mcp/'
GITHUB_TOKEN_ENV = 'GITHUB_TOKEN'
# Register-resolved files whose MINE may differ from BASE: none for this run's outputs.
ALLOW_CUSTOM = set()
DRY = '--dry-run' in sys.argv
if '--rerender' in sys.argv:
    # Re-running this approved render may overwrite only outputs it recorded itself.
    ALLOW_CUSTOM |= set(CURRENT['canonical_outputs'])
    ALLOW_CUSTOM |= {a['path'] for a in json.loads((MAINT / 'native-adapters.json').read_text())}

COPIES, ADAPTERS, WRITTEN = [], [], []


def sha(s):
    return hashlib.sha256(s.encode() if isinstance(s, str) else s).hexdigest()


def norm(s):
    return s.replace('\r\n', '\n').replace('\r', '\n')


def guard(path):
    p, b = ROOT / path, BASE / path
    if not p.exists():
        return
    if path in ALLOW_CUSTOM:
        return
    if not b.exists():
        raise SystemExit('Refusing to overwrite unbaselined file: ' + path)
    if norm(p.read_text()) != norm(b.read_text()):
        raise SystemExit('Refusing to overwrite customized file (MINE != BASE): ' + path)


def write(path, text):
    guard(path)
    WRITTEN.append(path)
    if DRY:
        return
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text)


def fill(source, values, blocks):
    # Same semantics as the shipped verify-canonical-copies.mjs: named, occurrence-bound slots only.
    out, region, counts, used = [], None, {}, set()
    for line in norm(source).split('\n'):
        start = re.fullmatch(r'<!-- CANONICAL-TEMPLATE-SLOT: ([A-Z0-9_]+) START replaces=(?:none|sha256:[a-f0-9]+ lines=\d+) -->', line)
        end = re.fullmatch(r'<!-- CANONICAL-TEMPLATE-SLOT: ([A-Z0-9_]+) END -->', line)
        if start:
            if region:
                raise ValueError('nested slot')
            name = start[1]
            occurrence = counts.get(name, 0)
            counts[name] = occurrence + 1
            region = [name, occurrence, []]
        elif end:
            if not region or region[0] != end[1]:
                raise ValueError('bad slot end')
            key = (region[0], region[1])
            matches = [(i, b) for i, b in enumerate(blocks) if (b['slot'], b['occurrence']) == key]
            if len(matches) > 1:
                raise ValueError('duplicate block')
            if matches:
                i, b = matches[0]
                used.add(i)
                if b['value']:
                    out.append(norm(b['value']))
            else:
                out.extend(region[2])
            region = None
        else:
            if 'CANONICAL-TEMPLATE-SLOT' in line:
                raise ValueError('bad slot marker')
            (region[2] if region else out).append(line)
    if region or len(used) != len(blocks):
        raise ValueError('unmatched slot')
    s = '\n'.join(out)
    if '"{{APPROVED_MCP_TOOLS}}"' in s:
        tools = ', '.join(json.dumps(t) for t in values['APPROVED_MCP_TOOLS'])
        if values.get('PLATFORM_TOOLS') == '':
            s = s.replace('{{PLATFORM_TOOLS}}, "{{APPROVED_MCP_TOOLS}}"', tools)
        s = s.replace(', "{{APPROVED_MCP_TOOLS}}"', ', ' + tools if tools else '')
        s = s.replace('"{{APPROVED_MCP_TOOLS}}"', tools)
    s = re.sub(r'\{\{([A-Z0-9_]+)\}\}', lambda m: values[m[1]], s)
    if re.search(r'\{\{[A-Z0-9_]+\}\}', s):
        raise ValueError('unfilled slot')
    return s


def canonical(template, path, all_values, blocks=None, environments=None):
    source = norm((SKILL / template).read_text())
    declared = set(re.findall(r'\{\{([A-Z0-9_]+)\}\}', source))
    values = {k: all_values[k] for k in sorted(declared)}
    blocks = blocks or []
    COPIES.append(dict(template=template, sha256=sha(source), output=path, values=values, blocks=blocks,
                       environments=environments or ENVS))
    result = fill(source, values, blocks)
    write(path, result)
    return result


def frontmatter(s):
    head, body = s[4:].split('\n---\n', 1)
    d = {}
    for line in head.splitlines():
        k, v = line.split(':', 1)
        v = v.strip()
        if v.startswith('['):
            v = re.sub(r'(?<=\[)agent(?=[,\]])', '"agent"', v)
        try:
            d[k] = json.loads(v)
        except json.JSONDecodeError:
            d[k] = v
    return d, body


def yaml_front(d, body):
    return '---\n' + ''.join(k + ': ' + json.dumps(v, ensure_ascii=False) + '\n' for k, v in d.items()) + '---\n' + body


# ---------------------------------------------------------------- environment tool surfaces

def mcp_map(role):
    d = {}
    if role in TRACKER_ROLES:
        d['github'] = ['issue_read']
    if role in MCP_ROLES:
        d['neon'] = NEON_READ + (NEON_WRITE if role in IMPL else [])
        d['next-devtools'] = NEXT_READ + (['browser_eval'] if role in IMPL else [])
    return d


def qualified(env, server, tool):
    if env == 'codex':
        return 'mcp__' + server.replace('-', '_') + '__' + tool
    if env == 'claude-code':
        return 'mcp__' + server + '__' + tool
    return {'github': 'github', 'neon': 'neondatabase/mcp-server-neon',
            'next-devtools': 'io.github.vercel/next-devtools-mcp'}[server] + '/' + tool


def approved_mcp(env, role):
    return [qualified(env, s, t) for s, ts in mcp_map(role).items() for t in ts]


def native_tools(env, role):
    if env == 'codex':
        t = ['functions.exec']
        if role in DELEGATING:
            t += ['collaboration.spawn_agent', 'collaboration.send_message', 'collaboration.wait_agent']
        return t
    if env == 'claude-code':
        t = ['AskUserQuestion', 'Read', 'Grep', 'Glob']
        if role != 'ask':
            t += ['Edit', 'Write']
        if role in IMPL + ['integration-tester']:
            t += ['Bash']
        if role in DELEGATING:
            t += ['Agent']
        if role in ['ask', 'planner', 'knowledge-builder']:
            t += ['WebFetch']
        return t
    read = ['read/readFile', 'search/fileSearch', 'search/listDirectory', 'search/textSearch', 'search/usages']
    edit = ['edit/createDirectory', 'edit/createFile', 'edit/editFiles', 'edit/rename']
    run = ['execute/runInTerminal', 'execute/getTerminalOutput', 'read/problems']
    t = ['vscode/askQuestions'] + read
    if role != 'ask':
        t += edit
    if role in IMPL + ['integration-tester']:
        t += run
    if role in IMPL:
        t += ['vscode/installExtension', 'vscode/newWorkspace', 'vscode/runCommand', 'read/terminalSelection', 'read/terminalLastCommand']
    if role != 'ask':
        t += ['agent']
    if role in ['ask', 'planner', 'knowledge-builder']:
        t += ['web/fetch']
    return t


# ---------------------------------------------------------------- environment-neutral slot values (S1)

B = 'the active environment binding (`docs/agents/bindings/<environment>.md`, for the environment the root router resolved)'
S = 'sessions/<planning-session-id>'

COMMON = {
    'REPO_NAME': 'serviceDeskDemo',
    'SESSION_ROOT': 'sessions',
    'KNOWLEDGE_INDEX_PATH': 'knowledge/knowledge-index.md',
    'KNOWLEDGE_SOURCE': 'knowledge/knowledge-index.md',
    'KNOWLEDGE_FILE_GLOB': 'knowledge/**/*.md',
    'REPO_KNOWLEDGE_PATHS': 'knowledge/',
    'CONTEXT_GLOSSARY_PATH': 'docs/agents/context-glossary.md',
    'PLAN_SCHEMA_PATH': 'docs/agents/plan-schema.md',
    'TEST_PLAN_SCHEMA_PATH': 'docs/agents/test-plan-schema.md',
    'ARTIFACT_GATES_PATH': 'docs/agents/artifact-gates.md',
    'MANIFEST_PATH': '.agentic-system-maintenance/agentic-system-manifest.md',
    'MAINTENANCE_ROOT': '.agentic-system-maintenance/',
    'SKILL_ROOT': '.agents/skills',
    'INSTRUCTION_ROOT': "docs/agents/instructions; skip a shared rule already loaded by the active environment's native adapter",
    'AGENT_ROOT': 'docs/agents/canonical/<environment>/agents (codex, copilot or claude-code)',
    'VALIDATION_COMMANDS': 'diagnostics, then pnpm typecheck and scoped lint, then focused pnpm test -- <affected-files>; run pnpm lint, pnpm test and pnpm build only when the approved change requires broader validation; changes to agent-system files are reported for explicit agent-system maintenance, which runs its own verifier',
    'INTEGRATION_TEST_SCOPE': OLD_COPIES['.agents/skills/integration-test-knowledge-checklist/SKILL.md']['values']['INTEGRATION_TEST_SCOPE'],
    'WORK_ITEM_ID_FORMAT': OLD_COPIES['.agents/skills/plan-bug-from-id/SKILL.md']['values']['WORK_ITEM_ID_FORMAT'],
    'LOCAL_MARKDOWN_TRACKER_CONTRACT': OLD_COPIES['.agents/skills/plan-bug-from-id/SKILL.md']['values']['LOCAL_MARKDOWN_TRACKER_CONTRACT'],
    'TRACKER_ADAPTER': OLD_COPIES['.agents/skills/plan-bug-from-id/SKILL.md']['values']['TRACKER_ADAPTER'],
    'WORK_ITEM_GATHERING': OLD_COPIES['.agents/skills/plan-bug-from-id/SKILL.md']['values']['WORK_ITEM_GATHERING'],
    'REPOSITORY_SEARCH_TOOL': 'the bounded native repository search listed in ' + B,
    'WORK_ITEM_RETRIEVAL': 'the GitHub MCP `issue_read` operation (methods `get`, `get_comments` and `get_labels`) for exact issue IDs in `violabg/serviceDeskDemo`, called by the qualified tool name in ' + B + '; retrieve comments with explicit pagination and stop if all pages cannot be retrieved; use issue type or labels only when returned, ask if type is missing or conflicting, follow `docs/agents/github-issues-adapter.md`, and never search, list, or write tracker data',
    'WORK_ITEM_WRITE': 'the GitHub MCP `issue_write` operation, called by the qualified tool name in ' + B + ': `method: create` for an approved new bug or user story in `violabg/serviceDeskDemo`, and `method: update` only for the approved per-field change to the item read in this run; no delete, bulk, search, list, comment, sub-issue, label-administration or state change unless the approved change names it',
    'QUESTION_TOOL': 'the foreground question route listed in ' + B + '; delegates return questions to the parent, which asks the user and returns the answers',
    'KNOWLEDGE_DISCOVERY_DELEGATION': 'Use the verified default evidence delegation procedure in ' + B + ', up to ten bounded evidence tasks within runtime concurrency limits. If delegation is unavailable or unverified, gather the same evidence inline under the approved 2026-10-08 fallback. Return delegate questions to the foreground coordinator. Preserve the role\'s authority and owning-session scope.',
    'VISION_AGENT_NAME': '',
    'VISION_INVOCATION': 'Inspect this image inline with the active model\'s image input, using the image-read operation listed in ' + B + ' on a local file path. For a remote issue image URL, fetch the bytes with the web-fetch operation in that binding only when the URL is publicly readable; otherwise ask the user to save the image locally and give its path. Never describe an image from its URL, filename, or alt text alone. Write one `visual-evidence v1` JSON artifact per image to `' + S + '/artifacts/visual/<image-name>.json` with `session_id`, `image`, `observed_text`, `layout`, `components`, `states` and `uncertainties`, recording only what is visible. Return that JSON artifact name to the steps below. Use the following task context:',
}

MW_VALUES = dict(COMMON,
    TRACKER_ADAPTER='GitHub Issues in `violabg/serviceDeskDemo` via `docs/agents/github-issues-adapter.md`',
    WORK_ITEM_RETRIEVAL='the GitHub MCP `issue_read` operation (methods `get` and `get_comments`, all comment pages) for the one requested issue ID, called by the qualified tool name in ' + B)

OUT_OF_SCOPE_ASK = 'Not available to this read-only role: do not perform this operation; tell the user which step was skipped.'
OUT_OF_SCOPE_KB = 'Not available to Knowledge Builder: inspect existing plans read-only with the file-read operation in ' + B + '; never edit plans.'


def binding_row(role, token):
    if role == 'ask' and token in {'execution-report-read', 'execution-report-write', 'file-editing', 'implementation-plan-list',
                                   'implementation-plan-load', 'implementation-plan-save', 'knowledge-document-write',
                                   'knowledge-index-rebuild', 'session-activate', 'session-artifact-list', 'session-artifact-read',
                                   'session-artifact-write', 'session-event-log', 'session-list', 'session-memory-append',
                                   'session-memory-read', 'test-plan-list', 'test-plan-load', 'test-plan-save'}:
        return OUT_OF_SCOPE_ASK
    if role == 'knowledge-builder' and token in {'implementation-plan-load', 'implementation-plan-save', 'test-plan-load', 'test-plan-save'}:
        return OUT_OF_SCOPE_KB
    if role == 'ask' and token == 'visual-evidence':
        return 'Inspect the image inline with the image-read operation in ' + B + ' on a local file path; fetch a remote image only when publicly readable, otherwise ask for a local copy. Never describe an image from its URL alone. Write no artifacts.'
    table = {
        'execution-report-read': 'Read `' + S + '/execution-report.md` with the file-read operation in ' + B + '.',
        'execution-report-write': 'Write `' + S + '/execution-report.md` with the file-edit operation in ' + B + '.',
        'file-editing': 'The file-edit operation in ' + B + ', within this role\'s file-operation scope.',
        'implementation-plan-list': 'List the implementation plans in the current Planning Session folder `' + S + '/` with the file-search operation in ' + B + '; never list other sessions.',
        'implementation-plan-load': 'Open the existing implementation plan in the current Planning Session folder and edit it in place with the file-read and file-edit operations in ' + B + '.',
        'implementation-plan-save': 'Save the implementation plan to its path in the current Planning Session folder with the file-edit operation in ' + B + '.',
        'implementation-plan-schema': 'Read `docs/agents/plan-schema.md` and obey it as the plan contract.',
        'knowledge-document-read': 'Read the knowledge document the index points to with the file-read operation in ' + B + '.',
        'knowledge-document-write': 'Write the knowledge document under `knowledge/` and update its entry in `knowledge/knowledge-index.md` with the file-edit operation in ' + B + '.',
        'knowledge-index-read': 'Read `knowledge/knowledge-index.md` and select entries by their `When to read` triggers.',
        'knowledge-index-rebuild': 'Rebuild `knowledge/knowledge-index.md` from the files under `knowledge/` and the repository documents it indexes, using the file-read, file-search and file-edit operations in ' + B + ', within this role\'s knowledge-operation scope.',
        'repository-search': 'The bounded repository search in `docs/agents/integration-policy.md` (Repository evidence and authority), using the file/path and text search operations in ' + B + '; exclude maintenance roots and session contents.',
        'session-activate': 'Create or resume the current Planning Session folder under `sessions/`. Session identity is a directory, not a service.',
        'session-artifact-list': 'List `' + S + '/artifacts/` with the file-search operation in ' + B + '.',
        'session-artifact-read': 'Read `' + S + '/artifacts/<artifact-name>.md` with the file-read operation in ' + B + '.',
        'session-artifact-write': 'Write `' + S + '/artifacts/<artifact-name>.md` with the file-edit operation in ' + B + '.',
        'session-event-log': 'Append the event to `' + S + '/session-log.md` with the file-edit operation in ' + B + '. Keep event history separate from session memory summaries.',
        'session-list': 'Read only the current Planning Session folder under `sessions/`. Never enumerate other sessions.',
        'session-memory-append': 'Append to `' + S + '/session-memory.md`, newest entry last, with the file-edit operation in ' + B + '.',
        'session-memory-read': 'Read `' + S + '/session-memory.md` with the file-read operation in ' + B + '.',
        'test-plan-list': 'List the test plans in the current Planning Session folder `' + S + '/` with the file-search operation in ' + B + '; never list other sessions.',
        'test-plan-load': 'Open the existing test plan in the current Planning Session folder and edit it in place with the file-read and file-edit operations in ' + B + '.',
        'test-plan-save': 'Save the test plan to its path in the current Planning Session folder with the file-edit operation in ' + B + '.',
        'test-plan-schema': 'Read the approved test-plan schema at `docs/agents/test-plan-schema.md` before drafting YAML.',
        'visual-evidence': 'Inspect each image inline under the visual-evidence rules in `docs/agents/integration-policy.md`, with the image-read operation in ' + B + ' on a local file path. Fetch a remote issue image only when publicly readable; otherwise ask the user for a local copy. Never describe an image from its URL alone. Store one `visual-evidence v1` JSON artifact per image under `' + S + '/artifacts/visual/`.',
        'wiki-catalog-read': 'Not available: no wiki source is approved for this repository. Skip the wiki lookup, record the skipped source in the planning artifacts, and continue with `knowledge/knowledge-index.md`.',
        'wiki-page-list': 'Not available: no wiki source is approved for this repository. Skip the wiki lookup, record the skipped source in the planning artifacts, and continue with `knowledge/knowledge-index.md`.',
        'wiki-page-read': 'Not available: no wiki source is approved for this repository. Skip the wiki lookup, record the skipped source in the planning artifacts, and continue with `knowledge/knowledge-index.md`.',
        'work-item-batch-retrieval': 'GitHub MCP `issue_read` with `method: get`, one call per provided issue ID in `violabg/serviceDeskDemo`, by the qualified tool name in ' + B + '. Do not recurse, search or list; follow `docs/agents/github-issues-adapter.md`.',
        'work-item-comment-retrieval': 'GitHub MCP `issue_read` with `method: get_comments`, requesting every page, by the qualified tool name in ' + B + '. Stop if all pages cannot be retrieved.',
        'work-item-retrieval': 'GitHub MCP `issue_read` with `method: get` for the requested External Issue ID, by the qualified tool name in ' + B + '; follow `docs/agents/github-issues-adapter.md`.',
        'work-item-type-retrieval': 'GitHub MCP `issue_read` with `method: get` and `method: get_labels`, by the qualified tool name in ' + B + '. Use type or labels only when returned; ask when missing or conflicting.',
    }
    return table[token]


def capability_bindings(role):
    side = (SKILL / f'templates/agents/{role}.capabilities.yaml').read_text()
    tokens = re.findall(r'- token: (\S+)', side)
    rows = ['| Capability | Binding |', '| --- | --- |']
    rows += ['| `#capability:' + t + '` | ' + binding_row(role, t) + ' |' for t in tokens]
    return '\n'.join(rows)


def knowledge_block(role):
    old = OLD_COPIES[f'docs/agents/canonical/codex/agents/demo-{role}.agent.md']['blocks'][0]['value']
    new = old.replace('`docs/agents/bindings/codex.md`', '`docs/agents/bindings/<environment>.md` for the environment the root router resolved')
    if new == old:
        raise SystemExit('KNOWLEDGE_SOURCE block did not contain the expected binding path for ' + role)
    return new


# ---------------------------------------------------------------- native adapters

def codex_toml(role, metadata, body):
    t = 'name = ' + json.dumps('demo-' + role) + '\n'
    t += 'description = ' + json.dumps(metadata['description'], ensure_ascii=False) + '\n'
    t += 'sandbox_mode = ' + json.dumps('read-only' if role == 'ask' else 'workspace-write') + '\n'
    t += 'developer_instructions = ' + json.dumps(body, ensure_ascii=False) + '\n'
    t += '\n[apps.github]\ndefault_tools_enabled = false\n'
    m = mcp_map(role)
    for server in ['github', 'neon', 'next-devtools']:
        raw = m.get(server, [])
        t += '\n[mcp_servers.' + json.dumps(server) + ']\n'
        if server == 'github':
            t += 'url = ' + json.dumps(GITHUB_MCP_URL) + '\n'
            t += 'bearer_token_env_var = ' + json.dumps(GITHUB_TOKEN_ENV) + '\n'
        elif server == 'neon':
            t += 'url = "https://mcp.neon.tech/mcp"\n'
        else:
            t += 'command = "npx"\nargs = ["next-devtools-mcp@0.3.6"]\n'
        t += 'enabled = ' + str(bool(raw)).lower() + '\n'
        if raw:
            t += 'enabled_tools = ' + json.dumps(raw) + '\n'
    return t


def main():
    for env in ENVS:
        for role in ROLES:
            values = dict(COMMON,
                          PLATFORM_TOOLS=', '.join(json.dumps(t) for t in native_tools(env, role)),
                          APPROVED_MCP_TOOLS=approved_mcp(env, role),
                          CAPABILITY_BINDINGS=capability_bindings(role))
            blocks = [dict(slot='KNOWLEDGE_SOURCE', occurrence=0, value=knowledge_block(role))]
            path = f'docs/agents/canonical/{env}/agents/demo-{role}.agent.md'
            rendered = canonical(f'templates/agents/{role}.agent.md', path, values, blocks, [env])
            metadata, body = frontmatter(rendered)
            if env == 'copilot':
                meta = dict(metadata)
                if 'agents' in meta:
                    meta['agents'] = [a for a in meta['agents'] if a]
                meta['name'] = 'demo-' + role
                native, text, fmt = f'.github/agents/demo-{role}.agent.md', yaml_front(meta, body), 'markdown'
            elif env == 'codex':
                native, text, fmt = f'.codex/agents/demo-{role}.toml', codex_toml(role, metadata, body), 'toml'
            else:
                meta = {'name': f'demo-{role}-claude', 'description': metadata['description'],
                        'tools': native_tools('claude-code', role) + approved_mcp('claude-code', role)}
                native, text, fmt = f'.claude/agents/demo-{role}-claude.md', yaml_front(meta, body), 'markdown'
            write(native, text)
            ADAPTERS.append(dict(path=native, canonical_copy=path, format=fmt, body_sha256=sha(body), role=role, environment=env))

    for name in SKILLS:
        blocks = []
        if name == 'integration-test-knowledge-checklist':
            blocks = OLD_COPIES['.agents/skills/integration-test-knowledge-checklist/SKILL.md']['blocks']
        canonical(f'templates/skills/{name}/SKILL.md', f'.agents/skills/{name}/SKILL.md',
                  MW_VALUES if name == 'manage-work-item' else COMMON, blocks)

    for name in ['knowledge-guard', 'planning-sessions']:
        rendered = canonical(f'templates/instructions/{name}.instructions.md', f'docs/agents/instructions/{name}.instructions.md', COMMON)
        write(f'.github/instructions/{name}.instructions.md', rendered)
        meta, body = frontmatter(rendered)
        ADAPTERS.append(dict(path=f'.github/instructions/{name}.instructions.md', canonical_copy=f'docs/agents/instructions/{name}.instructions.md',
                             format='markdown', body_sha256=sha(body), role='instruction', environment='copilot'))
        glob = meta.get('applyTo')
        claude = ('---\npaths:\n  - ' + json.dumps(glob) + '\n---\n' if glob and glob != '**' else '') + body
        write(f'.claude/rules/{name}.md', claude)
        ADAPTERS.append(dict(path=f'.claude/rules/{name}.md', canonical_copy=f'docs/agents/instructions/{name}.instructions.md',
                             format='markdown', body_sha256=sha(body), role='instruction', environment='claude-code'))

    purposes = {'planner': 'GitHub-issue planning and clarification', 'implementor': 'approved-plan implementation',
                'direct-implementor': 'explicit implementation without a plan document; no test creation',
                'integration-tester': 'integration-test planning and execution', 'knowledge-builder': 'evidence-backed repository knowledge',
                'ask': 'read-only Q&A'}
    roster = ['Resolve the active environment from the client/session identity first: use `codex`, `copilot` or `claude-code`, never infer selection from installed folders or another client\'s tools. If ambiguous, ask for identity before binding-dependent work. Load only `docs/agents/bindings/<environment>.md` and the complete selected role contract below. Native registrations may carry a client suffix (Claude Code: `<role>-claude`); the selected binding names them.', '']
    roster += [f'- `demo-{r}`: {purposes[r]}. Load `docs/agents/canonical/<environment>/agents/demo-{r}.agent.md`.' for r in ROLES]
    roster += ['', 'Shared skills use only the already selected environment binding. Invoke the complete configured skill at `.agents/skills/<skill-name>/SKILL.md`; packaged Bootstrap templates are source mirrors, never configured runtime skills.']
    root_values = dict(COMMON, AGENT_ROSTER='\n'.join(roster))
    old_root = OLD_COPIES['AGENTS.md']
    root_blocks = [b for b in old_root['blocks'] if b['slot'] == 'MAINTENANCE_ROOT']  # C019 always; SKILL_ROOT takes 8.0 (D5)
    canonical('templates/instructions/AGENTS.md', 'AGENTS.md', root_values, root_blocks)

    if DRY:
        print('\n'.join(WRITTEN))
        print('DRY RUN:', len(WRITTEN), 'files;', len(COPIES), 'canonical copies;', len(ADAPTERS), 'adapters')
        return
    recipe = dict(version=1, canonical_outputs=[c['output'] for c in COPIES],
                  copies=[{k: v for k, v in c.items() if k != 'environments'} for c in COPIES])
    (MAINT / 'preservation-plan.json').write_text(json.dumps(recipe, ensure_ascii=False, indent=2) + '\n')
    (MAINT / 'native-adapters.json').write_text(json.dumps(ADAPTERS, ensure_ascii=False, indent=2) + '\n')
    (MAINT / 'render-8.0-copies.json').write_text(json.dumps([dict(output=c['output'], template=c['template'], environments=c['environments']) for c in COPIES], indent=2) + '\n')
    print('Rendered', len(WRITTEN), 'files;', len(COPIES), 'canonical copies;', len(ADAPTERS), 'native adapters.')


if __name__ == '__main__':
    main()
