// Prefix an absolute site path with the configured base path.
// BASE_URL is "/" in dev and on a root deploy; "/ai-reg-index/" on GitHub Pages.
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

/** Prefix a root-relative path (e.g. "/deadlines/") with the base path. */
export function u(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE}${path}`;
}

/** True when the site is served from a sub-path (a preview deploy). */
export const isPreview = import.meta.env.BASE_URL !== "/";
