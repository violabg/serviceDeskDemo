# /// script
# requires-python = ">=3.11"
# dependencies = ["PyYAML==6.0.2"]
# ///
"""Validate shared agent contracts and project MCP parity without accessing sessions."""
from pathlib import Path
import argparse
import hashlib
import json
import re
import sys
import tomllib
import yaml

ROOT = Path(__file__).resolve().parents[2]
ANSWERS = ROOT / 'docs/agents/agentic-system.answers.yaml'


def checked_path(relative):
    path = Path(relative)
    if path.is_absolute() or '..' in path.parts or 'sessions' in path.parts:
        raise ValueError(f'Forbidden validation path: {relative}')
    resolved = (ROOT / path).resolve()
    if not resolved.is_relative_to(ROOT) or 'sessions' in resolved.relative_to(ROOT).parts:
        raise ValueError(f'Forbidden validation target: {relative}')
    return resolved


def frontmatter(path):
    text = path.read_text()
    if not text.startswith('---\n'):
        raise ValueError(f'Missing frontmatter: {path.relative_to(ROOT)}')
    raw, body = text[4:].split('\n---\n', 1)
    return yaml.safe_load(raw), body, raw


def projection(answers):
    source = json.loads(checked_path(answers['platform']['mcp_source']).read_text())
    if source.get('inputs'):
        raise ValueError('MCP inputs require an explicit Codex environment mapping before projection')
    aliases = answers['platform']['mcp_aliases']
    if set(aliases) != set(source['servers']):
        raise ValueError('Update approved MCP aliases for added/removed source servers')
    result = {}
    for name, server in source['servers'].items():
        target = aliases[name]
        if not re.fullmatch(r'[A-Za-z0-9_-]+', target) or target in result:
            raise ValueError(f'Invalid or duplicate MCP alias: {target}')
        allowed = {'type', 'url', 'command', 'args', 'env', 'cwd', 'gallery', 'version'}
        if set(server) - allowed:
            raise ValueError(f'Unsupported MCP fields for {name}; map explicitly, do not silently drop')
        if '${' in json.dumps(server):
            raise ValueError(f'Unresolved VS Code interpolation for {name}; map explicitly')
        transport = server.get('type')
        if transport == 'http' and server.get('url'):
            item = {'url': server['url']}
        elif transport == 'stdio' and server.get('command'):
            item = {key: server[key] for key in ('command', 'args', 'env', 'cwd') if key in server}
        else:
            raise ValueError(f'Unsupported transport for {name}')
        overrides = answers['platform'].get('mcp_codex_overrides', {}).get(target, {})
        if set(overrides) - {'bearer_token_env_var', 'env_http_headers', 'startup_timeout_sec', 'tool_timeout_sec'}:
            raise ValueError(f'Unsupported Codex override for {target}; preserve transport parity and all-tool access')
        item.update(overrides)
        result[target] = item
    return result


def toml_value(value):
    if isinstance(value, dict):
        return '{ ' + ', '.join(f'{json.dumps(k)} = {toml_value(v)}' for k, v in value.items()) + ' }'
    if isinstance(value, (str, list, bool, int, float)):
        return json.dumps(value, ensure_ascii=False)
    raise ValueError('Unsupported TOML value')


def sync_mcp(answers):
    expected = projection(answers)
    target = ROOT / '.codex/config.toml'
    if target.exists():
        existing = tomllib.loads(target.read_text())
        if set(existing) - {'mcp_servers'}:
            raise ValueError('Refusing to overwrite non-MCP Codex configuration; merge explicitly')
        extra = set(existing.get('mcp_servers', {})) - set(expected)
        if extra:
            raise ValueError('Refusing to remove extra project MCP servers; update source inventory first')
    lines = ['# Generated from .vscode/mcp.json and approved Codex overrides in the answers file.',
             '# Regenerate: uv run .agents/scripts/check-agent-system.py --sync-mcp',
             '# Other user/plugin MCP servers are inherited. Credentials are never stored here.', '']
    for name, settings in expected.items():
        lines.append(f'[mcp_servers.{name}]')
        lines.extend(f'{key} = {toml_value(value)}' for key, value in settings.items())
        lines.append('')
    target.parent.mkdir(exist_ok=True)
    target.write_text('\n'.join(lines))
    print('Updated .codex/config.toml from the approved repository MCP source')


def check(answers, baseline=False):
    errors = []
    def require(condition, message):
        if not condition:
            errors.append(message)
    platform = answers['platform']
    require(set(platform['targets']) == {'github-copilot', 'codex'}, 'Dual-platform support missing')
    require(platform['skill_root'] == '.agents/skills', 'Shared skills must remain in .agents/skills')
    config = tomllib.loads((ROOT / '.codex/config.toml').read_text())
    require(config.get('mcp_servers') == projection(answers), 'MCP projection drift; run --sync-mcp after reviewing source changes')
    paths = [row['path'] for row in answers['generated']]
    require(len(paths) == len(set(paths)), 'Duplicate generated entries')
    for row in answers['generated']:
        path = checked_path(row['path'])
        base = checked_path(row['baseline'])
        require(path.is_file(), f'Missing generated file: {row["path"]}')
        require(row['baseline'] == 'docs/agents/.baseline/' + row['path'], f'Incorrect baseline mapping: {row["path"]}')
        require(base.is_file(), f'Missing baseline: {row["path"]}')
        if baseline and path.is_file() and base.is_file():
            normalize = lambda text: '\n'.join(line.rstrip() for line in text.splitlines()).rstrip()
            require(normalize(path.read_text()) == normalize(base.read_text()), f'Baseline drift: {row["path"]}')
    for old, new in platform['relocations'].items():
        require(not checked_path(old).exists(), f'Retired runtime path restored: {old}')
        require(not checked_path('docs/agents/.baseline/' + old).exists(), f'Retired baseline path remains: {old}')
        require(new in paths, f'Relocation destination not recorded: {new}')
    for name, mapping in platform['roles'].items():
        shared = checked_path(mapping['shared'])
        copilot = checked_path(mapping['github-copilot'])
        codex = checked_path(mapping['codex'])
        for p in (shared, copilot, codex):
            require(p.relative_to(ROOT).as_posix() in paths, f'Unrecorded role file: {p}')
        front, body, raw = frontmatter(copilot)
        require(all(isinstance(t, str) for t in front['tools']), f'Invalid Copilot tools: {name}')
        require(hashlib.sha256(raw.encode()).hexdigest() == mapping['copilot_frontmatter_sha256'], f'Protected Copilot settings changed: {name}')
        require(mapping['shared'] in body and '.agents/platforms/copilot.md' in body, f'Copilot contract routing missing: {name}')
        data = tomllib.loads(codex.read_text())
        require(data.get('name') == name and bool(data.get('description')), f'Invalid Codex role metadata: {name}')
        instructions = data.get('developer_instructions', '')
        require(mapping['shared'] in instructions and '.agents/platforms/codex.md' in instructions, f'Codex contract routing missing: {name}')
        require(set(data) == {'name', 'description', 'developer_instructions'}, f'Unexpected Codex inheritance override: {name}')
        text = shared.read_text()
        for stale in ('mcp_github_mcp_s2_issue_read', '#tool:', '`registry/capabilities.yaml`', '`read/problems`', 'built-in bounded Copilot'):
            require(stale not in text, f'Stale host binding {stale} in {name}')
        require('CANONICAL-TEMPLATE-SLOT' not in text, f'Unresolved template slot: {name}')
    for name in platform['shared_skills']:
        path = checked_path(f'.agents/skills/{name}/SKILL.md')
        front, body, _ = frontmatter(path)
        require(front.get('name') == name and 'tools' not in front, f'Invalid shared skill: {name}')
        require(not (ROOT / f'.github/skills/{name}/SKILL.md').exists(), f'Duplicate skill: {name}')
        require('#tool:' not in body and 'mcp_github_mcp_s2_issue_read' not in body, f'Host-specific skill body: {name}')
        metadata = yaml.safe_load((path.parent / 'agents/openai.yaml').read_text())
        require(metadata.get('policy', {}).get('allow_implicit_invocation') is False, f'Explicit invocation policy missing: {name}')
        if name.startswith('plan-'):
            require('Planner-only' in body and '.agents/roles/demo-planner.md' in body, f'Planner activation missing: {name}')
    for directory in ('.agents/roles', '.agents/platforms', '.codex/agents'):
        for path in (ROOT / directory).iterdir():
            if path.is_file() and path.suffix in {'.md', '.toml'}:
                require(path.relative_to(ROOT).as_posix() in paths, f'Unrecorded generated file: {path}')
    require(len((ROOT / 'AGENTS.md').read_text().splitlines()) < 80, 'Root router exceeds 80 lines')
    if errors:
        raise ValueError('\n'.join(errors))
    print(f'PASS: {len(platform["roles"])} role pairs, {len(platform["shared_skills"])} shared skills, {len(projection(answers))} MCP servers, {len(paths)} baseline mappings')
    print('Live MCP authentication/tool exposure and host agent invocation are separate runtime checks.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sync-mcp', action='store_true', help='Write only the project MCP projection, then exit')
    parser.add_argument('--baseline', action='store_true', help='Also compare generated files with their approved baselines')
    args = parser.parse_args()
    try:
        answers = yaml.safe_load(ANSWERS.read_text())
        if args.sync_mcp:
            sync_mcp(answers)
        else:
            check(answers, args.baseline)
    except (ValueError, KeyError, OSError, yaml.YAMLError) as exc:
        print(f'FAIL: {exc}', file=sys.stderr)
        sys.exit(1)
