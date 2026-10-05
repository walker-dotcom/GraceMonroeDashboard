(function () {
  "use strict";
  var D = window.GM, TZ = D.tz;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  function fmt(opts) { return new Intl.DateTimeFormat("en-US", Object.assign({ timeZone: TZ }, opts)); }
  var fTime = fmt({ hour: "numeric", minute: "2-digit" }), fMon = fmt({ month: "short" }), fDay = fmt({ day: "numeric" }),
      fWd = fmt({ weekday: "short" }), fLong = fmt({ weekday: "long", month: "long", day: "numeric" }), fHour = fmt({ hour: "numeric", hour12: false });
  function parts(d) { var o = {}; fmt({ year: "numeric", month: "numeric", day: "numeric", weekday: "short" }).formatToParts(d).forEach(function (p) { o[p.type] = p.value; }); return { y: +o.year, m: +o.month, d: +o.day, wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday) }; }
  // Instant for h:mm Eastern on a calendar day (handles daylight saving)
  function etInstant(y, m, d, h, mi) {
    for (var off = 4; off <= 5; off++) { var t = new Date(Date.UTC(y, m - 1, d, h + off, mi)); if (+fHour.format(t) % 24 === h) return t; }
    return new Date(Date.UTC(y, m - 1, d, h + 4, mi));
  }
  var asOfStart = etInstant.apply(null, D.asOf.split("-").map(Number).concat([8, 0]));
  var skew = Math.max(0, asOfStart - Date.now()); // if the clock is behind the data date, treat the data date as today
  var now = function () { return new Date(Date.now() + skew); };

  // ---------- hero: countdown to next Sunday service ----------
  function nextService() {
    var n = now(), p = parts(n);
    for (var i = 0; i < 9; i++) {
      var dt = new Date(Date.UTC(p.y, p.m - 1, p.d + i, 12)), q = parts(dt);
      if (q.wd !== 0) continue;
      var times = [[9, 0], [11, 0]];
      for (var k = 0; k < times.length; k++) { var t = etInstant(q.y, q.m, q.d, times[k][0], times[k][1]); if (t - n > -90 * 60000) return { at: t, label: D.services[k], day: dt }; }
    }
  }
  function renderHero() {
    var s = nextService();
    $("now").innerHTML =
      '<div class="eyebrow">Next gathering</div>' +
      '<h1>' + esc(fLong.format(s.day)) + '</h1>' +
      '<div class="eyebrow" style="margin-top:8px">Sunday services · ' + esc(D.services.join(" & ")) + '</div>' +
      '<div class="count" id="count" aria-live="off"></div>' +
      '<div class="chips"><span class="pill">Series: ' + esc(D.series) + '</span><span class="pill ghost">Wednesday · 6:00 PM</span><span class="pill ghost">' + esc(D.address) + '</span></div>';
    tick(s);
    clearInterval(renderHero.t); renderHero.t = setInterval(function () { tick(s); }, 1000);
  }
  function tick(s) {
    var ms = s.at - now(), el = $("count"); if (!el) return;
    if (ms <= 0) { el.innerHTML = '<div style="min-width:0;padding:14px 22px"><b style="font-size:26px">Services are underway</b></div>'; return; }
    var d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, sec = Math.floor(ms / 1e3) % 60;
    el.innerHTML = [[d, "days"], [h, "hours"], [m, "min"], [sec, "sec"]].map(function (x) { return '<div><b>' + String(x[0]).padStart(2, "0") + '</b><span>' + x[1] + '</span></div>'; }).join("");
  }

  // ---------- week strip ----------
  var sel = parts(now()).wd;
  function renderWeek() {
    var todayWd = parts(now()).wd;
    $("rhythm").innerHTML = '<h2>The weekly <em>rhythm</em></h2><div class="strip" role="group" aria-label="Weekly rhythm">' + D.week.map(function (w, i) {
      return '<button class="day' + (i === todayWd ? " today" : "") + '" data-i="' + i + '" aria-pressed="' + (i === sel) + '"><div class="d">' + w.d + '</div><div class="m">' + esc(w.main) + '</div><div class="s">' + esc(w.sub) + '</div></button>';
    }).join("") + '</div><div class="detail" id="detail"></div>';
    showDay();
  }
  function showDay() { $("detail").innerHTML = '<ul>' + D.week[sel].lines.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join("") + '</ul>'; }

  // ---------- moments ----------
  var cat = "All";
  function mStart(m) { return m.allDay ? etInstant.apply(null, m.start.split("-").map(Number).concat([0, 0])) : new Date(m.start); }
  function mEnd(m) { return m.allDay ? etInstant.apply(null, m.end.split("-").map(Number).concat([23, 59])) : (m.end ? new Date(m.end) : new Date(+new Date(m.start) + 36e5)); }
  function when(m) {
    var s = mStart(m);
    if (m.allDay) return fMon.format(s) + " " + fDay.format(s) + " – " + fMon.format(mEnd(m)) + " " + fDay.format(mEnd(m));
    return fWd.format(s) + " · " + fTime.format(s) + (m.end ? " – " + fTime.format(new Date(m.end)) : "");
  }
  function renderMoments() {
    var cats = ["All"].concat(D.moments.reduce(function (a, m) { return a.indexOf(m.cat) < 0 ? a.concat(m.cat) : a; }, []));
    var list = D.moments.filter(function (m) { return mEnd(m) >= now() && (cat === "All" || m.cat === cat); }).sort(function (a, b) { return mStart(a) - mStart(b); });
    $("moments").innerHTML = '<div class="head"><h2>Churchwide <em>moments</em></h2><div class="arrows"><button class="btn" data-dir="-1" aria-label="Scroll left">←</button><button class="btn" data-dir="1" aria-label="Scroll right">→</button></div></div><div class="filters" role="group" aria-label="Filter moments">' +
      cats.map(function (c) { return '<button class="f" data-c="' + esc(c) + '" aria-pressed="' + (c === cat) + '">' + esc(c) + '</button>'; }).join("") + '</div>' +
      '<div class="rail">' + (list.map(function (m) {
        var s = mStart(m);
        return '<button class="card" data-id="' + m.id + '"><span class="tag ' + esc(m.cat) + '">' + esc(m.cat) + '</span><div class="date"><b>' + fDay.format(s) + '</b><span>' + fMon.format(s) + '<br>' + fWd.format(s) + '</span></div><h3>' + esc(m.title) + '</h3><div class="t">' + esc(m.allDay ? when(m) : fTime.format(s)) + '</div></button>';
      }).join("") || '<p class="muted">Nothing upcoming in this category.</p>') + '</div>';
  }

  // ---------- calendar export + modal ----------
  function ics(m) {
    var z = function (d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); };
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Grace Monroe//Dashboard//EN", "BEGIN:VEVENT", "UID:" + m.id + "@gracemonroe-dashboard", "DTSTAMP:" + z(new Date()), "SUMMARY:" + m.title];
    if (m.allDay) { var e = new Date(mEnd(m).getTime() + 864e5), ymd = function (d) { var p = parts(d); return "" + p.y + String(p.m).padStart(2, "0") + String(p.d).padStart(2, "0"); };
      lines.push("DTSTART;VALUE=DATE:" + ymd(mStart(m)), "DTEND;VALUE=DATE:" + ymd(e)); }
    else lines.push("DTSTART:" + z(mStart(m)), "DTEND:" + z(mEnd(m)));
    lines.push("LOCATION:" + (m.place || ""), "DESCRIPTION:" + (m.blurb || ""), "END:VEVENT", "END:VCALENDAR");
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(lines.join("\r\n"));
  }
  var lastFocus;
  function openModal(m) {
    lastFocus = document.activeElement;
    $("mbody").innerHTML = '<span class="tag ' + esc(m.cat) + '">' + esc(m.cat) + '</span><h3 id="m-title">' + esc(m.title) + '</h3><div class="meta">' + esc(when(m)) + (m.noEnd ? " (end time not set)" : "") + '<br>' + esc(m.place || "") + '</div><p>' + esc(m.blurb || "") + '</p>' +
      '<div class="acts"><a class="pill" href="' + ics(m) + '" download="' + esc(m.id) + '.ics">Add to calendar</a>' + (m.url ? '<a class="pill ghost" href="' + esc(m.url) + '" target="_blank" rel="noopener">' + esc(m.cta || "Open") + ' ↗</a>' : "") + '</div>';
    $("modal").hidden = false; $("mx").focus();
  }
  function closeModal() { $("modal").hidden = true; if (lastFocus) lastFocus.focus(); }

  // ---------- campaign ----------
  var step = -1;
  function renderCamp() {
    var C = D.campaign, n = now(), a = etInstant.apply(null, C.prayer.start.split("-").map(Number).concat([0, 0])), b = etInstant.apply(null, C.prayer.end.split("-").map(Number).concat([23, 59]));
    var pct = Math.max(0, Math.min(1, (n - a) / (b - a))), r = 62, circ = 2 * Math.PI * r;
    var cur = C.steps.findIndex(function (s) { return etInstant.apply(null, s.end.split("-").map(Number).concat([23, 59])) >= n; });
    if (step < 0) step = cur;
    $("camp").innerHTML =
      '<h2>Campaign</h2><h3 class="big">' + esc(C.name) + '</h3><p>' + esc(C.tag) + '</p>' +
      '<div class="camp"><svg class="ring" viewBox="0 0 150 150" role="img" aria-label="100 Days of Prayer ' + (pct >= 1 ? "complete" : Math.round(pct * 100) + " percent") + '"><circle cx="75" cy="75" r="' + r + '" fill="none" stroke="rgba(244,232,222,.2)" stroke-width="8"/><circle cx="75" cy="75" r="' + r + '" fill="none" stroke="#f4e8de" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + circ + '" stroke-dashoffset="' + circ * (1 - pct) + '" transform="rotate(-90 75 75)"/><text x="75" y="76" text-anchor="middle">' + (pct >= 1 ? "100" : Math.round(pct * 100) + "%") + '</text><text class="l" x="75" y="98" text-anchor="middle">DAYS OF PRAYER</text></svg>' +
      '<div><div class="steps" role="group" aria-label="Campaign journey">' + C.steps.map(function (s, i) { return '<button class="step ' + (i < cur ? "done" : i === cur ? "now" : "") + '" data-s="' + i + '" aria-pressed="' + (i === step) + '"><span class="n">' + (i < cur ? "Done" : i === cur ? "Now" : "Next") + ' · ' + esc(s.when) + '</span><b>' + esc(s.t) + '</b></button>'; }).join("") + '</div>' +
      '<div class="say" id="say">' + esc(C.steps[step].s) + '</div><span class="nudge">' + esc(C.needs) + '</span></div></div>' +
      '<div class="links" style="margin-top:28px">' + C.links.map(function (l) { return '<a href="' + esc(l.u) + '" target="_blank" rel="noopener">' + esc(l.l) + ' ↗</a>'; }).join("") + '</div>';
  }

  // ---------- events ----------
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button,a"); if (!t) { if (e.target.id === "modal") closeModal(); return; }
    if (t.classList.contains("day")) { sel = +t.dataset.i; document.querySelectorAll(".day").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.i === sel)); }); showDay(); }
    else if (t.classList.contains("f")) { cat = t.dataset.c; renderMoments(); }
    else if (t.classList.contains("card")) openModal(D.moments.filter(function (m) { return m.id === t.dataset.id; })[0]);
    else if (t.classList.contains("step")) { step = +t.dataset.s; renderCamp(); }
    else if (t.dataset.dir) document.querySelector(".rail").scrollBy({ left: 290 * +t.dataset.dir, behavior: "smooth" });
    else if (t.id === "mx") closeModal();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("modal").hidden) closeModal(); });
  $("modal").addEventListener("click", function (e) { if (e.target === $("modal")) closeModal(); });
  $("theme").addEventListener("click", function () {
    var r = document.documentElement, dark = r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    r.dataset.theme = dark ? "light" : "dark"; try { localStorage.setItem("gm-theme", r.dataset.theme); } catch (x) {}
  });
  try { var th = localStorage.getItem("gm-theme"); if (th) document.documentElement.dataset.theme = th; } catch (x) {}

  $("links").innerHTML = D.links.map(function (l) { return '<a href="' + esc(l.u) + '" target="_blank" rel="noopener">' + esc(l.l) + ' ↗</a>'; }).join("");
  $("foot").textContent = "Our mission: " + D.mission + " · Data as of " + D.asOf + " from Planning Center and the Bold Springs master calendar. Staff only; please don't share links outside the church account.";
  renderHero(); renderWeek(); renderMoments(); renderCamp();
})();
