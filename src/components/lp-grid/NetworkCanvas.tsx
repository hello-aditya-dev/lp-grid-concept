"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { INVESTORS, RELATIONSHIPS, SELECTED_INVESTOR_ID } from "@/lib/lp-grid/data";
import {
  Dimension,
  computeTargets,
  CLUSTER_LABELS,
} from "@/lib/lp-grid/layouts";

interface NetworkCanvasProps {
  /** Active network dimension — drives target positions. */
  dimension: Dimension;
  /** Whether the focused investor profile is open (pulls selected to centre-left). */
  profileMode: boolean;
  /** Investor currently in focus (defaults to Meridian). */
  selectedId: string;
  /** Called when the visitor taps/clicks an investor node. */
  onSelect?: (id: string) => void;
  /** Honoured by disabling ambient drift and snapping transitions. */
  reducedMotion: boolean;
  /** Compact render mode (fewer labels, simpler physics) — used on small screens. */
  compact?: boolean;
  /** Hide cluster labels (used in profile mode). */
  hideLabels?: boolean;
  className?: string;
}

interface NodePos {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
}

// Institutional premium palette
const COLORS = {
  nodeAmbient: "rgba(150, 162, 188, 0.45)",
  nodeActive: "rgba(195, 207, 232, 0.85)",
  nodeHigh: "rgba(232, 240, 255, 0.95)",
  nodeSelected: "#E8B864",
  nodeSelectedGlow: "rgba(232, 184, 100, 0.35)",
  nodeProfileFade: "rgba(120, 140, 180, 0.20)",
  lineLow: "rgba(120, 140, 180, 0.06)",
  lineMed: "rgba(140, 165, 210, 0.16)",
  lineHigh: "rgba(180, 200, 235, 0.45)",
  lineSelected: "rgba(232, 184, 100, 0.85)",
  label: "rgba(200, 210, 232, 0.70)",
  labelFaint: "rgba(150, 162, 188, 0.40)",
} as const;

const STRATEGY_COLORS: Record<string, string> = {
  "Private equity": "rgba(120, 165, 220, 0.70)",
  "Private credit": "rgba(180, 200, 235, 0.70)",
  Infrastructure: "rgba(232, 184, 100, 0.70)",
  "Real assets": "rgba(170, 180, 200, 0.70)",
  "Venture capital": "rgba(160, 200, 220, 0.70)",
  Secondaries: "rgba(140, 170, 210, 0.70)",
};

export default function NetworkCanvas({
  dimension,
  profileMode,
  selectedId,
  onSelect,
  reducedMotion,
  compact = false,
  hideLabels = false,
  className,
}: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // All mutable per-frame state lives in refs so the RAF loop never re-subscribes
  const positionsRef = useRef<Record<string, NodePos>>({});
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const dimensionRef = useRef<Dimension>(dimension);
  const selectedRef = useRef<string>(selectedId);
  const profileModeRef = useRef<boolean>(profileMode);
  const compactRef = useRef<boolean>(compact);
  const hideLabelsRef = useRef<boolean>(hideLabels);
  const reducedMotionRef = useRef<boolean>(reducedMotion);
  const pausedRef = useRef<boolean>(false);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const hoverRef = useRef<string | null>(null);

  // Sync props into refs on every commit (cheap, no re-subscription)
  useEffect(() => {
    dimensionRef.current = dimension;
    selectedRef.current = selectedId;
    profileModeRef.current = profileMode;
    compactRef.current = compact;
    hideLabelsRef.current = hideLabels;
    reducedMotionRef.current = reducedMotion;
  });

  // Initialise positions once
  useEffect(() => {
    const init = computeTargets("ecosystem", SELECTED_INVESTOR_ID);
    const pos: Record<string, NodePos> = {};
    for (const inv of INVESTORS) {
      const t = init[inv.id];
      pos[inv.id] = { x: t.x, y: t.y, vx: 0, vy: 0, scale: t.scale };
    }
    positionsRef.current = pos;
  }, []);

  // Observe container size
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

  // Pause RAF when tab hidden
  useEffect(() => {
    const onVis = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Pointer move (uses pointer events — works for mouse + touch + pen)
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    pointerRef.current = { x, y, active: true };

    // Hit-test against nodes (cheap O(n) over 60 investors)
    const pos = positionsRef.current;
    let found: string | null = null;
    const minDist = 0.028;
    const minDistSq = minDist * minDist;
    for (const inv of INVESTORS) {
      const p = pos[inv.id];
      if (!p) continue;
      const dx = p.x - x;
      const dy = p.y - y;
      if (dx * dx + dy * dy < minDistSq) {
        found = inv.id;
        break;
      }
    }
    hoverRef.current = found;
    canvas.style.cursor = found ? "pointer" : "default";
  }, []);

  const handlePointerLeave = useCallback(() => {
    pointerRef.current = { x: 0, y: 0, active: false };
    hoverRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = "default";
  }, []);

  const handlePointerDown = useCallback(() => {
    const hovered = hoverRef.current;
    if (hovered && onSelect) {
      onSelect(hovered);
    }
  }, [onSelect]);

  // Main render loop — single subscription, lives for the component's lifetime
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0 || size.h === 0) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Cap DPR at 2 — beyond that, gains are invisible and GPU cost rises sharply
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const prevWidth = canvas.width;
    const prevHeight = canvas.height;
    const newWidth = Math.max(1, Math.floor(size.w * dpr));
    const newHeight = Math.max(1, Math.floor(size.h * dpr));
    if (prevWidth !== newWidth || prevHeight !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const render = (now: number) => {
      const dt = lastTimeRef.current ? Math.min(0.05, (now - lastTimeRef.current) / 1000) : 0;
      lastTimeRef.current = now;

      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const rm = reducedMotionRef.current;
      const isCompact = compactRef.current;
      const isProfile = profileModeRef.current;
      const sel = selectedRef.current;
      const dim = dimensionRef.current;
      const pointer = pointerRef.current;
      const hovered = hoverRef.current;
      const targets = computeTargets(dim, sel);
      const positions = positionsRef.current;

      // Spring interpolation — heavier when reduced motion (snap to target)
      const springK = rm ? 0.35 : isCompact ? 0.07 : 0.05;
      const damping = rm ? 0.5 : 0.82;

      for (const inv of INVESTORS) {
        const p = positions[inv.id];
        const t = targets[inv.id];
        if (!p || !t) continue;

        let tx = t.x;
        let ty = t.y;
        let tScale = t.scale;

        if (isProfile) {
          if (inv.id === sel) {
            tx = isCompact ? 0.5 : 0.32;
            ty = 0.5;
            tScale = 2.4;
          } else {
            const h1 = Math.sin(inv.id.charCodeAt(0) + 1) * 0.5;
            const h2 = Math.cos(inv.id.charCodeAt(1) || 0) * 0.5;
            tx = isCompact ? 1.1 : 0.92 + h1 * 0.08;
            ty = 0.5 + h2 * 0.4;
            tScale = 0.4;
          }
        } else if (!rm) {
          // Subtle pointer attraction on fine-pointer devices (skipped on compact/mobile)
          if (pointer.active && !isCompact) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < 0.0144 && distSq > 0.000001) {
              const dist = Math.sqrt(distSq);
              const force = (0.12 - dist) * 0.015;
              p.vx += (dx / dist) * force * 0.3;
              p.vy += (dy / dist) * force * 0.3;
            }
          }
          // Ambient drift
          const h1 = Math.sin(now * 0.0002 + inv.id.charCodeAt(0)) * 0.0008;
          const h2 = Math.cos(now * 0.00025 + (inv.id.charCodeAt(1) || 0) * 0.3) * 0.0008;
          p.vx += h1;
          p.vy += h2;
        }

        const ax = (tx - p.x) * springK;
        const ay = (ty - p.y) * springK;
        p.vx = (p.vx + ax) * damping;
        p.vy = (p.vy + ay) * damping;
        p.x += p.vx;
        p.y += p.vy;
        p.scale += (tScale - p.scale) * Math.min(1, dt * 6);
      }

      // ---------- Draw ----------
      ctx.clearRect(0, 0, size.w, size.h);

      const w = size.w;
      const h = size.h;
      const baseRadius = Math.min(w, h) * (isCompact ? 0.018 : 0.012);
      const sx = (nx: number) => nx * w;
      const sy = (ny: number) => ny * h;

      // Cluster labels
      if (!isProfile && !hideLabelsRef.current && !isCompact) {
        const labels = CLUSTER_LABELS[dim];
        for (const lab of labels) {
          let lx = 0;
          let ly = 0;
          if (dim === "geography") {
            const centers: Record<string, { x: number; y: number }> = {
              "North America": { x: 0.28, y: 0.18 },
              Europe: { x: 0.52, y: 0.16 },
              "Middle East": { x: 0.58, y: 0.74 },
              "Asia-Pacific": { x: 0.82, y: 0.7 },
            };
            const c = centers[lab.label];
            if (c) {
              lx = sx(c.x);
              ly = sy(c.y);
            }
          } else if (dim === "strategy") {
            const centers: Record<string, { x: number; y: number }> = {
              "Private equity": { x: 0.5, y: 0.1 },
              "Private credit": { x: 0.86, y: 0.24 },
              Infrastructure: { x: 0.93, y: 0.55 },
              "Real assets": { x: 0.78, y: 0.88 },
              "Venture capital": { x: 0.16, y: 0.24 },
              Secondaries: { x: 0.08, y: 0.7 },
            };
            const c = centers[lab.label];
            if (c) {
              lx = sx(c.x);
              ly = sy(c.y);
            }
          } else if (dim === "allocation") {
            const map: Record<string, number> = {
              "Under $25M": 0.1,
              "$25M–$100M": 0.36,
              "$100M–$500M": 0.64,
              "$500M+": 0.9,
            };
            const x = map[lab.label];
            if (x !== undefined) {
              lx = sx(x);
              ly = sy(0.95);
            }
          } else if (dim === "relationships") {
            lx = sx(0.5);
            ly = sy(0.18);
          }
          ctx.font = "500 11px var(--font-geist-sans), system-ui, sans-serif";
          ctx.fillStyle = COLORS.label;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(lab.label.toUpperCase(), lx, ly);
          if (lab.sublabel) {
            ctx.font = "400 10px var(--font-geist-mono), monospace";
            ctx.fillStyle = COLORS.labelFaint;
            ctx.fillText(lab.sublabel, lx, ly + 14);
          }
        }
      }

      // Relationship lines
      const relOpacityMul = dim === "relationships" ? 1 : 0.85;
      for (const r of RELATIONSHIPS) {
        const a = positions[r.a];
        const b = positions[r.b];
        if (!a || !b) continue;

        const involvesSel = r.a === sel || r.b === sel;
        let strokeStyle: string;
        let lineWidth: number;

        if (isProfile) {
          if (!involvesSel) continue;
          strokeStyle = COLORS.lineSelected;
          lineWidth = 1.2;
        } else if (dim === "relationships") {
          if (involvesSel) {
            strokeStyle = COLORS.lineSelected;
            lineWidth = 1.1;
          } else if (r.strength > 0.7) {
            strokeStyle = COLORS.lineHigh;
            lineWidth = 0.6;
          } else {
            strokeStyle = COLORS.lineLow;
            lineWidth = 0.4;
          }
        } else {
          if (r.strength > 0.7) {
            strokeStyle = COLORS.lineMed;
            lineWidth = 0.7;
          } else if (r.strength > 0.5) {
            strokeStyle = COLORS.lineLow;
            lineWidth = 0.5;
          } else {
            strokeStyle = COLORS.lineLow;
            lineWidth = 0.3;
          }
        }
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth * relOpacityMul;
        ctx.beginPath();
        ctx.moveTo(sx(a.x), sy(a.y));
        ctx.lineTo(sx(b.x), sy(b.y));
        ctx.stroke();
      }

      // Nodes
      for (const inv of INVESTORS) {
        const p = positions[inv.id];
        if (!p) continue;
        const x = sx(p.x);
        const y = sy(p.y);
        let radius = baseRadius * p.scale;

        const isSelected = inv.id === sel;
        const isHovered = inv.id === hovered;

        if (isSelected && (isProfile || dim === "relationships")) {
          const glowR = radius * 6;
          const g = ctx.createRadialGradient(x, y, 0, x, y, glowR);
          g.addColorStop(0, COLORS.nodeSelectedGlow);
          g.addColorStop(1, "rgba(232, 184, 100, 0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, glowR, 0, Math.PI * 2);
          ctx.fill();
        }

        let fill: string;
        if (isSelected) {
          fill = COLORS.nodeSelected;
        } else if (dim === "strategy") {
          fill = STRATEGY_COLORS[inv.preferredStrategies[0]] ?? COLORS.nodeActive;
        } else if (isProfile) {
          fill = COLORS.nodeProfileFade;
        } else if (inv.priority === "high") {
          fill = COLORS.nodeHigh;
        } else if (inv.priority === "active") {
          fill = COLORS.nodeActive;
        } else {
          fill = COLORS.nodeAmbient;
        }

        if (isHovered && !isSelected) {
          ctx.strokeStyle = "rgba(180, 200, 235, 0.5)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
          ctx.stroke();
          radius *= 1.15;
        }

        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        if (isSelected || inv.priority === "high") {
          ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
          ctx.beginPath();
          ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Hovered node label tooltip
      if (hovered && !isProfile) {
        const inv = INVESTORS.find((i) => i.id === hovered);
        const p = positions[hovered];
        if (inv && p) {
          const x = sx(p.x);
          const y = sy(p.y);
          const label = inv.name;
          ctx.font = "500 12px var(--font-geist-sans), system-ui, sans-serif";
          const tw = ctx.measureText(label).width;
          const padX = 10;
          const boxW = tw + padX * 2;
          const boxH = 24;
          const bx = x + 14;
          const by = y - boxH / 2;
          ctx.fillStyle = "rgba(10, 14, 20, 0.92)";
          ctx.strokeStyle = "rgba(180, 200, 235, 0.25)";
          ctx.lineWidth = 1;
          roundRect(ctx, bx, by, boxW, boxH, 4);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "rgba(232, 240, 255, 0.95)";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(label, bx + padX, y);
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        role="img"
        aria-label={`LP Grid interactive network visualising 60 fictional institutional investors organised by ${dimension}.`}
        aria-describedby="lp-grid-network-description"
        style={{ width: "100%", height: "100%", display: "block", touchAction: "pan-y" }}
      />
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
