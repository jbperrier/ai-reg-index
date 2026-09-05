import raw from "../data/entries.json";
import dossiers from "../data/dossiers.json";
import amendmentsRaw from "../data/amendments.json";
import { slugify, standingBucket, type StandingBucket } from "./format";

export interface Framework {
  framework: string;
  ref: string | null;
}

export interface RawEntry {
  section: number;
  jurisdiction: string;
  name: string;
  citation: string;
  standing: string;
  effectiveDate: string | null;
  verifiedAt: string;
  gloss: string;
  tags: string[];
  sourceKind: string;
  sourceUrl: string;
  sourceLabel: string;
  frameworks: Framework[];
}

export interface ScorecardItem {
  metric: string;
  score: number;
  max: number;
  rationale: string;
}
export interface TimelineItem {
  date: string;
  event: string;
}
export interface Pitfall {
  title: string;
  problem: string;
  trap: string;
  defensivePlay: string;
}
export interface Dossier {
  whoItBinds: string;
  executiveBrief: string[];
  paradigmShiftTitle: string;
  paradigmShiftBody: string;
  scorecard: ScorecardItem[];
  timeline: TimelineItem[];
  checklist: string[];
  penalties: string;
  pitfalls: Pitfall[];
}

export interface Entry extends RawEntry {
  slug: string;
  bucket: StandingBucket;
  group: RegionGroup;
  dossier: Dossier | null;
}

export type RegionGroup =
  | "US, federal"
  | "US, state and local"
  | "European Union"
  | "Rest of world and standards bodies";

function regionGroup(e: RawEntry): RegionGroup {
  const j = e.jurisdiction;
  if (j === "European Union") return "European Union";
  if (j === "United States") return "US, federal";
  if (j.endsWith(", United States")) return "US, state and local";
  return "Rest of world and standards bodies";
}

const dossierMap = dossiers as Record<string, Dossier>;

export const entries: Entry[] = (raw as RawEntry[]).map((e) => ({
  ...e,
  slug: slugify(e.name),
  bucket: standingBucket(e.standing),
  group: regionGroup(e),
  dossier: dossierMap[String(e.section)] ?? null,
}));

export const GROUP_ORDER: RegionGroup[] = [
  "US, federal",
  "US, state and local",
  "European Union",
  "Rest of world and standards bodies",
];

/** Entries grouped by region, each group ordered by section number. */
export function entriesByGroup(): { group: RegionGroup; items: Entry[] }[] {
  return GROUP_ORDER.map((group) => ({
    group,
    items: entries
      .filter((e) => e.group === group)
      .sort((a, b) => a.section - b.section),
  })).filter((g) => g.items.length > 0);
}

/** Entries that carry an effective date, oldest first. */
export function datedEntries(): Entry[] {
  return entries
    .filter((e) => e.effectiveDate)
    .sort((a, b) => a.effectiveDate!.localeCompare(b.effectiveDate!));
}

export function entryBySection(section: number): Entry | undefined {
  return entries.find((e) => e.section === section);
}

export interface Amendment {
  date: string;
  section: number;
  instrument: string;
  kind: string;
  body: string;
}
export const amendments = amendmentsRaw as Amendment[];

/** Count of dated entries by calendar year of their effective date. */
export function effectiveByYear(): { year: string; count: number }[] {
  const map = new Map<string, number>();
  for (const e of datedEntries()) {
    const year = e.effectiveDate!.slice(0, 4);
    map.set(year, (map.get(year) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([year, count]) => ({ year, count }));
}
