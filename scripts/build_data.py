#!/usr/bin/env python3
"""Turn a saved Planning Center calendar_event_instances JSON dump into data/events.js.

Usage: python3 scripts/build_data.py <instances.json> > data/events.js
"""
import json, sys

PRIVATE = ("baby shower", "birthday party", "sandy allen")  # personal rentals, not church life

def ministry(n):
    n = n.lower()
    rules = [
        ("Worship & Sunday", ("worship service", "baby dedication")),
        ("Prayer", ("prayer",)),
        ("Students & Kids", ("kidzlife", "stdnts", "trunk or treat", "kiddoz")),
        ("Men", ("men", "m4m advance", "m4m night")),
        ("Women", ("women", "m4m coffee", "moms4moms")),
        ("Discipleship", ("rooted", "handcrafted", "hearing god", "reengage", "revelation", "financial peace", "joy filled")),
        ("Grace Groups", ("grace group", "vineyard")),
        ("Outreach & Care", ("foster", "chamber", "casa de")),
        ("Staff & Admin", ("staff meeting",)),
    ]
    for label, keys in rules:
        if any(k in n for k in keys):
            return label
    return "Other"

d = json.load(open(sys.argv[1]))
out = []
for e in d["data"]:
    a = e["attributes"]
    name = (a["name"] or "").strip()
    if any(p in name.lower() for p in PRIVATE):
        continue
    out.append({
        "name": name, "start": a["starts_at"], "end": a["ends_at"],
        "location": a.get("location") or "", "repeat": a.get("compact_recurrence_description") or "",
        "ministry": ministry(name),
    })
print("window.GM_EVENTS = " + json.dumps(out, ensure_ascii=False, indent=1) + ";")
