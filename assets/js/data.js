// Suburbia Park community data.
// To add an event or a notice, copy the example in the comment below, change the details and save.
// Dates use the format "YYYY-MM-DD".  Times are plain text, for example "6:00 PM".
// Once sign-in is connected, neighbors post from the site and these lists are not used.
//
// Event example:
//   { date: "2026-12-12", time: "6:00 PM", title: "Holiday lights walk", place: "Seaview fields entrance", kind: "social", note: "Bring a flashlight." },
//   kind is one of: social, volunteer, market, beach, sports
// Notice example:
//   { date: "2026-10-20", kind: "lost", title: "Found: keys at Seaview Park", body: "Describe them to claim." },
//   kind is one of: news, lost, sale, free, recommend, help
// Help example:
//   { id: "h1", date: "2026-10-19", type: "ask", category: "groceries", title: "Grocery pickup once a week", body: "A short list.", when_text: "Thursdays", author_name: "" },
//   type is ask or offer

window.SP_EVENTS = [];

window.SP_POSTS = [];

window.SP_HELP = [];
