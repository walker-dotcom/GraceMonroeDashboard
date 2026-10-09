window.GMStart = function (D, who) {
  "use strict";
  who = who || {};
  D = JSON.parse(JSON.stringify(D)); // working copy: live results are merged into it
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- dates (all Eastern wall-clock ISO strings) ----------
  var MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var WD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var p2 = function (n) { return (n < 10 ? "0" : "") + n; };
  var utc = function (iso) { var a = iso.split("-").map(Number); return Date.UTC(a[0], a[1] - 1, a[2]); };
  var toIso = function (ms) { var d = new Date(ms); return d.getUTCFullYear() + "-" + p2(d.getUTCMonth() + 1) + "-" + p2(d.getUTCDate()); };
  var add = function (iso, n) { return toIso(utc(iso) + n * 864e5); };
  var wdOf = function (iso) { return new Date(utc(iso)).getUTCDay(); };
  var diff = function (a, b) { return Math.round((utc(b) - utc(a)) / 864e5); };
  var parts = function (iso) { var a = iso.split("-").map(Number); return { y: a[0], m: a[1], d: a[2] }; };
  var short = function (iso) { var q = parts(iso); return MON[q.m - 1].slice(0, 3) + " " + q.d; };
  var long = function (iso) { var q = parts(iso); return WD[wdOf(iso)] + ", " + MON[q.m - 1] + " " + q.d; };
  function etNow() {
    var o = {};
    new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hour12: false })
      .formatToParts(new Date()).forEach(function (x) { o[x.type] = +x.value; });
    return { iso: o.year + "-" + p2(o.month) + "-" + p2(o.day), h: o.hour % 24, m: o.minute };
  }
  var real = etNow();
  var TODAY = real.iso < D.asOf ? D.asOf : real.iso; // data is as of D.asOf; never show a day earlier than that
  var inRange = function (e, iso) { return iso >= e.d && iso <= (e.end || e.d); };

  function eventsOn(iso) {
    var list = D.events.filter(function (e) { return inRange(e, iso); }).map(function (e) { return { t: e.t, title: e.title, note: e.note, cat: e.cat, key: e.key, d: e.d, end: e.end }; });
    var w = wdOf(iso);
    D.rhythm.forEach(function (r) { if (r.wd === w) list.push({ t: r.t, title: r.title, note: r.note, cat: "Weekly", rhythm: true }); });
    var rank = function (x) { return x.rhythm ? 1 : 0; };
    return list.sort(function (a, b) { return rank(a) - rank(b); });
  }
  function nextDom(days, from) { // next date on/after `from` whose day-of-month is in `days`
    for (var i = 0; i < 62; i++) { var iso = add(from, i); if (days.indexOf(parts(iso).d) > -1) return iso; }
  }

  // ---------- helpers ----------
  function countUp(el, to, ms) {
    if (reduce) { el.textContent = to.toLocaleString(); return; }
    var t0 = performance.now();
    (function f(t) { var k = Math.min(1, (t - t0) / ms); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString(); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  var TRI = '<svg class="tri" viewBox="-4 -4 228 198" aria-hidden="true"><path d="M10 10 L210 95 L10 180 Z"/><path d="M10 45 L150 95 L10 145 Z"/><path d="M10 75 L90 95 L10 115 Z"/></svg>';
  function confetti(x, y) {
    if (reduce) return;
    for (var i = 0; i < 18; i++) {
      var c = document.createElement("i");
      c.className = "confetti"; c.style.left = x + "px"; c.style.top = y + "px";
      c.style.setProperty("--dx", (Math.random() * 280 - 40) + "px"); c.style.setProperty("--dy", (Math.random() * 240 - 140) + "px"); c.style.setProperty("--r", (Math.random() * 540 - 270) + "deg");
      document.body.appendChild(c); setTimeout(function (n) { n.remove(); }.bind(null, c), 1500);
    }
  }

  // ---------- modal ----------
  var modal = $("modal");
  function openModal(html) { $("mbody").innerHTML = html; modal.hidden = false; $("mx").focus(); }
  function closeModal() { modal.hidden = true; }
  $("mx").onclick = closeModal;
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  function gcal(title, iso, endIso) {
    var s = iso.replace(/-/g, ""), e = add(endIso || iso, 1).replace(/-/g, "");
    return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(title) + "&dates=" + s + "/" + e;
  }
  window.gmEvent = function (iso, idx) {
    var e = eventsOn(iso)[idx]; if (!e) return;
    openModal('<div class="label muted">' + esc(e.cat) + '</div><h2 id="m-title" style="margin:6px 0 12px">' + esc(e.title) + '</h2>' +
      '<p>' + esc(long(iso)) + (e.end && e.end !== iso ? " to " + esc(short(e.end)) : "") + (e.t ? " · " + esc(e.t) : "") + '</p>' + (e.note ? '<p class="muted">' + esc(e.note) + '</p>' : "") +
      '<p><a class="btn" style="display:inline-block;text-decoration:none" target="_blank" rel="noopener" href="' + gcal(e.title, iso, e.end) + '">Add to Google Calendar</a></p>');
  };

  // ---------- hero ----------
  function renderHero() {
    var greet = (real.h < 12 ? "Good morning" : real.h < 17 ? "Good afternoon" : "Good evening");
    $("today").innerHTML = TRI +
      '<div class="label muted rv"><i class="live"></i>' + esc(long(TODAY)) + '</div>' +
      '<h1 class="rv">' + esc(greet) + ', ' + esc(who.first || "Grace Monroe") + '.</h1>' +
      '<p class="muted rv" style="max-width:640px;margin:0">' + esc(D.mission) + ' Tap a tile to open it.</p><p class="cap live-cap" id="live-cap"></p>';
  }

  // ---------- tiles: a summary on the front, the detail opens in place ----------
  function nextBirthday() {
    var yr = parts(TODAY).y, best = null;
    D.birthdays.forEach(function (b) {
      var iso = yr + "-" + b.md; if (iso < TODAY) iso = (yr + 1) + "-" + b.md;
      if (!best || iso < best.iso) best = { name: b.name, iso: iso };
    });
    return best;
  }
  function tileData() {
    var nk = D.events.filter(function (e) { return e.key && e.d >= TODAY; })[0];
    var done = D.attendance.filter(function (a) { return !a.partial; }), cur = done[done.length - 1];
    var avg = Math.round(done.slice(-4).reduce(function (s, a) { return s + a.inPerson; }, 0) / Math.min(4, done.length));
    var dv = nextDom(D.divvy.days, TODAY), bd = nextBirthday(), out = outOn(TODAY);
    var nextOut = D.pto.filter(function (p) { return p.from > TODAY; })[0];
    var nextNames = nextOut ? D.pto.filter(function (p) { return p.from === nextOut.from; }).map(function (p) { return p.name; }).join(", ") : "";
    var launchN = diff(TODAY, D.campaign.steps[2].start), q = store.get("gm-quote") || D.sermon.quote, G = D.giving;
    var rel = function (iso) { var n = diff(TODAY, iso); return n === 0 ? "Today" : n < 7 ? WD[wdOf(iso)].slice(0, 3) : short(iso); };
    return [
      { id: "calendar", label: "Calendar", big: nk ? rel(nk.d) : "Open", sub: nk ? nk.title : "Week, month, quarter" },
      { id: "giving", label: "Giving", big: G ? "$" + G.mtd.toLocaleString() : "$ — —", sub: G ? G.units + " giving units this month" : "Not connected yet" },
      { id: "attendance", label: "Attendance", big: String(cur.inPerson), sub: short(cur.d) + " · " + (cur.inPerson >= avg ? "+" : "") + (cur.inPerson - avg) + " vs 4-week avg" },
      { id: "bday", label: "Celebrations", big: bd ? bd.name.split(" ")[0] : "None", sub: bd ? short(bd.iso) + " · in " + diff(TODAY, bd.iso) + " days" : "Nothing coming up" },
      { id: "divvy", label: "Divvy reminder", big: diff(TODAY, dv) + "d", sub: long(dv) },
      { id: "word", label: "Sunday word", big: D.sermon.series, sub: q ? "&ldquo;" + esc(q.length > 60 ? q.slice(0, 57) + "..." : q) + "&rdquo;" : "Add this week's quote" },
      { id: "camp", label: "Bold Springs", big: launchN > 0 ? launchN + "d" : launchN === 0 ? "Today" : "Live", sub: launchN > 0 ? "to launch · " + short(D.campaign.steps[2].start) : "Campaign under way" },
      { id: "pto", label: "PTO", big: out.length + " out", sub: out.length ? out.map(function (o) { return o.name; }).join(", ") : nextOut ? "Next: " + nextNames + " · " + short(nextOut.from) : "Full team in" }
    ];
  }
  var TONE = { calendar: "s", giving: "p", attendance: "b", bday: "f", divvy: "p", word: "b", camp: "camp s", pto: "b" }; // tile color: slate, pale, steel, fog
  var TRIG = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1 L11 6 L2 11 Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  function countText(el) { // animate the first whole number in a headline, keep the rest ("10d", "0 out")
    var m = /\d+/.exec(el.textContent); if (!m || reduce) return;
    var to = +m[0], pre = el.textContent.slice(0, m.index), post = el.textContent.slice(m.index + m[0].length), t0 = performance.now() + 350;
    el.textContent = pre + "0" + post;
    (function f(t) { if (t < t0) return requestAnimationFrame(f); var k = Math.min(1, (t - t0) / 1100); el.textContent = pre + Math.round(to * (1 - Math.pow(1 - k, 3))) + post; if (k < 1) requestAnimationFrame(f); })(performance.now());
  }
  function sweepRing(root) {
    var r = root.querySelector(".ring"); if (!r || reduce) return;
    var to = +r.style.getPropertyValue("--p"), t0 = performance.now();
    (function f(t) { var k = Math.min(1, (t - t0) / 900); r.style.setProperty("--p", to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  var P = ' pathLength="1"';
  var ICONS = { // 48px grid, 1.5px square-capped line; each carries the right-pointing triangle (.mk)
    calendar: '<rect x="6" y="9" width="36" height="33"' + P + '/><path d="M6 18H42"' + P + '/><path d="M15 5V12M33 5V12"' + P + '/><path class="mk" d="M20 25L32 31L20 37Z"' + P + '/>',
    giving: '<circle cx="24" cy="24" r="17"' + P + '/><circle cx="24" cy="24" r="12.5"' + P + '/><path class="mk" d="M20 17L31 24L20 31Z"' + P + '/>',
    attendance: '<path d="M4 43H44"' + P + '/><rect x="7" y="28" width="8" height="15"' + P + '/><rect x="20" y="18" width="8" height="25"' + P + '/><rect x="33" y="9" width="8" height="34"' + P + '/><path class="mk" d="M5 20L13 14.5L5 9Z"' + P + '/>',
    bday: '<rect x="7" y="29" width="34" height="13"' + P + '/><path d="M16 29V21M24 29V19M32 29V21"' + P + '/><path class="mk" d="M13 10L19 13.5L13 17Z"' + P + '/><path class="mk" d="M21 6L27 9.5L21 13Z"' + P + '/><path class="mk" d="M29 10L35 13.5L29 17Z"' + P + '/>',
    divvy: '<rect x="4" y="11" width="40" height="27"' + P + '/><path d="M4 19H44"' + P + '/><path class="mk" d="M10 25L19 29.5L10 34Z"' + P + '/><path d="M26 29.5H38"' + P + '/>',
    word: '<path d="M6 8H42V32H22L12 41V32H6Z"' + P + '/><path d="M14 16H34M14 23H27"' + P + '/><path class="mk" d="M31 21L37 24L31 27Z"' + P + '/>',
    camp: '<path d="M4 43H44"' + P + '/><path d="M9 43V22L24 7L39 22V43"' + P + '/><path d="M19 43V32H29V43"' + P + '/><path class="mk" d="M21 20L27 23L21 26Z"' + P + '/>',
    pto: '<rect x="6" y="16" width="36" height="25"' + P + '/><path d="M17 16V9H31V16"' + P + '/><path d="M6 27H42"' + P + '/><path class="mk" d="M20 30L30 35L20 40Z"' + P + '/>'
  };
  function renderShell() {
    $("tiles").innerHTML = tileData().map(function (t, i) {
      var big = t.id === "word" ? esc(t.big) : t.big;
      return '<div class="tile rv ' + TONE[t.id] + '" id="t-' + t.id + '" style="animation-delay:' + i * 50 + 'ms">' +
        '<button class="th" aria-expanded="false" aria-controls="p-' + t.id + '" data-t="' + t.id + '"><span class="label">' + t.label + '</span><span class="tb"' + (["attendance", "divvy", "camp", "pto"].indexOf(t.id) > -1 ? ' data-count="1"' : "") + '>' + big + '</span><span class="ts">' + t.sub + '</span><span class="tg">' + TRIG + '<em>Open</em></span><svg class="ico" viewBox="0 0 48 48" aria-hidden="true">' + ICONS[t.id] + '</svg></button>' +
        '<div class="tp" id="p-' + t.id + '" hidden><div id="' + t.id + '"></div></div></div>';
    }).join("");
    Array.prototype.forEach.call($("tiles").querySelectorAll(".tb[data-count]"), function (el) { if (!$("app").classList.contains("settled")) countText(el); });
    Array.prototype.forEach.call($("tiles").querySelectorAll(".th"), function (b) { b.onclick = function () { toggleTile(b.getAttribute("data-t")); }; });
  }
  var MOBILE = window.matchMedia ? window.matchMedia("(max-width:639px)") : { matches: false };
  var TAB_OF = { calendar: "calendar", attendance: "numbers", giving: "numbers", bday: "team", pto: "team" };
  var GROUPS = { numbers: ["attendance", "giving"], team: ["bday", "pto"] };
  function syncTabs() {
    var open = document.querySelector(".tile.open"), cur = open ? (TAB_OF[open.id.slice(2)] || "home") : "home";
    Array.prototype.forEach.call(document.querySelectorAll("#tabbar .tabb"), function (b) { var on = b.getAttribute("data-tab") === cur; b.classList.toggle("on", on); if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
  }
  function addSegments(t, id) {
    var g = GROUPS[TAB_OF[id]]; var old = t.querySelector(".seg"); if (old) old.remove(); if (!g || !MOBILE.matches) return;
    var seg = document.createElement("div"); seg.className = "seg";
    g.forEach(function (gid) { var b = document.createElement("button"); b.type = "button"; b.textContent = $("t-" + gid).querySelector(".label").textContent; b.className = gid === id ? "on" : ""; b.onclick = function () { if (gid !== id) toggleTile(gid, true); }; seg.appendChild(b); });
    t.querySelector(".tp").insertBefore(seg, t.querySelector(".tp").firstChild);
  }
  function renderTabbar() {
    var tabs = [["home", "Home", "camp"], ["calendar", "Calendar", "calendar"], ["numbers", "Numbers", "attendance"], ["team", "Team", "bday"], ["ask", "Ask", "word"]];
    $("tabbar").innerHTML = tabs.map(function (t) { return '<button type="button" class="tabb" data-tab="' + t[0] + '"><svg viewBox="0 0 48 48" aria-hidden="true">' + ICONS[t[2]].replace(/ pathLength="1"/g, "") + '</svg><span>' + t[1] + '</span></button>'; }).join("");
    Array.prototype.forEach.call($("tabbar").querySelectorAll(".tabb"), function (b) {
      b.onclick = function () {
        var k = b.getAttribute("data-tab"), open = document.querySelector(".tile.open");
        if (k === "ask") { if (window.GMAskOpen) window.GMAskOpen(); return; }
        if (k === "home") { if (open) toggleTile(open.id.slice(2), true); window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); return; }
        var target = k === "calendar" ? "calendar" : GROUPS[k][0]; if (!open || open.id !== "t-" + target) toggleTile(target, true);
      };
    });
    if (!window.GMAskOpen) { /* ask.js loads after this runs; the tab hides itself when Ask is unavailable */ }
    syncTabs();
  }
  function renderAvatar() {
    var a = $("avatar"); if (!a) return; a.textContent = ((who.first || "G").charAt(0) || "G").toUpperCase();
    a.onclick = function () {
      openModal('<div class="label muted">Signed in</div><h2 id="m-title" style="margin:6px 0 14px">' + esc(who.name || who.first || "Grace Monroe staff") + '</h2>' +
        '<div class="row"><span>Appearance</span><button class="btn ghost" id="sh-theme" type="button">Light / Dark</button></div>' +
        '<div class="row"><span>Data</span><button class="btn ghost" id="sh-data" type="button">Sources</button></div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><button class="btn" id="sh-refresh" type="button">Refresh now</button><button class="btn ghost" id="sh-out" type="button">Sign out</button></div>');
      $("sh-theme").onclick = function () { $("theme").click(); }; $("sh-data").onclick = function () { closeModal(); showSources(); };
      $("sh-refresh").onclick = function () { closeModal(); refresh(); }; $("sh-out").onclick = function () { $("signout").click(); };
    };
  }
  function toggleTile(id, quiet) {
    var open = document.querySelector(".tile.open"), same = open && open.id === "t-" + id;
    if (open) { open.classList.remove("open"); open.querySelector(".th").setAttribute("aria-expanded", "false"); open.querySelector(".tp").hidden = true; open.querySelector(".tg em").textContent = "Open"; }
    if (same) { syncTabs(); return; }
    var t = $("t-" + id); t.classList.add("open"); t.querySelector(".th").setAttribute("aria-expanded", "true"); t.querySelector(".tp").hidden = false; t.querySelector(".tg em").textContent = "Close";
    if (id === "calendar") { var w = t.querySelector(".week"), td = t.querySelector(".day.today"); if (w && td && window.innerWidth <= 820) w.scrollLeft = td.offsetLeft - 8; }
    if (id === "attendance") renderAttendance();
    if (id === "divvy") sweepRing(t);
    addSegments(t, id); if (t.scrollTo) t.scrollTo(0, 0);
    if (!quiet && !MOBILE.matches) setTimeout(function () { t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }, 30);
    syncTabs();
  }

  // ---------- calendar ----------
  var view = store.get("gm-view") || "week", monthIso = TODAY.slice(0, 7) + "-01", picked = null;
  function weekStart(iso) { return add(iso, -wdOf(iso)); }
  function evButton(iso, e, i) {
    return '<button class="ev" onclick="gmEvent(\'' + iso + '\',' + i + ')"><b>' + esc(e.title) + '</b><small>' + esc(e.t || e.note || e.cat) + '</small></button>';
  }
  function renderCalendar() {
    var h = '<div class="head rv"><h2>Calendar</h2><div class="tabs" role="tablist">' +
      ["week", "month", "quarter"].map(function (v) { return '<button role="tab" aria-selected="' + (view === v) + '" data-v="' + v + '">' + v + '</button>'; }).join("") + '</div></div><div id="calbody"></div>';
    $("calendar").innerHTML = h;
    Array.prototype.forEach.call($("calendar").querySelectorAll("[data-v]"), function (b) { b.onclick = function () { view = b.getAttribute("data-v"); store.set("gm-view", view); renderCalendar(); }; });
    var body = $("calbody");
    if (view === "week") {
      var ws = weekStart(TODAY), out = "";
      for (var i = 0; i < 7; i++) {
        var iso = add(ws, i), evs = eventsOn(iso);
        out += '<div class="day' + (iso === TODAY ? " today" : "") + '" style="animation-delay:' + i * 60 + 'ms"><div class="label" style="opacity:.75">' + WD[i].slice(0, 3) + '</div><div class="dn">' + parts(iso).d + '</div>' +
          (evs.length ? evs.map(function (e, k) { return evButton(iso, e, k); }).join("") : '<div class="ev" style="opacity:.6">Open</div>') + '</div>';
      }
      body.innerHTML = '<div class="week">' + out + '</div><p class="cap">Week of ' + esc(short(ws)) + '. Tap an event to add it to Google Calendar.</p>';
    } else if (view === "month") {
      var mp = parts(monthIso), first = wdOf(monthIso), dim = new Date(Date.UTC(mp.y, mp.m, 0)).getUTCDate();
      var g = WD.map(function (d) { return '<div class="mh">' + d.slice(0, 3) + '</div>'; }).join("");
      for (var b = 0; b < first; b++) g += '<div class="mc off"></div>';
      for (var d = 1; d <= dim; d++) {
        var di = mp.y + "-" + p2(mp.m) + "-" + p2(d), dots = D.events.filter(function (e) { return inRange(e, di); }).length;
        g += '<button class="mc' + (di === TODAY ? " today" : "") + '" data-d="' + di + '"><b>' + d + '</b><div class="dots">' + new Array(Math.min(dots, 4) + 1).join('<i class="dot"></i>') + '</div></button>';
      }
      body.innerHTML = '<div class="mnav"><button class="btn ghost" id="pm" aria-label="Previous month">Prev</button><h3>' + MON[mp.m - 1] + " " + mp.y + '</h3><button class="btn ghost" id="nm" aria-label="Next month">Next</button></div><div class="mgrid">' + g + '</div><div id="daylist"></div>';
      var shift = function (n) { var y = mp.y, m = mp.m + n; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } monthIso = y + "-" + p2(m) + "-01"; renderCalendar(); };
      $("pm").onclick = function () { shift(-1); }; $("nm").onclick = function () { shift(1); };
      Array.prototype.forEach.call(body.querySelectorAll(".mc[data-d]"), function (c) {
        c.onclick = function () {
          var di = c.getAttribute("data-d"), evs = eventsOn(di);
          $("daylist").innerHTML = '<div class="daylist"><b>' + esc(long(di)) + '</b><ul>' + (evs.length ? evs.map(function (e, k) { return '<li><a href="#" onclick="gmEvent(\'' + di + '\',' + k + ');return false">' + esc(e.title) + '</a> <span class="muted">' + esc(e.t) + '</span></li>'; }).join("") : "<li>Nothing scheduled</li>") + '</ul></div>';
        };
      });
    } else {
      var qs = parts(TODAY), qm = Math.floor((qs.m - 1) / 3) * 3, cols = "";
      for (var m = 0; m < 3; m++) {
        var mm = qm + m + 1, key = qs.y + "-" + p2(mm);
        var list = D.events.filter(function (e) { return e.key && e.d.slice(0, 7) === key; });
        cols += '<div class="qm rv"><div class="label muted">' + MON[mm - 1] + '</div><h3 style="margin:4px 0 12px">' + list.length + ' churchwide</h3>' +
          (list.length ? list.map(function (e) { var ix = eventsOn(e.d).findIndex(function (x) { return x.title === e.title; });
            return '<button class="qrow" onclick="gmEvent(\'' + e.d + '\',' + ix + ')"><span class="qd">' + parts(e.d).d + '</span><span><b>' + esc(e.title) + '</b><br><span class="cap">' + esc(e.note || e.cat) + '</span></span></button>'; }).join("") : '<p class="cap">Nothing churchwide scheduled yet. Add dates in Planning Center Calendar.</p>') + '</div>';
      }
      body.innerHTML = '<div class="q">' + cols + '</div>';
    }
    reveal();
  }

  // ---------- giving (PCO Giving, not connected) ----------
  var sampleOn = false;
  function renderGiving() {
    var G = D.giving, el = $("giving");
    if (G) {
      var pct = G.lastMonthSameDay ? Math.round((G.mtd / G.lastMonthSameDay - 1) * 100) : 0;
      el.innerHTML = '<div class="label muted">Giving · month to date</div><div class="big" id="gv" data-to="' + G.mtd + '">$0</div><p class="cap">' + (pct >= 0 ? "+" : "") + pct + '% vs same point last month</p>' +
        '<div class="label muted" style="margin-top:20px">Giving units</div><div class="big" style="font-size:44px" id="gu">0</div><p class="cap">as of ' + esc(short(G.asOf)) + '</p>';
      countUp(el.querySelector("#gu"), G.units, 900);
      var gv = el.querySelector("#gv"); countUp(gv, G.mtd, 1000); setTimeout(function () { gv.textContent = "$" + G.mtd.toLocaleString(); }, 1050);
      return;
    }
    var s = sampleOn;
    el.innerHTML = '<div class="label muted">Giving · month to date</div>' +
      '<div class="locked"><span class="pill">Not connected</span>' +
      '<div class="' + (s ? "sample" : "") + '"><div class="' + (s ? "big" : "ghostnum") + '" id="gv">' + (s ? "$0" : "$ — —") + '</div><div class="label muted" style="margin-top:12px">Giving units</div><div class="' + (s ? "big" : "ghostnum") + '" style="font-size:40px" id="gu">' + (s ? "0" : "— —") + '</div></div>' +
      '<p class="cap" style="margin:0">PCO Giving needs a login with Giving access. Once connected, month-to-date giving and giving units appear here.</p>' +
      '<button class="btn ghost" id="samp">' + (s ? "Hide layout preview" : "Preview layout") + '</button></div>';
    $("samp").onclick = function () { sampleOn = !sampleOn; renderGiving(); };
    if (s) { countUp($("gu"), 0, 1); $("gv").textContent = "$00,000"; $("gu").textContent = "000"; }
  }

  // ---------- attendance ----------
  var selA = D.attendance.length - 2;
  function renderAttendance() {
    var A = D.attendance, max = Math.max.apply(null, A.map(function (a) { return a.inPerson + a.online; }));
    var done = A.filter(function (a) { return !a.partial; }), cur = A[selA], avg = Math.round(done.slice(-4).reduce(function (s, a) { return s + a.inPerson; }, 0) / Math.min(4, done.length));
    var el = $("attendance");
    el.innerHTML = '<div class="label muted">Church attendance · ' + esc(short(cur.d)) + '</div>' +
      '<div class="big" id="av">0</div><p class="cap" style="margin:4px 0 0">in person' + (cur.partial ? ' (partial)' : '') + ' · ' + cur.online + ' online' + (cur.inPerson && !cur.partial ? ' · ' + (cur.inPerson >= avg ? "+" : "") + (cur.inPerson - avg) + ' vs 4-week avg ' + avg : '') + '</p>' +
      '<div class="bars">' + A.map(function (a, i) {
        return '<button class="bar-col' + (i === selA ? " sel" : "") + '" data-i="' + i + '" aria-label="' + esc(short(a.d)) + ': ' + a.inPerson + ' in person, ' + a.online + ' online"><div class="bar-on" data-h="' + Math.round(a.online / max * 120) + '"></div><div class="bar-in' + (a.partial ? " partial" : "") + '" data-h="' + Math.round(a.inPerson / max * 120) + '"></div><span class="cap">' + parts(a.d).m + '/' + parts(a.d).d + '</span></button>';
      }).join("") + '</div><p class="cap">Solid = in person, outline = online. ' + (cur.note ? esc(cur.note) : 'Both services combined, from Planning Center Check-Ins.') + '</p>';
    countUp($("av"), cur.inPerson, 800);
    requestAnimationFrame(function () { Array.prototype.forEach.call(el.querySelectorAll("[data-h]"), function (b) { b.style.height = b.getAttribute("data-h") + "px"; }); });
    Array.prototype.forEach.call(el.querySelectorAll(".bar-col"), function (b) { b.onclick = function () { selA = +b.getAttribute("data-i"); renderAttendance(); }; });
  }

  // ---------- people: birthdays, anniversaries, Divvy ----------
  function renderPeople() {
    var yr = parts(TODAY).y, bd = D.birthdays.map(function (b) {
      var iso = yr + "-" + b.md; if (iso < TODAY) iso = (yr + 1) + "-" + b.md; return { name: b.name, iso: iso, n: diff(TODAY, iso) };
    }).sort(function (a, b) { return a.n - b.n; });
    var an = D.anniversaries.map(function (a) {
      var q = parts(a.date), iso = yr + a.date.slice(4); if (iso < TODAY) iso = (yr + 1) + a.date.slice(4); return { name: a.name, iso: iso, n: diff(TODAY, iso), yrs: parts(iso).y - q.y };
    }).sort(function (a, b) { return a.n - b.n; });
    var rowB = function (x, extra) { return '<div class="row"><span><b>' + esc(x.name) + '</b>' + (extra ? ' <span class="muted">' + extra(x) + '</span>' : '') + '</span><span class="cap">' + (x.n === 0 ? "Today" : esc(short(x.iso)) + " · " + x.n + "d") + '</span></div>'; };
    $("bday").innerHTML = '<div class="label muted">Staff birthdays</div>' + (bd.length ? bd.map(function (x) { return rowB(x); }).join("") : '<p class="cap">None coming up.</p>') +
      '<div class="label muted" style="margin-top:20px">Work anniversaries</div>' + (an.length ? an.map(function (x) { return rowB(x, function (y) { return y.yrs + " yrs"; }); }).join("") : '<p class="cap">No hire dates on file yet. Add them to data/data.js (anniversaries) and they show up here.</p>') +
      '<button class="btn ghost" id="party" style="margin-top:12px">Celebrate</button>';
    $("party").onclick = function (e) { var r = e.target.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top); };
    var nx = nextDom(D.divvy.days, TODAY), n = diff(TODAY, nx), pct = Math.max(4, Math.min(100, Math.round((1 - n / 14) * 100)));
    $("divvy").innerHTML = '<div style="display:flex;gap:20px;align-items:center"><div class="ring" style="--p:' + pct + '"><span>' + n + 'd</span></div><div><h3 style="margin:0">' + esc(long(nx)) + '</h3><p class="cap" style="margin:4px 0 0">Reminders go out on the 3rd and 17th.</p></div></div>' +
      '<p style="margin:16px 0 8px">Snap receipts, add the memo line, and tag the budget code in Divvy.</p><p class="cap">' + esc(D.divvy.reconcile) + '</p><a class="btn" style="display:inline-block;text-decoration:none" href="' + esc(D.divvy.url) + '" target="_blank" rel="noopener">Open Divvy</a>';
  }

  // ---------- word ----------
  function renderWord() {
    var S = D.sermon, q = store.get("gm-quote"), by = store.get("gm-quote-by"), has = q || S.quote;
    $("word").innerHTML = '<div class="head rv"><h2>The Sunday word</h2><span class="label muted">Series · ' + esc(S.series) + '</span></div>' +
      '<div class="quote rv">' + TRI + '<div id="qv"></div></div>';
    var box = $("qv");
    function show() {
      var t = q || S.quote, b = by || S.by;
      box.innerHTML = t ? '<blockquote>&ldquo;' + esc(t) + '&rdquo;</blockquote><div class="label">' + esc(b || "Pastor") + '</div>' :
        '<blockquote class="muted">A line from Sunday goes here.</blockquote><p class="cap">' + esc(S.note) + '</p>';
      box.innerHTML += '<p style="margin-top:20px"><button class="btn ghost" id="qe">' + (t ? "Change quote" : "Add quote") + '</button> <a class="label" href="' + esc(S.url) + '" target="_blank" rel="noopener" style="margin-left:12px">Listen to the sermon</a></p>';
      $("qe").onclick = edit;
    }
    function edit() {
      box.innerHTML = '<textarea id="qt" rows="3" aria-label="Quote" placeholder="Paste the pastor\'s words exactly as spoken">' + esc(q || S.quote) + '</textarea><input id="qb" aria-label="Who said it" placeholder="Pastor name" value="' + esc(by || S.by) + '"><button class="btn" id="qs">Save</button> <button class="btn ghost" id="qc">Cancel</button>';
      $("qs").onclick = function () { q = $("qt").value.trim(); by = $("qb").value.trim(); store.set("gm-quote", q); store.set("gm-quote-by", by); var ts = document.querySelector("#t-word .ts"); if (ts) ts.innerHTML = q ? "&ldquo;" + esc(q.length > 60 ? q.slice(0, 57) + "..." : q) + "&rdquo;" : "Add this week's quote"; show(); };
      $("qc").onclick = show;
    }
    show(); reveal();
  }

  // ---------- campaign ----------
  function renderCampaign() {
    var C = D.campaign, now = TODAY;
    var cur = -1; C.steps.forEach(function (s, i) { if (now >= s.start) cur = i; });
    var launchN = diff(now, C.steps[2].start), comN = diff(now, C.steps[4].start);
    var pray = Math.round(Math.min(1, diff(C.steps[0].start, now) / diff(C.steps[0].start, C.steps[0].end)) * 100);
    $("camp").innerHTML = '<div class="label rv" style="opacity:.8">Bold Springs Campaign</div><h2 class="rv" style="margin:6px 0 4px">' + esc(C.tag) + '</h2>' +
      '<div class="cd rv"><div><span class="big" data-cd="' + Math.max(0, launchN) + '">0</span><div class="label">days to launch</div></div><div><span class="big" data-cd="' + Math.max(0, comN) + '">0</span><div class="label">days to Commitment Sunday</div></div><div><span class="big" data-cd="' + pray + '">0</span><span class="big">%</span><div class="label">of 100 days of prayer</div></div></div>' +
      '<div class="steps rv">' + C.steps.map(function (s, i) { return '<button class="step' + (i < cur ? " done" : "") + (i === cur ? " now" : "") + '" data-i="' + i + '"><b>' + esc(s.t) + '</b><span class="cap">' + esc(s.when) + (i === cur ? " · now" : "") + '</span></button>'; }).join("") + '</div>' +
      '<div class="rv" style="margin-top:24px"><div class="label" style="opacity:.8">Update</div><ul style="margin:8px 0 0;padding-left:18px">' + C.next.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join("") + '</ul></div>' +
      '<p class="rv" style="margin-top:20px">' + C.links.map(function (l) { return '<a class="lnk" href="' + esc(l.u) + '" target="_blank" rel="noopener">' + esc(l.l) + '</a>'; }).join("") + '</p>' +
      '<p class="cap rv">Pledge and giving progress will show here once PCO Giving is connected.</p>';
    Array.prototype.forEach.call($("camp").querySelectorAll("[data-cd]"), function (e) { countUp(e, +e.getAttribute("data-cd"), 900); });
    Array.prototype.forEach.call($("camp").querySelectorAll(".step"), function (b) { b.onclick = function () { var s = C.steps[+b.getAttribute("data-i")]; openModal('<div class="label muted">' + esc(s.when) + '</div><h2 id="m-title" style="margin:6px 0 12px">' + esc(s.t) + '</h2><p>' + esc(s.s) + '</p>'); }; });
    reveal();
  }

  // ---------- PTO ----------
  function outOn(iso) { return D.pto.filter(function (p) { return iso >= p.from && iso <= p.to; }); }
  function renderPto() {
    var w = wdOf(TODAY), start = add(TODAY, w === 0 ? 1 : w === 6 ? 2 : 1 - w), html = "";
    [0, 7].forEach(function (off, wk) {
      var cols = "";
      for (var i = 0; i < 5; i++) {
        var iso = add(start, off + i), o = outOn(iso);
        cols += '<div class="rv" style="transition-delay:' + i * 70 + 'ms"><div class="label muted">' + WD[i + 1].slice(0, 3) + ' ' + parts(iso).d + '</div>' +
          (o.length ? o.map(function (p) { return '<span class="who' + (p.kind === "WFH" ? " wfh" : "") + '">' + esc(p.name) + '</span><span class="cap"> ' + esc(p.kind) + '</span><br>'; }).join("") : '<p class="cap">Everyone in</p>') + '</div>';
      }
      html += '<h3 class="rv" style="margin:' + (wk ? "28px" : "0") + ' 0 12px">' + (wk ? "Next week" : "This week") + ' <span class="cap">· ' + esc(short(add(start, off))) + '</span></h3><div class="ptoweek">' + cols + '</div>';
    });
    var up = D.pto.filter(function (p) { return p.to >= add(start, 14); }).sort(function (a, b) { return a.from < b.from ? -1 : 1; });
    $("pto").innerHTML = '<div class="head rv"><h2>Who is out</h2><span class="label muted">PTO · weekly</span></div>' + html +
      '<h3 class="rv" style="margin-top:32px">Further out</h3><div class="rv">' + (up.length ? up.map(function (p) { return '<div class="row"><span><b>' + esc(p.name) + '</b> <span class="muted">' + esc(p.kind) + '</span></span><span class="cap">' + esc(short(p.from)) + (p.to !== p.from ? " – " + esc(short(p.to)) : "") + '</span></div>'; }).join("") : '<p class="cap">Nothing scheduled.</p>') + '</div>' +
      '<p class="cap">From the out-of-office list in Slack #important-dates. Remaining PTO balances are kept in payroll, not here.</p>';
    reveal();
  }

  // ---------- footer, reveal, theme, nav ----------
  function renderFoot() {
    $("foot").textContent = "Staff only. Data as of " + short(D.asOf) + " from Planning Center, Google Drive and Slack. Times Eastern.";
  }
  function reveal() {}

  if ($("signout")) $("signout").onclick = function () { try { sessionStorage.removeItem("gm-in"); } catch (e) {} location.reload(); };
  $("theme").onclick = function () {
    var root = document.documentElement, dark = root.getAttribute("data-theme") ? root.getAttribute("data-theme") === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", dark ? "light" : "dark"); store.set("gm-theme", dark ? "light" : "dark");
  };
  var th = store.get("gm-theme"); if (th) document.documentElement.setAttribute("data-theme", th);


  // ---------- live sync: the viewer's own connectors, refreshed every 15 minutes ----------
  // The saved snapshot paints first; Planning Center and Slack results are merged over it when this viewer has them connected.
  var SYNC = { mcp: null, state: {}, at: 0, busy: false }, PCO = "Planning Center", SLK = "Slack", SLACK_CH = "C08777PFT25";
  var SRC = [["calendar", "Calendar", "Planning Center"], ["attendance", "Attendance", "Planning Center"], ["giving", "Giving", "Planning Center"], ["slack", "Dates, PTO, birthdays", "Slack"]];
  var fTime = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });
  function etParts(utcStr) {
    var o = {};
    new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "numeric", minute: "2-digit", hour12: true }).formatToParts(new Date(utcStr)).forEach(function (x) { o[x.type] = x.value; });
    return { iso: o.year + "-" + o.month + "-" + o.day, t: o.hour + ":" + o.minute + " " + String(o.dayPeriod).toUpperCase() };
  }
  function call(server, tool, input) { return SYNC.mcp.callTool(server, tool, input, { cache: false }).then(function (r) { var p = r && r.payload; if (typeof p === "string") { try { p = JSON.parse(p); } catch (e) {} } return p || {}; }); }
  function pages(tool, input, max) {
    var out = [];
    return (function next(tok, n) {
      var q = Object.assign({}, input); if (tok) q.page_after = tok;
      return call(PCO, tool, q).then(function (p) { out = out.concat(p.data || []); return p.has_more && p.next_page_token && n < max ? next(p.next_page_token, n + 1) : { data: out, included: p.included || [], meta: p.meta || {} }; });
    })(null, 1);
  }
  function why(e) {
    var c = e && e.code;
    return c === "server_not_connected" || c === "selection_required" ? "not connected" : c === "needs_reauth" ? "reconnect needed" : c === "not_in_manifest" || c === "blocked_by_policy" || c === "consent_required" ? "not allowed" : c === "tool_error" ? "no access" : "unavailable";
  }
  var words = function (s) { return String(s).toLowerCase().replace(/\([^)]*\)/g, " ").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean); };
  var evKey = function (e) { return e.d + "|" + words(e.title).slice(0, 2).join(" "); };

  function pullCalendar() {
    var lastDay = add(TODAY, 100);
    return pages("calendar_event_instances", { starts_at_start: TODAY, starts_at_end: lastDay, order_by: "starts_at", per_page: 100, output_fields: ["name", "starts_at", "ends_at", "all_day_event"] }, 4).then(function (r) {
      var count = {}; r.data.forEach(function (i) { var n = String(i.attributes.name || "").trim().toLowerCase(); count[n] = (count[n] || 0) + 1; });
      return r.data.filter(function (i) { return count[String(i.attributes.name || "").trim().toLowerCase()] < 3; }).map(function (i) { // repeating events are the weekly rhythm, not dated moments
        var a = i.attributes, s = etParts(a.starts_at); return { d: s.iso, t: a.all_day_event ? "" : s.t, title: String(a.name || "").trim(), cat: "Church life", src: "pco" };
      });
    });
  }
  function pullAttendance() {
    return call(PCO, "check_ins_headcounts", { order_by: "-created_at", per_page: 100, include: ["event_time", "attendance_type"], created_at_start: add(TODAY, -75) }).then(function (p) {
      var inc = {}; (p.included || []).forEach(function (i) { inc[i.type + i.id] = i.attributes; });
      var by = {};
      (p.data || []).forEach(function (h) {
        var rel = h.relationships || {}, et = inc["EventTime" + ((rel.event_time || {}).data || {}).id], at = inc["AttendanceType" + ((rel.attendance_type || {}).data || {}).id];
        if (!et || !at) return;
        var d = etParts(et.starts_at).iso, r = by[d] || (by[d] = { d: d, inPerson: 0, online: 0, n: 0 });
        if (/online/i.test(at.name)) r.online += h.attributes.total; else { r.inPerson += h.attributes.total; r.n++; }
      });
      var old = {}; D.attendance.forEach(function (a) { old[a.d] = a; });
      var rows = Object.keys(by).sort().map(function (k) { return by[k]; }).filter(function (r) { return r.d <= TODAY && wdOf(r.d) === 0 && (r.inPerson || r.online); }).slice(-8);
      if (!rows.length) throw { code: "tool_error" };
      rows.forEach(function (r) { if (r.n < D.services.length) { r.partial = true; r.note = (old[r.d] && old[r.d].note) || "Not every service count is entered yet."; } else if (old[r.d] && old[r.d].note) r.note = old[r.d].note; delete r.n; });
      D.attendance = rows; var i = rows.length - 1; while (i > 0 && rows[i].partial) i--; selA = i;
    });
  }
  function pullGiving() {
    var q = parts(TODAY), first = q.y + "-" + p2(q.m) + "-01", py = q.m === 1 ? q.y - 1 : q.y, pm = q.m === 1 ? 12 : q.m - 1;
    var pDays = new Date(Date.UTC(py, pm, 0)).getUTCDate(), pFirst = py + "-" + p2(pm) + "-01", pSame = py + "-" + p2(pm) + "-" + p2(Math.min(q.d, pDays));
    var don = function (a, b) { return call(PCO, "giving_donations", { received_at_start: a, received_at_end: b, include_totals: true, per_page: 1, output_fields: ["amount_cents"] }); };
    var dnr = function (a, b) { return call(PCO, "giving_donors", { received_at_start: a, received_at_end: b, per_page: 1, output_fields: ["id"] }); };
    return Promise.all([don(first, TODAY), don(pFirst, pSame), dnr(first, TODAY), dnr(pFirst, pSame)]).then(function (r) {
      var cents = function (p) { return p.meta && p.meta.received_total_amount_cents; }, n = function (p) { return p.meta && p.meta.total_count; };
      if (cents(r[0]) == null || n(r[2]) == null) throw { code: "tool_error" };
      D.giving = { asOf: TODAY, mtd: Math.round(cents(r[0]) / 100), lastMonthSameDay: Math.round((cents(r[1]) || 0) / 100), units: n(r[2]), lastMonthUnits: n(r[3]) || 0 };
    });
  }
  function parseImportant(text) {
    var m = /Upcoming Activities[\s\S]*?\[\d{4}-\d{2}-\d{2}[^\]]*\]/.exec(text); if (!m) throw { code: "tool_error" };
    var cur = parts(TODAY), yearFor = function (mo) { return cur.y + (mo < cur.m && cur.m - mo > 6 ? 1 : 0); };
    var section = "act", month = cur.m, acts = [], pto = [], bds = [];
    m[0].split("\n").forEach(function (raw) {
      var l = raw.replace(/\*/g, "").replace(/:[a-z_]+:/g, "").trim(); if (!l || l.charAt(0) === "[") return;
      var bullet = /^[••]\s*/.test(l); l = l.replace(/^[••]\s*/, "").trim();
      if (!bullet) {
        if (/out of office/i.test(l)) section = "pto"; else if (/birthdays/i.test(l)) section = "bd"; else if (/upcoming activities/i.test(l)) section = "act";
        else { var mi = MON.map(function (x) { return x.toLowerCase(); }).indexOf(l.toLowerCase()); if (mi > -1) { month = mi + 1; section = "act"; } }
        return;
      }
      if (section === "act") {
        var a = /^(\d{1,2})(?:-(\d{1,2}))?\s+-\s+(.+)$/.exec(l); if (!a) return;
        var title = a[3].trim(), t = "", tm = /^(\d{1,2}(?::\d{2})?)\s?(am|pm)\s+(.*)$/i.exec(title);
        if (tm) { t = (tm[1].indexOf(":") > -1 ? tm[1] : tm[1] + ":00") + " " + tm[2].toUpperCase(); title = tm[3]; }
        var y = yearFor(month), e = { d: y + "-" + p2(month) + "-" + p2(+a[1]), t: t, title: title.replace(/\s*\([^)]*\)\s*$/, "").trim(), cat: "Church life", key: true, src: "slack" };
        var note = /\(([^)]*)\)\s*$/.exec(title); if (note) e.note = note[1];
        if (a[2]) e.end = y + "-" + p2(month) + "-" + p2(+a[2]);
        acts.push(e);
      } else if (section === "pto") {
        var ix = l.indexOf(" - "); if (ix < 0) return;
        var name = l.slice(0, ix).trim(), segs = l.slice(ix + 3).split(","), mo = cur.m, rows = [];
        segs.forEach(function (sg) {
          var k = /\(([^)]+)\)/.exec(sg), d = /^(?:([A-Za-z]{3})[a-z]*\.?\s+)?(\d{1,2})(?:\s*-\s*(\d{1,2}))?$/.exec(sg.replace(/\([^)]*\)/, "").trim());
          if (!d) return;
          if (d[1]) { var mi2 = MON.map(function (x) { return x.slice(0, 3).toLowerCase(); }).indexOf(d[1].toLowerCase()); if (mi2 > -1) mo = mi2 + 1; }
          var yy = yearFor(mo); rows.push({ name: name, from: yy + "-" + p2(mo) + "-" + p2(+d[2]), to: yy + "-" + p2(mo) + "-" + p2(+(d[3] || d[2])), kind: k ? k[1].trim() : "" });
        });
        var carry = "PTO"; for (var r = rows.length - 1; r >= 0; r--) { if (rows[r].kind) carry = rows[r].kind; else rows[r].kind = carry; rows[r].kind = /^conference/i.test(rows[r].kind) ? "Conference" : rows[r].kind; }
        pto = pto.concat(rows);
      } else if (section === "bd") {
        var b = /^(.+?)\s+-\s+([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})$/.exec(l); if (!b) return;
        var bi = MON.map(function (x) { return x.slice(0, 3).toLowerCase(); }).indexOf(b[2].toLowerCase()); if (bi > -1) bds.push({ name: b[1].trim(), md: p2(bi + 1) + "-" + p2(+b[3]) });
      }
    });
    return { acts: acts, pto: pto, bds: bds };
  }
  function pullSlack() {
    return call(SLK, "slack_read_channel", { channel_id: SLACK_CH, limit: 6, response_format: "concise" }).then(function (p) {
      var text = typeof p === "string" ? p : (p && p.messages) || ""; var r = parseImportant(text);
      D.pto = r.pto; if (r.bds.length) D.birthdays = r.bds; return r.acts;
    });
  }
  function mergeEvents(pco, slack) {
    var map = {}, order = [];
    var put = function (e) { var k = evKey(e), x = map[k]; if (!x) { map[k] = e; order.push(k); } else { ["t", "note", "end", "cat"].forEach(function (f) { if (!x[f] && e[f]) x[f] = e[f]; }); x.key = x.key || e.key; } };
    D.events.forEach(function (e) { if (!pco || e.d < TODAY || e.key) put(e); });  // curated moments and anything already past stay
    (slack || []).forEach(put);
    var curated = {}; order.forEach(function (k) { curated[k] = 1; });
    (pco || []).forEach(function (e) { if (!curated[evKey(e)] && /birthday|baby shower|party|wedding|funeral|memorial|rental|private/i.test(e.title)) return; put(e); }); // private rentals stay off the staff view unless Slack announced them
    D.events = order.map(function (k) { return map[k]; }).sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
  }
  function rerender() {
    var open = document.querySelector(".tile.open"), id = open ? open.id.slice(2) : null;
    renderShell(); renderCalendar(); renderGiving(); renderAttendance(); renderPeople(); renderWord(); renderCampaign(); renderPto();
    if (id) toggleTile(id, true);
  }
  function setBar() {
    var ok = SRC.filter(function (s) { return SYNC.state[s[0]] === "live"; }).length, bar = $("statusbar"); if (!bar) return;
    var txt = SYNC.busy ? "Updating..." : ok ? "Live · updated " + fTime.format(new Date(SYNC.at)) + (ok < SRC.length ? " · " + (SRC.length - ok) + " saved" : "") : "Saved copy · " + short(D.asOf);
    $("sb-text").textContent = txt; if ($("live-cap")) $("live-cap").textContent = txt; bar.classList.toggle("is-live", ok > 0 && !SYNC.busy); $("refresh").disabled = SYNC.busy;
  }
  function showSources() {
    var rows = SRC.map(function (s) {
      var st = SYNC.state[s[0]]; var label = st === "live" ? "Live" : st && st !== "saved" ? "Saved copy · " + esc(st) : "Saved copy";
      return '<div class="row"><span><b>' + esc(s[1]) + '</b> <span class="muted">' + esc(s[2]) + '</span></span><span class="cap">' + label + '</span></div>';
    }).join("");
    openModal('<div class="label muted">Data sources</div><h2 id="m-title" style="margin:6px 0 12px">What is live</h2>' + rows +
      '<p class="cap" style="margin-top:14px">Live data comes from your own Planning Center and Slack connections in Claude and refreshes every 15 minutes. Anything not live shows the saved copy from ' + esc(short(D.asOf)) + '. Giving needs a Planning Center login with Giving access. Campaign details are updated by the team.</p>');
  }
  async function refresh() {
    if (SYNC.busy || !SYNC.mcp) return; SYNC.busy = true; setBar();
    var out = {}, pco = null, slack = null;
    var run = function (key, fn) { return fn().then(function (v) { SYNC.state[key] = "live"; return v; }, function (e) { SYNC.state[key] = why(e); return null; }); };
    await Promise.all([run("calendar", pullCalendar).then(function (v) { pco = v; }), run("attendance", pullAttendance), run("giving", pullGiving), run("slack", pullSlack).then(function (v) { slack = v; })]);
    if (SYNC.state.calendar === "live" || SYNC.state.slack === "live") mergeEvents(pco, slack);
    SYNC.busy = false; if (SRC.some(function (s) { return SYNC.state[s[0]] === "live"; })) SYNC.at = Date.now();
    rerender(); setBar();
  }
  function startSync() {
    $("srcs").onclick = showSources; $("refresh").onclick = function () { refresh(); };
    setBar();
    if (!window.claude || !window.claude.use) return;
    window.claude.use("mcp").then(function (m) {
      if (!m) return; SYNC.mcp = m; refresh();
      setInterval(function () { if (!document.hidden) refresh(); }, 15 * 60 * 1000);
      document.addEventListener("visibilitychange", function () { if (!document.hidden && Date.now() - SYNC.at > 5 * 60 * 1000) refresh(); });
    }, function () {});
  }

  renderShell(); renderHero(); renderTabbar(); renderAvatar(); renderCalendar(); renderGiving(); renderAttendance(); renderPeople(); renderWord(); renderCampaign(); renderPto(); renderFoot();
  setTimeout(function () { $("app").classList.add("settled"); }, 2600);
  startSync();
  if (window.GMAsk) window.GMAsk(who);
};
