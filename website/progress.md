# LegacyLink Studio Website — Progress Log

Tracks build status for the marketing site in this `website/` folder against
`LegacyLink_Studio_Master_Build_Brief.md`.

Per `CLAUDE.md`, this folder deploys as its own Vercel project to
`legacylinkstudio.com` (repo-root `vercel.json`, `outputDirectory: website`)
— separate from the Fastify API, admin app, and ops dashboard, which deploy
to their own subdomains from other folders in this repo. It is plain static
HTML/CSS/JS with no build step.

**Scope note:** the rest of this repo (`src/`, `admin/`, `ops-dashboard/`,
`lambda/`, `prisma/`) is a separate, larger QR-memorial product that predates
this site's current purpose and is not tracked here.

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
| Services & Pricing | `pricing.html` | §2, §6 | ✅ Starter/Growth comparison, explicit "creative only" scope block, 8-question FAQ accordion |
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

**Not live until three things happen outside this repo** — see next steps.

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

   **Framed as launch pricing (also 2026-08-14).** $400 and $1,500 are now
   presented as launch rates that will rise as the portfolio builds, so a
   later increase reads as planned rather than opportunistic.

   Deliberately **no public deadline and no client-count cap** — the real
   trigger is GST/HST registration, which can't go on the site (it would be
   odd to prospects and would expose revenue), and a fake deadline that gets
   extended is worse than no deadline at all.

   What replaces the deadline is the **rate lock**: a Growth client who
   signs at $1,500/mo keeps it for as long as the retainer runs
   uninterrupted. That's honest urgency — the benefit is real and permanent
   for whoever signs early — and it costs little while the client count is
   low. Starter locks nothing; each one-off batch is priced when ordered.

   ⚠ **The rate lock and the tax are two separate promises, on purpose.**
   The locked *fee* stays $1,500; tax would sit on top of it, not be
   absorbed into it. `terms.html` §2 and the pricing FAQ both say this
   explicitly. Collapsing it into a friendlier "your price never changes"
   would commit the studio to eating ~13% on every grandfathered retainer —
   don't let a copy edit do that quietly.

   ⚠ **The "no tax" half expires on its own.** Registration is mandatory
   past $30,000 in taxable revenue over four consecutive quarters — roughly
   19 Starter batches, or under two Growth clients running a year. The day
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
   inferred from Growth's biweekly-batch-of-4 cadence. Confirm it's a
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

## Next steps — picking up 2026-08-15

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

   **Tested end to end:** an external email to `info@` landed in the Zoho
   inbox — in the primary inbox, not junk, confirming SPF/DKIM/DMARC are
   all doing their job. Reply-side branding (recipient sees `LegacyLink
   Studio <info@legacylinkstudio.com>`) not yet independently confirmed —
   worth one more check next time the inbox is open, low risk either way
   since the alias was configured with that display name from the start.

   **Resend's records were kept, deliberately, throughout.** Zoho (human
   inbox) and Resend (the quote-form backend's automated send) are separate
   systems doing different jobs. Resend's DKIM/SPF stayed on Namecheap the
   whole time: `resend._domain...` (DKIM) and `send → v=spf1
   include:amazonses.com ~all` (SPF, on the **`send` subdomain**, not `@`).
   That subdomain placement is also why the SPF-merge concern raised
   earlier never actually applied — Zoho's SPF sits on `@`, Resend's on
   `send`, different hostnames, no collision.

   **What's left is the separate, already-flagged item:** `RESEND_API_KEY`
   still isn't set on the marketing site's Vercel project, so the quote
   form itself still shows the failure notice and falls back to mailto in
   production. Fixing today's mailbox problem didn't fix that one — they're
   independent, and this is now the only remaining piece before the quote
   form works end to end. See "Not live yet" a few sections up.
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
7. ~~Wire the quote form to a real backend.~~ Built 2026-08-14. **But it is
   not working until the founder does these three, in order:**
   1. Create a Resend account and add `legacylinkstudio.com` as a domain.
      (Free tier is 100 emails/day — far past this site's volume.)
   2. Add the DKIM/SPF records Resend gives you **at Namecheap**, since DNS
      is not delegated to Vercel (see CLAUDE.md). Wait for verification.
   3. Set `RESEND_API_KEY` on the **marketing site's** Vercel project, then
      redeploy. Optional: `LEAD_INBOX`, `LEAD_FROM`.

   Until step 3, the form shows the failure notice and falls back to
   mailto — degraded, but not lead-dropping. **Submit one real test lead
   after deploying** and confirm it arrives; this is the one path where a
   silent failure costs actual money.
8. Add a phone number if you want one (open item 5). Also asked on
   2026-08-14 and left unanswered.

Worth knowing before touching deployment config: read the Vercel trap in
the 2026-08-13 entry above. Redirects, headers, and rewrites for this site
go in `website/vercel.json`; the repo-root file is not read by this
project, and putting them there fails silently with a green deploy.
