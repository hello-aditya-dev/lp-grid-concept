# LP Grid — Mapping the Relationships Behind Private Markets

> A visual intelligence interface that helps private-market professionals move from a fragmented institutional ecosystem to the investors, strategies and relationships most relevant to them.

This repository contains a polished, focused **concept study** for **LP Grid** — not a production platform, not a homepage redesign, not a complete dashboard. The concept exists to communicate one strong product direction through a small set of high-quality deliverables.

---

## Concept statement

A visual intelligence interface that helps private-market professionals move from a fragmented institutional ecosystem to the investors, strategies and relationships most relevant to them.

The experience begins with a field of fictional institutional investors represented as interconnected points within a living relationship network. As the visitor scrolls or interacts, the system reorganises the investors along different intelligence dimensions — **geography**, **strategy**, **allocation size**, and **relationship strength** — before focusing on one investor (Meridian Sovereign Fund) and transitioning into a focused intelligence profile.

> From the entire private-market ecosystem to the relationships that matter.

---

## Deliverables

This concept produces exactly four deliverables:

| # | Deliverable | Where |
|---|---|---|
| 1 | **Desktop hero frame** | Live at `/` — full-viewport canvas with headline, supporting copy, dimension control |
| 2 | **Animated relationship-map interaction** | Live at `/` — five modes (Ecosystem → Geography → Strategy → Allocation → Relationships) with smooth spring interpolation, plus auto-transition into the focused profile |
| 3 | **Silent concept video (10.5s)** | `download/lp-grid-concept.mp4` (1920×1080, H.264, 30fps, ~10MB) and `download/lp-grid-concept.webm` (compressed web-ready) |
| 4 | **Mobile frame** | Live at `/` (scroll down past the desktop hero, or click "Mobile frame" in the top bar) — a polished phone mockup with profile-first composition and mini relationship map |

Key stills from the video are also provided as standalone images:
- `download/video-frame-0s.png` — opening ecosystem shot
- `download/video-frame-2.5s.png` — geography clustering
- `download/video-frame-5s.png` — strategy clustering
- `download/video-frame-7.5s.png` — relationship strength + focal node
- `download/video-frame-10.3s.png` — focused investor profile + closing line

Interactive state screenshots are also in `download/`:
- `screenshot-ecosystem.png`, `screenshot-geography.png`, `screenshot-strategy.png`, `screenshot-allocation.png`, `screenshot-relationships.png`, `screenshot-profile-open.png`, `screenshot-mobile.png`

---

## Tech stack

- **Next.js 16** with App Router
- **TypeScript 5**
- **Tailwind CSS 4**
- **Canvas 2D** for the relationship network (60 nodes + ~600 relationships — no need for WebGL, keeps the bundle small and 60fps on modern laptops)
- **Framer Motion** for UI panel transitions
- **Pillow + ffmpeg** (Python) for offline video frame rendering

> Note: WebGL was deliberately **not** used. 60 nodes with smooth spring interpolation is well within Canvas 2D's budget, and Canvas keeps the implementation simple, debuggable, and battery-friendly on mobile.

---

## Local development

```bash
bun install
bun run dev      # starts on http://localhost:3000
bun run lint     # ESLint
```

To regenerate the silent concept video:

```bash
python3 scripts/render_video.py     # renders ~315 PNG frames (slow, ~5 min)
python3 scripts/encode_video.py     # encodes frames to MP4 + WebM
```

The video script (`scripts/render_video.py`) is a self-contained Python file that mirrors the same data and layout logic as the live web app, so the video faithfully represents what a user would see in the browser.

---

## Interaction logic

The relationship map supports five dimensions, switchable via the segmented control at the bottom of the screen (or keyboard `1`–`5`):

1. **Ecosystem (01)** — full institutional network in a stable sunflower (phyllotaxis) layout. Subtle ambient drift; feels alive but controlled.
2. **Geography (02)** — nodes regroup into four clusters: North America, Europe, Middle East, Asia-Pacific. Cluster labels fade in.
3. **Strategy (03)** — nodes regroup by preferred private-market strategy: PE, Private credit, Infrastructure, Real assets, VC, Secondaries. Nodes take on a per-strategy tint.
4. **Allocation (04)** — nodes scale by typical commitment size and arrange along a horizontal axis from <$25M to $500M+.
5. **Relationships (05)** — one investor (Meridian Sovereign Fund) becomes the focal point. Others radiate outward with distance inversely proportional to relationship strength. After ~2 seconds, the network collapses around Meridian and the focused intelligence profile slides in from the right.

Other interactions:
- **Hover** any node to see its name as a small tooltip
- **Click** any node in Relationships mode to focus that investor instead
- **Mouse** movement creates subtle local attraction toward nearby nodes (desktop only)
- **ESC** closes the profile / returns to ecosystem
- **Reduced motion** (`prefers-reduced-motion`) removes ambient drift and snaps layout transitions

---

## Visual system

| Token | Value | Purpose |
|---|---|---|
| Background | `#0A0E14` (midnight navy) | Calm, institutional canvas |
| Foreground | `#E8E5DD`/slate-200 | Warm off-white text |
| Muted | slate-400/500 | Interface labels, metadata |
| Accent | `#E8B864` (soft amber) | Selected investor, high-strength signals, primary CTA |
| Secondary accent | `#4DA3FF` (mineral blue) | Reserved (used sparingly for hover/secondary nodes) |
| Typography | Geist Sans + Geist Mono | Modern grotesk with strong numeric readability |

**Motion principles**: smooth, weighted, controlled. Spring interpolation (k≈0.05, damping 0.82) for node repositioning. No bouncing, no particle explosions, no parallax. Every animation exists to communicate a change in how the data is being organised.

---

## Data & disclaimer

All investor data is **fictional** and **illustrative**. The dataset contains 60 invented institutions (pension funds, sovereign wealth funds, endowments, foundations, insurance groups, family offices, fund-of-funds, asset managers, institutional consultants) with internally consistent metadata:

- Institution name, type, HQ, primary geography
- AUM (range: $1.2B–$240B)
- Typical commitment size
- Preferred private-market strategies
- Relationship score (0–1)
- Recent activity indicator (Increasing / Stable / Decreasing)

Relationships are computed deterministically from geographic proximity + shared strategies + combined relationship score (capped at ~600 visible relationships). No real confidential investor information is used.

A subtle "Illustrative data shown for concept purposes" disclaimer is visible on the desktop hero and in the mobile profile.

---

## Scope boundaries

This concept **intentionally** does not include:
- A complete homepage or marketing site
- User authentication, search, or backend database
- Real investor records, data scraping, or live integrations
- A functional CRM or detailed investor-profile subpages
- Pricing, About, Blog pages or full navigation architecture

Any wider product design, engineering, or website work should be treated as a separate paid phase.

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx           # Geist fonts + dark theme metadata
│   └── page.tsx             # Main concept page (desktop hero + mobile section)
├── components/
│   └── lp-grid/
│       ├── NetworkCanvas.tsx     # Canvas 2D network renderer + spring physics
│       ├── DimensionControl.tsx  # Segmented selector for the 5 dimensions
│       ├── InvestorProfile.tsx   # Focused intelligence profile panel
│       └── MobileFrame.tsx       # Phone-shell mobile frame + mini map
└── lib/
    └── lp-grid/
        ├── data.ts          # 60 fictional investors + relationships + Meridian profile
        └── layouts.ts       # Layout engine: ecosystem / geography / strategy / allocation / relationships

scripts/
├── render_video.py          # Pillow-based frame renderer (315 frames @ 30fps)
└── encode_video.py          # ffmpeg encoder (MP4 + WebM)

download/                    # Final deliverables (video, stills, screenshots)
```

---

## Concept credits

LP Grid is a concept study. All institutions, AUM figures, allocation percentages, relationship scores and activity indicators are invented for the purposes of this concept. Any resemblance to real organisations is coincidental.
