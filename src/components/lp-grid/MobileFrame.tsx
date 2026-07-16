"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  INVESTORS,
  MERIDIAN_STRATEGY_ALLOCATION,
  MERIDIAN_SIGNALS,
  MERIDIAN_RELATED,
  MERIDIAN_SUMMARY,
  SELECTED_INVESTOR_ID,
} from "@/lib/lp-grid/data";

/**
 * MobileFrame — a polished phone mockup showing the focused investor profile
 * with a simplified mini relationship map (Meridian + 5 strongest connections).
 *
 * This is a static showcase of the *mobile composition* — the live, interactive
 * mobile experience is the main page itself, which adapts to small screens.
 */
export default function MobileFrame() {
  return (
    <section
      id="mobile-concept"
      aria-labelledby="mobile-concept-title"
      className="relative w-full overflow-hidden border-t border-white/[0.04] bg-gradient-to-b from-[#0A0E14] to-[#070A0F] px-4 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-3xl text-center">
        <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70">
          04 · Mobile concept
        </div>
        <h2
          id="mobile-concept-title"
          className="mt-2 text-[22px] font-semibold tracking-tight text-slate-100 sm:text-[28px]"
        >
          Profile-first composition
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[13px] leading-relaxed text-slate-400">
          The same intelligence model, redesigned for smaller screens — fewer nodes,
          strongest relationships only, profile-first.
        </p>
      </div>

      {/* Phone shell */}
      <div className="mt-12 flex justify-center">
        <div
          className="relative h-[760px] w-[368px] max-w-full shrink-0 rounded-[44px] border border-white/10 bg-[#060809] p-2 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9),inset_0_0_0_2px_rgba(255,255,255,0.04)]"
          role="img"
          aria-label="Mobile concept showing the Meridian Sovereign Fund focused intelligence profile"
        >
          {/* notch */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-3 z-30 h-6 w-28 -translate-x-1/2 rounded-full bg-black"
          />
          <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-[#0A0E14]">
            <MobileScreen />
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileScreen() {
  const investor = INVESTORS.find((i) => i.id === SELECTED_INVESTOR_ID);
  if (!investor) return null;

  return (
    <div className="flex h-full w-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pb-3 pt-12">
        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="grid h-7 w-7 place-items-center rounded-md border border-amber-200/30 bg-amber-200/[0.04]"
          >
            <div className="h-2.5 w-2.5 rounded-sm bg-amber-200/80" />
          </div>
          <span className="text-[13px] font-semibold tracking-tight text-slate-100">
            LP Grid
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-medium text-slate-400">
            Concept
          </span>
          <button
            aria-label="Menu"
            className="grid h-7 w-7 place-items-center rounded-md border border-white/10"
            type="button"
          >
            <span
              aria-hidden="true"
              className="block space-y-1"
            >
              <span className="block h-px w-3.5 bg-slate-300" />
              <span className="block h-px w-3.5 bg-slate-300" />
            </span>
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Header */}
        <div className="mt-3">
          <div className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.18em] text-amber-200/70">
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-amber-300/80" />
            Focused intelligence
          </div>
          <h1 className="mt-1.5 text-[20px] font-semibold leading-tight tracking-tight text-slate-50">
            {investor.name}
          </h1>
          <p className="mt-0.5 text-[12px] text-slate-400">
            {investor.type} · {investor.hq}
          </p>

          {/* relationship strength */}
          <div className="mt-3 flex items-center gap-2">
            <div
              className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]"
              role="progressbar"
              aria-valuenow={94}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Relationship strength: High"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "94%" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-amber-300/70 to-amber-200/40"
              />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-amber-200/80">
              High
            </span>
          </div>
        </div>

        {/* Metrics 2×2 grid */}
        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02]">
          <MobileMetric label="Est. AUM" value={`$${investor.aumB}B`} />
          <MobileMetric
            label="Commitment"
            value={`$${investor.typicalCommitmentM[0]}–${investor.typicalCommitmentM[1]}M`}
          />
          <MobileMetric label="Strategies" value={`${investor.preferredStrategies.length} active`} />
          <MobileMetric label="Activity" value={investor.recentActivity} accent="green" />
        </div>

        {/* Strategy allocation */}
        <div className="mt-5">
          <MobileSectionLabel>Strategy allocation</MobileSectionLabel>
          <div className="mt-2.5 space-y-2">
            {MERIDIAN_STRATEGY_ALLOCATION.map((row, idx) => (
              <div key={row.strategy} className="flex items-center gap-2">
                <div className="w-20 shrink-0 text-[11px] text-slate-300">{row.strategy}</div>
                <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.pct}%` }}
                    transition={{ duration: 0.7, delay: 0.1 + idx * 0.05 }}
                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-amber-200/60 to-amber-200/15"
                  />
                </div>
                <div className="w-8 shrink-0 text-right font-mono text-[10px] text-slate-400 tabular-nums">
                  {row.pct}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Relationship signals */}
        <div className="mt-5">
          <MobileSectionLabel>Relationship signals</MobileSectionLabel>
          <ul className="mt-2 space-y-1.5">
            {MERIDIAN_SIGNALS.slice(0, 3).map((sig) => (
              <li
                key={sig}
                className="flex items-start gap-2 text-[11px] leading-snug text-slate-300"
              >
                <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-300/70" />
                <span>{sig}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mini relationship map */}
        <div className="mt-5">
          <MobileSectionLabel>Strongest connections</MobileSectionLabel>
          <MiniRelationshipMap />
        </div>

        {/* Related orgs */}
        <div className="mt-5">
          <MobileSectionLabel>Related organisations</MobileSectionLabel>
          <div className="mt-2 space-y-0.5">
            {MERIDIAN_RELATED.slice(0, 4).map((r) => (
              <div
                key={r.name}
                className="flex items-center justify-between rounded-md px-1.5 py-1.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-[11px] text-slate-200">{r.name}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500">
                    {r.strength}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${
                      r.strength === "Strong" ? "bg-amber-300/80" : "bg-slate-400/60"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-5 rounded-lg border border-amber-200/10 bg-amber-200/[0.03] p-3">
          <MobileSectionLabel>Intelligence summary</MobileSectionLabel>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">{MERIDIAN_SUMMARY}</p>
        </div>

        <div className="mt-4 text-center text-[9px] uppercase tracking-[0.18em] text-slate-600">
          Illustrative data · independent concept
        </div>
      </div>
    </div>
  );
}

function MobileMetric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "green" | "amber";
}) {
  const color =
    accent === "green"
      ? "text-emerald-300"
      : accent === "amber"
      ? "text-amber-200"
      : "text-slate-100";
  return (
    <div className="bg-[#0A0E14]/40 px-3 py-2.5">
      <div className="text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-0.5 font-mono text-[14px] font-medium tabular-nums ${color}`}>
        {value}
      </div>
    </div>
  );
}

function MobileSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate-500">
      {children}
    </div>
  );
}

/** Mini map: Meridian at centre, 5 strongest connections radiating, animated lines. */
function MiniRelationshipMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0 || size.h === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(size.w * dpr));
    canvas.height = Math.max(1, Math.floor(size.h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const related = MERIDIAN_RELATED.map((r) => INVESTORS.find((i) => i.name === r.name)).filter(
      (i): i is NonNullable<typeof i> => Boolean(i),
    );
    const others = related.slice(0, 5);
    const cx = size.w / 2;
    const cy = size.h / 2;
    const angles = others.map((_, i) => (i / Math.max(others.length, 1)) * Math.PI * 2 - Math.PI / 2);

    let raf = 0;
    const start = performance.now();
    let lastFrame = 0;

    const render = (now: number) => {
      // Throttle to ~30fps on the mini-map to save battery
      if (now - lastFrame < 33) {
        raf = requestAnimationFrame(render);
        return;
      }
      lastFrame = now;
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, size.w, size.h);

      const pulse = reducedMotion ? 0.6 : 0.5 + 0.5 * Math.sin(t * 1.4);
      const radius = Math.min(size.w, size.h) * 0.32;

      // Lines
      others.forEach((inv, i) => {
        const angle = angles[i];
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        const grad = ctx.createLinearGradient(cx, cy, x, y);
        grad.addColorStop(0, `rgba(232,184,100,${0.6 + pulse * 0.3})`);
        grad.addColorStop(1, "rgba(232,184,100,0.1)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();

        const isStrong = MERIDIAN_RELATED.find((r) => r.name === inv.name)?.strength === "Strong";
        ctx.fillStyle = isStrong ? "rgba(232,184,100,0.85)" : "rgba(180,200,235,0.6)";
        ctx.beginPath();
        ctx.arc(x, y, 3 + (isStrong ? 1 : 0), 0, Math.PI * 2);
        ctx.fill();
      });

      // Central node glow
      const glowR = 18 + (reducedMotion ? 0 : pulse * 4);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      g.addColorStop(0, "rgba(232,184,100,0.5)");
      g.addColorStop(1, "rgba(232,184,100,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#E8B864";
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.arc(cx - 1.5, cy - 1.5, 2, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.font = "500 9px var(--font-geist-sans), system-ui, sans-serif";
      ctx.fillStyle = "rgba(232,240,255,0.95)";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("Meridian", cx, cy + 12);

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [size, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative mt-2 h-[180px] w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#070A0F]"
    >
      <canvas
        ref={canvasRef}
        aria-label="Mini relationship map showing Meridian Sovereign Fund at the centre with its five strongest connections radiating outward."
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
