#!/usr/bin/env python3
"""Record the approved 2026-10-13 Bootstrap 9.2.0 upgrade in the maintenance records.

Run after render-9.2.py. Syncs answers slots with preservation-plan.json, retires the Vision slots,
records the approved 9.x decisions, role entrypoints and client guides, and repairs the audit
inventories. Baseline refresh is a separate, final step (--baseline) after validation passes.
"""
import hashlib
import json
import os
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MAINT = ROOT / '.agentic-system-maintenance'
SKILL = '.agents/skills/bootstrap-agentic-system'
DATE = '2026-10-13'
EVIDENCE = ('User approved the 2026-10-13 upgrade plan ("Approve all"): Q1 Markdown visual evidence, '
            'Q2 Claude Code haiku image delegate with Copilot inline, Q3 environment-specific steps in the bindings (C026).')
SOURCE = 'user-approved 2026-10-13 maintenance plan; Bootstrap 9.2.0 templates'
GUIDES = ['docs/agentic-system/README.md', 'docs/agentic-system/copilot.md', 'docs/agentic-system/claude-code.md']
VISUAL_ROLES = ['planner', 'implementor', 'direct-implementor', 'knowledge-builder']
# Files changed by this run whose baseline is refreshed after validation.
CHANGED = [
    'AGENTS.md', 'README.md', 'docs/agents/artifact-gates.md', 'docs/agents/integration-policy.md',
    'docs/agents/bindings/copilot.md', 'docs/agents/bindings/claude-code.md',
    'docs/agents/instructions/agent-integrations.md', '.github/instructions/agent-integrations.instructions.md',
    '.claude/rules/agent-integrations.md', '.agents/skills/plan-bug-from-id/SKILL.md', '.agents/skills/plan-user-story-from-id/SKILL.md',
] + [f'docs/agents/canonical/{e}/agents/demo-{r}.agent.md' for e in ['copilot', 'claude-code'] for r in ['planner', 'implementor', 'direct-implementor', 'knowledge-builder']] \
  + [f'.github/agents/demo-{r}.agent.md' for r in ['planner', 'implementor', 'direct-implementor', 'knowledge-builder']] \
  + [f'.claude/agents/demo-{r}-claude.md' for r in ['planner', 'implementor', 'direct-implementor', 'knowledge-builder']] + GUIDES


def load(name):
    return json.loads((MAINT / name).read_text())


def dump(name, data):
    (MAINT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


def sha_file(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def records():
    recipe = load('preservation-plan.json')
    answers = load('agentic-system.answers.yaml')
    answers['bootstrap']['contract_applied_through'] = '9.2.0'

    slots = answers['slots']
    for retired in ['VISION_AGENT_NAME', 'VISION_INVOCATION', 'VISION_MODEL']:
        slots.pop(retired, None)
    for copy in recipe['copies']:
        for name, value in copy['values'].items():
            slot = slots.setdefault(name, dict(value={}, source=SOURCE, evidence=EVIDENCE))
            if slot['value'].get(copy['output']) != value:
                slot['value'][copy['output']] = value
                slot['source'], slot['evidence'] = SOURCE, EVIDENCE
    slots['CLIENT_GUIDE_ROOT']['guides'] = GUIDES
    slots['IMAGE_INSPECTION']['per_environment'] = {
        'copilot': 'inline: the role reads the local image with read/readFile using its own image-capable model; no delegate model approved',
        'claude-code': 'Planner and Direct Implementor: Agent subagent_type general-purpose with model haiku (user-approved); inline Read when Agent, general-purpose or the model parameter is unavailable; roles without Agent inspect inline',
    }

    template_sha = {c['template']: c['sha256'] for c in recipe['copies']}
    for g in answers['generated']:
        if g.get('template') in template_sha:
            g['source_sha256'] = template_sha[g['template']]
        if g['path'] == 'docs/agents/artifact-gates.md':
            g['source_sha256'] = sha_file(SKILL + '/templates/artifact-gates.md')
    known = {g['path'] for g in answers['generated']}
    for guide in GUIDES:
        if guide not in known:
            env = Path(guide).stem
            answers['generated'].append(dict(path=guide, kind='client-guide',
                                             environments=['copilot', 'claude-code'] if env == 'README' else [env],
                                             template='authored from recorded entrypoint and handoff evidence', source_sha256='not-applicable',
                                             baseline='.agentic-system-maintenance/.baseline/' + guide))

    row = next(c for c in recipe['copies'] if c['output'].endswith('claude-code/agents/demo-planner.agent.md'))['values']['CAPABILITY_BINDINGS']
    visual = next(line for line in row.split('\n') if '#capability:visual-evidence' in line).split(' | ', 1)[1][:-2]
    for env in ['copilot', 'claude-code']:
        for role in VISUAL_ROLES:
            answers['capabilities'][env][role]['visual-evidence'] = dict(
                capability='visual-evidence', binding='capability-bindings-table', invocation=visual,
                environment_binding=f'docs/agents/bindings/{env}.md', status='unverified',
                evidence='Rendered CAPABILITY_BINDINGS row (Bootstrap 9.2.0); generated-role execution not exercised.')

    entry = {
        'copilot': dict(method='native main-session selection: Chat view Agent dropdown, demo-<role>', enforcement='tools frontmatter limits the tool picker; path limits instruction-only',
                        handoff='New Chat, choose demo-implementor, send "Resume implementation for Planning Session <planning-session-id>"; agent handoffs buttons not used (carry context)',
                        role_activation='planning skills run only in a demo-planner chat', in_conversation_switch='not documented; start a new chat',
                        question_tool='vscode/askQuestions; limits unverified',
                        evidence='https://code.visualstudio.com/docs/copilot/customization/custom-agents retrieved 2026-10-13', status='unverified'),
        'claude-code': dict(method='native main-session selection: claude --agent demo-<role>-claude', enforcement='registration tools list runtime-enforced; path limits instruction-only',
                            handoff='claude --agent demo-implementor-claude "Resume implementation for Planning Session <planning-session-id>" in a new terminal session',
                            role_activation='planning skills run only in a demo-planner-claude session', in_conversation_switch='not documented; start a new session',
                            question_tool='AskUserQuestion, at most 4 questions per call; larger batches use consecutive calls; availability in --agent sessions unverified',
                            evidence='claude --help 2.1.296; https://code.claude.com/docs/en/sub-agents retrieved 2026-10-13', status='unverified'),
    }
    for env, record in entry.items():
        answers['environments'][env]['role_entrypoints'] = record
    answers['layout']['client_guide_root'] = 'docs/agentic-system/'

    for d in answers['decisions']:
        if d['id'] == 'vision':
            d['value'] = ('retired in every environment (Bootstrap 9.0); Planner and Direct Implementor inspect images themselves: copilot inline, '
                          'claude-code general-purpose subagent with model haiku and inline fallback; one Markdown visual-evidence artifact per image')
            d['evidence'] = EVIDENCE
    ids = {d['id'] for d in answers['decisions']}
    for d in [dict(id='upgrade-9.2-scope', value='Bootstrap 8.0.0 -> 9.2.0: IMAGE_INSPECTION, ROLE_HANDOFF, ROLE_ACTIVATION, Planner QUESTION_TOOL, CLIENT_GUIDE_ROOT, batched clarifications', source='user', evidence=EVIDENCE),
              dict(id='role-entrypoints', value='native main-session selection in both environments; exact steps in the bindings', source='user', evidence=EVIDENCE),
              dict(id='client-guide-root', value='docs/agentic-system/', source='accepted recommendation', evidence=EVIDENCE)]:
        if d['id'] not in ids:
            answers['decisions'].append(d)

    md = answers['maintenance_decisions']
    md['visual_evidence'] = dict(source='user-approved 2026-10-13 upgrade (supersedes 2026-09-25 Luna and 2026-10-11 JSON choices)',
                                 copilot='inline image inspection', claude_code='haiku general-purpose delegate with inline fallback',
                                 artifact='sessions/<planning-session-id>/artifacts/<image-name>_visual_evidence.md (Markdown)', status='unverified in generated-role runtime')
    md['upgrade_9_2_2026_10_13'] = dict(approved=True, date=DATE, evidence=EVIDENCE, mode='upgrade',
                                        renderer='.agentic-system-maintenance/scripts/render-9.2.py', changed=CHANGED,
                                        deferred=['business-logic-gap-detector skill', 'diagnostics tooling slot (no upstream slot in 9.2.0)', 'native role entrypoint verification'])

    plan_sha = hashlib.sha256((MAINT / 'preservation-plan.json').read_bytes()).hexdigest()
    answers['preservation']['plan_sha256'] = plan_sha

    # Context audit: sync installed Bootstrap/Maintainer inventory with the actual trees; add the guides.
    ctx = load('context-audit.json')
    installed = set()
    for root in ['.agents/skills/bootstrap-agentic-system', '.agents/skills/maintain-agentic-system']:
        for d, _, files in os.walk(ROOT / root):
            installed |= {str((Path(d) / f).relative_to(ROOT)) for f in files if f != '.DS_Store'}
    is_installed = lambda p: p.startswith('.agents/skills/bootstrap-agentic-system/') or p.startswith('.agents/skills/maintain-agentic-system/')
    ctx['files'] = [f for f in ctx['files'] if not is_installed(f['output']) or f['output'] in installed]
    listed = {f['output'] for f in ctx['files']}
    ctx['files'] += [dict(output=p, kind='maintenance', references=[]) for p in sorted(installed - listed)]
    for guide in GUIDES:
        if guide not in listed:
            refs = [dict(output=g, when='ordinary') for g in GUIDES[1:]] if guide.endswith('README.md') else []
            ctx['files'].append(dict(output=guide, kind='runtime', references=refs))
    for f in ctx['files']:
        if f['output'] == 'AGENTS.md' and not any(r['output'] == GUIDES[0] for r in f['references']):
            f['references'].append(dict(output=GUIDES[0], when='ordinary'))
    ctx['outputs'] = [f['output'] for f in ctx['files']]
    dump('context-audit.json', ctx)
    answers['layout']['outputs_count'] = len(ctx['outputs'])

    env_audit = load('environment-audit.json')
    for check in env_audit['environments']:
        if check.get('id') == 'retired':
            for literal in ['visual-evidence v1', 'artifacts/visual/', '.slimui']:
                if literal not in check['literals']:
                    check['literals'].append(literal)
    dump('environment-audit.json', env_audit)
    answers['preservation']['environment_audit_sha256'] = hashlib.sha256((MAINT / 'environment-audit.json').read_bytes()).hexdigest()
    answers['preservation']['environment_audit_result'] = ('blocked only by the inherited read/problems diagnostics source gap in the Claude Code '
                                                           'Implementor and Integration Tester outputs; Bootstrap 9.2.0 adds no diagnostics slot')

    register = load('decision-register.json')
    for d in register:
        if d['id'] == 'vision':
            d['value'] = dict(status='retired', image_inspection=answers['slots']['IMAGE_INSPECTION']['per_environment'],
                              artifact='one Markdown visual-evidence artifact per image')
            d['evidence'] = EVIDENCE + ' Supersedes the 2026-09-25 Luna Vision decision.'
    rids = {d['id'] for d in register}
    for d in answers['decisions'][-3:]:
        if d['id'] not in rids:
            register.append(d)
    dump('decision-register.json', register)
    dump('agentic-system.answers.yaml', answers)
    print('Records updated; preservation plan sha', plan_sha)


def baseline():
    for path in CHANGED + ['.agentic-system-maintenance/preservation-plan.json', '.agentic-system-maintenance/native-adapters.json',
                           '.agentic-system-maintenance/agentic-system.answers.yaml', '.agentic-system-maintenance/context-audit.json',
                           '.agentic-system-maintenance/environment-audit.json', '.agentic-system-maintenance/decision-register.json',
                           '.agentic-system-maintenance/compatibility.md', '.agentic-system-maintenance/agentic-system-manifest.md',
                           '.agentic-system-maintenance/changelogs/bootstrap-agentic-system.CHANGELOG.md',
                           '.agentic-system-maintenance/scripts/render-9.2.py', '.agentic-system-maintenance/scripts/finalize-9.2.py']:
        target = MAINT / '.baseline' / path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / path, target)
    print('Baseline refreshed for', len(CHANGED), 'runtime files and the maintenance records')


if __name__ == '__main__':
    baseline() if '--baseline' in sys.argv else records()
