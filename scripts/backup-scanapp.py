#!/usr/bin/env python3
"""Create a verified local backup of repository history and private operating records."""
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
import argparse
import hashlib
import json
import subprocess
import tarfile

ROOT = Path(__file__).resolve().parents[1]


def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args])


def backup(label='daily'):
    now = datetime.now(ZoneInfo('America/Los_Angeles'))
    parent = ROOT / '_backups' / now.strftime('%Y-%m-%d')
    if label == 'daily' and parent.exists():
        for path in sorted(parent.glob('*/manifest.json'), reverse=True):
            record = json.loads(path.read_text())
            if record.get('label') == 'daily' and record.get('verified'):
                print(json.dumps({'status': 'already_backed_up_today', 'manifest': str(path)}))
                return path
    dest = parent / (now.strftime('%H%M%S-%f') + '-' + label)
    dest.mkdir(parents=True, mode=0o700)
    bundle = dest / 'repository.bundle'
    subprocess.run(['git', '-C', str(ROOT), 'bundle', 'create', str(bundle), '--all'], check=True)
    subprocess.run(['git', '-C', str(ROOT), 'bundle', 'verify', str(bundle)], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    # Include the tracked working tree and private operating records. Never sweep
    # the whole checkout, credentials, dependency caches or previous backups.
    paths = {ROOT / p.decode() for p in git('ls-files', '-z').split(b'\0') if p}
    paths.add(Path(__file__).resolve())
    for folder in ['_reports', '_operations']:
        if (ROOT / folder).exists():
            paths.update(p for p in (ROOT / folder).rglob('*') if p.is_file())
    denied = {'.env', '.env.local', '.env.production', 'credentials.json', 'token.json'}
    paths = sorted(p for p in paths if p.is_file() and not p.is_symlink()
                   and p.name not in denied and p.suffix not in {'.pem', '.key'}
                   and not any(part in {'.git', '.aws', 'node_modules', 'vendor'}
                               for part in p.relative_to(ROOT).parts))
    manifest = []
    archive = dest / 'working-tree.tar.gz'
    with tarfile.open(archive, 'w:gz') as tar:
        for p in paths:
            data = p.read_bytes()
            name = str(p.relative_to(ROOT))
            manifest.append({'path': name, 'bytes': len(data),
                             'sha256': hashlib.sha256(data).hexdigest()})
            tar.add(p, arcname=name, recursive=False)
    with tarfile.open(archive) as tar:
        members = tar.getmembers()
        assert len(members) == len(manifest)
        for member, expected in zip(members, manifest):
            assert member.name == expected['path']
            assert hashlib.sha256(tar.extractfile(member).read()).hexdigest() == expected['sha256']
    (dest / 'working-tree.patch').write_bytes(git('diff', '--binary', 'HEAD'))
    record = {'created_at': now.isoformat(), 'label': label, 'verified': True,
              'head': git('rev-parse', 'HEAD').decode().strip(),
              'branch': git('branch', '--show-current').decode().strip(),
              'files': manifest,
              'artifacts': {p.name: {'bytes': p.stat().st_size,
                                    'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
                            for p in [bundle, archive, dest / 'working-tree.patch']}}
    path = dest / 'manifest.json'
    path.write_text(json.dumps(record, indent=2))
    (dest / 'RESTORE.txt').write_text(
        'Private local backup. Do not commit or upload without explicit authorization.\n'
        'Verify artifact SHA-256 values against manifest.json before restore.\n'
        'Clone repository.bundle into a NEW directory to recover Git history.\n'
        'Unpack working-tree.tar.gz into a NEW directory for the saved working files.\n'
        'Do not extract over a live checkout. Compare files and apply selected changes.\n'
        'Credentials and dependencies are intentionally excluded. This is not an off-device backup.\n')
    print(json.dumps({'status': 'verified', 'manifest': str(path), 'files': len(paths)}))
    return path


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--label', default='daily', choices=['daily', 'before-release', 'after-release'])
    backup(parser.parse_args().label)
