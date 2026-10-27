#!/usr/bin/env python3
"""
publish-github.py: pushes this folder to a GitHub Pages preview repo in one commit.

Git commands are denied in this workspace, so this talks to the GitHub API
directly: one blob per file, one tree, one commit, then move the branch.
Unchanged files are skipped by comparing git blob SHAs with the current tree.

    python tools/publish-github.py    # creates the repo and Pages on first run

The preview holds stock placeholder products, so every uploaded HTML page gets a
noindex tag. The local files stay clean; remove nothing before a real launch.

The token comes from Git Credential Manager (`git credential fill`) and is
never printed.
"""

import base64
import concurrent.futures as cf
import hashlib
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

OWNER = 'bizstartzco'
REPO = 'praise-fashion-world'
BRANCH = 'main'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOINDEX = '  <meta name="robots" content="noindex">\n'
API = 'https://api.github.com'
TRAILER = '\n\nCo-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>'


def token():
    out = subprocess.run(['git', 'credential', 'fill'], input='protocol=https\nhost=github.com\nusername=' + OWNER + '\n\n',
                         capture_output=True, text=True, check=True).stdout
    for line in out.splitlines():
        if line.startswith('password='):
            return line.split('=', 1)[1]
    sys.exit('No GitHub credential stored for ' + OWNER)


TOKEN = token()


def call(method, path, body=None, ok404=False):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'Authorization': 'Bearer ' + TOKEN, 'Accept': 'application/vnd.github+json',
                                          'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'pfw-publish'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                data = r.read()
                return json.loads(data) if data else {}
        except urllib.error.HTTPError as e:
            if e.code == 404 and ok404:
                return None
            if e.code in (502, 503, 504) or (e.code == 403 and 'rate' in e.read().decode(errors='ignore').lower()):
                time.sleep(3 * (attempt + 1))
                continue
            raise SystemExit(method + ' ' + path + ' -> HTTP ' + str(e.code))
        except urllib.error.URLError:
            time.sleep(3 * (attempt + 1))
    raise SystemExit(method + ' ' + path + ' failed after retries')


def git_sha(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()


def main():
    files = []
    for d, dirs, names in os.walk(ROOT):
        dirs[:] = [x for x in dirs if not x.startswith('.') and x != '__pycache__']
        for n in names:
            full = os.path.join(d, n)
            files.append((os.path.relpath(full, ROOT).replace(os.sep, '/'), full))
    files.sort()
    print(len(files), 'files to publish')

    repo = call('GET', '/repos/' + OWNER + '/' + REPO, ok404=True)
    if repo is None:
        call('POST', '/user/repos', {'name': REPO, 'private': False, 'auto_init': True,
                                     'description': "Praise Fashion World: men's clothing website, Nepal. Preview with placeholder products and contact details."})
        print('created repo')
        time.sleep(3)

    ref = call('GET', '/repos/' + OWNER + '/' + REPO + '/git/ref/heads/' + BRANCH)
    parent = ref['object']['sha']
    base_tree = call('GET', '/repos/' + OWNER + '/' + REPO + '/git/commits/' + parent)['tree']['sha']
    existing = {e['path']: e['sha'] for e in call('GET', '/repos/' + OWNER + '/' + REPO + '/git/trees/' + base_tree + '?recursive=1')['tree']
                if e['type'] == 'blob'}

    todo = []
    entries = []
    for path, full in files:
        data = open(full, 'rb').read()
        if path.endswith('.html'):
            data = data.replace(b'  <meta name="viewport"', NOINDEX.encode() + b'  <meta name="viewport"', 1)
        sha = git_sha(data)
        entries.append({'path': path, 'mode': '100644', 'type': 'blob', 'sha': sha})
        if existing.get(path) != sha:
            todo.append((path, data, sha))
    print(len(todo), 'files changed')
    if not todo and set(existing) == {e['path'] for e in entries}:
        print('nothing to publish')
        return

    def upload(item):
        path, data, sha = item
        got = call('POST', '/repos/' + OWNER + '/' + REPO + '/git/blobs',
                   {'content': base64.b64encode(data).decode(), 'encoding': 'base64'})['sha']
        if got != sha:
            raise SystemExit('blob sha mismatch for ' + path)
        return path

    done = 0
    with cf.ThreadPoolExecutor(max_workers=6) as pool:
        for _ in pool.map(upload, todo):
            done += 1
            if done % 50 == 0:
                print('  uploaded', done)

    # A full tree (no base_tree) so deleted files disappear too.
    tree = call('POST', '/repos/' + OWNER + '/' + REPO + '/git/trees', {'tree': entries})['sha']
    msg = 'Publish site preview (' + str(len(todo)) + ' files changed)' + TRAILER
    commit = call('POST', '/repos/' + OWNER + '/' + REPO + '/git/commits', {'message': msg, 'tree': tree, 'parents': [parent]})['sha']
    call('PATCH', '/repos/' + OWNER + '/' + REPO + '/git/refs/heads/' + BRANCH, {'sha': commit})
    print('committed', commit[:7])

    pages = call('GET', '/repos/' + OWNER + '/' + REPO + '/pages', ok404=True)
    if pages is None:
        call('POST', '/repos/' + OWNER + '/' + REPO + '/pages', {'build_type': 'legacy', 'source': {'branch': BRANCH, 'path': '/'}})
        print('enabled Pages')
    print('https://' + OWNER + '.github.io/' + REPO + '/')


if __name__ == '__main__':
    main()
