"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Dimension } from "@/lib/lp-grid/layouts";

export interface Chapter {
  index: string;
  dimension: Dimension | "profile";
  title: string;
  copy: string;
}

export const CHAPTERS: Chapter[] = [
  {
    index: "01",
    dimension: "ecosystem",
    title: "The ecosystem",
    copy: "Start with the wider institutional landscape and the relationships connecting it.",
  },
  {
    index: "02",
    dimension: "geography",
    title: "Geography",
    copy: "Reveal where capital is concentrated across North America, Europe, the Middle East and Asia-Pacific.",
  },
  {
    index: "03",
    dimension: "strategy",
    title: "Strategy",
    copy: "Reorganise investors by the private-market strategies shaping their allocation decisions.",
  },
  {
    index: "04",
    dimension: "allocation",
    title: "Allocation",
    copy: "Compare typical commitment size and identify institutions capable of deploying meaningful capital.",
  },
  {
    index: "05",
    dimension: "relationships",
    title: "Relationships",
    copy: "Bring the strongest connections, shared strategies and institutional proximity into focus.",
  },
  {
    index: "06",
    dimension: "profile",
    title: "Investor intelligence",
    copy: "Move from the wider market into one institution’s allocation behaviour, activity and relationship signals.",
  },
];

interface ChapterCopyProps {
  activeIndex: number; // 0..5
  profileMode: boolean;
}

export default function ChapterCopy({ activeIndex, profileMode }: ChapterCopyProps) {
  const chapter = CHAPTERS[activeIndex] ?? CHAPTERS[0];

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="relative w-full max-w-md"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={chapter.index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-amber-300/80 shadow-[0_0_6px_rgba(232,184,100,0.7)]"
            />
            <span className="font-mono text-[11px] tracking-[0.18em] text-amber-200/70">
              {profileMode ? "CHAPTER 06 · INVESTOR INTELLIGENCE" : `CHAPTER ${chapter.index}`}
            </span>
          </div>

          {/* Title */}
          <h2 className="mt-3 font-sans text-[32px] font-semibold leading-[1.08] tracking-[-0.02em] text-slate-50 sm:text-[40px] md:text-[44px]">
            {chapter.title}
          </h2>

          {/* Copy */}
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-slate-400 sm:text-[15px]">
            {chapter.copy}
          </p>

          {/* Progress dots (subtle indicator) */}
          <div
            aria-hidden="true"
            className="mt-6 flex items-center gap-1.5"
          >
            {CHAPTERS.map((c, i) => (
              <span
                key={c.index}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === activeIndex
                    ? "w-6 bg-amber-300/80"
                    : i < activeIndex
                    ? "w-3 bg-slate-500"
                    : "w-3 bg-slate-700"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
