#!/usr/bin/env python3
"""Records and baseline for the approved 2026-10-16 upgrade, Bootstrap 10.0.0 -> 10.0.1.

Run after render-10.0.1.mjs and the authored doc edits, from the repository root:
  python3 .agentic-system-maintenance/scripts/finalize-10.0.1.py             # records
  python3 .agentic-system-maintenance/scripts/finalize-10.0.1.py --baseline  # baseline, last
"""
import hashlib
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MAINT = ROOT / '.agentic-system-maintenance'
BASE = MAINT / '.baseline'
SOURCES = MAINT / 'sources'
DATE = '2026-10-16'
EVIDENCE = ('User approved the 2026-10-16 10.0.1 upgrade plan ("approved") with the standing instruction "take all '
            'incoming over mine"; C034 resolved take-theirs.')
SKILLS = ['.agents/skills/plan-bug-from-id/SKILL.md', '.agents/skills/plan-user-story-from-id/SKILL.md']
CHANGED_TEMPLATES = ['templates/agents/planner.agent.md', 'templates/instructions/AGENTS.md',
                     'templates/skills/plan-bug-from-id/SKILL.md', 'templates/skills/plan-user-story-from-id/SKILL.md',
                     'templates/artifact-gates.md']
RERENDERED = ['docs/agents/canonical/copilot/agents/demo-planner.agent.md',
              'docs/agents/canonical/claude-code/agents/demo-planner.agent.md',
              '.github/agents/demo-planner.agent.md', 'AGENTS.md'] + SKILLS
AUTHORED = ['docs/agents/artifact-gates.md', 'README.md', 'docs/agentic-system/README.md',
            'docs/agentic-system/claude-code.md', 'docs/agentic-system/copilot.md']
SCRIPTS = ['.agentic-system-maintenance/scripts/render-10.0.1.mjs',
           '.agentic-system-maintenance/scripts/finalize-10.0.1.py']
UNVERIFIED = ('Planner runs through the planning skills on both surfaces: session ID confirmed before retrieval, intake '
              'continues into the gates without stopping, memory and log entries land in sessions/<id>/session-memory.md '
              'and session-log.md (guide Verify once step 2)')


def load(p): return json.loads(p.read_text())
def dump(p, data): p.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
def sha_text(p): return hashlib.sha256(p.read_text().replace('\r\n', '\n').replace('\r', '\n').encode()).hexdigest()
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()


def decisions_update(items):
    for d in items:
        if d.get('id') == 'planner-skill-route-authority':
            d['status'] = (f'C034 superseded {DATE} by Bootstrap 10.0.1 (Planner gates name the session capabilities, '
                           'planning skills carry the inline hand-back and settle the session ID before retrieval, '
                           'ROLE_ACTIVATION takes the 10.0.1 governance statement); C035 kept')
    if not any(d.get('id') == 'upgrade-10.0.1-scope' for d in items):
        items.append(dict(
            id='upgrade-10.0.1-scope', source='user', evidence=EVIDENCE,
            value='take upstream for every 10.0.1 region; planning-skill ROLE_ACTIVATION keeps the C029 route dispatch '
                  'and takes the 10.0.1 governance wording (C034 retired); WORK_ITEM_GATHERING appends the 10.0.1 '
                  'inline hand-back sentence; Claude Code binding unchanged (C035 kept)'))
    return items


def records():
    shutil.copyfile(ROOT / '.agents/skills/bootstrap-agentic-system/CHANGELOG.md',
                    MAINT / 'changelogs/bootstrap-agentic-system.CHANGELOG.md')

    reg_path = MAINT / 'decision-register.json'
    dump(reg_path, decisions_update(load(reg_path)))

    a_path = MAINT / 'agentic-system.answers.yaml'
    a = load(a_path)
    a['bootstrap']['contract_applied_through'] = '10.0.1'
    a['decisions'] = decisions_update(a['decisions'])

    plan = load(MAINT / 'preservation-plan.json')
    for copy in plan['copies']:
        if copy['output'] in SKILLS:
            for slot in ('ROLE_ACTIVATION', 'WORK_ITEM_GATHERING'):
                a['slots'][slot]['value'][copy['output']] = copy['values'][slot]
    a['slots']['ROLE_ACTIVATION']['source'] = (f'user-approved {DATE} maintenance (10.0.0 skill route; C029); 10.0.1 '
                                               'governance statement taken upstream, C034 retired')
    a['slots']['ROLE_ACTIVATION']['evidence'] = EVIDENCE
    a['slots']['WORK_ITEM_GATHERING']['source'] = (a['slots']['WORK_ITEM_GATHERING']['source'].split('; 10.0.1')[0]
                                                   + f'; 10.0.1 inline hand-back sentence appended {DATE}')

    hashes = {t: sha_text(SOURCES / t) for t in CHANGED_TEMPLATES}
    for g in a['generated']:
        if g.get('template') in hashes:
            g['source_sha256'] = hashes[g['template']]
    have = {g['path'] for g in a['generated']}
    for p in SCRIPTS:
        if p not in have:
            a['generated'].append(dict(path=p, kind='provenance', environments=['copilot', 'claude-code'],
                                       template='authored', source_sha256='not-applicable',
                                       baseline=str(Path('.agentic-system-maintenance/.baseline') / p)))

    a['maintenance_decisions']['upgrade_10_0_1_2026_10_16'] = dict(
        approved=True, date=DATE, evidence=EVIDENCE, mode='upgrade', installed_bootstrap='10.0.1',
        installed_maintainer='4.0.0', applied_through='10.0.1',
        renderer=SCRIPTS[0], records=SCRIPTS[1],
        merge='MINE == BASE for every touched file (only baselined drift: protected C011/C012 knowledge files, untouched); every 10.0.1 region taken upstream; no conflicts',
        rerendered=RERENDERED, changed=AUTHORED,
        register=dict(added=[], retired=['C034'], rechecked=['C029', 'C030', 'C035']),
        deferred=[UNVERIFIED + ' (user step)'])

    a['preservation']['plan_sha256'] = sha(MAINT / 'preservation-plan.json')
    a['preservation']['environment_audit_result'] = ('blocked only by the inherited read/problems diagnostics source '
                                                      'gap in the Claude Code Implementor and Integration Tester '
                                                      'outputs; Bootstrap 10.0.1 adds no diagnostics slot')
    dump(a_path, a)

    compat = MAINT / 'compatibility.md'
    text = compat.read_text()
    if '## 2026-10-16: Bootstrap 10.0.1' not in text:
        compat.write_text(text.rstrip('\n') + '\n\n## 2026-10-16: Bootstrap 10.0.1 entrypoint verification\n\n'
                          '| Evidence source | Established behavior | Local result |\n| --- | --- | --- |\n'
                          '| Bootstrap 10.0.1 `platform-compatibility.md` entrypoint verification | Per route, exercise '
                          'the session memory append and event log writing the session files, not a client memory '
                          'feature; on the skill route, confirm a planning skill asks for the Planning Session ID '
                          'before retrieval and continues from evidence intake into the Planner gates without stopping '
                          '| Not exercised on either surface (Claude Code 2.1.300 unchanged; Copilot unchanged); '
                          'added to both client guides as Verify once step 2; status `unverified` |\n')
    print('records updated')


def baseline():
    a = load(MAINT / 'agentic-system.answers.yaml')
    drift = set(a['maintenance_decisions']['upgrade_8_0_2026_10_11']['known_baseline_drift'])
    refreshed = 0
    for g in a['generated']:
        if g['path'] in drift: continue
        src, dst = ROOT / g['path'], ROOT / g['baseline']
        if not src.exists(): continue
        if not dst.exists() or dst.read_bytes() != src.read_bytes():
            dst.parent.mkdir(parents=True, exist_ok=True); shutil.copyfile(src, dst); refreshed += 1
            print('  ' + g['path'])
    print(f'baseline refreshed: {refreshed} files')


if __name__ == '__main__':
    baseline() if '--baseline' in sys.argv else records()
