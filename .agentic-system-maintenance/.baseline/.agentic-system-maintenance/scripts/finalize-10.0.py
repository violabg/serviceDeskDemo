"""Bootstrap 10.0.0 upgrade records (approved 2026-10-16).

Claude Code moves from the 9.3.0 dual route (native `claude --agent demo-<role>-claude` plus
`/demo-<role>-fallback`) to the 10.0.0 skill route: no native role agents, Planner through the
planning skills, every other role through `/demo-<role>-claude` (C033 suffix). Copilot keeps its
native route. Run after render-10.0.mjs and the runtime edits, from the repository root:

  python3 .agentic-system-maintenance/scripts/finalize-10.0.py             # records
  python3 .agentic-system-maintenance/scripts/finalize-10.0.py --baseline  # after validation
"""
import hashlib, json, shutil, sys
from pathlib import Path

ROOT = Path.cwd()
MAINT = ROOT / '.agentic-system-maintenance'
BASE = MAINT / '.baseline'
DATE = '2026-10-16'
ROLES = ['planner', 'implementor', 'direct-implementor', 'integration-tester', 'knowledge-builder', 'ask']
SKILL_ROLES = [r for r in ROLES if r != 'planner']
AGENTS = [f'.claude/agents/demo-{r}-claude.md' for r in ROLES]
FALLBACKS = [f'.claude/skills/demo-{r}-fallback/SKILL.md' for r in ROLES]
ROLE_SKILLS = [f'.claude/skills/demo-{r}-claude/SKILL.md' for r in SKILL_ROLES]
REMOVED = AGENTS + FALLBACKS
BINDING = 'docs/agents/bindings/claude-code.md'
canonical = lambda r: f'docs/agents/canonical/claude-code/agents/demo-{r}.agent.md'
role_of = lambda p: p.split('/')[2][len('demo-'):-len('-claude')]
EVIDENCE = ('User approved the 2026-10-16 upgrade plan ("approved") after resolving Q1 skill route for Claude Code, '
            'Q2 record the Copilot discovery conflict with a guard and keep a -claude suffix on the role skills, '
            'Q3 approve read-only Bash find/grep as the environment-level search binding and retire C032, '
            'Q4 no MCP deny list.')
OBSERVED = ('2026-10-16, Claude Code 2.1.300, interactive plain default session in the VS Code Insiders extension '
            '(the session every role skill starts in): Read, Edit, Write, Bash, Agent, AskUserQuestion, Skill, ToolSearch '
            'loaded; WebFetch, WebSearch and the project MCP tools (github, neon, context7, next-devtools) listed as deferred '
            'and loaded through ToolSearch; no Glob, no Grep.')


def load(p): return json.loads(p.read_text())
def dump(p, data): p.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()


def replace_paths(items, key, make):
    """Drop removed outputs and insert the role skills where the first fallback stood."""
    out, inserted = [], False
    for item in items:
        path = item if key is None else item[key]
        if path in REMOVED:
            if path == FALLBACKS[0] and not inserted:
                out.extend(make(p) for p in ROLE_SKILLS); inserted = True
            continue
        if path in ROLE_SKILLS: return items  # already applied
        out.append(item)
    if not inserted: out.extend(make(p) for p in ROLE_SKILLS)
    return out


def decisions_update(items):
    by_id = {d['id']: d for d in items}
    if 'role-entrypoints' in by_id:
        by_id['role-entrypoints'].update(
            value='copilot: native route (Agent dropdown), single surface; claude-code: skill route on CLI and VS Code '
                  'extension, Planner through plan-bug-from-id/plan-user-story-from-id, other roles through '
                  '/demo-<role>-claude role skills; exact steps in the bindings',
            evidence=EVIDENCE)
    if 'client-surfaces' in by_id:
        by_id['client-surfaces'].update(
            value='copilot: VS Code only, native route; claude-code: VS Code extension and CLI; the extension cannot pass '
                  '--agent, so native selection does not cover every surface and Bootstrap 10.0.0 selects the skill route',
            evidence=EVIDENCE)
    if 'fallback-repository-search' in by_id:
        by_id['fallback-repository-search'].update(
            id='claude-code-repository-search',
            value='claude-code environment-level binding: file/path and text search use read-only Bash find/grep with '
                  'maintenance, session, dependency and VCS exclusions for all six roles (the plain session has no '
                  'Glob/Grep); for Planner, Knowledge Builder and Ask that is their only Bash use',
            evidence=EVIDENCE + ' Supersedes the 2026-10-15 fallback-route decision; register row C032 retired.')
    if 'claude-roles' in by_id:
        by_id['claude-roles']['status'] = (f'superseded {DATE}: Bootstrap 10.0.0 skill route removed the native '
                                           'demo-<role>-claude subagents and the Agent() deny entries')
    new = [
        dict(id='upgrade-10.0-scope', source='user', evidence=EVIDENCE,
             value='Bootstrap 9.4.0 -> 10.0.0: one role route per environment; claude-code moves to the skill route; '
                   'copilot native route already conforms'),
        dict(id='claude-code-role-skill-names', source='user', evidence=EVIDENCE,
             value='role skills are named demo-<role>-claude instead of demo-<role> so Copilot, which also discovers '
                   '.claude/skills, does not list skills with the same names as its demo-<role> agents (register C033)'),
        dict(id='copilot-skill-discovery-conflict', source='user', evidence=EVIDENCE,
             value='recorded, not isolated: Copilot lists the demo-<role>-claude role skills; each stops outside Claude '
                   'Code, and the Copilot binding, instruction adapter and guide say never to invoke them'),
        dict(id='claude-code-mcp-guard', source='user', evidence=EVIDENCE,
             value='no permissions.deny list; role tool limits are instruction-only and the plain session exposes the '
                   'project MCP servers as before'),
    ]
    for d in new:
        if d['id'] not in by_id: items.append(d); by_id[d['id']] = d
    return items


def records():
    shutil.copyfile('.agents/skills/bootstrap-agentic-system/CHANGELOG.md',
                    MAINT / 'changelogs/bootstrap-agentic-system.CHANGELOG.md')

    adapters_path = MAINT / 'native-adapters.json'
    dump(adapters_path, [a for a in load(adapters_path) if a['path'] not in AGENTS])

    env_path = MAINT / 'environment-audit.json'
    env = load(env_path)
    env['runtime_outputs'] = replace_paths(env['runtime_outputs'], None, lambda p: p)
    env['files'] = replace_paths(env['files'], 'output', lambda p: dict(
        output=p, environments=['claude-code'], references=[BINDING, canonical(role_of(p))]))
    dump(env_path, env)

    ctx_path = MAINT / 'context-audit.json'
    ctx = load(ctx_path)
    ctx['outputs'] = replace_paths(ctx['outputs'], None, lambda p: p)
    ctx['files'] = replace_paths(ctx['files'], 'output', lambda p: dict(
        output=p, kind='runtime', references=[dict(output=BINDING, when='ordinary'),
                                              dict(output=canonical(role_of(p)), when='ordinary')]))
    dump(ctx_path, ctx)

    reg_path = MAINT / 'decision-register.json'
    dump(reg_path, decisions_update(load(reg_path)))

    a_path = MAINT / 'agentic-system.answers.yaml'
    a = load(a_path)
    a['bootstrap']['contract_applied_through'] = '10.0.0'
    a['decisions'] = decisions_update(a['decisions'])

    plan = load(MAINT / 'preservation-plan.json')
    for copy in plan['copies']:
        for slot in ('ROLE_ACTIVATION', 'AGENT_ROSTER'):
            if slot in copy['values']:
                a['slots'][slot]['value'][copy['output']] = copy['values'][slot]
    a['slots']['ROLE_ACTIVATION']['source'] = (f'user-approved {DATE} maintenance (10.0.0 skill route); neutral value '
                                               'points to the active binding, which names the route (C029)')

    cc = a['environments']['claude-code']
    cc['roots'].pop('agents', None)
    cc['roots']['role_skills'] = '.claude/skills/demo-<role>-claude/SKILL.md (five; no Planner role skill)'
    cc['surfaces'] = dict(
        used=['CLI', 'VS Code extension'], route='skill', source='user',
        reason='the VS Code extension cannot pass --agent, so native main-session selection does not work on every '
               'surface the team uses (Bootstrap 10.0.0 Role Entrypoints rule)',
        evidence=EVIDENCE)
    old = cc['role_entrypoints']
    cc['role_entrypoints'] = dict(
        route='skill',
        method='Planner: /plan-bug-from-id <issue-id> or /plan-user-story-from-id <issue-id> in a new conversation; '
               'other roles: /demo-<role>-claude in a new conversation; no native user-invokable role registrations',
        planner='planning skills only; they refuse inside a running role, then load the binding and the complete '
                'Planner contract; planning without a work-item ID is not offered',
        role_skills=ROLE_SKILLS,
        enforcement='instruction-only on every surface: the binding Exact role tools row per role plus the '
                    'environment-level search substitution; path limits instruction-only',
        model_invocation='every role skill and planning skill sets disable-model-invocation: true',
        refusal='every role skill and planning skill refuses when the conversation already runs a role',
        handoff='/demo-implementor-claude Resume implementation for Planning Session <planning-session-id> in a new '
                'conversation',
        role_activation='planning skills: on the skill route, refuse inside a running role, otherwise load the binding '
                        'and the complete Planner contract first (binding)',
        in_conversation_switch='not documented; start a new conversation',
        question_tool='AskUserQuestion, at most 4 questions per call; larger batches use consecutive calls; present in '
                      'the interactive VS Code extension plain session (2026-10-16); absent in headless claude -p',
        environment_bindings=dict(
            source='.mcp.json servers github, neon, context7, next-devtools (approved when Claude Code asks); '
                   '.claude/settings.json keeps only the maintenance skillOverrides; no permissions.deny list (Q4)',
            union='the six Exact role tools rows in the binding; each row stays that role\'s instruction-only limit',
            repository_search='read-only Bash find/grep with maintenance, session, dependency and VCS exclusions, all '
                              'six roles (approved alternative; C032 retired)',
            deferred_tools='WebFetch and MCP tools load through ToolSearch select:<name> before first use',
            delegation='Agent with subagent_type general-purpose (image inspection with model haiku); the subagent '
                       'tool may be listed as Task in headless init output'),
        tool_surface_observed=OBSERVED,
        copilot_discovery_conflict='Copilot discovers .claude/skills and lists the demo-<role>-claude role skills; '
                                   'guarded and recorded (Q2), not isolated',
        evidence='https://code.claude.com/docs/en/skills and /sub-agents retrieved 2026-10-13/14; ' + OBSERVED,
        status='unverified',
        routes=[
            dict(surface='VS Code extension', route='skill', start='/plan-*-from-id or /demo-<role>-claude in a new '
                 'conversation', enforcement='instruction-only', status='unverified',
                 tool_surface=OBSERVED, repository_search='read-only Bash find/grep (binding)'),
            dict(surface='CLI', route='skill', start='claude, then /plan-*-from-id or /demo-<role>-claude',
                 enforcement='instruction-only', status='unverified',
                 tool_surface='interactive plain session not observed; headless claude -p 2026-10-15: no Glob, Grep or '
                              'AskUserQuestion', repository_search='read-only Bash find/grep (binding)'),
        ])
    cop = a['environments']['copilot']
    cop['role_entrypoints']['route'] = 'native'
    cop['surfaces'].pop('dual_route', None)
    cop['surfaces']['route'] = 'native (single surface; conforms to Bootstrap 10.0.0 without change)'

    md = a['maintenance_decisions']
    md['role_fallback_skills_2026_10_14']['status'] = (f'removed {DATE}: Bootstrap 10.0.0 single-route rule; the six '
                                                       'fallback skills were deleted with the native agents')
    md['fallback_repository_search_2026_10_15']['status'] = (f'superseded {DATE}: now the environment-level search '
                                                             'binding of the skill route; C032 retired')
    md['upgrade_10_0_2026_10_16'] = dict(
        approved=True, date=DATE, evidence=EVIDENCE, mode='upgrade', installed_bootstrap='10.0.0',
        installed_maintainer='4.0.0', applied_through='10.0.0',
        renderer='.agentic-system-maintenance/scripts/render-10.0.mjs',
        records='.agentic-system-maintenance/scripts/finalize-10.0.py',
        retired=REMOVED,
        added=ROLE_SKILLS,
        rerendered=['AGENTS.md', '.agents/skills/plan-bug-from-id/SKILL.md',
                    '.agents/skills/plan-user-story-from-id/SKILL.md'],
        changed=['.claude/settings.json', BINDING, 'docs/agents/bindings/copilot.md', '.claude/rules/agent-integrations.md',
                 '.github/instructions/agent-integrations.instructions.md', 'README.md', 'docs/agentic-system/README.md',
                 'docs/agentic-system/claude-code.md', 'docs/agentic-system/copilot.md'],
        register=dict(added=['C033'], retired=['C025', 'C032'], rechecked=['C029', 'C030']),
        superseded_route_checks=old.get('route_tool_surface_check'),
        deferred=['interactive CLI plain-session tool list (user step, guide Verify once step 6)',
                  'role-skill and planning-skill runs, refusal and handoff on both surfaces (user step)'])

    a['generated'] = [g for g in a['generated'] if g['path'] not in REMOVED]
    have = {g['path'] for g in a['generated']}
    for p in ROLE_SKILLS:
        if p not in have:
            a['generated'].append(dict(
                path=p, kind='role-skill', environments=['claude-code'],
                template='Bootstrap 10.0.0 skill-route role skill (platform-compatibility.md Role Entrypoints; no '
                         'shipped template)',
                source_sha256='not-applicable', baseline=str(Path('.agentic-system-maintenance/.baseline') / p),
                canonical_copy=canonical(role_of(p)), loading='reference: binding plus complete canonical copy'))
    for p in ['.agentic-system-maintenance/scripts/render-10.0.mjs', '.agentic-system-maintenance/scripts/finalize-10.0.py']:
        if p not in have:
            a['generated'].append(dict(path=p, kind='provenance', environments=['copilot', 'claude-code'],
                                       template='authored', source_sha256='not-applicable',
                                       baseline=str(Path('.agentic-system-maintenance/.baseline') / p)))

    a['preservation']['plan_sha256'] = sha(MAINT / 'preservation-plan.json')
    a['preservation']['environment_audit_sha256'] = sha(env_path)
    a['preservation']['environment_audit_result'] = ('blocked only by the inherited read/problems diagnostics source '
                                                      'gap in the Claude Code Implementor and Integration Tester '
                                                      'outputs; Bootstrap 10.0.0 adds no diagnostics slot')
    dump(a_path, a)
    print('records updated')


def baseline():
    a = load(MAINT / 'agentic-system.answers.yaml')
    drift = set(a['maintenance_decisions']['upgrade_8_0_2026_10_11']['known_baseline_drift'])
    for p in REMOVED:
        b = BASE / p
        if b.exists(): b.unlink()
        if b.parent.exists() and not any(b.parent.iterdir()): b.parent.rmdir()
    refreshed = 0
    for g in a['generated']:
        if g['path'] in drift: continue
        src, dst = ROOT / g['path'], ROOT / g['baseline']
        if not dst.exists() or dst.read_bytes() != src.read_bytes():
            dst.parent.mkdir(parents=True, exist_ok=True); shutil.copyfile(src, dst); refreshed += 1
    print(f'baseline refreshed: {refreshed} files; removed {len(REMOVED)} retired baselines')


if __name__ == '__main__':
    baseline() if '--baseline' in sys.argv else records()
