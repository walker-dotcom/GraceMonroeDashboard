(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var DOMAIN = "@gfc.tv";
  try { var th = localStorage.getItem("gm-theme"); if (th) document.documentElement.setAttribute("data-theme", th); } catch (e) {}

  function enter(D, who) { $("gate").hidden = true; $("app").hidden = false; window.GMStart(D, who); }
  function show(title, msg, actions) {
    $("g-title").textContent = title; $("g-msg").textContent = msg;
    var box = $("g-actions"); box.textContent = ""; (actions || []).forEach(function (a) { box.appendChild(a); });
  }
  function button(label, fn) { var b = document.createElement("button"); b.className = "btn"; b.type = "button"; b.textContent = label; b.onclick = fn; return b; }
  function firstName(name) { return (name || "").trim().split(/\s+/)[0]; }

  // Local preview (no Claude runtime): open the dashboard with the bundled data file.
  if (!window.claude || !window.claude.use) { if (window.GM) enter(window.GM, {}); else show("Staff sign-in", "Open this page from claude.ai to sign in.", []); return; }

  async function load(who) {
    show("Opening the dashboard", "One moment.", []);
    try {
      var db = await window.claude.use("db");
      if (!db) return show("Can't open the dashboard", "Sign in to Claude with your gfc.tv account and reload this page.", []);
      var snap = await db.doc("dashboard/data").get();
      if (!snap.exists) return show("Dashboard is being set up", "The data isn't loaded yet. Ask the dashboard owner to refresh it.", []);
      enter(snap.data(), who);
    } catch (e) { show("Can't open the dashboard", "Something went wrong loading the data. Reload to try again.", [button("Reload", function () { location.reload(); })]); }
  }

  // Who may enter: members of the organization that owns this page (the gfc.tv workspace). Guests invited from outside are refused.
  (async function () {
    show("Staff sign-in", "Checking your account.", []);
    var user = await window.claude.use("user"), me = user ? await user.me() : null, id = me && me.id;
    if (!id) return show("We couldn't confirm your account", "Open this page while signed in to Claude with your " + DOMAIN + " account, then reload.", []);
    var prof = (await user.profiles([id]))[id] || {};
    if (prof.guest) return show("Staff accounts only", "This dashboard is for Grace Monroe staff (" + DOMAIN + " accounts). You are signed in as an outside guest. Switch to your staff account in Claude and reload.", []);
    var who = { first: firstName(me.name), name: me.name || "" };
    var again = false; try { again = sessionStorage.getItem("gm-in") === id; } catch (e) {}
    if (again) return load(who);
    show("Welcome" + (who.first ? ", " + who.first : ""), "Signed in" + (me.name ? " as " + me.name : "") + ". This page is for Grace Monroe staff.", [button("Open the dashboard", function () { try { sessionStorage.setItem("gm-in", id); } catch (e) {} load(who); })]);
  })();
})();
