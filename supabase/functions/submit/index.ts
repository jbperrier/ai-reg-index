// Public form endpoint for airegindex.com.
// Handles: correction, source suggestion, subscribe.
// Auth model: no JWT (verify_jwt=false). A honeypot field + light validation gate it.
//
// Deployed to Supabase project ypdgkpcorvvpgzofjtxh as the `submit` function.
// This file is the source of record; redeploy via the Supabase CLI or MCP if changed.
//
// Env (Supabase dashboard -> Edge Functions -> Secrets):
//   RESEND_API_KEY   - required for alert emails
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY - injected automatically

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const FROM = "AI Reg. Index <noreply@airegindex.com>";
const ALERTS = {
  correction: ["echiu@solidcore.ai", "cphoenix@solidcore.ai", "hprafullchandra@solidcore.ai"],
  source: ["echiu@solidcore.ai", "cphoenix@solidcore.ai", "hprafullchandra@solidcore.ai"],
  subscribe: ["jperrier@solidcore.ai", "echiu@solidcore.ai"],
} as const;

const ALLOWED_ORIGINS = [
  "https://airegindex.com",
  "https://www.airegindex.com",
  "http://localhost:4321",
];

function cors(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...cors(origin) },
  });
}

const isEmail = (s: unknown): s is string =>
  typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const isUrl = (s: unknown): s is string => {
  if (typeof s !== "string") return false;
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};
const clip = (s: unknown, n = 4000): string | null =>
  typeof s === "string" && s.trim() ? s.trim().slice(0, n) : null;

async function insert(table: string, row: Record<string, unknown>, prefer?: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      "content-type": "application/json",
      Prefer: prefer ?? "return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok && res.status !== 409) {
    console.error(`insert ${table} failed`, res.status, await res.text());
  }
}

async function sendAlert(kind: keyof typeof ALERTS, fields: Record<string, unknown>) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set - skipping alert email");
    return;
  }
  const to = ALERTS[kind];
  const label = kind === "correction" ? "Correction" : kind === "source" ? "Source suggestion" : "New subscriber";
  const lines = Object.entries(fields)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to,
      subject: `AI Reg. Index - ${label}`,
      text: `${label} submitted via airegindex.com\n\n${lines}\n`,
    }),
  });
  if (!res.ok) console.error("resend failed", res.status, await res.text());
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return json({ ok: false, error: "method" }, 405, origin);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "bad json" }, 400, origin);
  }

  // Honeypot: real users never fill this. Bots do. Accept silently.
  if (clip(body.website)) return json({ ok: true }, 200, origin);

  const kind = body.kind;
  if (kind !== "correction" && kind !== "source" && kind !== "subscribe") {
    return json({ ok: false, error: "kind" }, 400, origin);
  }

  const ua = req.headers.get("user-agent")?.slice(0, 300) ?? null;

  if (kind === "subscribe") {
    if (!isEmail(body.email)) return json({ ok: false, error: "email" }, 400, origin);
    const email = (body.email as string).trim().toLowerCase();
    await insert("subscribers", { email }, "resolution=merge-duplicates,return=minimal");
    await insert("form_submissions", { kind, email, data: {}, user_agent: ua });
    await sendAlert("subscribe", { email });
    return json({ ok: true }, 200, origin);
  }

  // correction | source
  if (!isUrl(body.source)) return json({ ok: false, error: "source url required" }, 400, origin);

  const data: Record<string, string | null> =
    kind === "correction"
      ? {
          entry: clip(body.entry),
          issue: clip(body.issue),
          source: clip(body.source, 800),
        }
      : {
          instrument: clip(body.instrument),
          jurisdiction: clip(body.jurisdiction),
          why: clip(body.why),
          source: clip(body.source, 800),
        };

  const email = isEmail(body.email) ? (body.email as string).trim().toLowerCase() : null;
  await insert("form_submissions", { kind, email, data, user_agent: ua });
  await sendAlert(kind, { ...data, contact_email: email ?? "(none)" });
  return json({ ok: true }, 200, origin);
});
