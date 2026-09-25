#!/usr/bin/env python3
"""Recompute the sha256 of every executable inline <script> in dist/*.html and
compare the set against the 'sha256-…' sources in public/_headers script-src.

  python3 redesign/scripts/check_csp_hashes.py          # exit 1 on drift
  python3 redesign/scripts/check_csp_hashes.py --write  # rewrite public/_headers

JSON-LD and other non-JS script types are skipped (CSP doesn't gate them).
Run after `npm run build`; if --write changes public/_headers, rebuild so
dist/_headers matches.
"""
import base64
import hashlib
import pathlib
import re
import sys

from bs4 import BeautifulSoup

ROOT = pathlib.Path(__file__).resolve().parents[2]
DIST = ROOT / "dist"
HEADERS = ROOT / "public" / "_headers"
JS_TYPES = {"", "text/javascript", "application/javascript", "module"}


def inline_hashes() -> dict[str, list[str]]:
    found: dict[str, list[str]] = {}
    for html in sorted(DIST.glob("*.html")):
        soup = BeautifulSoup(html.read_text(encoding="utf-8"), "lxml")
        for tag in soup.find_all("script"):
            if tag.get("src") or (tag.get("type") or "").strip().lower() not in JS_TYPES:
                continue
            # hash the exact source text as served (BeautifulSoup keeps it verbatim)
            body = tag.string or ""
            h = base64.b64encode(hashlib.sha256(body.encode("utf-8")).digest()).decode()
            found.setdefault(f"'sha256-{h}'", []).append(html.name)
    return found


def main() -> int:
    if not DIST.exists():
        print("dist/ missing: run npm run build first", file=sys.stderr)
        return 2
    found = inline_hashes()
    text = HEADERS.read_text(encoding="utf-8")
    m = re.search(r"script-src ([^;]*);", text)
    if not m:
        print("no script-src in public/_headers", file=sys.stderr)
        return 2
    srcs = m.group(1).split()
    listed = {s for s in srcs if s.startswith("'sha256-")}
    missing = set(found) - listed
    stale = listed - set(found)

    if "--write" in sys.argv:
        kept = [s for s in srcs if not s.startswith("'sha256-")]
        new = "script-src " + " ".join(kept + sorted(found)) + ";"
        HEADERS.write_text(text[: m.start()] + new + text[m.end():], encoding="utf-8")
        print(f"wrote {len(found)} hashes to public/_headers (rebuild to refresh dist/_headers)")
        return 0

    for h in sorted(missing):
        print(f"MISSING from CSP: {h} (used by {', '.join(sorted(set(found[h])))})")
    for h in sorted(stale):
        print(f"STALE in CSP: {h} (no inline script matches)")
    if missing or stale:
        return 1
    print(f"CSP OK: {len(found)} inline script hashes match public/_headers")
    return 0


if __name__ == "__main__":
    sys.exit(main())
