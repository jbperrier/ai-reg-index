import type { APIRoute } from "astro";
import site from "../data/site.json";
import { entries } from "../lib/entries";
import { entryJsonLd, datasetJsonLd } from "../lib/jsonld";

export const GET: APIRoute = () => {
  const body = {
    "@context": "https://schema.org",
    ...datasetJsonLd(entries.length),
    dateModified: site.lastVerified,
    entries: entries.map((e) => ({
      section: e.section,
      slug: e.slug,
      url: `${site.url}/sources/${e.slug}/`,
      jurisdiction: e.jurisdiction,
      name: e.name,
      citation: e.citation,
      standing: e.standing,
      bucket: e.bucket,
      effectiveDate: e.effectiveDate,
      verifiedAt: e.verifiedAt,
      gloss: e.gloss,
      tags: e.tags,
      sourceKind: e.sourceKind,
      sourceUrl: e.sourceUrl,
      sourceLabel: e.sourceLabel,
      frameworks: e.frameworks,
      hasDossier: Boolean(e.dossier),
      jsonLd: entryJsonLd(e),
    })),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
