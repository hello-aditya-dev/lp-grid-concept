// LP Grid — Layout engine
// Computes target (x, y) positions for each investor based on the active dimension.
// All positions are in normalized canvas space [0..1], scaled by the renderer.

import { Investor, Strategy, Geography, SELECTED_INVESTOR_ID, INVESTORS } from "./data";

export type Dimension = "ecosystem" | "geography" | "strategy" | "allocation" | "relationships";

// Stable pseudo-random based on string hash so ecosystem layout is deterministic
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

const GEOGRAPHY_CENTERS: Record<Geography, { x: number; y: number }> = {
  "North America": { x: 0.28, y: 0.32 },
  Europe: { x: 0.52, y: 0.3 },
  "Middle East": { x: 0.58, y: 0.58 },
  "Asia-Pacific": { x: 0.8, y: 0.5 },
};

const STRATEGY_CENTERS: Record<Strategy, { x: number; y: number }> = {
  "Private equity": { x: 0.5, y: 0.22 },
  "Private credit": { x: 0.78, y: 0.32 },
  Infrastructure: { x: 0.85, y: 0.55 },
  "Real assets": { x: 0.72, y: 0.78 },
  "Venture capital": { x: 0.28, y: 0.32 },
  Secondaries: { x: 0.2, y: 0.65 },
};

export interface NodeTarget {
  x: number;
  y: number;
  // relative scale factor (1 = default)
  scale: number;
}

// Pre-compute stable ecosystem positions per investor (sunflower/phyllotaxis for order)
const ECOSYSTEM_POS: Record<string, { x: number; y: number }> = (() => {
  const map: Record<string, { x: number; y: number }> = {};
  const n = INVESTORS.length;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  INVESTORS.forEach((inv, i) => {
    const r = Math.sqrt((i + 0.5) / n) * 0.42;
    const theta = i * goldenAngle;
    map[inv.id] = {
      x: 0.5 + r * Math.cos(theta),
      y: 0.5 + r * Math.sin(theta) * 0.85, // squashed to fit wide aspect
    };
  });
  return map;
})();

export function computeTargets(
  dimension: Dimension,
  selectedId: string | null,
): Record<string, NodeTarget> {
  const out: Record<string, NodeTarget> = {};
  const sel = selectedId ?? SELECTED_INVESTOR_ID;

  for (const inv of INVESTORS) {
    if (dimension === "ecosystem") {
      const p = ECOSYSTEM_POS[inv.id];
      out[inv.id] = { x: p.x, y: p.y, scale: priorityScale(inv.priority) };
    } else if (dimension === "geography") {
      const c = GEOGRAPHY_CENTERS[inv.geography];
      // jitter within cluster using deterministic hash
      const h1 = hash(inv.id + "g1");
      const h2 = hash(inv.id + "g2");
      out[inv.id] = {
        x: c.x + (h1 - 0.5) * 0.18,
        y: c.y + (h2 - 0.5) * 0.18,
        scale: priorityScale(inv.priority),
      };
    } else if (dimension === "strategy") {
      // pick first preferred strategy as anchor
      const strat = inv.preferredStrategies[0];
      const c = STRATEGY_CENTERS[strat];
      const h1 = hash(inv.id + "s1");
      const h2 = hash(inv.id + "s2");
      out[inv.id] = {
        x: c.x + (h1 - 0.5) * 0.16,
        y: c.y + (h2 - 0.5) * 0.16,
        scale: priorityScale(inv.priority),
      };
    } else if (dimension === "allocation") {
      // horizontal axis = allocation size, vertical = slight curve
      const aum = inv.aumB;
      // log scale: 1B -> 0.08, 250B -> 0.92
      const t = Math.min(1, Math.max(0, (Math.log(aum) - Math.log(1)) / (Math.log(250) - Math.log(1))));
      const h2 = hash(inv.id + "a2");
      out[inv.id] = {
        x: 0.08 + t * 0.84,
        y: 0.5 + (h2 - 0.5) * 0.7,
        scale: allocationScale(aum),
      };
    } else {
      // relationships: radial around selected
      if (inv.id === sel) {
        out[inv.id] = { x: 0.5, y: 0.5, scale: 1.6 };
      } else {
        // find best strength to selected
        const strength = relStrengthTo(inv.id, sel);
        const angle = hash(inv.id + "r1") * Math.PI * 2;
        const radius = Math.max(0.12, 0.45 - strength * 0.42);
        out[inv.id] = {
          x: 0.5 + Math.cos(angle) * radius,
          y: 0.5 + Math.sin(angle) * radius * 0.85,
          scale: 0.6 + strength * 0.6,
        };
      }
    }
  }
  return out;
}

function priorityScale(p: Investor["priority"]): number {
  if (p === "high") return 1.15;
  if (p === "active") return 0.9;
  return 0.65;
}

function allocationScale(aumB: number): number {
  if (aumB >= 100) return 1.3;
  if (aumB >= 30) return 1.0;
  if (aumB >= 10) return 0.8;
  return 0.6;
}

// Compute strength between any investor and the selected one
const REL_INDEX: Record<string, Record<string, number>> = (() => {
  const idx: Record<string, Record<string, number>> = {};
  // lazy import — actually we already exported RELATIONSHIPS, but to avoid cycle we rebuild here
  // Use the same logic as data.ts via INVESTORS for determinism
  for (let i = 0; i < INVESTORS.length; i++) {
    for (let j = i + 1; j < INVESTORS.length; j++) {
      const a = INVESTORS[i];
      const b = INVESTORS[j];
      let strength = 0;
      if (a.geography === b.geography) strength += 0.18;
      const shared = a.preferredStrategies.filter((s) => b.preferredStrategies.includes(s)).length;
      strength += shared * 0.12;
      strength += (a.relationshipScore + b.relationshipScore) * 0.18;
      if (a.priority === "ambient" && b.priority === "ambient") strength *= 0.6;
      strength = Math.min(1, strength);
      if (strength > 0.32) {
        if (!idx[a.id]) idx[a.id] = {};
        if (!idx[b.id]) idx[b.id] = {};
        idx[a.id][b.id] = strength;
        idx[b.id][a.id] = strength;
      }
    }
  }
  return idx;
})();

export function relStrengthTo(aId: string, bId: string): number {
  if (aId === bId) return 1;
  return REL_INDEX[aId]?.[bId] ?? 0;
}

export function getRelationships(aId: string, bId: string): number {
  return relStrengthTo(aId, bId);
}

export const CLUSTER_LABELS: Record<Dimension, { label: string; sublabel?: string }[]> = {
  ecosystem: [],
  geography: [
    { label: "North America", sublabel: "21 institutions" },
    { label: "Europe", sublabel: "19 institutions" },
    { label: "Middle East", sublabel: "6 institutions" },
    { label: "Asia-Pacific", sublabel: "14 institutions" },
  ],
  strategy: [
    { label: "Private equity" },
    { label: "Private credit" },
    { label: "Infrastructure" },
    { label: "Real assets" },
    { label: "Venture capital" },
    { label: "Secondaries" },
  ],
  allocation: [
    { label: "Under $25M", sublabel: "small commitments" },
    { label: "$25M–$100M", sublabel: "mid commitments" },
    { label: "$100M–$500M", sublabel: "large commitments" },
    { label: "$500M+", sublabel: "flagship mandates" },
  ],
  relationships: [
    { label: "Relationship strength", sublabel: "focal investor" },
  ],
};

export function totalRelationshipCount(): number {
  let count = 0;
  for (const k of Object.keys(REL_INDEX)) {
    count += Object.keys(REL_INDEX[k]).length;
  }
  return count / 2;
}
