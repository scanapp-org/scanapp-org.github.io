#!/usr/bin/env python3
"""Check generated HTML links using GitHub Pages file/directory URL semantics."""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []
        self.canonical = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a' and attrs.get('href'):
            self.hrefs.append(attrs['href'])
        if tag == 'link' and 'canonical' in attrs.get('rel', ''):
            self.canonical = attrs.get('href')


def exists_at(root, url_path):
    # /guide/ needs guide/index.html; guide.html does not serve that URL.
    target = root / unquote(url_path).lstrip('/')
    if not target.resolve().is_relative_to(root.resolve()):
        return False
    if url_path.endswith('/'):
        return (target / 'index.html').is_file()
    return (target.is_file() or Path(str(target) + '.html').is_file()
            or (target / 'index.html').is_file())


def check(site, docs=None):
    broken, checked, mounted = [], 0, 0
    pages = [(p, site, '') for p in sorted(site.rglob('*.html'))]
    if docs is not None:
        pages += [(p, docs, 'html5-qrcode-docs/') for p in sorted(docs.rglob('*.html'))]
    for page, page_root, prefix in pages:
        parser = Links()
        parser.feed(page.read_text(encoding='utf-8'))
        base = parser.canonical or 'https://scanapp.org/' + prefix + page.relative_to(page_root).as_posix()
        for href in parser.hrefs:
            if href.startswith('#'):
                continue
            url = urlsplit(urljoin(base, href))
            if url.scheme not in ('http', 'https') or url.hostname != 'scanapp.org':
                continue
            target_root, target_path = site, url.path or '/'
            if target_path.startswith('/html5-qrcode-docs/'):
                mounted += 1
                if docs is None:
                    continue
                target_root = docs
                target_path = '/' + target_path.removeprefix('/html5-qrcode-docs/')
            checked += 1
            if not exists_at(target_root, target_path):
                broken.append({'page': prefix + page.relative_to(page_root).as_posix(), 'href': href})
    return {'pages': len(pages), 'checked_links': checked,
            'mounted_docs_links': mounted, 'broken': broken}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('site', type=Path)
    parser.add_argument('--docs-root', type=Path)
    args = parser.parse_args()
    if not args.site.is_dir() or not (args.site / 'index.html').is_file():
        parser.error('site must contain the generated index.html')
    if args.docs_root is not None and not (args.docs_root / 'index.html').is_file():
        parser.error('docs-root must contain the published documentation index.html')
    result = check(args.site, args.docs_root)
    print(json.dumps(result, indent=2))
    raise SystemExit(1 if result['broken'] else 0)
