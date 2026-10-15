"""
Copy audit for prototype pages.

    python -I tools/audit-copy.py service.html hire.html
    python -I tools/audit-copy.py --all

Removes header, footer, scripts, SVG and every .draft element, then prints sentences
from the remaining (supposedly repo-sourced) text that contain digits or claim words.
Each hit must be traced to the repo or wrapped in .draft.
"""
import os
import re
import sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLAIMS = re.compile(r"\d|\byears?\b|\bclients?\b|certif|guarantee|award|trusted|leading|best\b|top\b|expert|\bfast(er|est)?\b|\bproven\b|\bhundreds\b|\bthousands\b|\bcompliant\b|hipaa|gdpr|iso\b|soc ?2", re.I)
SKIP_TAGS = {"script", "style", "svg", "header", "footer", "head", "title"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr", "use", "path", "rect", "circle", "line", "ellipse", "polyline", "polygon", "stop"}


class Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.out = []

    def handle_starttag(self, tag, attrs):
        if tag in VOID:
            return
        cls = dict(attrs).get("class") or ""
        skip = tag in SKIP_TAGS or "draft" in cls.split() or "site-header" in cls.split() or "subnav" in cls.split() or "nx-crumbs" in cls.split()
        self.stack.append(skip or (self.stack[-1] if self.stack else False))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if self.stack:
            self.stack.pop()

    def handle_data(self, data):
        if not (self.stack and self.stack[-1]) and data.strip():
            self.out.append(data.strip())


def audit(page):
    p = Text()
    p.feed(open(os.path.join(ROOT, page), encoding="utf-8").read())
    text = " ".join(p.out)
    hits = [s.strip() for s in re.split(r"(?<=[.?!])\s+|\s{2,}", text) if CLAIMS.search(s)]
    print(f"\n{page}: {len(hits)} sentence(s) to trace")
    for h in dict.fromkeys(hits):
        print("  -", h[:200])


pages = sys.argv[1:]
if not pages or pages == ["--all"]:
    pages = sorted(f for f in os.listdir(ROOT) if f.endswith(".html") and not f.startswith("_") and f != "pages.html")
for pg in pages:
    audit(pg)
