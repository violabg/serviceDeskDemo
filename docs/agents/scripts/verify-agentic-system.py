#!/usr/bin/env python3
"""Independent, dependency-free structural validation of this Bootstrap installation.

The generated YAML frontmatter and TOML registrations deliberately use JSON-compatible
scalar/array values. This checks that constrained syntax and decoded bodies, not every
possible YAML/TOML construct. It is not a substitute for actual native client execution.
"""
import hashlib
import json
import re
import sys
import tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]
DOCS=ROOT/'docs/agents'
ERRORS=[]
CHECKS=[]

def check(condition, label):
    (CHECKS if condition else ERRORS).append(label)

def digest(data):
    return hashlib.sha256(data.encode() if isinstance(data,str) else data).hexdigest()

def pairs(items):
    result={}
    for k,v in items:
        if k in result: raise ValueError('Duplicate JSON key: '+k)
        result[k]=v
    return result

def load(path):
    return json.loads(path.read_text(),object_pairs_hook=pairs)

def normalized(s):
    return s.replace('\r\n','\n').replace('\r','\n')

def decode_md(s, canonical=False):
    if not s.startswith('---\n'): raise ValueError('Missing frontmatter')
    head,body=s[4:].split('\n---\n',1)
    fields={}
    for line in head.splitlines():
        if not line.strip(): continue
        name,raw=line.split(':',1)
        if name in fields: raise ValueError('Duplicate frontmatter key')
        raw=raw.strip()
        if canonical:
            raw=re.sub(r'^\[agent(?=[,\]])','["agent"',raw)
        try: value=json.loads(raw)
        except json.JSONDecodeError:
            if not canonical or not re.fullmatch(r'[A-Za-z][A-Za-z0-9_-]*',raw): raise
            value=raw
        fields[name]=value
    return fields,body

def decode_toml(s):
    # Every emitted TOML value is a JSON-compatible basic string, boolean, or string array.
    root={}; current=root
    for line in s.splitlines():
        if not line.strip(): continue
        if line.startswith('['):
            match=re.fullmatch(r'\[mcp_servers\.("(?:[^"\\]|\\.)+")\]',line)
            if not match: raise ValueError('Unsupported/invalid TOML table: '+line)
            name=json.loads(match[1]); servers=root.setdefault('mcp_servers',{})
            if name in servers: raise ValueError('Duplicate TOML table')
            current={}; servers[name]=current
        else:
            key,raw=line.split(' = ',1)
            if not re.fullmatch(r'[a-z_]+',key) or key in current: raise ValueError('Invalid/duplicate TOML key')
            # JSON escape forms are a subset of TOML basic-string escapes. Forbid lone surrogates.
            value=json.loads(raw)
            if isinstance(value,str): value.encode('utf-8')
            current[key]=value
    return root

def expected_copy(source,rec):
    declared=set(re.findall(r'\{\{([A-Z0-9_]+)\}\}',source))
    if set(rec['values'])-declared: raise ValueError('Undeclared value')
    fills={(b['slot'],b['occurrence']):b['value'] for b in rec.get('blocks',[])}
    if len(fills)!=len(rec.get('blocks',[])): raise ValueError('Duplicate block recipe')
    seen={}; applied=set()
    pattern=re.compile(r'^<!-- CANONICAL-TEMPLATE-SLOT: ([A-Z0-9_]+) START replaces=(?:none|sha256:[a-f0-9]+ lines=\d+) -->\n(.*?)^<!-- CANONICAL-TEMPLATE-SLOT: \1 END -->\n?',re.M|re.S)
    def block(m):
        name=m[1]; idx=seen.get(name,0); seen[name]=idx+1; key=(name,idx)
        if 'CANONICAL-TEMPLATE-SLOT' in m[2]: raise ValueError('Nested/unmatched marker')
        if key in fills:
            applied.add(key)
            return fills[key]+'\n' if fills[key] else ''
        return m[2]
    text=pattern.sub(block,source)
    if applied!=set(fills): raise ValueError('Recipe block not found')
    if 'CANONICAL-TEMPLATE-SLOT' in text: raise ValueError('Unmatched marker')
    values=rec['values']
    if '"{{APPROVED_MCP_TOOLS}}"' in text:
        names=values['APPROVED_MCP_TOOLS']
        if not isinstance(names,list) or any(not isinstance(x,str) or not x for x in names): raise ValueError('MCP item is not string')
        replacement=', '.join(json.dumps(x) for x in names)
        if values.get('PLATFORM_TOOLS')=='': text=text.replace('{{PLATFORM_TOOLS}}, "{{APPROVED_MCP_TOOLS}}"',replacement)
        text=text.replace(', "{{APPROVED_MCP_TOOLS}}"',', '+replacement if replacement else '')
        text=text.replace('"{{APPROVED_MCP_TOOLS}}"',replacement)
    return re.sub(r'\{\{([A-Z0-9_]+)\}\}',lambda m: values[m[1]],text)

def main():
    answers=load(DOCS/'agentic-system.answers.yaml')
    plan=load(DOCS/'preservation-plan.json')
    adapters=load(DOCS/'native-adapters.json')
    check(answers['version']==2,'Answers version 2 (JSON-compatible YAML 1.2)')
    check(plan['version']==1,'Preservation recipe version 1')
    check(digest((DOCS/'preservation-plan.json').read_bytes())==answers['preservation']['plan_sha256'],'Preservation recipe hash')
    inventory={i['path']:i for i in answers['generated']}
    check(len(inventory)==len(answers['generated']),'Unique primary inventory paths')
    expected={i['path'] for i in inventory.values() if i['kind']=='canonical-copy'}
    check(set(plan['canonical_outputs'])==expected=={r['output'] for r in plan['copies']} and len(plan['copies'])==len(expected),'Complete canonical coverage')
    for rec in plan['copies']:
        path=rec['output']
        source=normalized((DOCS/'sources'/rec['template']).read_text())
        actual=normalized((ROOT/path).read_text())
        check(digest(source)==rec['sha256'],'Source hash: '+path)
        wanted=expected_copy(source,rec)
        check(actual==wanted,'Exact canonical preservation: '+path)
        check(not re.search(r'CANONICAL-TEMPLATE-SLOT|\{\{[A-Z0-9_]+\}\}',actual),'Resolved slots/markers: '+path)
        if actual.startswith('---\n'):
            meta,body=decode_md(actual,canonical=True)
            if 'tools' in meta: check(isinstance(meta['tools'],list) and all(isinstance(t,str) and t for t in meta['tools']) and len(meta['tools'])==len(set(meta['tools'])),'String-only unique tools: '+path)
        for name,value in rec['values'].items():
            check(answers['slots'][name]['value'][path]==value,'Answer/recipe agreement: '+path+' '+name)
    for adapter in adapters:
        canonical_meta,canonical_body=decode_md((ROOT/adapter['canonical_copy']).read_text(),True)
        text=(ROOT/adapter['path']).read_text()
        if adapter['format']=='toml':
            meta=decode_toml(text);body=meta['developer_instructions']
            check(all(k in meta for k in ['name','description','developer_instructions']),'Codex required metadata: '+adapter['path'])
            check(meta['sandbox_mode']==('read-only' if adapter['role']=='ask' else 'workspace-write'),'Codex sandbox choice: '+adapter['path'])
            wanted_model='gpt-6-luna' if adapter['role']=='vision' else None
            check(meta.get('model')==wanted_model,'Codex exact model/inheritance: '+adapter['path'])
            for server,config in meta['mcp_servers'].items():
                tool_items=answers['capabilities']['codex'][adapter['role']]
                names=sorted(k.split('/',1)[1] for k in tool_items if k.startswith(server+'/'))
                check(config['enabled']==bool(names) and sorted(config.get('enabled_tools',[]))==names,'Codex exact MCP filter: '+adapter['path']+' '+server)
        else:
            meta,body=decode_md(text)
            wanted=dict(canonical_meta)
            wanted['name']='demo-'+(adapter['role'] if adapter['role']!='skill' else canonical_meta['name'])
            if adapter['role']=='vision':
                wanted['disable-model-invocation']=False
                wanted['model']='GPT-6 Luna (copilot)'
                wanted['tools']=canonical_meta['tools']+['web','github/*']
            check(meta==wanted,'Only approved native metadata changes: '+adapter['path'])
        check(body==canonical_body and digest(body)==adapter['body_sha256'],'Complete decoded body: '+adapter['path'])
        if adapter['role']=='skill':
            check('tools' not in meta,'No skill tools frontmatter: '+adapter['path'])
            check((ROOT/adapter['path']).parent.name==meta['name'],'Skill directory/name match: '+adapter['path'])
    for path,item in inventory.items():
        actual=ROOT/path; baseline=ROOT/item['baseline']
        check(actual.is_file() and baseline.is_file(),'Primary and baseline exist: '+path)
        if actual.is_file() and baseline.is_file(): check(actual.read_bytes()==baseline.read_bytes(),'Pristine baseline equality: '+path)
        check(not str(actual.resolve()).startswith('/private/tmp'),'No denied temporary path: '+path)
    baseline_files={str(p.relative_to(DOCS/'.baseline')) for p in (DOCS/'.baseline').rglob('*') if p.is_file()}
    check(baseline_files==set(inventory),'No orphan or missing baseline entries')
    roles=['planner','implementor','direct-implementor','integration-tester','knowledge-builder','ask','vision']
    for env in ['codex','copilot']:
        names={a['role'] for a in adapters if a['environment']==env}
        check(names==set(roles),'Seven-role roster: '+env)
        planner=(DOCS/f'canonical/{env}/agents/demo-planner.agent.md').read_text()
        check(all(x in planner for x in ['docs/agents/knowledge/README.md','docs/agents/plan-schema.md','When to read','never bulk-load','Schema compliance overrides Markdown cleanup']),'Planner schema and index gates: '+env)
        check(answers['environments'][env]['compatibility']=='unverified','No false native compatibility claim: '+env)
    root=(ROOT/'AGENTS.md').read_text()
    check(len(root.splitlines())<80,'Root router under 80 lines')
    for path in ['docs/agents/knowledge/README.md','docs/agents/context-glossary.md','docs/agents/plan-schema.md','docs/agents/artifact-gates.md','docs/agents/agentic-system-manifest.md']:
        check(path in root and (ROOT/path).exists(),'Root navigation path: '+path)
    check(len([a for a in adapters if a['role']=='skill'])==5,'Exactly five native generated skills')
    for schema in ['plan-schema','test-plan-schema','artifact-gates']:
        check((DOCS/f'{schema}.md').read_bytes()==(DOCS/f'sources/templates/{schema}.md').read_bytes(),'Unmodified shipped schema: '+schema)
    index=(DOCS/'knowledge/README.md').read_text()
    check(all(x in index for x in ['Purpose','Token Budget Rule','When to read','Do not read when','Selection Workflow','Artifact Record']),'Existing index retains required schema shape')
    # Verify path-based contracts in a disposable fixture, never in actual sessions.
    with tempfile.TemporaryDirectory(prefix='.bootstrap-verification-',dir=str(DOCS)) as tmp:
        fixture=Path(tmp); current=fixture/'sessions'/'bug-123'; artifacts=current/'artifacts'; artifacts.mkdir(parents=True)
        for name in ['session-memory.md','session-log.md','execution-report.md']:
            p=current/name;p.write_text('first\n');p.write_text(p.read_text()+'second\n')
            check(p.read_text()=='first\nsecond\n','Fixture file contract: '+name)
        visual=artifacts/'visual';visual.mkdir();(visual/'screen.slimui').write_text('canvas w:100 h:100\n')
        ref={'session_id':'bug-123','image':'screen.png','artifact_path':'artifacts/visual/screen.slimui','format':'SlimUI v1.0'}
        (visual/'screen.json').write_text(json.dumps(ref)); got=load(visual/'screen.json')
        check((current/got['artifact_path']).read_text().startswith('canvas'),'Fixture SlimUI/JSON reference contract')
        check(sorted(p.name for p in (fixture/'sessions').iterdir())==['bug-123'],'Fixture confined to owning session')
    count=len(CHECKS)
    report='# Structural Validation Report\n\n'
    report+='Date: 2026-09-19. Result: **'+('FAIL' if ERRORS else 'PASS')+'** for structural checks.\n\n'
    report+=f'{count} checks passed; {len(ERRORS)} failed. Canonical copies: {len(plan["copies"])}. Native adapters: {len(adapters)}. Primary/baseline files: {len(inventory)}.\n\n'
    report+='Method: independent Python reconstruction of the declared slot recipe, SHA-256 source checks, exact canonical/body comparisons, constrained generated YAML/TOML syntax checks, schema/index/roster checks, baseline equality and a disposable file-contract fixture outside existing sessions. No native model, client handoff or live MCP operation was tested.\n\n'
    report+='The shipped Node verifier could not run: Node was blocked by the current sandbox, including the requested escalation. Git status was similarly unavailable because Git could not read its user configuration. Python verification is the equivalent deterministic comparison allowed by Bootstrap; generated native execution remains **unverified**. General YAML/TOML features outside the emitted JSON-compatible subset were not tested.\n\n'
    report+='Product lint, typecheck, tests and build were skipped because changes are confined to agent-system instructions, scripts and documentation. No product, database or runtime mutation was performed.\n\n'
    if ERRORS: report+='## Failures\n\n'+'\n'.join('- '+x for x in ERRORS)+'\n\n'
    report+='## Passed checks\n\n'+'\n'.join('- '+x for x in CHECKS)+'\n'
    if '--refresh-report' in sys.argv:
        path=DOCS/'validation-report.md';path.write_text(report)
        (DOCS/'.baseline/docs/agents/validation-report.md').write_text(report)
    print(('FAIL' if ERRORS else 'PASS')+f': {count} structural checks passed; {len(ERRORS)} failed.')
    for e in ERRORS[:35]: print('FAIL:',e)
    return 1 if ERRORS else 0

if __name__=='__main__':
    try: sys.exit(main())
    except Exception as exc:
        print(type(exc).__name__+': '+str(exc));sys.exit(2)
