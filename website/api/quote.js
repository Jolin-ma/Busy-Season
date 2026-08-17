/* Quote-form endpoint — Vercel serverless function.
 *
 * The marketing site is otherwise static and has no package.json, so this
 * deliberately uses CommonJS and the global fetch (Node 18+) rather than the
 * Resend SDK. Adding a dependency here would mean giving the static site an
 * install step for one HTTP call.
 *
 * Env vars (Vercel project: marketing site):
 *   RESEND_API_KEY   required — the function 500s without it
 *   LEAD_INBOX       optional — defaults to info@legacylinkstudio.com
 *   LEAD_FROM        optional — must be on a Resend-verified domain
 *
 * The email is the system of record, and now the only record: the back-office
 * copy this used to POST to (LEAD_INGEST_URL / LEAD_INGEST_KEY) went away with
 * the studio admin app on 2026-08-17 (brief v2 §7 — no custom admin at launch;
 * pipeline and delivery live in one shared tracker instead). Leads are worked
 * from the inbox and copied into that tracker by hand. If a back office is
 * ever rebuilt, add the secondary post back *after* a successful send and keep
 * it unable to fail the visitor's submission.
 */

const DEFAULT_INBOX = "info@legacylinkstudio.com";
const DEFAULT_FROM = "LegacyLink Studio <leads@legacylinkstudio.com>";

/* Length caps. These exist to keep a junk payload from becoming a huge email,
   not to police real input — every cap is far above a plausible real answer. */
const LIMITS = {
  business: 200,
  name: 200,
  email: 320, // practical maximum length of an email address
  phone: 50,
  service: 300, // trade + service area, in the visitor's own words
  details: 5000,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value, max) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  /* Vercel parses application/json into req.body, but a string can still
     arrive depending on how the request was made. Handle both. */
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Malformed request." });
    }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Malformed request." });
  }

  /* Honeypot. Real browsers leave this hidden field empty; bots that fill
     every input get a 200 so they don't learn to retry with it blank. */
  if (clean(body.company_website, 100)) {
    return res.status(200).json({ ok: true });
  }

  const fields = {
    business: clean(body.business, LIMITS.business),
    name: clean(body.name, LIMITS.name),
    email: clean(body.email, LIMITS.email),
    phone: clean(body.phone, LIMITS.phone),
    service: clean(body.service, LIMITS.service),
    details: clean(body.details, LIMITS.details),
  };

  const missing = ["business", "name", "email"].filter((k) => !fields[k]);
  if (missing.length) {
    return res
      .status(400)
      .json({ error: "Please fill in your business, name, and email." });
  }
  if (!EMAIL_RE.test(fields.email)) {
    return res.status(400).json({ error: "That email address looks wrong." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    /* Misconfiguration, not a visitor error. Log loudly — a silent failure
       here is exactly the lead-dropping behaviour this endpoint replaced. */
    console.error("[quote] RESEND_API_KEY is not set; lead was not delivered");
    return res.status(500).json({ error: "server" });
  }

  const rows = [
    ["Business", fields.business],
    ["Contact name", fields.name],
    ["Email", fields.email],
    ["Phone", fields.phone || "—"],
    ["What they do", fields.service || "—"],
  ];

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Anything else:",
    fields.details || "—",
  ].join("\n");

  const html = [
    '<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">',
    ...rows.map(
      ([label, value]) =>
        `<p style="margin:0 0 4px"><strong>${label}:</strong> ${escapeHtml(value)}</p>`,
    ),
    '<p style="margin:16px 0 4px"><strong>Anything else:</strong></p>',
    `<p style="margin:0;white-space:pre-wrap">${escapeHtml(fields.details || "—")}</p>`,
    "</div>",
  ].join("");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.LEAD_FROM || DEFAULT_FROM,
        to: [process.env.LEAD_INBOX || DEFAULT_INBOX],
        /* So hitting reply in the mail client goes straight to the prospect
           rather than to the no-reply sending address. */
        reply_to: fields.email,
        subject: `Sample ad request — ${fields.business}`,
        text,
        html,
      }),
    });

    if (!response.ok) {
      /* Log the full payload alongside the failure. If Resend is down or the
         domain falls out of verification, the lead is still recoverable from
         the Vercel function logs instead of being lost outright. */
      const detail = await response.text().catch(() => "");
      console.error(
        `[quote] Resend rejected the send (${response.status}): ${detail}\n${text}`,
      );
      return res.status(502).json({ error: "send" });
    }
  } catch (err) {
    console.error(`[quote] Send failed: ${err && err.message}\n${text}`);
    return res.status(502).json({ error: "send" });
  }

  return res.status(200).json({ ok: true });
};
