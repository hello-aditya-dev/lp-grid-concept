# LP Grid — Independent Private-Markets Intelligence Concept

> **Independent concept exploration based solely on a public opportunity brief.**
> This work was not commissioned by LP Grid and is not presented as official LP Grid work.

A focused, scroll-driven product concept showing how institutional-investor data could be transformed into a premium visual intelligence experience. The visitor scrolls through six narrative chapters — ecosystem, geography, strategy, allocation, relationships, and a focused investor profile — while a Canvas-rendered relationship network reorganises itself in real time.

---

## Live demo

**https://lp-grid-concept.vercel.app/**

Best experienced on a desktop with a trackpad or mouse scroll. The concept also adapts to mobile (320px and up) and tablet.

---

## Concept objective

Communicate one strong product direction: how LP Grid could help private-market professionals move from a fragmented institutional ecosystem to the investors, strategies and relationships most relevant to them.

The experience begins with a field of fictional institutional investors represented as interconnected points. As the visitor scrolls, the system reorganises the same data along different intelligence dimensions — **geography**, **strategy**, **allocation size**, and **relationship strength** — before focusing on one investor (Meridian Sovereign Fund) and transitioning into a focused intelligence profile.

> From the entire private-market ecosystem to the relationships that matter.

---

## What the interaction demonstrates

| # | Chapter | What the visitor sees |
|---|---|---|
| 01 | The ecosystem | All 60 fictional investors in a stable sunflower layout, with ~600 relationship lines connecting them |
| 02 | Geography | Nodes regroup into four clusters — North America, Europe, Middle East, Asia-Pacific — with cluster labels |
| 03 | Strategy | Nodes regroup by preferred private-market strategy (PE, Private credit, Infrastructure, Real assets, VC, Secondaries) with per-strategy colour |
| 04 | Allocation | Nodes scale by typical commitment size and arrange along a horizontal axis from under $25M to $500M+ |
| 05 | Relationships | Meridian Sovereign Fund becomes the focal point; other investors radiate outward by inverse relationship strength |
| 06 | Investor intelligence | The network collapses around Meridian; a focused intelligence profile slides in showing AUM, commitments, strategies, signals, related orgs, and a summary |

---

## Deliverables currently available

1. **Live interactive concept** (desktop + mobile) at the URL above
2. **Desktop hero frame** — full-viewport Canvas network with headline, supporting copy, primary CTA
3. **Scroll-driven animated relationship map** — six chapters with smooth spring interpolation, pinned network, chapter copy on the left
4. **Mobile frame** — phone mockup showing the focused investor profile with a mini relationship map, plus the live responsive page itself (not just the mockup)

---

## Planned video asset

An 8–12 second silent concept film will be added as the final presentation asset at `public/media/lp-grid-concept.mp4`. The codebase is already prepared: a `ConceptVideo` component probes for the file via a HEAD request and renders a "Watch concept film" affordance only when the file actually exists. Until then, no video link is shown anywhere — the deployment contains zero 404 video links.

---

## Interaction model

### Primary: scroll-driven storytelling

The main experience is a 500vh-tall storytelling section. The Canvas network is pinned (sticky) inside the viewport and reorganises as the visitor scrolls. Six chapters are mapped to scroll-progress thresholds:

| Chapter | Scroll range |
|---|---|
| 01 Ecosystem | 0% – 18% |
| 02 Geography | 18% – 36% |
| 03 Strategy | 36% – 54% |
| 04 Allocation | 54% – 72% |
| 05 Relationships | 72% – 88% |
| 06 Investor intelligence | 88% – 100% |

Scrolling works in both directions — scrolling backward correctly restores earlier network states. The transitions use spring interpolation (k≈0.05, damping 0.82) for smooth, weighted motion. No chained `setTimeout` calls, no auto-advancing timers, no scroll hijacking.

### Secondary: manual dimension control

A segmented selector at the bottom-center of the viewport lets the visitor jump directly to any chapter. Clicking a tab smoothly scrolls to that chapter's mid-point. The control is keyboard-accessible:

- `ArrowLeft` / `ArrowUp` — previous chapter
- `ArrowRight` / `ArrowDown` — next chapter
- `Home` / `End` — first / last chapter
- `Enter` / `Space` — activate focused tab
- `Esc` — exit the focused profile (scrolls back to the Relationships chapter)

### Node interaction

In the Relationships chapter, clicking any investor node updates the focused profile to that investor. The profile dynamically derives plausible strategy allocation, relationship signals, related organisations, and an intelligence summary from the investor's metadata.

---

## Responsive behaviour

The page is tested at 320px, 360px, 375px, 390px, 430px, 768px, 1024px, 1280px, and 1440px widths with **zero horizontal overflow** at any size.

- **Desktop (≥768px)**: full segmented dimension bar, all cluster labels visible, pointer hover reveals node names, mouse attraction subtly displaces nearby nodes
- **Mobile (<768px)**: compact `01 ● ○ ○ ○ ○ Ecosystem` selector, no cluster labels (avoids clutter on small screens), pointer events instead of mouse-only, touch-friendly 44px targets, simplified transitions

The real page works on mobile — not only the phone mockup. The mockup exists to showcase a profile-first mobile composition as a separate deliverable.

---

## Accessibility

- **Semantic HTML**: `<header>`, `<main>`, `<section>`, `<h1>`–`<h2>` hierarchy, `<button>` for all interactive controls
- **ARIA**: `role="tablist"` / `role="tab"` with `aria-selected`, `aria-controls`, `aria-label`; `role="region"` for the profile; `role="img"` + `aria-describedby` for the canvas; `aria-live="polite"` for chapter copy; `role="progressbar"` for the relationship-strength indicator
- **Keyboard**: full tab navigation, arrow-key chapter switching, Home/End support, Esc to exit profile
- **Focus-visible**: all interactive elements show a visible amber focus ring
- **Reduced motion**: `prefers-reduced-motion` removes ambient drift, snaps transitions, and disables smooth scroll
- **Screen-reader description**: a visually hidden paragraph describes the canvas as a fictional interactive concept
- **Color**: relationship strength is communicated through both colour (amber for strong) and text labels ("Strong" / "Moderate") — never colour alone
- **Contrast**: text meets WCAG AA against the midnight-navy background

---

## Technology choices

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Required by deployment target |
| Language | TypeScript 5 (strict) | Type safety |
| Styling | Tailwind CSS 4 | Utility-first, no custom CSS framework |
| Motion | Framer Motion | `useScroll` / `useSpring` for the scroll-progress bar; `motion.div` for panel transitions |
| Network renderer | Canvas 2D | See below |
| Fonts | Geist Sans + Geist Mono (via `next/font`) | Modern grotesk with strong numeric readability |
| Package manager | npm | Standard, Vercel-compatible |

### Why Canvas 2D (not WebGL / Three.js)

The network has 60 nodes and ~600 relationship lines. Canvas 2D handles this at a stable 60fps on modern laptops with a fraction of the GPU cost of WebGL. It also:

- Keeps the bundle small (no Three.js / R3F / PixiJS)
- Makes debugging trivial (single 2D context)
- Plays well with `prefers-reduced-motion`
- Avoids shader compilation jank on lower-end mobile devices

WebGL would only earn its place for thousands of nodes or for 3D camera work — neither applies here. The simplest rendering method that performs is the right choice.

---

## Fictional-data disclaimer

**All investor data shown is fictional and illustrative.**

The dataset contains 60 invented institutions (pension funds, sovereign wealth funds, endowments, foundations, insurance groups, family offices, fund-of-funds, asset managers, institutional consultants) with internally consistent metadata: institution name, type, HQ, primary geography, AUM (range $1.2B–$240B), typical commitment size, preferred private-market strategies, relationship score, and recent-activity indicator.

Relationships are computed deterministically from geographic proximity + shared strategies + combined relationship score (capped at ~600 visible relationships). No real confidential investor information is used. Any resemblance to real organisations is coincidental.

A subtle "Illustrative data · independent concept" disclaimer is visible during the story and in the mobile profile.

---

## Local setup

```bash
git clone https://github.com/witejackel-eng/lp-grid-concept.git
cd lp-grid-concept
npm install
npm run dev      # http://localhost:3000
```

Requires Node.js 18.18+ (or 20+).

---

## Build and validation commands

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm run build       # next build
npm run start       # next start (production server)
```

All three validation commands pass cleanly with zero errors and zero warnings.

---

## Project structure

```
public/
├── og-lp-grid-concept.png   # 1200×630 Open Graph image
├── robots.txt
└── media/
    └── README.md            # placeholder for the future concept video

src/
├── app/
│   ├── layout.tsx           # Geist fonts, metadata (Aditya Singh, OG, canonical, robots)
│   ├── page.tsx             # Hero + scroll-driven story + mobile + closing
│   └── globals.css          # Tailwind 4 + reduced-motion + focus-visible
├── components/
│   └── lp-grid/
│       ├── NetworkCanvas.tsx     # Canvas 2D renderer, spring physics, pointer events
│       ├── DimensionControl.tsx  # Accessible tablist (desktop bar + mobile dots)
│       ├── ChapterCopy.tsx       # Left-side chapter copy with progress dots
│       ├── InvestorProfile.tsx   # Focused intelligence panel (works for any investor)
│       ├── MobileFrame.tsx       # Phone mockup + mini relationship map
│       └── ConceptVideo.tsx      # Future video modal (renders nothing until MP4 exists)
└── lib/
    └── lp-grid/
        ├── data.ts          # 60 fictional investors + relationships + Meridian profile
        └── layouts.ts       # 5-dimension layout engine (deterministic)

scripts/
└── generate_og.py          # Pillow script that renders the OG image from the real layout
```

---

## Scope boundaries

This is an **independent concept exploration**, not a production platform. It does **not** include:

- A complete homepage or marketing site
- User authentication, search, or a backend database
- Real investor records, data scraping, or live integrations
- A functional CRM or detailed investor-profile subpages
- Pricing, About, Blog pages, or full navigation architecture
- Testimonials, FAQs, services, or a contact form

Any wider product design, engineering, or website work should be treated as a separate paid phase.

---

## Author

**Aditya Singh**

- GitHub: [witejackel-eng](https://github.com/witejackel-eng)
- Portfolio: [dev-aditya-com.vercel.app](https://dev-aditya-com.vercel.app/)

---

*This is an independent concept exploration based solely on a public opportunity brief. It was not commissioned by LP Grid and is not presented as official LP Grid work. All investor data shown is fictional and illustrative.*
