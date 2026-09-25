#!/usr/bin/env python3
"""Content parity checker for willvernon.online v2.

Parses redesign/content/INVENTORY.md (the Phase 0 parity checklist) and, for
every item, decides CONTENT vs SHELL:
  SHELL   — the `meta` category (charset/viewport/preconnect/stylesheet/
            external script/etc.). These belong to the layout (Base.astro's
            <head>), not to src/content/*.json, and are only listed here for
            later verification against the rendered <head>/nav.
  CONTENT — everything else: nav, h(eadings), copy, img, video, audio,
            embed(iframe), link, data(-* attrs), js(_data), scriptcopy.

For each CONTENT item it reconstructs the underlying value from
redesign/content/<page>.json (same code path build_content.py used to derive
the item, via extract_content.inventory_lines — see numbered_items()) and
checks that value is present, after normalisation, somewhere in the built
src/content/*.json. `scriptcopy` items are behaviour-code strings; each is
judged by a written reason (console-only / code fragment vs. genuinely
user-facing) rather than silently skipped — see build_content.SCRIPTCOPY_DECISIONS,
imported from here so the two scripts can't drift.

Prints per-page totals (content items / found / missing) and the SHELL count
by category. Exits 1 if any CONTENT item is missing on any page.

Usage: python3 redesign/scripts/check_content_parity.py
       [--content-dir redesign/content] [--src-dir src/content]
       [--inventory redesign/content/INVENTORY.md]
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import build_content as bc  # noqa: E402 (reuses numbered_items/normalize_* so IDs and decisions can't drift)

REPO_ROOT = HERE.parent.parent

SHELL_SECTIONS = {"meta"}
CONTENT_SECTIONS = {"nav", "h", "copy", "img", "video", "audio", "embed", "link", "data", "js", "scriptcopy"}

_INV_LINE_RE = re.compile(r"^- \[ \] `([\w.]+)` `(\w+)` (.*)$")
_INV_PAGE_RE = re.compile(r"^## (\w+)\.html$")


def parse_inventory(path):
    """{page: [(id, hash, label), ...]} in file order, across all sections."""
    pages, current = {}, None
    for line in path.read_text(encoding="utf-8").splitlines():
        pm = _INV_PAGE_RE.match(line)
        if pm:
            current = pm.group(1)
            pages[current] = []
            continue
        m = _INV_LINE_RE.match(line)
        if m and current:
            pages[current].append(m.groups())
    return pages


def norm_text(t):
    """Whitespace-collapsed, case-preserving (a case edit is a copy change)."""
    return re.sub(r"\s+", " ", t or "").strip()


def norm_url(u):
    """'img/x' <-> '/img/x' <-> 'https://…/img/x' all compare equal on the tail.
    A legacy '<page>.html[#frag]' href is routed through the same
    build_content.normalize_href() the content pipeline used, so 'index.html'
    matches the site's '/' and 'AI.html' matches '/ai', etc."""
    if not u:
        return ""
    routed = bc.normalize_href(u)
    u = (routed or u).strip()  # case-preserving: R2/object paths are case-sensitive
    u = re.sub(r"^https?://[^/]+", "", u)  # host-agnostic: match on path
    u = u.lstrip("./")
    if not u.startswith("/"):
        u = "/" + u
    return u


def build_haystacks(src_dir):
    """One normalised text blob and one normalised URL-token set per src/content
    file, plus a combined 'all' blob. Built once, reused for every item."""
    blobs = {}
    all_text_parts, all_url_tokens = [], set()
    for f in sorted(src_dir.glob("*.json")):
        raw = f.read_text(encoding="utf-8")
        data = json.loads(raw)
        text_parts = []
        url_tokens = set()

        def walk(node):
            if isinstance(node, dict):
                for v in node.values():
                    walk(v)
            elif isinstance(node, list):
                for v in node:
                    walk(v)
            elif isinstance(node, str):
                text_parts.append(node)
                if re.match(r"^(https?://|/|\.{0,2}/?(img|audio|assets)/)", node, re.I) or \
                        re.search(r"\.(png|jpe?g|gif|webp|avif|svg|mp4|webm|mov|mp3|wav|ogg|pdf)(\?|$)", node, re.I):
                    url_tokens.add(norm_url(node))
            elif isinstance(node, (int, float)) and not isinstance(node, bool):
                text_parts.append(str(node))

        walk(data)
        text_blob = norm_text(" ␟ ".join(text_parts))  # ␟ as a hard separator
        blobs[f.name] = {"text": text_blob, "urls": url_tokens}
        all_text_parts.extend(text_parts)
        all_url_tokens |= url_tokens

    all_blob = {"text": norm_text(" ␟ ".join(all_text_parts)), "urls": all_url_tokens}
    return blobs, all_blob


def value_in_haystack(value, haystack, as_url=False, fold_case=False):
    """Full-length, case-sensitive match of a reconstructed value (needles
    come from redesign/content/<page>.json, never the truncated INVENTORY
    label). fold_case is only for data-* attribute ids (see DATA_FOLD_CASE)."""
    if not value:
        return True  # nothing to find (e.g. an empty alt/title) is trivially satisfied
    if as_url:
        return norm_url(value) in haystack["urls"] or norm_text(value) in haystack["text"]
    needle = norm_text(value)
    if not needle:
        return True
    if fold_case:
        return needle.lower() in haystack["text"].lower()
    return needle in haystack["text"]


# Which src/content files a page's items should land in. site.json (shared
# chrome: nav, socials, titles, ui strings) is always allowed as a fallback.
PAGE_OUTPUT_FILES = {
    "index": ["home.json", "stems.json"],
    "about": ["about.json"],
    "work": ["work.json"],
    "projects": ["projects.json"],
    "music": ["tracks.json"],
    "ai": ["ai.json", "toolset.json"],
    "experiments": ["experiments.json"],
}

# data-* attribute values are lowercase machine ids (data-filter="midjourney")
# whose rendered label keeps its own casing elsewhere; they are matched
# case-insensitively. Everything else is case-sensitive.
DATA_FOLD_CASE = {"data"}


def page_haystack(name, per_file):
    files = PAGE_OUTPUT_FILES.get(name, []) + ["site.json"]
    parts = [per_file[f] for f in files if f in per_file]
    return {
        "text": " ␟ ".join(x["text"] for x in parts),
        "urls": set().union(*(x["urls"] for x in parts)) if parts else set(),
    }


def traced_ids(src_dir):
    ids = set()

    def walk(node):
        if isinstance(node, dict):
            for k, v in node.items():
                if k == "_src" and isinstance(v, list):
                    ids.update(x for x in v if isinstance(x, str))
                else:
                    walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    for f in sorted(src_dir.glob("*.json")):
        walk(json.loads(f.read_text(encoding="utf-8")))
    return ids


def regenerated_hashes(name, p):
    """id -> hash exactly as extract_content.inventory_lines() computes it
    today (ec.h(full label)); compared against INVENTORY.md's hash column."""
    inv_name = "AI" if name == "ai" else name
    lines, _ = bc.ec.inventory_lines(inv_name, p)
    out = {}
    for line in lines:
        m = _INV_LINE_RE.match(line)
        if m:
            out[m.group(1)] = m.group(2)
    return out


# --------------------------------------------------------------------------
# per-section reconstruction: id -> (needles, as_url) to search for
# --------------------------------------------------------------------------

def reconstruct(name, p, section, item_id, label):
    """Returns a list of (value, is_url) needles that must be found for this
    INVENTORY item, reconstructed from redesign/content/<name>.json (never
    from the truncated INVENTORY label alone)."""
    items = bc.numbered_items(name, p)
    section_items = items.get(section, [])
    ids_only = [i for i, _ in section_items]
    if item_id not in ids_only:
        return [(label, False)]  # shouldn't happen; fall back to the label text
    idx = ids_only.index(item_id)

    if section == "nav":
        raw = (p["nav"] + p["footer"])
        seen, dedup = set(), []
        for x in raw:
            key = f"{x['text']} → {x['href']}"
            if key in seen:
                continue
            seen.add(key)
            dedup.append(x)
        x = dedup[idx]
        needles = [(x["href"], True)]
        if norm_text(x["text"]):
            needles.append((x["text"], False))
        return needles

    if section == "h":
        return [(p["headings"][idx]["text"], False)]

    if section == "copy":
        return [(p["text"][idx]["text"], False)]

    if section == "img":
        im = p["img"][idx]
        needles = [(im.get("src"), True)]
        if im.get("alt"):
            needles.append((im["alt"], False))
        return needles

    if section == "video":
        v = p["video"][idx]
        needles = [(s, True) for s in v["src"]]
        if v.get("poster"):
            needles.append((v["poster"], True))
        # a <video> with no src/poster is a JS-templated placeholder (e.g. a
        # lightbox player filled at runtime) — nothing to preserve as content.
        return needles

    if section == "audio":
        a = p["audio"][idx]
        return [(s, True) for s in a["src"]]

    if section == "embed":
        f = p["iframe"][idx]
        needles = [(f.get("src"), True)]
        if f.get("title"):
            needles.append((f["title"], False))
        return needles

    if section == "link":
        raw = p["links"]
        seen, dedup = set(), []
        for x in raw:
            key = f"{x['text'] or '(no text)'} → {x['href']}"
            if key in seen:
                continue
            seen.add(key)
            dedup.append(x)
        x = dedup[idx]
        needles = [(x["href"], True)]
        if norm_text(x["text"]):
            needles.append((x["text"], False))
        return needles

    if section == "data":
        d = p["data_attrs"][idx]
        return [(d["value"], False)]

    if section == "js":
        x = p["js_items"][idx]
        v = x["value"]
        if isinstance(v, dict):
            needles = []
            for k in ("src", "href", "poster", "alt", "title"):
                val = v.get(k)
                if not val:
                    continue
                as_url = k in ("src", "href", "poster")
                if isinstance(val, list):
                    needles.extend((s, as_url) for s in val if s)
                else:
                    needles.append((val, as_url))
            if not needles:
                needles = [(str(v), False)]
            return needles
        as_url = x["kind"] in ("url", "css-url")
        return [(str(v), as_url)]

    if section == "scriptcopy":
        return [(p["script_copy_review"][idx], False)]

    return [(label, False)]


def classify_scriptcopy(name, s):
    keep, reason = bc.SCRIPTCOPY_DECISIONS.get(s, (None, None))
    if keep is None:
        return "unclassified", "no written classification on record for this string — treat as behaviour code pending review, does not block parity"
    return ("user-facing (site.json ui)" if keep else "behaviour code / already covered elsewhere"), reason


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--content-dir", default=str(REPO_ROOT / "redesign" / "content"))
    ap.add_argument("--src-dir", default=str(REPO_ROOT / "src" / "content"))
    ap.add_argument("--inventory", default=str(REPO_ROOT / "redesign" / "content" / "INVENTORY.md"))
    a = ap.parse_args()

    content_dir = Path(a.content_dir)
    src_dir = Path(a.src_dir)
    inv_path = Path(a.inventory)

    inventory = parse_inventory(inv_path)
    per_file, all_blob = build_haystacks(src_dir)

    bc.CONTENT_DIR = content_dir
    pages = {}
    for name in bc.PAGE_FILES:
        inv_key = name if name != "ai" else "AI"
        if inv_key not in inventory:
            print(f"!! {name}: no section in INVENTORY.md (key {inv_key})", file=sys.stderr)
            continue
        pages[name] = bc.load_page(name)

    overall_missing = 0
    shell_totals = {}
    print(f"{'page':<12} {'content':>8} {'found':>7} {'missing':>8}  {'shell':>6}")
    print("-" * 50)

    all_missing_detail = []
    scriptcopy_report = []
    traced = traced_ids(src_dir)
    hash_drift, untraced, wrong_file = [], [], []

    for name, p in pages.items():
        inv_key = name if name != "ai" else "AI"
        rows = inventory.get(inv_key, [])
        content_rows = [(iid, h, lbl) for iid, h, lbl in rows if iid.split(".")[1] in CONTENT_SECTIONS]
        shell_rows = [(iid, h, lbl) for iid, h, lbl in rows if iid.split(".")[1] in SHELL_SECTIONS]
        for iid, _h, _lbl in shell_rows:
            sec = iid.split(".")[1]
            shell_totals[sec] = shell_totals.get(sec, 0) + 1

        missing = []
        own = page_haystack(name, per_file)
        regen = regenerated_hashes(name, p)
        for item_id, inv_hash, _label in rows:
            if regen.get(item_id) != inv_hash:
                hash_drift.append((item_id, inv_hash, regen.get(item_id)))
        for item_id, _hash, label in content_rows:
            section = item_id.split(".")[1]
            if section != "scriptcopy" and item_id not in traced:
                untraced.append(item_id)
            if section == "scriptcopy":
                sc_ids = [i for i, _ in bc.numbered_items(name, p).get("scriptcopy", [])]
                s = p["script_copy_review"][sc_ids.index(item_id)]
                verdict, reason = classify_scriptcopy(name, s)
                scriptcopy_report.append((name, item_id, s, verdict, reason))
                continue  # scriptcopy items are judged by written reason, not by presence-search
            needles = reconstruct(name, p, section, item_id, label)
            ok = True
            fold = section in DATA_FOLD_CASE
            for value, as_url in needles:
                if value_in_haystack(value, own, as_url=as_url, fold_case=fold):
                    continue
                ok = False
                if value_in_haystack(value, all_blob, as_url=as_url, fold_case=fold):
                    wrong_file.append((item_id, value))
            if not ok:
                missing.append((item_id, label))

        found_count = len(content_rows) - len(missing) - sum(1 for iid, *_ in content_rows if iid.split(".")[1] == "scriptcopy")
        scriptcopy_count = sum(1 for iid, *_ in content_rows if iid.split(".")[1] == "scriptcopy")
        checked = len(content_rows) - scriptcopy_count
        print(f"{name:<12} {checked:>8} {checked - len(missing):>7} {len(missing):>8}  {len(shell_rows):>6}  ({scriptcopy_count} scriptcopy, judged separately)")
        if missing:
            overall_missing += len(missing)
            all_missing_detail.append((name, missing))

    print()
    print("SHELL items (meta category — verify against rendered <head>/nav, not content parity):")
    for sec, count in sorted(shell_totals.items()):
        print(f"  {sec}: {count}")

    print()
    print("scriptcopy items (behaviour code — judged by written reason):")
    for name, item_id, s, verdict, reason in scriptcopy_report:
        print(f"  {item_id:<24} [{verdict}] {s!r} — {reason}")

    print()
    print(f"INVENTORY hash check: {len(hash_drift)} drifted id(s)")
    for iid, old, new in hash_drift[:20]:
        print(f"   {iid}  INVENTORY {old} != regenerated {new}")
    print(f"_src trace check: {len(untraced)} untraced content id(s)")
    for iid in untraced[:40]:
        print(f"   {iid}")
    if wrong_file:
        print(f"{len(wrong_file)} value(s) exist only in another page's content file:")
        for iid, v in wrong_file[:20]:
            print(f"   {iid}  {str(v)[:100]!r}")

    if all_missing_detail or hash_drift or untraced:
        print()
        print("MISSING content items:")
        for name, missing in all_missing_detail:
            print(f" {name}:")
            for item_id, label in missing:
                print(f"   {item_id}  {label[:140]}")
        print(f"\n{overall_missing} content item(s) missing across {len(all_missing_detail)} page(s); "
              f"{len(hash_drift)} hash drift(s); {len(untraced)} untraced id(s).")
        sys.exit(1)

    print("\nAll CONTENT items present (exact, case-sensitive, in the page's own file or site.json), "
          "every INVENTORY hash reproduces, every content id is traced via _src. 100% parity.")


if __name__ == "__main__":
    main()
