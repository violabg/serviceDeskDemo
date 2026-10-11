#!/usr/bin/env python3
"""Refresh maintenance provenance after the verified 2026-10-11 render.

--records: refresh source/changelog/verifier snapshots, rebuild answers, refresh runtime baselines, drop retired baselines.
--seal:    copy the final manifest, answers, validation report and other maintenance records into the baseline.
Run --records only after preservation, context and environment checks; run --seal last.
"""
import hashlib
import importlib.util
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MAINT = ROOT / '.agentic-system-maintenance'
SKILL = ROOT / '.agents/skills/bootstrap-agentic-system'
BASE = MAINT / '.baseline'
HIST = MAINT / 'history/2026-10-11-before-8.0'
DATE = '2026-10-11'

spec = importlib.util.spec_from_file_location('render', MAINT / 'scripts/render-8.0.py')
R = importlib.util.module_from_spec(spec)
sys.argv_saved, sys.argv = sys.argv, ['render-8.0.py']
spec.loader.exec_module(R)
sys.argv = sys.argv_saved

RETIRED = [
    'docs/agents/canonical/codex/agents/demo-vision.agent.md', 'docs/agents/canonical/copilot/agents/demo-vision.agent.md',
    '.codex/agents/demo-vision.toml', '.github/agents/demo-vision.agent.md',
    '.agents/skills/create-work-item-from-description/SKILL.md', '.agents/skills/create-work-item-from-description/CHANGELOG.md',
    '.agentic-system-maintenance/sources/templates/agents/vision.agent.md',
    '.agentic-system-maintenance/sources/authored/create-work-item-from-description/SKILL.md',
    '.agentic-system-maintenance/sources/authored/create-work-item-from-description/CHANGELOG.md',
]
KNOWN_DRIFT = ['knowledge/testing-flow-checklist.md', 'knowledge/dashboard-navigation-boundaries.md']  # C011/C012
RUNTIME_SOURCE_RESOURCES = ['knowledge/knowledge-index.md', '.mcp.json']
SNAPSHOTS = ['registry/capabilities.yaml', 'registry/placeholders.yaml', 'templates/knowledge-index-schema.md',
             'templates/agent-role-contracts.md', 'templates/agentic-system-manifest.md', 'templates/agentic-system-answers.md',
             'templates/bootstrap-file-plan.md', 'contracts/platform-compatibility.md', 'contracts/context-boundaries.md',
             'templates/plan-schema.md', 'templates/test-plan-schema.md', 'templates/artifact-gates.md'] + \
            [f'templates/agents/{r}.capabilities.yaml' for r in R.ROLES]
SCRIPTS = ['verify-canonical-copies.mjs', 'verify-environment-bindings.mjs', 'verify-context-boundaries.mjs']
AUTHORED_RUNTIME = {
    'docs/agents/bindings/codex.md': ['codex'], 'docs/agents/bindings/copilot.md': ['copilot'],
    'docs/agents/bindings/claude-code.md': ['claude-code'], 'docs/agents/integration-bindings.md': R.ENVS,
    'docs/agents/integration-policy.md': R.ENVS, 'docs/agents/github-issues-adapter.md': R.ENVS,
    'docs/agents/instructions/agent-integrations.md': R.ENVS,
    '.github/instructions/agent-integrations.instructions.md': ['copilot'],
    '.claude/rules/agent-integrations.md': ['claude-code'],
    '.codex/config.toml': ['codex'], '.claude/settings.json': ['claude-code'],
}
NATIVE_CONFIG = {'.codex/config.toml', '.claude/settings.json'}
MAINT_NEW = ['.agentic-system-maintenance/scripts/render-8.0.py', '.agentic-system-maintenance/scripts/build-audits-8.0.py',
             '.agentic-system-maintenance/scripts/finalize-8.0.py', '.agentic-system-maintenance/render-8.0-copies.json',
             '.agentic-system-maintenance/maintenance-plan-2026-10-11-upgrade-8.0-claude.md',
             '.agentic-system-maintenance/maintenance-2026-10-11-upgrade-8.0-claude.md',
             '.agentic-system-maintenance/scripts/verify-context-boundaries.mjs',
             '.agentic-system-maintenance/sources/contracts/context-boundaries.md'] + \
            [f'.agentic-system-maintenance/sources/templates/agents/{r}.capabilities.yaml' for r in R.ROLES] + \
            ['.agentic-system-maintenance/sources/templates/skills/manage-work-item/SKILL.md']
SEALED = ['.agentic-system-maintenance/agentic-system-manifest.md', '.agentic-system-maintenance/scripts/verify-agentic-system.py',
          '.agentic-system-maintenance/scripts/finalize-8.0.py', '.agentic-system-maintenance/agentic-system.answers.yaml',
          '.agentic-system-maintenance/validation-report.md', '.agentic-system-maintenance/compatibility.md',
          '.agentic-system-maintenance/maintenance-2026-10-11-upgrade-8.0-claude.md',
          '.agentic-system-maintenance/maintenance-plan-2026-10-11-upgrade-8.0-claude.md']


def sha(b):
    return hashlib.sha256(b).hexdigest()


def norm_sha(path):
    return sha((ROOT / path).read_text().replace('\r\n', '\n').encode())


def copy(src, dst):
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dst)


def records():
    recipe = json.loads((MAINT / 'preservation-plan.json').read_text())
    adapters = json.loads((MAINT / 'native-adapters.json').read_text())
    envs_of = {c['output']: c['environments'] for c in json.loads((MAINT / 'render-8.0-copies.json').read_text())}
    old = json.loads((HIST / '.agentic-system-maintenance/agentic-system.answers.yaml').read_text())

    # 1. Source snapshots, changelog and verifier copies (maintenance-only, never runtime).
    for rel in sorted({c['template'] for c in recipe['copies']} | set(SNAPSHOTS)):
        copy(SKILL / rel, MAINT / 'sources' / rel)
    for rel in RETIRED:
        if rel.startswith('.agentic-system-maintenance/') and (ROOT / rel).exists():
            (ROOT / rel).unlink()
    shutil.rmtree(MAINT / 'sources/authored/create-work-item-from-description', ignore_errors=True)
    copy(SKILL / 'CHANGELOG.md', MAINT / 'changelogs/bootstrap-agentic-system.CHANGELOG.md')
    for s in SCRIPTS:
        copy(SKILL / 'scripts' / s, MAINT / 'scripts' / s)

    # 2. Generated inventory.
    gen = []

    def item(path, kind, environments, template='authored', **extra):
        src = SKILL / template
        gen.append(dict(path=path, kind=kind, environments=list(environments), template=template,
                        source_sha256=sha(src.read_text().replace('\r\n', '\n').encode()) if src.is_file() else 'not-applicable',
                        baseline='.agentic-system-maintenance/.baseline/' + path, **extra))

    for c in recipe['copies']:
        item(c['output'], 'canonical-copy', envs_of[c['output']], c['template'], loading='direct', marker_decision='strip all source-only markers')
    for a in adapters:
        tmpl = next(c['template'] for c in recipe['copies'] if c['output'] == a['canonical_copy'])
        kind = 'native-instruction-adapter' if a['role'] == 'instruction' else 'native-adapter'
        item(a['path'], kind, [a['environment']], tmpl, canonical_copy=a['canonical_copy'], loading='lossless-embedding')
    for path, envs in AUTHORED_RUNTIME.items():
        item(path, 'native-config' if path in NATIVE_CONFIG else 'shared-resource', envs)
    taken = {g['path'] for g in gen}
    for o in old['generated']:
        if o['path'] in taken or o['path'] in RETIRED or not (ROOT / o['path']).exists():
            continue
        tmpl = o['template']
        environments = R.ENVS if o['kind'] == 'shared-resource' else o['environments']
        if o['kind'] == 'provenance':
            environments = R.ENVS
        item(o['path'], o['kind'], environments, tmpl)
    for path in MAINT_NEW:
        if path not in {g['path'] for g in gen} and (ROOT / path).exists():
            item(path, 'provenance', R.ENVS, 'authored')
    for rel in sorted({c['template'] for c in recipe['copies']} | set(SNAPSHOTS)):
        p = '.agentic-system-maintenance/sources/' + rel
        if p not in {g['path'] for g in gen}:
            item(p, 'provenance', R.ENVS, rel)

    # 3. Slots from the recipe, plus decisions that are not template values.
    slots = {}
    src = 'user-approved 2026-10-11 maintenance plan (Sets U and E); Bootstrap 8.0.0 templates'
    ev = 'User: "approved recommended, remove the vision agent ... codex to use github via mcp"; "Both U and E"; native subagents with -claude suffix and maximal sharing.'
    for c in recipe['copies']:
        for k, v in c['values'].items():
            slots.setdefault(k, dict(value={}, source=src, evidence=ev))['value'][c['output']] = v
        for b in c['blocks']:
            slots.setdefault(b['slot'], dict(value={}, source=src, evidence=ev))['value'][c['output'] + '#block-' + str(b['occurrence'])] = b['value']
    slots['RUNTIME_ROOT'] = dict(value='not adopted: existing runtime locations retained (docs/agents/ schemas, canonical copies and bindings; sessions/)',
                                 source='user-approved D3 2026-10-11', evidence=ev)
    slots['VISION_MODEL'] = dict(value='retired', source='user-approved D4 2026-10-11', evidence='Vision agent removed in every environment')

    # 4. Capabilities per environment and role.
    caps = {}
    for env in R.ENVS:
        caps[env] = {}
        for role in R.ROLES:
            entries = {}
            side = (SKILL / f'templates/agents/{role}.capabilities.yaml').read_text()
            for token in __import__('re').findall(r'- token: (\S+)', side):
                entries[token] = dict(capability=token, binding='capability-bindings-table', invocation=R.binding_row(role, token),
                                      environment_binding=f'docs/agents/bindings/{env}.md', status='unverified',
                                      evidence='Rendered CAPABILITY_BINDINGS row; generated-role execution not exercised.')
            entries['native-tools'] = dict(capability='native-tools', binding='native-tool', invocation=R.native_tools(env, role),
                                           status='unverified', evidence='Configured role tool surface; client discovery not exercised.')
            for server, tools in R.mcp_map(role).items():
                for tool in tools:
                    entries[server + '/' + tool] = dict(capability=server + '-integration', binding='integration',
                                                       invocation=R.qualified(env, server, tool), status='unverified',
                                                       evidence='Exact role grant; per-role runtime access not exercised.')
            caps[env][role] = entries

    envs = dict(old['environments'])
    envs['codex'] = dict(envs['codex'], version='codex-cli 0.162.1 observed 2026-10-11; earlier records retained in compatibility evidence',
                         roots=dict(envs['codex']['roots'], config='.codex/config.toml (project, trusted projects only)'),
                         blocked_operations={'implementor/diagnostics': 'inherited read/problems outside tooling slots',
                                             'integration-tester/diagnostics': 'inherited read/problems outside tooling slots'})
    envs['copilot'] = dict(envs['copilot'], blocked_operations={})
    envs['claude-code'] = dict(platform='Claude Code', client='Claude Code CLI and VS Code extension',
                               version='2.1.296 observed 2026-10-11', roots={'agents': '.claude/agents (demo-<role>-claude)',
                               'skills': '.claude/skills/<name> links to .agents/skills/<name>', 'instructions': 'AGENTS.md (native, no CLAUDE.md) and .claude/rules',
                               'settings': '.claude/settings.json', 'mcp': '.mcp.json'},
                               evidence='.agentic-system-maintenance/compatibility.md', compatibility='unverified',
                               verification='.agentic-system-maintenance/validation-report.md', binding='docs/agents/bindings/claude-code.md',
                               blocked_operations={'implementor/diagnostics': 'inherited read/problems outside tooling slots',
                                                   'integration-tester/diagnostics': 'inherited read/problems outside tooling slots'})

    a = dict(old)
    a['bootstrap'] = dict(old['bootstrap'], contract_applied_through='8.0.0')
    a['execution_host'] = 'Claude Code 2.1.296 in VS Code (2026-10-11 maintenance); earlier runs: ' + old['execution_host']
    a['environments'] = envs
    a['slots'] = slots
    a['capabilities'] = caps
    a['decisions'] = [d for d in old['decisions'] if d['id'] != 'vision'] + [
        dict(id='environments-2026-10-11', value=R.ENVS, source='user', evidence='User: "add claude to the system"'),
        dict(id='upgrade-8.0-scope', value='Sets U and E in one plan; 6.0 deferral lifted', source='user', evidence='User: approved recommended; Both U and E'),
        dict(id='work-item-write', value='GitHub MCP issue_write create/update in every environment', source='user', evidence='Recommended D2 approved; Codex via MCP'),
        dict(id='runtime-root', value='not adopted', source='user', evidence='Recommended D3 approved'),
        dict(id='vision', value='retired in every environment; inline image inspection; visual-evidence v1 JSON', source='user', evidence='User: remove the vision agent ... everywhere'),
        dict(id='retire-create-work-item', value=True, source='user', evidence='Recommended D5 approved'),
        dict(id='codex-github-mcp', value={'url': R.GITHUB_MCP_URL, 'bearer_token_env_var': R.GITHUB_TOKEN_ENV, 'apps.github': 'default_tools_enabled=false, no tools'},
             source='user', evidence='User: i also want codex to use github via mcp'),
        dict(id='claude-roles', value='native subagents demo-<role>-claude; Agent() deny for automatic delegation; shared neutral bodies (S1)', source='user',
             evidence='User: native subagents with claude subfix ... keep as much content as possible shared'),
    ]
    a['preservation'] = dict(plan='.agentic-system-maintenance/preservation-plan.json', plan_sha256=sha((MAINT / 'preservation-plan.json').read_bytes()),
                             sources='.agentic-system-maintenance/sources',
                             verification='python3 .agentic-system-maintenance/scripts/verify-agentic-system.py',
                             environment_audit='.agentic-system-maintenance/environment-audit.json',
                             environment_audit_sha256=sha((MAINT / 'environment-audit.json').read_bytes()),
                             environment_audit_result='blocked only by the inherited read/problems diagnostics source gap in Codex and Claude Code Implementor/Integration Tester (8 outputs); all 67 runtime files pass without that literal')
    a['generated'] = gen
    a['deferred'] = [old['deferred'][0], old['deferred'][1],
                     dict(environment='codex', decision='GitHub MCP authentication', reason='GITHUB_TOKEN must reach the Codex process; configuration verified with codex mcp list, no authenticated call made'),
                     dict(environment='shared', decision='diagnostics tooling slot', reason='Inherited read/problems outside declared slots; needs an upstream DIAGNOSTICS_TOOL slot')]
    lay = dict(old['layout'])
    lay.update(knowledge_entries=json.loads((MAINT / 'context-audit.json').read_text())['knowledge_entries'],
               outputs_count=len(json.loads((MAINT / 'context-audit.json').read_text())['outputs']),
               maintenance_plan='.agentic-system-maintenance/maintenance-plan-2026-10-11-upgrade-8.0-claude.md',
               runtime_root='not adopted (D3)', claude_skill_links=[f'.claude/skills/{s}' for s in R.SKILLS],
               claude_maintenance_aliases=['.claude/skills/bootstrap-agentic-system', '.claude/skills/maintain-agentic-system'],
               claude_settings='.claude/settings.json skillOverrides user-invocable-only for maintenance skills')
    a['layout'] = lay
    ie = dict(old['integration_evidence'])
    codex = {k: v for k, v in ie['codex'].items() if k not in ('github_app', 'github_cli_issue_creation')}
    codex['github_mcp'] = dict(configuration='configured: project .codex/config.toml and role layers; codex mcp list shows github enabled with bearer env var GITHUB_TOKEN (2026-10-11)',
                               authentication='unverified: GITHUB_TOKEN not present in the inspected shell', operation='unverified')
    codex['retired'] = 'github Codex App tools and gh CLI creation procedure superseded 2026-10-11 (C016, C020)'
    ie['codex'] = codex
    ie['claude-code'] = dict(github_mcp=dict(configuration='.mcp.json http server, Authorization Bearer ${GITHUB_TOKEN}',
                                             authentication='verified in main session 2026-10-11', operation='issue_read get on violabg/serviceDeskDemo#1 succeeded (read-only); role-level and issue_write unverified'),
                             neon=dict(configuration='.mcp.json http https://mcp.neon.tech/mcp', authentication='unverified for roles', operation='unverified'),
                             next_devtools=dict(configuration='.mcp.json stdio npx next-devtools-mcp@0.3.6 added 2026-10-11', authentication='not-required', operation='unverified'))
    a['integration_evidence'] = ie
    md = dict(old['maintenance_decisions'])
    md['upgrade_8_0_2026_10_11'] = dict(approved=True, date=DATE, mode='upgrade + evolve', installed_bootstrap='8.0.0', applied_through='8.0.0',
                                        retired=RETIRED, runtime_source_resources=RUNTIME_SOURCE_RESOURCES, known_baseline_drift=KNOWN_DRIFT,
                                        plan='.agentic-system-maintenance/maintenance-plan-2026-10-11-upgrade-8.0-claude.md',
                                        report='.agentic-system-maintenance/maintenance-2026-10-11-upgrade-8.0-claude.md')
    a['maintenance_decisions'] = md
    (MAINT / 'agentic-system.answers.yaml').write_text(json.dumps(a, ensure_ascii=False, indent=2) + '\n')

    # 5. Baselines: refresh approved outputs, keep protected drift, drop retired and orphaned entries.
    keep = set()
    for g in gen:
        keep.add(g['path'])
        if g['path'] in KNOWN_DRIFT or g['path'] in SEALED:
            continue
        copy(ROOT / g['path'], BASE / g['path'])
    for p in sorted(BASE.rglob('*')):
        if p.is_file() and str(p.relative_to(BASE)) not in keep:
            print('removing orphan baseline', p.relative_to(BASE))
            p.unlink()
    print('records refreshed:', len(gen), 'inventory entries')


def seal():
    for path in SEALED:
        if (ROOT / path).exists():
            copy(ROOT / path, BASE / path)
    print('sealed', len(SEALED), 'maintenance records')


if __name__ == '__main__':
    if '--records' in sys.argv:
        records()
    if '--seal' in sys.argv:
        seal()
