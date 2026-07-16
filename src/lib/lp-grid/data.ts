// LP Grid — Data model & fictional investor dataset
// All data is illustrative, for concept purposes only.

export type InvestorType =
  | "Pension fund"
  | "Sovereign wealth fund"
  | "Endowment"
  | "Foundation"
  | "Insurance group"
  | "Family office"
  | "Fund-of-funds"
  | "Asset manager"
  | "Institutional consultant";

export type Strategy =
  | "Private equity"
  | "Private credit"
  | "Infrastructure"
  | "Real assets"
  | "Venture capital"
  | "Secondaries";

export type Geography = "North America" | "Europe" | "Middle East" | "Asia-Pacific";

export type AllocationBand = "under_25m" | "25_100m" | "100_500m" | "500m_plus";

export interface Investor {
  id: string;
  name: string;
  type: InvestorType;
  hq: string;
  geography: Geography;
  aumB: number; // AUM in billions USD
  typicalCommitmentM: [number, number]; // min/max in millions
  preferredStrategies: Strategy[];
  relationshipScore: number; // 0..1
  recentActivity: "Increasing" | "Stable" | "Decreasing";
  priority: "ambient" | "active" | "high";
}

export interface Relationship {
  a: string;
  b: string;
  strength: number; // 0..1
}

// 60 fictional institutional investors
export const INVESTORS: Investor[] = [
  { id: "meridian", name: "Meridian Sovereign Fund", type: "Sovereign wealth fund", hq: "Abu Dhabi, UAE", geography: "Middle East", aumB: 84, typicalCommitmentM: [100, 300], preferredStrategies: ["Infrastructure", "Private equity", "Private credit", "Real assets", "Venture capital"], relationshipScore: 0.94, recentActivity: "Increasing", priority: "high" },
  { id: "northbridge", name: "Northbridge Pension Trust", type: "Pension fund", hq: "Toronto, Canada", geography: "North America", aumB: 142, typicalCommitmentM: [75, 250], preferredStrategies: ["Private equity", "Infrastructure", "Private credit"], relationshipScore: 0.88, recentActivity: "Stable", priority: "high" },
  { id: "helix", name: "Helix Insurance Group", type: "Insurance group", hq: "Zurich, Switzerland", geography: "Europe", aumB: 68, typicalCommitmentM: [50, 200], preferredStrategies: ["Private credit", "Real assets", "Infrastructure"], relationshipScore: 0.81, recentActivity: "Increasing", priority: "high" },
  { id: "alder", name: "Alder University Endowment", type: "Endowment", hq: "Boston, USA", geography: "North America", aumB: 12, typicalCommitmentM: [10, 75], preferredStrategies: ["Venture capital", "Private equity", "Secondaries"], relationshipScore: 0.76, recentActivity: "Increasing", priority: "active" },
  { id: "westmark", name: "Westmark Family Capital", type: "Family office", hq: "London, UK", geography: "Europe", aumB: 4.2, typicalCommitmentM: [5, 50], preferredStrategies: ["Private equity", "Venture capital", "Secondaries"], relationshipScore: 0.62, recentActivity: "Stable", priority: "active" },
  { id: "arcadia", name: "Arcadia Investment Authority", type: "Sovereign wealth fund", hq: "Singapore", geography: "Asia-Pacific", aumB: 110, typicalCommitmentM: [100, 400], preferredStrategies: ["Infrastructure", "Real assets", "Private equity"], relationshipScore: 0.9, recentActivity: "Increasing", priority: "high" },
  { id: "calder", name: "Calder Foundation", type: "Foundation", hq: "Oslo, Norway", geography: "Europe", aumB: 3.6, typicalCommitmentM: [5, 40], preferredStrategies: ["Private equity", "Real assets"], relationshipScore: 0.55, recentActivity: "Stable", priority: "active" },
  { id: "kestrel", name: "Kestrel Pension Fund", type: "Pension fund", hq: "Amsterdam, Netherlands", geography: "Europe", aumB: 95, typicalCommitmentM: [75, 250], preferredStrategies: ["Private equity", "Private credit", "Infrastructure"], relationshipScore: 0.83, recentActivity: "Stable", priority: "high" },
  { id: "orien", name: "Orien Asset Managers", type: "Asset manager", hq: "New York, USA", geography: "North America", aumB: 38, typicalCommitmentM: [25, 150], preferredStrategies: ["Private equity", "Secondaries", "Private credit"], relationshipScore: 0.71, recentActivity: "Increasing", priority: "active" },
  { id: "pier", name: "Pier Insurance Holdings", type: "Insurance group", hq: "Munich, Germany", geography: "Europe", aumB: 52, typicalCommitmentM: [50, 200], preferredStrategies: ["Private credit", "Real assets"], relationshipScore: 0.74, recentActivity: "Stable", priority: "active" },
  { id: "sable", name: "Sable Capital Advisors", type: "Institutional consultant", hq: "Chicago, USA", geography: "North America", aumB: 1.8, typicalCommitmentM: [5, 25], preferredStrategies: ["Private equity", "Venture capital", "Secondaries"], relationshipScore: 0.58, recentActivity: "Increasing", priority: "active" },
  { id: "tamar", name: "Tamar Endowment", type: "Endowment", hq: "Stanford, USA", geography: "North America", aumB: 18, typicalCommitmentM: [10, 100], preferredStrategies: ["Venture capital", "Private equity"], relationshipScore: 0.79, recentActivity: "Increasing", priority: "active" },
  { id: "vermont", name: "Vermont Family Office", type: "Family office", hq: "Geneva, Switzerland", geography: "Europe", aumB: 2.4, typicalCommitmentM: [5, 30], preferredStrategies: ["Private equity", "Secondaries"], relationshipScore: 0.49, recentActivity: "Stable", priority: "ambient" },
  { id: "rhine", name: "Rhine Pension Scheme", type: "Pension fund", hq: "Frankfurt, Germany", geography: "Europe", aumB: 76, typicalCommitmentM: [50, 200], preferredStrategies: ["Private equity", "Infrastructure", "Private credit"], relationshipScore: 0.8, recentActivity: "Stable", priority: "high" },
  { id: "asi", name: "ASI Sovereign Holding", type: "Sovereign wealth fund", hq: "Riyadh, Saudi Arabia", geography: "Middle East", aumB: 220, typicalCommitmentM: [150, 500], preferredStrategies: ["Infrastructure", "Real assets", "Private equity"], relationshipScore: 0.92, recentActivity: "Increasing", priority: "high" },
  { id: "kairos", name: "Kairos Fund-of-Funds", type: "Fund-of-funds", hq: "Hong Kong", geography: "Asia-Pacific", aumB: 14, typicalCommitmentM: [10, 75], preferredStrategies: ["Private equity", "Secondaries", "Venture capital"], relationshipScore: 0.66, recentActivity: "Stable", priority: "active" },
  { id: "marin", name: "Marin Insurance", type: "Insurance group", hq: "Copenhagen, Denmark", geography: "Europe", aumB: 31, typicalCommitmentM: [25, 100], preferredStrategies: ["Private credit", "Infrastructure"], relationshipScore: 0.69, recentActivity: "Stable", priority: "active" },
  { id: "atlas", name: "Atlas Pension Reserve", type: "Pension fund", hq: "Sydney, Australia", geography: "Asia-Pacific", aumB: 88, typicalCommitmentM: [50, 200], preferredStrategies: ["Infrastructure", "Private equity", "Real assets"], relationshipScore: 0.85, recentActivity: "Increasing", priority: "high" },
  { id: "halcyon", name: "Halcyon Endowment", type: "Endowment", hq: "Oxford, UK", geography: "Europe", aumB: 9.5, typicalCommitmentM: [5, 50], preferredStrategies: ["Venture capital", "Private equity"], relationshipScore: 0.72, recentActivity: "Stable", priority: "active" },
  { id: "cypress", name: "Cypress Family Trust", type: "Family office", hq: "Singapore", geography: "Asia-Pacific", aumB: 3.1, typicalCommitmentM: [5, 40], preferredStrategies: ["Venture capital", "Private equity", "Secondaries"], relationshipScore: 0.61, recentActivity: "Increasing", priority: "active" },
  { id: "ridge", name: "Ridge Capital Partners", type: "Asset manager", hq: "London, UK", geography: "Europe", aumB: 22, typicalCommitmentM: [25, 150], preferredStrategies: ["Private equity", "Secondaries"], relationshipScore: 0.68, recentActivity: "Stable", priority: "active" },
  { id: "soleil", name: "Soleil Foundation", type: "Foundation", hq: "Paris, France", geography: "Europe", aumB: 2.8, typicalCommitmentM: [5, 30], preferredStrategies: ["Real assets", "Private equity"], relationshipScore: 0.52, recentActivity: "Stable", priority: "ambient" },
  { id: "qmc", name: "QMC Investment Office", type: "Institutional consultant", hq: "Toronto, Canada", geography: "North America", aumB: 1.2, typicalCommitmentM: [5, 25], preferredStrategies: ["Private equity", "Infrastructure"], relationshipScore: 0.54, recentActivity: "Stable", priority: "ambient" },
  { id: "boreas", name: "Boreas Pension Fund", type: "Pension fund", hq: "Stockholm, Sweden", geography: "Europe", aumB: 64, typicalCommitmentM: [50, 200], preferredStrategies: ["Private equity", "Infrastructure", "Private credit"], relationshipScore: 0.77, recentActivity: "Stable", priority: "active" },
  { id: "mira", name: "Mira Sovereign Wealth", type: "Sovereign wealth fund", hq: "Doha, Qatar", geography: "Middle East", aumB: 165, typicalCommitmentM: [100, 400], preferredStrategies: ["Infrastructure", "Real assets", "Private equity"], relationshipScore: 0.89, recentActivity: "Increasing", priority: "high" },
  { id: "lumen", name: "Lumen Insurance Group", type: "Insurance group", hq: "Tokyo, Japan", geography: "Asia-Pacific", aumB: 44, typicalCommitmentM: [25, 100], preferredStrategies: ["Private credit", "Real assets"], relationshipScore: 0.67, recentActivity: "Stable", priority: "active" },
  { id: "fenway", name: "Fenway Endowment", type: "Endowment", hq: "New Haven, USA", geography: "North America", aumB: 21, typicalCommitmentM: [10, 100], preferredStrategies: ["Venture capital", "Private equity", "Secondaries"], relationshipScore: 0.8, recentActivity: "Increasing", priority: "high" },
  { id: "stirling", name: "Stirling Capital", type: "Family office", hq: "Edinburgh, UK", geography: "Europe", aumB: 1.9, typicalCommitmentM: [5, 30], preferredStrategies: ["Private equity", "Real assets"], relationshipScore: 0.5, recentActivity: "Stable", priority: "ambient" },
  { id: "norwood", name: "Norwood Advisors", type: "Asset manager", hq: "Boston, USA", geography: "North America", aumB: 17, typicalCommitmentM: [25, 100], preferredStrategies: ["Private equity", "Secondaries"], relationshipScore: 0.63, recentActivity: "Stable", priority: "active" },
  { id: "meridian2", name: "Meridian Pension Pool", type: "Pension fund", hq: "Tokyo, Japan", geography: "Asia-Pacific", aumB: 105, typicalCommitmentM: [75, 250], preferredStrategies: ["Infrastructure", "Private equity", "Private credit"], relationshipScore: 0.82, recentActivity: "Increasing", priority: "high" },
  { id: "harbor", name: "Harbor Foundation", type: "Foundation", hq: "Vancouver, Canada", geography: "North America", aumB: 4.4, typicalCommitmentM: [5, 40], preferredStrategies: ["Real assets", "Private equity"], relationshipScore: 0.57, recentActivity: "Stable", priority: "active" },
  { id: "summit", name: "Summit Insurance", type: "Insurance group", hq: "Hartford, USA", geography: "North America", aumB: 28, typicalCommitmentM: [25, 100], preferredStrategies: ["Private credit", "Real assets"], relationshipScore: 0.65, recentActivity: "Stable", priority: "active" },
  { id: "ellsworth", name: "Ellsworth Family Office", type: "Family office", hq: "New York, USA", geography: "North America", aumB: 2.2, typicalCommitmentM: [5, 30], preferredStrategies: ["Venture capital", "Private equity", "Secondaries"], relationshipScore: 0.6, recentActivity: "Increasing", priority: "active" },
  { id: "axiom", name: "Axiom Fund-of-Funds", type: "Fund-of-funds", hq: "Zurich, Switzerland", geography: "Europe", aumB: 11, typicalCommitmentM: [10, 75], preferredStrategies: ["Private equity", "Secondaries"], relationshipScore: 0.7, recentActivity: "Stable", priority: "active" },
  { id: "terra", name: "Terra Sovereign Reserve", type: "Sovereign wealth fund", hq: "Kuwait City, Kuwait", geography: "Middle East", aumB: 195, typicalCommitmentM: [100, 400], preferredStrategies: ["Infrastructure", "Real assets", "Private equity"], relationshipScore: 0.91, recentActivity: "Stable", priority: "high" },
  { id: "quill", name: "Quill Endowment", type: "Endowment", hq: "Cambridge, UK", geography: "Europe", aumB: 8.1, typicalCommitmentM: [5, 50], preferredStrategies: ["Venture capital", "Private equity"], relationshipScore: 0.73, recentActivity: "Stable", priority: "active" },
  { id: "pinnacle", name: "Pinnacle Asset Co.", type: "Asset manager", hq: "Tokyo, Japan", geography: "Asia-Pacific", aumB: 19, typicalCommitmentM: [25, 100], preferredStrategies: ["Private equity", "Secondaries", "Private credit"], relationshipScore: 0.64, recentActivity: "Stable", priority: "active" },
  { id: "lattice", name: "Lattice Consultants", type: "Institutional consultant", hq: "London, UK", geography: "Europe", aumB: 1.5, typicalCommitmentM: [5, 25], preferredStrategies: ["Private equity", "Infrastructure"], relationshipScore: 0.56, recentActivity: "Stable", priority: "ambient" },
  { id: "northgate", name: "Northgate Pension", type: "Pension fund", hq: "Manchester, UK", geography: "Europe", aumB: 47, typicalCommitmentM: [25, 100], preferredStrategies: ["Private equity", "Private credit", "Infrastructure"], relationshipScore: 0.71, recentActivity: "Stable", priority: "active" },
  { id: "saffron", name: "Saffron Wealth", type: "Family office", hq: "Dubai, UAE", geography: "Middle East", aumB: 2.7, typicalCommitmentM: [5, 40], preferredStrategies: ["Private equity", "Venture capital"], relationshipScore: 0.59, recentActivity: "Increasing", priority: "active" },
  { id: "amber", name: "Amber Insurance", type: "Insurance group", hq: "Seoul, South Korea", geography: "Asia-Pacific", aumB: 36, typicalCommitmentM: [25, 100], preferredStrategies: ["Private credit", "Infrastructure"], relationshipScore: 0.68, recentActivity: "Stable", priority: "active" },
  { id: "cobalt", name: "Cobalt Foundation", type: "Foundation", hq: "Seattle, USA", geography: "North America", aumB: 5.2, typicalCommitmentM: [5, 50], preferredStrategies: ["Venture capital", "Real assets"], relationshipScore: 0.62, recentActivity: "Increasing", priority: "active" },
  { id: "driftwood", name: "Driftwood Capital", type: "Asset manager", hq: "San Francisco, USA", geography: "North America", aumB: 14, typicalCommitmentM: [10, 75], preferredStrategies: ["Venture capital", "Secondaries"], relationshipScore: 0.66, recentActivity: "Increasing", priority: "active" },
  { id: "ironwood", name: "Ironwood Endowment", type: "Endowment", hq: "Ithaca, USA", geography: "North America", aumB: 7.8, typicalCommitmentM: [5, 50], preferredStrategies: ["Venture capital", "Private equity"], relationshipScore: 0.7, recentActivity: "Stable", priority: "active" },
  { id: "pacific", name: "Pacific Reserve Fund", type: "Sovereign wealth fund", hq: "Beijing, China", geography: "Asia-Pacific", aumB: 240, typicalCommitmentM: [150, 500], preferredStrategies: ["Infrastructure", "Real assets", "Private equity"], relationshipScore: 0.93, recentActivity: "Increasing", priority: "high" },
  { id: "marlowe", name: "Marlowe Family Office", type: "Family office", hq: "Monaco", geography: "Europe", aumB: 1.6, typicalCommitmentM: [5, 25], preferredStrategies: ["Private equity", "Secondaries"], relationshipScore: 0.48, recentActivity: "Stable", priority: "ambient" },
  { id: "orion", name: "Orion Pension Trust", type: "Pension fund", hq: "Helsinki, Finland", geography: "Europe", aumB: 41, typicalCommitmentM: [25, 100], preferredStrategies: ["Private equity", "Infrastructure", "Private credit"], relationshipScore: 0.72, recentActivity: "Stable", priority: "active" },
  { id: "vantage", name: "Vantage Insurance Group", type: "Insurance group", hq: "Bermuda", geography: "North America", aumB: 23, typicalCommitmentM: [25, 100], preferredStrategies: ["Private credit", "Real assets"], relationshipScore: 0.64, recentActivity: "Stable", priority: "active" },
  { id: "shorline", name: "Shorline Advisors", type: "Institutional consultant", hq: "San Francisco, USA", geography: "North America", aumB: 1.4, typicalCommitmentM: [5, 25], preferredStrategies: ["Venture capital", "Private equity"], relationshipScore: 0.55, recentActivity: "Increasing", priority: "active" },
  { id: "tessera", name: "Tessera Fund-of-Funds", type: "Fund-of-funds", hq: "Luxembourg", geography: "Europe", aumB: 9.2, typicalCommitmentM: [10, 75], preferredStrategies: ["Private equity", "Secondaries", "Private credit"], relationshipScore: 0.67, recentActivity: "Stable", priority: "active" },
  { id: "aurora", name: "Aurora Endowment", type: "Endowment", hq: "Princeton, USA", geography: "North America", aumB: 16, typicalCommitmentM: [10, 75], preferredStrategies: ["Venture capital", "Private equity", "Secondaries"], relationshipScore: 0.74, recentActivity: "Stable", priority: "active" },
  { id: "kestrel2", name: "Kestrel Asia Capital", type: "Asset manager", hq: "Singapore", geography: "Asia-Pacific", aumB: 12, typicalCommitmentM: [10, 75], preferredStrategies: ["Private equity", "Secondaries"], relationshipScore: 0.69, recentActivity: "Increasing", priority: "active" },
  { id: "lincoln", name: "Lincoln Foundation", type: "Foundation", hq: "Washington DC, USA", geography: "North America", aumB: 3.4, typicalCommitmentM: [5, 30], preferredStrategies: ["Real assets", "Private equity"], relationshipScore: 0.53, recentActivity: "Stable", priority: "ambient" },
  { id: "peninsula", name: "Peninsula Family Trust", type: "Family office", hq: "Hong Kong", geography: "Asia-Pacific", aumB: 2.1, typicalCommitmentM: [5, 30], preferredStrategies: ["Private equity", "Venture capital"], relationshipScore: 0.51, recentActivity: "Stable", priority: "ambient" },
  { id: "ashford", name: "Ashford Pension Fund", type: "Pension fund", hq: "Birmingham, UK", geography: "Europe", aumB: 33, typicalCommitmentM: [25, 100], preferredStrategies: ["Private equity", "Private credit", "Infrastructure"], relationshipScore: 0.66, recentActivity: "Stable", priority: "active" },
  { id: "niagara", name: "Niagara Sovereign Reserve", type: "Sovereign wealth fund", hq: "Abu Dhabi, UAE", geography: "Middle East", aumB: 130, typicalCommitmentM: [100, 350], preferredStrategies: ["Infrastructure", "Real assets", "Private equity"], relationshipScore: 0.87, recentActivity: "Stable", priority: "high" },
  { id: "dufferin", name: "Dufferin Insurance", type: "Insurance group", hq: "Toronto, Canada", geography: "North America", aumB: 26, typicalCommitmentM: [25, 100], preferredStrategies: ["Private credit", "Real assets"], relationshipScore: 0.63, recentActivity: "Stable", priority: "active" },
  { id: "eclipse", name: "Eclipse Asset Management", type: "Asset manager", hq: "Chicago, USA", geography: "North America", aumB: 15, typicalCommitmentM: [10, 75], preferredStrategies: ["Private equity", "Secondaries"], relationshipScore: 0.65, recentActivity: "Stable", priority: "active" },
  { id: "haven", name: "Haven Endowment", type: "Endowment", hq: "Baltimore, USA", geography: "North America", aumB: 6.4, typicalCommitmentM: [5, 50], preferredStrategies: ["Venture capital", "Private equity"], relationshipScore: 0.61, recentActivity: "Stable", priority: "active" },
];

// Build relationships procedurally — higher relationshipScore nodes connect more,
// geographic proximity and shared strategies increase strength.
export function buildRelationships(investors: Investor[]): Relationship[] {
  const rels: Relationship[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < investors.length; i++) {
    for (let j = i + 1; j < investors.length; j++) {
      const a = investors[i];
      const b = investors[j];
      let strength = 0;
      if (a.geography === b.geography) strength += 0.18;
      const shared = a.preferredStrategies.filter((s) => b.preferredStrategies.includes(s)).length;
      strength += shared * 0.12;
      strength += (a.relationshipScore + b.relationshipScore) * 0.18;
      // dampen for ambient
      if (a.priority === "ambient" && b.priority === "ambient") strength *= 0.6;
      strength = Math.min(1, strength);
      // keep only meaningful ones, cap per node
      if (strength > 0.32) {
        const key = `${a.id}|${b.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          rels.push({ a: a.id, b: b.id, strength });
        }
      }
    }
  }
  return rels;
}

export const RELATIONSHIPS: Relationship[] = buildRelationships(INVESTORS);

// The hero focal investor for the concept
export const SELECTED_INVESTOR_ID = "meridian";

// Strategy allocation for Meridian Sovereign Fund
export const MERIDIAN_STRATEGY_ALLOCATION: { strategy: Strategy; pct: number }[] = [
  { strategy: "Private equity", pct: 32 },
  { strategy: "Infrastructure", pct: 24 },
  { strategy: "Private credit", pct: 18 },
  { strategy: "Real assets", pct: 16 },
  { strategy: "Venture capital", pct: 10 },
];

export const MERIDIAN_SIGNALS = [
  "Strong relationship with infrastructure managers",
  "Increased private-credit activity over the last 12 months",
  "Expanding European allocation alongside core Middle East mandate",
  "Seven shared relationships within the selected network",
];

export const MERIDIAN_RELATED: { name: string; type: InvestorType; strength: "Strong" | "Moderate" | "Light" }[] = [
  { name: "Northbridge Pension Trust", type: "Pension fund", strength: "Strong" },
  { name: "Helix Insurance Group", type: "Insurance group", strength: "Strong" },
  { name: "Arcadia Investment Authority", type: "Sovereign wealth fund", strength: "Strong" },
  { name: "Kestrel Pension Fund", type: "Pension fund", strength: "Moderate" },
  { name: "Atlas Pension Reserve", type: "Pension fund", strength: "Moderate" },
  { name: "Westmark Family Capital", type: "Family office", strength: "Moderate" },
];

export const MERIDIAN_SUMMARY =
  "Meridian has increased its exposure to infrastructure and private credit, with the strongest relationship concentration among European and Middle Eastern managers. Allocation discipline favours mid-to-large commitments across five active private-market strategies.";
