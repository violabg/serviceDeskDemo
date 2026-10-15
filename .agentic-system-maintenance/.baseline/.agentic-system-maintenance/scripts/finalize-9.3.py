#!/usr/bin/env python3
"""Record the approved 2026-10-15 Bootstrap 9.3.0 upgrade in the maintenance records.

Bootstrap 9.3.0 adds the dual role route. The six Claude Code fallback skills (formerly C031) were brought
into conformance by hand-applied edits; this script records the surfaces answers, the per-surface role
entrypoints, the decisions and the source/changelog snapshots. Baseline refresh is a separate, final step
(--baseline) after validation passes.
"""
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MAINT = ROOT / '.agentic-system-maintenance'
SKILL = ROOT / '.agents/skills/bootstrap-agentic-system'
DATE = '2026-10-15'
EVIDENCE = ('User approved the 2026-10-15 upgrade plan ("Approve all"): Q1 take 9.3.0 (fallback skills point to the binding '
            'tool row instead of restating limits), Q2 refuse with a clear hint whenever any role already runs, Q3 decline a Copilot fallback.')
SOURCE = 'user-approved 2026-10-15 maintenance plan; Bootstrap 9.3.0 contracts'
ROLES = ['planner', 'implementor', 'direct-implementor', 'integration-tester', 'knowledge-builder', 'ask']
FALLBACKS = [f'.claude/skills/demo-{r}-fallback/SKILL.md' for r in ROLES]
CHANGED = FALLBACKS + ['docs/agents/bindings/claude-code.md', 'docs/agentic-system/README.md', 'docs/agentic-system/claude-code.md']
SNAPSHOTS = ['registry/capabilities.yaml', 'registry/placeholders.yaml', 'contracts/platform-compatibility.md']


def load(name):
    return json.loads((MAINT / name).read_text())


def dump(name, data):
    (MAINT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


def records():
    answers = load('agentic-system.answers.yaml')
    answers['bootstrap']['contract_applied_through'] = '9.3.0'

    envs = answers['environments']
    envs['copilot']['surfaces'] = dict(
        used=['VS Code (Chat view)'], dual_route='declined', source='user', evidence=EVIDENCE,
        note='Single surface; native Agent dropdown documented but unverified, so 9.3.0 required the offer; the user declined it.')
    envs['claude-code']['surfaces'] = dict(
        question='Will the team use Claude Code through the VS Code extension?', answer='yes: VS Code extension and CLI',
        dual_route='accepted for all six roles', source='user',
        evidence='C031 approval 2026-10-14 (the VS Code extension cannot pass --agent); confirmed by the 2026-10-15 plan approval.')
    envs['copilot']['role_entrypoints']['routes'] = [dict(
        surface='VS Code (Chat view)', route='native', role='primary', start='Agent dropdown, demo-<role>',
        enforcement='tools frontmatter limits the tool picker; path limits instruction-only', status='unverified')]
    cc = envs['claude-code']['role_entrypoints']
    cc['routes'] = [
        dict(surface='CLI', route='native', role='primary', start='claude --agent demo-<role>-claude',
             enforcement='registration tools list runtime-enforced; path limits instruction-only', status='unverified'),
        dict(surface='VS Code extension', route='native', role='primary', start='claude --agent demo-<role>-claude from the integrated terminal',
             enforcement='registration tools list runtime-enforced; path limits instruction-only', status='unverified'),
        dict(surface='CLI and VS Code extension', route='fallback', role='fallback', start='/demo-<role>-fallback in a new conversation',
             enforcement='binding Exact role tools row as instructions only', status='unverified'),
    ]
    cc['fallback_rules'] = dict(
        distinct_name='demo-<role>-fallback differs from demo-<role>-claude; never re-registers the role',
        refuses_inside_running_role='loads nothing when any demo role already runs (either route, including the same role); tells the user to resend without the command or open a new conversation',
        restates_role_rules='no: loads the binding and the complete canonical contract; names the binding tool row and the enforced --agent route only',
        automatic_invocation='disabled (disable-model-invocation: true)')
    cc['role_activation'] = 'planning skills run only in a conversation running Planner by either route; otherwise show both start steps, enforced first (binding)'
    cc['handoff'] = ('claude --agent demo-implementor-claude "Resume implementation for Planning Session <planning-session-id>" in a new terminal session '
                     '(tool limits enforced), or /demo-implementor-fallback Resume implementation for Planning Session <planning-session-id> '
                     'in a new conversation (instructions only)')
    cc['enforcement'] = '--agent: registration tools list runtime-enforced; fallback skill: binding Exact role tools row as instructions only; path limits instruction-only in both'
    cc['evidence'] += '; Bootstrap 9.3.0 dual-route rules applied 2026-10-15'

    for g in answers['generated']:
        if g['path'] in FALLBACKS:
            g['template'] = 'Bootstrap 9.3.0 dual-route fallback adapter (contract rules in platform-compatibility.md; no shipped template)'

    for d in answers['decisions']:
        if d['id'] == 'role-entrypoints':
            d['value'] = ('copilot: native main-session selection only (dual route declined); claude-code: dual route, native --agent primary '
                          'and /demo-<role>-fallback beside it for all six roles; exact steps in the bindings')
            d['evidence'] = EVIDENCE
    ids = {d['id'] for d in answers['decisions']}
    new = [dict(id='upgrade-9.3-scope', value='Bootstrap 9.2.0 -> 9.3.0: dual role route; fallback adapters conform; C031 retired into role_entrypoints',
                source='user', evidence=EVIDENCE),
           dict(id='client-surfaces', value='copilot: VS Code only, dual route declined; claude-code: VS Code extension and CLI, dual route accepted',
                source='user', evidence=EVIDENCE)]
    for d in new:
        if d['id'] not in ids:
            answers['decisions'].append(d)

    md = answers['maintenance_decisions']
    md['role_fallback_skills_2026_10_14']['status'] = 'superseded 2026-10-15: conformed to Bootstrap 9.3.0 dual-route rules; register row C031 retired into environments.claude-code.role_entrypoints'
    md['upgrade_9_3_2026_10_15'] = dict(approved=True, date=DATE, evidence=EVIDENCE, mode='upgrade', changed=CHANGED,
                                        retired_register_rows=['C031'],
                                        deferred=['business-logic-gap-detector skill', 'diagnostics tooling slot (no upstream slot in 9.3.0)',
                                                  'native and fallback role entrypoint verification on each surface'])
    answers['preservation']['environment_audit_result'] = ('blocked only by the inherited read/problems diagnostics source gap in the Claude Code '
                                                           'Implementor and Integration Tester outputs; Bootstrap 9.3.0 adds no diagnostics slot')
    dump('agentic-system.answers.yaml', answers)

    register = load('decision-register.json')
    rids = {d['id'] for d in register}
    for d in register:
        if d['id'] == 'role-entrypoints':
            d.update(value=next(a for a in answers['decisions'] if a['id'] == 'role-entrypoints')['value'], evidence=EVIDENCE)
    for d in new:
        if d['id'] not in rids:
            register.append(d)
    dump('decision-register.json', register)

    for rel in SNAPSHOTS:
        shutil.copyfile(SKILL / rel, MAINT / 'sources' / rel)
    shutil.copyfile(SKILL / 'CHANGELOG.md', MAINT / 'changelogs/bootstrap-agentic-system.CHANGELOG.md')
    print('Records updated')


def baseline():
    for path in CHANGED + ['.agentic-system-maintenance/agentic-system.answers.yaml', '.agentic-system-maintenance/decision-register.json',
                           '.agentic-system-maintenance/agentic-system-manifest.md',
                           '.agentic-system-maintenance/changelogs/bootstrap-agentic-system.CHANGELOG.md',
                           '.agentic-system-maintenance/scripts/finalize-9.3.py'] \
            + ['.agentic-system-maintenance/sources/' + rel for rel in SNAPSHOTS]:
        target = MAINT / '.baseline' / path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / path, target)
    print('Baseline refreshed for', len(CHANGED), 'runtime files and the maintenance records')


if __name__ == '__main__':
    baseline() if '--baseline' in sys.argv else records()
