"use client";

import { Dimension } from "@/lib/lp-grid/layouts";
import { cn } from "@/lib/utils";

interface DimensionControlProps {
  dimension: Dimension;
  onChange: (d: Dimension) => void;
  className?: string;
  variant?: "horizontal" | "vertical";
}

const DIMENSIONS: { id: Dimension; label: string; index: string }[] = [
  { id: "ecosystem", label: "Ecosystem", index: "01" },
  { id: "geography", label: "Geography", index: "02" },
  { id: "strategy", label: "Strategy", index: "03" },
  { id: "allocation", label: "Allocation", index: "04" },
  { id: "relationships", label: "Relationships", index: "05" },
];

export default function DimensionControl({
  dimension,
  onChange,
  className,
  variant = "horizontal",
}: DimensionControlProps) {
  const isVertical = variant === "vertical";
  return (
    <div
      className={cn(
        "inline-flex items-stretch gap-px rounded-full border border-white/8 bg-white/[0.02] p-1 backdrop-blur-md",
        isVertical && "flex-col",
        className,
      )}
      role="tablist"
      aria-label="Network dimension selector"
    >
      {DIMENSIONS.map((d) => {
        const active = dimension === d.id;
        return (
          <button
            key={d.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(d.id)}
            className={cn(
              "group relative flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-medium tracking-wide transition-all duration-300",
              active
                ? "bg-amber-200/10 text-amber-100 shadow-[0_0_0_1px_rgba(232,184,100,0.18)]"
                : "text-slate-400 hover:text-slate-200",
            )}
          >
            <span
              className={cn(
                "font-mono text-[10px] tracking-wider transition-opacity",
                active ? "text-amber-200/70 opacity-100" : "text-slate-500 opacity-60 group-hover:opacity-100",
              )}
            >
              {d.index}
            </span>
            <span>{d.label}</span>
            {active && (
              <span className="absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-amber-200/60" />
            )}
          </button>
        );
      })}
    </div>
  );
}
