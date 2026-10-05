// Hand-curated data pulled from Planning Center (Services, Registrations, Publishing, Groups)
// and the Bold Springs Campaign master calendar (Google Drive). Refresh with the steps in README.md.
// NOTE: no giving, pledge, or member-level data lives here (Tier 3 – requires Executive Director approval).
window.GM_STATIC = {
  asOf: "2026-10-05",
  tz: "America/New_York",
  mission: "To Pursue God's Heart for the Restoration of All Things.",
  currentSeries: { title: "Rebuild", note: "Sunday series (Planning Center Services)" },
  wedSeries: { title: "LISTEN – Journey Through the Book of Acts", note: "Week 7/8 on Oct 7 · new 4‑week series begins Oct 21" },

  // Local (Eastern) times. Verified against Planning Center plan times; same local times hold after Nov 1.
  sunday: {
    services: [
      { label: "First Service", time: "9:00 AM", end: "10:30 AM" },
      { label: "Second Service", time: "11:00 AM", end: "12:30 PM" }
    ],
    kids: [
      { label: "Kids – Session 1", time: "9:00 – 10:00 AM" },
      { label: "Kids – Session 2", time: "10:00 – 11:15 AM" },
      { label: "Kids – Session 3", time: "10:45 – 11:45 AM" },
      { label: "Kids – Session 4", time: "11:00 AM – 12:00 PM" }
    ],
    team: [
      { label: "Team call time", time: "6:45 AM" },
      { label: "Sound check", time: "7:00 AM" },
      { label: "Service walk‑through", time: "8:00 AM" },
      { label: "Prayer & service‑order touchpoint", time: "8:35 AM" }
    ],
    classes: [
      { label: "Joy Filled Relationships", time: "9:00 – 10:30 AM" },
      { label: "Young Married Grace Group", time: "9:30 – 11:00 AM" },
      { label: "ReEngage", time: "3:00 – 5:00 PM" },
      { label: "Rooted / Hearing God", time: "4:00 – 5:30 PM" },
      { label: "Prayer Team Bible Study", time: "5:00 – 6:00 PM" },
      { label: "Casa de Adoración y Restauración", time: "1:00 – 3:00 PM" }
    ]
  },
  midweek: {
    wednesday: [
      { label: "Pre‑gathering huddle (Students)", time: "5:30 PM" },
      { label: "Wednesday gathering – KidzLife / STDNTS", time: "6:00 – 7:30 PM" },
      { label: "Kids Wednesday Experience (team window)", time: "5:15 – 7:45 PM" },
      { label: "Handcrafted · Financial Peace", time: "6:00 – 7:30 PM" },
      { label: "Revelation by Meditation", time: "9:00 – 10:30 AM" },
      { label: "Prayer Team available", time: "7:00 – 8:00 AM" }
    ],
    other: [
      { day: "Mon", label: "Better Together Grace Group", time: "6:30 PM" },
      { day: "Mon", label: "M4M Coffee & Connection", time: "10:00 AM – 12:00 PM" },
      { day: "Tue", label: "Rooted Group (Green)", time: "6:00 PM" },
      { day: "Tue", label: "Seasons Grace Group", time: "6:30 PM" },
      { day: "Thu", label: "Prayer Team available", time: "7:00 – 8:00 AM" },
      { day: "Thu", label: "Hearing God 2.0 (every other)", time: "6:00 PM" },
      { day: "Thu", label: "Women's Prayer & Praise (every other)", time: "6:00 PM" },
      { day: "Thu", label: "Casa de Adoración y Restauración", time: "7:00 PM" },
      { day: "Thu", label: "Worship team rehearsal", time: "6:30 / 7:00 PM" }
    ]
  },

  staffRhythm: [
    { label: "Staff Meeting", detail: "1st Tuesday (10:30 AM), 2nd Tuesday (10:00 AM), 3rd Tuesday (10:30 AM)" },
    { label: "All Staff Meeting", detail: "Last Tuesday of the month, 10:00 AM – 12:00 PM" }
  ],

  staffing: [
    { when: "Sun Oct 11 · Worship", open: 12, filled: 13 },
    { when: "Sun Oct 18 · Worship", open: 14, filled: 8 },
    { when: "Sun Oct 25 · Worship", open: 13, filled: 10 },
    { when: "Sun Nov 1 · Worship", open: 13, filled: 10 },
    { when: "Wed Oct 7 · Students", open: 5, filled: null },
    { when: "Wed Oct 21 · Students", open: 4, filled: null },
    { when: "Wed Oct 7 · Kids", open: 23, filled: null },
    { when: "Sun Oct 11 · Kids", open: 25, filled: null },
    { when: "Sun Oct 18 · Kids", open: 18, filled: null }
  ],

  signups: [
    { name: "Baby Dedications – October 18th", closes: "2026-10-14", url: "https://graceformonroe.churchcenter.com/registrations/events/3886328/reservations/new", ministry: "Worship & Sunday" },
    { name: "Men's Advance – Fall Event", url: "https://graceformonroe.churchcenter.com/registrations/events/3882234/reservations/new", ministry: "Men" },
    { name: "High School D‑Groups", url: "https://graceformonroe.churchcenter.com/registrations/events/3872558/reservations/new", ministry: "Students & Kids" },
    { name: "Prayer and Workday", url: "https://graceformonroe.churchcenter.com/registrations/events/3871732/reservations/new", ministry: "Prayer" },
    { name: "Kiddoz Program", url: "https://graceformonroe.churchcenter.com/registrations/events/3839891/reservations/new", ministry: "Students & Kids" },
    { name: "Financial Peace University", url: "https://graceformonroe.churchcenter.com/registrations/events/3758481/reservations/new", ministry: "Discipleship" },
    { name: "KidzLife 2026–2027", closes: "2027-03-17", url: "https://graceformonroe.churchcenter.com/registrations/events/3750819/reservations/new", ministry: "Students & Kids" },
    { name: "Special Needs Buddy Ministry Interest", url: "https://graceformonroe.churchcenter.com/registrations/events/3412057/reservations/new", ministry: "Outreach & Care" },
    { name: "Monthly Prayer & Worship Nights", url: "https://graceformonroe.churchcenter.com/registrations/events/1871913/reservations/new", ministry: "Prayer" },
    { name: "Men's Advance Breakfast", url: "https://graceformonroe.churchcenter.com/registrations/events/1688658/reservations/new", ministry: "Men" },
    { name: "Childcare Request Form", url: "https://graceformonroe.churchcenter.com/registrations/events/2457425/reservations/new", ministry: "Students & Kids" },
    { name: "Start with Grace", url: "https://graceformonroe.churchcenter.com/registrations/events/1540963/reservations/new", ministry: "Discipleship" },
    { name: "Baptism @ Grace Monroe", url: "https://graceformonroe.churchcenter.com/registrations/events/1569183/reservations/new", ministry: "Worship & Sunday" }
  ],

  groupTypes: [
    { name: "Grace Groups: Coed", blurb: "UP · IN · OUT communities across the region", url: "https://graceformonroe.churchcenter.com/groups/grace-groups-coed" },
    { name: "Grace Groups: Men", blurb: "Men-only Grace Groups", url: "https://graceformonroe.churchcenter.com/groups/grace-groups-men" },
    { name: "Grace Groups: Women", blurb: "Women-only Grace Groups", url: "https://graceformonroe.churchcenter.com/groups/grace-groups-women" },
    { name: "Student Groups", blurb: "Discipleship Groups (D‑Groups) for students", url: "https://graceformonroe.churchcenter.com/groups/student-groups" },
    { name: "Care Groups", blurb: "Stage-of-life and situational support", url: "https://graceformonroe.churchcenter.com/groups/care-groups" },
    { name: "Grow Groups", blurb: "6–10 week workshops each fall and spring", url: "https://graceformonroe.churchcenter.com/groups/grow-groups" },
    { name: "Leadership Huddles", blurb: "Year‑long reproducing disciple‑maker groups", url: "https://graceformonroe.churchcenter.com/groups/leadership-huddles" },
    { name: "Kids", blurb: "Kids groups", url: "https://graceformonroe.churchcenter.com/groups/kids" },
    { name: "Outreach", blurb: "Outreach teams", url: "https://graceformonroe.churchcenter.com/groups/outreach" }
  ],

  campaign: {
    name: "Bold Springs Campaign",
    tagline: "Activating Space to Multiply Life, Leaders, & Mission",
    verse: "“They will be like a tree planted by the water that sends out its roots by the stream.” — Jeremiah 17:7–8",
    links: [
      { label: "Master Calendar (Sheets)", url: "https://docs.google.com/spreadsheets/d/1hPv9U9tC3awp6_1xor-07fxQlbhnMlg9tfktkfrYHNs/edit" },
      { label: "Campaign folder (Drive)", url: "https://drive.google.com/drive/folders/1NzDrnXogKqcKgmrOO_2-GSnYOIW1TL8C" },
      { label: "Case Statement (Feb 2026)", url: "https://docs.google.com/document/d/1v0mrrH0ncfy_gWwlHFSheVGOaiau5N89oeoF07QnWhI/edit" }
    ],
    prayer: { label: "100 Days of Prayer", start: "2026-06-01", end: "2026-09-08" },
    phases: [
      { title: "Prayer & Vision", dates: "Jun – Sep 2026", detail: "100 Days of Prayer · Galatians → Joined series" },
      { title: "Story Videos", dates: "Jun 21 – Sep 6", detail: "“Sent” → “Seen” → “Restore” shown, then released on social" },
      { title: "Convergence & Launch", dates: "Sep – Oct 2026", detail: "Recap reel, campaign launch invitation, host homes & one‑on‑ones" },
      { title: "Rebuild Series", dates: "Oct 2026 →", detail: "Current Sunday series" }
    ],
    milestones: [
      { date: "2026-06-01", title: "100 Days of Prayer begins", owner: "" },
      { date: "2026-06-21", title: "“Sent” video shown on Sunday", owner: "" },
      { date: "2026-07-12", title: "“Seen” video shown on Sunday", owner: "" },
      { date: "2026-07-27", title: "Elder Board meeting – BSC update", owner: "Brian / Wendy" },
      { date: "2026-08-02", title: "“Restore” video shown on Sunday", owner: "" },
      { date: "2026-08-09", title: "Next Steps BBQ", owner: "" },
      { date: "2026-08-17", title: "Hard deadline: construction costs", owner: "Brian / Wendy" },
      { date: "2026-08-12", title: "BSC logo design finalized", owner: "Wendy / Brian" },
      { date: "2026-09-08", title: "100 Days of Prayer ends", owner: "" },
      { date: "2026-09-07", title: "“Restore” video released on social", owner: "Emma" },
      { date: "2026-09-14", title: "Recap & convergence post · campaign launch invitation needed", owner: "Emma" },
      { date: "2026-10-19", title: "Host homes & one‑on‑ones season (Oct – Nov) – see tracker in Drive", owner: "Brian" }
    ],
    social: [
      { day: "Sun", text: "Short clip from the week's sermon (also Stories + static graphic)" },
      { day: "Wed", text: "Prayer prompt / video release" },
      { day: "Fri", text: "Quote graphic or clip from the series" }
    ],
    openItems: [
      "Campaign launch invitation still needed (Social Media tab, Sep 16 row)",
      "Master calendar content read for this build ends mid‑September – confirm Oct–Nov milestones with Wendy",
      "Giving / pledge progress intentionally not shown: Tier 3 – needs written approval from Julie Marijanich"
    ]
  },

  resources: [
    { group: "Planning Center", items: [
      { label: "Church Center (public)", url: "https://graceformonroe.churchcenter.com" },
      { label: "Services – Sunday Morning (WOR)", url: "https://services.planningcenteronline.com/service_types/1294257" },
      { label: "Registrations – all signups", url: "https://registrations.planningcenteronline.com/signups" },
      { label: "Calendar", url: "https://calendar.planningcenteronline.com" },
      { label: "Groups", url: "https://groups.planningcenteronline.com" }
    ]},
    { group: "Sermons", items: [
      { label: "Rebuild – current series", url: "https://graceformonroe.churchcenter.com/channels/19510" },
      { label: "Joined (Aug–Sep 2026)", url: "https://graceformonroe.churchcenter.com/channels/19510/series/92885" },
      { label: "Live Free – Galatians", url: "https://graceformonroe.churchcenter.com/channels/19510/series/89566" }
    ]},
    { group: "Campaign", items: [
      { label: "Bold Springs master calendar", url: "https://docs.google.com/spreadsheets/d/1hPv9U9tC3awp6_1xor-07fxQlbhnMlg9tfktkfrYHNs/edit" },
      { label: "Bold Springs folder", url: "https://drive.google.com/drive/folders/1NzDrnXogKqcKgmrOO_2-GSnYOIW1TL8C" }
    ]},
    { group: "Church", items: [
      { label: "Website", url: "https://www.graceformonroe.com/" },
      { label: "315 N Madison Ave, Monroe, GA 30655", url: "https://maps.google.com/?q=315+North+Madison+Avenue+Monroe+GA+30655" }
    ]}
  ]
};
