# AI Reg. Index

Public register of AI-governance laws, regulations, executive actions, and
standards. Static site, published at [airegindex.com](https://airegindex.com).
Maintained by [SolidCore.ai](https://solidcore.ai). Register text CC BY 4.0.

## Stack

- **Astro** static site generator — every page is pre-rendered HTML, zero
  client JavaScript.
- Data lives in flat JSON in `src/data/` — no database at build time.
- `@astrojs/sitemap` generates `sitemap-index.xml`.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # -> dist/
npm run preview  # serve dist/
```

## Content

| File | What |
|---|---|
| `src/data/entries.json` | The 29 register entries. One object per instrument. |
| `src/data/dossiers.json` | Rich per-entry content (scorecard, timeline, checklist, pitfalls), keyed by section number. Only entries that have a full brief appear here. |
| `src/data/amendments.json` | The change log shown on `/amendments/`. |
| `src/data/site.json` | Site name, URL, publisher, license, `lastVerified` date. |

To update an entry: edit `entries.json` (or `dossiers.json`), bump
`site.json` `lastVerified` if needed, `npm run build`, commit, push.

The source of record is the "AI Reg Index" Supabase project
(`ypdgkpcorvvpgzofjtxh`). To re-sync from it, run the queries in
`scripts/supabase-export.sql` and transform the rows back into the JSON files.

## Pages

- `/` — the register (homepage)
- `/sources/{slug}/` — one page per entry (generated from `entries.json`)
- `/deadlines/`, `/comparisons/`, `/method/`, `/data/`, `/cite/`, `/submit/`, `/amendments/`
- `/register.json` — the whole dataset as one file
- `/robots.txt`, `/llms.txt` — in `public/`

## GEO notes

- Per-entry JSON-LD (`Legislation` / `CreativeWork`) is built in
  `src/lib/jsonld.ts` and embedded in each page `<head>`.
- The homepage carries `Dataset` + `Organization` nodes; entry pages add
  `BreadcrumbList`.
- `robots.txt` explicitly allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot,
  Google-Extended, CCBot, and others).
- No `FAQPage` schema — there is no FAQ content, and empty FAQ markup is
  penalized.

## Deploy

**Real hosting: not wired yet.** Any static host works (Cloudflare Pages,
Vercel, Netlify): build command `npm run build`, output directory `dist`.

**Review preview** is live at <https://jbperrier.github.io/ai-reg-index/>
(noindex, not the real domain), served from the `gh-pages` branch. It is a
sub-path deploy, so `PAGES_BASE=/ai-reg-index` is set at build time. To
republish after a content change:

```bash
PAGES_BASE=/ai-reg-index npm run build
git -C ../ai-reg-index-ghpages checkout gh-pages
rsync -a --delete --exclude .git dist/ ../ai-reg-index-ghpages/
git -C ../ai-reg-index-ghpages commit -am "Publish preview build" && \
  git -C ../ai-reg-index-ghpages push
```
