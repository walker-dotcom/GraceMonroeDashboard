# Grace Monroe Staff Dashboard

A friendly, interactive dashboard for Grace Monroe staff: this week at a glance, Sunday and midweek gathering times,
a filterable calendar, ministry cards with open registrations, and the **Bold Springs Campaign** timeline.

Open `index.html` in any browser. There is no build step and no server.

## Tabs
| Tab | What it shows |
|---|---|
| This Week | Next Sunday, current series, Wednesday time, next 7 days of events, open volunteer positions |
| Gatherings | Sunday services, kids sessions, team call sheet, classes, Wednesday and weekly rhythms, staff meetings |
| Calendar | Week-by-week view, ministry filters, search |
| Ministries | Per-ministry upcoming events and open signups, Church Center group types |
| Campaign | Bold Springs Campaign: phases, 100 Days of Prayer, timeline, open items, social rhythm |
| Resources | Links to Planning Center, sermons, campaign files, open registrations |

## Brand
Built from the Miner Creative logo deck: black and white, Sanchez slab wordmark, a Futura-style sans (Jost), rounded
line-work, and the slate navy + cream from the stationery mockups (used on the Campaign tab).
The triangle mark in the header is an SVG approximation; replace it with the official vector file when available.

## Data and refreshing
* `data/events.js` – Planning Center Calendar event instances. Regenerate with
  `python3 scripts/build_data.py <calendar_event_instances.json> > data/events.js`.
  Private rentals (baby showers, birthday parties) are filtered out in the script.
* `data/static.js` – gathering times (Planning Center Services plan times), open registrations, group types, campaign
  timeline (Bold Springs Campaign Master Calendar in Google Drive), and resource links. Edit by hand or ask Claude to refresh it.

Times are shown in Eastern time (`America/New_York`).

## Guardrails (per church AI policy)
* **No giving, pledge, or member-level data.** Giving data is Tier 3 and needs advance written approval from the Executive
  Director before it is added. A pledge-progress card for the campaign can be added once that approval is in place.
* The campaign host-home tracker (member addresses) is deliberately not imported.
* Anything published from this dashboard (public or donor-facing) needs staff or ministry-lead approval first.
* Don't share chat links; they create public URLs.
