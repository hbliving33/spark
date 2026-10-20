import pathlib, hashlib, re

ROOT = pathlib.Path('/home/claude/spark')
FORM_TO = 'community@suburbiapark.com'
YEAR = 2026
NAV = [('index.html', 'Home'), ('calendar.html', 'Calendar'), ('board.html', 'Board'), ('help.html', 'Help a Neighbor'), ('businesses.html', 'Businesses'), ('suggestions.html', 'Ideas')]
TABS = [('index.html', 'Home', 'M3 11 L12 4 L21 11 V20 H15 V14 H9 V20 H3Z'), ('calendar.html', 'Calendar', 'M4 6 H20 V20 H4Z M4 10 H20 M8 3 V7 M16 3 V7'), ('board.html', 'Board', 'M4 4 H20 V20 H4Z M8 9 H16 M8 13 H16 M8 17 H12'), ('help.html', 'Help', 'M12 20 C 5 15 3 11 3 8 A4.5 4.5 0 0 1 12 6 A4.5 4.5 0 0 1 21 8 C 21 11 19 15 12 20Z'), ('businesses.html', 'Local', 'M4 10 L6 4 H18 L20 10 M4 10 H20 V20 H4Z M10 20 V14 H14 V20'), ('account.html', 'Me', 'M12 12 A4 4 0 1 0 12 4 A4 4 0 1 0 12 12Z M4 21 C4 16 8 14 12 14 S20 16 20 21')]
CORE_JS = '<script src="assets/js/site.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.js"></script>\n<script src="assets/js/config.js"></script>\n<script src="assets/js/community.js"></script>'


def _ver(m):
    f = ROOT / m.group(1)
    v = hashlib.md5(f.read_bytes()).hexdigest()[:8] if f.exists() else '1'
    return f'"{m.group(1)}?v={v}"'


def bust(html):
    return re.sub(r'"(assets/(?:css|js)/[\w.-]+\.(?:css|js))"', _ver, html)


SCENE = open('build/spark_scene.svg').read()
ROUTE = open('build/spark_route.svg').read()
FLAG = '''<svg class="usflag" viewBox="0 0 190 100" aria-hidden="true"><g class="fl-cloth"><rect width="190" height="100" fill="#fff"/><g fill="#d62839"><rect y="0" width="190" height="7.7"/><rect y="15.4" width="190" height="7.7"/><rect y="30.8" width="190" height="7.7"/><rect y="46.2" width="190" height="7.7"/><rect y="61.5" width="190" height="7.7"/><rect y="76.9" width="190" height="7.7"/><rect y="92.3" width="190" height="7.7"/></g><rect width="76" height="53.8" fill="#1d3f74"/><g fill="#fff">''' + ''.join(f'<circle cx="{6.3+12.6*c+(6.3 if r%2 else 0):.1f}" cy="{5.4+5.4*r:.1f}" r="1.7"/>' for r in range(9) for c in (range(5) if r%2 else range(6))) + '''</g></g></svg>'''

WAVES = '''<svg class="waves" viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden="true">
    <path class="w1" d="M0 70 C 240 20 480 120 720 70 S 1200 20 1440 70 V140 H0Z"/>
    <path class="w2" d="M0 90 C 260 50 520 130 780 90 S 1240 50 1440 90 V140 H0Z"/>
    <path class="w3" d="M0 110 C 300 80 600 140 900 110 S 1300 85 1440 110 V140 H0Z"/>
  </svg>'''


def page(fname, title, desc, body, scripts=''):
    links = ''.join(f'<a href="{h}"{" aria-current=\"page\"" if h == fname else ""}>{t}</a>' for h, t in NAV)
    return bust(f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#1271a8">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="assets/img/icon-180.png">
<meta name="apple-mobile-web-app-title" content="Suburbia Park">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="icon" href="assets/img/mark.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito+Sans:wght@400;600;700;800&display=swap">
<link rel="stylesheet" href="assets/css/site.css">
</head>
<body>
<header class="top">
  <div class="top-in">
    <a class="brand" href="index.html"><img src="assets/img/mark.svg" alt="" width="46" height="46"><span><b>Suburbia Park</b><small>Huntington Beach, California</small></span></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav id="nav" class="nav" aria-label="Main">{links}<a class="acct-btn" href="account.html" data-account{" aria-current=\"page\"" if fname == "account.html" else ""}>Sign in</a></nav>
  </div>
</header>
{body}
<footer class="foot">
  <div class="foot-wave">{WAVES}</div>
  <div class="foot-in">
    <div>
      <a class="brand brand-foot" href="index.html"><img src="assets/img/mark.svg" alt="" width="40" height="40"><span><b>Suburbia Park</b><small>A neighborhood in Surf City</small></span></a>
      <p class="proud">{FLAG}<span>Proud to be a neighborhood in Surf City, USA.</span></p>
      <p>Made by neighbors, for neighbors.  Not an official City of Huntington Beach website.</p>
    </div>
    <nav aria-label="Footer">{''.join(f'<a href="{h}">{t}</a>' for h, t in NAV)}<a href="rules.html">Community rules</a><a href="privacy.html">Privacy</a></nav>
    <small>&copy; {YEAR} Suburbia Park neighbors.</small>
  </div>
</footer>
<nav class="tabbar" aria-label="App">{''.join(f'<a href="{h}"{" aria-current=\"page\"" if h == fname else ""}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="{d}"/></svg><span>{t}</span></a>' for h, t, d in TABS)}</nav>
{CORE_JS}
{scripts}
</body>
</html>
''')


def hero(kicker, h1, lede, extra='', cls=''):
    return f'''  <section class="hero {cls}">
    <div class="sky" aria-hidden="true"><span class="sun"><svg viewBox="0 0 200 200"><defs><radialGradient id="sunG" cx="45%" cy="42%" r="60%"><stop offset="0" stop-color="#fffbe6"/><stop offset=".55" stop-color="#ffeea8"/><stop offset="1" stop-color="#ffe082"/></radialGradient><radialGradient id="sunH" r="50%"><stop offset=".45" stop-color="#fff3c4" stop-opacity=".55"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="100" r="100" fill="url(#sunH)"/><g class="rays"><line x1="162.0" y1="100.0" x2="184.0" y2="100.0"/><line x1="153.7" y1="131.0" x2="172.7" y2="142.0"/><line x1="131.0" y1="153.7" x2="142.0" y2="172.7"/><line x1="100.0" y1="162.0" x2="100.0" y2="184.0"/><line x1="69.0" y1="153.7" x2="58.0" y2="172.7"/><line x1="46.3" y1="131.0" x2="27.3" y2="142.0"/><line x1="38.0" y1="100.0" x2="16.0" y2="100.0"/><line x1="46.3" y1="69.0" x2="27.3" y2="58.0"/><line x1="69.0" y1="46.3" x2="58.0" y2="27.3"/><line x1="100.0" y1="38.0" x2="100.0" y2="16.0"/><line x1="131.0" y1="46.3" x2="142.0" y2="27.3"/><line x1="153.7" y1="69.0" x2="172.7" y2="58.0"/></g><circle cx="100" cy="100" r="50" fill="url(#sunG)"/></svg></span><span class="cloud c3"></span><span class="cloud c5"></span><span class="cloud c2"></span><span class="cloud c6"></span><span class="cloud c1"></span><span class="cloud c4"></span></div>
    <div class="hero-in">
      <div class="kicker">{kicker}</div>
      <h1>{h1}</h1>
      <p class="lede">{lede}</p>
      {extra}
    </div>
    <div class="scene-wrap">{SCENE}</div>
  </section>'''


FORM_HIDDEN = lambda subj, nxt: f'''<input type="hidden" name="_subject" value="{subj}">
        <input type="hidden" name="_template" value="table">
        <input type="hidden" name="_next" value="{nxt}">
        <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">'''

# ---------- Home ----------
home = f'''<main>
{hero('Welcome, neighbor', 'Life is better in <em>Suburbia Park</em>.',
      'Next door to the Seaview ballfields and a short ride down the river trail to the sand.  Find out what is happening, post a notice, and share your ideas for making the neighborhood even better.',
      '<div class="cta-row"><a class="btn btn-red" href="calendar.html">See what\'s happening</a><a class="btn btn-white" href="board.html">Visit the bulletin board</a></div>', 'hero-home')}

  <section class="wrap tiles">
    <a class="tile t-cal" href="calendar.html">
      <span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg></span>
      <h2>Community calendar</h2><p>Block parties, cleanups, garage sales and game days, all in one place.</p><span class="go">Open the calendar &rarr;</span>
    </a>
    <a class="tile t-board" href="board.html">
      <span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 8h10M7 12h10M7 16h6"/></svg></span>
      <h2>Bulletin board</h2><p>Lost and found, things for sale, recommendations and neighbors helping neighbors.</p><span class="go">Read the board &rarr;</span>
    </a>
    <a class="tile t-idea" href="suggestions.html">
      <span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/></svg></span>
      <h2>Suggestion box</h2><p>Got an idea for a new event or a fix around the neighborhood?  Drop it in the box.</p><span class="go">Share an idea &rarr;</span>
    </a>
  </section>

  <div class="wrap ad-banner" data-ad-slot="banner" data-max="1" aria-label="Sponsor"></div>

  <section class="wrap split">
    <div class="up">
      <div class="sec-head"><div class="kicker">Coming up</div><h2>Next on the <em>calendar</em></h2></div>
      <ol class="up-list" id="upNext"></ol>
      <a class="more" href="calendar.html">Full calendar &rarr;</a>
    </div>
    <div class="latest">
      <div class="sec-head"><div class="kicker">Fresh on the board</div><h2>Latest <em>notices</em></h2></div>
      <ul class="note-mini" id="latestPosts"></ul>
      <a class="more" href="board.html">All notices &rarr;</a>
    </div>
  </section>

  <section class="wrap helpers" aria-labelledby="helpT">
    <div class="helpers-in">
      <div><div class="kicker">Neighbors helping neighbors</div><h2 id="helpT">Need a hand?  <em>Lend one?</em></h2>
        <p>Grocery runs, errands, rides to appointments and friendly check-ins for neighbors who could use a little help.</p>
        <div class="cta-row"><a class="btn btn-red" href="help.html#ask">Ask for help</a><a class="btn btn-white" href="help.html">See who needs a hand</a></div></div>
      <ul class="help-mini" id="helpMini"></ul>
    </div>
  </section>

  <section class="wrap kids" aria-labelledby="kidsT">
    <div class="sec-head"><div class="kicker">For the kids</div><h2 id="kidsT">Kids' <em>corner</em></h2></div>
    <div class="kid-grid">
      <article class="kid"><svg class="big-ico" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="22" fill="#fff" stroke="#14304d" stroke-width="3"/><path d="M18 18 C 26 26 26 38 18 46 M46 18 C 38 26 38 38 46 46" fill="none" stroke="#e63946" stroke-width="3" stroke-dasharray="3 3"/></svg><h3>Play ball</h3><p>Spring means Little League at the Seaview fields.  Grab your glove!</p></article>
      <article class="kid"><svg class="big-ico" viewBox="0 0 64 64" aria-hidden="true"><path d="M12 54 L22 18 M30 54 L38 18 M15 42 H34 M18 30 H36" stroke="#1271a8" stroke-width="4" stroke-linecap="round"/><path d="M38 18 C 46 22 50 38 58 52" fill="none" stroke="#ffd23f" stroke-width="7" stroke-linecap="round"/></svg><h3>Playground meetups</h3><p>Swings, slides and new friends right in the neighborhood.</p></article>
      <article class="kid"><svg class="big-ico" viewBox="0 0 64 64" aria-hidden="true"><circle cx="16" cy="44" r="10" fill="none" stroke="#14304d" stroke-width="3"/><circle cx="48" cy="44" r="10" fill="none" stroke="#14304d" stroke-width="3"/><path d="M16 44 L26 26 L40 26 L48 44 M26 26 L32 44 L16 44 M40 26 L37 18" fill="none" stroke="#14304d" stroke-width="3" stroke-linejoin="round"/><path d="M26 14 a8 7 0 0 1 16 0 Z" fill="#e63946"/></svg><h3>Helmet on, let's ride</h3><p>Ride the river trail with a grown-up.  Look for pelicans and ducks!</p></article>
      <article class="kid"><svg class="big-ico" viewBox="0 0 64 64" aria-hidden="true"><path d="M8 50 C 18 40 26 46 32 40 S 48 30 56 36" fill="none" stroke="#1271a8" stroke-width="4" stroke-linecap="round"/><path d="M8 58 H56" stroke="#ecd6a6" stroke-width="6" stroke-linecap="round"/><circle cx="46" cy="16" r="8" fill="#ffd23f"/></svg><h3>Beach day</h3><p>Sandcastles, boogie boards and sunscreen.  Always swim near a lifeguard.</p></article>
    </div>
  </section>

  <section class="wrap around" id="map">
    <div class="sec-head"><div class="kicker">Around the neighborhood</div><h2>From our street <em>to the sand</em></h2>
      <p class="sec-lede">Suburbia Park sits right next to the Seaview ballfields, a short walk from the Santa Ana River Trail.  Hop on the trail and it's about two miles along the river to the beach.</p></div>
    <div class="map-grid">
      <figure class="route-card" aria-label="Map from Suburbia Park to the beach">{ROUTE}<figcaption>Our way to the beach: a short walk to the river trail, then about 2.2 miles south along the river.  Distances are approximate.  Simplified map.</figcaption></figure>
      <div class="gm">
        <div class="map-box"><iframe id="gmap" title="Google map of the Suburbia Park area" src="https://maps.google.com/maps?q=Suburbia%20Ln%2C%20Huntington%20Beach%2C%20CA%2092646&amp;z=15&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
        <ol class="places" id="places">
          <li class="on"><button type="button" data-q="Suburbia Ln, Huntington Beach, CA 92646" data-z="16"><span class="pin p-home">1</span><b>Suburbia Park</b><span>Our neighborhood, along Suburbia Lane.</span></button></li>
          <li><button type="button" data-q="Seaview Little League, 20461 Craimer Ln, Huntington Beach, CA 92646" data-z="17"><span class="pin p-field">2</span><b>Seaview Little League fields</b><span>20461 Craimer Lane, right next door.</span></button></li>
          <li><button type="button" data-q="33.66362,-117.94702" data-z="17"><span class="pin p-trail">3</span><b>River trail footbridge</b><span>The closest way onto the trail.</span></button></li>
          <li><button type="button" data-q="33.66033,-117.94940" data-z="17"><span class="pin p-trail">4</span><b>Mile marker 2</b><span>Two miles to the beach.</span></button></li>
          <li><button type="button" data-q="33.62907,-117.95767" data-z="16"><span class="pin p-beach">5</span><b>River mouth and the beach</b><span>Mile 0, at the south end of Huntington State Beach.</span></button></li>
        </ol>
        <a class="more" href="https://www.seaviewlittleleague.com/" rel="noopener" target="_blank">Seaview Little League website &rarr;</a>
      </div>
    </div>
    <p class="map-links"><a href="https://www.surfcityusa.com/" rel="noopener" target="_blank">Visit Huntington Beach</a><a href="https://www.huntingtonbeachca.gov/" rel="noopener" target="_blank">City of Huntington Beach services</a></p>
  </section>

  <section class="wrap sponsors" aria-label="Local sponsors">
    <div class="sec-head"><div class="kicker">Local sponsors</div><h2>Neighbors who keep this <em>going</em></h2></div>
    <div class="ad-strip" data-ad-slot="strip" data-max="3"></div>
  </section>

  <section class="wrap join">
    <div>
      <h2>Have something to share?</h2>
      <p>Post a notice, add an event to the calendar, or send an idea.  Every post is reviewed by a neighbor before it goes up.</p>
    </div>
    <div class="cta-row"><a class="btn btn-red" href="board.html#post">Post a notice</a><a class="btn btn-blue" href="suggestions.html">Send an idea</a></div>
  </section>
</main>'''

# ---------- Calendar ----------
cal = f'''<main>
{hero('Community calendar', 'What\'s <em>happening</em>.', 'Neighborhood events, volunteer days and get-togethers.  Tap a day to see what\'s on.', '', 'hero-short')}
  <section class="wrap cal-wrap">
    <div class="cal">
      <div class="cal-head">
        <button type="button" class="cal-nav" id="calPrev" aria-label="Previous month">&lsaquo;</button>
        <h2 id="calTitle">Month</h2>
        <button type="button" class="cal-nav" id="calNext" aria-label="Next month">&rsaquo;</button>
      </div>
      <div class="cal-dow" aria-hidden="true"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
      <div class="cal-grid" id="calGrid"></div>
      <div class="legend"><span class="k k-social">Social</span><span class="k k-volunteer">Volunteer</span><span class="k k-market">Market</span><span class="k k-beach">Beach</span><span class="k k-sports">Sports</span></div>
    </div>
    <aside class="cal-side">
      <h3 id="dayTitle">Upcoming events</h3>
      <ol class="up-list" id="calList"></ol>
      <a class="btn btn-blue" href="#add">Add an event</a>
    </aside>
  </section>
  <section class="wrap form-wrap" id="add"><div id="addArea">
    <form class="card-form" action="https://formsubmit.co/{FORM_TO}" method="POST">
      <h2>Add an event</h2>
      <p class="fine">Tell us about it and a neighbor will add it to the calendar.</p>
      {FORM_HIDDEN('Suburbia Park: new calendar event', 'https://suburbiapark.com/thanks.html')}
      <div class="row">
        <label>Event name<input name="event" required></label>
        <label>Date<input type="date" name="date" required></label>
      </div>
      <div class="row">
        <label>Start time<input name="time" placeholder="6:00 PM"></label>
        <label>Where<input name="place" placeholder="Seaview fields entrance"></label>
      </div>
      <label>Details<textarea name="details" rows="4"></textarea></label>
      <div class="row">
        <label>Your name<input name="name" required></label>
        <label>Your email<input type="email" name="email" required></label>
      </div>
      <button class="btn btn-red" type="submit">Send event</button>
    </form>
  </div></section>
</main>'''

# ---------- Board ----------
board = f'''<main>
{hero('Bulletin board', 'Neighbors <em>helping</em> neighbors.', 'Lost and found, things for sale or free, recommendations and neighborhood news.', '', 'hero-short')}
  <section class="wrap">
    <div class="chips" id="chips" role="group" aria-label="Filter notices">
      <button type="button" data-k="all" aria-pressed="true">All</button>
      <button type="button" data-k="news" aria-pressed="false">News</button>
      <button type="button" data-k="lost" aria-pressed="false">Lost and found</button>
      <button type="button" data-k="sale" aria-pressed="false">For sale</button>
      <button type="button" data-k="free" aria-pressed="false">Free</button>
      <button type="button" data-k="recommend" aria-pressed="false">Recommendations</button>
      <button type="button" data-k="help" aria-pressed="false">Help wanted</button>
    </div>
    <div class="cork" id="cork"></div>
  </section>
  <section class="wrap form-wrap" id="post"><div id="postArea">
    <form class="card-form" action="https://formsubmit.co/{FORM_TO}" method="POST">
      <h2>Post a notice</h2>
      <p class="fine">Notices are reviewed before they go up.  Please don't include phone numbers or home addresses; we'll connect people privately.</p>
      {FORM_HIDDEN('Suburbia Park: new bulletin board notice', 'https://suburbiapark.com/thanks.html')}
      <div class="row">
        <label>Type of notice
          <select name="type" required>
            <option value="">Choose one</option><option>News</option><option>Lost and found</option><option>For sale</option><option>Free</option><option>Recommendation</option><option>Help wanted</option>
          </select>
        </label>
        <label>Headline<input name="headline" required maxlength="80"></label>
      </div>
      <label>Your notice<textarea name="notice" rows="4" required maxlength="600"></textarea></label>
      <div class="row">
        <label>Your name<input name="name" required></label>
        <label>Your email<input type="email" name="email" required></label>
      </div>
      <button class="btn btn-red" type="submit">Send notice</button>
    </form>
  </div></section>
</main>'''

# ---------- Suggestions ----------
sugg = f'''<main>
{hero('Suggestion box', 'Got an <em>idea</em>?', 'A new event, a safety concern, a fix around the neighborhood, or something that would make Suburbia Park a better place to live.  We read every one.', '', 'hero-short')}
  <section class="wrap sugg">
    <form class="card-form box-form" action="https://formsubmit.co/{FORM_TO}" method="POST">
      <div class="slot" aria-hidden="true"></div>
      <h2>Drop it in the box</h2>
      {FORM_HIDDEN('Suburbia Park: new suggestion', 'https://suburbiapark.com/thanks.html')}
      <label>What's it about?
        <select name="topic" required>
          <option value="">Choose one</option><option>An event idea</option><option>Safety</option><option>Parks and the Seaview fields</option><option>Streets, parking and traffic</option><option>This website</option><option>Something else</option>
        </select>
      </label>
      <label>Your idea<textarea name="idea" rows="6" required maxlength="1500"></textarea></label>
      <div class="row">
        <label>Your name <span class="opt">(optional)</span><input name="name"></label>
        <label>Your email <span class="opt">(optional, if you'd like a reply)</span><input type="email" name="email"></label>
      </div>
      <button class="btn btn-red" type="submit">Drop it in</button>
    </form>
    <aside class="ideas">
      <h3>Ideas to get you started</h3>
      <ul>
        <li><b>Block party</b><span>A summer evening with food, music and a bounce house.</span></li>
        <li><b>Welcome wagon</b><span>A hello and a list of local favorites for new neighbors.</span></li>
        <li><b>Beach cleanup</b><span>A Saturday morning on the sand, then breakfast together.</span></li>
        <li><b>Neighborhood watch</b><span>Neighbors keeping an eye out for each other.</span></li>
        <li><b>Movie night at the fields</b><span>A big screen and blankets on an off-season evening.</span></li>
      </ul>
    </aside>
  </section>
</main>'''

thanks = f'''<main>
{hero('Got it', 'Thanks, <em>neighbor</em>!', 'Your message is on its way.  A neighbor will review it soon.', '<div class="cta-row"><a class="btn btn-red" href="index.html">Back to home</a></div>', 'hero-short')}
</main>'''

nf = f'''<main>
{hero('Page not found', 'Wiped <em>out</em>.', 'That page washed away.  Let\'s get you back to shore.', '<div class="cta-row"><a class="btn btn-red" href="index.html">Back to home</a></div>', 'hero-short')}
</main>'''


acct = f'''<main>
{hero('Neighbors only', 'Your <em>account</em>.', 'Sign in or join to post on the board and add events.  Accounts are just for Suburbia Park households.', '', 'hero-short')}
  <section class="wrap form-wrap acct-wrap" id="acct"><p class="fine">Loading...</p></section>
</main>'''

adminp = f'''<main>
{hero('Admin', 'Keep it <em>neighborly</em>.', 'Approve new neighbors, review reports, manage sponsors and streets.', '', 'hero-short')}
  <section class="wrap form-wrap" id="admin"><p class="fine">Loading...</p></section>
</main>'''

biz = f'''<main>
{hero('Local businesses', 'Shop <em>local</em>.', 'Businesses that support Suburbia Park.  Neighbors helping neighbors.', '', 'hero-short')}
  <section class="wrap">
    <div class="ad-grid" data-ad-slot="directory" data-max="6"></div>
  </section>
  <section class="wrap form-wrap" id="advertise">
    <form class="card-form" action="https://formsubmit.co/{FORM_TO}" method="POST">
      <h2>Advertise with Suburbia Park</h2>
      <p class="fine">Reach the families who live right here.  Sponsor spots are on the home page and this directory.  Only family-friendly local businesses, and we never track visitors.  Tell us about your business and we'll get back to you with options.</p>
      {FORM_HIDDEN('Suburbia Park: advertising inquiry', 'https://suburbiapark.com/thanks.html')}
      <div class="row"><label>Business name<input name="business" required maxlength="80"></label><label>Website <span class="opt">(optional)</span><input name="website" type="url"></label></div>
      <div class="row"><label>Your name<input name="name" required></label><label>Your email<input type="email" name="email" required></label></div>
      <label>Spot you're interested in
        <select name="spot"><option>Home page banner</option><option>Home page sponsor strip</option><option>Local Businesses directory</option><option>Not sure yet</option></select></label>
      <label>Anything else? <span class="opt">(optional)</span><textarea name="details" rows="3" maxlength="600"></textarea></label>
      <button class="btn btn-red" type="submit">Send inquiry</button>
    </form>
  </section>
</main>'''

rules = f'''<main>
{hero('Community rules', 'Be a good <em>neighbor</em>.', 'Kids use this app too, so keep it friendly.', '', 'hero-short')}
  <section class="wrap prose">
    <ol>
      <li><b>Neighbors only.</b>  Accounts are for adults 18 and over who live in Suburbia Park.  Kids use the app through a parent.</li>
      <li><b>Keep it family friendly.</b>  No swearing, insults, politics fights or anything you wouldn't say at a block party.</li>
      <li><b>Protect privacy.</b>  Don't post phone numbers, home addresses, license plates or photos of kids.  Never share someone else's information.</li>
      <li><b>No selling scams or spam.</b>  Selling your own things is fine.  Businesses advertise through a sponsor spot.</li>
      <li><b>Report, don't argue.</b>  If a post breaks the rules, tap Report.  It's hidden until a moderator reviews it.</li>
      <li><b>Emergencies go to 911.</b>  This app is not monitored around the clock.</li>
    </ol>
    <p>Moderators can remove posts and suspend accounts that break these rules.</p>
  </section>
</main>'''

priv = f'''<main>
{hero('Privacy', 'Your <em>privacy</em>.', 'What we collect, why, and who sees it.  Effective October 20, 2026.', '', 'hero-short')}
  <section class="wrap prose">
    <h2>What we collect</h2>
    <ul>
      <li><b>When you join:</b> your first name, last initial, house number, street and email address.</li>
      <li><b>When you post:</b> the notices and events you post, and any reports you make.</li>
      <li><b>When you use a form</b> (suggestion box, advertising inquiry, or posting before sign-in is available): whatever you type, plus your name and email if you give them.</li>
    </ul>
    <h2>How we use it</h2>
    <ul>
      <li>Your address is used only to confirm you live in Suburbia Park.  It is never shown to other neighbors.</li>
      <li>Posts show only your first name and last initial.</li>
      <li>Your email is used to send you sign-in links and to reply to you.</li>
      <li>We don't sell your information, and we don't use ad networks or tracking cookies.  Sponsors never get your information.</li>
    </ul>
    <h2>Who handles it for us</h2>
    <ul>
      <li>Supabase stores accounts, posts and events.</li>
      <li>FormSubmit delivers form messages by email.</li>
      <li>Google Maps shows the map on the home page and may collect data under Google's own privacy policy.</li>
    </ul>
    <h2>Do Not Track</h2>
    <p>We don't track visitors across sites, so there is nothing for a Do Not Track signal to turn off.</p>
    <h2>Your choices</h2>
    <p>You can ask us to correct or delete your account and posts through the Suggestion Box.  If we change this policy, we'll post the new version here with a new effective date.</p>
  </section>
</main>'''

helpp = f"""<main>
{hero('Neighbors helping neighbors', 'A little help goes a <em>long way</em>.', 'Grocery runs, pharmacy pickups, a ride to the doctor, help with a new phone, or just a friendly check-in.  Ask for a hand, or offer one.', '<div class="cta-row"><a class="btn btn-red" href="#ask">Ask for help</a><a class="btn btn-white" href="#ask">Offer to help</a></div>', 'hero-short')}
  <section class="wrap how">
    <div class="how-step"><span class="hs-n">1</span><h3>Ask or offer</h3><p>Post what you need, or what you're happy to do for a neighbor.</p></div>
    <div class="how-step"><span class="hs-n">2</span><h3>A neighbor replies</h3><p>Tap "I can help" and leave a note.  Only the person who asked sees it.</p></div>
    <div class="how-step"><span class="hs-n">3</span><h3>Connect and help</h3><p>Share contact details privately, then mark it "Got help."</p></div>
  </section>
  <section class="wrap">
    <div class="chips" id="helpChips" role="group" aria-label="Filter">
      <button type="button" data-k="all" aria-pressed="true">All</button>
      <button type="button" data-k="ask" aria-pressed="false">Needs a hand</button>
      <button type="button" data-k="offer" aria-pressed="false">Offering to help</button>
    </div>
    <div class="help-grid" id="helpList"></div>
    <div class="my-help" id="myHelp" hidden></div>
  </section>
  <section class="wrap form-wrap help-split" id="ask">
    <div id="helpArea">
      <form class="card-form" action="https://formsubmit.co/{FORM_TO}" method="POST">
        <h2>Ask for help or offer it</h2>
        <p class="fine">Tell us what you need or what you can do, and a neighbor will post it and help connect you.  You can also ask on behalf of a neighbor who doesn't use the internet.</p>
        {FORM_HIDDEN('Suburbia Park: help request or offer', 'https://suburbiapark.com/thanks.html')}
        <div class="row"><label>I want to<select name="type" required><option>Ask for help</option><option>Offer to help</option><option>Ask for a neighbor</option></select></label>
          <label>Kind of help<select name="kind"><option>Groceries and shopping</option><option>Errands and pickups</option><option>Rides to appointments</option><option>Meals</option><option>Yard and odd jobs</option><option>Pet care</option><option>Tech help</option><option>Friendly check-ins</option><option>Something else</option></select></label></div>
        <label>Details<textarea name="details" rows="4" required maxlength="800"></textarea></label>
        <div class="row"><label>Your name<input name="name" required></label><label>Your email<input type="email" name="email" required></label></div>
        <button class="btn btn-red" type="submit">Send</button>
      </form>
    </div>
    <aside class="ideas safety">
      <h3>Helping safely</h3>
      <ul>
        <li><b>Meet at the door</b><span>Hand off groceries and packages at the front door.</span></li>
        <li><b>No cards or PINs</b><span>Never hand over a bank card, PIN or password.  Pay back with cash, check or a payment app after the errand.</span></li>
        <li><b>Keep it simple</b><span>Agree on what's needed and the cost up front.</span></li>
        <li><b>Tell someone</b><span>Let a family member know who's helping and when.</span></li>
        <li><b>Emergencies</b><span>Call 911.  This page isn't watched around the clock.</span></li>
      </ul>
    </aside>
  </section>
</main>"""

pages = [
    ('index.html', 'Suburbia Park | Huntington Beach Neighborhood', 'The community website for the Suburbia Park neighborhood in Huntington Beach, California: calendar, bulletin board and suggestion box.', home, '<script src="assets/js/data.js"></script>\n<script src="assets/js/home.js"></script>\n<script src="assets/js/ads.js"></script>\n<script src="assets/js/map.js"></script>'),
    ('calendar.html', 'Calendar | Suburbia Park', 'Suburbia Park community calendar: neighborhood events in Huntington Beach.', cal, '<script src="assets/js/data.js"></script>\n<script src="assets/js/calendar.js"></script>'),
    ('board.html', 'Bulletin Board | Suburbia Park', 'Suburbia Park bulletin board: lost and found, for sale, free, recommendations and news.', board, '<script src="assets/js/data.js"></script>\n<script src="assets/js/board.js"></script>'),
    ('suggestions.html', 'Suggestion Box | Suburbia Park', 'Send an idea to make Suburbia Park even better.', sugg, ''),
    ('account.html', 'Your account | Suburbia Park', 'Sign in or join the Suburbia Park community app.', acct, '<script src="assets/js/account.js"></script>'),
    ('admin.html', 'Admin | Suburbia Park', 'Suburbia Park admin.', adminp, '<script src="assets/js/admin.js"></script>'),
    ('help.html', 'Help a Neighbor | Suburbia Park', 'Neighbors helping neighbors in Suburbia Park: grocery runs, errands, rides and check-ins.', helpp, '<script src="assets/js/data.js"></script>\n<script src="assets/js/help.js"></script>'),
    ('businesses.html', 'Local Businesses | Suburbia Park', 'Local businesses that support Suburbia Park, and how to advertise.', biz, '<script src="assets/js/ads.js"></script>'),
    ('rules.html', 'Community Rules | Suburbia Park', 'Suburbia Park community rules.', rules, ''),
    ('privacy.html', 'Privacy | Suburbia Park', 'Suburbia Park privacy policy.', priv, ''),
    ('offline.html', 'Offline | Suburbia Park', 'You are offline.', f"""<main>
{hero('No connection', 'You\'re <em>offline</em>.', 'Check your signal and try again.  Pages you opened recently still work.', '<div class="cta-row"><a class="btn btn-red" href="index.html">Try again</a></div>', 'hero-short')}
</main>""", ''),
    ('thanks.html', 'Thanks | Suburbia Park', 'Thanks for your message.', thanks, ''),
    ('404.html', 'Page not found | Suburbia Park', 'Page not found.', nf, ''),
]
for f, t, d, b, s in pages:
    html = page(f, t, d, b, s)
    if f in ('thanks.html', '404.html', 'admin.html', 'account.html', 'offline.html'):
        html = html.replace('<meta name="description"', '<meta name="robots" content="noindex">\n<meta name="description"', 1)
    (ROOT / f).write_text(html)
# Stamp the offline worker with a version from every page, script and style, so phones pick up each update
import glob
h = hashlib.md5()
for f in sorted(glob.glob(str(ROOT / '*.html')) + glob.glob(str(ROOT / 'assets/js/*.js')) + glob.glob(str(ROOT / 'assets/css/*.css'))):
    h.update(pathlib.Path(f).read_bytes())
sw = (ROOT / 'sw.js').read_text()
sw = re.sub(r'const CACHE = "sp-[^"]*";', f'const CACHE = "sp-{h.hexdigest()[:10]}";', sw)
(ROOT / 'sw.js').write_text(sw)
print('built')
