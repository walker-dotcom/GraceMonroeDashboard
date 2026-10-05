(function () {
  "use strict";
  var S = window.GM_STATIC, TZ = S.tz;
  var EVENTS = (window.GM_EVENTS || []).map(function (e) {
    return Object.assign({}, e, { s: new Date(e.start), e: new Date(e.end) });
  }).sort(function (a, b) { return a.s - b.s; });

  // ---------- helpers ----------
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var fmtTime = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
  var fmtDay = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long", month: "long", day: "numeric" });
  var fmtShort = new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric" });
  var fmtKey = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  var dayKey = function (d) { return fmtKey.format(d); };
  function ymd(str) { var p = str.split("-"); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12)); } // noon UTC = same calendar day in ET
  function addDays(d, n) { return new Date(d.getTime() + n * 864e5); }
  function weekday(d) { return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(d)); }
  function startOfWeek(d) { return addDays(ymd(dayKey(d)), -weekday(d)); } // Sunday
  function timeRange(e) { return fmtTime.format(e.s) + " – " + fmtTime.format(e.e); }

  // "today": the real date if it is inside the loaded event window, otherwise the data's as-of date
  var now = new Date();
  var last = EVENTS.length ? EVENTS[EVENTS.length - 1].s : now;
  var today = (now >= ymd(S.asOf) && now <= last) ? now : ymd(S.asOf);
  var todayKey = dayKey(today);

  var MINISTRIES = ["Worship & Sunday", "Students & Kids", "Discipleship", "Grace Groups", "Prayer", "Men", "Women", "Outreach & Care", "Staff & Admin", "Other"];
  var state = { tab: "week", ministry: "All", q: "", weekStart: startOfWeek(today) };

  function matches(e) {
    if (state.ministry !== "All" && e.ministry !== state.ministry) return false;
    if (!state.q) return true;
    return (e.name + " " + e.ministry + " " + e.location).toLowerCase().indexOf(state.q) > -1;
  }
  function evRow(e, showDay) {
    return '<div class="ev"><div class="tm">' + (showDay ? esc(fmtShort.format(e.s)) + " · " : "") + esc(fmtTime.format(e.s)) + '</div>' +
      '<div><div class="nm">' + esc(e.name) + '</div><div class="sub">' + esc(timeRange(e)) + (e.location ? " · " + esc(e.location.replace(/^Grace Monroe - /, "")) : "") + (e.repeat && e.repeat !== "Does not repeat" ? " · " + esc(e.repeat) : "") + '</div></div>' +
      '<div><span class="pill">' + esc(e.ministry) + '</span></div></div>';
  }
  function rows(list) { return list.map(function (r) { return '<div class="row"><span>' + esc(r.label) + '</span><span class="t">' + esc(r.time) + '</span></div>'; }).join(""); }
  function nextOf(re) { return EVENTS.filter(function (e) { return e.e >= today && re.test(e.name); })[0]; }

  // ---------- panels ----------
  function renderWeek() {
    var end = addDays(today, 7);
    var upcoming = EVENTS.filter(function (e) { return e.e >= today && e.s < end; });
    var sundays = EVENTS.filter(function (e) { return e.name === "Worship Service" && e.e >= today; });
    var nextSun = sundays[0];
    var closing = S.signups.filter(function (s) { return s.closes; }).sort(function (a, b) { return a.closes < b.closes ? -1 : 1; });
    var soon = closing.filter(function (s) { return s.closes >= todayKey; })[0];
    var byDay = {};
    upcoming.forEach(function (e) { (byDay[dayKey(e.s)] = byDay[dayKey(e.s)] || []).push(e); });
    var days = Object.keys(byDay).sort().map(function (k) {
      var d = ymd(k);
      return '<div class="day' + (k === todayKey ? " today" : "") + '"><h3>' + esc(fmtDay.format(d)) + (k === todayKey ? ' <span class="badge">Today</span>' : "") + '</h3>' + byDay[k].map(function (e) { return evRow(e); }).join("") + '</div>';
    }).join("");
    var needs = S.staffing.filter(function (s) { return s.open >= 12; }).slice(0, 4);
    $("panel-week").innerHTML =
      '<h1>This week at Grace Monroe</h1><p class="lede">' + esc(fmtDay.format(today)) + ' · Eastern time. Everything staff need to know for the next seven days.</p>' +
      '<div class="section grid g3">' +
        '<div class="card kpi"><div class="n">' + (nextSun ? esc(fmtShort.format(nextSun.s)) : "—") + '</div><div class="l">Next Sunday · Services 9:00 &amp; 11:00 AM</div></div>' +
        '<div class="card kpi"><div class="n">' + esc(S.currentSeries.title) + '</div><div class="l">Current Sunday series</div></div>' +
        '<div class="card kpi"><div class="n">6:00 PM</div><div class="l">Wednesday gathering · Students &amp; Kids</div></div>' +
        '<div class="card kpi"><div class="n">' + upcoming.length + '</div><div class="l">Events on the calendar in the next 7 days</div></div>' +
        (soon ? '<div class="card kpi"><div class="n">' + esc(fmtShort.format(ymd(soon.closes))) + '</div><div class="l">Next registration deadline: ' + esc(soon.name) + '</div></div>' : "") +
      '</div>' +
      '<div class="section grid g2">' +
        '<div class="card"><h2>Key gathering times</h2>' +
          '<div class="row"><strong>Sunday services</strong><span class="t">9:00 AM · 11:00 AM</span></div>' +
          '<div class="row"><strong>Sunday kids</strong><span class="t">9:00 AM – 12:00 PM</span></div>' +
          '<div class="row"><strong>Wednesday gathering</strong><span class="t">6:00 – 7:30 PM</span></div>' +
          '<div class="row"><strong>Worship rehearsal</strong><span class="t">Thu 6:30 / 7:00 PM</span></div>' +
          '<div class="row"><strong>All‑Staff Meeting</strong><span class="t">Last Tue · 10 AM</span></div>' +
        '</div>' +
        '<div class="card"><h2>Volunteer positions still open</h2>' + needs.map(function (s) {
          var tot = s.filled != null ? s.open + s.filled : null;
          return '<div class="row" style="display:block"><div style="display:flex;justify-content:space-between"><span>' + esc(s.when) + '</span><span class="pill warn">' + s.open + ' needed</span></div>' +
            (tot ? '<div class="meter" aria-label="' + s.filled + ' of ' + tot + ' filled"><i style="width:' + Math.round(100 * s.filled / tot) + '%"></i></div>' : "") + '</div>';
        }).join("") + '<p class="note">From Planning Center Services. See the Gatherings tab for every service.</p></div>' +
      '</div>' +
      '<div class="section"><h2>Next 7 days</h2>' + (days || '<div class="empty">No events in this window.</div>') + '</div>';
  }

  function renderGather() {
    var s = S.sunday, m = S.midweek;
    $("panel-gather").innerHTML =
      '<h1>Sunday &amp; midweek gatherings</h1><p class="lede">Standing times for the weekly rhythm of Grace Monroe. Series: <strong>' + esc(S.currentSeries.title) + '</strong> on Sundays · <strong>' + esc(S.wedSeries.title) + '</strong> on Wednesdays (' + esc(S.wedSeries.note) + ').</p>' +
      '<div class="section grid g2">' +
        '<div class="card"><h2>Sunday · adult services</h2>' + s.services.map(function (x) { return '<div class="row"><span><strong>' + esc(x.label) + '</strong></span><span class="t">' + esc(x.time) + ' – ' + esc(x.end) + '</span></div>'; }).join("") + '<p class="note">315 N Madison Ave, Monroe, GA</p></div>' +
        '<div class="card"><h2>Sunday · kids experience</h2>' + rows(s.kids) + '</div>' +
        '<div class="card"><h2>Sunday · team call sheet</h2>' + rows(s.team) + '</div>' +
        '<div class="card"><h2>Sunday · classes &amp; groups</h2>' + rows(s.classes) + '</div>' +
      '</div>' +
      '<div class="section grid g2">' +
        '<div class="card"><h2>Wednesday</h2>' + rows(m.wednesday) + '</div>' +
        '<div class="card"><h2>Other weekly rhythms</h2>' + m.other.map(function (r) { return '<div class="row"><span><span class="pill" style="margin-right:8px">' + r.day + '</span>' + esc(r.label) + '</span><span class="t">' + esc(r.time) + '</span></div>'; }).join("") + '</div>' +
      '</div>' +
      '<div class="section"><h2>Staff rhythm</h2><div class="grid g2">' + S.staffRhythm.map(function (r) { return '<div class="card soft"><strong>' + esc(r.label) + '</strong><div class="muted">' + esc(r.detail) + '</div></div>'; }).join("") + '</div></div>' +
      '<div class="section"><h2>Volunteer staffing · next gatherings</h2><div class="grid g3">' + S.staffing.map(function (x) {
        return '<div class="card"><strong>' + esc(x.when) + '</strong><div class="kpi"><div class="n">' + x.open + '</div><div class="l">positions to fill' + (x.filled != null ? " · " + x.filled + " scheduled" : "") + '</div></div></div>';
      }).join("") + '</div></div>';
  }

  function renderCal() {
    var ws = state.weekStart, we = addDays(ws, 7);
    var list = EVENTS.filter(function (e) { return e.s >= ws && e.s < we && matches(e); });
    var searching = !!state.q;
    if (searching) list = EVENTS.filter(function (e) { return e.e >= today && matches(e); }).slice(0, 80);
    var byDay = {}; list.forEach(function (e) { (byDay[dayKey(e.s)] = byDay[dayKey(e.s)] || []).push(e); });
    var keys = Object.keys(byDay).sort();
    var first = EVENTS[0] ? startOfWeek(EVENTS[0].s) : ws, lastW = last ? startOfWeek(last) : ws;
    $("panel-cal").innerHTML =
      '<h1>Calendar</h1><p class="lede">Live from Planning Center Calendar. Private rentals are left out. Data currently runs through ' + esc(fmtShort.format(last)) + '.</p>' +
      '<div class="chips" role="group" aria-label="Filter by ministry">' + ["All"].concat(MINISTRIES).map(function (m) { return '<button class="chip" data-min="' + esc(m) + '" aria-pressed="' + (state.ministry === m) + '">' + esc(m) + '</button>'; }).join("") + '</div>' +
      (searching ? '<p class="note">Showing upcoming matches for “' + esc(state.q) + '”. Clear the search to browse by week.</p>' :
        '<div class="nav"><button class="btn" id="prev"' + (ws <= first ? " disabled" : "") + '>← Prev</button><div class="label">' + esc(fmtShort.format(ws)) + ' – ' + esc(fmtShort.format(addDays(ws, 6))) + '</div><button class="btn" id="next"' + (ws >= lastW ? " disabled" : "") + '>Next →</button><button class="btn" id="thisweek">This week</button></div>') +
      (keys.length ? keys.map(function (k) { return '<div class="day' + (k === todayKey ? " today" : "") + '"><h3>' + esc(fmtDay.format(ymd(k))) + (k === todayKey ? ' <span class="badge">Today</span>' : "") + '</h3>' + byDay[k].map(function (e) { return evRow(e); }).join("") + '</div>'; }).join("") : '<div class="empty">Nothing matches. Try another ministry or week.</div>');
  }

  function renderMin() {
    var q = state.q;
    var cards = MINISTRIES.filter(function (m) { return m !== "Other"; }).map(function (m) {
      var evs = EVENTS.filter(function (e) { return e.ministry === m && e.e >= today; });
      var weekly = {}; evs.forEach(function (e) { if (!weekly[e.name]) weekly[e.name] = e; });
      var names = Object.keys(weekly);
      var signups = S.signups.filter(function (x) { return x.ministry === m; });
      var hay = (m + " " + names.join(" ") + " " + signups.map(function (x) { return x.name; }).join(" ")).toLowerCase();
      if (q && hay.indexOf(q) < 0) return "";
      return '<div class="card"><h3>' + esc(m) + '</h3><p class="note">' + evs.length + ' upcoming events loaded</p>' +
        names.slice(0, 6).map(function (n) { var e = weekly[n]; return '<div class="row"><span>' + esc(n) + '</span><span class="t">' + esc(fmtShort.format(e.s)) + '</span></div>'; }).join("") +
        (signups.length ? '<h2 style="margin-top:14px">Open signups</h2>' + signups.map(function (x) { return '<div class="row"><a class="link" href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.name) + '</a>' + (x.closes ? '<span class="t">closes ' + esc(fmtShort.format(ymd(x.closes))) + '</span>' : "") + '</div>'; }).join("") : "") +
        '<button class="btn" style="margin-top:12px" data-goto="' + esc(m) + '">See calendar →</button></div>';
    }).join("");
    $("panel-min").innerHTML =
      '<h1>Ministries</h1><p class="lede">Each ministry’s upcoming gatherings and open registrations, plus the Church Center group types people can join.</p>' +
      '<div class="section grid g2">' + (cards || '<div class="empty">No ministries match your search.</div>') + '</div>' +
      '<div class="section"><h2>Group types on Church Center</h2><div class="grid g3">' + S.groupTypes.filter(function (g) { return !q || (g.name + g.blurb).toLowerCase().indexOf(q) > -1; }).map(function (g) {
        return '<a class="card" style="text-decoration:none" href="' + esc(g.url) + '" target="_blank" rel="noopener"><strong>' + esc(g.name) + '</strong><div class="muted">' + esc(g.blurb) + '</div></a>';
      }).join("") + '</div></div>';
  }

  function renderCamp() {
    var c = S.campaign, p = c.prayer;
    var a = ymd(p.start), b = ymd(p.end), pct = Math.max(0, Math.min(100, Math.round(100 * (today - a) / (b - a))));
    var ms = c.milestones.slice().sort(function (x, y) { return x.date < y.date ? -1 : 1; });
    var nextIdx = ms.findIndex(function (m) { return m.date >= todayKey; });
    var tris = '<svg class="tris" viewBox="0 0 220 300" fill="none" stroke="#f4e8de" stroke-width="1.5" aria-hidden="true"><path d="M10 10 V290 L210 150 Z"/><path d="M50 10 V290 L210 150" /><path d="M90 10 V290 L210 150"/></svg>';
    $("panel-camp").innerHTML =
      '<div class="hero-navy">' + tris +
        '<span class="pill" style="color:#f4e8de;border-color:rgba(244,232,222,.4)">Campaign</span>' +
        '<h1 style="margin-top:12px">' + esc(c.name) + '</h1>' +
        '<p><strong>' + esc(c.tagline) + '</strong></p><p>' + esc(c.verse) + '</p>' +
        '<div class="bar-wrap"><div style="display:flex;justify-content:space-between;font-size:14px"><span>' + esc(p.label) + '</span><span>' + (pct >= 100 ? "Complete" : pct + "%") + '</span></div><div class="track" role="img" aria-label="' + esc(p.label) + ' ' + pct + ' percent"><i style="width:' + pct + '%"></i></div>' +
        '<div style="font-size:13px;opacity:.8;margin-top:6px">' + esc(fmtShort.format(a)) + ' → ' + esc(fmtShort.format(b)) + '</div></div>' +
        '<div style="margin-top:6px">' + c.links.map(function (l) { return '<a class="btn" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a>'; }).join("") + '</div>' +
      '</div>' +
      '<div class="section"><h2>Phases</h2><div class="grid g2">' + c.phases.map(function (ph) { return '<div class="card phase"><strong>' + esc(ph.title) + '</strong><div class="muted">' + esc(ph.dates) + '</div><p style="margin:8px 0 0">' + esc(ph.detail) + '</p></div>'; }).join("") + '</div></div>' +
      '<div class="section grid g2">' +
        '<div><h2>Timeline</h2><ol class="tl">' + ms.map(function (m, i) {
          var cls = m.date < todayKey ? "done" : (i === nextIdx ? "next" : "");
          return '<li class="' + cls + '"><div class="d">' + esc(fmtShort.format(ymd(m.date))) + (i === nextIdx ? " · up next" : "") + '</div><div>' + esc(m.title) + '</div>' + (m.owner ? '<div class="muted" style="font-size:14px">' + esc(m.owner) + '</div>' : "") + '</li>';
        }).join("") + '</ol></div>' +
        '<div><div class="card soft"><h2>Open items</h2><ul class="openitems" style="margin:0;padding-left:18px">' + c.openItems.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join("") + '</ul></div>' +
        '<div class="card" style="margin-top:14px"><h2>Social rhythm</h2>' + c.social.map(function (x) { return '<div class="row"><span class="pill">' + x.day + '</span><span style="flex:1;margin-left:12px">' + esc(x.text) + '</span></div>'; }).join("") + '<p class="note">Reformat every clip and quote for feed, Stories, and a static graphic.</p></div></div>' +
      '</div>';
  }

  function renderRes() {
    $("panel-res").innerHTML = '<h1>Resources</h1><p class="lede">Quick links for staff.</p><div class="section grid g2">' + S.resources.map(function (g) {
      return '<div class="card"><h2>' + esc(g.group) + '</h2>' + g.items.map(function (i) { return '<div class="row"><a class="link" href="' + esc(i.url) + '" target="_blank" rel="noopener">' + esc(i.label) + '</a><span class="t">↗</span></div>'; }).join("") + '</div>';
    }).join("") + '</div>' +
    '<div class="section"><h2>Open registrations</h2><div class="grid g3">' + S.signups.map(function (x) { return '<a class="card" style="text-decoration:none" href="' + esc(x.url) + '" target="_blank" rel="noopener"><strong>' + esc(x.name) + '</strong><div class="muted">' + esc(x.ministry) + (x.closes ? " · closes " + esc(fmtShort.format(ymd(x.closes))) : "") + '</div></a>'; }).join("") + '</div></div>';
  }

  var RENDER = { week: renderWeek, gather: renderGather, cal: renderCal, min: renderMin, camp: renderCamp, res: renderRes };
  function show(tab) {
    state.tab = tab;
    document.querySelectorAll(".tab").forEach(function (t) { t.setAttribute("aria-selected", String(t.dataset.tab === tab)); });
    document.querySelectorAll(".panel").forEach(function (p) { p.hidden = p.id !== "panel-" + tab; });
    RENDER[tab]();
    try { history.replaceState(null, "", "#" + tab); } catch (e) {}
  }

  // ---------- events ----------
  document.querySelector("nav.tabs").addEventListener("click", function (e) { var t = e.target.closest(".tab"); if (t) show(t.dataset.tab); });
  document.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip"); if (chip) { state.ministry = chip.dataset.min; renderCal(); return; }
    var go = e.target.closest("[data-goto]"); if (go) { state.ministry = go.dataset.goto; state.q = ""; $("q").value = ""; show("cal"); return; }
    if (e.target.id === "prev") { state.weekStart = addDays(state.weekStart, -7); renderCal(); }
    if (e.target.id === "next") { state.weekStart = addDays(state.weekStart, 7); renderCal(); }
    if (e.target.id === "thisweek") { state.weekStart = startOfWeek(today); renderCal(); }
  });
  $("q").addEventListener("input", function (e) {
    state.q = e.target.value.trim().toLowerCase();
    if (state.q && state.tab !== "cal" && state.tab !== "min") show("cal"); else RENDER[state.tab]();
  });
  $("theme").addEventListener("click", function () {
    var root = document.documentElement, dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("gm-theme", root.dataset.theme); } catch (e) {}
  });
  try { var th = localStorage.getItem("gm-theme"); if (th) document.documentElement.dataset.theme = th; } catch (e) {}

  $("mission").textContent = "Our mission: " + S.mission;
  $("asof").textContent = "Data as of " + S.asOf + " · Planning Center (Services, Calendar, Registrations, Groups, Publishing) and the Bold Springs Campaign master calendar.";
  window.addEventListener("hashchange", function () { var h = location.hash.slice(1); if (RENDER[h] && h !== state.tab) show(h); });
  var start = (location.hash || "").slice(1);
  show(RENDER[start] ? start : "week");
})();
