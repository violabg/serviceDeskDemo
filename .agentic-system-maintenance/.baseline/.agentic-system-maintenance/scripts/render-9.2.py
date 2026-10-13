#!/usr/bin/env python3
"""Maintenance renderer for the approved 2026-10-13 upgrade, Bootstrap 8.0.0 -> 9.2.0.

Recipe-driven: slot values and blocks come from the recorded preservation-plan.json; only the
9.x slot decisions approved in this run are added or retired. Environments: copilot, claude-code.

Three-way guard: a runtime file is overwritten only when its current bytes equal its baseline
copy (MINE == BASE). Native adapters keep their recorded frontmatter and take the new canonical body.
Usage: render-9.2.py [--dry-run]
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
RECIPE = json.loads((MAINT / 'preservation-plan.json').read_text())
ADAPTERS = json.loads((MAINT / 'native-adapters.json').read_text())
DRY = '--dry-run' in sys.argv

B = 'the active environment binding (`docs/agents/bindings/<environment>.md`, for the environment the root router resolved)'
S = 'sessions/<planning-session-id>'
RETIRED = {'VISION_AGENT_NAME', 'VISION_INVOCATION'}

# Approved 2026-10-13 decisions: Q1 Markdown evidence, Q2 inline (copilot) / haiku delegate (claude-code)
# resolved in the bindings, Q3 environment-neutral bodies pointing to the bindings (C026).
NEW = {
    'IMAGE_INSPECTION': 'Inspect this image with the image-inspection procedure in ' + B + ', under the visual-evidence rules in `docs/agents/integration-policy.md`. Read the image bytes from a local file path; for a remote issue image URL, fetch the bytes with that binding\'s web-fetch operation only when the URL is publicly readable and the operation returns image input, otherwise ask the user to save the image locally and give its path. Delegate the inspection only when that binding names an approved delegate model, and never invent a named delegate or model. Never describe an image from its URL, filename, or alt text alone. Use the following task context:',
    'ROLE_HANDOFF': 'Then tell the user to start Implementor in a new conversation with fresh context, and print the Implementor handoff step from ' + B + ' with the approved Planning Session ID filled in. Never continue implementation in this planning conversation.',
    'ROLE_ACTIVATION': 'Run it only when this conversation is already working as the Planner role (`demo-planner`; ' + B + ' names its native registration and start step). Otherwise stop and tell the user that exact Planner start step from the binding. Both selected environments select the main-session role natively; the binding records whether the Planner tool limits are runtime-enforced.',
    'QUESTION_TOOL': 'foreground question route',
    'CLIENT_GUIDE_ROOT': 'docs/agentic-system/',
}
SLOT_TARGETS = {
    'IMAGE_INSPECTION': ['planner', 'direct-implementor'],
    'ROLE_HANDOFF': ['planner'],
    'QUESTION_TOOL': ['planner'],
}
VISUAL_ROW = ('Inspect each image under the visual-evidence rules in `docs/agents/integration-policy.md`, with the image-inspection procedure in '
              + B + ' on a local file path. Fetch a remote issue image only when publicly readable; otherwise ask the user for a local copy. '
              'Never describe an image from its URL alone. Store one Markdown visual-evidence artifact per image at `'
              + S + '/artifacts/<image-name>_visual_evidence.md`, referencing the original image.')

WRITTEN, COPIES = [], []


def sha(s):
    return hashlib.sha256(s.encode() if isinstance(s, str) else s).hexdigest()


def norm(s):
    return s.replace('\r\n', '\n').replace('\r', '\n')


def guard(path):
    p, b = ROOT / path, BASE / path
    if not p.exists():
        return
    if not b.exists():
        raise SystemExit('Refusing to overwrite unbaselined file: ' + path)
    if norm(p.read_text()) != norm(b.read_text()):
        raise SystemExit('Refusing to overwrite customized file (MINE != BASE): ' + path)


def write(path, text):
    guard(path)
    if (ROOT / path).exists() and (ROOT / path).read_text() == text:
        return
    WRITTEN.append(path)
    if not DRY:
        (ROOT / path).write_text(text)


def fill(source, values, blocks):
    # Same semantics as the shipped verify-canonical-copies.mjs: named, occurrence-bound slots only.
    out, region, counts, used = [], None, {}, set()
    for line in norm(source).split('\n'):
        start = re.fullmatch(r'<!-- CANONICAL-TEMPLATE-SLOT: ([A-Z0-9_]+) START replaces=(?:none|sha256:[a-f0-9]+ lines=\d+) -->', line)
        end = re.fullmatch(r'<!-- CANONICAL-TEMPLATE-SLOT: ([A-Z0-9_]+) END -->', line)
        if start:
            if region:
                raise ValueError('nested slot')
            occurrence = counts.get(start[1], 0)
            counts[start[1]] = occurrence + 1
            region = [start[1], occurrence, []]
        elif end:
            if not region or region[0] != end[1]:
                raise ValueError('bad slot end')
            matches = [(i, b) for i, b in enumerate(blocks) if (b['slot'], b['occurrence']) == (region[0], region[1])]
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
        s = s.replace(', "{{APPROVED_MCP_TOOLS}}"', ', ' + tools if tools else '')
        s = s.replace('"{{APPROVED_MCP_TOOLS}}"', tools)
    s = re.sub(r'\{\{([A-Z0-9_]+)\}\}', lambda m: values[m[1]], s)
    if re.search(r'\{\{[A-Z0-9_]+\}\}', s):
        raise ValueError('unfilled slot')
    return s


def role_of(output):
    m = re.search(r'/demo-([a-z-]+)\.agent\.md$', output)
    return m[1] if m else None


def capability_bindings(role, recorded):
    rows = {}
    for line in recorded.split('\n')[2:]:
        m = re.fullmatch(r'\| `#capability:([a-z-]+)` \| (.*) \|', line)
        rows[m[1]] = m[2]
    side = (SKILL / f'templates/agents/{role}.capabilities.yaml').read_text()
    out = ['| Capability | Binding |', '| --- | --- |']
    for token in re.findall(r'- token: (\S+)', side):
        value = rows[token] if role == 'ask' or token != 'visual-evidence' else VISUAL_ROW
        out.append('| `#capability:' + token + '` | ' + value + ' |')
    return '\n'.join(out)


def values_for(copy, declared):
    role = role_of(copy['output'])
    values = {k: v for k, v in copy['values'].items() if k not in RETIRED}
    if 'CAPABILITY_BINDINGS' in values:
        values['CAPABILITY_BINDINGS'] = capability_bindings(role, values['CAPABILITY_BINDINGS'])
    for name in declared - set(values):
        if name not in NEW:
            raise SystemExit('Unresolved new slot ' + name + ' for ' + copy['output'])
        targets = SLOT_TARGETS.get(name)
        if targets is not None and role not in targets:
            raise SystemExit('Slot ' + name + ' not approved for ' + copy['output'])
        values[name] = NEW[name]
    missing = declared - set(values)
    if missing:
        raise SystemExit('Missing values ' + str(missing) + ' for ' + copy['output'])
    return {k: values[k] for k in sorted(declared)}


def main():
    bodies = {}
    for copy in RECIPE['copies']:
        source = norm((SKILL / copy['template']).read_text())
        declared = set(re.findall(r'\{\{([A-Z0-9_]+)\}\}', source))
        values = values_for(copy, declared)
        rendered = fill(source, values, copy['blocks'])
        write(copy['output'], rendered)
        COPIES.append(dict(template=copy['template'], sha256=sha(source), output=copy['output'], values=values, blocks=copy['blocks']))
        if rendered.startswith('---\n'):
            bodies[copy['output']] = rendered[4:].split('\n---\n', 1)[1]

    for adapter in ADAPTERS:
        body = bodies.get(adapter['canonical_copy'])
        if body is None:
            continue
        current = (ROOT / adapter['path']).read_text()
        head = current[:4] + current[4:].split('\n---\n', 1)[0] + '\n---\n'
        write(adapter['path'], head + body)
        adapter['body_sha256'] = sha(body)

    if DRY:
        print('\n'.join(WRITTEN))
        print('DRY RUN:', len(WRITTEN), 'files would change;', len(COPIES), 'canonical copies rendered')
        return
    recipe = dict(version=1, canonical_outputs=[c['output'] for c in COPIES], copies=COPIES)
    (MAINT / 'preservation-plan.json').write_text(json.dumps(recipe, ensure_ascii=False, indent=2) + '\n')
    (MAINT / 'native-adapters.json').write_text(json.dumps(ADAPTERS, ensure_ascii=False, indent=2) + '\n')
    print('Rendered', len(WRITTEN), 'changed files;', len(COPIES), 'canonical copies.')


if __name__ == '__main__':
    main()
