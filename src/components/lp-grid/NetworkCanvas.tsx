"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { INVESTORS, RELATIONSHIPS, SELECTED_INVESTOR_ID } from "@/lib/lp-grid/data";
import {
  Dimension,
  computeTargets,
  relStrengthTo,
  CLUSTER_LABELS,
  totalRelationshipCount,
} from "@/lib/lp-grid/layouts";

interface NetworkCanvasProps {
  dimension: Dimension;
  selectedId: string;
  onSelect?: (id: string) => void;
  reducedMotion: boolean;
  /** When true, the canvas is in "profile transition" mode: selected node is enlarged,
   *  network pulls toward left, relationships to selected fade in highlighted. */
  profileMode: boolean;
  /** Compact layout for mobile */
  compact?: boolean;
  className?: string;
  /** Force-hide cluster labels (used in profile mode) */
  hideLabels?: boolean;
}

interface NodePos {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  targetScale: number;
}

// Color palette (institutional premium)
const COLORS = {
  bg: "#0A0E14",
  nodeAmbient: "rgba(150, 162, 188, 0.45)",
  nodeActive: "rgba(195, 207, 232, 0.85)",
  nodeHigh: "rgba(232, 240, 255, 0.95)",
  nodeSelected: "#E8B864", // soft amber for the selected investor
  nodeSelectedGlow: "rgba(232, 184, 100, 0.35)",
  lineLow: "rgba(120, 140, 180, 0.06)",
  lineMed: "rgba(140, 165, 210, 0.16)",
  lineHigh: "rgba(180, 200, 235, 0.45)",
  lineSelected: "rgba(232, 184, 100, 0.85)",
  lineSelectedSubtle: "rgba(232, 184, 100, 0.35)",
  accent: "#4DA3FF",
  label: "rgba(200, 210, 232, 0.7)",
  labelFaint: "rgba(150, 162, 188, 0.4)",
};

const STRATEGY_COLORS: Record<string, string> = {
  "Private equity": "rgba(120, 165, 220, 0.7)",
  "Private credit": "rgba(180, 200, 235, 0.7)",
  Infrastructure: "rgba(232, 184, 100, 0.7)",
  "Real assets": "rgba(170, 180, 200, 0.7)",
  "Venture capital": "rgba(160, 200, 220, 0.7)",
  Secondaries: "rgba(140, 170, 210, 0.7)",
};

export default function NetworkCanvas({
  dimension,
  selectedId,
  onSelect,
  reducedMotion,
  profileMode,
  compact = false,
  className,
  hideLabels = false,
}: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);

  // Persistent node positions (spring interpolation happens in RAF loop)
  const positionsRef = useRef<Record<string, NodePos>>({});
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const dimensionRef = useRef<Dimension>(dimension);
  const selectedRef = useRef<string>(selectedId);
  const profileModeRef = useRef<boolean>(profileMode);
  const compactRef = useRef<boolean>(compact);
  const hoveredRef = useRef<string | null>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const pausedRef = useRef<boolean>(false);

  // Sync latest props/state into refs (must be in useEffect, not during render)
  useEffect(() => {
    dimensionRef.current = dimension;
    selectedRef.current = selectedId;
    profileModeRef.current = profileMode;
    compactRef.current = compact;
    hoveredRef.current = hoveredNode;
    mouseRef.current = mouse;
  });

  // Initialize positions
  useEffect(() => {
    const init = computeTargets("ecosystem", SELECTED_INVESTOR_ID);
    const pos: Record<string, NodePos> = {};
    for (const inv of INVESTORS) {
      const t = init[inv.id];
      pos[inv.id] = { x: t.x, y: t.y, vx: 0, vy: 0, scale: t.scale, targetScale: t.scale };
    }
    positionsRef.current = pos;
  }, []);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        const h = e.contentRect.height;
        setSize({ w, h });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Pause on tab hidden
  useEffect(() => {
    const onVis = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Mouse interaction
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMouse({ x, y });
      // hit-test
      const pos = positionsRef.current;
      let found: string | null = null;
      const minDist = 0.025;
      for (const inv of INVESTORS) {
        const p = pos[inv.id];
        if (!p) continue;
        const dx = p.x - x;
        const dy = p.y - y;
        if (dx * dx + dy * dy < minDist * minDist) {
          found = inv.id;
          break;
        }
      }
      setHoveredNode(found);
      if (canvas) canvas.style.cursor = found ? "pointer" : "default";
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setMouse(null);
    setHoveredNode(null);
  }, []);

  const handleClick = useCallback(() => {
    if (hoveredNode && onSelect) {
      onSelect(hoveredNode);
    }
  }, [hoveredNode, onSelect]);

  // RAF animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0 || size.h === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    ctx.scale(dpr, dpr);

    const totalRels = Math.round(totalRelationshipCount());

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - (lastTimeRef.current || now)) / 1000);
      lastTimeRef.current = now;

      if (!pausedRef.current) {
        const targets = computeTargets(
          dimensionRef.current,
          selectedRef.current,
        );

        const positions = positionsRef.current;
        const isProfile = profileModeRef.current;
        const isCompact = compactRef.current;
        const sel = selectedRef.current;
        const hovered = hoveredRef.current;
        const mouse = mouseRef.current;

        // Spring interpolation toward target
        const springK = reducedMotion ? 1 : isCompact ? 0.07 : 0.05;
        const damping = 0.82;

        for (const inv of INVESTORS) {
          const p = positions[inv.id];
          const t = targets[inv.id];
          if (!p || !t) continue;

          let tx = t.x;
          let ty = t.y;
          let tScale = t.scale;

          // In profile mode: pull selected to center-left, others to right edge
          if (isProfile) {
            if (inv.id === sel) {
              tx = isCompact ? 0.5 : 0.32;
              ty = 0.5;
              tScale = 2.4;
            } else {
              // collapse others off to the right with slight scatter
              const h1 = Math.sin(inv.id.charCodeAt(0) + 1) * 0.5;
              const h2 = Math.cos(inv.id.charCodeAt(1) || 0) * 0.5;
              tx = isCompact ? 1.1 : 0.92 + h1 * 0.08;
              ty = 0.5 + h2 * 0.4;
              tScale = 0.4;
            }
          } else {
            // Subtle mouse attraction for non-selected nodes (desktop only)
            if (mouse && !isCompact && !reducedMotion) {
              const dx = p.x - mouse.x;
              const dy = p.y - mouse.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 0.12 && dist > 0.001) {
                const force = (0.12 - dist) * 0.015;
                p.vx += (dx / dist) * force * 0.3;
                p.vy += (dy / dist) * force * 0.3;
              }
            }
            // ambient drift
            if (!reducedMotion) {
              const h1 = Math.sin(now * 0.0002 + inv.id.charCodeAt(0)) * 0.0008;
              const h2 = Math.cos(now * 0.00025 + inv.id.charCodeAt(1) * 0.3) * 0.0008;
              p.vx += h1;
              p.vy += h2;
            }
          }

          // spring toward target
          const ax = (tx - p.x) * springK;
          const ay = (ty - p.y) * springK;
          p.vx = (p.vx + ax) * damping;
          p.vy = (p.vy + ay) * damping;
          p.x += p.vx;
          p.y += p.vy;
          // scale interpolation
          p.scale += (tScale - p.scale) * Math.min(1, dt * 6);
        }

        // Draw
        ctx.clearRect(0, 0, size.w, size.h);

        const w = size.w;
        const h = size.h;
        const baseRadius = Math.min(w, h) * (isCompact ? 0.018 : 0.012);

        // Helper to get screen pos
        const sx = (nx: number) => nx * w;
        const sy = (ny: number) => ny * h;

        // Draw cluster labels (except in profile mode or when hidden)
        if (!isProfile && !hideLabels && !isCompact) {
          const labels = CLUSTER_LABELS[dimensionRef.current];
          for (const lab of labels) {
            let lx = 0, ly = 0;
            if (dimensionRef.current === "geography") {
              const centers: Record<string, { x: number; y: number }> = {
                "North America": { x: 0.28, y: 0.18 },
                Europe: { x: 0.52, y: 0.16 },
                "Middle East": { x: 0.58, y: 0.74 },
                "Asia-Pacific": { x: 0.82, y: 0.7 },
              };
              const c = centers[lab.label];
              if (c) { lx = sx(c.x); ly = sy(c.y); }
            } else if (dimensionRef.current === "strategy") {
              const centers: Record<string, { x: number; y: number }> = {
                "Private equity": { x: 0.5, y: 0.1 },
                "Private credit": { x: 0.86, y: 0.24 },
                Infrastructure: { x: 0.93, y: 0.55 },
                "Real assets": { x: 0.78, y: 0.88 },
                "Venture capital": { x: 0.16, y: 0.24 },
                Secondaries: { x: 0.08, y: 0.7 },
              };
              const c = centers[lab.label];
              if (c) { lx = sx(c.x); ly = sy(c.y); }
            } else if (dimensionRef.current === "allocation") {
              const map: Record<string, number> = {
                "Under $25M": 0.1,
                "$25M–$100M": 0.36,
                "$100M–$500M": 0.64,
                "$500M+": 0.9,
              };
              const x = map[lab.label];
              if (x !== undefined) { lx = sx(x); ly = sy(0.95); }
            } else if (dimensionRef.current === "relationships") {
              lx = sx(0.5); ly = sy(0.18);
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

        // Draw relationship lines
        const showAll = !isProfile;
        const dim = dimensionRef.current;
        const relOpacityMul = dim === "relationships" ? 1 : 0.85;

        for (const r of RELATIONSHIPS) {
          const a = positions[r.a];
          const b = positions[r.b];
          if (!a || !b) continue;

          // In relationships mode or profile mode, only lines involving the selected are emphasized
          const involvesSel = r.a === sel || r.b === sel;
          let strokeStyle: string;
          let lineWidth: number;

          if (isProfile) {
            if (involvesSel) {
              strokeStyle = COLORS.lineSelected;
              lineWidth = 1.2;
            } else {
              continue; // skip others in profile mode
            }
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

        // Draw nodes
        for (const inv of INVESTORS) {
          const p = positions[inv.id];
          if (!p) continue;
          const x = sx(p.x);
          const y = sy(p.y);
          let radius = baseRadius * p.scale;

          const isSelected = inv.id === sel;
          const isHovered = inv.id === hovered;

          // Outer glow for selected
          if (isSelected && (isProfile || dim === "relationships")) {
            const g = ctx.createRadialGradient(x, y, 0, x, y, radius * 6);
            g.addColorStop(0, COLORS.nodeSelectedGlow);
            g.addColorStop(1, "rgba(232, 184, 100, 0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(x, y, radius * 6, 0, Math.PI * 2);
            ctx.fill();
          }

          // Node fill
          let fill: string;
          if (isSelected) {
            fill = COLORS.nodeSelected;
          } else if (dim === "strategy") {
            fill = STRATEGY_COLORS[inv.preferredStrategies[0]] ?? COLORS.nodeActive;
          } else if (isProfile) {
            fill = "rgba(120, 140, 180, 0.2)";
          } else if (inv.priority === "high") {
            fill = COLORS.nodeHigh;
          } else if (inv.priority === "active") {
            fill = COLORS.nodeActive;
          } else {
            fill = COLORS.nodeAmbient;
          }

          // Hover ring
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

          // Inner highlight for high/selected
          if (isSelected || inv.priority === "high") {
            ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
            ctx.beginPath();
            ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.35, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Hovered node label
        if (hovered && !isProfile) {
          const inv = INVESTORS.find((i) => i.id === hovered);
          const p = positions[hovered];
          if (inv && p) {
            const x = sx(p.x);
            const y = sy(p.y);
            const label = inv.name;
            ctx.font = "500 12px var(--font-geist-sans), system-ui, sans-serif";
            const tw = ctx.measureText(label).width;
            const padX = 10, padY = 6;
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
      }
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, reducedMotion]);

  return (
    <div ref={containerRef} className={className} style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ width: "100%", height: "100%", display: "block" }}
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
