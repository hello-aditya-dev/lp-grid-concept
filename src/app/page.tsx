"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import NetworkCanvas from "@/components/lp-grid/NetworkCanvas";
import DimensionControl, { DIMENSIONS } from "@/components/lp-grid/DimensionControl";
import InvestorProfile from "@/components/lp-grid/InvestorProfile";
import MobileFrame from "@/components/lp-grid/MobileFrame";
import ChapterCopy, { CHAPTERS } from "@/components/lp-grid/ChapterCopy";
import ConceptVideo from "@/components/lp-grid/ConceptVideo";
import { Dimension, totalRelationshipCount } from "@/lib/lp-grid/layouts";
import { SELECTED_INVESTOR_ID } from "@/lib/lp-grid/data";

// Scroll thresholds for the six chapters (must sum to 1.0 within the storytelling section)
// 0–18% Ecosystem, 18–36% Geography, 36–54% Strategy, 54–72% Allocation, 72–88% Relationships, 88–100% Profile
const THRESHOLDS = [0, 0.18, 0.36, 0.54, 0.72, 0.88, 1.0];

function chapterFromProgress(p: number): number {
  // p in [0,1] within the storytelling section
  for (let i = 0; i < THRESHOLDS.length - 1; i++) {
    if (p >= THRESHOLDS[i] && p < THRESHOLDS[i + 1]) return i;
  }
  return THRESHOLDS.length - 2; // clamp to last chapter
}

export default function Home() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(SELECTED_INVESTOR_ID);
  const [activeChapter, setActiveChapter] = useState(0); // 0..5
  // Manual override: when the user clicks a tab, we briefly lock the dimension
  // so the network responds instantly. Scroll position catches up via smooth scroll.
  const [manualOverride, setManualOverride] = useState<Dimension | null>(null);
  const overrideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs for scroll computation
  const storyRef = useRef<HTMLDivElement>(null);

  // Live scroll progress of the storytelling section (0..1)
  const [, setStoryProgress] = useState(0);
  const storyProgressRaf = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Scroll listener — single rAF-throttled subscription
  useEffect(() => {
    const onScroll = () => {
      if (storyProgressRaf.current) return;
      storyProgressRaf.current = requestAnimationFrame(() => {
        storyProgressRaf.current = null;
        const el = storyRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        if (total <= 0) {
          setStoryProgress(0);
          return;
        }
        // Progress = how far the section's top has scrolled past the viewport top
        // When the section top is at viewport top, progress=0; when section bottom
        // reaches viewport bottom (i.e. we've scrolled `total`), progress=1.
        const scrolled = Math.max(0, Math.min(total, -rect.top));
        const p = total > 0 ? scrolled / total : 0;
        setStoryProgress(p);
        const ch = chapterFromProgress(p);
        setActiveChapter((prev) => (prev !== ch ? ch : prev));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (storyProgressRaf.current) cancelAnimationFrame(storyProgressRaf.current);
    };
  }, []);

  // Derived network state from active chapter
  const { dimension, profileMode } = useMemo(() => {
    const ch = CHAPTERS[activeChapter] ?? CHAPTERS[0];
    if (ch.dimension === "profile") {
      return { dimension: "relationships" as Dimension, profileMode: true };
    }
    return { dimension: ch.dimension as Dimension, profileMode: false };
  }, [activeChapter]);

  // Effective dimension: manual override wins briefly, otherwise scroll-driven
  const effectiveDimension = manualOverride ?? dimension;

  // Clean up override timer on unmount
  useEffect(() => {
    return () => {
      if (overrideTimerRef.current) clearTimeout(overrideTimerRef.current);
    };
  }, []);

  const handleDimensionChange = useCallback((d: Dimension) => {
    // Option A from the brief: manual selection scrolls to the matching chapter
    setManualOverride(d);
    if (overrideTimerRef.current) clearTimeout(overrideTimerRef.current);
    // Hold the override for 800ms after scrolling settles, then let scroll take over
    overrideTimerRef.current = setTimeout(() => setManualOverride(null), 1200);

    const chapterIdx = CHAPTERS.findIndex((c) => c.dimension === d);
    if (chapterIdx < 0) return;
    // Scroll to that chapter's position inside the storytelling section
    const el = storyRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    // Each chapter occupies an equal slice; aim for the chapter's mid-point
    const targetP = (chapterIdx + 0.5) / CHAPTERS.length;
    const targetY = window.scrollY + el.getBoundingClientRect().top + targetP * total;
    window.scrollTo({
      top: targetY,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [reducedMotion]);

  const handleCanvasSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const scrollToStory = useCallback(() => {
    const el = storyRef.current;
    if (!el) return;
    const targetY = window.scrollY + el.getBoundingClientRect().top + 1;
    window.scrollTo({ top: targetY, behavior: reducedMotion ? "auto" : "smooth" });
  }, [reducedMotion]);

  const scrollToMobile = useCallback(() => {
    const el = document.getElementById("mobile-concept");
    if (!el) return;
    const targetY = window.scrollY + el.getBoundingClientRect().top - 20;
    window.scrollTo({ top: targetY, behavior: reducedMotion ? "auto" : "smooth" });
  }, [reducedMotion]);

  // ESC closes profile (i.e. scrolls back to Relationships chapter)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && profileMode) {
        const el = storyRef.current;
        if (!el) return;
        const total = el.offsetHeight - window.innerHeight;
        // Scroll back to ~80% (mid-Relationships chapter)
        const targetY = window.scrollY + el.getBoundingClientRect().top + 0.8 * total;
        window.scrollTo({ top: targetY, behavior: reducedMotion ? "auto" : "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [profileMode, reducedMotion]);

  const totalRels = Math.round(totalRelationshipCount());

  // Scroll progress bar (top of viewport)
  const { scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <main className="relative min-h-screen w-full bg-[#0A0E14] text-slate-200">
      {/* Subtle atmospheric backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(77,163,255,0.05), transparent 60%), radial-gradient(ellipse 60% 40% at 90% 100%, rgba(232,184,100,0.04), transparent 60%)",
        }}
      />

      {/* Top scroll-progress indicator */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-px origin-left bg-amber-300/60"
        style={{ scaleX: progressScale }}
      />

      {/* ============================== */}
      {/* HEADER                         */}
      {/* ============================== */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.04] bg-[#0A0E14]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6 md:px-10 md:py-4">
          {/* Left: LP Grid + concept badge */}
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="grid h-7 w-7 place-items-center rounded-md border border-amber-200/30 bg-amber-200/[0.04]"
            >
              <div className="h-2.5 w-2.5 rounded-sm bg-amber-200/80" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-slate-100">
              LP <span className="text-slate-400">Grid</span>
            </span>
            <span className="ml-2 hidden rounded-full border border-white/[0.06] px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-slate-500 sm:inline">
              Independent concept
            </span>
          </div>

          {/* Right: View mobile + Created by Aditya Singh */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={scrollToMobile}
              className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[11px] text-slate-400 transition-colors hover:text-slate-100 min-h-[36px]"
              aria-label="Scroll to the mobile concept section"
            >
              <span className="hidden sm:inline">View mobile frame</span>
              <span className="sm:hidden">Mobile</span>
            </button>
            <a
              href="https://dev-aditya-com.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-amber-200/30 bg-amber-200/[0.06] px-3 py-1.5 text-[11px] font-medium text-amber-100 transition-colors hover:bg-amber-200/[0.12] min-h-[36px] flex items-center"
            >
              <span className="hidden sm:inline">Created by Aditya Singh</span>
              <span className="sm:hidden">Aditya Singh ↗</span>
            </a>
          </div>
        </div>
      </header>

      {/* ============================== */}
      {/* HERO                           */}
      {/* ============================== */}
      <section
        aria-labelledby="hero-title"
        className="relative flex min-h-[100svh] w-full items-center overflow-hidden px-4 pb-24 pt-20 sm:px-6 md:px-10 md:pt-24"
      >
        {/* Background network at rest (ecosystem) */}
        <div aria-hidden="true" className="absolute inset-0 z-0 opacity-60">
          <NetworkCanvas
            dimension="ecosystem"
            profileMode={false}
            selectedId={selectedId}
            reducedMotion={reducedMotion}
            onSelect={() => undefined}
          />
        </div>

        {/* Hero copy */}
        <div className="relative z-10 mx-auto w-full max-w-[1600px]">
          <div className="max-w-[680px]">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-amber-200/70">
              <span
                aria-hidden="true"
                className="h-1 w-1 rounded-full bg-amber-300/80 shadow-[0_0_6px_rgba(232,184,100,0.7)]"
              />
              LP Grid · Private-market intelligence
            </div>
            <h1
              id="hero-title"
              className="mt-4 font-sans text-[40px] font-semibold leading-[1.02] tracking-[-0.02em] text-slate-50 sm:text-[56px] md:text-[72px]"
            >
              See the private-market{" "}
              <span className="bg-gradient-to-r from-amber-200/90 via-amber-100/80 to-amber-200/70 bg-clip-text text-transparent">
                relationships
              </span>{" "}
              others miss.
            </h1>
            <p className="mt-6 max-w-[500px] text-[15px] leading-relaxed text-slate-400 sm:text-[16px]">
              Map institutional investors, understand allocation behaviour and identify the relationships shaping private markets.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={scrollToStory}
                className="rounded-full bg-amber-200/90 px-5 py-2.5 text-[12px] font-semibold text-[#1A1408] transition-all hover:bg-amber-100 min-h-[44px]"
              >
                Explore the intelligence story →
              </button>
              <button
                type="button"
                onClick={scrollToMobile}
                className="rounded-full border border-white/10 bg-white/[0.02] px-5 py-2.5 text-[12px] font-medium text-slate-200 transition-colors hover:bg-white/[0.05] min-h-[44px]"
              >
                View mobile concept
              </button>
              <ConceptVideo />
            </div>

            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3.5 py-1.5">
              <span className="font-mono text-[10px] tracking-wider text-slate-400">
                Institutional network
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-[10px] tracking-wider text-amber-200/80 tabular-nums">
                {totalRels.toLocaleString()} active relationships
              </span>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div
          aria-hidden="true"
          className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-slate-600 md:flex"
        >
          <span>Scroll to explore</span>
          <span className="h-8 w-px bg-gradient-to-b from-amber-200/40 to-transparent" />
        </div>
      </section>

      {/* ============================== */}
      {/* SCROLL-DRIVEN STORYTELLING     */}
      {/* ============================== */}
      <section
        ref={storyRef}
        aria-label="Interactive private-market intelligence story"
        aria-labelledby="story-title"
        className="relative w-full"
        style={{ height: "500vh" }}
      >
        <h2 id="story-title" className="sr-only">
          Interactive private-market intelligence story
        </h2>

        {/* Visually hidden description of the canvas for screen readers */}
        <p id="lp-grid-network-description" className="sr-only">
          This interactive concept visualises fictional institutional investors
          reorganising by geography, strategy, allocation size and relationship
          strength before opening a focused investor profile. All investor data
          shown is fictional and illustrative.
        </p>

        {/* Pinned network layer — stays in viewport while the section scrolls */}
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          {/* Canvas fills the pinned layer */}
          <div id="lp-grid-network" className="absolute inset-0 z-0">
            <NetworkCanvas
              dimension={effectiveDimension}
              profileMode={profileMode}
              selectedId={selectedId}
              onSelect={handleCanvasSelect}
              reducedMotion={reducedMotion}
              compact={false}
            />
          </div>

          {/* Left-side chapter copy (chapters 1–5) */}
          <div
            className={`pointer-events-none absolute inset-0 z-10 flex items-center px-4 sm:px-6 md:px-10 ${profileMode ? "hidden md:flex" : ""}`}
          >
            <div className="w-full max-w-[1600px]">
              <ChapterCopy activeIndex={activeChapter} profileMode={profileMode} />
            </div>
          </div>

          {/* Top-right status pill */}
          <div className="pointer-events-none absolute right-4 top-20 z-20 sm:right-6 md:right-10">
            <div className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 backdrop-blur-md">
              <span className="font-mono text-[10px] tracking-wider text-slate-400">
                {DIMENSIONS.find((d) => d.id === effectiveDimension)?.label ?? "Ecosystem"}
              </span>
              <span className="mx-2 text-slate-600">·</span>
              <span className="font-mono text-[10px] tracking-wider text-amber-200/80 tabular-nums">
                {profileMode ? "Investor in focus" : `${(activeChapter + 1).toString().padStart(2, "0")} / 06`}
              </span>
            </div>
          </div>

          {/* Bottom-right metadata */}
          <div className="pointer-events-none absolute bottom-6 right-4 z-20 hidden sm:right-6 sm:block md:right-10">
            <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              <span className="tabular-nums">60 institutions</span>
              <span className="text-slate-700">/</span>
              <span className="text-slate-400">
                {effectiveDimension === "ecosystem" && "all dimensions"}
                {effectiveDimension === "geography" && "clustered by region"}
                {effectiveDimension === "strategy" && "clustered by strategy"}
                {effectiveDimension === "allocation" && "scaled by commitment"}
                {effectiveDimension === "relationships" && "focal: relationship strength"}
              </span>
            </div>
          </div>

          {/* Bottom-center dimension control (secondary interaction) */}
          <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
            <DimensionControl
              dimension={profileMode ? "relationships" : effectiveDimension}
              onChange={handleDimensionChange}
            />
          </div>

          {/* Profile panel (right side) — only in chapter 6 */}
          <AnimatePresence>
            {profileMode && (
              <InvestorProfile
                investorId={selectedId}
                onClose={() => {
                  // Scroll back to Relationships chapter
                  const el = storyRef.current;
                  if (!el) return;
                  const total = el.offsetHeight - window.innerHeight;
                  const targetY =
                    window.scrollY + el.getBoundingClientRect().top + 0.8 * total;
                  window.scrollTo({
                    top: targetY,
                    behavior: reducedMotion ? "auto" : "smooth",
                  });
                }}
              />
            )}
          </AnimatePresence>

          {/* Disclaimer (subtle, always visible during the story) */}
          <div className="pointer-events-none absolute bottom-6 left-4 z-20 hidden sm:left-6 sm:block md:left-10">
            <div className="text-[9px] uppercase tracking-[0.18em] text-slate-600">
              Illustrative data · independent concept
            </div>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* MOBILE CONCEPT                 */}
      {/* ============================== */}
      <MobileFrame />

      {/* ============================== */}
      {/* CLOSING BLOCK                  */}
      {/* ============================== */}
      <section
        aria-labelledby="closing-title"
        className="relative w-full border-t border-white/[0.04] bg-[#070A0F] px-4 py-20 sm:px-6 sm:py-28 md:px-10"
      >
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70">
            Independent concept exploration
          </div>
          <h2
            id="closing-title"
            className="mx-auto mt-4 max-w-2xl text-[22px] font-semibold leading-tight tracking-tight text-slate-100 sm:text-[28px] md:text-[32px]"
          >
            A focused study of how LP Grid could transform complex investor data into a clearer visual story — moving from the wider private-market ecosystem to the relationships that matter.
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">
            <span>Live interaction</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Desktop concept</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Mobile concept</span>
          </div>
          <div className="mt-10 border-t border-white/[0.06] pt-8">
            <p className="text-[12px] text-slate-400">
              Designed and developed by{" "}
              <a
                href="https://dev-aditya-com.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-amber-200/90 underline-offset-4 hover:underline"
              >
                Aditya Singh
              </a>
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-slate-600">
              Illustrative data · independent concept · not affiliated with LP Grid
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
