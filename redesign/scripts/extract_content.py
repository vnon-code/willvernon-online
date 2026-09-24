#!/usr/bin/env python3
"""Content inventory extractor for willvernon.online.

Parses each page's DOM plus the JS data constants its inline scripts define
(via extract_js_data.mjs) and writes:
  <out>/<page>.json    structured content per page
  <out>/INVENTORY.md   per-page parity checklist, one stable ID + hash per item
  <out>/assets.json    reachability of every media/embed/link URL (--check-assets)

Phase 6 reruns this on the rebuilt output (--root dist --out /tmp/new) and diffs
the item hashes against the committed inventory to prove content parity.

Usage: python3 extract_content.py [--root .] [--out redesign/content] [--check-assets]
Requires: beautifulsoup4, lxml, node (for the JS data extractor).
"""
import argparse, hashlib, json, re, subprocess, sys, urllib.parse, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Comment

PAGES = ["index", "about", "work", "projects", "music", "AI", "experiments"]
HERE = Path(__file__).resolve().parent
URLISH = re.compile(r"^(https?://|/|\.{0,2}/?(img|audio|assets|video)/)[^\s<>\"'`]+$", re.I)
ASSET_EXT = re.compile(r"\.(png|jpe?g|gif|webp|avif|svg|mp4|webm|mov|mp3|wav|ogg|pdf|glb|gltf)(\?|$)", re.I)


def norm(t):
    return re.sub(r"\s+", " ", t or "").strip()


def h(t):
    return hashlib.sha1(norm(t).encode()).hexdigest()[:8]


def media_from_soup(soup):
    """Media, embeds and links inside a (sub)document."""
    out = {"img": [], "video": [], "audio": [], "iframe": [], "links": []}
    for im in soup.find_all("img"):
        out["img"].append({k: im.get(k) for k in ("src", "alt", "srcset", "loading", "width", "height") if im.get(k) is not None})
    for v in soup.find_all("video"):
        srcs = [v.get("src")] + [s.get("src") for s in v.find_all("source")]
        out["video"].append({"src": [s for s in srcs if s], "poster": v.get("poster"),
                             "attrs": sorted(k for k in v.attrs if k in ("autoplay", "muted", "loop", "controls", "playsinline", "preload"))})
    for a in soup.find_all("audio"):
        srcs = [a.get("src")] + [s.get("src") for s in a.find_all("source")]
        out["audio"].append({"src": [s for s in srcs if s]})
    for f in soup.find_all("iframe"):
        out["iframe"].append({"src": f.get("src"), "title": f.get("title")})
    for a in soup.find_all("a", href=True):
        out["links"].append({"href": a["href"], "text": norm(a.get_text(" ")), "target": a.get("target")})
    return out


def text_blocks(root):
    """Visible text strings in DOM order, merged per parent element."""
    blocks, last_parent = [], None
    for s in root.find_all(string=True):
        if isinstance(s, Comment) or s.parent.name in ("script", "style", "noscript", "template"):
            continue
        t = norm(str(s))
        if len(t) < 2:
            continue
        p = s.parent
        if p is last_parent and blocks:
            blocks[-1]["text"] += " " + t
            continue
        cls = ".".join(p.get("class", [])[:2])
        blocks.append({"tag": p.name + (f".{cls}" if cls else ""), "text": t})
        last_parent = p
    return blocks


def expand_html_strings(node, path, sink):
    """Walk JS data; strings holding markup are parsed for text + media."""
    if isinstance(node, dict):
        for k, v in node.items():
            expand_html_strings(v, f"{path}.{k}", sink)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            expand_html_strings(v, f"{path}[{i}]", sink)
    elif isinstance(node, str):
        if re.search(r"<[a-zA-Z][^>]*>", node):
            sub = BeautifulSoup(node, "lxml")
            for b in text_blocks(sub):
                sink.append({"path": path, "kind": "text", "value": b["text"]})
            m = media_from_soup(sub)
            for kind in ("img", "video", "audio", "iframe"):
                for item in m[kind]:
                    sink.append({"path": path, "kind": kind, "value": item})
            for l in m["links"]:
                sink.append({"path": path, "kind": "link", "value": l})
            for st in sub.find_all("style"):
                for u in re.findall(r"url\(['\"]?([^'\")]+)", st.get_text()):
                    sink.append({"path": path, "kind": "css-url", "value": u})
        elif norm(node):
            kind = "url" if URLISH.match(node.strip()) or ASSET_EXT.search(node) else "text"
            sink.append({"path": path, "kind": kind, "value": norm(node)})
    elif node is not None and not isinstance(node, bool):
        sink.append({"path": path, "kind": "value", "value": node})


SCRIPT_STR = re.compile(r"""(['"`])((?:\\.|(?!\1).){12,400}?)\1""", re.S)
CODEY = re.compile(r"[{};=]|=>|querySelector|getElementById|classList|addEventListener|px\b|rgba?\(|^[.#\w-]+$|\$\{|^ph ph-|^[#.][\w-]+ |failed|:$")


def script_copy(raw, ranges):
    """Human-readable string literals in inline scripts outside the data constants (flag for review)."""
    chars = list(raw)
    for a, b in ranges.values():  # blank out data constants already captured as js_items
        chars[a:b] = " " * (b - a)
    blanked = "".join(chars)
    found = []
    for m in re.finditer(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", blanked, re.S | re.I):
        for s in SCRIPT_STR.finditer(m.group(1)):
            t = s.group(2)
            if " " in t and re.search(r"[A-Za-z]{3,}", t) and not CODEY.search(t) and "<" not in t:
                found.append(norm(t))
    return list(dict.fromkeys(found))


def extract_page(path, root):
    raw = path.read_text(encoding="utf-8")
    soup = BeautifulSoup(raw, "lxml")
    body = soup.body
    page = {
        "file": path.name,
        "lang": soup.html.get("lang") if soup.html else None,
        "meta": {
            "title": norm(soup.title.get_text()) if soup.title else None,
            "meta": [{k: v for k, v in m.attrs.items()} for m in soup.find_all("meta")],
            "link": [{"rel": " ".join(l.get("rel", [])), "href": l.get("href")} for l in soup.find_all("link")],
            "external_scripts": [s["src"] for s in soup.find_all("script", src=True)],
        },
        "nav": [{"href": a.get("href"), "text": norm(a.get_text(" "))} for n in body.select("nav, #navbar, .mobile-menu") for a in n.find_all("a")],
        "footer": [{"href": a.get("href"), "text": norm(a.get_text(" "))} for f in body.find_all("footer") for a in f.find_all("a")],
        "footer_text": [norm(f.get_text(" ")) for f in body.find_all("footer")],
        "headings": [{"level": int(x.name[1]), "text": norm(x.get_text(" "))} for x in body.find_all(re.compile(r"^h[1-6]$"))],
        "text": text_blocks(body),
        "data_attrs": [],
        "inline_bytes": {
            "script": sum(len(s.get_text()) for s in soup.find_all("script") if not s.get("src")),
            "style": sum(len(s.get_text()) for s in soup.find_all("style")),
            "style_attr_count": len(soup.find_all(style=True)),
        },
    }
    page.update(media_from_soup(body))
    for el in body.find_all(True):
        for k, v in el.attrs.items():
            if k.startswith("data-") and isinstance(v, str) and re.search(r"[A-Za-z]{3,}", v) and len(v) > 3:
                page["data_attrs"].append({"tag": el.name, "attr": k, "value": v})
    js = json.loads(subprocess.run(["node", str(HERE / "extract_js_data.mjs"), str(path)],
                                   capture_output=True, text=True, check=True).stdout)
    page["js_data"] = js["data"]
    page["js_errors"] = js["errors"]
    items = []
    expand_html_strings(js["data"], "", items)
    page["js_items"] = items
    page["script_copy_review"] = script_copy(raw, js["ranges"])
    return page


def inventory_lines(name, p):
    lines, n = [], {"c": 0}

    def item(section, label):
        n["c"] += 1
        lines.append(f"- [ ] `{name}.{section}.{n['c']:03d}` `{h(label)}` {label[:140]}")

    lines.append(f"\n## {name}.html\n")
    lines.append("### Meta")
    item("meta", f"title: {p['meta']['title']}")
    for m in p["meta"]["meta"]:
        item("meta", "meta " + ", ".join(f"{k}={v}" for k, v in m.items()))
    for l in p["meta"]["link"]:
        item("meta", f"link rel={l['rel']} href={l['href']}")
    for s in p["meta"]["external_scripts"]:
        item("meta", f"script {s}")
    lines.append("### Navigation & footer")
    for l in dict.fromkeys(f"{x['text']} → {x['href']}" for x in p["nav"] + p["footer"]):
        item("nav", l)
    lines.append("### Headings")
    for x in p["headings"]:
        item("h", f"h{x['level']}: {x['text']}")
    lines.append("### Copy (DOM)")
    for x in p["text"]:
        item("copy", x["text"])
    lines.append("### Media & embeds (DOM)")
    for x in p["img"]:
        item("img", f"img {x.get('src')} alt=\"{x.get('alt', '')}\"")
    for x in p["video"]:
        item("video", f"video {' | '.join(x['src'])} poster={x['poster']}")
    for x in p["audio"]:
        item("audio", f"audio {' | '.join(x['src'])}")
    for x in p["iframe"]:
        item("embed", f"iframe {x['src']} title={x['title']}")
    lines.append("### Links (DOM)")
    for l in dict.fromkeys(f"{x['text'] or '(no text)'} → {x['href']}" for x in p["links"]):
        item("link", l)
    if p["data_attrs"]:
        lines.append("### data-* content")
        for x in p["data_attrs"]:
            item("data", f"{x['tag']}[{x['attr']}] {x['value']}")
    if p["js_items"]:
        lines.append("### Script data (" + ", ".join(p["js_data"]) + ")")
        for x in p["js_items"]:
            v = x["value"]
            if isinstance(v, dict):
                v = " ".join(f"{k}={v2}" for k, v2 in v.items() if v2)
            item("js", f"{x['kind']} {x['path']}: {v}")
    if p["script_copy_review"]:
        lines.append("### Script copy (strings in behaviour code — review)")
        for s in p["script_copy_review"]:
            item("scriptcopy", s)
    return lines, n["c"]


def all_urls(pages):
    urls = set()
    for p in pages.values():
        for x in p["img"]:
            urls.add(x.get("src"))
        for x in p["video"] + p["audio"]:
            urls.update(x["src"]); urls.add(x.get("poster"))
        for x in p["iframe"]:
            urls.add(x["src"])
        for x in p["links"]:
            urls.add(x["href"])
        for l in p["meta"]["link"]:
            if l["rel"] != "preconnect":
                urls.add(l["href"])
        urls.update(p["meta"]["external_scripts"])
        for x in p["js_items"]:
            v = x["value"]
            if x["kind"] in ("url", "css-url"):
                urls.add(v)
            elif isinstance(v, dict):
                urls.update(v.get("src") if isinstance(v.get("src"), list) else [v.get("src"), v.get("href"), v.get("poster")])
    return sorted(u for u in urls if u and not u.startswith(("#", "mailto:", "tel:", "javascript:")))


def check(u, root):
    if not u.startswith("http"):
        f = (root / u.split("?")[0].split("#")[0].lstrip("/"))
        return u, ("local-ok" if f.exists() else "local-missing"), None
    for method in ("HEAD", "GET"):
        try:
            req = urllib.request.Request(urllib.parse.quote(u, safe=":/?#&=%+~@!$,;"), method=method, headers={"User-Agent": "Mozilla/5.0 parity-check", "Range": "bytes=0-0"})
            with urllib.request.urlopen(req, timeout=20) as r:
                return u, r.status, r.headers.get("content-type")
        except urllib.error.HTTPError as e:
            if method == "GET" or e.code not in (403, 405, 400):
                return u, e.code, None
        except Exception as e:
            return u, "error", str(e)[:120]
    return u, "error", None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".")
    ap.add_argument("--out", default="redesign/content")
    ap.add_argument("--check-assets", action="store_true")
    a = ap.parse_args()
    root, out = Path(a.root), Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    pages, inv, summary = {}, ["# Content inventory — parity checklist",
                               "",
                               "Generated by `redesign/scripts/extract_content.py`. Every item must exist on the rebuilt site.",
                               "Format: `- [ ] <id> <hash> <item>`; the hash is sha1(normalised text)[:8], used for the Phase 6 diff.",
                               "Copy may move between sections or components; tick an item when it is present, not when its markup matches.",
                               "`Script copy` items are strings in behaviour code (labels, telemetry, UI states): keep the ones that are user-facing."], {}
    for name in PAGES:
        f = root / f"{name}.html"
        if not f.exists():
            continue
        p = extract_page(f, root)
        pages[name] = p
        (out / f"{name}.json").write_text(json.dumps(p, indent=1, ensure_ascii=False))
        lines, count = inventory_lines(name, p)
        inv += lines
        summary[name] = count
    inv.insert(6, "\n**Totals:** " + ", ".join(f"{k}: {v}" for k, v in summary.items()) + f" — {sum(summary.values())} items\n")
    (out / "INVENTORY.md").write_text("\n".join(inv) + "\n")
    print(json.dumps(summary))
    if a.check_assets:
        urls = all_urls(pages)
        with ThreadPoolExecutor(12) as ex:
            res = list(ex.map(lambda u: check(u, root), urls))
        report = [{"url": u, "status": s, "info": i} for u, s, i in res]
        (out / "assets.json").write_text(json.dumps(report, indent=1))
        bad = [r for r in report if r["status"] not in (200, 206, "local-ok")]
        print(f"assets: {len(report)} checked, {len(bad)} not OK")
        for r in bad[:40]:
            print(" ", r["status"], r["url"][:120])


if __name__ == "__main__":
    main()
