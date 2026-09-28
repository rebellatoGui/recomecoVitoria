#!/usr/bin/env python
"""PostToolUse hook: after any Write/Edit to an .html page, verify every in-page
anchor link (href="#slug") and every cross-page link (href="page.html#slug")
points to an id that exists. The site is static HTML with no router, so nothing
else enforces they stay valid. Exit 2 surfaces mismatches to Claude without
blocking (the edit already happened); exit 0 stays silent when clean.
"""
import json
import re
import sys
from pathlib import Path

def main():
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return 0

    if payload.get("tool_name") not in ("Write", "Edit"):
        return 0

    file_path = (payload.get("tool_input", {}) or {}).get("file_path", "")
    if not file_path.replace("\\", "/").lower().endswith(".html"):
        return 0

    path = Path(file_path)
    if not path.exists():
        return 0

    def ids(page):
        return set(re.findall(r'id="([A-Za-z0-9_-]+)"', page.read_text(encoding="utf-8", errors="ignore")))

    html = path.read_text(encoding="utf-8", errors="ignore")
    missing = set()
    for page, anchor in re.findall(r'href="([A-Za-z0-9_-]+\.html)?#([A-Za-z0-9_-]+)"', html):
        target = path.parent / page if page else path
        if not target.exists():
            missing.add(f"{page} (page not found)")
        elif anchor not in ids(target):
            missing.add(f"{page or path.name}#{anchor}")

    if missing:
        sys.stderr.write(
            f"{path.name} links to anchor(s) with no matching id=\"...\": "
            + ", ".join(sorted(missing))
            + ". Check nav/footer links against section ids.\n"
        )
        return 2

    return 0

if __name__ == "__main__":
    sys.exit(main())
