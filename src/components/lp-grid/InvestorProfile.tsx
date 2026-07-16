"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  MERIDIAN_STRATEGY_ALLOCATION,
  MERIDIAN_SIGNALS,
  MERIDIAN_RELATED,
  MERIDIAN_SUMMARY,
  Investor as MeridianInvestor,
} from "@/lib/lp-grid/data";
import { INVESTORS } from "@/lib/lp-grid/data";

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

function activityColor(activity: string) {
  if (activity === "Increasing") return "text-emerald-300/90";
  if (activity === "Stable") return "text-slate-300";
  return "text-rose-300/80";
}

export default function InvestorProfile({ investorId, onClose, variant = "desktop" }: InvestorProfileProps) {
  const isMobile = variant === "mobile";
  const investor = investorId ? INVESTORS.find((i) => i.id === investorId) : null;

  // For demo we always show Meridian-style data when investor is meridian
  // For other investors, derive a plausible profile from their data.
  const isMeridian = investor?.id === "meridian";

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
              : "pointer-events-auto absolute right-6 top-1/2 z-20 w-[420px] -translate-y-1/2"
          }
        >
          <div
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E131C]/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            style={{ padding: isMobile ? 20 : 24 }}
          >
            {/* corner accents */}
            <div className="pointer-events-none absolute left-0 top-0 h-px w-24 bg-gradient-to-r from-amber-200/50 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 h-24 w-px bg-gradient-to-b from-amber-200/30 to-transparent" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-amber-200/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300/80 shadow-[0_0_8px_rgba(232,184,100,0.6)]" />
                  Focused intelligence
                </div>
                <h2 className="mt-2 font-sans text-[22px] font-semibold leading-tight tracking-tight text-slate-50">
                  {investor.name}
                </h2>
                <p className="mt-1 text-[13px] text-slate-400">
                  {investor.type} · {investor.hq}
                </p>
              </div>
              {onClose && !isMobile && (
                <button
                  onClick={onClose}
                  className="rounded-full border border-white/10 bg-white/[0.02] px-2 py-1 text-[10px] text-slate-400 transition-colors hover:text-slate-200"
                  aria-label="Close profile"
                >
                  ESC
                </button>
              )}
            </div>

            {/* Metrics grid */}
            <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02]">
              <Metric
                label="Estimated AUM"
                value={`$${investor.aumB}B`}
                mono
              />
              <Metric
                label="Typical commitment"
                value={`$${investor.typicalCommitmentM[0]}–${investor.typicalCommitmentM[1]}M`}
                mono
              />
              <Metric
                label="Relationship strength"
                value={
                  investor.relationshipScore > 0.85
                    ? "High"
                    : investor.relationshipScore > 0.7
                    ? "Moderate"
                    : "Developing"
                }
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
              <Metric
                label="Geography"
                value={investor.geography}
              />
            </div>

            {/* Strategy allocation */}
            <div className="mt-5">
              <SectionLabel>Strategy allocation</SectionLabel>
              <div className="mt-2.5 space-y-2">
                {(isMeridian ? MERIDIAN_STRATEGY_ALLOCATION : investor.preferredStrategies.map((s, i) => ({
                  strategy: s,
                  pct: Math.round(70 / (i + 1) / (investor.preferredStrategies.length || 1) * 10) / 10,
                }))).map((row, idx, arr) => {
                  const total = arr.reduce((sum, r) => sum + r.pct, 0) || 1;
                  const pct = Math.round((row.pct / total) * 100);
                  return (
                    <div key={row.strategy} className="flex items-center gap-3">
                      <div className="w-28 shrink-0 text-[12px] text-slate-300">{row.strategy}</div>
                      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: 0.1 + idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-amber-200/60 via-amber-200/40 to-amber-200/20"
                        />
                      </div>
                      <div className="w-9 shrink-0 text-right font-mono text-[11px] text-slate-400">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Relationship signals */}
            <div className="mt-5">
              <SectionLabel>Relationship signals</SectionLabel>
              <ul className="mt-2.5 space-y-1.5">
                {(isMeridian ? MERIDIAN_SIGNALS : [
                  `${investor.relationshipScore > 0.8 ? "Strong" : "Moderate"} relationship with ${investor.preferredStrategies[0].toLowerCase()} managers`,
                  `${investor.recentActivity === "Increasing" ? "Increasing" : "Stable"} activity across ${investor.preferredStrategies.length} active strategies`,
                  `Primary concentration in ${investor.geography.toLowerCase()}`,
                ]).slice(0, 4).map((sig) => (
                  <li key={sig} className="flex items-start gap-2 text-[12px] leading-snug text-slate-300">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-300/70" />
                    {sig}
                  </li>
                ))}
              </ul>
            </div>

            {/* Related organisations */}
            <div className="mt-5">
              <SectionLabel>Related organisations</SectionLabel>
              <div className="mt-2.5 space-y-1">
                {(isMeridian ? MERIDIAN_RELATED : INVESTORS
                  .filter((i) => i.id !== investor.id && i.geography === investor.geography)
                  .slice(0, 5)
                  .map((i) => ({
                    name: i.name,
                    type: i.type,
                    strength: (i.relationshipScore > 0.8 ? "Strong" : "Moderate") as "Strong" | "Moderate",
                  }))).map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[12px] text-slate-200">{r.name}</div>
                      <div className="truncate text-[10px] text-slate-500">{r.type}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">{r.strength}</span>
                      <span className={`h-1.5 w-1.5 rounded-full ${strengthColor(r.strength)}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Intelligence summary */}
            <div className="mt-5 rounded-lg border border-amber-200/10 bg-amber-200/[0.03] p-3">
              <SectionLabel>Intelligence summary</SectionLabel>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-300">
                {isMeridian
                  ? MERIDIAN_SUMMARY
                  : `${investor.name} maintains a ${investor.recentActivity.toLowerCase()} profile across ${investor.preferredStrategies.length} private-market strategies, with strongest concentration in ${investor.geography.toLowerCase()} and ${investor.preferredStrategies[0].toLowerCase()}.`}
              </p>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 border-t border-white/[0.04] pt-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
                Illustrative data shown for concept purposes
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
    accent === "amber" ? "text-amber-200" : accent === "green" ? "text-emerald-300" : "text-slate-100";
  return (
    <div className="bg-[#0A0E14]/40 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div
        className={`mt-1 ${mono ? "font-mono" : "font-sans"} text-[15px] font-medium ${valueColor}`}
      >
        {value}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">{children}</div>
  );
}
