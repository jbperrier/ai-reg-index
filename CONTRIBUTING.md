# Editing the site

The site rebuilds and deploys automatically on every push to `main`
(~1 minute). If a build fails, the live site stays on the last good version.

## One-off text tweak — GitHub web editor

For a typo or a word change, no local setup needed:

1. Open the file on github.com, click the pencil icon.
2. Edit, then **Commit changes** → commit to `main`.
3. Watch it deploy under the repo's **Actions** tab.

## Anything more — edit locally

```bash
cd ai-reg-index
git pull            # get the latest first
npm run dev         # opens http://localhost:4321, live-reloads as you type
# ...make edits...
npm run build       # optional: confirm it builds before pushing
git add -A
git commit -m "short description"
git push
```

`npm install` only needs running once (or after someone changes dependencies).

## What file changes what

| Page | File |
|---|---|
| Homepage | `src/pages/index.astro` |
| `/data/`, `/deadlines/`, `/comparisons/`, `/method/`, `/cite/`, `/submit/`, `/amendments/` | `src/pages/<name>.astro` |
| 404 page | `src/pages/404.astro` |
| Entry pages (`/sources/...`) | generated from data — see below |

## Register content lives in JSON, not the pages

To add or change an instrument, a date, a standing, or an amendment, edit the
data files — **not** the `.astro` pages:

| File | Holds |
|---|---|
| `src/data/entries.json` | the 29 register rows |
| `src/data/dossiers.json` | deep-dive content, keyed by section number |
| `src/data/amendments.json` | the change log on `/amendments/` |
| `src/data/site.json` | site name, tagline, `lastVerified` date |

Bump `lastVerified` in `site.json` after a review pass — it shows in the
masthead on every page.

The register data can also be re-synced from the "AI Reg Index" Supabase
project; see `scripts/supabase-export.sql`.

## The `.astro` format

```
---
JavaScript and imports  ← leave this block alone for text edits
---
HTML markup             ← edit the text between the tags here
```

For a text edit, work only below the second `---`. Don't touch `{ ... }`
expressions or tag attributes unless you know what they do.

## Don't edit unless you mean to

- `src/layouts/`, `src/components/` — change every page at once
- `astro.config.mjs`, `.github/workflows/`, `public/CNAME`, `public/.nojekyll` — build and deploy config
- `supabase/functions/submit/` — the form handler; it is **not** auto-deployed,
  it's redeployed separately against Supabase
