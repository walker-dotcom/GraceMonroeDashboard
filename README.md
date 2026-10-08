# Grace Monroe Staff Dashboard

A mobile-first staff dashboard (phones, tablets, desktop). Tiles show a summary; tap one to open its detail in place.
Built with the "Grace Monroe" design system (slate and blue-gray palette, marigold header, thin-line triangle icons).

## Where it runs
- **Today: a Claude artifact.** Staff sign-in (Grace Monroe organization members only), a personal greeting, saved data in the artifact database, and live data from each viewer's own Planning Center and Slack connections.
- **Next: a PWA from this repo.** `manifest.webmanifest`, `sw.js` and `icons/` are ready. Open `index.html` locally to preview (no sign-in or live sync outside Claude).

## Ask Grace Monroe
A search card at the top of the dashboard (`ask.js`). Staff ask a question about the handbook, SOPs or policies; Claude searches Google Drive (and public Slack channels) with the viewer's own access, reads the best matches and answers in the conversation view, ending with the document name and its link in the answer text. It answers only from documents it finds, says so when it can't, and sends anything about a specific person or situation (HR, safeguarding, legal, pastoral) to Julie Marijanich. Needs the Claude runtime, so the card is hidden outside it.

## Data and how it stays current
| Section | Saved copy (artifact database `dashboard/data`, seeded from `data/data.js`) | Live refresh (every 15 min, on return to the app, and the Refresh button) |
|---|---|---|
| Calendar | curated churchwide moments + weekly rhythm | Planning Center calendar (one-off events) + Slack #important-dates activities |
| Attendance | last 8 Sundays | Planning Center Check-Ins headcounts |
| Giving | not connected | Planning Center Giving, only for viewers whose login has Giving access |
| Birthdays, PTO | Slack list | Slack #important-dates (Out of Office, Birthdays) |
| Bold Springs, Divvy, Sunday word | updated by the team | not live |
Anything that can't refresh falls back to the saved copy, and the status bar says what is live. Private rentals (birthday parties, showers, weddings) that appear only in Planning Center are left off.

## Moving to a PWA (seams to replace)
1. **Sign-in** (`gate.js`): replace the Claude identity check with Google Workspace sign-in restricted to gfc.tv.
2. **Saved data** (the `dashboard/data` doc): serve it from an authenticated API instead.
3. **Live sources** (the sync block in `app.js`): move the Planning Center, Slack and Drive pulls to a server job so every staff member gets live data without their own connections.
`sw.js` caches only the static shell; staff data is never stored offline. Hosting outside Claude puts Tier 3 data (giving, PTO) on another system, so it needs Julie Marijanich's written approval first.

## Open items
- Giving needs a Planning Center login with Giving access (live for anyone who has it).
- Work anniversaries need hire dates. The Sunday-word quote is entered by a person.
- Divvy: reminders on the 3rd and 17th as requested; Slack says reconciliation is the 5th and 20th. Confirm.
- Replace the header triangle with the official vector logo.

## Guardrails (church AI policy)
Giving and PTO are Tier 3 (approval from Julie Marijanich confirmed by the requester). Staff only; no member-level data. Nothing is sent or published automatically; live pulls are read-only and run as the signed-in viewer.
