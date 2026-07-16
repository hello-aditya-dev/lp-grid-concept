"""
Generate the Open Graph image for LP Grid concept.
1200×630, uses the actual network layout engine (mirrored from layouts.ts)
to render a faithful static composition.
"""
import math
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
OUT = "/home/z/my-project/public/og-lp-grid-concept.png"

# Colors (mirror of NetworkCanvas.tsx)
BG = (10, 14, 20)
NODE_AMBIENT = (150, 162, 188, 115)
NODE_ACTIVE = (195, 207, 232, 217)
NODE_HIGH = (232, 240, 255, 242)
NODE_SELECTED = (232, 184, 100, 255)
LINE_LOW = (120, 140, 180, 22)
LINE_MED = (140, 165, 210, 55)
LINE_HIGH = (180, 200, 235, 120)
LINE_SELECTED = (232, 184, 100, 220)
TEXT_BRIGHT = (244, 248, 255)
TEXT_DIM = (170, 180, 200)
TEXT_FAINT = (110, 120, 140)
TEXT_AMBER = (232, 184, 100)

# 60 fictional investors — fields: id, geography, strategies, score, priority
INVESTORS = [
    ("meridian", "Middle East", ["Infrastructure", "Private equity", "Private credit", "Real assets", "Venture capital"], 0.94, "high"),
    ("northbridge", "North America", ["Private equity", "Infrastructure", "Private credit"], 0.88, "high"),
    ("helix", "Europe", ["Private credit", "Real assets", "Infrastructure"], 0.81, "high"),
    ("alder", "North America", ["Venture capital", "Private equity", "Secondaries"], 0.76, "active"),
    ("westmark", "Europe", ["Private equity", "Venture capital", "Secondaries"], 0.62, "active"),
    ("arcadia", "Asia-Pacific", ["Infrastructure", "Real assets", "Private equity"], 0.90, "high"),
    ("calder", "Europe", ["Private equity", "Real assets"], 0.55, "active"),
    ("kestrel", "Europe", ["Private equity", "Private credit", "Infrastructure"], 0.83, "high"),
    ("orien", "North America", ["Private equity", "Secondaries", "Private credit"], 0.71, "active"),
    ("pier", "Europe", ["Private credit", "Real assets"], 0.74, "active"),
    ("sable", "North America", ["Private equity", "Venture capital", "Secondaries"], 0.58, "active"),
    ("tamar", "North America", ["Venture capital", "Private equity"], 0.79, "active"),
    ("vermont", "Europe", ["Private equity", "Secondaries"], 0.49, "ambient"),
    ("rhine", "Europe", ["Private equity", "Infrastructure", "Private credit"], 0.80, "high"),
    ("asi", "Middle East", ["Infrastructure", "Real assets", "Private equity"], 0.92, "high"),
    ("kairos", "Asia-Pacific", ["Private equity", "Secondaries", "Venture capital"], 0.66, "active"),
    ("marin", "Europe", ["Private credit", "Infrastructure"], 0.69, "active"),
    ("atlas", "Asia-Pacific", ["Infrastructure", "Private equity", "Real assets"], 0.85, "high"),
    ("halcyon", "Europe", ["Venture capital", "Private equity"], 0.72, "active"),
    ("cypress", "Asia-Pacific", ["Venture capital", "Private equity", "Secondaries"], 0.61, "active"),
    ("ridge", "Europe", ["Private equity", "Secondaries"], 0.68, "active"),
    ("soleil", "Europe", ["Real assets", "Private equity"], 0.52, "ambient"),
    ("qmc", "North America", ["Private equity", "Infrastructure"], 0.54, "ambient"),
    ("boreas", "Europe", ["Private equity", "Infrastructure", "Private credit"], 0.77, "active"),
    ("mira", "Middle East", ["Infrastructure", "Real assets", "Private equity"], 0.89, "high"),
    ("lumen", "Asia-Pacific", ["Private credit", "Real assets"], 0.67, "active"),
    ("fenway", "North America", ["Venture capital", "Private equity", "Secondaries"], 0.80, "high"),
    ("stirling", "Europe", ["Private equity", "Real assets"], 0.50, "ambient"),
    ("norwood", "North America", ["Private equity", "Secondaries"], 0.63, "active"),
    ("meridian2", "Asia-Pacific", ["Infrastructure", "Private equity", "Private credit"], 0.82, "high"),
    ("harbor", "North America", ["Real assets", "Private equity"], 0.57, "active"),
    ("summit", "North America", ["Private credit", "Real assets"], 0.65, "active"),
    ("ellsworth", "North America", ["Venture capital", "Private equity", "Secondaries"], 0.60, "active"),
    ("axiom", "Europe", ["Private equity", "Secondaries"], 0.70, "active"),
    ("terra", "Middle East", ["Infrastructure", "Real assets", "Private equity"], 0.91, "high"),
    ("quill", "Europe", ["Venture capital", "Private equity"], 0.73, "active"),
    ("pinnacle", "Asia-Pacific", ["Private equity", "Secondaries", "Private credit"], 0.64, "active"),
    ("lattice", "Europe", ["Private equity", "Infrastructure"], 0.56, "ambient"),
    ("northgate", "Europe", ["Private equity", "Private credit", "Infrastructure"], 0.71, "active"),
    ("saffron", "Middle East", ["Private equity", "Venture capital"], 0.59, "active"),
    ("amber", "Asia-Pacific", ["Private credit", "Infrastructure"], 0.68, "active"),
    ("cobalt", "North America", ["Venture capital", "Real assets"], 0.62, "active"),
    ("driftwood", "North America", ["Venture capital", "Secondaries"], 0.66, "active"),
    ("ironwood", "North America", ["Venture capital", "Private equity"], 0.70, "active"),
    ("pacific", "Asia-Pacific", ["Infrastructure", "Real assets", "Private equity"], 0.93, "high"),
    ("marlowe", "Europe", ["Private equity", "Secondaries"], 0.48, "ambient"),
    ("orion", "Europe", ["Private equity", "Infrastructure", "Private credit"], 0.72, "active"),
    ("vantage", "North America", ["Private credit", "Real assets"], 0.64, "active"),
    ("shorline", "North America", ["Venture capital", "Private equity"], 0.55, "active"),
    ("tessera", "Europe", ["Private equity", "Secondaries", "Private credit"], 0.67, "active"),
    ("aurora", "North America", ["Venture capital", "Private equity", "Secondaries"], 0.74, "active"),
    ("kestrel2", "Asia-Pacific", ["Private equity", "Secondaries"], 0.69, "active"),
    ("lincoln", "North America", ["Real assets", "Private equity"], 0.53, "ambient"),
    ("peninsula", "Asia-Pacific", ["Private equity", "Venture capital"], 0.51, "ambient"),
    ("ashford", "Europe", ["Private equity", "Private credit", "Infrastructure"], 0.66, "active"),
    ("niagara", "Middle East", ["Infrastructure", "Real assets", "Private equity"], 0.87, "high"),
    ("dufferin", "North America", ["Private credit", "Real assets"], 0.63, "active"),
    ("eclipse", "North America", ["Private equity", "Secondaries"], 0.65, "active"),
    ("haven", "North America", ["Venture capital", "Private equity"], 0.61, "active"),
]

GEO_CENTERS = {
    "North America": (0.30, 0.34),
    "Europe": (0.52, 0.30),
    "Middle East": (0.58, 0.60),
    "Asia-Pacific": (0.80, 0.52),
}

def hash_str(s):
    h = 2166136261
    for c in s:
        h ^= ord(c)
        h = (h * 16777619) & 0xFFFFFFFF
    return h / 4294967295

def priority_scale(p):
    return {"high": 1.15, "active": 0.9, "ambient": 0.65}[p]

positions = {}
for inv in INVESTORS:
    iid, geo, strats, score, priority = inv
    c = GEO_CENTERS[geo]
    h1 = hash_str(iid + "g1")
    h2 = hash_str(iid + "g2")
    positions[iid] = (c[0] + (h1 - 0.5) * 0.16, c[1] + (h2 - 0.5) * 0.16, priority_scale(priority))

def strength_to(a, b):
    s = 0
    if a[1] == b[1]:
        s += 0.18
    shared = len(set(a[2]) & set(b[2]))
    s += shared * 0.12
    s += (a[3] + b[3]) * 0.18
    if a[4] == "ambient" and b[4] == "ambient":
        s *= 0.6
    return min(1, s)

rels = []
for i, a in enumerate(INVESTORS):
    for b in INVESTORS[i+1:]:
        s = strength_to(a, b)
        if s > 0.32:
            rels.append((a[0], b[0], s))

# ---------- Fonts ----------
def load_font(size, bold=False, mono=False):
    paths = []
    if mono:
        paths = ["/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"]
    else:
        paths = ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()

F_HERO = load_font(58, bold=True)
F_H2 = load_font(28, bold=True)
F_BODY = load_font(20)
F_SMALL = load_font(16)
F_TINY = load_font(13)
F_LABEL = load_font(14, bold=True)
F_MONO = load_font(13, mono=True)
F_MONO_SM = load_font(11, mono=True)
F_HEADLINE = load_font(44, bold=True)

# ---------- Render ----------
img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img, "RGBA")

# Subtle radial background
for r in range(900, 0, -10):
    a = max(0, int(6 * (1 - r / 900)))
    draw.ellipse([W//2 - r, H//2 - r, W//2 + r, H//2 + r], fill=(77, 163, 255, a))

# Network canvas area: right 60%
NX, NY = 480, 0
NW, NH = W - NX, H

def sx(nx): return NX + nx * NW
def sy(ny): return NY + ny * NH

# Cluster labels
label_data = [
    ("North America", 0.30, 0.16),
    ("Europe", 0.52, 0.12),
    ("Middle East", 0.58, 0.84),
    ("Asia-Pacific", 0.80, 0.80),
]
for label, lx, ly in label_data:
    tw = draw.textlength(label.upper(), font=F_LABEL)
    draw.text((sx(lx) - tw/2, sy(ly)), label.upper(), font=F_LABEL, fill=(200, 210, 232, 180))
    count = sum(1 for i in INVESTORS if i[1] == label)
    sub = f"{count} institutions"
    tw2 = draw.textlength(sub, font=F_MONO_SM)
    draw.text((sx(lx) - tw2/2, sy(ly) + 18), sub, font=F_MONO_SM, fill=(150, 162, 188, 140))

# Draw relationship lines
base_r = 5.5
sel = "meridian"
for a, b, s in rels:
    pa = positions[a]
    pb = positions[b]
    involves_sel = a == sel or b == sel
    if involves_sel:
        stroke = LINE_SELECTED
        lw = 2
    elif s > 0.7:
        stroke = LINE_HIGH
        lw = 1
    elif s > 0.5:
        stroke = LINE_MED
        lw = 1
    else:
        stroke = LINE_LOW
        lw = 1
    draw.line([(sx(pa[0]), sy(pa[1])), (sx(pb[0]), sy(pb[1]))], fill=stroke, width=lw)

# Draw nodes
for inv in INVESTORS:
    iid = inv[0]
    p = positions[iid]
    x, y = sx(p[0]), sy(p[1])
    r = base_r * p[2]
    is_sel = iid == sel
    if is_sel:
        for gr in range(int(r * 5), 0, -2):
            a = int(50 * (1 - gr / (r * 5)))
            draw.ellipse([x - gr, y - gr, x + gr, y + gr], fill=(232, 184, 100, a))
    if is_sel:
        fill = NODE_SELECTED
    elif inv[4] == "high":
        fill = NODE_HIGH
    elif inv[4] == "active":
        fill = NODE_ACTIVE
    else:
        fill = NODE_AMBIENT
    draw.ellipse([x - r, y - r, x + r, y + r], fill=fill)
    if is_sel or inv[4] == "high":
        hr = r * 0.4
        draw.ellipse([x - r*0.25 - hr, y - r*0.25 - hr, x - r*0.25 + hr, y - r*0.25 + hr], fill=(255, 255, 255, 80))

# ---------- Left-side copy panel ----------
draw.line([(460, 60), (460, H - 60)], fill=(255, 255, 255, 18), width=1)

# Amber dot + eyebrow
draw.ellipse([60, 90, 70, 100], fill=TEXT_AMBER)
draw.text((82, 86), "LP GRID · PRIVATE-MARKET INTELLIGENCE", font=F_LABEL, fill=TEXT_AMBER)

# Wordmark
draw.text((60, 130), "LP", font=F_HERO, fill=TEXT_BRIGHT)
draw.text((140, 138), "Grid", font=F_H2, fill=TEXT_DIM)

# Headline (3 lines)
draw.text((60, 220), "See the private-", font=F_HEADLINE, fill=TEXT_BRIGHT)
draw.text((60, 272), "market relation-", font=F_HEADLINE, fill=TEXT_AMBER)
draw.text((60, 324), "ships others miss.", font=F_HEADLINE, fill=TEXT_BRIGHT)

# Subline
draw.text((60, 396), "Map institutional investors,", font=F_BODY, fill=TEXT_DIM)
draw.text((60, 424), "allocation behaviour and", font=F_BODY, fill=TEXT_DIM)
draw.text((60, 452), "relationship signals.", font=F_BODY, fill=TEXT_DIM)

# Bottom authorship
draw.line([(60, H - 110), (420, H - 110)], fill=(255, 255, 255, 18), width=1)
draw.text((60, H - 96), "INDEPENDENT CONCEPT", font=F_LABEL, fill=TEXT_AMBER)
draw.text((60, H - 72), "Designed & developed by", font=F_TINY, fill=TEXT_FAINT)
draw.text((60, H - 50), "Aditya Singh", font=F_H2, fill=TEXT_BRIGHT)
draw.text((60, H - 22), "github.com/witejackel-eng", font=F_MONO, fill=TEXT_DIM)

# Top-right meta
meta = "60 institutions · 600+ relationships"
mw = draw.textlength(meta, font=F_MONO_SM)
draw.text((W - 40 - mw, 40), meta, font=F_MONO_SM, fill=TEXT_FAINT)

# Bottom-right disclaimer
disc = "Illustrative data · concept purposes"
dw = draw.textlength(disc, font=F_MONO_SM)
draw.text((W - 40 - dw, H - 36), disc, font=F_MONO_SM, fill=TEXT_FAINT)

img.save(OUT, "PNG", optimize=True)
print(f"OG image saved: {OUT} ({os.path.getsize(OUT) / 1024:.1f} KB)")
