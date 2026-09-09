// Presentation helpers. No dependencies.

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-08-02" -> "2 Aug 2026". Returns "—" for null/empty. */
export function shortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const mi = Number(m) - 1;
  if (!y || mi < 0 || mi > 11) return iso;
  if (!d) return `${MONTHS[mi]} ${y}`;
  return `${Number(d)} ${MONTHS[mi]} ${y}`;
}

/** "2026-08-02" -> "2 August 2026". */
export function longDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const FULL = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const [y, m, d] = iso.split("-");
  const mi = Number(m) - 1;
  if (!y || mi < 0 || mi > 11 || !d) return shortDate(iso);
  return `${Number(d)} ${FULL[mi]} ${y}`;
}

/** Trim a string to a meta-description length at a word boundary. */
export function metaDescription(s: string, max = 158): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return `${cut.slice(0, at > 40 ? at : max).replace(/[.,;:\s]+$/, "")}…`;
}

/** slugify an instrument name for its URL. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[‘’“”]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type StandingBucket =
  | "draft"
  | "advisory"
  | "enacted"
  | "in-force"
  | "struck-down";

/** Map the free-text `standing` value to one of five buckets. */
export function standingBucket(standing: string): StandingBucket {
  const s = standing.toLowerCase();
  if (s.includes("struck") || s.includes("vetoed") || s.includes("died")) {
    return "struck-down";
  }
  if (s.startsWith("draft") || s.startsWith("pending")) return "draft";
  if (s.startsWith("enacted")) return "enacted";
  if (
    s.includes("in force") ||
    s.includes("in effect") ||
    s === "continuing"
  ) {
    return "in-force";
  }
  // Voluntary, Published, Advisory, Non-statutory
  return "advisory";
}

/** oklch dot colour for a standing bucket. */
export function standingColor(bucket: StandingBucket): string {
  switch (bucket) {
    case "draft":
      return "oklch(0.46 0.06 200)";
    case "advisory":
      return "oklch(0.6 0.1 165)";
    case "enacted":
      return "oklch(0.73 0.14 145)";
    case "in-force":
      return "oklch(0.85 0.17 130)";
    case "struck-down":
      return "oklch(0.5 0.02 265)";
  }
}
