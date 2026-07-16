"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  MERIDIAN_STRATEGY_ALLOCATION,
  MERIDIAN_SIGNALS,
  MERIDIAN_RELATED,
  MERIDIAN_SUMMARY,
  INVESTORS,
  type Investor,
} from "@/lib/lp-grid/data";
import { relStrengthTo } from "@/lib/lp-grid/layouts";

interface InvestorProfileProps {
  investorId: string | null;
  onClose?: () => void;
  variant?: "desktop" | "mobile";
}

function strengthColor(strength: "Strong" | "Moderate" | "Light") {
  if (strength === "Strong") return "bg-amber-300/80";
  if (strength === "Moderate") return "bg-slate-300/60";
  return "bg-slate-500/40";
}

function strengthLabel(score: number) {
  if (score > 0.85) return "High";
  if (score > 0.7) return "Moderate";
  return "Developing";
}

/** Build a plausible strategy allocation for non-Meridian investors. */
function deriveStrategyAllocation(investor: Investor) {
  const total = investor.preferredStrategies.length;
  // Weighted by position in the list — first strategy gets the largest share
  return investor.preferredStrategies.map((strategy, i) => ({
    strategy,
    pct: Math.round((100 / Math.pow(1.6, i)) / total * 10) / 10,
  }));
}

/** Build a related-orgs list using actual relationship strength from the layout engine. */
function deriveRelatedOrganisations(investor: Investor) {
  const related = INVESTORS.filter((i) => i.id !== investor.id)
    .map((i) => ({ investor: i, strength: relStrengthTo(i.id, investor.id) }))
    .filter((r) => r.strength > 0.4)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 5)
    .map((r) => ({
      name: r.investor.name,
      type: r.investor.type,
      strength: (r.strength > 0.7 ? "Strong" : "Moderate") as "Strong" | "Moderate",
    }));
  return related;
}

export default function InvestorProfile({
  investorId,
  onClose,
  variant = "desktop",
}: InvestorProfileProps) {
  const isMobile = variant === "mobile";
  const investor = investorId ? INVESTORS.find((i) => i.id === investorId) : null;

  return (
    <AnimatePresence>
      {investor && (
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : 40, y: isMobile ? 20 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: isMobile ? 0 : 40, y: isMobile ? 20 : 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={
            isMobile
              ? "w-full"
              : "pointer-events-auto absolute right-4 top-1/2 z-20 w-[min(420px,calc(100vw-2rem))] -translate-y-1/2 md:right-8"
          }
          role="region"
          aria-label={`Focused intelligence profile for ${investor.name}`}
        >
          <div
            className="relative max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0E131C]/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            style={{ padding: isMobile ? 18 : 24 }}
          >
            {/* corner accents */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 h-px w-24 bg-gradient-to-r from-amber-200/50 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 h-24 w-px bg-gradient-to-b from-amber-200/30 to-transparent"
            />

            <ProfileContent
              investor={investor}
              isMobile={isMobile}
              onClose={onClose}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProfileContent({
  investor,
  isMobile,
  onClose,
}: {
  investor: Investor;
  isMobile: boolean;
  onClose?: () => void;
}) {
  const isMeridian = investor.id === "meridian";
  const strategyRows = isMeridian
    ? MERIDIAN_STRATEGY_ALLOCATION
    : deriveStrategyAllocation(investor);
  const totalPct = strategyRows.reduce((s, r) => s + r.pct, 0) || 1;

  const signals = isMeridian
    ? MERIDIAN_SIGNALS
    : [
        `${strengthLabel(investor.relationshipScore)} relationship with ${investor.preferredStrategies[0].toLowerCase()} managers`,
        `${investor.recentActivity === "Increasing" ? "Increasing" : "Stable"} activity across ${investor.preferredStrategies.length} active strategies`,
        `Primary concentration in ${investor.geography.toLowerCase()}`,
        `Average commitment of $${investor.typicalCommitmentM[0]}–${investor.typicalCommitmentM[1]}M per mandate`,
      ];

  const related = isMeridian ? MERIDIAN_RELATED : deriveRelatedOrganisations(investor);

  const summary = isMeridian
    ? MERIDIAN_SUMMARY
    : `${investor.name} maintains a ${investor.recentActivity.toLowerCase()} profile across ${investor.preferredStrategies.length} private-market strategies, with strongest concentration in ${investor.geography.toLowerCase()} and ${investor.preferredStrategies[0].toLowerCase()}.`;

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-amber-200/70">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-amber-300/80 shadow-[0_0_8px_rgba(232,184,100,0.6)]"
            />
            Focused intelligence
          </div>
          <h2
            className="mt-2 font-sans text-[22px] font-semibold leading-tight tracking-tight text-slate-50"
            title={investor.name}
          >
            {investor.name}
          </h2>
          <p className="mt-1 text-[13px] text-slate-400">
            {investor.type} · {investor.hq}
          </p>
        </div>
        {onClose && !isMobile && (
          <button
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.02] px-2 py-1 text-[10px] text-slate-400 transition-colors hover:text-slate-200"
            aria-label="Close profile panel"
          >
            ESC
          </button>
        )}
      </div>

      {/* Metrics grid */}
      <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02]">
        <Metric label="Estimated AUM" value={`$${investor.aumB}B`} mono />
        <Metric
          label="Typical commitment"
          value={`$${investor.typicalCommitmentM[0]}–${investor.typicalCommitmentM[1]}M`}
          mono
        />
        <Metric
          label="Relationship strength"
          value={strengthLabel(investor.relationshipScore)}
          accent={investor.relationshipScore > 0.85 ? "amber" : undefined}
        />
        <Metric
          label="Active strategies"
          value={`${investor.preferredStrategies.length}`}
          mono
        />
        <Metric
          label="Recent activity"
          value={investor.recentActivity}
          accent={investor.recentActivity === "Increasing" ? "green" : undefined}
        />
        <Metric label="Geography" value={investor.geography} />
      </div>

      {/* Strategy allocation */}
      <div className="mt-5">
        <SectionLabel>Strategy allocation</SectionLabel>
        <div className="mt-2.5 space-y-2">
          {strategyRows.map((row, idx) => {
            const pct = Math.round((row.pct / totalPct) * 100);
            return (
              <div key={row.strategy} className="flex items-center gap-3">
                <div className="w-24 shrink-0 text-[11px] text-slate-300 sm:w-28 sm:text-[12px]">
                  {row.strategy}
                </div>
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 0.6,
                      delay: 0.05 + idx * 0.04,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-amber-200/60 via-amber-200/40 to-amber-200/20"
                  />
                </div>
                <div className="w-9 shrink-0 text-right font-mono text-[11px] text-slate-400 tabular-nums">
                  {pct}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Relationship signals */}
      <div className="mt-5">
        <SectionLabel>Relationship signals</SectionLabel>
        <ul className="mt-2.5 space-y-1.5">
          {signals.slice(0, 4).map((sig) => (
            <li
              key={sig}
              className="flex items-start gap-2 text-[12px] leading-snug text-slate-300"
            >
              <span
                aria-hidden="true"
                className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-300/70"
              />
              <span>{sig}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Related organisations */}
      {related.length > 0 && (
        <div className="mt-5">
          <SectionLabel>Related organisations</SectionLabel>
          <div className="mt-2.5 space-y-1">
            {related.map((r) => (
              <div
                key={r.name}
                className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.03]"
              >
                <div className="min-w-0">
                  <div className="truncate text-[12px] text-slate-200">{r.name}</div>
                  <div className="truncate text-[10px] text-slate-500">{r.type}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">
                    {r.strength}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${strengthColor(r.strength)}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Intelligence summary */}
      <div className="mt-5 rounded-lg border border-amber-200/10 bg-amber-200/[0.03] p-3">
        <SectionLabel>Intelligence summary</SectionLabel>
        <p className="mt-2 text-[12px] leading-relaxed text-slate-300">{summary}</p>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 border-t border-white/[0.04] pt-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
          Illustrative data · independent concept
        </p>
      </div>
    </>
  );
}

function Metric({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: "amber" | "green";
}) {
  const valueColor =
    accent === "amber"
      ? "text-amber-200"
      : accent === "green"
      ? "text-emerald-300"
      : "text-slate-100";
  return (
    <div className="bg-[#0A0E14]/40 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div
        className={`mt-1 ${mono ? "font-mono" : "font-sans"} text-[14px] font-medium tabular-nums sm:text-[15px] ${valueColor}`}
      >
        {value}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
      {children}
    </div>
  );
}
