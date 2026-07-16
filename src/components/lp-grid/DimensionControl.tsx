"use client";

import { useRef, type KeyboardEvent } from "react";
import { Dimension } from "@/lib/lp-grid/layouts";
import { cn } from "@/lib/utils";

interface DimensionControlProps {
  dimension: Dimension;
  onChange: (d: Dimension) => void;
  className?: string;
}

export const DIMENSIONS: { id: Dimension; label: string; index: string }[] = [
  { id: "ecosystem", label: "Ecosystem", index: "01" },
  { id: "geography", label: "Geography", index: "02" },
  { id: "strategy", label: "Strategy", index: "03" },
  { id: "allocation", label: "Allocation", index: "04" },
  { id: "relationships", label: "Relationships", index: "05" },
];

/**
 * Two presentation modes share one accessible control:
 * - Desktop (md+): full segmented bar with all five labels visible
 * - Mobile (<md): compact "01 ● ○ ○ ○ ○ Ecosystem" — fits 320px without overflow
 *
 * Keyboard:
 *   ArrowLeft / ArrowUp   → previous chapter
 *   ArrowRight / ArrowDown → next chapter
 *   Home                  → first chapter
 *   End                   → last chapter
 *   Enter / Space         → activate focused chapter
 */
export default function DimensionControl({
  dimension,
  onChange,
  className,
}: DimensionControlProps) {
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = DIMENSIONS.findIndex((d) => d.id === dimension);

  const focusTab = (idx: number) => {
    const clamped = Math.max(0, Math.min(DIMENSIONS.length - 1, idx));
    const target = buttonsRef.current[clamped];
    if (target) {
      target.focus();
      // Per WAI-ARIA tabs pattern: arrow keys move focus AND activate the tab
      onChange(DIMENSIONS[clamped].id);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        focusTab(activeIndex + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        focusTab(activeIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        focusTab(0);
        break;
      case "End":
        e.preventDefault();
        focusTab(DIMENSIONS.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onChange(DIMENSIONS[activeIndex].id);
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* ---------- Desktop: full segmented bar ---------- */}
      <div
        role="tablist"
        aria-label="Network dimension chapters"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className={cn(
          "hidden md:inline-flex items-stretch gap-px rounded-full border border-white/10 bg-white/[0.02] p-1 backdrop-blur-md",
          className,
        )}
      >
        {DIMENSIONS.map((d, i) => {
          const active = dimension === d.id;
          return (
            <button
              key={d.id}
              ref={(el) => {
                buttonsRef.current[i] = el;
              }}
              role="tab"
              type="button"
              tabIndex={active ? 0 : -1}
              aria-selected={active}
              aria-controls="lp-grid-network"
              onClick={() => onChange(d.id)}
              className={cn(
                "group relative flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-medium tracking-wide transition-colors duration-300 min-h-[36px]",
                active
                  ? "bg-amber-200/10 text-amber-100 shadow-[0_0_0_1px_rgba(232,184,100,0.18)]"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[10px] tracking-wider transition-opacity",
                  active
                    ? "text-amber-200/70 opacity-100"
                    : "text-slate-500 opacity-60 group-hover:opacity-100",
                )}
              >
                {d.index}
              </span>
              <span>{d.label}</span>
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-amber-200/60"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ---------- Mobile: compact "01 ● ○ ○ ○ ○ Label" ---------- */}
      <div
        role="tablist"
        aria-label="Network dimension chapters"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className={cn(
          "flex md:hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.02] px-3 py-2 backdrop-blur-md min-h-[44px]",
          className,
        )}
      >
        <span className="font-mono text-[11px] tracking-wider text-amber-200/80 tabular-nums">
          {DIMENSIONS[activeIndex]?.index ?? "01"}
        </span>
        <div className="flex items-center gap-1.5">
          {DIMENSIONS.map((d, i) => {
            const active = dimension === d.id;
            return (
              <button
                key={d.id}
                ref={(el) => {
                  buttonsRef.current[i] = el;
                }}
                role="tab"
                type="button"
                tabIndex={active ? 0 : -1}
                aria-selected={active}
                aria-controls="lp-grid-network"
                aria-label={`${d.index} ${d.label}${active ? " (current)" : ""}`}
                onClick={() => onChange(d.id)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-300 min-h-[16px] min-w-[16px] flex items-center justify-center",
                )}
              >
                <span
                  className={cn(
                    "block rounded-full transition-all duration-300",
                    active
                      ? "h-2 w-2 bg-amber-300 shadow-[0_0_8px_rgba(232,184,100,0.6)]"
                      : "h-1.5 w-1.5 bg-slate-600 group-hover:bg-slate-400",
                  )}
                />
              </button>
            );
          })}
        </div>
        <span className="text-[12px] font-medium text-slate-200 tabular-nums">
          {DIMENSIONS[activeIndex]?.label ?? "Ecosystem"}
        </span>
      </div>
    </>
  );
}
