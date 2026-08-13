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

## Open items for the founder

Content decisions, not build gaps:

1. **Logo.** The old `image/legacy_link_logo.png` — an ornate gold Celtic
   tree crest set in a serif — conflicts with §8.3 ("no serif anywhere on
   this site") and reads memorial rather than B2B. The site now uses a
   simple amber play-mark (`image/mark.svg`) plus a Space Grotesk wordmark.
   The old PNG is still in the repo, unused. Replace the mark with a real
   designed logo when there's budget for one.
2. **Turnaround time.** The site says a Starter batch typically lands
   "within about a week." The brief doesn't specify a turnaround — this was
   inferred from Growth's biweekly-batch-of-4 cadence. Confirm it's a
   promise you want to make, or change the wording.
3. ~~**Contact email.**~~ Settled 2026-08-13: `info@legacylinkstudio.com`
   is the address, used throughout the site and as the `data-inbox` the
   quote form composes to. It replaced `hello@`, which was carried over
   from the old site. Just confirm the mailbox is live and monitored —
   every conversion path on the site lands there.
4. **Usage rights** (brief §10) — `terms.html#usage-rights` states a
   reasonable default position and carries a visible note that it's still
   an open founder decision. Settle it before the first paying client.
5. **Phone number** — none is published anywhere; none was supplied. Roofers
   and contractors often prefer to call. Worth adding one.

## Next steps

1. Produce 1–2 spec videos (brief §9 item 2) and drop them into the hero
   reel slot and the `work.html` grid — both are already wired for it.
2. Get the legal pages reviewed before taking on a paying client.
3. Wire the quote form to a real backend when one is chosen, and update
   `privacy.html` §9 accordingly (it currently states no form backend
   exists, which is accurate today).
4. Do the DevTools responsive-mode pass noted above.
