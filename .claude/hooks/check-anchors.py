#!/usr/bin/env python
"""PostToolUse hook: after any Write/Edit to index.html, verify every in-page
anchor link (href="#slug") has a matching id="slug" somewhere in the file.
This is a single-page site so anchors are the only "routing" it has, and
nothing else enforces they stay valid. Exit 2 surfaces mismatches to Claude
without blocking (the edit already happened); exit 0 stays silent when clean.
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
    if not file_path.replace("\\", "/").lower().endswith("index.html"):
        return 0

    path = Path(file_path)
    if not path.exists():
        return 0

    html = path.read_text(encoding="utf-8", errors="ignore")

    anchors_linked = set(re.findall(r'href="#([A-Za-z0-9_-]+)"', html))
    ids_present = set(re.findall(r'id="([A-Za-z0-9_-]+)"', html))

    missing = sorted(a for a in anchors_linked if a and a not in ids_present)
    if missing:
        sys.stderr.write(
            "index.html links to anchor(s) with no matching id=\"...\": "
            + ", ".join(missing)
            + ". Check nav/footer links against section ids.\n"
        )
        return 2

    return 0

if __name__ == "__main__":
    sys.exit(main())
