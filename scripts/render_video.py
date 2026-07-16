"""
LP Grid — Silent concept video renderer
========================================
Renders ~300 frames at 30fps (10 seconds) showing the full experience:
  0.0–1.5s  Ecosystem view + headline
  1.5–3.5s  Geography clustering
  3.5–5.5s  Strategy clustering
  5.5–7.0s  Relationship-strength filtering
  7.0–9.0s  Camera moves toward selected node (Meridian)
  9.0–10.5s Focused investor profile + closing line

Frames are written to /home/z/my-project/scripts/frames/
ffmpeg encodes them into /home/z/my-project/download/lp-grid-concept.mp4

All data is illustrative, for concept purposes only.
"""
import math
import os
import shutil
import subprocess
from PIL import Image, ImageDraw, ImageFont
import numpy as np

# ----------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------
W, H = 1920, 1080
FPS = 30
DURATION = 10.5  # seconds
N_FRAMES = int(FPS * DURATION)
FRAME_DIR = "/home/z/my-project/scripts/frames"
OUT_MP4 = "/home/z/my-project/download/lp-grid-concept.mp4"
OUT_WEBM = "/home/z/my-project/download/lp-grid-concept.webm"

# Colors (RGB)
BG = (10, 14, 20)
NODE_AMBIENT = (150, 162, 188, 115)
NODE_ACTIVE = (195, 207, 232, 217)
NODE_HIGH = (232, 240, 255, 242)
NODE_SELECTED = (232, 184, 100, 255)
NODE_SELECTED_GLOW = (232, 184, 100, 90)
LINE_LOW = (120, 140, 180, 16)
LINE_MED = (140, 165, 210, 41)
LINE_HIGH = (180, 200, 235, 115)
LINE_SELECTED = (232, 184, 100, 217)
TEXT_BRIGHT = (240, 244, 252)
TEXT_DIM = (170, 180, 200)
TEXT_FAINT = (110, 120, 140)
TEXT_AMBER = (232, 184, 100)
ACCENT_BLUE = (77, 163, 255)
PANEL_BG = (14, 19, 28, 240)

# ----------------------------------------------------------------------
# Data — mirror of src/lib/lp-grid/data.ts (kept inline to avoid node-ts interop)
# ----------------------------------------------------------------------
INVESTORS = [
    ("meridian", "Meridian Sovereign Fund", "Sovereign wealth fund", "Abu Dhabi, UAE", "Middle East", 84, (100, 300), ["Infrastructure", "Private equity", "Private credit", "Real assets", "Venture capital"], 0.94, "Increasing", "high"),
    ("northbridge", "Northbridge Pension Trust", "Pension fund", "Toronto, Canada", "North America", 142, (75, 250), ["Private equity", "Infrastructure", "Private credit"], 0.88, "Stable", "high"),
    ("helix", "Helix Insurance Group", "Insurance group", "Zurich, Switzerland", "Europe", 68, (50, 200), ["Private credit", "Real assets", "Infrastructure"], 0.81, "Increasing", "high"),
    ("alder", "Alder University Endowment", "Endowment", "Boston, USA", "North America", 12, (10, 75), ["Venture capital", "Private equity", "Secondaries"], 0.76, "Increasing", "active"),
    ("westmark", "Westmark Family Capital", "Family office", "London, UK", "Europe", 4.2, (5, 50), ["Private equity", "Venture capital", "Secondaries"], 0.62, "Stable", "active"),
    ("arcadia", "Arcadia Investment Authority", "Sovereign wealth fund", "Singapore", "Asia-Pacific", 110, (100, 400), ["Infrastructure", "Real assets", "Private equity"], 0.90, "Increasing", "high"),
    ("calder", "Calder Foundation", "Foundation", "Oslo, Norway", "Europe", 3.6, (5, 40), ["Private equity", "Real assets"], 0.55, "Stable", "active"),
    ("kestrel", "Kestrel Pension Fund", "Pension fund", "Amsterdam, Netherlands", "Europe", 95, (75, 250), ["Private equity", "Private credit", "Infrastructure"], 0.83, "Stable", "high"),
    ("orien", "Orien Asset Managers", "Asset manager", "New York, USA", "North America", 38, (25, 150), ["Private equity", "Secondaries", "Private credit"], 0.71, "Increasing", "active"),
    ("pier", "Pier Insurance Holdings", "Insurance group", "Munich, Germany", "Europe", 52, (50, 200), ["Private credit", "Real assets"], 0.74, "Stable", "active"),
    ("sable", "Sable Capital Advisors", "Institutional consultant", "Chicago, USA", "North America", 1.8, (5, 25), ["Private equity", "Venture capital", "Secondaries"], 0.58, "Increasing", "active"),
    ("tamar", "Tamar Endowment", "Endowment", "Stanford, USA", "North America", 18, (10, 100), ["Venture capital", "Private equity"], 0.79, "Increasing", "active"),
    ("vermont", "Vermont Family Office", "Family office", "Geneva, Switzerland", "Europe", 2.4, (5, 30), ["Private equity", "Secondaries"], 0.49, "Stable", "ambient"),
    ("rhine", "Rhine Pension Scheme", "Pension fund", "Frankfurt, Germany", "Europe", 76, (50, 200), ["Private equity", "Infrastructure", "Private credit"], 0.80, "Stable", "high"),
    ("asi", "ASI Sovereign Holding", "Sovereign wealth fund", "Riyadh, Saudi Arabia", "Middle East", 220, (150, 500), ["Infrastructure", "Real assets", "Private equity"], 0.92, "Increasing", "high"),
    ("kairos", "Kairos Fund-of-Funds", "Fund-of-funds", "Hong Kong", "Asia-Pacific", 14, (10, 75), ["Private equity", "Secondaries", "Venture capital"], 0.66, "Stable", "active"),
    ("marin", "Marin Insurance", "Insurance group", "Copenhagen, Denmark", "Europe", 31, (25, 100), ["Private credit", "Infrastructure"], 0.69, "Stable", "active"),
    ("atlas", "Atlas Pension Reserve", "Pension fund", "Sydney, Australia", "Asia-Pacific", 88, (50, 200), ["Infrastructure", "Private equity", "Real assets"], 0.85, "Increasing", "high"),
    ("halcyon", "Halcyon Endowment", "Endowment", "Oxford, UK", "Europe", 9.5, (5, 50), ["Venture capital", "Private equity"], 0.72, "Stable", "active"),
    ("cypress", "Cypress Family Trust", "Family office", "Singapore", "Asia-Pacific", 3.1, (5, 40), ["Venture capital", "Private equity", "Secondaries"], 0.61, "Increasing", "active"),
    ("ridge", "Ridge Capital Partners", "Asset manager", "London, UK", "Europe", 22, (25, 150), ["Private equity", "Secondaries"], 0.68, "Stable", "active"),
    ("soleil", "Soleil Foundation", "Foundation", "Paris, France", "Europe", 2.8, (5, 30), ["Real assets", "Private equity"], 0.52, "Stable", "ambient"),
    ("qmc", "QMC Investment Office", "Institutional consultant", "Toronto, Canada", "North America", 1.2, (5, 25), ["Private equity", "Infrastructure"], 0.54, "Stable", "ambient"),
    ("boreas", "Boreas Pension Fund", "Pension fund", "Stockholm, Sweden", "Europe", 64, (50, 200), ["Private equity", "Infrastructure", "Private credit"], 0.77, "Stable", "active"),
    ("mira", "Mira Sovereign Wealth", "Sovereign wealth fund", "Doha, Qatar", "Middle East", 165, (100, 400), ["Infrastructure", "Real assets", "Private equity"], 0.89, "Increasing", "high"),
    ("lumen", "Lumen Insurance Group", "Insurance group", "Tokyo, Japan", "Asia-Pacific", 44, (25, 100), ["Private credit", "Real assets"], 0.67, "Stable", "active"),
    ("fenway", "Fenway Endowment", "Endowment", "New Haven, USA", "North America", 21, (10, 100), ["Venture capital", "Private equity", "Secondaries"], 0.80, "Increasing", "high"),
    ("stirling", "Stirling Capital", "Family office", "Edinburgh, UK", "Europe", 1.9, (5, 30), ["Private equity", "Real assets"], 0.50, "Stable", "ambient"),
    ("norwood", "Norwood Advisors", "Asset manager", "Boston, USA", "North America", 17, (25, 100), ["Private equity", "Secondaries"], 0.63, "Stable", "active"),
    ("meridian2", "Meridian Pension Pool", "Pension fund", "Tokyo, Japan", "Asia-Pacific", 105, (75, 250), ["Infrastructure", "Private equity", "Private credit"], 0.82, "Increasing", "high"),
    ("harbor", "Harbor Foundation", "Foundation", "Vancouver, Canada", "North America", 4.4, (5, 40), ["Real assets", "Private equity"], 0.57, "Stable", "active"),
    ("summit", "Summit Insurance", "Insurance group", "Hartford, USA", "North America", 28, (25, 100), ["Private credit", "Real assets"], 0.65, "Stable", "active"),
    ("ellsworth", "Ellsworth Family Office", "Family office", "New York, USA", "North America", 2.2, (5, 30), ["Venture capital", "Private equity", "Secondaries"], 0.60, "Increasing", "active"),
    ("axiom", "Axiom Fund-of-Funds", "Fund-of-funds", "Zurich, Switzerland", "Europe", 11, (10, 75), ["Private equity", "Secondaries"], 0.70, "Stable", "active"),
    ("terra", "Terra Sovereign Reserve", "Sovereign wealth fund", "Kuwait City, Kuwait", "Middle East", 195, (100, 400), ["Infrastructure", "Real assets", "Private equity"], 0.91, "Stable", "high"),
    ("quill", "Quill Endowment", "Endowment", "Cambridge, UK", "Europe", 8.1, (5, 50), ["Venture capital", "Private equity"], 0.73, "Stable", "active"),
    ("pinnacle", "Pinnacle Asset Co.", "Asset manager", "Tokyo, Japan", "Asia-Pacific", 19, (25, 100), ["Private equity", "Secondaries", "Private credit"], 0.64, "Stable", "active"),
    ("lattice", "Lattice Consultants", "Institutional consultant", "London, UK", "Europe", 1.5, (5, 25), ["Private equity", "Infrastructure"], 0.56, "Stable", "ambient"),
    ("northgate", "Northgate Pension", "Pension fund", "Manchester, UK", "Europe", 47, (25, 100), ["Private equity", "Private credit", "Infrastructure"], 0.71, "Stable", "active"),
    ("saffron", "Saffron Wealth", "Family office", "Dubai, UAE", "Middle East", 2.7, (5, 40), ["Private equity", "Venture capital"], 0.59, "Increasing", "active"),
    ("amber", "Amber Insurance", "Insurance group", "Seoul, South Korea", "Asia-Pacific", 36, (25, 100), ["Private credit", "Infrastructure"], 0.68, "Stable", "active"),
    ("cobalt", "Cobalt Foundation", "Foundation", "Seattle, USA", "North America", 5.2, (5, 50), ["Venture capital", "Real assets"], 0.62, "Increasing", "active"),
    ("driftwood", "Driftwood Capital", "Asset manager", "San Francisco, USA", "North America", 14, (10, 75), ["Venture capital", "Secondaries"], 0.66, "Increasing", "active"),
    ("ironwood", "Ironwood Endowment", "Endowment", "Ithaca, USA", "North America", 7.8, (5, 50), ["Venture capital", "Private equity"], 0.70, "Stable", "active"),
    ("pacific", "Pacific Reserve Fund", "Sovereign wealth fund", "Beijing, China", "Asia-Pacific", 240, (150, 500), ["Infrastructure", "Real assets", "Private equity"], 0.93, "Increasing", "high"),
    ("marlowe", "Marlowe Family Office", "Family office", "Monaco", "Europe", 1.6, (5, 25), ["Private equity", "Secondaries"], 0.48, "Stable", "ambient"),
    ("orion", "Orion Pension Trust", "Pension fund", "Helsinki, Finland", "Europe", 41, (25, 100), ["Private equity", "Infrastructure", "Private credit"], 0.72, "Stable", "active"),
    ("vantage", "Vantage Insurance Group", "Insurance group", "Bermuda", "North America", 23, (25, 100), ["Private credit", "Real assets"], 0.64, "Stable", "active"),
    ("shorline", "Shorline Advisors", "Institutional consultant", "San Francisco, USA", "North America", 1.4, (5, 25), ["Venture capital", "Private equity"], 0.55, "Increasing", "active"),
    ("tessera", "Tessera Fund-of-Funds", "Fund-of-funds", "Luxembourg", "Europe", 9.2, (10, 75), ["Private equity", "Secondaries", "Private credit"], 0.67, "Stable", "active"),
    ("aurora", "Aurora Endowment", "Endowment", "Princeton, USA", "North America", 16, (10, 75), ["Venture capital", "Private equity", "Secondaries"], 0.74, "Stable", "active"),
    ("kestrel2", "Kestrel Asia Capital", "Asset manager", "Singapore", "Asia-Pacific", 12, (10, 75), ["Private equity", "Secondaries"], 0.69, "Increasing", "active"),
    ("lincoln", "Lincoln Foundation", "Foundation", "Washington DC, USA", "North America", 3.4, (5, 30), ["Real assets", "Private equity"], 0.53, "Stable", "ambient"),
    ("peninsula", "Peninsula Family Trust", "Family office", "Hong Kong", "Asia-Pacific", 2.1, (5, 30), ["Private equity", "Venture capital"], 0.51, "Stable", "ambient"),
    ("ashford", "Ashford Pension Fund", "Pension fund", "Birmingham, UK", "Europe", 33, (25, 100), ["Private equity", "Private credit", "Infrastructure"], 0.66, "Stable", "active"),
    ("niagara", "Niagara Sovereign Reserve", "Sovereign wealth fund", "Abu Dhabi, UAE", "Middle East", 130, (100, 350), ["Infrastructure", "Real assets", "Private equity"], 0.87, "Stable", "high"),
    ("dufferin", "Dufferin Insurance", "Insurance group", "Toronto, Canada", "North America", 26, (25, 100), ["Private credit", "Real assets"], 0.63, "Stable", "active"),
    ("eclipse", "Eclipse Asset Management", "Asset manager", "Chicago, USA", "North America", 15, (10, 75), ["Private equity", "Secondaries"], 0.65, "Stable", "active"),
    ("haven", "Haven Endowment", "Endowment", "Baltimore, USA", "North America", 6.4, (5, 50), ["Venture capital", "Private equity"], 0.61, "Stable", "active"),
]

GEO_CENTERS = {
    "North America": (0.28, 0.32),
    "Europe": (0.52, 0.30),
    "Middle East": (0.58, 0.58),
    "Asia-Pacific": (0.80, 0.50),
}
STRAT_CENTERS = {
    "Private equity": (0.50, 0.22),
    "Private credit": (0.78, 0.32),
    "Infrastructure": (0.85, 0.55),
    "Real assets": (0.72, 0.78),
    "Venture capital": (0.28, 0.32),
    "Secondaries": (0.20, 0.65),
}

STRATEGY_COLORS = {
    "Private equity": (120, 165, 220, 178),
    "Private credit": (180, 200, 235, 178),
    "Infrastructure": (232, 184, 100, 178),
    "Real assets": (170, 180, 200, 178),
    "Venture capital": (160, 200, 220, 178),
    "Secondaries": (140, 170, 210, 178),
}

# ----------------------------------------------------------------------
# Build relationships
# ----------------------------------------------------------------------
def build_relationships():
    rels = []
    for i, a in enumerate(INVESTORS):
        for j, b in enumerate(INVESTORS):
            if j <= i:
                continue
            s = 0
            if a[4] == b[4]:
                s += 0.18
            shared = len(set(a[6]) & set(b[6]))
            s += shared * 0.12
            s += (a[8] + b[8]) * 0.18
            if a[10] == "ambient" and b[10] == "ambient":
                s *= 0.6
            s = min(1, s)
            if s > 0.32:
                rels.append((a[0], b[0], s))
    return rels

RELS = build_relationships()
REL_INDEX = {}
for a, b, s in RELS:
    REL_INDEX.setdefault(a, {})[b] = s
    REL_INDEX.setdefault(b, {})[a] = s

def strength_to(a, b):
    if a == b:
        return 1.0
    return REL_INDEX.get(a, {}).get(b, 0.0)

# ----------------------------------------------------------------------
# Layouts (mirror of layouts.ts)
# ----------------------------------------------------------------------
def hash_str(s):
    h = 2166136261
    for c in s:
        h ^= ord(c)
        h = (h * 16777619) & 0xFFFFFFFF
    return h / 4294967295

def priority_scale(p):
    return {"high": 1.15, "active": 0.9, "ambient": 0.65}[p]

def allocation_scale(aum):
    if aum >= 100: return 1.3
    if aum >= 30: return 1.0
    if aum >= 10: return 0.8
    return 0.6

# Ecosystem positions (sunflower)
ECO_POS = {}
n = len(INVESTORS)
golden = math.pi * (3 - math.sqrt(5))
for i, inv in enumerate(INVESTORS):
    r = math.sqrt((i + 0.5) / n) * 0.42
    theta = i * golden
    ECO_POS[inv[0]] = (0.5 + r * math.cos(theta), 0.5 + r * math.sin(theta) * 0.85)

def compute_targets(dim, sel="meridian", profile=False):
    out = {}
    for inv in INVESTORS:
        iid, name, typ, hq, geo, aum, commit, strats, score, activity, priority = inv
        if profile:
            if iid == sel:
                out[iid] = (0.32, 0.5, 2.4)
            else:
                h1 = (math.sin(ord(iid[0]) + 1) * 0.5)
                h2 = (math.cos(ord(iid[1]) if len(iid) > 1 else 0) * 0.5)
                out[iid] = (0.92 + h1 * 0.08, 0.5 + h2 * 0.4, 0.4)
            continue
        if dim == "ecosystem":
            p = ECO_POS[iid]
            out[iid] = (p[0], p[1], priority_scale(priority))
        elif dim == "geography":
            c = GEO_CENTERS[geo]
            h1 = hash_str(iid + "g1")
            h2 = hash_str(iid + "g2")
            out[iid] = (c[0] + (h1 - 0.5) * 0.18, c[1] + (h2 - 0.5) * 0.18, priority_scale(priority))
        elif dim == "strategy":
            c = STRAT_CENTERS[strats[0]]
            h1 = hash_str(iid + "s1")
            h2 = hash_str(iid + "s2")
            out[iid] = (c[0] + (h1 - 0.5) * 0.16, c[1] + (h2 - 0.5) * 0.16, priority_scale(priority))
        elif dim == "allocation":
            t = min(1, max(0, (math.log(aum) - math.log(1)) / (math.log(250) - math.log(1))))
            h2 = hash_str(iid + "a2")
            out[iid] = (0.08 + t * 0.84, 0.5 + (h2 - 0.5) * 0.7, allocation_scale(aum))
        else:  # relationships
            if iid == sel:
                out[iid] = (0.5, 0.5, 1.6)
            else:
                s = strength_to(iid, sel)
                angle = hash_str(iid + "r1") * math.pi * 2
                radius = max(0.12, 0.45 - s * 0.42)
                out[iid] = (0.5 + math.cos(angle) * radius, 0.5 + math.sin(angle) * radius * 0.85, 0.6 + s * 0.6)
    return out

# ----------------------------------------------------------------------
# State: persistent node positions
# ----------------------------------------------------------------------
positions = {}
init_t = compute_targets("ecosystem")
for inv in INVESTORS:
    t = init_t[inv[0]]
    positions[inv[0]] = [t[0], t[1], 0, 0, t[2]]  # x, y, vx, vy, scale

# ----------------------------------------------------------------------
# Sequence definition
# ----------------------------------------------------------------------
def get_dim_and_profile(t):
    """Return (dimension, profile_mode, headline_text, caption_text) at time t seconds."""
    if t < 1.5:
        return "ecosystem", False, "See the private-market relationships others miss.", None
    elif t < 3.5:
        return "geography", False, "See the private-market relationships others miss.", "Geography"
    elif t < 5.5:
        return "strategy", False, "See the private-market relationships others miss.", "Strategy"
    elif t < 7.0:
        return "relationships", False, "See the private-market relationships others miss.", "Relationship strength"
    elif t < 9.0:
        return "relationships", False, "See the private-market relationships others miss.", "Selected: Meridian Sovereign Fund"
    else:
        return "relationships", True, None, "From the market ecosystem to the relationships that matter."

# ----------------------------------------------------------------------
# Font setup
# ----------------------------------------------------------------------
def load_font(size, bold=False, mono=False):
    candidates = []
    if mono:
        candidates = ["/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"]
    else:
        if bold:
            candidates = ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"]
        else:
            candidates = ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"]
    for c in candidates:
        try:
            return ImageFont.truetype(c, size)
        except Exception:
            continue
    return ImageFont.load_default()

FONTS = {
    "hero": load_font(56, bold=True),
    "h2": load_font(28, bold=True),
    "body": load_font(20),
    "small": load_font(16),
    "tiny": load_font(12),
    "mono": load_font(14, mono=True),
    "mono_sm": load_font(11, mono=True),
    "label": load_font(13, bold=True),
}

# ----------------------------------------------------------------------
# Drawing helpers
# ----------------------------------------------------------------------
def lerp(a, b, t):
    return a + (b - a) * t

def ease_in_out(t):
    return 0.5 - 0.5 * math.cos(math.pi * t)

def draw_network(img, t, dim, profile, sel="meridian"):
    draw = ImageDraw.Draw(img, "RGBA")
    # Update positions: spring toward target
    targets = compute_targets(dim, sel, profile)
    spring_k = 0.06
    damping = 0.82
    for inv in INVESTORS:
        iid = inv[0]
        p = positions[iid]
        tx, ty, ts = targets[iid]
        # ambient drift in non-profile modes
        if not profile:
            p[2] += math.sin(t * 0.2 + ord(iid[0])) * 0.00015
            p[3] += math.cos(t * 0.25 + ord(iid[1]) * 0.3) * 0.00015
        ax = (tx - p[0]) * spring_k
        ay = (ty - p[1]) * spring_k
        p[2] = (p[2] + ax) * damping
        p[3] = (p[3] + ay) * damping
        p[0] += p[2]
        p[1] += p[3]
        p[4] += (ts - p[4]) * 0.18

    base_r = 11

    def sx(nx): return nx * W
    def sy(ny): return ny * H

    # Draw relationship lines
    for a, b, s in RELS:
        pa = positions[a]
        pb = positions[b]
        involves_sel = (a == sel or b == sel)
        if profile:
            if not involves_sel:
                continue
            stroke = LINE_SELECTED
            width = 2
        elif dim == "relationships":
            if involves_sel:
                stroke = LINE_SELECTED
                width = 2
            elif s > 0.7:
                stroke = LINE_HIGH
                width = 1
            else:
                stroke = LINE_LOW
                width = 1
        else:
            if s > 0.7:
                stroke = LINE_MED
                width = 1
            elif s > 0.5:
                stroke = LINE_LOW
                width = 1
            else:
                stroke = LINE_LOW
                width = 1
        draw.line([(sx(pa[0]), sy(pa[1])), (sx(pb[0]), sy(pb[1]))], fill=stroke, width=width)

    # Draw nodes
    for inv in INVESTORS:
        iid = inv[0]
        p = positions[iid]
        x, y = sx(p[0]), sy(p[1])
        r = base_r * p[4]
        is_sel = iid == sel
        # glow for selected in profile/relationships
        if is_sel and (profile or dim == "relationships"):
            glow_r = int(r * 5)
            for gr in range(glow_r, 0, -2):
                alpha = int(80 * (1 - gr / glow_r))
                draw.ellipse([x - gr, y - gr, x + gr, y + gr], fill=(232, 184, 100, alpha))
        # color
        if is_sel:
            fill = NODE_SELECTED
        elif dim == "strategy":
            fill = STRATEGY_COLORS.get(inv[6][0], NODE_ACTIVE)
        elif profile:
            fill = (120, 140, 180, 60)
        elif inv[10] == "high":
            fill = NODE_HIGH
        elif inv[10] == "active":
            fill = NODE_ACTIVE
        else:
            fill = NODE_AMBIENT
        draw.ellipse([x - r, y - r, x + r, y + r], fill=fill)
        if is_sel or inv[10] == "high":
            # inner highlight
            hr = r * 0.4
            hx, hy = x - r * 0.25, y - r * 0.25
            draw.ellipse([hx - hr, hy - hr, hx + hr, hy + hr], fill=(255, 255, 255, 80))


def draw_overlay(img, t, dim, profile, headline, caption):
    draw = ImageDraw.Draw(img, "RGBA")
    # Top header bar
    # Logo
    draw.rectangle([40, 36, 64, 60], outline=(232, 184, 100, 80), width=1)
    draw.rectangle([46, 42, 58, 54], fill=(232, 184, 100, 200))
    draw.text((76, 38), "LP", font=FONTS["h2"], fill=TEXT_BRIGHT)
    draw.text((112, 46), "Grid", font=FONTS["body"], fill=TEXT_DIM)
    # nav (right)
    nav_items = ["Platform", "Intelligence", "Network", "About"]
    nx = W - 40
    for item in reversed(nav_items):
        tw = draw.textlength(item, font=FONTS["small"])
        nx -= tw
        draw.text((nx, 44), item, font=FONTS["small"], fill=TEXT_DIM)
        nx -= 36
    # Request access button
    btn_w = 130
    btn_x = W - 40 - btn_w
    draw.rounded_rectangle([btn_x, 36, btn_x + btn_w, 68], radius=14, outline=(232, 184, 100, 90), width=1, fill=(232, 184, 100, 20))
    bw = draw.textlength("Request access", font=FONTS["small"])
    draw.text((btn_x + (btn_w - bw) / 2, 44), "Request access", font=FONTS["small"], fill=TEXT_AMBER)

    # Bottom-left status pill
    pill_text = f"Institutional network · {len(RELS)} active relationships"
    pw = draw.textlength(pill_text, font=FONTS["mono_sm"]) + 24
    draw.rounded_rectangle([40, H - 60, 40 + pw, H - 30], radius=14, fill=(255, 255, 255, 8), outline=(255, 255, 255, 15), width=1)
    draw.text((52, H - 52), pill_text, font=FONTS["mono_sm"], fill=TEXT_DIM)

    # Bottom-center dimension selector
    dims = [("01", "Ecosystem"), ("02", "Geography"), ("03", "Strategy"), ("04", "Allocation"), ("05", "Relationships")]
    dim_keys = ["ecosystem", "geography", "strategy", "allocation", "relationships"]
    cur_idx = dim_keys.index(dim) if dim in dim_keys else 0
    # measure
    widths = []
    for _, label in dims:
        widths.append(draw.textlength(label, font=FONTS["small"]) + 50)
    total_w = sum(widths) + 8
    sx = (W - total_w) / 2
    by = H - 60
    bh = 32
    for i, (idx, label) in enumerate(dims):
        w = widths[i]
        active = i == cur_idx
        fill = (232, 184, 100, 28) if active else (255, 255, 255, 4)
        outline = (232, 184, 100, 60) if active else (255, 255, 255, 12)
        draw.rounded_rectangle([sx, by, sx + w, by + bh], radius=14, fill=fill, outline=outline, width=1)
        draw.text((sx + 14, by + 8), idx, font=FONTS["mono_sm"], fill=(232, 184, 100, 200) if active else (110, 120, 140, 200))
        draw.text((sx + 36, by + 8), label, font=FONTS["small"], fill=TEXT_AMBER if active else TEXT_DIM)
        sx += w + 2

    # Bottom-right metadata
    meta_map = {
        "ecosystem": "all dimensions",
        "geography": "clustered by region",
        "strategy": "clustered by strategy",
        "allocation": "scaled by commitment",
        "relationships": "focal: relationship strength",
    }
    meta = f"60 institutions  /  {meta_map.get(dim, '')}"
    mw = draw.textlength(meta, font=FONTS["mono_sm"])
    draw.text((W - 40 - mw, H - 52), meta, font=FONTS["mono_sm"], fill=TEXT_FAINT)

    # Headline (left side)
    if headline and not profile:
        # Ecosystem label
        draw.ellipse([60, 200, 70, 210], fill=TEXT_AMBER)
        draw.text((80, 196), "LP GRID · PRIVATE-MARKET INTELLIGENCE", font=FONTS["label"], fill=TEXT_AMBER)
        # Multi-line headline
        words = headline.split()
        lines = []
        cur = []
        for w in words:
            test = " ".join(cur + [w])
            if draw.textlength(test, font=FONTS["hero"]) > 720:
                if cur:
                    lines.append(" ".join(cur))
                cur = [w]
            else:
                cur.append(w)
        if cur:
            lines.append(" ".join(cur))
        # Special: highlight "relationships" in amber
        ly = 240
        for line in lines:
            # check if line contains "relationships"
            if "relationships" in line.lower():
                # split into segments
                parts = line.split("relationships")
                cx = 60
                for i, part in enumerate(parts):
                    if part.strip():
                        draw.text((cx, ly), part.strip() if i == 0 else " " + part.strip(), font=FONTS["hero"], fill=TEXT_BRIGHT)
                        cx += draw.textlength(part.strip() if i == 0 else " " + part.strip(), font=FONTS["hero"])
                    if i < len(parts) - 1:
                        word = "relationships"
                        draw.text((cx, ly), word, font=FONTS["hero"], fill=TEXT_AMBER)
                        cx += draw.textlength(word, font=FONTS["hero"])
            else:
                draw.text((60, ly), line, font=FONTS["hero"], fill=TEXT_BRIGHT)
            ly += 64

        # supporting copy + CTA
        if t > 0.4:
            draw.text((60, ly + 24), "Map institutional investors, understand allocation behaviour", font=FONTS["body"], fill=TEXT_DIM)
            draw.text((60, ly + 52), "and identify the relationships shaping private markets.", font=FONTS["body"], fill=TEXT_DIM)
            # CTA buttons
            cta1 = "Explore the network →"
            cta1_w = draw.textlength(cta1, font=FONTS["small"]) + 32
            draw.rounded_rectangle([60, ly + 96, 60 + cta1_w, ly + 132], radius=18, fill=TEXT_AMBER)
            draw.text((76, ly + 105), cta1, font=FONTS["small"], fill=(26, 20, 8))
            cta2 = "Request access"
            cta2_w = draw.textlength(cta2, font=FONTS["small"]) + 32
            draw.rounded_rectangle([80 + cta1_w, ly + 96, 80 + cta1_w + cta2_w, ly + 132], radius=18, outline=(255, 255, 255, 30), width=1, fill=(255, 255, 255, 4))
            draw.text((96 + cta1_w, ly + 105), cta2, font=FONTS["small"], fill=TEXT_BRIGHT)

    # Caption (top right during transitions)
    if caption and not profile:
        cw = draw.textlength(caption, font=FONTS["label"]) + 24
        draw.rounded_rectangle([W - 40 - cw, 96, W - 40, 124], radius=14, fill=(232, 184, 100, 14), outline=(232, 184, 100, 50), width=1)
        draw.text((W - 28 - cw, 102), caption.upper(), font=FONTS["label"], fill=TEXT_AMBER)

    # Cluster labels (during geography/strategy)
    if dim == "geography" and 1.7 < t < 3.5:
        # fade in/out
        a = 1.0
        if t < 2.0:
            a = (t - 1.7) / 0.3
        elif t > 3.2:
            a = (3.5 - t) / 0.3
        a = max(0, min(1, a))
        for geo, (cx, cy) in GEO_CENTERS.items():
            count = sum(1 for inv in INVESTORS if inv[4] == geo)
            text = geo.upper()
            tw = draw.textlength(text, font=FONTS["label"])
            draw.text((sx_(cx) - tw / 2, sy_(cy) - 90), text, font=FONTS["label"], fill=(200, 210, 232, int(180 * a)))
            sub = f"{count} institutions"
            tw2 = draw.textlength(sub, font=FONTS["mono_sm"])
            draw.text((sx_(cx) - tw2 / 2, sy_(cy) - 70), sub, font=FONTS["mono_sm"], fill=(150, 162, 188, int(140 * a)))

    if dim == "strategy" and 3.7 < t < 5.5:
        a = 1.0
        if t < 4.0:
            a = (t - 3.7) / 0.3
        elif t > 5.2:
            a = (5.5 - t) / 0.3
        a = max(0, min(1, a))
        for strat, (cx, cy) in STRAT_CENTERS.items():
            text = strat.upper()
            tw = draw.textlength(text, font=FONTS["label"])
            draw.text((sx_(cx) - tw / 2, sy_(cy) - 90), text, font=FONTS["label"], fill=(200, 210, 232, int(180 * a)))

    # Profile panel (right side)
    if profile:
        draw_profile_panel(draw, t)

def sx_(nx): return nx * W
def sy_(ny): return ny * H

def draw_profile_panel(draw, t):
    # fade in
    a = min(1, max(0, (t - 9.0) / 0.4))
    panel_x = W - 480
    panel_y = 100
    panel_w = 440
    panel_h = H - 200
    # subtle shadow
    draw.rounded_rectangle([panel_x, panel_y, panel_x + panel_w, panel_y + panel_h], radius=18, fill=(14, 19, 28, int(240 * a)), outline=(255, 255, 255, int(18 * a)), width=1)
    # top accent line
    draw.line([(panel_x, panel_y), (panel_x + 120, panel_y)], fill=(232, 184, 100, int(150 * a)), width=1)
    # content
    pad = 28
    cx = panel_x + pad
    cy = panel_y + pad
    # eyebrow
    draw.ellipse([cx, cy + 5, cx + 8, cy + 13], fill=(232, 184, 100, int(200 * a)))
    draw.text((cx + 14, cy), "FOCUSED INTELLIGENCE", font=FONTS["label"], fill=(232, 184, 100, int(200 * a)))
    # name
    cy += 30
    draw.text((cx, cy), "Meridian", font=FONTS["hero"], fill=(240, 244, 252, int(255 * a)))
    cy += 64
    draw.text((cx, cy), "Sovereign Fund", font=FONTS["hero"], fill=(240, 244, 252, int(255 * a)))
    cy += 64
    draw.text((cx, cy), "Sovereign wealth fund · Abu Dhabi, UAE", font=FONTS["small"], fill=(170, 180, 200, int(220 * a)))
    cy += 36
    # metrics grid
    metrics = [
        ("EST. AUM", "$84B"),
        ("COMMITMENT", "$100–300M"),
        ("REL. STRENGTH", "High"),
        ("STRATEGIES", "5 active"),
        ("ACTIVITY", "Increasing"),
        ("GEOGRAPHY", "Middle East"),
    ]
    col_w = (panel_w - pad * 2 - 4) / 2
    row_h = 56
    for i, (k, v) in enumerate(metrics):
        col = i % 2
        row = i // 2
        mx = cx + col * (col_w + 4)
        my = cy + row * (row_h + 4)
        draw.rectangle([mx, my, mx + col_w, my + row_h], fill=(10, 14, 20, int(180 * a)))
        draw.text((mx + 12, my + 10), k, font=FONTS["mono_sm"], fill=(110, 120, 140, int(220 * a)))
        col_v = (232, 184, 100, int(255 * a)) if k in ("REL. STRENGTH", "ACTIVITY") else (240, 244, 252, int(255 * a))
        draw.text((mx + 12, my + 28), v, font=FONTS["body"], fill=col_v)
    cy += 3 * (row_h + 4) + 16
    # strategy allocation
    draw.text((cx, cy), "STRATEGY ALLOCATION", font=FONTS["label"], fill=(110, 120, 140, int(220 * a)))
    cy += 22
    allocs = [("Private equity", 32), ("Infrastructure", 24), ("Private credit", 18), ("Real assets", 16), ("Venture capital", 10)]
    for strat, pct in allocs:
        draw.text((cx, cy), strat, font=FONTS["small"], fill=(200, 210, 232, int(220 * a)))
        # bar
        bar_x = cx + 180
        bar_w_full = panel_w - pad * 2 - 180 - 50
        bar_w = bar_w_full * pct / 32
        draw.rounded_rectangle([bar_x, cy + 6, bar_x + bar_w_full, cy + 14], radius=4, fill=(255, 255, 255, int(15 * a)))
        draw.rounded_rectangle([bar_x, cy + 6, bar_x + bar_w, cy + 14], radius=4, fill=(232, 184, 100, int(160 * a)))
        draw.text((panel_x + panel_w - pad - 40, cy), f"{pct}%", font=FONTS["mono_sm"], fill=(170, 180, 200, int(220 * a)))
        cy += 24
    cy += 12
    # signals
    draw.text((cx, cy), "RELATIONSHIP SIGNALS", font=FONTS["label"], fill=(110, 120, 140, int(220 * a)))
    cy += 22
    signals = [
        "Strong relationship with infrastructure managers",
        "Increased private-credit activity over last 12 months",
        "Expanding European allocation alongside ME mandate",
        "Seven shared relationships within selected network",
    ]
    for s in signals:
        draw.ellipse([cx, cy + 8, cx + 4, cy + 12], fill=(232, 184, 100, int(180 * a)))
        draw.text((cx + 12, cy), s, font=FONTS["small"], fill=(200, 210, 232, int(220 * a)))
        cy += 24
    cy += 12
    # summary box
    draw.rounded_rectangle([cx, cy, panel_x + panel_w - pad, cy + 96], radius=8, fill=(232, 184, 100, int(8 * a)), outline=(232, 184, 100, int(30 * a)), width=1)
    draw.text((cx + 12, cy + 10), "INTELLIGENCE SUMMARY", font=FONTS["label"], fill=(110, 120, 140, int(220 * a)))
    summary = "Meridian has increased its exposure to infrastructure and private credit, with the strongest relationship concentration among European and Middle Eastern managers."
    # wrap
    words = summary.split()
    line = ""
    ty = cy + 32
    max_w = panel_w - pad * 2 - 24
    for w in words:
        test = (line + " " + w).strip()
        if draw.textlength(test, font=FONTS["small"]) > max_w:
            draw.text((cx + 12, ty), line, font=FONTS["small"], fill=(200, 210, 232, int(220 * a)))
            ty += 22
            line = w
        else:
            line = test
    if line:
        draw.text((cx + 12, ty), line, font=FONTS["small"], fill=(200, 210, 232, int(220 * a)))

def draw_caption_footer(img, t, caption):
    if not caption:
        return
    draw = ImageDraw.Draw(img, "RGBA")
    # only at end
    if t > 9.3:
        a = min(1, (t - 9.3) / 0.4)
    else:
        a = 0
    if a > 0:
        # caption at bottom center
        text = caption
        tw = draw.textlength(text, font=FONTS["h2"])
        draw.text(((W - tw) / 2, H - 130), text, font=FONTS["h2"], fill=(240, 244, 252, int(255 * a)))

def draw_disclaimer(img):
    draw = ImageDraw.Draw(img, "RGBA")
    text = "ILLUSTRATIVE DATA · CONCEPT PURPOSES"
    tw = draw.textlength(text, font=FONTS["mono_sm"])
    draw.text((W - 40 - tw, 100), text, font=FONTS["mono_sm"], fill=(110, 120, 140, 180))


# ----------------------------------------------------------------------
# Main render loop
# ----------------------------------------------------------------------
def main():
    if os.path.exists(FRAME_DIR):
        shutil.rmtree(FRAME_DIR)
    os.makedirs(FRAME_DIR, exist_ok=True)

    print(f"Rendering {N_FRAMES} frames at {FPS}fps ({DURATION}s)...")
    for fi in range(N_FRAMES):
        t = fi / FPS
        dim, profile, headline, caption = get_dim_and_profile(t)
        # build image
        img = Image.new("RGB", (W, H), BG)
        draw_network(img, t, dim, profile)
        draw_overlay(img, t, dim, profile, headline, caption)
        draw_disclaimer(img)
        draw_caption_footer(img, t, caption)
        img.save(f"{FRAME_DIR}/frame_{fi:04d}.png", "PNG")
        if fi % 30 == 0:
            print(f"  frame {fi}/{N_FRAMES}  t={t:.2f}s  dim={dim}  profile={profile}")
    print("Frames rendered. Encoding MP4...")

    # Encode MP4
    if os.path.exists(OUT_MP4):
        os.remove(OUT_MP4)
    cmd = [
        "ffmpeg", "-y", "-framerate", str(FPS), "-i", f"{FRAME_DIR}/frame_%04d.png",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow",
        "-movflags", "+faststart",
        OUT_MP4,
    ]
    print(" ".join(cmd))
    subprocess.run(cmd, check=True)
    print(f"MP4 written: {OUT_MP4}")

    # Encode webm (compressed web-ready)
    if os.path.exists(OUT_WEBM):
        os.remove(OUT_WEBM)
    cmd2 = [
        "ffmpeg", "-y", "-framerate", str(FPS), "-i", f"{FRAME_DIR}/frame_%04d.png",
        "-c:v", "libvpx-vp9", "-b:v", "1.5M", "-pix_fmt", "yuv420p",
        OUT_WEBM,
    ]
    print(" ".join(cmd2))
    subprocess.run(cmd2, check=True)
    print(f"WebM written: {OUT_WEBM}")

    # Clean up frames dir to save disk
    shutil.rmtree(FRAME_DIR)
    print("Done.")


if __name__ == "__main__":
    main()
