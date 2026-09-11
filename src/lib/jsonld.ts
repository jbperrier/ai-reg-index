import site from "../data/site.json";
import type { Entry } from "./entries";

const LEGISLATION_KINDS = new Set([
  "statute",
  "regulation",
  "executive_order",
]);

const GENRE_LABEL: Record<string, string> = {
  standard: "Standard",
  advisory: "Advisory",
  agency_guidance: "Agency Guidance",
  interpretive_opinion: "Interpretive Opinion",
};

function entryUrl(entry: Entry): string {
  return `${site.url}/sources/${entry.slug}/`;
}

/**
 * Two schema.org nodes for a register entry, kept distinct on purpose:
 * the instrument itself (published by its issuing government or body,
 * identified by its own primary-source URL) and AI Reg. Index's page
 * about it (published by AI Reg. Index, `about` the instrument). AI Reg.
 * Index is not the publisher of the underlying law - collapsing these
 * into one node would say otherwise.
 */
export function entryJsonLd(entry: Entry): Record<string, unknown>[] {
  const isLegislation = LEGISLATION_KINDS.has(entry.sourceKind);

  const instrument: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": isLegislation ? "Legislation" : "CreativeWork",
    "@id": entry.sourceUrl,
    name: entry.name,
    url: entry.sourceUrl,
    jurisdiction: {
      "@type": "AdministrativeArea",
      name: entry.jurisdiction,
    },
  };
  if (entry.effectiveDate) instrument.legislationDate = entry.effectiveDate;
  if (isLegislation) {
    instrument.legislationType =
      entry.sourceKind === "executive_order"
        ? "Executive Order"
        : entry.sourceKind === "regulation"
          ? "Regulation"
          : "Statute";
  } else {
    instrument.genre = GENRE_LABEL[entry.sourceKind] ?? "Guidance";
  }

  const page: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": entryUrl(entry),
    name: entry.name,
    description: entry.gloss,
    url: entryUrl(entry),
    dateModified: entry.verifiedAt,
    license: site.license.url,
    isPartOf: { "@id": `${site.url}/#dataset` },
    publisher: { "@id": `${site.url}/#org` },
    about: { "@id": entry.sourceUrl },
    isBasedOn: entry.sourceUrl,
  };

  return [instrument, page];
}

/** schema.org Organization node for the publisher. Referenced by @id. */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#org`,
    name: site.publisher.name,
    url: site.publisher.url,
  };
}

/** schema.org Dataset node for the register as a whole. */
export function datasetJsonLd(entryCount: number): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${site.url}/#dataset`,
    name: site.name,
    description: site.description,
    url: site.url,
    license: site.license.url,
    creator: { "@id": `${site.url}/#org` },
    publisher: { "@id": `${site.url}/#org` },
    isAccessibleForFree: true,
    dateModified: site.lastVerified,
    keyword: [
      "AI regulation",
      "AI governance",
      "AI compliance",
      "AI law",
    ],
    variableMeasured: `${entryCount} AI-governance instruments`,
  };
}

/** BreadcrumbList: Register -> Jurisdiction -> Instrument. */
export function breadcrumbJsonLd(entry: Entry): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Register", item: `${site.url}/` },
      { "@type": "ListItem", position: 2, name: entry.jurisdiction },
      { "@type": "ListItem", position: 3, name: entry.name, item: entryUrl(entry) },
    ],
  };
}
