"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NetworkCanvas from "@/components/lp-grid/NetworkCanvas";
import DimensionControl from "@/components/lp-grid/DimensionControl";
import InvestorProfile from "@/components/lp-grid/InvestorProfile";
import MobileFrame from "@/components/lp-grid/MobileFrame";
import { Dimension, totalRelationshipCount } from "@/lib/lp-grid/layouts";
import { SELECTED_INVESTOR_ID, INVESTORS } from "@/lib/lp-grid/data";

export default function Home() {
  const [dimension, setDimension] = useState<Dimension>("ecosystem");
  const [selectedId, setSelectedId] = useState<string>(SELECTED_INVESTOR_ID);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const dimensionQueue = useRef<Dimension[]>([]);
  const autoPlayRef = useRef<boolean>(true);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Keyboard: ESC closes profile, 1-5 switches dimension
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (profileOpen) setProfileOpen(false);
        else setDimension("ecosystem");
      } else if (e.key >= "1" && e.key <= "5") {
        const dims: Dimension[] = ["ecosystem", "geography", "strategy", "allocation", "relationships"];
        const d = dims[parseInt(e.key, 10) - 1];
        if (d) {
          setDimension(d);
          autoPlayRef.current = false;
        }
      } else if (e.key === "Enter") {
        if (dimension === "relationships") setProfileOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dimension, profileOpen]);

  // When dimension changes to relationships, after a beat, allow click-to-select
  // and auto-open profile after 2.2s (only happens once per relationships entry)
  useEffect(() => {
    if (dimension === "relationships" && !profileOpen) {
      const t = setTimeout(() => setProfileOpen(true), 2200);
      return () => clearTimeout(t);
    }
  }, [dimension, profileOpen]);

  // In profile mode, clicking elsewhere closes it
  const handleCanvasClick = (id: string) => {
    setSelectedId(id);
    if (dimension === "relationships") {
      setProfileOpen(true);
    }
  };

  const handleDimensionChange = (d: Dimension) => {
    autoPlayRef.current = false;
    setDimension(d);
    if (d !== "relationships") setProfileOpen(false);
  };

  const totalRels = Math.round(totalRelationshipCount());

  return (
    <main className="min-h-screen w-full bg-[#0A0E14] text-slate-200 antialiased">
      {/* subtle noise/grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.4]"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(77,163,255,0.04), transparent 60%), radial-gradient(ellipse at bottom right, rgba(232,184,100,0.03), transparent 60%)",
        }}
      />

      {/* ============================== */}
      {/* DESKTOP HERO + NETWORK SECTION */}
      {/* ============================== */}
      <section className="relative z-10 min-h-screen w-full overflow-hidden">
        {/* Header */}
        <header className="absolute inset-x-0 top-0 z-30">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-10">
            <div className="flex items-center gap-2.5">
              <div className="grid h-7 w-7 place-items-center rounded-md border border-amber-200/30 bg-amber-200/[0.04]">
                <div className="h-2.5 w-2.5 rounded-sm bg-amber-200/80" />
              </div>
              <span className="text-[15px] font-semibold tracking-tight text-slate-100">
                LP <span className="text-slate-400">Grid</span>
              </span>
              <span className="ml-2 hidden rounded-full border border-white/[0.06] px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-slate-500 md:inline">
                Concept
              </span>
            </div>

            <nav className="hidden items-center gap-7 text-[12px] font-medium text-slate-400 md:flex">
              <a className="transition-colors hover:text-slate-100" href="#">Platform</a>
              <a className="transition-colors hover:text-slate-100" href="#">Intelligence</a>
              <a className="transition-colors hover:text-slate-100" href="#">Network</a>
              <a className="transition-colors hover:text-slate-100" href="#">About</a>
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobilePreview((v) => !v)}
                className="hidden rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[11px] text-slate-400 transition-colors hover:text-slate-100 lg:inline-block"
              >
                Mobile frame
              </button>
              <button className="rounded-full border border-amber-200/30 bg-amber-200/[0.06] px-3.5 py-1.5 text-[11px] font-medium text-amber-100 transition-colors hover:bg-amber-200/[0.12]">
                Request access
              </button>
            </div>
          </div>
        </header>

        {/* Network canvas (full-screen) */}
        <div className="absolute inset-0 z-0">
          <NetworkCanvas
            dimension={dimension}
            selectedId={selectedId}
            onSelect={handleCanvasClick}
            reducedMotion={reducedMotion}
            profileMode={profileOpen}
          />
        </div>

        {/* Hero copy overlay (left side) */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end md:justify-center">
          <div className="mx-auto w-full max-w-[1600px] px-6 pb-32 md:px-10 md:pb-0">
            <div className="max-w-[640px]">
              <AnimatePresence mode="wait">
                {!profileOpen ? (
                  <motion.div
                    key="hero"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="mb-4 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-amber-200/70">
                      <span className="h-1 w-1 rounded-full bg-amber-300/80 shadow-[0_0_6px_rgba(232,184,100,0.7)]" />
                      LP Grid · Private-market intelligence
                    </div>
                    <h1 className="font-sans text-[44px] font-semibold leading-[1.04] tracking-[-0.02em] text-slate-50 md:text-[64px]">
                      See the private-market{" "}
                      <span className="bg-gradient-to-r from-amber-200/90 via-amber-100/80 to-amber-200/70 bg-clip-text text-transparent">
                        relationships
                      </span>{" "}
                      others miss.
                    </h1>
                    <p className="mt-5 max-w-[460px] text-[15px] leading-relaxed text-slate-400">
                      Map institutional investors, understand allocation behaviour and identify the relationships shaping private markets.
                    </p>
                    <div className="mt-7 flex items-center gap-3">
                      <button
                        onClick={() => {
                          autoPlayRef.current = false;
                          setDimension("geography");
                          dimensionQueue.current = ["geography", "strategy", "allocation", "relationships"];
                          // Auto-progress
                          let i = 0;
                          const tick = () => {
                            const next = dimensionQueue.current[i];
                            if (next) {
                              setDimension(next);
                              i++;
                              setTimeout(tick, 2600);
                            }
                          };
                          setTimeout(tick, 100);
                        }}
                        className="pointer-events-auto rounded-full bg-amber-200/90 px-5 py-2.5 text-[12px] font-semibold text-[#1A1408] transition-all hover:bg-amber-100"
                      >
                        Explore the network →
                      </button>
                      <button className="pointer-events-auto rounded-full border border-white/10 bg-white/[0.02] px-5 py-2.5 text-[12px] font-medium text-slate-200 transition-colors hover:bg-white/[0.05]">
                        Request access
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="profile-intro"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="mb-4 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-amber-200/70">
                      <span className="h-1 w-1 rounded-full bg-amber-300/80" />
                      From the market ecosystem to the relationships that matter
                    </div>
                    <h1 className="font-sans text-[40px] font-semibold leading-[1.04] tracking-[-0.02em] text-slate-50 md:text-[52px]">
                      One investor, in focus.
                    </h1>
                    <p className="mt-5 max-w-[460px] text-[14px] leading-relaxed text-slate-400">
                      The wider network collapses around the selected institution. Allocation behaviour, strategy preferences and relationship signals become legible at a glance.
                    </p>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setDimension("ecosystem");
                      }}
                      className="pointer-events-auto mt-7 rounded-full border border-white/10 bg-white/[0.02] px-5 py-2.5 text-[12px] font-medium text-slate-200 transition-colors hover:bg-white/[0.05]"
                    >
                      ← Return to ecosystem
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom-left status pill */}
        <div className="pointer-events-none absolute bottom-6 left-6 z-20 md:left-10">
          <div className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3.5 py-1.5 backdrop-blur-md">
            <span className="font-mono text-[10px] tracking-wider text-slate-400">
              Institutional network
            </span>
            <span className="mx-2 text-slate-600">·</span>
            <span className="font-mono text-[10px] tracking-wider text-amber-200/80">
              {totalRels.toLocaleString()} active relationships
            </span>
          </div>
        </div>

        {/* Dimension control (bottom center) */}
        <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
          <DimensionControl dimension={dimension} onChange={handleDimensionChange} />
        </div>

        {/* Bottom-right metadata */}
        <div className="pointer-events-none absolute bottom-6 right-6 z-20 hidden md:right-10 md:block">
          <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider text-slate-500">
            <span>60 institutions</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-400">
              {dimension === "ecosystem" && "all dimensions"}
              {dimension === "geography" && "clustered by region"}
              {dimension === "strategy" && "clustered by strategy"}
              {dimension === "allocation" && "scaled by commitment"}
              {dimension === "relationships" && "focal: relationship strength"}
            </span>
          </div>
        </div>

        {/* Profile panel (right side, when open) */}
        <InvestorProfile
          investorId={profileOpen ? selectedId : null}
          onClose={() => setProfileOpen(false)}
        />

        {/* Concept disclaimer */}
        <div className="pointer-events-none absolute right-6 top-20 z-20 hidden md:right-10 md:block">
          <div className="text-[9px] uppercase tracking-[0.18em] text-slate-600">
            Illustrative data shown for concept purposes
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* MOBILE FRAME SECTION           */}
      {/* ============================== */}
      <AnimatePresence>
        {mobilePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md"
            onClick={() => setMobilePreview(false)}
          >
            <div className="min-h-full w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMobilePreview(false)}
                className="fixed right-6 top-6 z-50 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] text-slate-300"
              >
                Close ✕
              </button>
              <MobileFrame />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile frame inline section (so it's always accessible by scroll) */}
      <section className="relative z-10 border-t border-white/[0.04] bg-[#070A0F]">
        <MobileFrame />
      </section>
    </main>
  );
}
