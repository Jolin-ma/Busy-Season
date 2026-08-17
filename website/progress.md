# LegacyLink Studio Website — Progress Log

Tracks build status for the marketing site in this `website/` folder against
`LegacyLink_Studio_Master_Build_Brief.md`.

Per `CLAUDE.md`, this folder deploys as its own Vercel project (`legacy-link`)
to `legacylinkstudio.com`, Root Directory `website`, config in
`website/vercel.json`. It is plain static HTML/CSS/JS with no build step,
apart from the one serverless function behind the quote form.

**Scope note (updated 2026-08-17):** this repo now holds exactly one thing —
`website/`, this site. The `studio/` back office was deleted on 2026-08-17
per brief v2 §7 (no custom admin build at launch); pipeline and delivery live
in one shared tracker instead. It is recoverable from git history.

The QR-memorial product that used to occupy most of this repo (`src/`,
`admin/`, `ops-dashboard/`, `lambda/`, `prisma/`, `infra/`) was retired and
deleted on 2026-08-16, along with its two Vercel projects, its Railway API,
and its DNS records. It is gone, not dormant — recover from git history if
it is ever wanted again.

---

## 2026-08-17 — Rebuilt for brief v2: the studio now runs the ads

`LegacyLink_Studio_Master_Build_Brief.md` was rewritten as **v2**, which
supersedes v1 entirely. The change that drives everything else: v1 sold
video creative only while promising an outcome ("we get your phone
ringing") that depends on distribution the studio wasn't touching. **v2
closes that gap — the studio produces *and* runs the ads.** Every page on
this site had copy that is now false, so this is a copy rebuild, not a
tweak.

Also decided in v2, and reflected here: the **name stays** (a rename was
priced out and declined), so §0 makes the copy carry all the explaining —
the name never appears without the clause that decodes it, and page
`<title>`s pair the wordmark with "Video Ads for Home Services".

### What changed, page by page

| File | Status | What it now says |
|---|---|---|
| `styles.css` | ✅ | Three new §8.5 components — **guarantee block**, **before/after showcase**, **all-in cost callout** — plus their responsive rules. Palette and type untouched: §8.2/§8.3 didn't change in v2. |
| `index.html` | ✅ | Rebuilt to the v2 §6 section order: hero → real-footage showcase → what you get → 3 steps → guarantee → proof → pricing preview → closing CTA. |
| `pricing.html` | ✅ | Launch Pack $750 / Growth $1,500, ad spend on both cards, all-in block, new not-included list, the 11-question FAQ in brief order. |
| `how-it-works.html` | ✅ | Nine steps (was six) — adds ad account access, campaign build/launch, optimization, monthly readout. Intake list now covers assets and campaign setup. |
| `work.html` | ✅ | Real-footage showcase added, verticals widened to home services, results-framing rules written into the card template comment. |
| `about.html` | ✅ | "We only sell creative" is gone — it's now "we run the ads, we don't hold the budget". Adds why-your-photos-matter. |
| `quote.html` | ✅ | Reframed as *Get a Free Sample Ad*. Trimmed to the §6 field list; `location` + `package` replaced by one "what you do" field. |
| `script.js`, `api/quote.js` | ✅ | Same field change end-to-end; subject line is now "Sample ad request". |
| `terms.html` | ✅ | Rescoped to production **and** campaign management; new §3 guarantee and §5 ad-account/ad-spend sections; sections renumbered 1–11. |
| `privacy.html` | ✅ | Rewritten (see the section below). New §5 on ad accounts and campaign data; §2 matches the new form fields; sections renumbered 1–11. |

### Pricing and copy facts that moved (v1 → v2)

- Starter $400 / 2 videos → **Launch Pack $750 / 3 videos + campaign setup**.
- Growth $1,000/mo / 6 videos → **$1,500/mo / 4 videos + managed campaign +
  monthly readout**, biweekly batches of **2** (was 3).
- Revisions: one round **per batch**, not per video.
- **"No tax is added" is gone from the site** (v2 §4). It was on three
  pages. It's cost-neutral to an HST-registered buyer, and v2 pricing
  crosses the $30k registration threshold inside year one — copy that has
  to come down in months isn't worth the zero benefit. `terms.html` now
  says prices are exclusive of any applicable taxes.
- **The guarantee leads the copy hierarchy**, above the rate lock (§4.4):
  deposit refunded in full if the first drafts miss. The rate lock is
  demoted to a small notice below it.
- **The all-in number is stated everywhere the fee is** (§4.6) — fee +
  recommended spend + total, as a real component, never grey-on-grey.
- Primary CTA is **"Get a Free Sample Ad"** site-wide, replacing "Get a
  Quote". `quote.html` kept its filename so no redirect is needed.

### The back office is gone

Brief v2 §7 is explicit: **no custom admin build at launch** — pipeline and
delivery go in one shared tracker instead. So the `studio/` app is being
removed from the repo (it stays recoverable in git history; all 29 files
were tracked).

Already done here: `api/quote.js` no longer posts a copy of each lead to
the back office. `LEAD_INGEST_URL` / `LEAD_INGEST_KEY` are now dead
variables — the endpoint doesn't read them. **The email is the only record
of a lead**, which was always true in practice (the ingest was best-effort
and swallowed every failure); the difference is that leads now get copied
into the tracker by hand.

⚠ **Still to do by hand, outside this repo** — deliberately not touched:
delete the `legacylink-studio` Vercel project, and remove
`LEAD_INGEST_URL` / `LEAD_INGEST_KEY` from the marketing site's Vercel
project. Both are live infrastructure and neither is reversible from here.

---

## 2026-08-17 (later) — v2 rebuild finished: privacy, legal-page chrome, `studio/` deleted

Picked up the four items the entry above stopped on. Three are closed; the
fourth (render it in a browser) is still open and is now the only thing
between this rebuild and a deploy.

### `privacy.html` rewritten

The last page still carrying v1 copy. What changed:

- **§2 is now "The sample-ad form"** and lists the fields the form actually
  has. The old text promised we collect "service area" and "which package
  you're interested in" — both fields were deleted in the v2 form, so the
  policy was describing collection that no longer happens. It now reads:
  business name, name, email, what you do and the area you cover, plus
  optional phone and free text.
- **New §5, "Your advertising account and campaign data"** — the substantive
  gap, and the reason this page couldn't just be a find-and-replace. v2 has
  the studio working inside a client's Meta ad account, which the privacy
  policy said nothing about. It now states: the account is the client's, we
  hold partner/admin access and it can be withdrawn, we can see campaign,
  billing and performance data and use it only to run and report on
  campaigns. Mirrors `terms.html` §5 rather than inventing a second position.
- **Lead data gets its own paragraph in that section, deliberately.** When a
  campaign uses a lead form, homeowners' contact details land in the
  *client's* account. The page says plainly that those leads are the
  client's and the client is responsible for them, that we may see them
  incidentally while managing the account, and that we don't use them for
  anything else. This is the one place the studio touches consumer personal
  data at any scale, so it should not be left to inference.
- **§4** now warns that job photos may identify people and asks clients to
  send only material they have the right to use in advertising.
- **§6** adds Meta as a service provider alongside Vercel and Resend.
- **§3** no longer says we keep records in a back office — it says a tracker.
- Sections renumbered 1–11; "Last updated" moved to 17 August 2026. The
  NEEDS LEGAL REVIEW banner and `noindex` stay.

Checked and left alone: §2's paragraph about the mailto fallback is still
accurate — `script.js` still falls back to a pre-filled mail client when the
POST fails.

### Both legal pages were still wearing v1 chrome

The nav CTA was the known item, but it wasn't the only one — `terms.html`
and `privacy.html` had never had *any* of the v2 shell applied, because the
rebuild worked page-body by page-body. Fixed on both: nav CTA → **Get a Free
Sample Ad**, `<title>` now pairs the wordmark with "Video Ads for Home
Services" per §0, footer blurb → the v2 "we run them for you" line, footer
"Get started" list (was "Get a Quote" / "Request a spec ad" — the latter is
retired v1 vocabulary), and the footer-bottom tagline. All eight pages now
carry identical chrome; verified by grep that **"Get a Quote" appears
nowhere in the site's HTML.**

### `studio/` is gone

Deleted per brief v2 §7 (no custom admin build at launch). All 29 tracked
files were committed, so the app is fully recoverable from git history.

⚠ **`studio/.env` was not.** It was gitignored, so deleting the folder would
have destroyed the only copy of the Neon `DATABASE_URL`/`DIRECT_URL`,
`STUDIO_PASSWORD`, `STUDIO_SESSION_SECRET` and `LEAD_INGEST_KEY`. It was
backed up first, on the founder's call, to:

```
C:\Users\jolin\Documents\Legacy Link\studio-env-backup-2026-08-17.txt
```

That path is **outside the repo** on purpose — it can't be committed by
accident. Delete it once the Neon database and the Vercel project are gone,
since it's a plaintext credentials file. (`.env.local` held only a
short-lived `VERCEL_OIDC_TOKEN` and wasn't worth keeping.)

`CLAUDE.md` and `README.md` were rewritten to match: the back-office
architecture section, its commands, its deploy row, and the two-project
framing are all out, and the leads path is now described as what it is —
email only, copied into the tracker by hand. Both files keep a short note
saying the app existed, when it went, and *why* (§7), so nobody rebuilds it
without reading the brief first.

### Verification done (static — the browser still hasn't seen this)

- **Every class used in the HTML has a rule in `styles.css`**, checked
  programmatically. This was aimed at the three new §8.5 components, since a
  typo'd class name on a never-rendered component fails silently. One
  apparent hit, `.showcase-before`, is a false alarm: it's a semantic grid
  child whose styling comes from `.showcase`'s grid and its own children.
- **Every internal link resolves**, and every `#fragment` has a matching
  `id`. The only unresolved `src`s are `video/reel.mp4` and
  `video/roofing-storm-damage.mp4`, both inside HTML comments — the
  drop-in templates for when spec footage exists.

### Still to do — this is the resume point

1. ⏳ **Render the v2 site in a browser.** Nothing from either 2026-08-17
   session has been looked at on a screen. The three new §8.5 components
   (guarantee block, before/after showcase, all-in cost callout) have never
   been seen at all. **The browser extension was not connected this session**,
   so this could not be attempted — same blocker as 2026-08-14. Do this
   before deploying.
2. ⏳ **Then deploy.** The v2 rebuild is unpushed and unreleased; production
   is still serving v1 copy, which now contradicts the brief on price,
   packages, and what the studio actually sells.
3. ⚠ **Two manual jobs outside this repo**, unchanged and still not done:
   delete the `legacylink-studio` Vercel project, and remove
   `LEAD_INGEST_URL` / `LEAD_INGEST_KEY` from the marketing site's Vercel
   project (the function no longer reads them). Add a third now that the app
   is gone: **delete the Neon `legacylink-studio` database** — it's empty,
   and it's the last live piece of the back office.

---

## 2026-08-13 — Full rebuild against the Master Build Brief

The site was rebuilt from scratch for a different business. The previous
version was the "parent studio" credibility site — a holding page for an
AI memorial-production studio, fronting Loyal Tale. Brief §1 retires that
plan: `legacylinkstudio.com` is now the sales site for an independent
business selling **AI-produced video ads to local service businesses**
(roofers and contractors as the flagship vertical).

### Pages

| Page | File | Brief ref | Status |
|---|---|---|---|
| Homepage | `index.html` | §6, §8.6 | ✅ Dark hero + honest proof band + 3-step how-it-works + pricing preview + closing CTA |
| Services & Pricing | `pricing.html` | §2, §6 | ✅ Starter/Growth comparison, explicit "creative only" scope block, 9-question FAQ accordion |
| Get a Quote | `quote.html` | §6, §8.5 | ✅ Six-field single-column form, "what happens next", direct email |
| Our Work | `work.html` | §6, §8.6 | ✅ Honest empty portfolio (see below), delivery formats, verticals |
| How It Works | `how-it-works.html` | §5 | ✅ Six-step workflow written client-facing, intake-brief preview, timing |
| About | `about.html` | §6 | ✅ Why AI video is affordable, four deliberate operating choices, founder placeholder |
| Terms of Service | `terms.html` | §6, §2.4 | ✅ Rescoped to video production, includes `#usage-rights` section |
| Privacy Policy | `privacy.html` | §6 | ✅ Rewritten to describe what this site actually does |

**Deleted:** `partners.html`, `press.html`, `contact.html` — all three
belonged to the retired parent-studio concept (vet-clinic partnerships,
press kit, investor/press contact routing). `contact.html` is superseded by
`quote.html`.

### Brand separation (brief §5 — read this before adding anything)

The brief is emphatic that LegacyLink Studio and Loyal Tale must not
reference each other anywhere a visitor can see. Every mention of Loyal
Tale, memorials, tributes, and pets is gone from this folder — verified by
grep across all files. **Do not add a link back.**

⚠ **Outstanding, and outside this repo:** the Loyal Tale site still links
back to `legacylinkstudio.com` (noted in the previous audit as a
deliberate cross-link under the *old* plan). Under the current brief that
link is now a violation and should be removed from the Loyal Tale side.

### Design system (`styles.css`, brief §8)

Rewritten completely. The old palette (warm off-white, navy, muted gold,
pill buttons) was shared DNA with Loyal Tale; §8.2 requires the two sites
be unmistakably different.

- **Palette** — brief §8.2 values verbatim as CSS custom properties.
- **Type** — Space Grotesk (headlines) + Inter (body). No serif anywhere,
  per §8.3.
- **Geometry** — 8px grid, 1280px max content width, 6px corner radius,
  96–120px desktop section padding dropping to 64px on mobile.
- **Motion** — 130ms transitions, subtle scale-on-hover for portfolio
  thumbnails, `prefers-reduced-motion` respected.

**Contrast rule worth knowing before editing colours** (§8.9 asked for the
amber to be checked against both backgrounds — it doesn't pass everywhere):

- Amber `#E8862E` on the near-white background is **2.6:1 — fails AA for
  text.** It may fill a shape there, but must never set type.
- The amber CTA button therefore takes **near-black** label text (7.3:1).
  White-on-amber is 2.9:1 and fails.
- Amber as *text* is used only on the charcoal (6.4:1). Steel blue is the
  eyebrow/label colour on light backgrounds (6.9:1).

There is a comment block at the top of `styles.css` restating this.

### Deliberate placeholders (all visible in the UI, none faked)

- **No portfolio pieces.** There is no client work and no spec work yet, so
  `work.html` says exactly that. It does not use stock footage or invented
  case studies (§8.7). Two placeholder cards are labelled "spec ad in
  production"; a third invites the visitor to request one.
- **No hero reel.** The 9:16 hero frame is a styled placeholder. `index.html`
  carries a commented `<video>` snippet showing exactly what to drop in;
  `.reel video` is already styled for it.
- **No client logos or results.** The homepage proof band states plainly
  that the studio is new, then sells the spec-ad offer instead (§4).
- **Founder background** — placeholder card on `about.html`. Name, bio, and
  photo were not supplied; nothing was invented.
- **Legal pages** — both carry a visible NEEDS LEGAL REVIEW banner and are
  `noindex`.

### The quote form has no backend

This site is static, so there is no endpoint to post to. Rather than the
previous site's approach — a client-side "message received" screen that
silently dropped the lead — submitting now composes a pre-filled email in
the visitor's own mail client, and the page says that's what it's doing.
The field names in `script.js` are already the payload shape for a real
endpoint (Formspree, a Vercel function) whenever one exists.

### Verification performed

- Every internal `href` resolves to a file that exists; both fragment links
  (`pricing.html#faq`, `terms.html#usage-rights`) have matching `id`s.
- No stale memorial/Loyal Tale copy remains (grep).
- Rendered every page in a real browser at desktop width. Three bugs found
  and fixed this way:
  1. `.hero` and `.cta-band` weren't in the dark-surface selector lists, so
     the hero eyebrow rendered steel-blue on charcoal (~2.6:1) and the
     secondary hero button was nearly invisible.
  2. `.fact p` out-specified `.fact-value`, collapsing the large stat
     numbers to body size.
  3. Mobile dropdown CTA sat exactly at the 44px floor; bumped to 48px.
- Mobile nav verified by re-applying the ≤1000/860/760px rule bodies
  unconditionally and squeezing the page to 390px: hamburger appears, all
  four links plus the Get a Quote CTA are reachable in the dropdown, hero
  stacks, no horizontal overflow.

⚠ **Same caveat as the previous entry:** this environment's `resize_window`
does not actually shrink the viewport (`window.innerWidth` stays at desktop
size), so the media queries were never observed *firing* at a real narrow
width — only their rule bodies were tested. Worth one DevTools
responsive-mode pass before the next production deploy.

---

## 2026-08-13 — Shipped to production, plus post-launch fixes

The rebuild went live at `legacylinkstudio.com`. `main` was fast-forwarded
to the rebuild branch and pushed; Vercel deployed it. Verified over HTTP
that all 8 pages return 200 and the page titles/copy/email are the new
ones. The old memorial site is off the domain.

Rollback, if ever needed: deployment `dpl_2ZDLVcM…` (commit `c4a34d1`,
the old site) is still flagged as a rollback candidate in Vercel.

Follow-up changes made after launch, each deployed and verified live:

| Change | Commit |
|---|---|
| `hello@` → `info@legacylinkstudio.com` everywhere (16 spots incl. the form's `data-inbox`) | `4becca9` |
| Deleted the unused root-level `image/legacy_link_logo.png` | `9a2d32d` |
| Removed the logo mark from the nav bar — header is the wordmark alone (footer mark and favicon unchanged) | `fcc08d0` |
| Dropped the city name from the quote-form placeholder | `fe656e1` |
| Redirects for the three deleted pages | `7171e81`, `6ab2fe7`, `908dd9b` |

Live redirect behaviour, all 308 and all confirmed to land on a 200:

```
/contact.html   → /quote.html
/partners.html  → /
/press.html     → /
```

### ⚠ The Vercel config trap that cost the most time here

**The marketing site's Vercel config lives at `website/vercel.json`, not
the repo root.** The project's Root Directory is `website`, and Vercel
reads `vercel.json` from the Root Directory — so the repo-root
`vercel.json` is never consulted by this project.

This is nasty because the symptom is silent. `outputDirectory: website`
in the root file *looks* like it's working, since Root Directory
`website` serves exactly the same files anyway. Only routing config
(`redirects`, `headers`, `rewrites`) quietly does nothing, and the deploy
still goes green. The first `/contact.html` redirect was added to the
root file, deployed successfully, and kept returning 404 with
`X-Vercel-Error: NOT_FOUND`.

CLAUDE.md's deployment table had this wrong and has been corrected. The
root `vercel.json` was left in place rather than deleted — `admin/` and
`ops-dashboard/` were configured around it, so removing it is not a
verified no-op.

### Brief update received (§3, §4, §10)

The founder is in Oshawa, operating out of Durham Region / East GTA. The
brief's decision is that this stays **out of the website** — positioning
is vertical-led, and location is an outreach/conversation lever only.
Checked: the site contains no geographic claim of any kind, so it already
complies and needed no change. This also retroactively justifies dropping
"Tampa area" from the quote-form placeholder — a US city on a
deliberately geography-agnostic site, for an Ontario studio.

---

## 2026-08-14 — Responsive audit narrowed; copy fix

**`terms.html`: "finalised" → "finalized"** (next-steps item 6). "licence"
on the same page stays as-is — Canadian English keeps the -ce noun form.

### The mobile caveat, narrowed but not closed

The standing caveat from 2026-08-10 and 2026-08-12 was that the media
queries had never been observed *firing* — only their rule bodies were
tested by re-applying them unconditionally. A real-device pass still
hasn't happened (the browser extension wasn't connected this session), but
the caveat splits into two questions and the first is now settled
statically:

**1. Do the queries fire at 390px? Yes — verified.**

- All 8 pages carry `<meta name="viewport" content="width=device-width,
  initial-scale=1" />`. This was the actual risk: a missing or malformed
  viewport meta makes a phone render at ~980px CSS width, and *no*
  `max-width` query fires no matter how correct its body is. That would
  have reproduced exactly the "rule bodies fine, mobile still broken"
  symptom the old caveat feared.
- The three breakpoints are plain `max-width` queries (1000 / 860 / 760px),
  so all three match at 390px.

**2. Does anything overflow horizontally at 390px? No static cause found.**

- Zero fixed `width`/`min-width` values ≥100px anywhere in `styles.css`.
- No `minmax()` tracks, no tables, no `<pre>` — the usual overflow sources
  are simply absent.
- Every multi-column grid collapses to one column at or above 760px:

  | Grid | Collapses at |
  |---|---|
  | `.hero-grid`, `.grid-split` | 1000px |
  | `.facts`, `.steps`, `.pricing`, `.grid-2/3/4`, `.steps-stacked .step` | 860px |
  | `.work-grid` (3→2→1), `.footer-grid` (4→2→1) | 1000px, then 760px |

  The two that stay multi-column are `.plan li` (`1.25rem 1fr`) and
  `.steps-stacked .step`'s icon column — both icon-plus-text bullets, not
  layout containers.
- `img, svg, video { max-width: 100% }` is in the reset, so no media
  element can push the viewport wide.
- One `white-space: nowrap`, on `.brand` — the wordmark, ~150px at 17px.
  Harmless at 390px, but it's the one rule that *would* overflow if the
  studio name ever gets longer.

**What this does not cover, and why the device pass is still on the list:**
rendered text overflow from a long unbroken word, real touch-target sizes,
font-loading shifts, iOS-specific behaviour, and whether the hamburger
actually opens under a real touch event. Static analysis rules out the
structural causes; it can't confirm the thing renders.

### Currency settled: CAD

Open item 0, marked site-wide. See that item below for exactly where it's
marked and what was deliberately left alone. Brief §2 carries the decision.

### Quote form now posts to a real backend

Next-steps item 7, built the same day. The form no longer opens a mailto —
it POSTs to `/api/quote`, a Vercel serverless function that emails the lead
via Resend. Decision was Vercel function + Resend over Formspree: no
third-party branding on the confirmation path of a B2B credibility site,
and the payload stays in our own code.

**`website/api/quote.js`** — CommonJS, global `fetch`, zero dependencies.
That's deliberate: `website/` has no `package.json`, and pulling in the
Resend SDK would give the static site an install step for one HTTP call.

Behaviour, all covered by a throwaway harness with a stubbed `fetch`
(13/13 branches, not kept in the repo — there's no test runner here):

| Case | Result |
|---|---|
| non-POST | 405 with `Allow: POST` |
| missing business/name/email | 400, message shown inline |
| unparseable email | 400 |
| honeypot filled | silent 200, **nothing sent** |
| happy path | 200, Resend called with `reply_to` = prospect |
| Resend rejects / network throws | 502 |
| `RESEND_API_KEY` unset | 500 |

Details worth not undoing later:

- **`reply_to` is the prospect's address**, so hitting reply in the mail
  client goes to them, not to the no-reply sender.
- **Every failure path logs the full lead payload** before returning 502.
  This is the recovery mechanism — if Resend is down or the domain drops
  out of verification, the lead is still in the Vercel function log rather
  than gone. Don't trim those logs to just the error.
- **HTML in the email body is escaped**; the text part is what matters but
  a pasted `<img onerror=...>` shouldn't render in the inbox.
- **Field lengths are capped** (details at 5000 chars) so a junk payload
  can't become a huge email.
- **Honeypot** is `company_website`, off-screen via `.hp` rather than
  `display:none`, plus `aria-hidden` and `tabindex="-1"`. Off-screen so a
  form-filling bot still considers it real.

Client side (`script.js`): submit is disabled and relabelled "Sending…"
during the request; success hides the form and reveals the existing
`.notice-success` block; **failure falls back to the old mailto path** with
the answers already composed, so a visitor who filled the form in never
leaves with nothing.

`privacy.html` §2, §5, and §9 were rewritten to match — §2 described the
mailto behaviour, and §9 promised to update the page "if we add ... a
hosted form backend," which this is. §5 now names Vercel and Resend.

~~**Not live until three things happen outside this repo**~~ — done, same
day. See the entry directly below.

---

## 2026-08-14 — Resend wired up, domain verified, first live lead delivered

Closed the last piece of next-steps item 7: the three founder-side steps
that were blocking the quote-form backend built earlier today from actually
working in production.

**Resend account already existed** (`jolinma81`), but `legacylinkstudio.com`
had never been added as a domain in it — the dashboard showed "No domains
yet." Added it.

**DKIM and the `send`-subdomain SPF TXT record were already sitting in
Namecheap** from the mailbox-setup session earlier today (`resend._domainkey`,
`send` → `v=spf1 include:amazonses.com ~all`) and matched Resend's
newly-generated values exactly, character for character — confirmed via the
page's `aria-label` attributes rather than trusting the UI's `[…]`-truncated
display, since a single wrong character in a DKIM key fails silently rather
than erroring. Only one record was actually missing: the **MX record on
`send`** (`feedback-smtp.us-east-1.amazonses.com`, priority 10), which
Resend needs for bounce/feedback handling under "Enable Sending."

⚠ **Namecheap doesn't expose MX as a record type in the general Host
Records "Add New Record" dropdown** — only A, AAAA, ALIAS, CAA, CNAME, NS,
SRV, TXT, URL Redirect. MX has to go through the separate **Mail Settings**
section's own "Add New Record," which — despite living under a section
that otherwise looks `@`-only — does accept an arbitrary `Host` field.
Worth remembering if another MX record is ever needed on a subdomain here.

Deliberately left **"Enable Receiving" off** in Resend, and did not add its
`@` → `inbound-smtp.us-east-1.amazonaws.com` MX record. That record targets
the domain apex, which already carries Zoho's three MX records for the
`info@` mailbox — adding Resend's would conflict with mail actually meant
for a human. Resend only needs to send from this domain, not receive on it.

Verification passed within about a minute of adding the MX record
(`Status: Verified` — "Domain verified: Your domain is ready to send
emails"), fast because the DKIM/SPF pieces were already propagated from
earlier today.

**API key**: created `legacylinkstudio-website`, scoped to **Sending
access** + **this domain only** (not Full access / All domains) — least
privilege, since this key's only job is the one `resend.emails.send()` call
in `website/api/quote.js`. Copied via Resend's clipboard button and pasted
directly into Vercel's env var field; the plaintext value was never
displayed, typed, or logged anywhere in the session.

**Vercel**: `RESEND_API_KEY` added to the `legacy-link` project
(Production + Preview, marked Sensitive), then redeployed. Confirmed
`legacy-link` is the right project by checking its domain
(`legacylinkstudio.com`) — Vercel's dashboard names the project
`legacy-link`, not `website` or `marketing-site`, which doesn't match the
repo folder name and is worth remembering if this needs touching again.

**End-to-end test, live production, real send:** submitted the quote form
at `legacylinkstudio.com/quote.html` with an obviously-marked test payload
("Test Roofing Co (DNS test)", a note in the optional field explaining it's
an internal test). Got the real success state ("Got it — your request is
in"), not the mailto fallback — confirming the POST to `/api/quote`
succeeded rather than erroring. Resend's Emails log confirms delivery:
`info@legacylinkstudio.com`, status **Delivered**.

The quote form now works end to end in production. Nothing left on next-
steps item 7.

---

## 2026-08-15 — Payment terms settled and put on the site

Two founder decisions landed in brief §2.2/§2.4 and were carried into the
site copy. Both close open item 6 below.

**Payment method: Interac e-Transfer is the default for everything** —
deposits, balances, invoices, and the recurring monthly charge alike. No
fee, and it matches how contractor clients already pay their own suppliers
and subs. Stripe (card) is a secondary option on any *individual* payment,
offered only when a client specifically asks to pay that one by card.

The "only on request" half is the load-bearing part and the copy is written
to hold it: the site never proactively offers card. The pricing FAQ names
e-Transfer as *the* method and adds "if you'd rather put a particular
payment on a card, say so" — an answer to a question, not a menu. If that
ever gets rewritten into "we accept e-Transfer or credit card," the ~2.9%
+ $0.30 fee starts showing up on payments that would otherwise have come in
free. Keep it phrased as an exception.

**Growth first month is now $750 + $750, and this is a labeling change
only** — not a price cut. Month one still totals $1,500, the same as every
month after it. What changed is that the two halves now have names and
timings a prospect can follow: a **$750 setup deposit** at signing (covers
onboarding and the first batch of 4, ~2 weeks later) and a **$750 first
invoice** when the second batch of 4 lands, ~day 30. The old copy said
"50% deposit on the first month, standard invoicing after that," which left
a prospect to work out what the other 50% was and when it hit.

Changed:

- `pricing.html` — Starter plan terms now "$200 deposit before production,
  $200 on delivery. Pay by e-Transfer."; Growth plan terms now "$750 setup
  deposit, $750 with your second batch. $1,500/month after that." The "How
  does payment work?" FAQ was rewritten to cover both plans, the two named
  first-month payments, and the e-Transfer default. The CAD/no-tax line at
  the end of that answer is unchanged.
- `index.html` — the two `.plan-terms` lines under the pricing preview,
  matched to the pricing page.
- `terms.html` §2 — the Growth bullet now describes the two-part first
  month, and a new **Payment method** bullet names e-Transfer with card on
  request. Deliberately written in percentages ("50% of the first month's
  fee") rather than dollar figures, matching how the rest of §2 avoids
  hard-coding prices into the legal text.

**"Cancel anytime" softened to "Cancel with notice" (same day).**
`index.html`'s Growth plan-terms line used to read "Cheaper per video than
the one-off. Cancel anytime." The payment structure took its place, and the
cancellation half came back reworded. The "cheaper per video" half wasn't
restored and isn't missed — the section intro and the $187.50-vs-$200
`.plan-unit` figures both still make that point.

The reword was the founder's call on a real conflict: "Cancel anytime" was a
stronger claim than `terms.html` §5, which says a retainer is cancellable
"with notice as set out in the written agreement," with work already
produced or in production in the current cycle still payable. Marketing copy
promising no-notice cancellation while the terms require notice is the kind
of gap a client points at during exactly the conversation you don't want to
be having. Both pricing grids now say **"Cancel with notice."** — keep any
future rewrite on that side of the line.

Not changed: `quote.html`'s "Deposit in, concepts out" step reads correctly
under both structures, and the package radio labels quote plan prices, not
payment terms.

---

## 2026-08-16 — Growth repriced to $1,000/6, and ad length fixed at ~15s

Two founder decisions in brief §2.2 and §10, both carried into the site.

**Growth is now $1,000/mo for 6 videos, down from $1,500/mo for 8.** This is
not a discount — it's a smaller commitment. The 8-video pace had never
actually been produced, so selling it to the first retainer client meant
finding out on a paying client whether 8 good videos a month is sustainable.
6/month is a pace worth promising cleanly. $1,000 is also an easier recurring
number for a first-time prospect to agree to.

The per-video story the whole pricing page rests on still holds, which is
the thing to check if this ever moves again: **$166.67 on Growth vs. $200 on
Starter**. Growth has to stay under Starter's per-video rate or the "why
would I pay more to subscribe?" objection comes back and the FAQ answer
stops being true.

⚠ **$1,500/mo for 8 is deferred, not cancelled** (brief §10). It comes back
as a *higher* tier once there's real production experience to say 8/month
holds quality — don't treat the old numbers as retired copy if that day
comes.

Everything downstream scaled with it: biweekly batches of 4 → **3**, and the
first month's two named payments from $750 + $750 → **$500 + $500**. The
first-month structure itself is unchanged — still a setup deposit at signing
and a first invoice when the second batch lands, still totalling one full
month.

**Ads are ~15 seconds, and the site now says so.** Previously unstated
anywhere. It's on both plans' first bullet, in the How It Works "Concept"
step, and as a new pricing FAQ. Written throughout as the length that
performs on Reels/TikTok/Shorts — not as a cap on what you get, which is how
it would read if it appeared only as a spec line. Brief §10 is explicit about
that framing.

Changed:

- `pricing.html` — Growth price, `.plan-unit`, the 6-videos/batches-of-3
  bullet, plan terms; "an eight-video month" → "a six-video month" in the
  cheaper-per-video FAQ; batches of 4 → 3 in the turnaround FAQ; the payment
  FAQ's $750/$1,500 figures and both batch sizes. Meta description too — it
  quoted the old price. New **"How long are the ads?"** FAQ, making it nine.
- `index.html` — pricing preview: price, `.plan-unit`, the videos bullet, and
  the plan-terms line.
- `quote.html` — the Growth radio's label *and* its `value`. The value is
  what lands in the lead email, so a stale one would misquote the price to
  the founder reading it, not just the visitor.
- `how-it-works.html` — the timing section (four videos every two weeks →
  three; eight a month → six), plus the 15-second paragraph in "Concept".

Not changed: **`terms.html`** — §2 was deliberately written in percentages
("50% of the first month's fee") rather than dollar figures back on
2026-08-15, so a reprice doesn't touch the legal text at all. That choice
paid for itself the first time it was tested. Keep prices out of that file.
The rate-lock bullet is also rate-agnostic and still correct.

Starter is untouched: still $400 for 2 videos at $200 each, $200 + $200.

---

## 2026-08-16 — Quote-form leads now also land in a back office

`website/api/quote.js` gained one thing: after a successful Resend send, it
posts a copy of the lead to a new back-office app (`studio/` in this repo,
deployed separately at `legacylink-studio.vercel.app`). Leads used to exist
only as an email in `info@`; now they're also a row you can work through.

**The email is still the system of record, and the ordering is load-bearing:**

- The copy is posted only *after* the email succeeds.
- Every failure of that post — 401, 500, timeout, network down — is logged
  and swallowed. The visitor still sees success, because their lead *did*
  arrive.
- With `LEAD_INGEST_URL`/`LEAD_INGEST_KEY` unset, the post is skipped
  entirely and the form behaves exactly as it did before.

The consequence to remember: **a lead missing from the back office is never
proof nobody enquired.** Check the inbox. And a misconfiguration here cannot
show up as a broken quote form — it looks like leads arriving by email and
silently never appearing in the tool, with the reason only in the Vercel
function log. Don't reorder this to make the database authoritative without
first making the write reliable.

Env vars added to **this** Vercel project (`legacy-link`), both Sensitive:
`LEAD_INGEST_URL` and `LEAD_INGEST_KEY`. The key must match the same-named
variable on the back office's project — if they drift, ingest 401s silently.
Vercel only applies env vars to new builds, so a change needs a redeploy.

**Tested end to end on production, 2026-08-16.** A marked test lead
submitted to the live endpoint returned 200, arrived in the `info@` Zoho
inbox (founder-confirmed), and appeared as a `NEW` lead in the back office
with every field intact. Both halves verified by observation, not inference —
which matters here precisely because the failure mode is silent.

---

## Open items for the founder

Content decisions, not build gaps:

0. ~~**Currency is unmarked.**~~ Settled 2026-08-14: **CAD**. Marked on the
   plan prices, on both quote-form package options (so it's in the lead
   email too), in the homepage and pricing-page meta descriptions, and as
   an explicit "All prices are in Canadian dollars (CAD)" line under the
   pricing grid on `index.html` and `pricing.html`. Brief §2 records it.

   Two deliberate non-changes: the `.plan-unit` per-video figures sit
   directly under a price already marked CAD, and `about.html`'s `$5,000`
   is the agency-comparison figure, not our price.

   **Tax, settled the same day:** the studio isn't GST/HST-registered, so
   no tax is charged and the listed price is the total. The site says so
   outright — "No tax is added — what you see is what you pay" — because for
   a contractor comparing quotes that reads as a selling point, not a
   disclaimer.

   **Framed as launch pricing (also 2026-08-14).** $400 and $1,000 (the
   Growth figure was $1,500 until 2026-08-16) are presented as launch rates
   that will rise as the portfolio builds, so a later increase reads as
   planned rather than opportunistic.

   Deliberately **no public deadline and no client-count cap** — the real
   trigger is GST/HST registration, which can't go on the site (it would be
   odd to prospects and would expose revenue), and a fake deadline that gets
   extended is worse than no deadline at all.

   What replaces the deadline is the **rate lock**: a Growth client who
   signs at the current rate ($1,000/mo) keeps it for as long as the retainer
   runs uninterrupted. That's honest urgency — the benefit is real and permanent
   for whoever signs early — and it costs little while the client count is
   low. Starter locks nothing; each one-off batch is priced when ordered.

   ⚠ **The rate lock and the tax are two separate promises, on purpose.**
   The locked *fee* stays whatever was signed; tax would sit on top of it,
   not be absorbed into it. `terms.html` §2 and the pricing FAQ both say this
   explicitly. Collapsing it into a friendlier "your price never changes"
   would commit the studio to eating ~13% on every grandfathered retainer —
   don't let a copy edit do that quietly.

   ⚠ **The "no tax" half expires on its own.** Registration is mandatory
   past $30,000 in taxable revenue over four consecutive quarters — at
   current rates, roughly 75 Starter batches in a year, or about 2.5 Growth
   clients running the full year. (This previously read "roughly 19 Starter
   batches," which was simply wrong arithmetic — 19 batches is $7,600. The
   threshold is further off than that line implied, but two or three running
   retainers still reach it inside a year.) The day
   it happens, "No tax is added" is false and comes off the site. Brief §2
   carries the trigger; §10 adds the matching open decision of when launch
   pricing actually ends, since nothing now forces that on its own.

1. **Logo.** The old gold Celtic-tree crest set in a serif conflicted with
   §8.3 ("no serif anywhere on this site") and read memorial rather than
   B2B. The root-level copy is deleted; `website/image/legacy_link_logo.png`
   remains in the repo, unused by any page. The nav is now a plain Space
   Grotesk wordmark — `image/mark.svg` was removed from the header on
   2026-08-13 and survives only in the footer and as the favicon. Commission
   a real logo when there's budget for one.
2. **Turnaround time.** The site says a Starter batch typically lands
   "within about a week." The brief doesn't specify a turnaround — this was
   inferred from Growth's biweekly batch cadence (batches of 4 at the time;
   3 since 2026-08-16, which if anything makes a week more comfortable). Confirm it's a
   promise you want to make, or change the wording.
3. ~~**Contact email.**~~ Settled 2026-08-13, and now actually working as
   of 2026-08-14: `info@legacylinkstudio.com` is live on Zoho Mail, tested
   receiving a real external email straight to the inbox (not junk). See
   next-steps item 2 for the full setup record.
4. **Usage rights** (brief §10) — `terms.html#usage-rights` states a
   reasonable default position and carries a visible note that it's still
   an open founder decision. Settle it before the first paying client.
5. **Phone number** — none is published anywhere; none was supplied. Roofers
   and contractors often prefer to call. Worth adding one.
6. ~~**Payment method.**~~ Settled 2026-08-15: **Interac e-Transfer is the
   default for every payment**, with Stripe (card) available on an
   individual payment only when a client asks for it. Named on the site in
   `terms.html` §2 and the pricing FAQ, and on the Starter plan-terms line.
   The Growth first month was relabeled the same day as a setup deposit +
   first invoice split ($750 + $750 then; $500 + $500 since the 2026-08-16
   reprice, still one full month's fee either way). See the 2026-08-15
   entry above for the full record and for the "Cancel anytime" wording
   question it surfaced.

   Still a content decision, not a build: nothing is wired up in the repo,
   and nothing needs to be — e-Transfer is sent from a client's own bank,
   and a Stripe card link would be created ad hoc for the rare payment that
   asks for one.

## Where things stand — end of 2026-08-17

⚠ **The v2 rebuild is finished in the repo but has not been deployed.**
Production still serves v1 copy. Where a row below says "live", that means
*v1 is live* unless it says otherwise.

| Piece | State |
|---|---|
| Marketing site — production | Live at `legacylinkstudio.com`, still **v1 copy**: Starter $400 / Growth $1,000, "creative only". Contradicts brief v2. |
| Marketing site — repo | **v2 complete**, all 8 pages. Never rendered in a browser. Unpushed. |
| Quote form | Live and working (v1 field set). The back-office copy step was removed; it emails `info@` and nothing else. |
| Back office (`studio/`) | **Deleted 2026-08-17** per brief v2 §7. Recoverable from git history; `.env` backed up outside the repo. |
| Database | Neon `legacylink-studio` — **still exists, empty, and should be deleted.** |
| Retired QR product | Gone everywhere: code, both Vercel projects, Railway, DNS. |

**The one real gap** is no longer the back office — it's that an entire copy
rebuild is sitting unrendered and unshipped. Nothing about v2 has been seen
on a screen, and the three new CSS components are the specific risk.

### Next up

1. Render the v2 site in a browser, fix what that turns up, deploy.
2. The three manual jobs listed in the 2026-08-17 entry above (delete the
   `legacylink-studio` Vercel project, remove the two dead `LEAD_INGEST_*`
   env vars, delete the Neon database).
3. **Marketing site** — the four items below, unchanged from before.

---

## Older next steps — carried over from 2026-08-15

Blocked on a founder decision (quick, do these first):

1. ~~**Decide CAD vs USD**, and whether tax is added.~~ Both settled
   2026-08-14: CAD, no tax charged, stated site-wide. What remains is not a
   task but a **watch item** — see the $30k registration trigger in open
   item 0, which will force the "no tax is added" copy off the site.
2. ~~**`info@legacylinkstudio.com` doesn't receive mail.**~~ **Closed
   2026-08-14.** Real mailbox, not forwarding — chose Zoho Mail Lite
   (~$1.25/mo/user) over free-tier Zoho so Loyal Tale's domain can share
   the same paid organization (free Zoho caps at one domain per org).
   `info@` is set up as an alias on the mailbox (display name "LegacyLink
   Studio"), not a second license, so it's ~$1.25/mo for this domain.

   Full DNS stack confirmed live from Namecheap's own authoritative
   nameserver (not just public resolvers) before calling this done:

   | Record | Value | Host |
   |---|---|---|
   | MX ×3 | `mx.zohocloud.ca` (10), `mx2.zohocloud.ca` (20), `mx3.zohocloud.ca` (50) | `@` |
   | SPF | `v=spf1 include:zohocloud.ca ~all` | `@` |
   | DKIM | selector `zmail._domainkey`, RSA key from Zoho | `zmail._domainkey` |
   | DMARC | `v=DMARC1 p=none; rua=mailto:info@legacylinkstudio.com` | `_dmarc` |

   Account turned out to be on Zoho's **Canada-region infrastructure**
   (`zohocloud.ca`, not the generic `mx.zoho.com`/`zoho.com` most guides
   assume) — worth remembering if this ever needs touching again, since
   the generic values are wrong for this account specifically.

   Two real snags along the way, both resolved, worth knowing if similar
   symptoms show up on the Loyal Tale domain later:
   - The verification TXT was first entered with **Host = `host`** (typing
     the literal word instead of `@`), which created a real but wrong
     record at `host.legacylinkstudio.com`. Verification will never pass
     against the wrong hostname no matter how long you wait — this isn't a
     propagation issue, it's a wrong-host issue, and looks identical to one
     from the UI.
   - The DKIM TXT record failed to save in Namecheap's UI multiple times
     with a generic "Failed to save record" error, no explanation, despite
     a near-identical-length key (Resend's) already saving fine elsewhere
     on the same domain. Resolved by a full page reload + re-adding via
     ADD NEW RECORD rather than continuing to retry the same stuck row —
     never got a root cause, treat as a Namecheap UI flake if it recurs.

   **Tested end to end, both directions, confirmed 2026-08-14:** an
   external email to `info@` landed in the Zoho inbox — in the primary
   inbox, not junk, confirming SPF/DKIM/DMARC are all doing their job. A
   reply sent from `info@` was confirmed to display as `LegacyLink Studio
   <info@legacylinkstudio.com>` on the recipient's end, not the founder's
   personal name. Nothing left to verify on this item.

   **Resend's records were kept, deliberately, throughout.** Zoho (human
   inbox) and Resend (the quote-form backend's automated send) are separate
   systems doing different jobs. Resend's DKIM/SPF stayed on Namecheap the
   whole time: `resend._domain...` (DKIM) and `send → v=spf1
   include:amazonses.com ~all` (SPF, on the **`send` subdomain**, not `@`).
   That subdomain placement is also why the SPF-merge concern raised
   earlier never actually applied — Zoho's SPF sits on `@`, Resend's on
   `send`, different hostnames, no collision.

   ~~**What's left is the separate, already-flagged item:** `RESEND_API_KEY`
   still isn't set on the marketing site's Vercel project~~ — done, same
   day. See the 2026-08-14 "Resend wired up" entry above.
3. **Open the live site on a real phone.** Now the *only* unverified piece
   of the responsive work, and a much smaller one than it was: the
   2026-08-14 entry rules out the structural causes statically (viewport
   meta present on all 8 pages, all three breakpoints fire at 390px, no
   fixed widths, every column grid collapses by 760px). What's left is
   purely visual — does the hamburger open under a real touch, does any
   text overflow, do the tap targets feel right. One pass on an actual
   handset closes it.

Ready to do, no decision needed:

4. Produce 1–2 spec videos (brief §9 item 2) and drop them into the hero
   reel slot and the `work.html` grid — both are already wired for it.
   `index.html` carries a commented `<video>` snippet, and `work.html` a
   commented card template.
5. Get the legal pages reviewed before taking on a paying client. The
   jurisdiction is now known (Ontario / PIPEDA), which is worth telling
   whoever reviews them.
6. ~~Fix "finalised" → "finalized" in `terms.html`.~~ Done 2026-08-14.
7. ~~Wire the quote form to a real backend.~~ Built 2026-08-14, and fully
   working the same day:
   1. ~~Create a Resend account and add `legacylinkstudio.com` as a domain.~~
      Done — account already existed, domain added.
   2. ~~Add the DKIM/SPF records Resend gives you **at Namecheap**~~ — DKIM
      and SPF already existed from the mailbox setup; added the one missing
      piece (an MX record on `send`). Domain shows Verified.
   3. ~~Set `RESEND_API_KEY` on the **marketing site's** Vercel project, then
      redeploy.~~ Done — set on `legacy-link` (Production + Preview),
      redeployed. `LEAD_INBOX`/`LEAD_FROM` left at their defaults.

   ~~**Submit one real test lead after deploying**~~ — done: a marked test
   submission through the live form returned the real success state and
   shows **Delivered** in Resend's log. See the 2026-08-14 "Resend wired up"
   entry above for the full record.
8. Add a phone number if you want one (open item 5). Also asked on
   2026-08-14 and left unanswered.

Worth knowing before touching deployment config: read the Vercel trap in the
2026-08-13 entry above. Redirects, headers, and rewrites for this site go in
**`website/vercel.json`**, because Vercel reads config from the project's Root
Directory (`website`). Put them anywhere else and they fail silently — green
deploy, config ignored.

The repo-root `vercel.json` those older entries warn about was **deleted on
2026-08-16**, once it was confirmed this project never read it. So the trap is
now only about *where you add* config, not about an existing file fighting you.
Note the marketing project also carries an Output Directory override set in the
Vercel dashboard itself, independent of any file — leave it alone while the
site works.
