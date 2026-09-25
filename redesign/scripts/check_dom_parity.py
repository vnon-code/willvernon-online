#!/usr/bin/env python3
"""Rendered-DOM parity check: legacy INVENTORY items vs the built dist/ pages.

check_content_parity.py proves src/content/*.json carries every item; this
proves the *rendered* page does. For every INVENTORY item of the requested
pages it looks in dist/<page>.html (static HTML, pre-JS) plus the page's own
/_astro/*.js chunks (script data such as STEMS_CONFIG may ship in a client
bundle rather than the markup):

  h / copy        normalised text in the page's visible text or text-bearing
                  attributes (alt, aria-label, title, placeholder, value,
                  content, data-*). Case-insensitive: CSS/legacy case styling
                  is layout, not copy. Legacy "[ HOME ]" bracket chrome is
                  stripped before matching.
  nav / link      the href (routed through build_content.normalize_href, then
                  compared without '.html' and case-insensitively) must be an
                  <a href> on the page; the link text is a warning only.
  img/video/audio/embed  the URL must appear in an attribute on the page
                  (src, srcset, poster, href, data-*), host- and './'-agnostic.
  data            the value must appear in some attribute or text.
  js              the value must appear in the page (text/attrs/inline
                  scripts) or its /_astro JS. Pure numbers are matched as
                  tokens.
  meta            only the <title> is checked (everything else is shell).
  scriptcopy      reported per build_content.SCRIPTCOPY_DECISIONS; only
                  keep_as_ui strings are required.

Usage: python3 redesign/scripts/check_dom_parity.py [--dist dist] [--pages index,about,work] [-v]
Exits 1 if any required item is missing.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from urllib.parse import unquote

from bs4 import BeautifulSoup

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import build_content as bc  # noqa: E402
from check_content_parity import parse_inventory  # noqa: E402

REPO = HERE.parent.parent
TEXT_ATTRS = ("alt", "aria-label", "title", "placeholder", "value", "content", "label")
URL_ATTRS = ("src", "srcset", "poster", "href", "action", "data")


def fold(t):
    t = re.sub(r"\s+", " ", t or "").strip().casefold()
    return t.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')


def debracket(t):
    return re.sub(r"^\[\s*(.*?)\s*\]$", r"\1", t.strip())


def norm_path(u):
    if not u:
        return ""
    u = unquote(u.strip())
    routed = bc.normalize_href(u) if re.search(r"\.html($|#|\?)", u) else None
    u = routed or u
    if u.startswith(("mailto:", "tel:")):
        return u.casefold()
    u = re.sub(r"^https?://(www\.)?willvernon\.online", "", u)
    if not re.match(r"^https?://", u):
        u = "/" + u.lstrip("./")
    u = re.sub(r"\.html(?=$|#|\?)", "", u)
    u = re.sub(r"/index$", "/", u)
    if u.endswith("/") and len(u) > 1 and not u.startswith("http"):
        u = u[:-1]
    return u.casefold().rstrip("/") or "/"


def load_page(dist, page):
    f = dist / f"{page}.html"
    if not f.exists():
        return None
    html = f.read_text(encoding="utf-8")
    soup = BeautifulSoup(html, "lxml")
    title = fold(soup.title.get_text()) if soup.title else ""
    js = []
    for s in soup.find_all("script"):
        if s.get("src", "").startswith("/_astro/"):
            p = dist / s["src"].lstrip("/")
            if p.exists():
                js.append(p.read_text(encoding="utf-8", errors="ignore"))
        elif s.string:
            js.append(s.string)
    for l in soup.find_all("link", href=True):
        if l.get("rel") and "modulepreload" in l["rel"] and l["href"].startswith("/_astro/"):
            p = dist / l["href"].lstrip("/")
            if p.exists():
                js.append(p.read_text(encoding="utf-8", errors="ignore"))
    for s in soup(["script", "style"]):
        s.decompose()
    body = soup.body or soup
    texts = [body.get_text(" "), body.get_text("")]
    urls, hrefs = set(), set()
    for el in soup.find_all(True):
        for k, v in el.attrs.items():
            v = " ".join(v) if isinstance(v, list) else str(v)
            if k in TEXT_ATTRS or k.startswith("data-"):
                texts.append(v)
            if k in URL_ATTRS or k.startswith("data-"):
                for part in re.split(r",\s*", v) if k == "srcset" else [v]:
                    urls.add(norm_path(part.split(" ")[0] if k == "srcset" else part))
            if el.name == "a" and k == "href":
                hrefs.add(norm_path(v))
    return {
        "title": title,
        "text": fold(" ␟ ".join(texts)),
        "text_raw": " ␟ ".join(texts),
        "urls": urls,
        "hrefs": hrefs,
        "js": "\n".join(js),
        "link_texts": fold(" ␟ ".join(a.get_text(" ") + " " + (a.get("aria-label") or "") for a in soup.find_all("a"))),
    }


def has_text(pg, t):
    t = fold(debracket(t))
    return bool(t) and (t in pg["text"] or t.replace(" ", "") in pg["text"].replace(" ", ""))


def in_js(pg, v):
    v = v.strip()
    if re.fullmatch(r"-?\d+(\.\d+)?", v):
        return re.search(r"(?<![\w.])" + re.escape(v) + r"(?![\w])", pg["js"] + " " + pg["text_raw"]) is not None
    return v in pg["js"] or v.replace('"', '\\"') in pg["js"] or has_text(pg, v)


def check_item(pg, iid, label):
    """-> (status, note). status in ok / warn / miss / skip."""
    cat = iid.split(".")[1]
    if cat == "meta":
        if label.startswith("title: "):
            return ("ok", "") if fold(label[7:]) == pg["title"] else ("miss", f"title is {pg['title']!r}")
        return "skip", "shell"
    if cat in ("nav", "link"):
        m = re.match(r"^(.*?) → (\S+)$", label)
        if not m:
            return "warn", "unparsed"
        text, href = m.groups()
        want = norm_path(href)
        # INVENTORY labels are length-capped, so a long link's href can be cut
        # mid-word ("→ experime"): accept a page href that starts with it.
        if want not in pg["hrefs"] and not (not re.search(r"[.#:]", href) and any(h.startswith(want) for h in pg["hrefs"])):
            return "miss", f"href {href} → {want}"
        t = fold(debracket(text))
        if t and t not in pg["link_texts"] and not has_text(pg, text):
            return "warn", "href ok, link text differs"
        return "ok", ""
    if cat == "h":
        return ("ok", "") if has_text(pg, re.sub(r"^h\d: ", "", label)) else ("miss", "")
    if cat == "copy":
        return ("ok", "") if has_text(pg, label) else ("miss", "")
    if cat in ("img", "video", "audio", "embed"):
        m = re.match(r"^\w+ (\S+)(.*)$", label)
        url = m.group(1) if m else label
        if cat == "img":
            m2 = re.match(r'^img (.+?\.(?:png|jpe?g|gif|webp|avif|svg))(?: alt="(.*)")?$', label, re.I)
            if m2:
                url = m2.group(1)
        if norm_path(url) not in pg["urls"]:
            return "miss", f"url {url}"
        alt = re.search(r'alt="(.*)"$', label)
        if alt and alt.group(1) and not has_text(pg, alt.group(1)):
            return "warn", "url ok, alt differs"
        return "ok", ""
    if cat == "data":
        v = label.split("] ", 1)[-1]
        return ("ok", "") if (has_text(pg, v) or in_js(pg, v)) else ("miss", "")
    if cat == "js":
        v = label.split(": ", 1)[-1] if ": " in label else label
        return ("ok", "") if in_js(pg, v) else ("miss", "")
    if cat == "scriptcopy":
        keep, _ = bc.SCRIPTCOPY_DECISIONS.get(label, (False, ""))
        if not keep:
            return "skip", "behaviour code"
        return ("ok", "") if has_text(pg, label) or in_js(pg, label) else ("miss", "keep_as_ui")
    return "warn", f"unknown category {cat}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dist", default=str(REPO / "dist"))
    ap.add_argument("--pages", default="index,about,work")
    ap.add_argument("--inventory", default=str(REPO / "redesign/content/INVENTORY.md"))
    ap.add_argument("-v", "--verbose", action="store_true")
    a = ap.parse_args()
    inv = parse_inventory(Path(a.inventory))
    dist, failed = Path(a.dist), False
    for page in a.pages.split(","):
        pg = load_page(dist, page)
        if pg is None:
            print(f"{page}: dist/{page}.html not found")
            failed = True
            continue
        counts = {"ok": 0, "warn": 0, "miss": 0, "skip": 0}
        rows = []
        for iid, _h, label in inv[page]:
            st, note = check_item(pg, iid, label)
            counts[st] += 1
            if st in ("miss", "warn"):
                rows.append((st, iid, label[:110], note))
        req = counts["ok"] + counts["warn"] + counts["miss"]
        pct = 100 * (counts["ok"] + counts["warn"]) / req if req else 100
        print(f"{page}: {counts['ok'] + counts['warn']}/{req} present ({pct:.1f}%), "
              f"{counts['miss']} missing, {counts['warn']} warnings, {counts['skip']} shell/skipped")
        for st, iid, label, note in rows:
            if st == "miss" or a.verbose:
                print(f"  {st.upper():4} {iid}  {label}" + (f"  [{note}]" if note else ""))
        failed |= counts["miss"] > 0
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
