#!/usr/bin/env python3
"""Render the approved Bootstrap installation. Refuses to overwrite an existing installation.

Future maintenance must use the saved answers and a reviewed three-way comparison.
This first-install renderer is retained as reproducibility evidence, not an updater.
"""
import hashlib
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SKILL = ROOT / '.agents/skills/bootstrap-agentic-system'
DOCS = ROOT / 'docs/agents'
DATE = '2026-09-19'
ROLES = ['planner', 'implementor', 'direct-implementor', 'integration-tester', 'knowledge-builder', 'ask', 'vision']
SKILLS = ['author-repo-skill', 'plan-bug-from-id', 'plan-user-story-from-id', 'user-story-analysis', 'integration-test-knowledge-checklist']
ENVS = ['codex', 'copilot']
ITEMS = []
COPIES = []
ADAPTERS = []
BEFORE = {}
SLOTS = {}
NEON_READ = ['list_docs_resources', 'get_doc_resource', 'get_database_tables', 'describe_table_schema', 'list_branches', 'compare_database_schema']
NEON_WRITE = ['prepare_database_migration', 'run_sql', 'complete_database_migration']
NEXT_READ = ['init', 'nextjs_docs', 'nextjs_index', 'nextjs_call']
MCP_ROLES = ['ask', 'planner', 'implementor', 'direct-implementor', 'knowledge-builder']
IMPL = ['implementor', 'direct-implementor']
TRACKER_ROLES = ['planner'] + IMPL

def sha(s):
    return hashlib.sha256(s.encode() if isinstance(s, str) else s).hexdigest()

def norm(s):
    return s.replace('\r\n', '\n').replace('\r', '\n')

def dump(x):
    return json.dumps(x, ensure_ascii=False, indent=2) + '\n'

def write(path, text, kind='shared-resource', template='authored', environments=None, **extra):
    p = ROOT / path
    # A stopped first-install may be resumed only when an earlier deterministic
    # write produced these exact bytes. Any different pre-existing file remains
    # a hard stop so this renderer never absorbs user edits.
    if p.exists() and path not in BEFORE:
        if p.read_text() != text:
            raise RuntimeError('Refusing unplanned overwrite: ' + path)
    else:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text)
    ITEMS.append(dict(path=path, kind=kind, environments=environments or ENVS,
                      template=template, source_sha256=sha(norm((SKILL/template).read_text())) if (SKILL/template).is_file() else 'not-applicable',
                      baseline='docs/agents/.baseline/' + path, **extra))

def snapshot(rel):
    out = 'docs/agents/sources/' + rel
    if any(i['path'] == out for i in ITEMS):
        return
    write(out, norm((SKILL/rel).read_text()), 'provenance', rel)

def fill(source, values, blocks):
    # Equivalent to the shipped dependency-free JS verifier: named, occurrence-bound slots only.
    out, region, counts, used = [], None, {}, set()
    for line in norm(source).split('\n'):
        start = re.fullmatch(r'<!-- CANONICAL-TEMPLATE-SLOT: ([A-Z0-9_]+) START replaces=(?:none|sha256:[a-f0-9]+ lines=\d+) -->', line)
        end = re.fullmatch(r'<!-- CANONICAL-TEMPLATE-SLOT: ([A-Z0-9_]+) END -->', line)
        if start:
            if region: raise ValueError('nested slot')
            name = start[1]
            occurrence = counts.get(name, 0)
            counts[name] = occurrence + 1
            region = [name, occurrence, []]
        elif end:
            if not region or region[0] != end[1]: raise ValueError('bad slot end')
            key = (region[0], region[1])
            matches = [(i,b) for i,b in enumerate(blocks) if (b['slot'],b['occurrence']) == key]
            if len(matches) > 1: raise ValueError('duplicate block')
            if matches:
                i,b = matches[0]; used.add(i)
                if b['value']: out.append(norm(b['value']))
            else: out.extend(region[2])
            region = None
        else:
            if 'CANONICAL-TEMPLATE-SLOT' in line: raise ValueError('bad slot marker')
            (region[2] if region else out).append(line)
    if region or len(used) != len(blocks): raise ValueError('unmatched slot')
    s = '\n'.join(out)
    if '"{{APPROVED_MCP_TOOLS}}"' in s:
        tools = ', '.join(json.dumps(t) for t in values['APPROVED_MCP_TOOLS'])
        if values.get('PLATFORM_TOOLS') == '': s = s.replace('{{PLATFORM_TOOLS}}, "{{APPROVED_MCP_TOOLS}}"', tools)
        s = s.replace(', "{{APPROVED_MCP_TOOLS}}"', ', ' + tools if tools else '')
        s = s.replace('"{{APPROVED_MCP_TOOLS}}"', tools)
    s = re.sub(r'\{\{([A-Z0-9_]+)\}\}', lambda m: values[m[1]], s)
    if '{{' in s and re.search(r'\{\{[A-Z0-9_]+\}\}', s): raise ValueError('unfilled slot')
    return s

def canonical(template, path, all_values, blocks=None, environments=None):
    snapshot(template)
    source = norm((SKILL/template).read_text())
    declared = set(re.findall(r'\{\{([A-Z0-9_]+)\}\}', source))
    values = {key: all_values[key] for key in declared}
    blocks = blocks or []
    record = dict(template=template, sha256=sha(source), output=path, values=values, blocks=blocks)
    COPIES.append(record)
    for k,v in values.items(): SLOTS.setdefault(k, {})[path] = v
    for b in blocks: SLOTS.setdefault(b['slot'], {})[path + '#block-' + str(b['occurrence'])] = b['value']
    result = fill(source, values, blocks)
    write(path, result, 'canonical-copy', template, environments, loading='direct', marker_decision='strip all source-only markers')
    return result

def frontmatter(s):
    head, body = s[4:].split('\n---\n', 1)
    d = {}
    for line in head.splitlines():
        k,v = line.split(':',1); v = v.strip()
        if v.startswith('['):
            # Only the source's bare built-in agent identifier is non-JSON.
            v = re.sub(r'(?<=\[)agent(?=[,\]])', '"agent"',v)
        try: d[k] = json.loads(v)
        except json.JSONDecodeError: d[k] = v
    return d, body

def yaml_front(d, body):
    return '---\n' + ''.join(k + ': ' + json.dumps(v, ensure_ascii=False) + '\n' for k,v in d.items()) + '---\n' + body

def mcp_map(role):
    d = {}
    if role in TRACKER_ROLES: d['github'] = ['issue_read']
    if role in MCP_ROLES:
        d['neon'] = NEON_READ + (NEON_WRITE if role in IMPL else [])
        d['next-devtools'] = NEXT_READ + (['browser_eval'] if role in IMPL else [])
    return d

def qualified(env, server, tool):
    if env == 'codex': return 'mcp__' + server.replace('-', '_') + '__' + tool
    return {'github':'github', 'neon':'neondatabase/mcp-server-neon', 'next-devtools':'io.github.vercel/next-devtools-mcp'}[server] + '/' + tool

def native_tools(env, role):
    if env == 'codex':
        t = ['functions.exec']
        if role in ['planner','direct-implementor','integration-tester','knowledge-builder']:
            t += ['collaboration.spawn_agent','collaboration.send_message','collaboration.wait_agent']
        return t
    read = ['read/readFile','search/fileSearch','search/listDirectory','search/textSearch','search/usages']
    edit = ['edit/createDirectory','edit/createFile','edit/editFiles','edit/rename']
    run = ['execute/runInTerminal','execute/getTerminalOutput','read/problems']
    if role == 'vision': return ['read/readFile','edit/createFile','edit/editFiles']
    t = ['vscode/askQuestions'] + read
    if role != 'ask': t += edit
    if role in IMPL + ['integration-tester']: t += run
    if role in IMPL:
        t += ['vscode/installExtension','vscode/newWorkspace','vscode/runCommand','read/terminalSelection','read/terminalLastCommand']
    if role != 'ask': t += ['agent']
    if role in ['ask','planner','knowledge-builder']: t += ['web/fetch']
    return t

def vision_invocation(env):
    invocation = ('the active Codex native custom-agent delegation tool for agent_type="demo-vision", but only after client discovery actually lists that registered role; the pre-install host does not expose that role and must reload or otherwise verify native registration first. If it is absent, stop this visual operation and report the missing binding; do not attempt a fictitious spawn or substitute a model'
                  if env == 'codex' else 'agent/runSubagent with agentName="demo-vision"')
    return ('Check the active model\'s image-input capability using runtime model metadata, not its name. If image input is supported, perform this image-evidence task inline using the complete demo-vision extraction contract and the active model. If the active model lacks image input, invoke ' + invocation +
            ', passing the current session ID and the image; the registered delegate uses Luna. If capability information is unavailable, resolve it before making image-dependent claims. Require one SlimUI artifact in sessions/<planning-session-id>/artifacts/visual/ per image. After the inline task or delegate finishes, the parent writes a JSON reference file beside that SlimUI file with session_id, image, artifact_path, and format="SlimUI v1.0". Return the JSON reference filename to the steps below; read that JSON and its referenced SlimUI. The Vision delegate itself emits SlimUI only. Use the following task context:')

COMMON = {
    'AGENT_PREFIX':'demo-', 'REPO_NAME':'serviceDeskDemo', 'OUTPUT_LANGUAGE':'English',
    'SESSION_ROOT':'sessions', 'KNOWLEDGE_INDEX_PATH':'docs/agents/knowledge/README.md',
    'CONTEXT_GLOSSARY_PATH':'docs/agents/context-glossary.md',
    'PLAN_SCHEMA_PATH':'docs/agents/plan-schema.md', 'TEST_PLAN_SCHEMA_PATH':'docs/agents/test-plan-schema.md',
    'ARTIFACT_GATES_PATH':'docs/agents/artifact-gates.md', 'MANIFEST_PATH':'docs/agents/agentic-system-manifest.md',
    'KNOWLEDGE_SOURCE':'docs/agents/knowledge/README.md', 'REPO_KNOWLEDGE_PATHS':'docs/agents/knowledge/',
    'KNOWLEDGE_FILE_GLOB':'docs/agents/knowledge/**/*.md', 'SKILL_ROOT':'.agents/skills',
    'INSTRUCTION_ROOT':'.github/instructions', 'AGENT_ROOT':'docs/agents/canonical/<environment>/agents (codex or copilot)',
    'WORK_ITEM_ID_FORMAT':'#[1-9][0-9]* in violabg/serviceDeskDemo; strip # only for the numeric API parameter and default session suffix',
    'TRACKER_ADAPTER':'GitHub Issues via docs/agents/github-issues-adapter.md; invoked only by demo-planner for these planning skills',
    'LOCAL_MARKDOWN_TRACKER_CONTRACT':'NOT APPLICABLE: GitHub Issues only; stop if GitHub retrieval is unavailable; no local or free-form fallback is approved',
    'WORK_ITEM_RETRIEVAL':'Codex: mcp__github__issue_read; Copilot: github/issue_read; only get, get_comments and get_labels for exact issue IDs, following docs/agents/github-issues-adapter.md',
    'WORK_ITEM_GATHERING':'When invoked as demo-planner, delegate this bounded gathering task to the built-in default agent using the current client\'s approved delegation tool from docs/agents/integration-bindings.md. Pass the current issue, approved GitHub read tool, current session ID and this exact evidence task. On Copilot, use agent/runSubagent with agentName="agent"; on the Codex execution host, use collaboration.spawn_agent with agent_type="default". Delegate questions return to the parent. If delegation or the approved issue-read tool is unavailable, stop and report the missing binding; do not broaden access.',
    'VALIDATION_COMMANDS':'diagnostics, then pnpm typecheck and scoped lint, then focused pnpm test -- <affected-files>; run pnpm lint, pnpm test and pnpm build only when the approved change requires broader validation; agent-system-only changes use python3 docs/agents/scripts/verify-agentic-system.py',
    'INTEGRATION_TEST_SCOPE':'Vitest tests of connected repo-owned modules, actions, routes and feature components with real internal wiring and stubbed Neon/auth/third-party boundaries; exclude live vendor systems, unit and e2e tests, and direct components/ui/** tests unless the user overrides that exclusion',
    'VISUAL_ARTIFACT_STORAGE':'sessions/<planning-session-id>/artifacts/visual/',
    'VISUAL_ARTIFACT_FORMAT':'SlimUI v1.0 in .slimui files; the parent separately writes a .json reference containing session_id, image, artifact_path and format',
    'VISION_AGENT_NAME':'demo-vision',
    'REPOSITORY_SEARCH_TOOL':'the current client\'s bounded native repository search listed in docs/agents/integration-bindings.md',
}

KNOWLEDGE_BLOCK = '''## Repository Knowledge Binding
- Before loading repository knowledge, read `docs/agents/knowledge/README.md`, the existing index derived from the Bootstrap knowledge-index schema (snapshot: `docs/agents/sources/templates/knowledge-index-schema.md`).
- Select the smallest set by `When to read`; never bulk-load knowledge. Record selected and skipped related entries and the reasons in the current planning artifacts.
- Resolve code/domain vocabulary through `docs/agents/context-glossary.md`.
- Before using integrations or resolving capability tokens, read the current role's entries in `docs/agents/integration-bindings.md`. Source references to `registry/capabilities.yaml` mean the retained registry at `docs/agents/sources/registry/capabilities.yaml`.
'''
PLANNER_SCHEMA = '''- Implementation plans must follow `docs/agents/plan-schema.md`, copied from the shipped plan schema. Schema compliance overrides Markdown cleanup: preserve the filesystem tree, file-detail anchors and backlinks, approval metadata, operations, coverage scenarios, validation and risks. Do not duplicate the clarification-question format carried later in this Planner contract.
'''

def main():
    if (DOCS/'agentic-system-manifest.md').exists():
        raise SystemExit('Existing installation: use maintain-agentic-system, not this first-install renderer.')
    for p in ['README.md','docs/agents/knowledge/testing-flow-checklist.md','docs/agents/knowledge/dashboard-navigation-boundaries.md']:
        BEFORE[p] = (ROOT/p).read_text()
        write('docs/agents/pre-bootstrap/' + p, BEFORE[p], 'provenance')
    for rel in ['registry/capabilities.yaml','registry/placeholders.yaml','templates/knowledge-index-schema.md',
                'templates/agent-role-contracts.md','templates/agentic-system-manifest.md','templates/agentic-system-answers.md',
                'templates/bootstrap-file-plan.md','contracts/platform-compatibility.md']:
        snapshot(rel)
    for env in ENVS:
        for role in ROLES:
            values = dict(COMMON)
            values.update(PLATFORM_TOOLS=', '.join(json.dumps(t) for t in native_tools(env,role)),
                APPROVED_MCP_TOOLS=[qualified(env,s,t) for s,ts in mcp_map(role).items() for t in ts],
                QUESTION_TOOL=('vscode/askQuestions in a foreground role; delegates return questions to the parent, which asks and reinvokes with the answers' if env == 'copilot' else 'the foreground user-facing chat channel; delegates return questions to the parent, which asks the user and returns the answers through the active native delegate messaging or reinvocation mechanism'),
                KNOWLEDGE_DISCOVERY_DELEGATION=('Use bounded agent/runSubagent calls to the built-in agent, up to 10 evidence tasks within the runtime concurrency limit. Run as the foreground Knowledge Builder; delegate questions return to it. Do not rely on nested delegation being enabled.' if env == 'copilot' else 'Use collaboration.spawn_agent with agent_type="default" in this host, up to 10 evidence tasks within the runtime concurrency limit; receive results through collaboration.wait_agent. Other Codex contexts must verify their native spawn/wait bindings before delegating.'),
                VISION_MODEL=('gpt-5.6-luna' if env == 'codex' else 'GPT-5.6 Luna'),
                VISION_INVOCATION=vision_invocation(env))
            source=(SKILL/f'templates/agents/{role}.agent.md').read_text()
            blocks=[]
            if 'CANONICAL-TEMPLATE-SLOT: KNOWLEDGE_SOURCE START' in source:
                blocks.append(dict(slot='KNOWLEDGE_SOURCE',occurrence=0,value=KNOWLEDGE_BLOCK+(PLANNER_SCHEMA if role=='planner' else '')))
            path=f'docs/agents/canonical/{env}/agents/demo-{role}.agent.md'
            rendered=canonical(f'templates/agents/{role}.agent.md',path,values,blocks,[env])
            metadata,body=frontmatter(rendered)
            native=f'.github/agents/demo-{role}.agent.md' if env=='copilot' else f'.codex/agents/demo-{role}.toml'
            if env=='copilot':
                metadata['name']='demo-'+role
                if role=='vision': metadata['disable-model-invocation']=False
                text=yaml_front(metadata,body)
            else:
                text='name = '+json.dumps('demo-'+role)+'\n'
                text+='description = '+json.dumps(metadata['description'],ensure_ascii=False)+'\n'
                if role=='vision': text+='model = "gpt-5.6-luna"\n'
                text+='sandbox_mode = '+json.dumps('read-only' if role=='ask' else 'workspace-write')+'\n'
                text+='developer_instructions = '+json.dumps(body,ensure_ascii=False)+'\n'
                for server in ['github','neon','next-devtools']:
                    raw=mcp_map(role).get(server,[])
                    text+='\n[mcp_servers.'+json.dumps(server)+']\n'
                    text+='enabled = '+str(bool(raw)).lower()+'\n'
                    if raw: text+='enabled_tools = '+json.dumps(raw)+'\n'
            write(native,text,'native-adapter',f'templates/agents/{role}.agent.md',[env],canonical_copy=path,loading='lossless-embedding',
                  approved_override='Vision disable-model-invocation=false' if env=='copilot' and role=='vision' else 'none')
            ADAPTERS.append(dict(path=native,canonical_copy=path,format='toml' if env=='codex' else 'markdown',body_sha256=sha(body),role=role,environment=env))
    for name in SKILLS:
        blocks=[]
        if name=='integration-test-knowledge-checklist':
            blocks=[dict(slot='TEST_STACK_CONVENTIONS',occurrence=0,value='''```yaml
---
title: Service Desk Integration Test Knowledge
description: Vitest integration rules for connected Service Desk modules and actions.
keywords: [integration, vitest, service-desk, server-actions, permissions]
authority: PerContext
intent: When creating or debugging integration tests for repo-owned modules with third-party boundaries stubbed.
---
```
Use Vitest, Testing Library for feature components, and Vitest mocks. The default Vitest environment is node with test/setup.ts; choose a DOM environment only for component tests. Preserve existing test naming conventions discovered in the touched feature.''')]
        path=f'docs/agents/canonical/shared/skills/{name}/SKILL.md'
        rendered=canonical(f'templates/skills/{name}/SKILL.md',path,COMMON,blocks)
        meta,body=frontmatter(rendered)
        meta['name']='demo-'+name
        native=f'.agents/skills/demo-{name}/SKILL.md'
        write(native,yaml_front(meta,body),'native-adapter',f'templates/skills/{name}/SKILL.md',canonical_copy=path,loading='lossless-embedding')
        ADAPTERS.append(dict(path=native,canonical_copy=path,format='markdown',body_sha256=sha(body),environment='shared',role='skill'))
    for name in ['knowledge-guard','planning-sessions']:
        canonical(f'templates/instructions/{name}.instructions.md',f'.github/instructions/{name}.instructions.md',COMMON)
    roster=[]
    purposes={'planner':'GitHub-issue planning and clarification','implementor':'approved-plan implementation','direct-implementor':'explicit direct implementation without a plan document; no test creation','integration-tester':'integration-test planning and execution','knowledge-builder':'evidence-backed repository knowledge','ask':'read-only Q&A','vision':'Luna image extraction, delegated only when the caller lacks vision'}
    for role in ROLES:
        roster.append(f'- `demo-{role}`: {purposes[role]}. Load its complete contract under `docs/agents/canonical/<environment>/agents/` and its role bindings in `docs/agents/integration-bindings.md`.')
    root_values=dict(COMMON,AGENT_ROSTER='\n'.join(roster))
    canonical('templates/instructions/AGENTS.md','AGENTS.md',root_values)
    for name in ['plan-schema','test-plan-schema','artifact-gates']:
        rel=f'templates/{name}.md'; snapshot(rel)
        write(f'docs/agents/{name}.md',norm((SKILL/rel).read_text()),'shared-resource',rel)
    write('docs/agents/skill-changelogs/bootstrap-agentic-system.CHANGELOG.md',norm((SKILL/'CHANGELOG.md').read_text()),'provenance','CHANGELOG.md')
    write('docs/agents/scripts/verify-canonical-copies.mjs',norm((SKILL/'scripts/verify-canonical-copies.mjs').read_text()),'provenance','scripts/verify-canonical-copies.mjs')
    resources()
    fix_existing_docs()
    recipe=dict(version=1,canonical_outputs=[x['output'] for x in COPIES],copies=COPIES)
    write('docs/agents/preservation-plan.json',dump(recipe),'provenance')
    write('docs/agents/native-adapters.json',dump(ADAPTERS),'provenance')
    finalize(recipe)
    print('Generated',len(ITEMS),'primary files;',len(COPIES),'canonical copies;',len(ADAPTERS),'native adapters.')

def resources():
    write('docs/agents/context-glossary.md', '''# Service Desk Context Glossary

Stable code/domain vocabulary; this is not the knowledge index. Verified against local sources on 2026-09-19.

| Preferred term | Meaning and boundary | Avoid confusing it with | Source |
| --- | --- | --- | --- |
| Access section | A code-owned access boundary; current sections are dashboard, users, roles and tickets | A sidebar group or an arbitrary route folder | `lib/access-control.ts` |
| Operation | One of read, write, manage | Ad hoc permission verbs | `lib/access-control.ts` |
| Base permission | A section/operation combination generated from code | A permission created by admin UI input | `lib/access-control.ts`, `docs/agents/knowledge/access-control.md` |
| Role | A collection of existing permission grants assigned to users | An access section | `lib/access-control.ts` |
| Effective permissions | The union of permission keys from a user's roles | Only the first role's permissions | `getEffectivePermissionKeys` in `lib/access-control.ts` |
| Access Management | The established navigation group for Users and Roles | Proof that an intermediate public URL exists | `docs/agents/knowledge/dashboard-navigation-boundaries.md` |
| Route group | A Next.js organizational folder such as `(admin)` that does not add a public URL segment | A routable page or a normal public path segment | `docs/agents/knowledge/dashboard-navigation-boundaries.md` |

Issue/session terminology lives in `docs/agents/github-issues-adapter.md`. Knowledge selection lives in `docs/agents/knowledge/README.md`.
''')
    write('docs/agents/github-issues-adapter.md', '''# GitHub Issues Adapter

Repository: `violabg/serviceDeskDemo`. Planning is GitHub-issue-only. The two ID-planning skills are invoked only by `demo-planner`; they never implement code.

- External input: `#[1-9][0-9]*`. Parse the digits as a positive integer for the API. Missing, invalid, ambiguous or unreadable IDs stop the workflow; do not search for a replacement.
- Exact tools: Codex `mcp__github__issue_read`; Copilot `github/issue_read`. Allowed methods: `get`, `get_comments`, `get_labels`. Pass owner `violabg`, repo `serviceDeskDemo`, the exact issue_number, and explicit pagination for all comments.
- Retrieve the issue title, body, type/labels, comments, acceptance criteria, image links and explicit dependencies. Preserve fenced code, rich text meaning and attachment URLs when normalizing to Markdown. Missing acceptance criteria are a gap, not invented requirements.
- Use an explicit bug/story type or unambiguous labels. If type is missing or conflicting, ask before choosing a type-dependent session ID.
- Read every issue directly linked by the current issue once, record its repository/ID and retrieval reason, then stop traversal. Do not recurse, search/list issues, follow arbitrary URLs, or fetch unrelated items. A cross-repository issue explicitly linked by the current issue may be retrieved only as dependency evidence through the same exact tool; it never changes the owning repository/session.
- Recommend `sessions/bug-<number>/` or `sessions/us-<number>/` only after type retrieval. Existing explicit user-approved IDs remain valid. Resume only a supplied or already active session ID; never enumerate sessions or choose a folder by similarity.
- Reject traversal, absolute paths and separators in custom session IDs. A custom prefix must be lowercase `[a-z0-9_-]` with a trailing `-`; record the approved prefix and resulting ID in `session-identity.md`.
- Keep identity, tracker/dependency evidence, decisions, memory, logs, plan and handoffs within the owning session. Do not access other sessions. Store general artifacts in its `artifacts/` directory; keep session-memory.md, session-log.md and execution-report.md as distinct state files at the session root.
- Plan approval must be recorded in the plan artifact before `demo-implementor` changes code. `demo-direct-implementor` is a separate explicit user-selected route from validated requirements and never requires a plan document; it retains session and knowledge gates.
- No local Markdown tracker, free-form Planner workflow, issue search or tracker-write tool is enabled by this adapter. Ask remains available for Q&A.
''')
    tool_rows=[]
    for role in ROLES:
        for server,ts in mcp_map(role).items():
            tool_rows.append('| demo-'+role+' | '+server+' | '+', '.join('`'+t+'`' for t in ts)+' |')
    write('docs/agents/integration-bindings.md', '''# Agent Integration Bindings

These bindings implement the approved role operations. Read only the current role's rows and the common rules required by the task. Output language: English. Never treat a configured tool as evidence that authentication or runtime access works.

## Exact MCP assignments

| Role | Server | Raw tool names |
| --- | --- | --- |
'''+'\n'.join(tool_rows)+'''

Codex qualified names use `mcp__github__<tool>`, `mcp__neon__<tool>` and `mcp__next_devtools__<tool>`. Copilot uses `github/<tool>`, `neondatabase/mcp-server-neon/<tool>` and `io.github.vercel/next-devtools-mcp/<tool>`. Raw names are used in Codex `enabled_tools`. Existing user MCP configuration supplies the transport and authentication; native agent overlays narrow each named server's tools. No credentials are copied here.

Neon raw names were confirmed against its public catalog. Qualified Neon names are configuration bindings, not verified tools in this session. Copilot qualified names likewise require the actual client tool picker/diagnostics check. If the required bound tool is missing, report the missing binding and stop that dependent operation. Continue independent work that does not need it. Do not silently switch services.

## Repository and native operations

- Codex execution-host tools: `functions.exec` invokes `tools.exec_command` for targeted reads, `rg`, file listing and approved commands, and `tools.apply_patch` for edits. `tools.view_image` reads local images. Native web access is `tools.web__run`. Native wrappers may differ in the CLI: inspect the active tool surface before use, and do not invent identifiers.
- Foreground Codex questions use plain user-facing chat. The discovery host exposed `collaboration.spawn_agent`, `collaboration.wait_agent` and messages for built-in evidence agents. Other Codex clients must inspect their active native delegation surface before use. Pass the exact current session and smallest evidence task. Delegates return blocking questions to the coordinator. A custom demo role is callable only after native discovery confirms it; the pre-install host did not expose those roles.
- Copilot reads/searches use `read/readFile`, `search/fileSearch`, `search/listDirectory`, `search/textSearch`, `search/usages`. Artifact/code writes use the role's `edit/*` tools. Implementor/Direct Implementor/Integration Tester use `execute/runInTerminal`, `execute/getTerminalOutput`, `read/problems` for approved verification. Documentation retrieval uses `web/fetch` for Ask, Planner and Knowledge Builder.
- Copilot delegation uses `agent/runSubagent` (tool set `agent`), with `agentName="agent"` for bounded general evidence tasks or `agentName="demo-vision"` for the approved visual case. Foreground questions use `vscode/askQuestions`. Delegates cannot ask directly: return questions to the coordinator, which asks and reinvokes with answers. Do not depend on nested delegation being enabled.
- Source baseline editor capabilities on implementation roles remain available only for tasks justified by approved implementation scope. Their presence is not authorization to install extensions or alter global settings.
- Source capability tokens resolve to the current-session files and schema/index paths in the canonical tables. `#capability:agent-workflow-service` is audit history, not a server requirement. `registry/capabilities.yaml` references resolve to `docs/agents/sources/registry/capabilities.yaml`.
- Filesystem tools are broad: Planner and Knowledge Builder restrictions against application edits are instruction boundaries, not a per-path tool allowlist. Codex Ask requests the native read-only sandbox. Effective client policy must still be verified; tool frontmatter alone is not proof of enforcement.
- Explicitly select the named role. Planner, Implementor, Direct Implementor, Tester, Knowledge Builder and Ask are user-invoked workflows; do not automatically delegate a complete role when the user has not selected it. Built-in evidence scouts are allowed where the canonical contract delegates them. Codex lacks the Copilot user-only metadata equivalent; this restriction is instruction-level there.

## Neon operation boundaries

- Ask, Planner and Knowledge Builder have only the six catalog/schema/documentation tools. They do not run arbitrary SQL or mutate cloud resources.
- Use the linked project in `.neon`; that file currently provides project/org context, not a branch selection. Resolve the task's exact branch and database before schema calls. Do not assume the default branch is a disposable development branch.
- Discover documentation with `list_docs_resources` before `get_doc_resource`. Bound table/schema reads to the evidence question.
- Implementor and Direct Implementor may use their three additional tools only for the current implementation's validated, authorized database work. Preserve the repository's Prisma schema/migration source of truth; do not create unexplained schema drift through ad hoc SQL.
- `prepare_database_migration` creates a temporary branch. Validate using the returned branch ID, never by omitting the branch ID or falling back to production. Before calling `complete_database_migration`, satisfy its explicit user-approval requirement for the concrete migration. Pass `apply_changes` explicitly: `true` applies, `false` discards. Omission is not a safe default. Never infer destructive approval from generic implementation permission.
- Schema/SQL results may contain sensitive data: store only necessary, sanitized evidence in artifacts. Do not store connection strings or secrets.
- Existing Neon skills provide relevant task guidance, but do not install/update skills, run checkout, pull environment files or create resources merely to answer a question or perform Bootstrap.

## Next.js operation boundaries

- The repository config pins `next-devtools-mcp@0.3.6`. Call `init` before its documentation workflow; use `nextjs_docs` for the applicable App Router contract.
- Use `nextjs_index` to discover the intended development server and its available runtime tool names. Do not guess a port or use another project's server.
- Ask, Planner and Knowledge Builder may call `nextjs_call` only for operations documented by that discovered server as read-only diagnostics, routes, errors, logs or metadata. Inspect the operation before calling it; the generic dispatcher is not intrinsically read-only.
- Implementor and Direct Implementor additionally have `browser_eval` for validation within authorized scope. Browser actions that submit forms or alter data require the same implementation authorization and scoped test environment as other mutations.
- Upgrade and cache-component migration MCP tools are intentionally omitted. Tool availability does not expand the approved feature scope.

## Conditional visual processing

- Inspect the active model's actual image-input capability. If supported, Planner or Direct Implementor performs the image extraction inline using the complete demo-vision body. If unsupported, spawn `demo-vision`, whose registered model is Luna. Unknown capability must be resolved; do not guess from a model name.
- Delegated model: Codex `gpt-5.6-luna`; Copilot `GPT-5.6 Luna`. No substitute model is approved. If Luna is unavailable, stop the image-dependent operation and report it.
- Every image produces SlimUI under the current session's `artifacts/visual/`. The parent writes a JSON reference with session_id, image, artifact_path and format, then reads that reference and the SlimUI. The Vision agent preserves its SlimUI-only output contract.
- The user explicitly overrode the source Vision `disable-model-invocation: true`. Its Copilot adapter sets false; the pristine canonical copy retains true. This is recorded as `overrides-canonical`, not an unmodified metadata translation.

## Validation scope

For product work, check diagnostics and run scoped lint/typecheck before focused tests. Preserve the existing exclusion for direct `components/ui/**` tests unless explicitly overridden. Integration Tester covers connected repo-owned wiring with external services stubbed; Direct Implementor never creates unit or integration tests. Broader lint, tests and builds run only when required by the approved change. This Bootstrap installs only agent-system files and does not execute database or product changes.
''')
    write('.github/instructions/agent-integrations.instructions.md', '''---
applyTo: "**"
---

# Service Desk Agent Integration Routing

Use English. When a request selects a `demo-` role, load its complete environment-specific contract and current-role bindings from `docs/agents/integration-bindings.md` before acting. Preserve the role's authority boundaries.

Planner uses GitHub Issues only via `docs/agents/github-issues-adapter.md`. Direct Implementor is an explicitly selected separate route and does not require a plan document. Never reinterpret a planning approval as product implementation approval.

Before image-dependent work, inspect the active model's image capability. Planner and Direct Implementor handle images inline when supported; otherwise delegate to `demo-vision` using Luna. The Vision adapter's invocation override is user-approved and recorded in the manifest.

For this repository's generated skills, use the `demo-` names under `.agents/skills/demo-*/SKILL.md`; similarly named files under Bootstrap's `templates/` are source mirrors, not configured runtime skills. Planning skills belong to `demo-planner`.

The shared root router loads modular instructions only for matching request paths. Copilot applies declared `applyTo` globs through its native loader. Codex uses the root router's explicit matching-and-read procedure; do not claim Copilot-style automatic `applyTo` enforcement in Codex.
''')

def fix_existing_docs():
    text=BEFORE['README.md']
    text=text.replace('Intake a GitHub issue, product request, or sample user story.', 'Intake a GitHub issue from `violabg/serviceDeskDemo`.')
    old='Generated workflow artifacts live in local, gitignored `sessions/<session-id>/` packages. GitHub-driven workflows use the issue number as the session ID. Offline workflows ask the user to provide or confirm the session ID, then write `session-brief.md`, `requirements-analysis.md`, `spec.md`, `task-breakdown.md`, `implementation-plan.md`, `test-plan.md`, and later handoff artifacts into that folder.'
    new='Generated workflow artifacts live in local, gitignored `sessions/<planning-session-id>/` packages. Planning starts from a GitHub issue such as `#12`. After retrieving its type, the default session is `bug-12` or `us-12`; the issue ID and session ID are distinct. Resume only an explicitly supplied or active session, including previously approved custom IDs. The Planner writes the artifacts required by [the artifact contract](docs/agents/artifact-gates.md) and [plan schema](docs/agents/plan-schema.md). Integration Tester uses [the YAML test-plan schema](docs/agents/test-plan-schema.md).'
    if old not in text: raise ValueError('README session paragraph changed; review instead of overwriting')
    text=text.replace(old,new)
    start=text.index('## Agent Flow')
    text=text[:start]+'''## Agent Flow

Use `demo-planner` for GitHub-issue planning, then `demo-implementor` for approved-plan execution. Select `demo-direct-implementor` explicitly for direct implementation from validated requirements without a plan document; it never creates tests.

| Agent | Purpose |
| --- | --- |
| demo-planner | Issue intake, clarification, knowledge selection and implementation planning |
| demo-implementor | Approved-plan execution and authorized unit-test work |
| demo-direct-implementor | Direct implementation with knowledge/session/validation gates; no test creation |
| demo-integration-tester | Integration-test planning and execution |
| demo-knowledge-builder | Evidence-backed knowledge and index maintenance |
| demo-ask | Read-only codebase and programming Q&A |
| demo-vision | Luna image extraction when the calling model lacks vision |

Codex registrations live in `.codex/agents/`; Copilot registrations live in `.github/agents/`. Their full preserved contracts and maintenance evidence live in `docs/agents/`.

Generated skills use explicit `demo-` invocation names: `demo-author-repo-skill`, `demo-plan-bug-from-id`, `demo-plan-user-story-from-id`, `demo-user-story-analysis`, and `demo-integration-test-knowledge-checklist`. The two issue-planning skills run within `demo-planner`. The gap-detector skill is deferred.

Read [integration bindings](docs/agents/integration-bindings.md) for role-specific GitHub, Neon and Next.js access. Read [compatibility evidence](docs/agents/compatibility.md) for verified and outstanding client checks. Reload the client after installation and confirm role and skill discovery before relying on an unverified operation.
'''
    write('README.md',text)
    p='docs/agents/knowledge/testing-flow-checklist.md'
    text=BEFORE[p]
    text=text.replace('- `.github/agents/DemoPlanner.agent.md`\n- `.github/agents/DemoImplementor.agent.md`\n- `.github/agents/DemoTester.agent.md`\n- `.agents/skills/test-strategy/SKILL.md`', '- Historical Demo agent and test-strategy references from the 2026-07-22 verification no longer exist. Current role bindings: `docs/agents/integration-bindings.md`; agents: `.github/agents/demo-planner.agent.md`, `.github/agents/demo-implementor.agent.md`, `.github/agents/demo-integration-tester.agent.md`.\n- Bootstrap repaired these references on 2026-09-19; this is not a new product-behavior verification.')
    text=text.replace('`test-plan.md` should', 'The test plan (Integration Tester uses the YAML schema at `docs/agents/test-plan-schema.md`) should')
    text=text.replace('- If a focused failure proves a narrow in-scope implementation defect, repair that slice and rerun the same focused command first.', '- If a focused failure proves a narrow in-scope implementation defect, Implementor repairs that slice within its authorized scope and reruns the same focused command. Integration Tester reports production defects to Implementor and does not edit production code.')
    write(p,text)
    p='docs/agents/knowledge/dashboard-navigation-boundaries.md'
    text=BEFORE[p].replace('- CONTEXT.md','- Historical `CONTEXT.md` is absent; current vocabulary is in `docs/agents/context-glossary.md` (reference repaired 2026-09-19; product behavior was not reverified).')
    write(p,text)

def capability_register():
    result={}
    for env in ENVS:
        result[env]={}
        for role in ROLES:
            source=(SKILL/f'templates/agents/{role}.agent.md').read_text()
            tokens=sorted(set(re.findall(r'#capability:([a-z-]+)',source)))
            entries={}
            for token in tokens:
                if 'work-item' in token:
                    invoke=qualified(env,'github','issue_read')+' (get/get_comments/get_labels for exact issue IDs)'; cap='work-item-retrieval'; binding='integration'
                elif token=='visual-evidence':
                    invoke='native image read if supported; otherwise demo-vision with Luna; SlimUI plus parent JSON reference';cap='visual-evidence';binding='native-tool'
                elif token=='repository-search':
                    invoke='functions.exec / tools.exec_command: rg and targeted reads' if env=='codex' else 'search/fileSearch, search/listDirectory, search/textSearch, search/usages';cap='repository-search';binding='native-tool'
                elif token=='agent-workflow-service':
                    invoke='No broad service grant; resolve concrete token operations only';cap='audit-only';binding='local-contract'
                else:
                    table=source[source.index('## Capability Substitutions'):source.index('## Role Tooling Intent')]
                    line=next((x for x in table.splitlines() if '`#capability:'+token+'`' in x),'')
                    invoke=line.split('|',2)[-1].rstrip('| ').strip()
                    for k,v in COMMON.items(): invoke=invoke.replace('{{'+k+'}}',v)
                    cap='knowledge-retrieval' if 'knowledge' in token else 'agent-session-persistence';binding='local-contract'
                entries[token]=dict(capability=cap,binding=binding,invocation=invoke,
                    inputs_outputs='Current explicit session/issue and task-selected evidence; outputs defined in canonical role table.',
                    prerequisites='Correct role, complete contract, native tool availability, current-session path and any MCP authentication; no secrets in evidence.',
                    status='unverified',evidence='Declared operation mapping; isolated file-contract checks in validation report. Actual generated-role execution has not been verified.')
            for operation in ['file-read','artifact-edit','terminal-execution','question-routing','delegation','web-documentation']:
                applicable=not (operation=='artifact-edit' and role=='ask') and not (operation=='terminal-execution' and role not in IMPL+['integration-tester']) and not (operation=='delegation' and role not in ['planner','direct-implementor','integration-tester','knowledge-builder']) and not (operation=='web-documentation' and role not in ['planner','knowledge-builder','ask'])
                if applicable: entries[operation]=dict(capability=operation,binding='native-tool',invocation=native_tools(env,role),inputs_outputs='Operation-specific inputs and outputs per integration-bindings.md',prerequisites='Active client tool surface and role permissions',status='unverified',evidence='Documented or host-exposed tools; native generated-role execution pending.')
            for server,tools in mcp_map(role).items():
                for tool in tools:
                    entries[server+'/'+tool]=dict(capability=server+'-integration',binding='integration',invocation=qualified(env,server,tool),inputs_outputs='Explicit project/branch/database or exact issue; sanitized task evidence; operation-specific catalog schema',prerequisites='Configured transport, authenticated account, required role grant; implementation authorization for mutations',status='unverified',evidence='Exact raw tool catalog and configuration observed 2026-09-18; runtime access not verified in this installation session.')
            result[env][role]=entries
    return result

def finalize(recipe):
    # The generator and verifier are themselves primary provenance files with baseline copies.
    for name in ['generate-agentic-system.py','verify-agentic-system.py']:
        path='docs/agents/scripts/'+name
        if (ROOT/path).exists(): ITEMS.append(dict(path=path,kind='provenance',environments=ENVS,template='authored',source_sha256='not-applicable',baseline='docs/agents/.baseline/'+path))
    compatibility='''# Environment Compatibility Evidence

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
'''
    write('docs/agents/compatibility.md',compatibility,'provenance')
    decisions=[
        dict(id='environments',value=ENVS,source='user',evidence='User: uso codex and copilot'),
        dict(id='tracker',value='GitHub Issues only',source='user',evidence='User: Solo GitHub Issues'),
        dict(id='defaults',value={k:COMMON[k] for k in ['AGENT_PREFIX','OUTPUT_LANGUAGE','SESSION_ROOT','KNOWLEDGE_INDEX_PATH','CONTEXT_GLOSSARY_PATH','PLAN_SCHEMA_PATH','TEST_PLAN_SCHEMA_PATH']},source='recommend-accepted',evidence='User accepted naming and storage defaults'),
        dict(id='skills',value=SKILLS,source='recommend-accepted',evidence='Recommended five skills; defer gap detector'),
        dict(id='mcp',value={r:mcp_map(r) for r in ROLES},source='user',evidence='User added Neon/Next to Ask, Planner, Implementor, then Knowledge Builder; Direct Implementor added with same implementation grants in approved roster'),
        dict(id='vision',value={'codex':'gpt-5.6-luna','copilot':'GPT-5.6 Luna','conditional':'inline if image-capable; otherwise spawn Vision'},source='user',evidence='User: use vision with luna; planner can spin a vision agent as subagent if current model lack vision capabilities'),
        dict(id='approval',value={'approved':True,'owner':'user','batches':'combined installation including seventh agent and later MCP additions'},source='user',evidence='User final message: approved; after full file plan and amended roster')]
    write('docs/agents/decision-register.json',dump(decisions),'provenance')
    plan='''# Approved Bootstrap File Plan

- Approved: true
- Approved By: repository user
- Approved At: 2026-09-19 (date only; exact message timestamp unavailable)
- Source Message: "approved", following the master file plan, Knowledge Builder MCP addition and Direct Implementor addition.
- Batch choice: combined installation; core, Vision, knowledge-reference reconciliation, five skills, maintenance baseline, audit. No product implementation is approved by this file.
- Bootstrap version: 5.0.0. Selected environments: Codex and Copilot. Prefix: demo-. Language: English.

## Scope and ownership

Shared root, schemas, glossary, knowledge index, skills and session contract have one source. Role contracts have environment-specific complete copies because tool names and invocation bindings differ. Native adapters embed every body byte in order. The source templates, hashes and substitutions are in preservation-plan.json and sources/. Marker stripping is recorded for all canonical copies.

The five native skills use demo-prefixed names to avoid collision with source templates exposed by the execution host. Their canonical bodies are preserved. The Vision native Copilot flag is the explicit user-authorized exception: false instead of the source true. Planner/Direct Implementor's declared invocation slot implements conditional delegation and the parent JSON reference to SlimUI.

Keep the existing nine-entry knowledge index unchanged. Add a code/domain glossary. Reconcile README session/agent names and two knowledge files' stale references. Keep test-exclusion rules; clarify that Integration Tester reports production defects to Implementor rather than repairing production itself. Pre-bootstrap copies of those three files support exact rollback.

## Tool and session decisions

See decision-register.json and integration-bindings.md for exact roles, native tools, MCP identifiers, user approval evidence and invocation procedures. Planning uses GitHub IDs #<positive-number>, type-aware bug-/us- session IDs, direct resume and bounded directly-linked issue retrieval. No local tracker fallback. Native question routing and local session persistence implement approved substitutions.

## Validation and rollback

Run the independent Python verifier, and the shipped Node verifier when its runtime is available. Check canonical coverage and exact preservation, frontmatter string types, TOML scalar/array syntax and complete body decoding, schemas, baseline coverage, paths, roster and tool assignments. Use isolated fixture contracts outside sessions for file operations. Actual client/role behavior remains unverified where unavailable. Product lint/typecheck/test/build are skipped: no product code or runtime config changed.

Rollback only this inventory's NEW files and restore its three MODIFIED documents from pre-bootstrap/. Never delete preexisting sessions, skills, config or product files. Baseline copies themselves are backup artifacts and are not recursively baselined.

## File inventory

'''
    plan+='| Operation | Path | Kind | Consumers |\n| --- | --- | --- | --- |\n'
    for i in ITEMS:
        plan+='| '+('MODIFIED' if i['path'] in BEFORE else 'NEW')+' | `'+i['path']+'` | '+i['kind']+' | '+', '.join(i['environments'])+' |\n'
    plan+='\nThe manifest, answers, this approved file plan, validation report and audit report complete the provenance inventory. Every primary file has a byte-for-byte baseline; backup copies are not recursively inventoried.\n'
    write('docs/agents/bootstrap-file-plan.md',plan,'provenance')
    manifest='''# Agentic System Manifest

## Source Package

- Package: agentic-system-kit
- Installed Bootstrap Skill Path: `.agents/skills/bootstrap-agentic-system/SKILL.md`
- Installed Bootstrap Skill Changelog Path: `.agents/skills/bootstrap-agentic-system/CHANGELOG.md`
- Installed Maintain Skill Path: `.agents/skills/maintain-agentic-system/SKILL.md`
- Installed Maintain Skill Changelog Path: `.agents/skills/maintain-agentic-system/CHANGELOG.md`
- Package Changelog Path For Context: none

## Installed Contract Versions

- Bootstrap Skill Version Used: 5.0.0
- Bootstrap Contract Applied Through: 5.0.0 with the explicit Vision native-metadata exception below
- Bootstrap Snapshot Source Status: copied from installed skill changelog
- Maintain Skill Version Available: 3.0.0; not applied
- Last Maintenance Date: none

## Generated System Paths

- Root Instructions: `AGENTS.md`
- Native Agents: `.codex/agents/`, `.github/agents/`
- Canonical Agents: `docs/agents/canonical/{codex,copilot}/agents/`
- Skills: `.agents/skills/demo-*/SKILL.md`; canonical skills: `docs/agents/canonical/shared/skills/`
- Instructions: `.github/instructions/`
- Context Glossary: `docs/agents/context-glossary.md`
- Knowledge Index: `docs/agents/knowledge/README.md` (preexisting, preserved)
- Plan Schema: `docs/agents/plan-schema.md`
- Test Plan Schema: `docs/agents/test-plan-schema.md`
- Artifact Gates: `docs/agents/artifact-gates.md`
- Work Item Adapter: `docs/agents/github-issues-adapter.md`
- Session Root: `sessions/`; explicit current ID only
- Session Identity: `sessions/<id>/session-identity.md`
- Session Memory: `sessions/<id>/session-memory.md`
- Session Log: `sessions/<id>/session-log.md`
- Execution Report: `sessions/<id>/execution-report.md`
- Bootstrap Changelog Snapshot: `docs/agents/skill-changelogs/bootstrap-agentic-system.CHANGELOG.md`
- Answers File: `docs/agents/agentic-system.answers.yaml`
- Baseline Directory: `docs/agents/.baseline/`
- Approved File Plan: `docs/agents/bootstrap-file-plan.md`
- Decisions: `docs/agents/decision-register.json`

## Environment Compatibility

- Execution Host: Codex in VS Code Insiders; SDK path 0.153.0
- Selected Environments and role/operation maps: `docs/agents/agentic-system.answers.yaml`
- Compatibility Evidence: `docs/agents/compatibility.md`
- Canonical Source Snapshots: `docs/agents/sources/` (outside skill/agent discovery roots)
- Preservation Plan: `docs/agents/preservation-plan.json`
- Preservation Plan SHA-256: '''+sha(dump(recipe))+'''
- Native Body Mapping: `docs/agents/native-adapters.json`
- Structural Verification: `docs/agents/validation-report.md`
- Contract Audit: `docs/agents/contract-audit.md`

| Environment | Registration | Status | Limitations |
| --- | --- | --- | --- |
| Codex | Seven TOML agents, five shared skills, root routing | unverified | Native discovery, MCP layer inheritance and effective role operations not executed in current sandbox |
| Copilot | Seven Markdown agents, five shared skills, scoped instructions | unverified | Actual client/model/tool picker and generated-role handoffs require client verification |

## Customization Register

| ID | Target | Region | Kind | Reason / user evidence | Upstream Relation | Survives Upgrade |
| --- | --- | --- | --- | --- | --- | --- |
| C001 | `.github/agents/demo-vision.agent.md` | disable-model-invocation | modified-rule | User explicitly requires Planner to spawn Vision when the active model lacks vision | overrides-canonical | always; retain until user changes it |
| C002 | Planner and Direct Implementor copies | VISION_INVOCATION slot | slot-override | Inline extraction if capable, otherwise Luna delegate; parent JSON reference bridges Planner JSON intake and Vision SlimUI output | extends-canonical within declared slot | always |
| C003 | Native skill adapters | name | native-registration | demo-prefixed invocation names distinguish configured skills from shipped source mirrors | independent; body exact | re-evaluate on discovery changes |
| C004 | `.github/instructions/agent-integrations.instructions.md` and integration-bindings.md | repository bindings | added-section | GitHub-only planning, exact MCP grants, English, current-role routing, native authority limits | extends-canonical | always |
| C005 | two existing knowledge files and README | obsolete references and test ownership | modified-rule | Reconcile missing Demo agents/glossary, session identity and Integration Tester production-code boundary | independent repository documentation | always |

Canonical copies remain exact after approved slots and marker stripping. The native Vision metadata override is not described as an unchanged canonical translation. No other non-slot canonical edits are authorized.

## Generated, Skipped and Deferred

- Generated agents: Planner, Implementor, Direct Implementor, Integration Tester, Knowledge Builder, Ask, Vision for both environments.
- Generated skills: author-repo-skill, plan-bug-from-id, plan-user-story-from-id, user-story-analysis, integration-test-knowledge-checklist, with demo-prefixed native names.
- Deferred skill: business-logic-gap-detector. The canonical Implementor body retains its existing special-mode text; no configured gap-detector skill is installed.
- No duplicate knowledge index, clarification schema, local tracker or new product tests.
- Knowledge Builder bootstrap: existing index preserved; only approved glossary/reference reconciliation performed. A future topic-scoped Knowledge Builder run should verify stale knowledge and fill integration-testing gaps.
- Every inline fill and replaced block is in the preservation recipe and answers; all source-only markers are stripped. Native adapters and their complete-body hashes are inventoried separately.

## Maintenance History

| Date | Bootstrap contract | Maintain version applied | Summary |
| --- | --- | --- | --- |
| 2026-09-19 | 5.0.0 plus explicit C001 exception | none | First approved install, seven roles and five skills; runtime verification outstanding |

After future edits, update answers, pristine baseline and customization register together. Use maintain-agentic-system for upgrades. Use the generated Knowledge Builder for topic-scoped evidence refresh, demo-author-repo-skill for reusable procedures, and create-work-item-from-description when ticket creation is explicitly requested.
'''
    write('docs/agents/agentic-system-manifest.md',manifest,'provenance')
    write('docs/agents/validation-report.md','# Validation Report\n\nInstallation created; independent verification pending. Native client checks are unverified.\n','provenance')
    write('docs/agents/contract-audit.md','# Contract Audit\n\nIndependent audit pending. No passing result is claimed.\n','provenance')
    answers_path='docs/agents/agentic-system.answers.yaml'
    ITEMS.append(dict(path=answers_path,kind='provenance',environments=ENVS,template='templates/agentic-system-answers.md',source_sha256=sha(norm((SKILL/'templates/agentic-system-answers.md').read_text())),baseline='docs/agents/.baseline/'+answers_path))
    answers=dict(version=2,bootstrap=dict(skill_version='5.0.0',contract_applied_through='5.0.0',generated_on=DATE),execution_host='Codex in VS Code Insiders; SDK environment path 0.153.0',
        environments={e:dict(platform='Codex' if e=='codex' else 'GitHub Copilot in VS Code',client='Local Codex clients' if e=='codex' else 'VS Code Copilot',version='CLI 0.155.0 discovered 2026-09-18; installation host SDK 0.153.0' if e=='codex' else 'VS Code stable 1.138.0 discovered; current Insiders harness not verified',roots=dict(agents='.codex/agents' if e=='codex' else '.github/agents',skills='.agents/skills',instructions='AGENTS.md and prompt-routed .github/instructions' if e=='codex' else 'AGENTS.md and .github/instructions'),evidence='docs/agents/compatibility.md',compatibility='unverified',verification='docs/agents/validation-report.md') for e in ENVS},
        slots={k:dict(value=v,source='user/recommend-accepted/discovery per decision-register.json',evidence='Approved master plan and accepted defaults; exact per-file substitution map') for k,v in SLOTS.items()},
        decisions=decisions,capabilities=capability_register(),preservation=dict(plan='docs/agents/preservation-plan.json',plan_sha256=sha(dump(recipe)),sources='docs/agents/sources',verification='python3 docs/agents/scripts/verify-agentic-system.py; see validation-report.md'),generated=ITEMS,
        deferred=[dict(environment='shared',decision='business-logic-gap-detector skill',reason='User selected defer'),dict(environment='shared',decision='native client and live MCP verification',reason='Unavailable in current sandbox/session; never inferred from static checks')])
    (ROOT/answers_path).write_text(dump(answers)) # JSON is a strict YAML 1.2 subset.
    for item in ITEMS:
        target=ROOT/item['baseline'];target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/item['path'],target)

if __name__=='__main__': main()
