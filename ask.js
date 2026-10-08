/* "Ask Grace Monroe": a staff Q&A box for the handbook, SOPs and policies.
   Claude searches Google Drive (and public Slack channels) as the signed-in viewer, reads what it finds, and answers with links to the sources.
   Needs the Claude runtime (sample + mcp); outside it the card stays hidden. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var DRIVE = "Google Drive", SLACK = "Slack";
  var CHIPS = ["What is our wedding policy?", "How do I submit an eNews item?", "Social media SOP for staff", "What is the dress code?", "How does content creation work?"];
  var COPY = {
    not_granted: "Claude isn't allowed to answer for this page yet. Allow it when asked, or check with the dashboard owner.",
    sampling_disabled: "Claude isn't available for this account.",
    rate_limited: "That is a lot of questions at once. Wait a minute and ask again.",
    session_expired: "Your Claude session expired. Reload the page and sign in again.",
    refused: "Claude couldn't answer that one. Try asking it a different way.",
    empty_completion: "No answer came back. Try asking it a different way.",
    prompt_too_large: "This conversation got too long. Start a new question."
  };
  var RULES = [
    "You are Ask Grace Monroe, the staff assistant for Grace Monroe church (gfc.tv). Staff ask where things are and how things work, mostly in the staff handbook, SOPs (standard operating procedures) and policies kept in Google Drive. Today is {DATE}.",
    "How to work: ALWAYS search before answering. Use search_drive first (try 2 or 3 different keyword searches if the first finds little), then read_doc on the best 1 to 3 matches. Use search_slack only for recent announcements or when Drive has nothing.",
    "Answer only from what the documents say. Quote key wording briefly, give the steps as a short numbered list, and finish the answer with one line such as \"Where to find it: Document title, https://docs.google.com/...\" that gives the document name and its full link as plain text. Say when a document was last modified if it looks old (older than 2 years) and suggest confirming it is current.",
    "If you cannot find it, say so plainly, list what you searched, and suggest asking Julie Marijanich (Executive Director) or the ministry lead. Never guess or invent policy.",
    "Do not give pastoral care, counseling, spiritual direction or theological teaching, and do not advise on a specific person's HR, safeguarding, legal or health situation: say that belongs with Julie Marijanich or the pastoral team and point to the general policy only. Never repeat private details about members or staff.",
    "Be brief and warm. Plain language, no preamble. Use short paragraphs, **bold** for key terms and lists for steps."
  ].join("\n\n");

  function inline(s) {
    s = esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    return s.replace(/(https:\/\/(?:docs\.google\.com|drive\.google\.com|[a-z0-9-]+\.slack\.com)\/[^\s<)]*)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }
  function md(t) {
    var out = [], list = null;
    String(t).split("\n").forEach(function (l) {
      var b = /^\s*[-*•]\s+(.*)$/.exec(l), n = /^\s*\d+[.)]\s+(.*)$/.exec(l);
      if (b || n) { var tag = b ? "ul" : "ol"; if (list !== tag) { if (list) out.push("</" + list + ">"); out.push("<" + tag + ">"); list = tag; } out.push("<li>" + inline((b || n)[1]) + "</li>"); }
      else { if (list) { out.push("</" + list + ">"); list = null; } if (l.trim()) out.push("<p>" + inline(l) + "</p>"); }
    });
    if (list) out.push("</" + list + ">");
    return out.join("");
  }
  var kw = function (q, n) { var seen = {}; return String(q).toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2 && !/^(the|and|for|how|what|does|our|can|with|are|who|where|when|policy|policies)$/.test(w) && !seen[w] && (seen[w] = 1); }).slice(0, n); };

  window.GMAsk = async function (who) {
    var host = $("ask"); if (!host || !window.claude || !window.claude.use) return;
    var sample = await window.claude.use("sample"), mcp = await window.claude.use("mcp");
    if (!sample || !mcp) return;
    var lim = null; try { lim = await sample.limits(); } catch (e) {}
    if (!lim || !lim.tools) return;

    var turns = [], ctl = null, busy = false, docs = {};
    host.hidden = false;
    host.innerHTML = '<div class="ask-card"><div class="label" style="opacity:.85">Ask Grace Monroe</div>' +
      '<h2>Find it in the handbook.</h2><p class="ask-sub">Search the handbook, SOPs and policies. Claude finds the answer and shows where it came from.</p>' +
      '<form id="ask-form" class="ask-form"><label class="sr" for="ask-in">Ask a question</label><input id="ask-in" type="text" autocomplete="off" placeholder="Ask about a policy or how something works"><button class="btn ask-go" type="submit">Ask</button></form>' +
      '<div class="ask-chips">' + CHIPS.map(function (c) { return '<button type="button" class="chip" data-q="' + esc(c) + '">' + esc(c) + '</button>'; }).join("") + '</div></div>';

    var panel = document.createElement("div");
    panel.id = "askpanel"; panel.className = "askpanel"; panel.hidden = true; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Ask Grace Monroe");
    panel.innerHTML = '<div class="ask-top"><div><div class="label" style="opacity:.85">Ask Grace Monroe</div></div><div class="ask-top-btns"><button id="ask-new" class="btn ghost" type="button">New question</button><button id="ask-close" class="btn ghost" type="button">Close</button></div></div>' +
      '<div id="ask-log" class="ask-log" aria-live="polite"></div>' +
      '<div class="ask-foot"><div id="ask-status" class="cap"></div><form id="ask-form2" class="ask-form"><label class="sr" for="ask-in2">Follow-up question</label><input id="ask-in2" type="text" autocomplete="off" placeholder="Ask a follow-up"><button id="ask-send" class="btn ask-go" type="submit">Ask</button><button id="ask-stop" class="btn ghost" type="button" hidden>Stop</button></form>' +
      '<p class="cap ask-note">Answers come from documents you can already open. Check the source before you act. For anything about a specific person or situation, ask Julie.</p></div>';
    $("app").appendChild(panel);

    var log = $("ask-log"), status = $("ask-status");
    function say(role, html) { var d = document.createElement("div"); d.className = "msg " + role; d.innerHTML = (role === "a" ? '<div class="label muted">Grace Monroe</div>' : '<div class="label muted">' + esc(who && who.first ? who.first : "You") + '</div>') + '<div class="mb">' + html + '</div>'; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
    function toolErr(e, what) { var c = e && e.code; throw new Error(what + (c === "server_not_connected" || c === "selection_required" ? " isn't connected for this person" : c === "needs_reauth" ? " needs to be reconnected" : c === "not_in_manifest" || c === "consent_required" ? " isn't allowed for this page" : " could not be reached")); }
    var call = function (server, tool, input, ctx) { return mcp.callTool(server, tool, input, { cache: false, signal: ctx && ctx.signal }).then(function (r) { var p = r && r.payload; if (typeof p === "string") { try { p = JSON.parse(p); } catch (e) {} } return p || {}; }); };

    var tools = [
      { name: "search_drive", description: "Search the church's Google Drive for handbook pages, SOPs, policies and other documents. Returns up to 8 matches with id, title, type, modified date, link and a short snippet. Use short keyword queries.",
        inputSchema: { type: "object", properties: { query: { type: "string", description: "A few keywords, e.g. 'dress code' or 'event request'" } }, required: ["query"] },
        execute: async function (input, ctx) {
          var w = kw(input.query, 4); if (!w.length) throw new Error("Give 2 to 4 keywords");
          status.textContent = "Searching Drive for “" + w.join(" ") + "”...";
          var base = " and mimeType != 'application/vnd.google-apps.folder'";
          var run = function (q) { return call(DRIVE, "search_files", { query: q + base, pageSize: 8, snippetVerbosity: "BRIEF" }, ctx); };
          var r;
          try { r = await run(w.map(function (x) { return "fullText contains '" + x + "'"; }).join(" and ")); if (!(r.files || []).length && w.length > 1) r = await run("(" + w.map(function (x) { return "fullText contains '" + x + "'"; }).join(" or ") + ")"); } catch (e) { toolErr(e, "Google Drive"); }
          return (r.files || []).map(function (f) { docs[f.id] = { title: f.title, url: f.viewUrl }; return { id: f.id, title: f.title, type: String(f.mimeType || "").split(/[./]/).pop(), modified: String(f.modifiedTime || "").slice(0, 10), link: f.viewUrl, snippet: String(f.contentSnippet || "").replace(/\s+/g, " ").slice(0, 280) }; });
        } },
      { name: "read_doc", description: "Read the text of one Drive document by its id (from search_drive). Returns title, link and the text (long documents are cut at about 14,000 characters). Use it on the best matches before answering.",
        inputSchema: { type: "object", properties: { id: { type: "string", description: "The document id from search_drive" } }, required: ["id"] },
        execute: async function (input, ctx) {
          var id = String(input.id || ""), d = docs[id];
          status.textContent = "Reading " + (d ? "“" + d.title + "”" : "the document") + "...";
          var r; try { r = await call(DRIVE, "read_file_content", { fileId: id }, ctx); } catch (e) { toolErr(e, "Google Drive"); }
          var text = String(r.fileContent || ""), title = r.title || (d && d.title) || "Document", url = r.viewUrl || (d && d.url) || "";
          return { title: title, link: url, text: text.slice(0, 14000), truncated: text.length > 14000 };
        } },
      { name: "search_slack", description: "Search public Slack channels for recent announcements or discussion. Returns message text with channel and date. Use only for recent news or when Drive has nothing.",
        inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
        execute: async function (input, ctx) {
          var w = kw(input.query, 3); if (!w.length) throw new Error("Give 1 to 3 keywords");
          status.textContent = "Checking Slack for “" + w.join(" ") + "”...";
          var r; try { r = await call(SLACK, "slack_search_public", { keywords: w, natural_language_query: String(input.query).slice(0, 200), limit: 5, response_format: "concise", include_context: false }, ctx); } catch (e) { toolErr(e, "Slack"); }
          return String(typeof r === "string" ? r : r.results || r.messages || "").slice(0, 3500) || "No matches.";
        } }
    ];

    function setBusy(b) { busy = b; $("ask-send").hidden = b; $("ask-stop").hidden = !b; $("ask-in2").disabled = b; $("ask-go") && ($("ask-go").disabled = b); }

    async function ask(q) {
      q = String(q || "").trim(); if (!q || busy) return;
      panel.hidden = false; document.documentElement.style.overflow = "hidden";
      say("u", esc(q)); turns.push({ role: "user", content: q });
      var a = say("a", '<p class="muted">Looking through the handbook and SOPs...</p>'), body = a.querySelector(".mb"), got = false;
      ctl = new AbortController(); setBusy(true); status.textContent = "Searching...";
      var input = [{ role: "user", content: RULES.replace("{DATE}", new Date().toISOString().slice(0, 10)) }].concat(turns.slice(-8));
      try {
        var r = await sample(input, { signal: ctl.signal, tools: tools, onText: function (u) { got = true; body.innerHTML = md(u.text); log.scrollTop = log.scrollHeight; } });
        body.innerHTML = md(r.text) + (r.truncated ? '<p class="cap">The answer was cut short. Ask for less at a time.</p>' : "");
        turns.push({ role: "assistant", content: r.text });
      } catch (e) {
        if (e && e.text && got) { body.innerHTML = md(e.text) + '<p class="cap">The answer was interrupted.</p>'; turns.push({ role: "assistant", content: e.text }); }
        else { turns.pop(); body.innerHTML = e && e.code === "cancelled" ? '<p class="muted">Stopped.</p>' : '<p>' + esc(COPY[e && e.code] || "Couldn't get an answer. Try again.") + '</p>'; }
      } finally { setBusy(false); status.textContent = ""; ctl = null; log.scrollTop = log.scrollHeight; $("ask-in2").focus(); }
    }
    function close() { if (ctl) ctl.abort(); panel.hidden = true; document.documentElement.style.overflow = ""; }
    $("ask-form").onsubmit = function (e) { e.preventDefault(); var v = $("ask-in").value; $("ask-in").value = ""; ask(v); };
    $("ask-form2").onsubmit = function (e) { e.preventDefault(); var v = $("ask-in2").value; $("ask-in2").value = ""; ask(v); };
    Array.prototype.forEach.call(host.querySelectorAll(".chip"), function (c) { c.onclick = function () { ask(c.getAttribute("data-q")); }; });
    $("ask-close").onclick = close; $("ask-stop").onclick = function () { if (ctl) ctl.abort(); };
    $("ask-new").onclick = function () { if (ctl) ctl.abort(); turns = []; log.innerHTML = ""; $("ask-in2").focus(); };
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) close(); });
  };
})();
