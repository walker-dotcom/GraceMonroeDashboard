// Churchwide dashboard data. Sources: Planning Center (Calendar, Services, Registrations, Publishing)
// and the Bold Springs Campaign master calendar (Google Drive).
// No giving, pledge, or member-level data (Tier 3: needs Executive Director approval).
window.GM = {
  asOf: "2026-10-05", tz: "America/New_York",
  mission: "To Pursue God's Heart for the Restoration of All Things.",
  series: "Rebuild",
  address: "315 N Madison Ave, Monroe, GA",
  services: ["9:00 AM", "11:00 AM"],
  // Weekly rhythm (Eastern time)
  week: [
    { d: "Sun", main: "Services", sub: "9:00 & 11:00 AM", lines: ["Worship services · 9:00 AM & 11:00 AM", "Kids sessions · 9:00 AM – 12:00 PM", "Team call time · 6:45 AM", "Classes & groups through the afternoon"] },
    { d: "Mon", main: "Grace Groups", sub: "6:30 PM", lines: ["Better Together Grace Group · 6:30 PM", "M4M Coffee & Connection · 10:00 AM"] },
    { d: "Tue", main: "Rooted · Seasons", sub: "6:00 PM", lines: ["Rooted Group · 6:00 PM", "Seasons Grace Group · 6:30 PM", "Staff meetings · mornings"] },
    { d: "Wed", main: "Wednesday gathering", sub: "6:00 PM", lines: ["Students & Kids gathering · 6:00 – 7:30 PM", "Student team huddle · 5:30 PM", "Handcrafted · Financial Peace · 6:00 PM", "Prayer Team available · 7:00 AM"] },
    { d: "Thu", main: "Prayer · Rehearsal", sub: "6:30 PM", lines: ["Prayer Team available · 7:00 AM", "Worship team dinner · 6:30 PM", "Full band & production · 7:00 PM"] },
    { d: "Fri", main: "Open", sub: "", lines: ["Occasional churchwide events (see Moments)"] },
    { d: "Sat", main: "Men's Breakfast", sub: "1st Sat", lines: ["Men's Advance Breakfast · first Saturday"] }
  ],
  // Dated churchwide moments (UTC instants; shown in Eastern)
  moments: [
    { id: "chamber", cat: "Community", title: "Walton Chamber Luncheon", start: "2026-10-08T15:00:00Z", end: "2026-10-08T17:00:00Z", place: "Grace Monroe", blurb: "Hosted at Grace Monroe." },
    { id: "babyded", cat: "Church life", title: "Baby Dedications", start: "2026-10-18T13:00:00Z", end: "2026-10-18T16:00:00Z", place: "Grace Monroe", blurb: "Celebrated during Sunday services. Families register by Oct 14.", url: "https://graceformonroe.churchcenter.com/registrations/events/3886328/reservations/new", cta: "Registration" },
    { id: "host", cat: "Campaign", title: "Host homes & one-on-ones", start: "2026-10-19", end: "2026-11-10", allDay: true, place: "Homes across Monroe", blurb: "Bold Springs Campaign conversations, Oct 19 – Nov 10.", url: "https://drive.google.com/drive/folders/1NzDrnXogKqcKgmrOO_2-GSnYOIW1TL8C", cta: "Campaign folder" },
    { id: "tot1", cat: "Community", title: "Trunk or Treat", start: "2026-10-23T22:00:00Z", end: "2026-10-24T00:00:00Z", place: "Grace Monroe", blurb: "Little Oaks Trunk or Treat on campus." },
    { id: "allstaff1", cat: "Staff", title: "All Staff Meeting", start: "2026-10-27T14:00:00Z", end: "2026-10-27T16:00:00Z", place: "Grace Monroe", blurb: "Monthly, last Tuesday." },
    { id: "tot2", cat: "Community", title: "Trunk or Treat", start: "2026-10-30T22:00:00Z", end: "2026-10-31T00:00:00Z", place: "Grace Monroe", blurb: "Second night of Trunk or Treat." },
    { id: "movie", cat: "Community", title: "Foster Care Movie on the Lawn", start: "2026-10-30T23:00:00Z", end: "2026-10-31T01:00:00Z", place: "Grace Monroe lawn", blurb: "An evening for families and foster care awareness." },
    { id: "parenting", cat: "Church life", title: "Parenting with a Purpose Seminar", start: "2026-11-08T22:30:00Z", noEnd: true, place: "Grace Monroe", blurb: "A Sunday-evening seminar for parents." },
    { id: "dfcs", cat: "Community", title: "DFCS Breakfast", start: "2026-11-19T13:00:00Z", noEnd: true, place: "Grace Monroe", blurb: "Breakfast for our local DFCS partners." },
    { id: "xmas", cat: "Church life", title: "Decorate for Christmas", start: "2026-11-23T15:00:00Z", end: "2026-11-23T20:00:00Z", place: "Grace Monroe", blurb: "All hands to deck the halls." },
    { id: "allstaff2", cat: "Staff", title: "All Staff Meeting", start: "2026-11-24T15:00:00Z", noEnd: true, place: "Grace Monroe", blurb: "Monthly, last Tuesday." }
  ],
  campaign: {
    name: "Bold Springs Campaign",
    tag: "Activating Space to Multiply Life, Leaders, & Mission",
    prayer: { start: "2026-06-01", end: "2026-09-08" },
    steps: [
      { t: "Pray", when: "Jun – Sep", s: "100 Days of Prayer, Jun 1 – Sep 8.", end: "2026-09-08" },
      { t: "Tell", when: "Jun – Sep", s: "Three story videos shown on Sundays and shared online: Sent, Seen, Restore.", end: "2026-09-14" },
      { t: "Gather", when: "Oct – Nov", s: "Host homes and one-on-one conversations, Oct 19 – Nov 10.", end: "2026-11-10" },
      { t: "Launch", when: "Next", s: "Campaign launch. The invitation is still needed.", end: "2027-01-01" }
    ],
    needs: "Launch invitation still needed",
    links: [
      { l: "Master calendar", u: "https://docs.google.com/spreadsheets/d/1hPv9U9tC3awp6_1xor-07fxQlbhnMlg9tfktkfrYHNs/edit" },
      { l: "Campaign folder", u: "https://drive.google.com/drive/folders/1NzDrnXogKqcKgmrOO_2-GSnYOIW1TL8C" },
      { l: "Case statement", u: "https://docs.google.com/document/d/1v0mrrH0ncfy_gWwlHFSheVGOaiau5N89oeoF07QnWhI/edit" }
    ]
  },
  links: [
    { l: "Church Center calendar", u: "https://graceformonroe.churchcenter.com/calendar" },
    { l: "Registrations", u: "https://registrations.planningcenteronline.com/signups" },
    { l: "Services", u: "https://services.planningcenteronline.com" },
    { l: "Sermons", u: "https://graceformonroe.churchcenter.com/channels/19510" }
  ]
};
