import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// On GitHub Pages the site is served from /<repo>/. The deploy workflow sets
// PAGES_BASE=/ai-reg-index. Local dev and a root deploy leave it unset.
const base = process.env.PAGES_BASE || undefined;

// https://astro.build/config
export default defineConfig({
  site: "https://airegindex.com",
  base,
  output: "static",
  trailingSlash: "always",
  integrations: [sitemap()],
  build: {
    format: "directory",
  },
});
