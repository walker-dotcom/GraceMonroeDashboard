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
  function firstName(name, email) {
    var n = (name || "").trim().split(/\s+/)[0];
    if (n) return n;
    var l = email.split("@")[0].split(/[._-]/)[0].replace(/[^a-z]/gi, "");
    return l ? l.charAt(0).toUpperCase() + l.slice(1).toLowerCase() : "";
  }

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

  (async function () {
    show("Staff sign-in", "Checking your account.", []);
    var user = await window.claude.use("user"), me = user ? await user.me() : null, email = me && me.email ? me.email.toLowerCase() : "";
    if (!email) return show("We couldn't confirm your account", "Open this page while signed in to Claude with your " + DOMAIN + " account. If you are, your organization may be hiding email addresses from pages; ask the dashboard owner.", []);
    if (email.slice(-DOMAIN.length) !== DOMAIN) return show("Staff accounts only", "This dashboard is for " + DOMAIN + " accounts. You are signed in as " + email + ". Switch accounts in Claude and reload.", []);
    var who = { first: firstName(me.name, email), name: me.name || "", email: email };
    var again = false; try { again = sessionStorage.getItem("gm-in") === email; } catch (e) {}
    if (again) return load(who);
    show("Welcome, " + (who.first || "friend"), "Signed in as " + (me.name ? me.name + " · " : "") + email + ".", [button("Open the dashboard", function () { try { sessionStorage.setItem("gm-in", email); } catch (e) {} load(who); })]);
  })();
})();
