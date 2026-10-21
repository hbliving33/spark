// City services on the calendar: trash pickup and street sweeping for Suburbia Park.
// Sources (checked October 2026):
//   Trash: City of Huntington Beach, Trash and Recycling page.  Republic Services observes six holidays.
//          No pickup on the holiday, and pickup is one day late for the rest of that week.
//   Sweeping: City of Huntington Beach, Maintenance Operations page.  Twice a month citywide.
//          No sweeping on eight holidays, and missed streets are skipped until the next regular sweep.
//
// TO TURN ON THE WEEKLY ENTRIES, fill in the two settings below.
// Find your days on the city's Surf City Services Map, or call the Trash and Recycling office at (714) 375-5010.
//   trashDay: 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday.  Leave null to hide.
//   sweep.day: the weekday, same numbers.  sweep.weeks: which weeks of the month, for example [1, 3] or [2, 4].
window.SP_CITY = {
  trashDay: null,
  sweep: { day: null, weeks: [], time: "" },
  from: "2026-10-01",
  to: "2027-12-31",
  phone: "(714) 375-5010",

  // Trash holidays (Republic Services, Huntington Beach)
  trashHolidays: [
    { date: "2026-11-26", name: "Thanksgiving" },
    { date: "2026-12-25", name: "Christmas" },
    { date: "2027-01-01", name: "New Year's Day" },
    { date: "2027-05-31", name: "Memorial Day" },
    { date: "2027-07-04", name: "Independence Day", weekend: true },
    { date: "2027-09-06", name: "Labor Day" },
    { date: "2027-11-25", name: "Thanksgiving" },
    { date: "2027-12-25", name: "Christmas", weekend: true }
  ],

  // No street sweeping on these days (City of Huntington Beach)
  sweepHolidays: [
    { date: "2026-11-26", name: "Thanksgiving" },
    { date: "2026-11-27", name: "Day after Thanksgiving" },
    { date: "2026-12-25", name: "Christmas" },
    { date: "2027-01-01", name: "New Year's Day" },
    { date: "2027-02-15", name: "Presidents' Day" },
    { date: "2027-05-31", name: "Memorial Day" },
    { date: "2027-07-04", name: "Independence Day" },
    { date: "2027-09-06", name: "Labor Day" },
    { date: "2027-11-25", name: "Thanksgiving" },
    { date: "2027-11-26", name: "Day after Thanksgiving" },
    { date: "2027-12-25", name: "Christmas" }
  ]
};

// Builds the calendar entries from the settings above.
window.SP_CITY_EVENTS = (() => {
  const C = window.SP_CITY, out = [];
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const key = (t) => `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  const add = (t, n) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + n);
  const start = parse(C.from), end = parse(C.to);
  const noSweep = Object.fromEntries(C.sweepHolidays.map((h) => [h.date, h.name]));
  const both = new Set(C.trashHolidays.map((h) => h.date).filter((d) => noSweep[d]));

  // Holiday notices, always shown
  C.trashHolidays.forEach((h) => {
    const sweepToo = noSweep[h.date] ? "  No street sweeping today either." : "";
    out.push(h.weekend
      ? { date: h.date, title: `${h.name}: trash holiday`, kind: "city", place: "Republic Services",
          note: `Falls on a weekend this year.  Call the city at ${C.phone} to confirm whether pickups shift.${sweepToo}`, city: true }
      : { date: h.date, title: `${h.name}: no trash pickup`, kind: "city", place: "Republic Services",
          note: `Pickups from today through Friday run one day late (Friday moves to Saturday).${sweepToo}`, city: true });
  });
  C.sweepHolidays.forEach((h) => {
    if (both.has(h.date)) return;
    out.push({ date: h.date, title: `${h.name}: no street sweeping`, kind: "city", place: "City of Huntington Beach",
      note: "Missed streets are not made up.  They are swept on the next regular sweep day.", city: true });
  });

  // Weekly trash pickup, moved one day in holiday weeks
  if (C.trashDay) {
    const hol = C.trashHolidays.filter((h) => !h.weekend).map((h) => parse(h.date));
    for (let t = new Date(start); t <= end; t = add(t, 1)) {
      if (t.getDay() !== C.trashDay) continue;
      const late = hol.find((h) => h <= t && +add(h, 7 - h.getDay()) > +t && h.getDay() >= 1 && h.getDay() <= t.getDay());
      const day = late ? add(t, 1) : t;
      out.push({ date: key(day), title: late ? "Trash pickup (one day late)" : "Trash pickup", kind: "city",
        time: "7:00 AM to 6:30 PM", note: late ? "Holiday week, so pickup moves one day later." : "", city: true, repeat: true });
    }
  }

  // Street sweeping, skipped on holidays
  if (C.sweep && C.sweep.day && C.sweep.weeks.length) {
    for (let t = new Date(start); t <= end; t = add(t, 1)) {
      if (t.getDay() !== C.sweep.day || !C.sweep.weeks.includes(Math.ceil(t.getDate() / 7))) continue;
      if (noSweep[key(t)]) continue;
      out.push({ date: key(t), title: "Street sweeping", kind: "city", time: C.sweep.time,
        note: "Move cars off the street.  Enforced rain or shine.", city: true, repeat: true });
    }
  }
  return out;
})();
