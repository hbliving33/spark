import pathlib, math

ROOT = pathlib.Path('/home/claude/spark')
N, O, R, C, S, Y, G, SK = '#14304d', '#1271a8', '#e63946', '#ff8a5b', '#ecd6a6', '#ffd23f', '#3f9b6a', '#bfe6f5'


def wave(y, x0=14, x1=106, amp=6, n=3, color=O, w=7):
    step = (x1 - x0) / n
    d = f'M{x0} {y}' + ''.join(f' q{step/4:.1f} {-amp} {step/2:.1f} 0 t{step/2:.1f} 0' for _ in range(n))
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linecap="round"/>'


def rays(cx, cy, r1, r2, n=12, color=Y, w=4, start=0, span=360):
    out = ''
    for i in range(n):
        a = math.radians(start + span * i / (n - 1 if span < 360 else n))
        out += f'<line x1="{cx + r1*math.cos(a):.1f}" y1="{cy - r1*math.sin(a):.1f}" x2="{cx + r2*math.cos(a):.1f}" y2="{cy - r2*math.sin(a):.1f}" stroke="{color}" stroke-width="{w}" stroke-linecap="round"/>'
    return out


PALM = f'<path d="M62 96 C 60 76 60 58 66 42" fill="none" stroke="#8a6a45" stroke-width="6" stroke-linecap="round"/><path d="M66 42 c-14 -8 -30 -4 -38 8 c12 -6 26 -6 38 -4 c-10 -10 -24 -16 -36 -10 c14 0 26 4 36 10 c2 -14 -6 -26 -16 -30 c8 8 14 20 16 28 c8 -12 24 -18 38 -12 c-14 2 -26 8 -34 16 c16 -4 28 2 36 12 c-12 -8 -26 -10 -40 -6z" fill="{G}"/>'

LOGOS = [
 ('Home Wave', 'A simple house whose base rolls into a wave: home, right by the beach.',
  f'<path d="M20 58 L60 24 L100 58" fill="none" stroke="{N}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/><path d="M30 54 V80 H90 V54" fill="none" stroke="{N}" stroke-width="8" stroke-linejoin="round"/><rect x="53" y="62" width="14" height="18" rx="2" fill="{R}"/>{wave(94)}'),
 ('Palm and Sun', 'A palm in front of a rising sun.  Classic Surf City, warm and friendly.',
  f'<circle cx="60" cy="70" r="40" fill="{Y}" opacity=".9"/><rect x="10" y="88" width="100" height="22" fill="#fff"/>{wave(92, 16, 104, 5, 3, O, 6)}{PALM}'),
 ('Wave Roof', 'The roofline is a curling wave, like a surf break over the neighborhood.',
  f'<path d="M18 62 C 30 30 70 18 92 34 C 104 44 100 60 88 60 C 80 60 78 50 86 48" fill="none" stroke="{O}" stroke-width="9" stroke-linecap="round"/><path d="M28 62 V94 H92 V62" fill="none" stroke="{N}" stroke-width="8" stroke-linejoin="round"/><rect x="40" y="72" width="14" height="12" rx="2" fill="{SK}" stroke="{N}" stroke-width="3"/><rect x="66" y="72" width="14" height="22" rx="2" fill="{R}"/>'),
 ('SP Swell', 'A rounded S and P monogram that reads like a rolling swell.',
  f'<path d="M64 26 C 40 18 24 34 34 48 C 42 60 70 58 74 72 C 80 92 52 100 30 90" fill="none" stroke="{O}" stroke-width="11" stroke-linecap="round"/><path d="M80 98 V30 C 104 28 108 58 82 60" fill="none" stroke="{R}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>'),
 ('Sun Wheel', 'A bike wheel that doubles as the sun.  For the families riding the river trail.',
  f'<circle cx="60" cy="58" r="30" fill="none" stroke="{N}" stroke-width="6"/>' + ''.join(f'<line x1="60" y1="58" x2="{60+30*math.cos(math.radians(a)):.1f}" y2="{58+30*math.sin(math.radians(a)):.1f}" stroke="{N}" stroke-width="2"/>' for a in range(0, 360, 30)) + f'<circle cx="60" cy="58" r="6" fill="{R}"/>{rays(60, 58, 38, 48, 12, Y, 5)}{wave(104, 20, 100, 4, 3, O, 5)}'),
 ('Tower Badge', 'A red-roofed lifeguard tower in a round badge.  Watching out for each other.',
  f'<circle cx="60" cy="60" r="50" fill="{SK}"/><path d="M14 80 C 40 72 80 88 106 78 V96 A50 50 0 0 1 14 96Z" fill="{S}"/><path d="M42 92 L50 58 M78 92 L70 58 M46 76 H74" stroke="#fff" stroke-width="5" stroke-linecap="round"/><rect x="44" y="40" width="32" height="20" rx="2" fill="#fff" stroke="{N}" stroke-width="3"/><path d="M38 42 L60 26 L82 42Z" fill="{R}"/><rect x="51" y="45" width="18" height="8" fill="{N}"/><circle cx="60" cy="60" r="50" fill="none" stroke="{N}" stroke-width="4"/>'),
 ('Three Roofs', 'Three rooftops side by side over a wave.  Neighbors, together, by the sea.',
  f'<path d="M14 66 L32 48 L50 66 M42 66 L60 44 L78 66 M70 66 L88 48 L106 66" fill="none" stroke="{N}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><path d="M50 66 L60 44 L70 66" fill="none" stroke="{R}" stroke-width="7" stroke-linejoin="round"/>{wave(84, 14, 106, 6, 4, O, 7)}'),
 ('Pin Wave', 'A map pin holding a little ocean: "you are here," a short ride from the sand.',
  f'<path d="M60 108 C 60 108 22 70 22 46 A38 38 0 0 1 98 46 C 98 70 60 108 60 108Z" fill="{O}"/><circle cx="60" cy="46" r="22" fill="#fff"/><path d="M42 50 q4.5 -6 9 0 t9 0 t9 0 t9 0" fill="none" stroke="{O}" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="38" r="6" fill="{Y}"/>'),
 ('Heart Home', 'A house with a heart for a door.  Neighbors helping neighbors.',
  f'<path d="M18 60 L60 22 L102 60" fill="none" stroke="{N}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/><path d="M28 56 V96 H92 V56" fill="none" stroke="{N}" stroke-width="8" stroke-linejoin="round"/><path d="M60 88 C 46 78 42 72 42 66 A8 8 0 0 1 60 62 A8 8 0 0 1 78 66 C 78 72 74 78 60 88Z" fill="{R}"/>'),
 ('Surfboard', 'A tall surfboard with a stripe, standing proud like a local landmark.',
  f'<path d="M60 10 C 84 34 84 86 60 110 C 36 86 36 34 60 10Z" fill="{Y}" stroke="{N}" stroke-width="4"/><path d="M60 14 V106" stroke="{R}" stroke-width="5"/><path d="M44 72 C 52 66 68 66 76 72" fill="none" stroke="{O}" stroke-width="5" stroke-linecap="round"/>'),
 ('River Path', 'A dotted path winding from a home down to the waves: our way to the beach.',
  f'<path d="M26 40 L40 26 L54 40 V54 H26Z" fill="{R}"/><path d="M44 58 C 44 78 80 66 82 86" fill="none" stroke="{O}" stroke-width="6" stroke-dasharray="1 10" stroke-linecap="round"/>{wave(98, 52, 108, 5, 2, O, 7)}<circle cx="92" cy="30" r="12" fill="{Y}"/>'),
 ('Neighborhood Seal', 'A round seal with a palm and the name around the edge.  Feels established.',
  f'<circle cx="60" cy="60" r="52" fill="#fff" stroke="{N}" stroke-width="4"/><circle cx="60" cy="60" r="36" fill="{SK}"/><g transform="translate(20 6) scale(.68)">{PALM}</g>{wave(76, 30, 90, 4, 3, O, 5)}<path id="arcTop" d="M18 60 A42 42 0 0 1 102 60" fill="none"/><text font-family="Fredoka, sans-serif" font-weight="700" font-size="11" fill="{N}" letter-spacing="2"><textPath href="#arcTop" startOffset="50%" text-anchor="middle">SUBURBIA PARK</textPath></text><path id="arcBot" d="M20 64 A40 40 0 0 0 100 64" fill="none"/><text font-family="Fredoka, sans-serif" font-weight="600" font-size="8" fill="{R}" letter-spacing="1.6"><textPath href="#arcBot" startOffset="50%" text-anchor="middle">HUNTINGTON BEACH</textPath></text>'),
 ('Sunset Stripes', 'A striped sunset over the water.  A little retro, very California.',
  f'<defs><clipPath id="sunc"><circle cx="60" cy="66" r="42"/></clipPath></defs><g clip-path="url(#sunc)"><rect x="0" y="20" width="120" height="100" fill="{C}"/><rect x="0" y="20" width="120" height="22" fill="{Y}"/><rect x="0" y="48" width="120" height="8" fill="#fff"/><rect x="0" y="62" width="120" height="6" fill="#fff"/><rect x="0" y="72" width="120" height="48" fill="{O}"/></g>{wave(84, 22, 98, 4, 3, "#fff", 4)}'),
 ('Kite', 'A diamond kite with a wave for a tail.  Playful, made for the kids.',
  f'<path d="M58 12 L86 42 L58 78 L30 42Z" fill="{R}" stroke="{N}" stroke-width="3"/><path d="M58 12 V78 M30 42 H86" stroke="#fff" stroke-width="3"/><path d="M58 78 C 66 88 50 92 58 102 C 64 110 54 112 60 116" fill="none" stroke="{O}" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 5"/><path d="M58 42 L86 42 L58 12Z" fill="{Y}"/>'),
 ('Doorway', 'An arched front door that opens onto the ocean.  Home with a view.',
  f'<path d="M30 104 V52 A30 30 0 0 1 90 52 V104" fill="{SK}" stroke="{N}" stroke-width="7"/><circle cx="60" cy="54" r="10" fill="{Y}"/><path d="M33 76 h54 V101 H33Z" fill="{O}"/>{wave(82, 34, 86, 3, 3, "#fff", 3)}<path d="M22 104 H98" stroke="{N}" stroke-width="7" stroke-linecap="round"/>'),
 ('Fence Wave', 'A white picket fence that turns into a wave.  Suburbia meets the surf.',
  ''.join(f'<path d="M{x} 86 V{52 - (i * 4 if i < 4 else 0)} l6 -8 l6 8 V86Z" fill="#fff" stroke="{N}" stroke-width="3" stroke-linejoin="round"/>' for i, x in enumerate([16, 34, 52])) + f'<path d="M70 86 C 70 60 84 40 100 44 C 110 47 108 60 98 60 C 92 60 92 53 96 52" fill="none" stroke="{O}" stroke-width="8" stroke-linecap="round"/><path d="M10 86 H110" stroke="{N}" stroke-width="5" stroke-linecap="round"/>{wave(100, 16, 104, 4, 3, O, 5)}'),
 ('Beach Ball', 'A bright beach ball resting on a wave.  Fun first, made for families.',
  f'<defs><clipPath id="ballc"><circle cx="60" cy="54" r="34"/></clipPath></defs><g clip-path="url(#ballc)"><rect x="20" y="16" width="80" height="80" fill="#fff"/><path d="M60 54 L26 10 L60 10Z" fill="{R}"/><path d="M60 54 L110 30 L110 70Z" fill="{Y}"/><path d="M60 54 L40 100 L80 100Z" fill="{O}"/><path d="M60 54 L10 40 L10 80Z" fill="{G}"/></g><circle cx="60" cy="54" r="34" fill="none" stroke="{N}" stroke-width="4"/><circle cx="60" cy="54" r="5" fill="#fff" stroke="{N}" stroke-width="2"/>{wave(100, 18, 102, 5, 3, O, 6)}'),
 ('Pelican Glide', 'A pelican gliding low over a wave, like the ones along the river trail.',
  f'<circle cx="86" cy="32" r="12" fill="{Y}"/><path d="M14 64 C 30 50 46 48 58 58 C 70 46 88 44 104 54 C 90 54 76 58 66 66 L 58 70 C 50 64 32 60 14 64Z" fill="{N}"/><path d="M58 58 C 56 52 60 46 66 46 C 72 46 74 52 70 56 L 92 60 L 70 62Z" fill="{N}"/><path d="M70 60 L92 60 L72 64Z" fill="{C}"/>{wave(90, 14, 106, 6, 4, O, 7)}'),
]
# Fence Wave variations with the US flag (concepts 19 to 24)
def picket(x, top, fill='#fff', w=12, sw=3):
    h = w / 2
    return f'<path d="M{x} 86 V{top} l{h} -8 l{h} 8 V86Z" fill="{fill}" stroke="{N}" stroke-width="{sw}" stroke-linejoin="round"/>'

def outline(x, top, w=12, sw=3):
    h = w / 2
    return f'<path d="M{x} 86 V{top} l{h} -8 l{h} 8 V86Z" fill="none" stroke="{N}" stroke-width="{sw}" stroke-linejoin="round"/>'

def stripes(x, top, w=12, colors=(R, '#fff'), band=5):
    out, y, i = '', top, 0
    out += f'<path d="M{x} {top} l{w/2} -8 l{w/2} 8Z" fill="{R}"/>'
    while y < 86:
        out += f'<rect x="{x}" y="{y}" width="{w}" height="{min(band, 86 - y)}" fill="{colors[i % 2]}"/>'
        y += band; i += 1
    return out

def star(cx, cy, r, color='#fff'):
    pts = []
    for k in range(10):
        a = math.radians(-90 + 36 * k); rr = r if k % 2 == 0 else r * .42
        pts.append(f'{cx + rr*math.cos(a):.1f},{cy + rr*math.sin(a):.1f}')
    return f'<polygon points="{" ".join(pts)}" fill="{color}"/>'

CURL = f'<path d="M70 86 C 70 60 84 40 100 44 C 110 47 108 60 98 60 C 92 60 92 53 96 52" fill="none" stroke="{O}" stroke-width="8" stroke-linecap="round"/>'
BASE = f'<path d="M10 86 H110" stroke="{N}" stroke-width="5" stroke-linecap="round"/>{wave(100, 16, 104, 4, 3, O, 5)}'
TOPS = [52, 48, 44]

FLAG_FENCE = [
 ('Flag Fence', 'The picket fence painted as the flag: a blue picket with stars, then red and white stripes, rolling into the wave.',
  f'<path d="M16 86 V52 l6 -8 l6 8 V86Z" fill="{N}"/>' + star(22, 58, 4.2) + star(22, 70, 4.2) +
  stripes(34, 48) + stripes(52, 44) + ''.join(outline(x, t) for x, t in zip([16, 34, 52], TOPS)) + CURL + BASE),
 ('Old Glory Gate', 'Our fence with a flag flying from the corner post, waving in the ocean breeze.',
  ''.join(picket(x, t) for x, t in zip([34, 52, 70], [50, 46, 50])) +
  f'<path d="M22 86 V18" stroke="{N}" stroke-width="4" stroke-linecap="round"/><circle cx="22" cy="16" r="3" fill="{Y}"/>' +
  f'<path d="M24 20 C 40 14 52 26 70 20 V48 C 52 54 40 42 24 48Z" fill="#fff" stroke="{N}" stroke-width="2"/>' +
  ''.join(f'<path d="M24 {24 + k*8} C 40 {18 + k*8} 52 {30 + k*8} 70 {24 + k*8}" fill="none" stroke="{R}" stroke-width="4"/>' for k in range(3)) +
  f'<path d="M24 20 C 32 17 38 18 44 20 V34 C 38 32 32 32 24 34Z" fill="{N}"/>' + star(31, 26, 3) + star(38, 28, 2.4) +
  f'<path d="M86 86 C 88 66 98 58 106 62 C 112 65 110 74 104 74" fill="none" stroke="{O}" stroke-width="7" stroke-linecap="round"/>' + BASE),
 ('Star Rail', 'White pickets on a red and blue rail, with a star at the curl of the wave.',
  f'<path d="M12 60 H70" stroke="{R}" stroke-width="7" stroke-linecap="round"/><path d="M12 76 H70" stroke="{N}" stroke-width="7" stroke-linecap="round"/>' +
  ''.join(picket(x, t) for x, t in zip([16, 34, 52], TOPS)) +
  ''.join(star(x, 76, 2.6) for x in [25, 43, 61]) + CURL + star(97, 52, 7, Y) + BASE),
 ('Fourth on the Fence', 'Fireworks over the fence and the surf, the way the neighborhood looks on the Fourth of July.',
  rays(30, 26, 4, 14, 10, R, 3) + rays(62, 16, 3, 11, 10, N, 3) + rays(94, 26, 4, 13, 10, O, 3) +
  f'<circle cx="30" cy="26" r="2.5" fill="{Y}"/><circle cx="62" cy="16" r="2.5" fill="{Y}"/><circle cx="94" cy="26" r="2.5" fill="{Y}"/>' +
  ''.join(picket(x, t + 8) for x, t in zip([16, 34, 52], TOPS)) + CURL.replace('C 70 60 84 40 100 44 C 110 47 108 60 98 60 C 92 60 92 53 96 52', 'C 70 64 84 50 100 54 C 110 57 108 70 98 70 C 92 70 92 63 96 62') + BASE),
 ('Stripes to Sea', 'The flag\'s stripes stretch out into the waves, with the starry corner set in the fence.',
  f'<rect x="14" y="40" width="34" height="26" rx="3" fill="{N}"/>' + ''.join(star(x, y, 3) for x, y in [(22, 48), (32, 48), (42, 48), (27, 58), (37, 58)]) +
  ''.join(picket(x, 44, '#fff', 10) for x in [52]) +
  ''.join(f'<path d="M64 {48 + k*10} C 78 {42 + k*10} 92 {54 + k*10} 108 {48 + k*10}" fill="none" stroke="{R if k % 2 == 0 else O}" stroke-width="5" stroke-linecap="round"/>' for k in range(4)) +
  f'<path d="M14 72 V86 M26 72 V86 M38 72 V86" stroke="{N}" stroke-width="3"/>' + BASE),
 ('Liberty Picket', 'A tall center picket shaped like a flagpole, wearing a little flag, with the fence and wave on either side.',
  picket(16, 60) + picket(32, 54) + f'<path d="M54 86 V20" stroke="{N}" stroke-width="5" stroke-linecap="round"/><path d="M54 14 l4 6 h-8Z" fill="{Y}"/>' +
  f'<rect x="56" y="22" width="30" height="20" fill="#fff" stroke="{N}" stroke-width="2"/>' + ''.join(f'<rect x="56" y="{22 + k*5.7:.1f}" width="30" height="2.85" fill="{R}"/>' for k in range(4)) +
  f'<rect x="56" y="22" width="13" height="11" fill="{N}"/>' + star(62.5, 27.5, 3) +
  f'<path d="M72 86 C 74 68 88 58 100 62 C 110 65 108 76 100 76" fill="none" stroke="{O}" stroke-width="8" stroke-linecap="round"/>' + BASE),
]
LOGOS.extend(FLAG_FENCE)



def mark(svg, size=120):
    return f'<svg viewBox="0 0 120 120" width="{size}" height="{size}" role="img" aria-hidden="true">{svg}</svg>'


cards = ''
for i, (name, why, svg) in enumerate(LOGOS, 1):
    cards += f'''
  <article class="lc" id="logo-{i}">
    <div class="lc-main">{mark(svg, 92)}<div class="lc-word"><b>Suburbia Park</b><small>Huntington Beach, California</small></div></div>
    <div class="lc-alt">
      <div class="lc-dark">{mark(svg, 54)}<span>Suburbia Park</span></div>
      <div class="lc-icon" title="Phone app icon">{mark(svg, 46)}</div>
    </div>
    <h2><span class="lc-num">{i}</span>{name}</h2>
    <p>{why}</p>
  </article>'''

html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Logo Options | Suburbia Park</title>
<link rel="icon" href="assets/img/mark.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito+Sans:wght@400;700;800&display=swap">
<style>
  :root {{ --navy: {N}; --ocean: {O}; --red: {R}; --ink: #18324a; --muted: #5a7186; --line: #d6e7ee; }}
  * {{ box-sizing: border-box; }}
  body {{ margin: 0; font-family: "Nunito Sans", system-ui, sans-serif; color: var(--ink); background: linear-gradient(180deg, #b9e3f3, #eaf7fb 300px, #fbfdff 600px); }}
  header {{ max-width: 1180px; margin: 0 auto; padding: 40px 20px 10px; }}
  h1 {{ font-family: Fredoka, sans-serif; font-weight: 700; font-size: clamp(32px, 5vw, 52px); margin: 6px 0 8px; color: var(--navy); }}
  h1 em {{ font-style: normal; color: var(--red); }}
  .kicker {{ font-family: Fredoka, sans-serif; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--ocean); font-size: 14px; }}
  header p {{ max-width: 60ch; margin: 0; font-size: 17px; }}
  .grid {{ max-width: 1180px; margin: 24px auto 60px; padding: 0 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 18px; }}
  .lc {{ position: relative; background: #fff; border: 1px solid var(--line); border-radius: 22px; padding: 20px; box-shadow: 0 10px 30px rgba(20, 48, 77, .1); display: grid; gap: 12px; }}
  .lc-num {{ display: inline-grid; margin-right: 8px; vertical-align: 2px; width: 28px; height: 28px; font-size: 15px; border-radius: 50%; background: var(--navy); color: #fff; display: grid; place-items: center; font-family: Fredoka, sans-serif; font-weight: 700; }}
  .lc-main {{ display: flex; align-items: center; gap: 12px; min-height: 100px; }}
  .lc-word b {{ display: block; font-family: Fredoka, sans-serif; font-weight: 700; font-size: 24px; line-height: 1; color: var(--navy); }}
  .lc-word small {{ display: block; margin-top: 4px; color: var(--muted); font-size: 12.5px; }}
  .lc-alt {{ display: flex; gap: 10px; align-items: center; }}
  .lc-dark {{ flex: 1; display: flex; align-items: center; gap: 8px; background: var(--navy); border-radius: 14px; padding: 6px 10px; }}
  .lc-dark span {{ font-family: Fredoka, sans-serif; font-weight: 700; color: #fff; font-size: 17px; }}
  .lc-dark svg {{ background: #fff; border-radius: 50%; padding: 3px; }}
  .lc-icon {{ width: 62px; height: 62px; border-radius: 15px; background: #fff; border: 1px solid var(--line); box-shadow: 0 4px 10px rgba(20, 48, 77, .12); display: grid; place-items: center; }}
  .lc h2 {{ display: flex; align-items: center; font-family: Fredoka, sans-serif; font-weight: 600; font-size: 20px; margin: 4px 0 0; color: var(--navy); }}
  .lc p {{ margin: 0; color: var(--muted); font-size: 14.5px; line-height: 1.5; }}
  @media (max-width: 400px) {{ .grid {{ grid-template-columns: 1fr; }} .lc-word b {{ font-size: 21px; }} }}
  footer {{ text-align: center; color: var(--muted); padding: 0 20px 40px; font-size: 14px; }}
</style>
</head>
<body>
<header>
  <div class="kicker">Logo options</div>
  <h1>Pick a <em>favorite</em>.</h1>
  <p>Twenty-four ideas for the Suburbia Park logo.  Number 16, Fence Wave, is the one in use now, and numbers 19 to 24 are new takes on it with the flag.  Each card shows the logo with the name, on a dark background, and as a phone app icon.  Tell us the number you like, or mix and match.</p>
</header>
<main class="grid">{cards}
</main>
<footer>Suburbia Park logo concepts.  Not linked from the site menu.</footer>
</body>
</html>
'''
(ROOT / 'logos.html').write_text(html)
print('logos', len(LOGOS))
