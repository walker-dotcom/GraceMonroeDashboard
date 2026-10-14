#!/usr/bin/env python3
"""Bundle the dashboard into one HTML file for publishing as a Claude artifact.
   python3 tools/build_artifact.py OUT.html            -> responsive staff dashboard
   python3 tools/build_artifact.py OUT.html --mobile   -> always the phone-app layout (centered column on wide screens)
The PWA tags and service worker stay out of artifacts; they are for hosting the repo directly."""
import re, sys, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
out, mobile = sys.argv[1], '--mobile' in sys.argv
css = (R/'styles.css').read_text(); js = (R/'app.js').read_text(); ask = (R/'ask.js').read_text(); gate = (R/'gate.js').read_text(); html = (R/'index.html').read_text()
html = re.sub(r'<!--pwa-->.*?<!--/pwa-->', '', html, flags=re.S)
body = re.search(r'<body>(.*?)<script src="data/data.js">', html, re.S).group(1)
title = 'Grace Monroe Staff App' if mobile else 'Grace Monroe Staff Dashboard'
if mobile:
    css = re.sub(r'@media \(max-width:\d+px\)', '@media all', css)                           # every narrow-screen rule applies
    css = re.sub(r'@media \(min-width:\d+px\)(?: and \(max-width:\d+px\))?', '@media not all', css)  # no wide-screen rules
    assert 'var MOBILE = window.matchMedia' in js
    js = re.sub(r'var MOBILE = window\.matchMedia[^\n]*\n', 'var MOBILE = { matches: true };\n', js, count=1)
    css += """
/* ---- phone app on a wide screen: a centered phone-width column ---- */
:root { --frame:#dde3ea; --colw:430px; }
:root[data-theme="dark"] { --frame:#0b0d12; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --frame:#0b0d12; } }
body { background:var(--frame); }
#app, .gate { max-width:var(--colw); margin-left:auto; margin-right:auto; background:var(--surface); }
#app { min-height:100dvh; box-shadow:0 0 0 1px var(--hair); }
.tabbar, .tile.open, .askpanel { left:max(0px, calc(50% - var(--colw) / 2)); right:max(0px, calc(50% - var(--colw) / 2)); }
.modal .sheet { max-width:var(--colw); }
"""
out_html = ('<title>%s</title>\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
  '<link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600&family=Sanchez&display=swap" rel="stylesheet">\n<style>\n%s\n</style>\n%s\n'
  '<script>\n%s\n</script>\n<script>\n%s\n</script>\n<script>\n%s\n</script>\n') % (title, css, body, js, ask, gate)
pathlib.Path(out).write_text(out_html)
print('built', out, len(out_html), 'bytes', 'mobile' if mobile else 'responsive')
