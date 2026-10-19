// Staff dashboard data. Eastern time throughout; dates are wall-clock "YYYY-MM-DD" and "HH:MM".
// Sources (pulled 2026-10-08): Planning Center (Calendar, Check-Ins headcounts, Publishing),
// Slack (#important-dates), Google Drive (Bold Springs Campaign Master Calendar).
window.GM = {
  asOf: "2026-10-08",
  mission: "To Pursue God's Heart for the Restoration of All Things.",
  services: ["9:00 AM", "11:00 AM"],

  // ---------- Calendar ----------
  // Repeating weekly rhythm (0 = Sunday)
  rhythm: [
    { wd: 0, t: "9:00 AM", title: "Worship services", note: "9:00 & 11:00 AM" },
    { wd: 0, t: "9:00 AM", title: "Kids sessions", note: "9:00 AM – 12:00 PM" },
    { wd: 1, t: "10:00 AM", title: "M4M Coffee & Connection" },
    { wd: 1, t: "6:30 PM", title: "Better Together Grace Group" },
    { wd: 2, t: "10:00 AM", title: "Staff meeting" },
    { wd: 2, t: "6:00 PM", title: "Rooted Group" },
    { wd: 2, t: "6:30 PM", title: "Seasons Grace Group" },
    { wd: 3, t: "7:00 AM", title: "Prayer Team available" },
    { wd: 3, t: "6:00 PM", title: "Students & Kids gathering" },
    { wd: 3, t: "6:00 PM", title: "Handcrafted · Financial Peace" },
    { wd: 4, t: "7:00 AM", title: "Prayer Team available" },
    { wd: 4, t: "6:30 PM", title: "Worship team dinner & rehearsal" }
  ],
  // Dated events. key: true = churchwide moment (shown on the quarter view)
  events: [
    { d: "2026-10-08", t: "11:00 AM", title: "Walton Chamber Luncheon", cat: "Community" },
    { d: "2026-10-08", t: "1:30 PM", title: "Chamber Leadership Training", cat: "Community" },
    { d: "2026-10-09", t: "6:00 PM", title: "Weapons of Worship", cat: "Church life" },
    { d: "2026-10-16", t: "6:00 PM", title: "Weapons of Worship", cat: "Church life" },
    { d: "2026-10-17", t: "10:00 AM", title: "Saturday School Event", cat: "Community", note: "Student building" },
    { d: "2026-10-17", t: "", title: "Monroe PD SWAT Trot", cat: "Community" },
    { d: "2026-10-18", t: "", title: "Bold Springs Campaign Launch", cat: "Campaign", key: true, note: "Launch Sunday" },
    { d: "2026-10-18", t: "9:00 AM", title: "Baby Dedications", cat: "Church life", key: true, note: "During Sunday services" },
    { d: "2026-10-19", t: "", title: "Host homes & one-on-ones begin", cat: "Campaign", key: true, end: "2026-11-10", note: "Oct 19 – Nov 10" },
    { d: "2026-10-23", t: "6:00 PM", title: "Little Oaks Trunk or Treat", cat: "Community", key: true, note: "Parking lot" },
    { d: "2026-10-24", t: "4:00 PM", title: "Men's Advance Event", cat: "Church life" },
    { d: "2026-10-27", t: "10:00 AM", title: "All Staff Meeting", cat: "Staff", key: true },
    { d: "2026-10-30", t: "7:00 PM", title: "Foster Care Movie on the Lawn", cat: "Community", key: true },
    { d: "2026-11-05", t: "", title: "Church at the Crossroads", cat: "Church life", key: true, end: "2026-11-07", note: "Grace Midtown, Nov 5–7" },
    { d: "2026-11-07", t: "", title: "Men's Advance Breakfast", cat: "Church life" },
    { d: "2026-11-08", t: "5:30 PM", title: "Parenting with a Purpose Seminar", cat: "Church life", key: true },
    { d: "2026-11-15", t: "", title: "Commitment Sunday", cat: "Campaign", key: true, note: "Bold Springs Campaign" },
    { d: "2026-11-19", t: "8:00 AM", title: "DFCS Breakfast", cat: "Community", key: true },
    { d: "2026-11-23", t: "10:00 AM", title: "Decorate for Christmas", cat: "Church life", key: true, note: "All hands" },
    { d: "2026-11-24", t: "10:00 AM", title: "All Staff Meeting", cat: "Staff", key: true }
  ],

  // ---------- Attendance (PCO Check-Ins headcounts, both services combined) ----------
  attendance: [
    { d: "2026-08-16", inPerson: 400, online: 121 },
    { d: "2026-08-23", inPerson: 344, online: 97 },
    { d: "2026-08-30", inPerson: 451, online: 96 },
    { d: "2026-09-06", inPerson: 286, online: 155, note: "Labor Day weekend" },
    { d: "2026-09-13", inPerson: 386, online: 176 },
    { d: "2026-09-20", inPerson: 339, online: 271 },
    { d: "2026-09-27", inPerson: 349, online: 188 },
    { d: "2026-10-04", inPerson: 166, online: 117, partial: true, note: "Family Camp weekend. Only the 11:00 in-person count is entered." }
  ],

  // ---------- Giving (PCO Giving) ----------
  // Church-wide totals only, from the Slack #sunday-numbers channel. units comes from Planning Center Giving (live, for staff with access).
  giving: { asOf: "2026-10-08", label: "September MTD", mtd: 106268, prev: 113561, prevLabel: "August", units: null, source: "Sunday Numbers",
    months: [{ m: "Jul", total: 84739 }, { m: "Aug", total: 113561 }, { m: "Sep", total: 106268 }] },

  // ---------- Staff moments ----------
  birthdays: [
    { name: "Keely Thompson", md: "10-02" },
    { name: "Denise Dixon", md: "11-13" }
  ],
  // Work anniversaries need hire dates (no source yet). Shape: { name, date: "YYYY-MM-DD" }
  anniversaries: [],

  // ---------- Staff directory ----------
  // Source: Drive doc "Grace Monroe — Staff Directory & Organizational Structure". Work info only: names, titles, team, position description.
  staff: [
    { name: "Brian Krawczyk", title: "Lead Pastor", team: "Lead Pastor", doc: "1spCNmxXGTwxMjwmLxCy-zwna5ut8AlP1naOj9ynGLYA" },
    { name: "Julie Marijanich", title: "Executive Director", team: "Core Team", reports: "Brian Krawczyk", doc: "16QOkqUn-6DHWqRz5OAY7kC2BJe4JJbEbG9f8qN3ljRQ" },
    { name: "Emily Jones", title: "Next Gen Pastor", team: "Core Team", reports: "Brian Krawczyk", doc: "1dK08XC3tQsVZOfkiZFJQMg0ur85EUQc7" },
    { name: "Jon Mitchell", title: "Adult Discipleship Pastor", team: "Core Team", reports: "Brian Krawczyk", doc: "1s31ZxNO6dUckirfbODN7lPJ3pN-FyBqowpfOP5HcZQE" },
    { name: "David Walker", title: "Worship Pastor", team: "Core Team", reports: "Brian Krawczyk", doc: "1lU-nVxLBnoa6fZoP-de7k8bxg5TYULRehMmN9gLK5W0" },
    { name: "Sandy Allen", title: "Executive Admin", team: "Direct Reports", reports: "Brian Krawczyk", doc: "1f2Ob5cW0HYUaY4ggolGx7K5xhw85nxRT" },
    { name: "Alysia Wood", title: "Global Missions Liaison", team: "Direct Reports", reports: "Brian Krawczyk" },
    { name: "Nicole Swart", title: "Ministry Leader (The Village)", team: "Direct Reports", reports: "Brian Krawczyk", note: "The Village is self-sustaining and has no formal reporting line. Brian checks in; the Executive Director answers logistical questions." },
    { name: "Denise Dixon", title: "Connections Pastor", team: "Executive & Operations", reports: "Julie Marijanich", doc: "10jOExHbs_uYBlwOz6NAmxVlZbpQY0RJ_2ciud4AyQpc" },
    { name: "Kyle McKinnon", title: "Kidz Life Pastor / Camp & Events Coordinator", team: "Executive & Operations", reports: "Julie Marijanich" },
    { name: "Richard Allen", title: "Facilities Director", team: "Executive & Operations", reports: "Julie Marijanich" },
    { name: "Keely Thompson", title: "Janitorial Director", team: "Executive & Operations", reports: "Julie Marijanich" },
    { name: "Katherine Winters", title: "NextGen Admin", team: "NextGen", reports: "Emily Jones", doc: "1eq7sfBdCcO-uasB5vEqss-hEdLrXngyrMvgTM8J3IBs" },
    { name: "Liberty Gable", title: "HS Director / Carver MS Missionary", team: "NextGen", reports: "Emily Jones", doc: "1KBO_EujstYTrY7OZwzEBK1G6vyaa4Ia8zzL1RFpyBEo" },
    { name: "Maxx Godfrey", title: "MS Director", team: "NextGen", reports: "Emily Jones", doc: "1GVHoDaFwU9l3p7voVZJOVt_Vu8_fEKE1" },
    { name: "Alisa Moore", title: "Ministry Leader (Moms4Moms)", team: "NextGen", reports: "Emily Jones" },
    { name: "Morgan Watts", title: "Ministry Leader (Special Needs)", team: "NextGen", reports: "Emily Jones" },
    { name: "Chase Boyd", title: "Adult / Hospitality (split role)", team: "Adult Discipleship", reports: "Jon Mitchell", doc: "1OCgC6y970QYQg4gPeMcBFmJsx7XSuEdG6lWJZM8Fr44" },
    { name: "Lily Bilsland", title: "Ministry Leader (Prayer)", team: "Adult Discipleship", reports: "Jon Mitchell" },
    { name: "Adey Gunnin", title: "Worship", team: "Worship & Creative", reports: "David Walker" },
    { name: "Emma Bradley", title: "Communications Director", team: "Worship & Creative", reports: "David Walker" }
  ],

  // ---------- Divvy ----------
  divvy: { days: [3, 17], reconcile: "Reconcile receipts by the 5th and 20th (Slack, Aug 20).", url: "https://app.getdivvy.com" },

  // ---------- Series verse ----------
  // Set from the dashboard by someone with edit access (saved as dashboard/series). Empty until a person chooses the series name and verse.
  series: {},
  // The coming Sunday, from the Sunday-morning plan in Planning Center (refreshed live for connected viewers).
  sunday: { date: "2026-10-25", series: "Rebuild", title: "Everyone Has a Section", reference: "Nehemiah 3" },

  // ---------- Bold Springs Campaign ----------
  campaign: {
    name: "Bold Springs Campaign",
    tag: "Activating Space to Multiply Life, Leaders, & Mission",
    steps: [
      { t: "Pray", when: "Jun 1 – Sep 8", s: "100 Days of Prayer complete.", start: "2026-06-01", end: "2026-09-08" },
      { t: "Tell", when: "Jun – Sep", s: "Sent, Seen and Restore story videos shared.", start: "2026-06-21", end: "2026-09-14" },
      { t: "Launch", when: "Oct 18", s: "Campaign launch Sunday.", start: "2026-10-18", end: "2026-10-18" },
      { t: "Gather", when: "Oct 19 – Nov 10", s: "Host homes and one-on-one conversations.", start: "2026-10-19", end: "2026-11-10" },
      { t: "Commit", when: "Nov 15", s: "Commitment Sunday.", start: "2026-11-15", end: "2026-11-15" }
    ],
    next: [
      "Launch invitation was still open on the master calendar (Oct 6). Confirm it is done.",
      "Final campaign logo and foldouts landed in Drive Oct 5–6.",
      "Debt-free case statement revised Sep 26."
    ],
    links: [
      { l: "Master calendar", u: "https://docs.google.com/spreadsheets/d/1hPv9U9tC3awp6_1xor-07fxQlbhnMlg9tfktkfrYHNs/edit" },
      { l: "Campaign folder", u: "https://drive.google.com/drive/folders/1NzDrnXogKqcKgmrOO_2-GSnYOIW1TL8C" },
      { l: "Case statement", u: "https://docs.google.com/document/d/1v0mrrH0ncfy_gWwlHFSheVGOaiau5N89oeoF07QnWhI/edit" }
    ]
  },

  // ---------- PTO / out of office (Slack #important-dates, Oct 8) ----------
  pto: [
    { name: "Brian", from: "2026-10-10", to: "2026-10-14", kind: "PTO" },
    { name: "Julie", from: "2026-10-10", to: "2026-10-14", kind: "PTO" },
    { name: "Emily", from: "2026-10-11", to: "2026-10-11", kind: "PTO" },
    { name: "Emily", from: "2026-10-12", to: "2026-10-16", kind: "WFH" },
    { name: "Kyle", from: "2026-10-12", to: "2026-10-16", kind: "PTO" },
    { name: "Liberty", from: "2026-10-14", to: "2026-10-15", kind: "PTO" },
    { name: "Emma", from: "2026-10-14", to: "2026-10-15", kind: "PTO" },
    { name: "David", from: "2026-10-18", to: "2026-10-18", kind: "PTO" },
    { name: "Jon", from: "2026-10-23", to: "2026-10-26", kind: "Conference" },
    { name: "David", from: "2026-11-03", to: "2026-11-08", kind: "PTO" },
    { name: "Jon", from: "2026-11-06", to: "2026-11-08", kind: "Conference" },
    { name: "David", from: "2026-11-15", to: "2026-11-15", kind: "PTO" }
  ],

  links: [
    { l: "Church Center calendar", u: "https://graceformonroe.churchcenter.com/calendar" },
    { l: "Planning Center Services", u: "https://services.planningcenteronline.com" },
    { l: "Sermons", u: "https://graceformonroe.churchcenter.com/channels/19510" },
    { l: "Slack #important-dates", u: "https://slack.com/app_redirect?channel=C08777PFT25" }
  ]
};
