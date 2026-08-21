/* Quote-form endpoint — Vercel serverless function.
 *
 * The marketing site is otherwise static and has no package.json, so this
 * deliberately uses CommonJS and the global fetch (Node 18+) rather than the
 * Resend SDK. Adding a dependency here would mean giving the static site an
 * install step for one HTTP call.
 *
 * Env vars (Vercel project: marketing site):
 *   RESEND_API_KEY   required — the function 500s without it
 *   LEAD_INBOX       optional — defaults to info@busyseason.ca
 *   LEAD_FROM        optional — must be on a Resend-verified domain
 *   LEAD_INGEST_URL  optional — back-office /api/leads/ingest endpoint
 *   LEAD_INGEST_KEY  optional — shared secret for that endpoint
 *
 * The email is the system of record. The back-office copy is best-effort and
 * strictly secondary: it happens after a successful send, it cannot fail the
 * visitor's submission, and either ingest var unset simply skips it. Don't
 * reorder those — a lead reaching the inbox is what "delivered" means here.
 *
 * The back office (studio/) was deleted on 2026-08-17 under brief v2 §7 and
 * restored on 2026-08-18 by founder decision. Until that app is deployed and
 * both ingest vars are set, the post is skipped and leads arrive by email
 * only — that is a supported state, not a broken one.
 */

const DEFAULT_INBOX = "info@busyseason.ca";
const DEFAULT_FROM = "Busy Season <leads@busyseason.ca>";

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

  /* Secondary copy into the back office. Everything below this line is
     best-effort: the lead is already in the inbox, so no failure here may
     change what the visitor sees. Either var unset skips it entirely, which
     is the normal state until studio/ is deployed. */
  const ingestUrl = process.env.LEAD_INGEST_URL;
  const ingestKey = process.env.LEAD_INGEST_KEY;

  if (ingestUrl && ingestKey) {
    try {
      const ingest = await fetch(ingestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-lead-key": ingestKey,
        },
        /* `service` carries trade and service area together, because that is
           how the v2 form asks for it. The older location/packageInterest
           columns have no source on this form and stay null. */
        body: JSON.stringify({
          business: fields.business,
          name: fields.name,
          email: fields.email,
          phone: fields.phone,
          service: fields.service,
          details: fields.details,
        }),
        /* Cap the wait. A hanging back office must not hold a real visitor on
           a spinner for a copy they do not know exists. */
        signal: AbortSignal.timeout(3000),
      });

      if (!ingest.ok) {
        console.error(
          `[quote] lead ingest returned ${ingest.status}; lead delivered by email only`,
        );
      }
    } catch (err) {
      console.error(
        `[quote] lead ingest failed: ${err && err.message}; lead delivered by email only`,
      );
    }
  }

  return res.status(200).json({ ok: true });
};
