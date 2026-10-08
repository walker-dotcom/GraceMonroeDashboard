# Grace Monroe Staff Dashboard

A simple, animated staff view for phone and desktop. Open `index.html` in any browser (no build step).
Built with the "Grace Monroe" design system: black and white, hairline rules, square corners, Sanchez + Jost,
thin right-pointing triangle outlines, quiet left-to-right motion, one slate accent (the campaign band).

## What's on it
| Section | Source | Status |
|---|---|---|
| Calendar (week / month / quarter) | Planning Center Calendar, Slack #important-dates | Live pull, Oct 8 |
| Giving month to date + giving units | PCO Giving | **Not connected** (needs a login with Giving access). Shows a "Not connected" card with a layout preview. |
| Church attendance | PCO Check-Ins headcounts (both services) | Live pull. Oct 4 is partial (Family Camp; only the 11:00 in-person count was entered). |
| Staff birthdays, work anniversaries | Slack #important-dates | Birthdays pulled. **Anniversaries need hire dates** (no source found). |
| Divvy reminders (3rd and 17th) | Rule in `data/data.js` | Live countdown. |
| Pastoral quote tied to the sermon | PCO Publishing (series), notebook | Quote slot. Pastor pastes a line from the sermon notebook; saved on that device only. |
| Bold Springs Campaign update | Drive master calendar, Slack | Journey, countdowns, update notes. |
| PTO (this week, next week, further out) | Slack #important-dates out-of-office list | Dates only, no balances. |

## Updating
All content is in `data/data.js`. To light up giving, fill in `giving` (shape is in the file comment).

## Open items
- Divvy: Slack (#staff-updates, Aug 2026) says receipts are reconciled on the **5th and 20th**; this dashboard reminds on the 3rd and 17th as requested. Confirm both.
- The Slack out-of-office list is the PTO source; confirm it is the right place or point to a PTO sheet.
- Replace the header triangle with the official vector logo (the design system has traced SVGs only).
- Launch invitation was still open on the campaign master calendar (Oct 6).

## Guardrails (church AI policy)
* Giving and PTO are Tier 3. Written approval from Julie Marijanich (Executive Director) was confirmed by the requester in this session; keep that on file.
* Staff-only. Do not share the page link outside staff, and no member-level data is included.
* The pastoral quote is entered by a person; nothing is written by AI.
* Staff or ministry-lead approval is needed before publishing beyond staff.
