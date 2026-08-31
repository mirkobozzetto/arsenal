#!/usr/bin/env python3
"""Render a roadmap markdown artifact to its deliverable HTML page.

Status banner, side TOC, inverted-pyramid typography, mermaid rendered
client-side. The markdown is base64-embedded so accents, code fences and
</script> sequences survive intact.

Usage: render.py <artifact.md> [--no-open]
"""

import base64
import re
import sys
import webbrowser
import tempfile
import time
from pathlib import Path

STATUS_TONES = {
    "accepted": "good", "ready": "good", "shipped": "good",
    "review": "warn", "draft": "neutral", "rejected": "bad",
}
VENDOR_DIR = Path(__file__).resolve().parent.parent / "assets" / "vendor"

TEMPLATE = """<!doctype html>
<html lang="und">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<script>__MARKED__</script>
<script>__MERMAID__</script>
<style>
:root {
  --ground:#f6f6f4; --sheet:#fff; --sunk:#ededea; --ink:#17191d;
  --ink-soft:#52565c; --ink-faint:#8b8f96; --rule:#dddcd7;
  --accent:#1f4d7a; --good:#34613f; --good-bg:#e4ede6;
  --warn:#8a5a2b; --warn-bg:#f3ead9; --bad:#a33a3a; --bad-bg:#f3e0e0;
  --neutral:#52565c; --neutral-bg:#ededea;
}
@media (prefers-color-scheme: dark) {
  :root {
    --ground:#121316; --sheet:#1a1c20; --sunk:#212429; --ink:#e9e9e7;
    --ink-soft:#a6aab0; --ink-faint:#70747b; --rule:#2d3137;
    --accent:#7fb0da; --good:#8cbd9a; --good-bg:#1c2b21;
    --warn:#cb9c64; --warn-bg:#2e2517; --bad:#d98080; --bad-bg:#2e1a1a;
    --neutral:#a6aab0; --neutral-bg:#212429;
  }
}
* { box-sizing:border-box; }
body { margin:0; background:var(--ground); color:var(--ink);
  font:16px/1.65 "IBM Plex Sans",system-ui,sans-serif;
  -webkit-font-smoothing:antialiased; }
.grid { max-width:72rem; margin:0 auto; padding:2.5rem 1.5rem 6rem;
  display:grid; grid-template-columns:14rem minmax(0,1fr); gap:3rem;
  align-items:start; }
@media (max-width:54rem) { .grid { grid-template-columns:minmax(0,1fr); }
  #toc { display:none; } }
#toc { position:sticky; top:1.5rem; font-size:.82rem;
  display:flex; flex-direction:column; gap:.15rem; }
#toc .t { font:.66rem/1 "IBM Plex Mono",monospace; letter-spacing:.12em;
  text-transform:uppercase; color:var(--ink-faint); margin-bottom:.5rem; }
#toc a { color:var(--ink-soft); text-decoration:none; padding:.22rem .6rem;
  border-left:2px solid var(--rule); line-height:1.35; }
#toc a:hover { color:var(--ink); }
#toc a.here { color:var(--accent); border-left-color:var(--accent); }
.statusbar { display:flex; flex-wrap:wrap; gap:.5rem 1.6rem;
  align-items:center; padding:.75rem 1.1rem; background:var(--sheet);
  border:1px solid var(--rule); margin-bottom:2.2rem;
  font:.76rem/1.4 "IBM Plex Mono",monospace; color:var(--ink-soft); }
.pill { font-weight:500; padding:.14rem .6rem; }
.pill.good { background:var(--good-bg); color:var(--good); }
.pill.warn { background:var(--warn-bg); color:var(--warn); }
.pill.bad { background:var(--bad-bg); color:var(--bad); }
.pill.neutral { background:var(--neutral-bg); color:var(--neutral); }
#doc { min-width:0; }
#doc h1 { font:600 clamp(1.8rem,4vw,2.5rem)/1.15 Newsreader,Georgia,serif;
  letter-spacing:-.015em; margin:0 0 1.4rem; text-wrap:balance; }
#doc h2 { font:600 1.45rem/1.25 Newsreader,Georgia,serif;
  margin:3rem 0 .9rem; padding-top:1.6rem; border-top:1px solid var(--rule);
  letter-spacing:-.01em; }
#doc h3 { font-size:.98rem; font-weight:600; margin:1.8rem 0 .5rem; }
#doc p, #doc li { max-width:65ch; }
#doc p { margin:0 0 .9rem; }
#doc ul, #doc ol { padding-left:1.2rem; }
#doc li { margin-bottom:.35rem; }
#doc li::marker { color:var(--ink-faint); }
#doc a { color:var(--accent); }
#doc code { font:.85em "IBM Plex Mono",monospace; background:var(--sunk);
  padding:.08em .35em; }
#doc pre { background:var(--sheet); border:1px solid var(--rule);
  padding:1.1rem 1.3rem; overflow-x:auto; }
#doc pre code { background:none; padding:0; font-size:.82rem; }
#doc blockquote { margin:1.2rem 0; padding:1rem 1.4rem;
  background:var(--good-bg); border-left:3px solid var(--good); }
#doc blockquote p { font:1.05rem/1.5 Newsreader,Georgia,serif; margin:0; }
.tw { overflow-x:auto; margin:.8rem 0 1.4rem; }
#doc table { width:100%; border-collapse:collapse; font-size:.86rem;
  background:var(--sheet); border:1px solid var(--rule); }
#doc th { text-align:left; font-size:.72rem; letter-spacing:.06em;
  text-transform:uppercase; color:var(--ink-faint);
  padding:.55rem .9rem; border-bottom:1px solid var(--rule);
  white-space:nowrap; }
#doc td { padding:.55rem .9rem; border-bottom:1px solid var(--rule);
  vertical-align:top; color:var(--ink-soft); }
#doc td:first-child { color:var(--ink); }
#doc tr:last-child td { border-bottom:none; }
.mermaid { background:var(--sheet); border:1px solid var(--rule);
  padding:1.2rem; margin:.8rem 0 1.4rem; overflow-x:auto;
  display:flex; justify-content:center; }
</style>
</head>
<body>
<div class="grid">
  <nav id="toc"><div class="t">Sommaire</div></nav>
  <article id="doc">
    <div class="statusbar">__BANNER__</div>
    <div id="content"></div>
  </article>
</div>
<script>
const raw = decodeURIComponent(escape(atob("__B64__")));
marked.use({ mangle:false, headerIds:false });
const dark = matchMedia("(prefers-color-scheme: dark)").matches;
mermaid.initialize({ startOnLoad:false, theme: dark ? "dark" : "neutral" });

const content = document.getElementById("content");
content.innerHTML = marked.parse(raw);

content.querySelectorAll("code.language-mermaid").forEach((c) => {
  const d = document.createElement("div");
  d.className = "mermaid";
  d.textContent = c.textContent;
  c.closest("pre").replaceWith(d);
});
mermaid.run({ querySelector: ".mermaid" });

content.querySelectorAll("table").forEach((t) => {
  const w = document.createElement("div");
  w.className = "tw";
  t.replaceWith(w);
  w.appendChild(t);
});

const toc = document.getElementById("toc");
const heads = [...content.querySelectorAll("h2")];
heads.forEach((h, i) => {
  h.id = "s" + i;
  const a = document.createElement("a");
  a.href = "#s" + i;
  a.textContent = h.textContent.replace(/^[0-9]+[.]\\s*/, "");
  toc.appendChild(a);
});
const links = [...toc.querySelectorAll("a")];
const obs = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) =>
      a.classList.toggle("here", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-15% 0px -75% 0px" });
heads.forEach((h) => obs.observe(h));
</script>
</body>
</html>
"""


def parse_frontmatter(text):
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end == -1:
        return {}, text
    meta = {}
    for line in text[3:end].splitlines():
        m = re.match(r"^(\w+):\s*(.+?)\s*$", line)
        if m:
            meta[m.group(1)] = m.group(2).strip("\"'")
    return meta, text[end + 4:].lstrip("\n")


def banner(meta):
    status = meta.get("status", "Draft")
    tone = STATUS_TONES.get(status.lower(), "neutral")
    parts = ['<span class="pill %s">%s</span>' % (tone, status)]
    ident = meta.get("proposal_id") or meta.get("rfc_id") or meta.get("brief_id")
    if ident and meta.get("slug"):
        parts.append("<span>%s · %s</span>" % (ident, meta["slug"]))
    elif ident:
        parts.append("<span>%s</span>" % ident)
    if meta.get("format"):
        parts.append("<span>format %s</span>" % meta["format"])
    if meta.get("updated") or meta.get("created"):
        parts.append("<span>%s</span>" % (meta.get("updated") or meta.get("created")))
    if meta.get("author"):
        parts.append("<span>%s</span>" % meta["author"])
    return "\n".join(parts)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        sys.exit("usage: render.py <artifact.md> [--no-open]")
    src = Path(args[0])
    text = src.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(text)

    m = re.search(r"^#\s+(.+)$", body, re.M)
    title = meta.get("title") or (m.group(1) if m else src.stem)
    marked = (VENDOR_DIR / "marked.min.js").read_text(encoding="utf-8")
    mermaid = (VENDOR_DIR / "mermaid.min.js").read_text(encoding="utf-8")
    marked = re.sub(r"</script", r"<\\/script", marked, flags=re.I)
    mermaid = re.sub(r"</script", r"<\\/script", mermaid, flags=re.I)
    page = (
        TEMPLATE
        .replace("__TITLE__", title)
        .replace("__BANNER__", banner(meta))
        .replace("__MARKED__", marked)
        .replace("__MERMAID__", mermaid)
        .replace("__B64__", base64.b64encode(body.encode("utf-8")).decode("ascii"))
    )

    out = Path(tempfile.gettempdir()) / ("%s-%d.html" % (src.stem.lower(), int(time.time())))
    out.write_text(page, encoding="utf-8")
    print(out)
    if "--no-open" not in sys.argv:
        try:
            opened = webbrowser.open(out.as_uri())
        except (OSError, webbrowser.Error):
            opened = False
        if not opened:
            print("Browser unavailable; open the HTML path above.", file=sys.stderr)


if __name__ == "__main__":
    main()
