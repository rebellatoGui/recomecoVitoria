#!/usr/bin/env python
"""PreToolUse hook: block Write/Edit on binary brand assets (this project has
no build step to regenerate them, so an accidental overwrite is unrecoverable
from Claude's side). Exit 2 blocks the tool call and feeds stderr back to Claude.
"""
import json
import sys

BLOCKED_EXTENSIONS = (".webp", ".png", ".jpg", ".jpeg", ".ico", ".gif")

def main():
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return 0

    tool_name = payload.get("tool_name", "")
    if tool_name not in ("Write", "Edit"):
        return 0

    file_path = (payload.get("tool_input", {}) or {}).get("file_path", "")
    normalized = file_path.replace("\\", "/").lower()

    if "assets/" in normalized and normalized.endswith(BLOCKED_EXTENSIONS):
        sys.stderr.write(
            f"Blocked: {file_path} is a binary brand asset with no build step "
            "to regenerate it. If this file genuinely needs to change, ask the "
            "user to replace it manually or explicitly confirm the overwrite.\n"
        )
        return 2

    return 0

if __name__ == "__main__":
    sys.exit(main())
