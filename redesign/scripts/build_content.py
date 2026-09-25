#!/usr/bin/env python3
"""Content pipeline for willvernon.online v2 — builds src/content/*.json.

Reads the Phase 0 extraction (redesign/content/<page>.json — DOM text/headings/
media/links + js_data constants such as PROJECTS_DATA, AI_DATA, TRACKS_DATABASE)
and writes typed, structured JSON to src/content/. Copy is never hand-retyped:
every string in the output is read programmatically from redesign/content/*.json
(or, for a handful of DOM associations that the flat extraction can't preserve —
the homepage featured-work cards, the contact form fields — parsed directly out
of legacy/*.html with BeautifulSoup, which is itself extraction, not authoring).

Every emitted object carries "_src": [INVENTORY IDs] so redesign/scripts/
check_content_parity.py (and a human) can trace it back to
redesign/content/INVENTORY.md.

Usage: python3 redesign/scripts/build_content.py [--content-dir redesign/content]
                                                   [--legacy-dir legacy]
                                                   [--out src/content]
Requires: beautifulsoup4, lxml (already installed for extract_content.py).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup, Comment

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import extract_content as ec  # noqa: E402  (redesign/scripts/extract_content.py — read-only import)

REPO_ROOT = HERE.parent.parent
CONTENT_DIR = REPO_ROOT / "redesign" / "content"
LEGACY_DIR = REPO_ROOT / "legacy"
OUT_DIR = REPO_ROOT / "src" / "content"

PAGE_FILES = {
    "index": "index.json",
    "about": "about.json",
    "work": "work.json",
    "projects": "projects.json",
    "music": "music.json",
    "ai": "AI.json",
    "experiments": "experiments.json",
}

# Legacy filename -> new route. index.html -> '/', AI.html -> '/ai'.
ROUTE_MAP = {
    "index.html": "/",
    "about.html": "/about",
    "work.html": "/work",
    "projects.html": "/projects",
    "music.html": "/music",
    "AI.html": "/ai",
    "experiments.html": "/experiments",
}

TODO = []  # collected across the run, printed + returned in the report


# --------------------------------------------------------------------------
# generic helpers
# --------------------------------------------------------------------------

def norm(t):
    return re.sub(r"\s+", " ", t or "").strip()


def load_page(name):
    f = CONTENT_DIR / PAGE_FILES[name]
    return json.loads(f.read_text(encoding="utf-8"))


def load_legacy(name):
    """The legacy HTML source for a page, only for DOM associations the flat
    extraction can't preserve (see module docstring)."""
    fname = [k for k, v in ROUTE_MAP.items() if PAGE_FILES.get(name, "").split(".")[0].lower() == k.split(".")[0].lower()]
    # PAGE_FILES keys already match legacy basenames except 'ai' -> 'AI.html'
    basename = {"index": "index.html", "about": "about.html", "work": "work.html",
                "projects": "projects.html", "music": "music.html", "ai": "AI.html",
                "experiments": "experiments.html"}[name]
    return BeautifulSoup((LEGACY_DIR / basename).read_text(encoding="utf-8"), "lxml")


def normalize_url(u):
    """R2 URLs and remote URLs verbatim; local 'img/...'/'audio/...' -> root-absolute."""
    if u is None:
        return None
    u = u.strip()
    if u.startswith(("http://", "https://", "mailto:", "tel:", "#", "javascript:")):
        return u
    if u.startswith("/"):
        return u
    if re.match(r"^(img|audio)/", u, re.I):
        return "/" + u
    return u


def normalize_href(href):
    """Legacy '<page>.html[#frag]' -> the new route; everything else untouched."""
    if href is None:
        return href
    m = re.match(r"^([\w.]+\.html)(#.*)?$", href)
    if not m:
        return href
    page, frag = m.group(1), m.group(2) or ""
    return ROUTE_MAP.get(page, "/" + page) + frag


def strip_leading_nav(pairs):
    """pairs: list of (id, block) from p['text']; the top nav (desktop + mobile,
    tag 'a'/'a.*') always leads every page's DOM. Drop that leading run — nav
    content is carried in site.json instead."""
    i = 0
    while i < len(pairs) and (pairs[i][1]["tag"] == "a" or pairs[i][1]["tag"].startswith("a.")):
        i += 1
    return pairs[i:]


# --------------------------------------------------------------------------
# INVENTORY id reconstruction (exact match with extract_content.inventory_lines)
# --------------------------------------------------------------------------

_ID_RE = re.compile(r"^- \[ \] `([\w.]+)` `(\w+)` (.*)$")


def numbered_items(name, p):
    """Re-derive the exact same (id, hash, label) triples extract_content.py
    put in INVENTORY.md for this page, by calling its own inventory_lines().
    Returns dict: section -> [(id, label), ...] in original DOM/js order.

    Note: extract_content.py's PAGES list (and so INVENTORY.md) uses 'AI', not
    our lowercase 'ai' key — translate so generated ids match INVENTORY.md."""
    inv_name = "AI" if name == "ai" else name
    lines, _ = ec.inventory_lines(inv_name, p)
    out = {}
    for line in lines:
        m = _ID_RE.match(line)
        if not m:
            continue
        item_id, _hash, label = m.groups()
        section = item_id.split(".")[1]
        out.setdefault(section, []).append((item_id, label))
    return out


def js_path_id_map(name, p):
    """path (e.g. '.PROJECTS_DATA[0].title') -> INVENTORY id, for every js_items
    entry. Relies on js labels being '{kind} {path}: {value}' (see
    extract_content.inventory_lines)."""
    items = numbered_items(name, p)
    out = {}
    for item_id, label in items.get("js", []):
        m = re.match(r"^\S+ (\.\S+): ", label)
        if m:
            out[m.group(1)] = item_id
    return out


def src_for_prefix(path_map, *prefixes):
    ids = [i for path, i in path_map.items() if any(path.startswith(pre) for pre in prefixes)]
    return sorted(set(ids), key=lambda x: int(x.rsplit(".", 1)[-1]))


def zip_ids(name, p, section):
    """[(id, raw_item)] for a whole DOM section (headings/img/video/audio/embed/
    data), in the same order as the source arrays (inventory_lines iterates the
    same arrays in the same order, 1:1, no dedup for these sections)."""
    items = numbered_items(name, p)
    ids = [i for i, _ in items.get(section, [])]
    raw = {"h": p["headings"], "copy": p["text"], "img": p["img"], "video": p["video"],
           "audio": p["audio"], "embed": p["iframe"], "data": p["data_attrs"],
           "js": p["js_items"], "scriptcopy": p["script_copy_review"]}[section]
    assert len(ids) == len(raw), f"{name}.{section}: id count {len(ids)} != item count {len(raw)}"
    return list(zip(ids, raw))


# --------------------------------------------------------------------------
# HTML-blob media parser (mediaSrc/mediaHtml strings holding markup)
# --------------------------------------------------------------------------

def _blob_text_blocks(soup):
    blocks, last_parent = [], None
    for s in soup.find_all(string=True):
        if isinstance(s, Comment) or s.parent.name in ("script", "style", "noscript", "template"):
            continue
        t = norm(str(s))
        if len(t) < 2:
            continue
        if s.parent is last_parent and blocks:
            blocks[-1] += " " + t
            continue
        blocks.append(t)
        last_parent = s.parent
    return blocks


def parse_media_blob(html, label=""):
    """Structure an mediaSrc/mediaHtml HTML-string blob into media items, while
    ALWAYS keeping the original markup verbatim in _raw_html so no text or
    attribute is ever lost regardless of how well the structural parse goes."""
    soup = BeautifulSoup(html, "lxml")
    root = soup.body.find(True) if soup.body else None
    root_classes = " ".join(root.get("class", [])) if root else ""
    root_style = root.get("style", "") if root else ""

    items = []
    for im in soup.find_all("img"):
        items.append({"type": "image", "src": normalize_url(im.get("src")), "alt": im.get("alt") or None})
    for v in soup.find_all("video"):
        srcs = [v.get("src")] + [s.get("src") for s in v.find_all("source")]
        srcs = [normalize_url(s) for s in srcs if s]
        items.append({"type": "video", "src": srcs[0] if srcs else None,
                       "poster": normalize_url(v.get("poster"))})
    for f in soup.find_all("iframe"):
        items.append({"type": "iframe", "src": normalize_url(f.get("src")), "title": f.get("title")})
    for tag in soup.find_all(style=True):
        bg = re.search(r"background-image:\s*url\(['\"]?([^'\")]+)", tag.get("style", ""))
        if bg and not tag.find("img") and tag.name not in ("img",):
            items.append({"type": "image", "src": normalize_url(bg.group(1)), "alt": None, "_role": "background"})

    captions = _blob_text_blocks(soup)

    if "grid" in root_classes or "grid-template" in root_style:
        layout = "grid"
    elif "carousel" in root_classes:
        layout = "carousel"
    elif "background-image" in root_style:
        layout = "background"
    else:
        layout = "custom"

    interactive = bool(re.search(r"onclick=|ondragstart=|draggable=[\"']true", html))
    has_style_tag = bool(soup.find("style"))
    needs_component = interactive or has_style_tag or layout == "custom"

    media = {
        "type": "group",
        "layout": layout,
        "items": items,
        "captions": captions,
        "_raw_html": html,
    }
    if needs_component:
        reason = []
        if interactive:
            reason.append("interactive (onclick/drag)")
        if has_style_tag:
            reason.append("scoped <style> block")
        if layout == "custom" and not interactive and not has_style_tag:
            reason.append("no grid/carousel/background pattern detected")
        media["_todo"] = True
        TODO.append({"label": label, "reason": ", ".join(reason), "chars": len(html)})
    return media


def media_from_field(media_type, src, label=""):
    """A non-blob mediaSrc/mediaType pair: image/video, or infer from extension
    when mediaType is missing."""
    if media_type == "svg" or (isinstance(src, str) and re.search(r"<[a-zA-Z][^>]*>", src)):
        return parse_media_blob(src, label)
    if not media_type:
        media_type = "video" if re.search(r"\.(mp4|webm|mov)(\?|$)", src or "", re.I) else "image"
    return {"type": media_type, "src": normalize_url(src)}


# --------------------------------------------------------------------------
# site.json — nav, socials, per-page meta/H1-H2, UI strings, footer
# --------------------------------------------------------------------------

SCRIPTCOPY_DECISIONS = {
    # string: (keep_as_ui, reason)
    "ph-fill ph-pause": (False, "Phosphor icon class name, not user-facing text"),
    "Master track player": (True, "aria-label on the mixer's master <audio> element — user-facing"),
    "Web Audio Context and Analyser successfully initialized.": (False, "console.log only, never rendered"),
    "Close Workspace": (True, "button/aria-label on the AI + project slide-over panel — user-facing"),
    "slideover-close-btn ai-slideover-close-btn": (False, "CSS class list, not user-facing text"),
    ", `openLightbox(": (False, "JS code fragment (string concatenation), not a literal"),
    ", proj.tags.join(": (False, "JS code fragment (Array.join call), not a literal"),
    "|| proc.title.toLowerCase().includes(": (False, "JS code fragment (boolean expression), not a literal"),
    ") || proc.title.toLowerCase().includes(": (False, "JS code fragment (boolean expression), not a literal"),
    "After Effects": (False, "software name already carried via PROJECTS_DATA tags / SOFTWARE_KEYS"),
    "Premiere Pro": (False, "software name already carried via PROJECTS_DATA tags / SOFTWARE_KEYS"),
    "Stable Diffusion": (False, "software name already carried via PROJECTS_DATA tags / SOFTWARE_KEYS"),
}


def build_site_json(pages):
    idx = pages["index"]
    idx_ids = numbered_items("index", idx)
    nav_pairs = idx_ids.get("nav", [])
    nav_raw = idx["nav"] + idx["footer"]
    seen, nav_dedup = set(), []
    for x in nav_raw:
        key = f"{x['text']} → {x['href']}"
        if key in seen:
            continue
        seen.add(key)
        nav_dedup.append(x)
    assert len(nav_dedup) == len(nav_pairs)

    primary_nav, socials = [], []
    for (item_id, _label), x in zip(nav_pairs, nav_dedup):
        href, text = x["href"], norm(x["text"])
        if href.endswith(".html") and text:
            primary_nav.append({"label": text, "href": normalize_href(href), "_src": [item_id]})
        elif href.startswith(("http://", "https://", "mailto:")) and href not in [s["href"] for s in socials]:
            platform = ("email" if href.startswith("mailto:") else
                        "instagram" if "instagram" in href else
                        "linkedin" if "linkedin" in href else
                        "tiktok" if "tiktok" in href else
                        "bandcamp" if "bandcamp" in href else
                        "soundcloud" if "soundcloud" in href else "other")
            socials.append({"platform": platform, "href": href, "_src": [item_id]})

    # tiktok/bandcamp/soundcloud appear as share-row / footer links on index and
    # music (outside the shared nav partial's <nav>/.mobile-menu selector) —
    # fold them in too, deduped by href.
    for page_name in ("index", "music"):
        page_ids = numbered_items(page_name, pages[page_name])
        for item_id, label in page_ids.get("link", []):
            m = re.match(r"^(.*) → (.*)$", label)
            if not m:
                continue
            text, href = m.groups()
            if href.startswith(("http://", "https://")) and href not in [s["href"] for s in socials] \
                    and any(k in href for k in ("bandcamp", "tiktok", "soundcloud")):
                platform = "bandcamp" if "bandcamp" in href else "tiktok" if "tiktok" in href else "soundcloud"
                entry = {"platform": platform, "href": href, "_src": [item_id]}
                if norm(text) and text != "(no text)":
                    entry["label"] = norm(text)
                socials.append(entry)

    # Discord: a copy-to-clipboard button (href="javascript:void(0)", no real
    # URL) — its handle only exists as a JS string literal, not in any tracked
    # js_data constant, so it's read directly off legacy/index.html.
    idx_soup = load_legacy("index")
    discord_a = idx_soup.select_one("a.discord-btn")
    if discord_a:
        m = re.search(r"clipboard\.writeText\('([^']+)'\)", idx_soup.decode())
        void_id = next((i for i, label in idx_ids.get("link", []) if label.endswith("→ javascript:void(0)")), None)
        socials.append({
            "platform": "discord",
            "href": discord_a["href"],
            "handle": m.group(1) if m else None,
            "_src": [void_id] if void_id else [],
        })

    pages_meta = {}
    for name, p in pages.items():
        ids = numbered_items(name, p)
        h_pairs = zip_ids(name, p, "h")
        pages_meta[name] = {
            "route": ROUTE_MAP[{"index": "index.html", "about": "about.html", "work": "work.html",
                                 "projects": "projects.html", "music": "music.html", "ai": "AI.html",
                                 "experiments": "experiments.html"}[name]],
            "legacyTitle": p["meta"]["title"],
            "headings": [{"level": h["level"], "text": h["text"], "_src": [hid]} for hid, h in h_pairs],
            "_src": [i for i, _ in ids.get("meta", [])],
        }

    ui = []
    for name, p in pages.items():
        for item_id, s in zip_ids(name, p, "scriptcopy"):
            keep, reason = SCRIPTCOPY_DECISIONS.get(s, (False, "unclassified script string — treated as behaviour code, not copy"))
            if keep:
                ui.append({"text": s, "page": name, "_src": [item_id]})
            TODO.append({"scriptcopy_review": s, "page": name, "id": item_id, "keep_as_ui": keep, "reason": reason})

    # New Phase 4 chrome with no legacy equivalent (the case-study prev/next
    # nav is new: legacy had a single slide-over with no cross-project
    # navigation). No INVENTORY id, so _src is empty — these aren't parity
    # items, they're UI strings routed through content (never hand-typed in
    # a component) per redesign/PLAN.md Phase 4.
    # Case-study template section/meta labels and the embed facade button
    # (Phase 4 verifier): new UI chrome, same routing.
    for text in ("Next project", "Previous project", "Back to index",
                 "Process", "Links", "No.", "Software", "Disciplines", "Tags", "Play video"):
        ui.append({"text": text, "page": "projects", "_src": []})

    # The WV monogram is shared nav chrome on every legacy page: one logo
    # entry, traced to each page's img id.
    logo = None
    for name, p in pages.items():
        for item_id, im in zip_ids(name, p, "img"):
            if (im.get("src") or "").endswith("monogram-white-trans.png"):
                if logo is None:
                    logo = {"src": normalize_url(im["src"]), "alt": im.get("alt"), "_src": []}
                logo["_src"].append(item_id)

    return {
        "nav": primary_nav,
        "socials": socials,
        "logo": logo,
        "pages": pages_meta,
        "ui": ui,
    }


# --------------------------------------------------------------------------
# home.json
# --------------------------------------------------------------------------

def build_home_json(pages, toolset_common):
    p = pages["index"]
    ids = numbered_items("index", p)
    h_pairs = zip_ids("index", p, "h")
    headings = [{"level": h["level"], "text": h["text"], "_src": [i]} for i, h in h_pairs]

    copy_pairs = strip_leading_nav(list(zip([i for i, _ in ids.get("copy", [])], p["text"])))
    blocks = [{"tag": b["tag"], "text": b["text"], "_src": [i]} for i, b in copy_pairs]

    # --- featured work: needs precise DOM association the flat arrays lose;
    # parsed directly from legacy/index.html (programmatic extraction, see
    # module docstring), cross-checked against the same text already present
    # in redesign/content/index.json.
    soup = load_legacy("index")
    featured = []
    section = soup.find(id="featured-work")
    video_ids = {v["src"][0]: i for i, v in zip_ids("index", p, "video") if v["src"]}
    for art in section.select("article.neon-card"):
        a = art.find("a", href=True)
        video = art.find("video")
        vsrc = normalize_url(video.get("src")) if video else None
        title_el = art.select_one(".neon-card-title-row h3")
        label_el = art.select_one(".neon-card-label")
        desc_el = art.select_one(".neon-card-desc")
        tags = [norm(s.get_text()) for s in art.select(".neon-card-tags span")]
        raw_vsrc = video.get("src") if video else None
        featured.append({
            "title": norm(title_el.get_text()) if title_el else None,
            "label": norm(label_el.get_text()) if label_el else None,
            "desc": norm(desc_el.get_text()) if desc_el else None,
            "tags": tags,
            "href": normalize_href(a["href"]) if a else None,
            "media": {"type": "video", "src": vsrc},
            "_src": [video_ids[raw_vsrc]] if raw_vsrc in video_ids else [],
        })

    # --- contact form: precise field/attr association, parsed the same way.
    form = soup.find("form", id="contact-form")
    fields = []
    for group in form.select(".form-group"):
        label = group.find("label")
        inp = group.find(["input", "textarea"])
        fields.append({
            "name": inp.get("name"),
            "label": norm(label.get_text()) if label else None,
            "placeholder": inp.get("placeholder"),
            "type": inp.get("type", "textarea" if inp.name == "textarea" else "text"),
            "required": inp.has_attr("required"),
        })
    submit = form.find("button", type="submit")
    contact_form = {
        "action": form.get("action"),
        "method": form.get("method", "POST").upper(),
        "fields": fields,
        "submitLabel": norm(submit.get_text()) if submit else None,
    }

    # --- toolset (same data as toolset.json / ai.json, re-sourced against this
    # page's own INVENTORY ids for traceability).
    toolset = build_toolset("index", p)

    # --- stems console copy: STEMS_CONFIG / trackParams / FX_SLIDERS_CONFIG,
    # kept structurally intact so every numeric bound/label round-trips.
    path_map = js_path_id_map("index", p)
    stems = {
        "stemsConfig": p["js_data"]["STEMS_CONFIG"],
        "trackParams": p["js_data"]["trackParams"],
        "fxSliders": p["js_data"]["FX_SLIDERS_CONFIG"],
        "_src": src_for_prefix(path_map, ".STEMS_CONFIG", ".trackParams", ".FX_SLIDERS_CONFIG"),
    }
    armed_img_pairs = zip_ids("index", p, "img")
    armed_art = next(({"src": normalize_url(im["src"]), "alt": im.get("alt"), "_src": [i]}
                       for i, im in armed_img_pairs if "artwork/" in (im.get("src") or "")), None)
    if armed_art:
        stems["armedTrackArt"] = armed_art

    return {
        "headings": headings,
        "blocks": blocks,
        "featuredWork": featured,
        "toolset": toolset,
        "stems": stems,
        "contactForm": contact_form,
    }


def build_toolset(name, p):
    data = p["js_data"]["AI_TOOLSET_DATA"]
    path_map = js_path_id_map(name, p)
    logos_by_alt = {}
    for im in p["img"]:
        alt = im.get("alt")
        if alt and alt not in logos_by_alt and "logos/" in (im.get("src") or ""):
            logos_by_alt[alt] = normalize_url(im["src"])
    alt_by_key = {
        "midjourney": "Midjourney", "flux": "Flux", "sdxl": "SDXL", "comfyui": "ComfyUI",
        "hidream": "HiDream AI", "gemini": "Google Gemini", "antigravity": "Google Anti-Gravity",
        "firefly": "Adobe Firefly", "elevenlabs": "Eleven Labs",
    }
    out = {}
    for key, entry in data.items():
        out[key] = {
            **entry,
            "logo": logos_by_alt.get(alt_by_key.get(key)),
            "_src": src_for_prefix(path_map, f".AI_TOOLSET_DATA.{key}"),
        }
    return out


# --------------------------------------------------------------------------
# about.json / work.json — DOM-only pages
# --------------------------------------------------------------------------

def build_dom_page_json(name, p):
    h_pairs = zip_ids(name, p, "h")
    headings = [{"level": h["level"], "text": h["text"], "_src": [i]} for i, h in h_pairs]
    ids = numbered_items(name, p)
    copy_pairs = strip_leading_nav(list(zip([i for i, _ in ids.get("copy", [])], p["text"])))
    blocks = [{"tag": b["tag"], "text": b["text"], "_src": [i]} for i, b in copy_pairs]
    img_pairs = zip_ids(name, p, "img")
    images = [{"src": normalize_url(im.get("src")), "alt": im.get("alt"), "_src": [i]} for i, im in img_pairs]
    link_ids = ids.get("link", [])
    links = []
    for item_id, label in link_ids:
        m = re.match(r"^(.*) → (.*)$", label)
        if not m:
            continue
        text, href = m.groups()
        links.append({"text": None if text == "(no text)" else text, "href": normalize_href(href), "_src": [item_id]})
    return {"headings": headings, "blocks": blocks, "images": images, "links": links}


def build_work_json(p):
    """The 3 category panels (Projects / AI / Experiments), precisely
    associated via legacy/work.html — the flat text array only gives the
    concatenated <a> text, not eyebrow/title/desc split apart."""
    soup = load_legacy("work")
    base = build_dom_page_json("work", p)
    panels = []
    href_by_title, video_by_title = {}, {}
    for a in soup.find_all("a", href=True):
        h3 = a.find("h3")
        if h3:
            href_by_title[norm(h3.get_text())] = a["href"]
            v = a.find("video")
            if v and v.get("src"):
                video_by_title[norm(h3.get_text())] = normalize_url(v["src"])
    blocks = p["text"]
    # eyebrow/title/desc appear as consecutive p.font-mono / h3 / p.panel-desc
    i = 0
    idx_map = list(zip([i for i, _ in numbered_items("work", p).get("copy", [])], blocks))
    idx_map = strip_leading_nav(idx_map)
    while i < len(idx_map):
        _, b = idx_map[i]
        if b["tag"].startswith("h3"):
            eyebrow = idx_map[i - 1][1]["text"] if i > 0 else None
            eyebrow_id = idx_map[i - 1][0] if i > 0 else None
            title_id, title = idx_map[i]
            desc = idx_map[i + 1][1]["text"] if i + 1 < len(idx_map) else None
            desc_id = idx_map[i + 1][0] if i + 1 < len(idx_map) else None
            panels.append({
                "eyebrow": eyebrow, "title": title["text"], "desc": desc,
                "href": normalize_href(href_by_title.get(title["text"])),
                "media": {"type": "video", "src": video_by_title.get(title["text"])},
                "_src": [x for x in (eyebrow_id, title_id, desc_id) if x],
            })
            i += 2
        i += 1
    base["panels"] = panels
    return base


# --------------------------------------------------------------------------
# projects.json — 7 case studies
# --------------------------------------------------------------------------

SLUGS = {
    "01": "amplified-spaces", "02": "handheld-stories", "03": "remnants",
    "04": "powersurge", "05": "marimekko-exhibition", "06": "smugglers-outpost",
    "07": "the-world-plays-here",
}


def build_projects_json(p):
    data = p["js_data"]["PROJECTS_DATA"]
    software_keys = set(p["js_data"]["SOFTWARE_KEYS"])
    discipline_keys = set(p["js_data"]["DISCIPLINE_ICONS"].keys())
    path_map = js_path_id_map("projects", p)

    case_studies = []
    for i, proj in enumerate(data):
        prefix = f".PROJECTS_DATA[{i}]"
        tags = proj["tags"]
        process = []
        for j, step in enumerate(proj["process"]):
            step_prefix = f"{prefix}.process[{j}]"
            process.append({
                "num": step["num"],
                "title": step["title"],
                "text": step["desc"],
                "media": media_from_field(step.get("mediaType"), step["mediaSrc"],
                                           label=f"{proj['id']} {proj['title']} / {step['title']}"),
                "_src": src_for_prefix(path_map, step_prefix),
            })
        case_studies.append({
            "id": proj["id"],
            "slug": SLUGS[proj["id"]],
            "title": proj["title"],
            "descShort": proj["descShort"],
            "descLong": proj["descLong"],
            "tags": tags,
            "software": [t for t in tags if t in software_keys],
            "disciplines": [t for t in tags if t in discipline_keys],
            "outcome": {
                "label": proj["outcomeLabel"],
                "media": media_from_field(proj.get("mediaType"), proj["mediaSrc"], label=f"{proj['id']} {proj['title']} / outcome"),
            },
            "process": process,
            "links": [],
            "_src": src_for_prefix(path_map, f"{prefix}."),
        })

    ids = numbered_items("projects", p)
    h_pairs = zip_ids("projects", p, "h")
    copy_pairs = strip_leading_nav(list(zip([i for i, _ in ids.get("copy", [])], p["text"])))

    return {
        "page": {
            "headings": [{"level": h["level"], "text": h["text"], "_src": [i]} for i, h in h_pairs],
            "blocks": [{"tag": b["tag"], "text": b["text"], "_src": [i]} for i, b in copy_pairs],
        },
        "softwareKeys": p["js_data"]["SOFTWARE_KEYS"],
        "disciplineIcons": p["js_data"]["DISCIPLINE_ICONS"],
        "softwareLogos": {k: normalize_url(v) for k, v in p["js_data"]["SOFTWARE_LOGOS"].items()},
        "softwareBadges": p["js_data"]["SOFTWARE_BADGES"],
        "caseStudies": case_studies,
    }


# --------------------------------------------------------------------------
# ai.json + toolset.json
# --------------------------------------------------------------------------

def build_ai_json(p):
    data = p["js_data"]["AI_DATA"]
    path_map = js_path_id_map("ai", p)

    # Each card's hover-preview media (distinct from its mediaHtml carousel,
    # shown before the slide-over opens) lives only in the DOM, keyed by the
    # onclick="openDrawer('<key>')" handler — parsed from legacy/AI.html.
    soup = load_legacy("ai")
    video_ids = {v["src"][0]: i for i, v in zip_ids("ai", p, "video") if v["src"]}
    img_ids = {im.get("src"): i for i, im in zip_ids("ai", p, "img")}
    previews = {}
    for card in soup.select(".ai-card"):
        m = re.search(r"openDrawer\('([\w-]+)'\)", card.get("onclick", ""))
        if not m:
            continue
        key = m.group(1)
        media_el = card.select_one(".ai-card-media")
        v, im = (media_el.find("video"), media_el.find("img")) if media_el else (None, None)
        if v and v.get("src"):
            previews[key] = {"type": "video", "src": normalize_url(v["src"]),
                              "_src": [video_ids[v["src"]]] if v["src"] in video_ids else []}
        elif im and im.get("src"):
            previews[key] = {"type": "image", "src": normalize_url(im["src"]), "alt": im.get("alt"),
                              "_src": [img_ids[im["src"]]] if im["src"] in img_ids else []}

    projects = []
    for key, entry in data.items():
        prefix = f".AI_DATA.{key}"
        projects.append({
            "key": key,
            "title": entry["title"],
            "meta": entry["meta"],
            "tags": entry["tags"],
            "preview": previews.get(key),
            "media": parse_media_blob(entry["mediaHtml"], label=f"AI/{key}") if re.search(r"<[a-zA-Z][^>]*>", entry["mediaHtml"]) else {"type": "raw", "html": entry["mediaHtml"]},
            "desc": entry["desc"],
            "prompt": entry["prompt"],
            "engine": entry["engine"],
            "ar": entry["ar"],
            "style": entry["style"],
            "upscale": entry["upscale"],
            "_src": src_for_prefix(path_map, prefix),
        })

    ids = numbered_items("ai", p)
    h_pairs = zip_ids("ai", p, "h")
    copy_pairs = strip_leading_nav(list(zip([i for i, _ in ids.get("copy", [])], p["text"])))

    return {
        "page": {
            "headings": [{"level": h["level"], "text": h["text"], "_src": [i]} for i, h in h_pairs],
            "blocks": [{"tag": b["tag"], "text": b["text"], "_src": [i]} for i, b in copy_pairs],
        },
        "projects": projects,
    }


def build_toolset_json(p):
    return {"tools": build_toolset("ai", p)}


# --------------------------------------------------------------------------
# experiments.json
# --------------------------------------------------------------------------

def build_experiments_json(p):
    data = p["js_data"]["EXPERIMENTS_DATA"]
    path_map = js_path_id_map("experiments", p)
    items = []
    for i, e in enumerate(data):
        prefix = f".EXPERIMENTS_DATA[{i}]"
        items.append({
            "id": e["id"],
            "title": e["title"],
            "descShort": e["descShort"],
            "aspectRatio": e["aspectRatio"],
            "software": e["software"],
            "media": media_from_field("video" if re.search(r"\.(mp4|webm|mov)", e["mediaSrc"], re.I) else None,
                                       e["mediaSrc"], label=f"experiments/{e['id']}"),
            "_src": src_for_prefix(path_map, prefix),
        })

    ids = numbered_items("experiments", p)
    h_pairs = zip_ids("experiments", p, "h")
    copy_pairs = strip_leading_nav(list(zip([i for i, _ in ids.get("copy", [])], p["text"])))

    return {
        "page": {
            "headings": [{"level": h["level"], "text": h["text"], "_src": [i]} for i, h in h_pairs],
            "blocks": [{"tag": b["tag"], "text": b["text"], "_src": [i]} for i, b in copy_pairs],
        },
        "items": items,
    }


# --------------------------------------------------------------------------
# tracks.json
# --------------------------------------------------------------------------

def build_tracks_json(p):
    data = p["js_data"]["TRACKS_DATABASE"]
    path_map = js_path_id_map("music", p)
    tracks = []
    for i, t in enumerate(data):
        prefix = f".TRACKS_DATABASE[{i}]"
        tracks.append({
            "title": t["title"],
            "soundcloudUrl": t["scUrl"] or None,
            "audioSrc": normalize_url(t["localUrl"]),
            "artwork": normalize_url(t["artwork"]),
            "desc": t["desc"],
            "colors": t["colors"],
            "_src": src_for_prefix(path_map, prefix),
        })

    ids = numbered_items("music", p)
    h_pairs = zip_ids("music", p, "h")
    copy_pairs = strip_leading_nav(list(zip([i for i, _ in ids.get("copy", [])], p["text"])))
    img_pairs = zip_ids("music", p, "img")
    link_pairs = ids.get("link", [])
    links = []
    for item_id, label in link_pairs:
        m = re.match(r"^(.*) → (.*)$", label)
        if not m:
            continue
        text, href = m.groups()
        if href.startswith(("http://", "https://")):
            links.append({"text": text, "href": href, "_src": [item_id]})

    embed_pairs = zip_ids("music", p, "embed")
    data_pairs = zip_ids("music", p, "data")
    embeds = []
    for item_id, f in embed_pairs:
        embed = {"src": normalize_url(f.get("src")), "title": f.get("title"), "_src": [item_id]}
        if "spotify" in (f.get("src") or ""):
            for data_id, d in data_pairs:
                if d["tag"] == "iframe" and d["attr"] == "data-testid":
                    embed["testid"] = d["value"]
                    embed["_src"].append(data_id)
        embeds.append(embed)

    return {
        "page": {
            "headings": [{"level": h["level"], "text": h["text"], "_src": [i]} for i, h in h_pairs],
            "blocks": [{"tag": b["tag"], "text": b["text"], "_src": [i]} for i, b in copy_pairs],
            "images": [{"src": normalize_url(im.get("src")), "alt": im.get("alt"), "_src": [i]} for i, im in img_pairs],
            "links": links,
            "embeds": embeds,
        },
        "tracks": tracks,
    }


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------

# --------------------------------------------------------------------------
# _src completeness pass
# --------------------------------------------------------------------------

def trace_untraced(pages, outputs):
    """PLAN §3: every INVENTORY content id must appear in some _src. The
    builders above attach ids where an item maps 1:1 to an emitted object;
    collapsed/deduplicated items (the shared nav repeated on every page,
    media children parsed out of mediaSrc blobs, links/imgs folded into
    structured records) are attached here instead: each untraced id is
    resolved to its value(s) with check_content_parity.reconstruct() (the
    same code the parity check uses), and its id is appended to the _src of
    the nearest _src-bearing object whose subtree holds that exact value,
    searching the page's own output file(s) first, then site.json, then the
    rest. Mutates `outputs` in place; ids that match nothing are left
    untraced so check_content_parity.py fails on them."""
    import check_content_parity as cp  # local import: cp imports this module

    # (normalised text, normalised url, holder dict) for every string leaf
    def leaves(root):
        out = []

        def walk(node, holder):
            if isinstance(node, dict):
                if isinstance(node.get("_src"), list):
                    holder = node
                for k, v in node.items():
                    if k != "_src":
                        walk(v, holder)
            elif isinstance(node, list):
                for v in node:
                    walk(v, holder)
            elif isinstance(node, str):
                out.append((cp.norm_text(node), cp.norm_url(node), holder))
            elif isinstance(node, (int, float)) and not isinstance(node, bool):
                out.append((str(node), "", holder))

        if isinstance(root, dict) and not isinstance(root.get("_src"), list):
            root["_src"] = []
        walk(root, root)
        return out

    file_leaves = {fname: leaves(obj) for fname, obj in outputs.items()}

    traced = set()

    def collect(node):
        if isinstance(node, dict):
            for k, v in node.items():
                if k == "_src" and isinstance(v, list):
                    traced.update(v)
                else:
                    collect(v)
        elif isinstance(node, list):
            for v in node:
                collect(v)

    for obj in outputs.values():
        collect(obj)

    def find_holder(fnames, needles, fold):
        # the first (primary) needle decides; later needles only confirm
        value, as_url = needles[0]
        if as_url:
            key = cp.norm_url(value)
        else:
            key = cp.norm_text(value)
            if fold:
                key = key.lower()
        for mode in ("exact", "contains"):
            for fname in fnames:
                for text, url, holder in file_leaves.get(fname, []):
                    cand = text.lower() if fold else text
                    if as_url and (url == key or (mode == "contains" and cp.norm_text(value) in cand)):
                        return holder
                    if not as_url and ((mode == "exact" and cand == key) or (mode == "contains" and key and key in cand)):
                        return holder
        return None

    added = 0
    for name, p in pages.items():
        own = cp.PAGE_OUTPUT_FILES.get(name, []) + ["site.json"]
        order = own + [f for f in outputs if f not in own]
        for section, pairs in numbered_items(name, p).items():
            if section not in cp.CONTENT_SECTIONS or section == "scriptcopy":
                continue
            for item_id, label in pairs:
                if item_id in traced:
                    continue
                needles = [(v, u) for v, u in cp.reconstruct(name, p, section, item_id, label) if v]
                if not needles:
                    # nothing to preserve (e.g. a JS-templated empty <video>):
                    # trace it on the page's own meta record
                    outputs["site.json"]["pages"][name]["_src"].append(item_id)
                    traced.add(item_id)
                    added += 1
                    continue
                holder = find_holder(order, needles, section in cp.DATA_FOLD_CASE)
                if holder is not None:
                    holder["_src"].append(item_id)
                    traced.add(item_id)
                    added += 1
    # drop empty root _src lists added only as a fallback holder
    for obj in outputs.values():
        if isinstance(obj, dict) and obj.get("_src") == []:
            del obj["_src"]
    TODO.append({"trace_pass": f"attached {added} previously untraced INVENTORY ids to _src"})


def main():
    global CONTENT_DIR, LEGACY_DIR

    ap = argparse.ArgumentParser()
    ap.add_argument("--content-dir", default=str(CONTENT_DIR))
    ap.add_argument("--legacy-dir", default=str(LEGACY_DIR))
    ap.add_argument("--out", default=str(OUT_DIR))
    a = ap.parse_args()

    CONTENT_DIR = Path(a.content_dir)
    LEGACY_DIR = Path(a.legacy_dir)
    out_dir = Path(a.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    pages = {name: load_page(name) for name in PAGE_FILES}

    outputs = {}
    outputs["site.json"] = build_site_json(pages)
    outputs["home.json"] = build_home_json(pages, None)
    outputs["about.json"] = build_dom_page_json("about", pages["about"])
    outputs["work.json"] = build_work_json(pages["work"])
    outputs["projects.json"] = build_projects_json(pages["projects"])
    outputs["ai.json"] = build_ai_json(pages["ai"])
    outputs["toolset.json"] = build_toolset_json(pages["ai"])
    outputs["experiments.json"] = build_experiments_json(pages["experiments"])
    outputs["tracks.json"] = build_tracks_json(pages["music"])
    outputs["stems.json"] = {
        "stemsConfig": pages["index"]["js_data"]["STEMS_CONFIG"],
        "trackParams": pages["index"]["js_data"]["trackParams"],
        "fxSliders": pages["index"]["js_data"]["FX_SLIDERS_CONFIG"],
        "_src": src_for_prefix(js_path_id_map("index", pages["index"]),
                                ".STEMS_CONFIG", ".trackParams", ".FX_SLIDERS_CONFIG"),
    }

    trace_untraced(pages, outputs)

    for fname, obj in outputs.items():
        (out_dir / fname).write_text(json.dumps(obj, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")

    report = {
        "written": sorted(outputs.keys()),
        "todo": TODO,
    }
    print(json.dumps(report, indent=1)[:4000])
    return report


if __name__ == "__main__":
    main()
