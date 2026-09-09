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
  // Astro 7 defaults compressHTML to 'jsx', which drops the space between a
  // word and an inline element that sit on different source lines
  // ("maintained by" + <a>SolidCore.ai</a> -> "maintained bySolidCore.ai").
  // 'true' is lossless HTML minification and keeps that space.
  compressHTML: true,
  integrations: [
    sitemap({
      // Drop the redirect stub kept at the pre-rename OWASP URL.
      filter: (page) =>
        !page.includes(
          "/sources/owasp-top-10-for-large-language-model-applications-v2-0/",
        ),
    }),
  ],
  build: {
    format: "directory",
  },
});
