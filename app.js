(function () {
  "use strict";
  var D = window.GM;
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
  var TRI = '<svg class="tri" viewBox="0 0 220 190" aria-hidden="true"><path d="M10 10 L210 95 L10 180 Z"/><path d="M10 45 L150 95 L10 145 Z"/><path d="M10 75 L90 95 L10 115 Z"/></svg>';
  function confetti(x, y) {
    if (reduce) return;
    for (var i = 0; i < 18; i++) {
      var c = document.createElement("i");
      c.className = "confetti"; c.style.left = x + "px"; c.style.top = y + "px";
      c.style.setProperty("--dx", (Math.random() * 280 - 40) + "px"); c.style.setProperty("--dy", (Math.random() * 240 - 140) + "px"); c.style.setProperty("--r", (Math.random() * 540 - 270) + "deg");
      document.body.appendChild(c); setTimeout(function (n) { n.remove(); }.bind(null, c), 1500);
    }
  }

  // ---------- modal + .ics ----------
  var modal = $("modal");
  function openModal(html) { $("mbody").innerHTML = html; modal.hidden = false; $("mx").focus(); }
  function closeModal() { modal.hidden = true; }
  $("mx").onclick = closeModal;
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  function ics(title, iso, endIso) {
    var s = iso.replace(/-/g, ""), e = add(endIso || iso, 1).replace(/-/g, "");
    var txt = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Grace Monroe//Staff Dashboard//EN", "BEGIN:VEVENT", "UID:" + s + "-" + encodeURIComponent(title) + "@gracemonroe", "DTSTAMP:" + s + "T000000Z",
      "DTSTART;VALUE=DATE:" + s, "DTEND;VALUE=DATE:" + e, "SUMMARY:" + title.replace(/[,;]/g, " "), "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(txt);
  }
  window.gmEvent = function (iso, idx) {
    var e = eventsOn(iso)[idx]; if (!e) return;
    openModal('<div class="label muted">' + esc(e.cat) + '</div><h2 id="m-title" style="margin:6px 0 12px">' + esc(e.title) + '</h2>' +
      '<p>' + esc(long(iso)) + (e.end && e.end !== iso ? " to " + esc(short(e.end)) : "") + (e.t ? " · " + esc(e.t) : "") + '</p>' + (e.note ? '<p class="muted">' + esc(e.note) + '</p>' : "") +
      '<p><a class="btn" style="display:inline-block;text-decoration:none" download="' + esc(e.title) + '.ics" href="' + ics(e.title, iso, e.end) + '">Add to calendar</a></p>');
  };

  // ---------- hero ----------
  function nextSunday() {
    // 9:00 AM Eastern on the next Sunday that has not started (approximate with ET wall-clock)
    var iso = TODAY, w = wdOf(iso);
    if (w === 0 && TODAY === real.iso && real.h >= 12) w = 7; // after services: aim for next week
    if (w === 0 && TODAY !== real.iso) w = 0;
    return add(iso, w === 0 ? 0 : 7 - w);
  }
  function renderHero() {
    var sun = nextSunday(), dv = nextDom(D.divvy.days, TODAY);
    var out = outOn(TODAY), q = parts(TODAY);
    var last = D.attendance.filter(function (a) { return !a.partial; }).slice(-1)[0];
    var launch = D.campaign.steps[2].start, lc = diff(TODAY, launch);
    var greet = (real.h < 12 ? "Good morning" : real.h < 17 ? "Good afternoon" : "Good evening");
    $("today").innerHTML = TRI +
      '<div class="label muted rv">' + esc(long(TODAY)) + '</div>' +
      '<h1 class="rv">' + esc(greet) + ', Grace Monroe.</h1>' +
      '<p class="muted rv" style="max-width:640px;margin:0">' + esc(D.mission) + '</p>' +
      '<div class="stats rv">' +
      '<button class="stat" data-go="calendar"><span class="label muted">Next Sunday</span><span class="n">' + diff(TODAY, sun) + 'd</span><span class="cap">' + esc(short(sun)) + ' · 9 &amp; 11 AM</span></button>' +
      '<button class="stat" data-go="divvy"><span class="label muted">Divvy reminder</span><span class="n">' + diff(TODAY, dv) + 'd</span><span class="cap">' + esc(short(dv)) + '</span></button>' +
      '<button class="stat" data-go="pto"><span class="label muted">Out today</span><span class="n">' + out.length + '</span><span class="cap">' + (out.length ? esc(out.map(function (o) { return o.name; }).join(", ")) : "Full team in") + '</span></button>' +
      '<button class="stat" data-go="campaign"><span class="label muted">Campaign launch</span><span class="n">' + (lc > 0 ? lc + "d" : lc === 0 ? "Today" : "Live") + '</span><span class="cap">' + esc(short(launch)) + '</span></button>' +
      '</div>';
    Array.prototype.forEach.call(document.querySelectorAll(".stat"), function (b) {
      b.onclick = function () { var t = $(b.getAttribute("data-go")) || $(b.getAttribute("data-go") === "divvy" ? "people" : "today"); if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); };
    });
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
      body.innerHTML = '<div class="week">' + out + '</div><p class="cap">Week of ' + esc(short(ws)) + '. Tap an event to add it to your calendar.</p>';
      var t = body.querySelector(".day.today"); if (t && window.innerWidth <= 820) body.querySelector(".week").scrollLeft = t.offsetLeft - 8;
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
    $("people").innerHTML =
      '<div class="card rv" id="bday"><div class="label muted">Staff birthdays</div><h3>Celebrate</h3>' + (bd.length ? bd.map(function (x) { return rowB(x); }).join("") : '<p class="cap">None coming up.</p>') +
      '<div class="label muted" style="margin-top:20px">Work anniversaries</div>' + (an.length ? an.map(function (x) { return rowB(x, function (y) { return y.yrs + " yrs"; }); }).join("") : '<p class="cap">No hire dates on file yet. Add them to data/data.js (anniversaries) and they show up here.</p>') +
      '<button class="btn ghost" id="party" style="margin-top:12px">Celebrate</button></div>' +
      '<div class="card rv" id="divvy"><div class="label muted">Divvy card reminder</div><div id="dv"></div></div>';
    $("party").onclick = function (e) { var r = e.target.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top); };
    var nx = nextDom(D.divvy.days, TODAY), n = diff(TODAY, nx),  span = 14, pct = Math.max(4, Math.min(100, Math.round((1 - n / span) * 100)));
    $("dv").innerHTML = '<div style="display:flex;gap:20px;align-items:center;margin-top:8px"><div class="ring" style="--p:' + pct + '"><span>' + n + 'd</span></div><div><h3 style="margin:0">' + esc(long(nx)) + '</h3><p class="cap" style="margin:4px 0 0">Reminders go out on the 3rd and 17th.</p></div></div>' +
      '<p style="margin:16px 0 8px">Snap receipts, add the memo line, and tag the budget code in Divvy.</p><p class="cap">' + esc(D.divvy.reconcile) + '</p><a class="btn" style="display:inline-block;text-decoration:none" href="' + esc(D.divvy.url) + '" target="_blank" rel="noopener">Open Divvy</a>';
    reveal();
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
      $("qs").onclick = function () { q = $("qt").value.trim(); by = $("qb").value.trim(); store.set("gm-quote", q); store.set("gm-quote-by", by); show(); };
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
    $("links").innerHTML = D.links.map(function (l) { return '<a href="' + esc(l.u) + '" target="_blank" rel="noopener">' + esc(l.l) + '</a>'; }).join("");
    $("foot").textContent = "Staff only. Data as of " + short(D.asOf) + " from Planning Center, Google Drive and Slack. Times Eastern.";
  }
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: .08 }) : null;
  function reveal() { Array.prototype.forEach.call(document.querySelectorAll(".rv:not(.in)"), function (n) { if (io) io.observe(n); else n.classList.add("in"); }); }

  $("theme").onclick = function () {
    var root = document.documentElement, dark = root.getAttribute("data-theme") ? root.getAttribute("data-theme") === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", dark ? "light" : "dark"); store.set("gm-theme", dark ? "light" : "dark");
  };
  var th = store.get("gm-theme"); if (th) document.documentElement.setAttribute("data-theme", th);

  $("numbers").innerHTML = '<div class="card rv" id="giving"></div><div class="card rv" id="attendance"></div>';
  renderHero(); renderCalendar(); renderGiving(); renderAttendance(); renderPeople(); renderWord(); renderCampaign(); renderPto(); renderFoot(); reveal();

  if ("IntersectionObserver" in window) {
    var links = document.querySelectorAll("nav a"), secs = Array.prototype.map.call(links, function (a) { return $(a.getAttribute("href").slice(1)); });
    var so = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) Array.prototype.forEach.call(links, function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); }); }); }, { rootMargin: "-40% 0px -55% 0px" });
    secs.forEach(function (s) { if (s) so.observe(s); });
  }
})();
