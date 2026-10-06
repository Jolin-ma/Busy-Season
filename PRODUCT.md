# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Scope of this record

This file covers the **public marketing site** (`website/`, deployed to `busyseason.ca`). There is no custom back office (removed 2026-10-02); enquiries arrive through a Formspree form and are tracked in a spreadsheet.

The authoritative business spec is `BusySeason_Master_Build_Brief_v4.md` (v4.0, 2026-10-05), which supersedes v3.2 and everything earlier. `CLAUDE.md` and `website/progress.md` carry operational and build history. Where this file and the brief disagree, the brief wins unless the founder has since overruled it.

## Users

**Primary user:** the owner of a **marketing agency or a solo / small-team Meta media buyer** whose clients are home service businesses (HVAC, roofing, snow removal, windows and doors, landscaping, garage doors, plumbing). In priority order (brief §3): solo media buyers or 1–3 person teams running 5–10 contractor accounts; small agencies (2–15 people) with no in-house video; web/SEO shops serving trades; larger contractor agencies (for overflow); white-label resellers.

**Situation:** a marketing-literate buyer who is good at media buying and weak at production. Their clients' creative fatigues every few weeks, and refreshing it means booking a videographer or chasing a contractor for footage that never arrives. They usually land on the site from a link in a cold email or LinkedIn DM, on a phone.

**Job to be done:** in about 90 seconds, watch two or three ads and decide whether this studio is a reliable production arm worth replying to. They care about turnaround, reliability, formats, and whether the creative will perform, not about art.

**Not a user:** contractors and homeowners. No copy is written to them anywhere (since 2026-10-05).

## Product Purpose

Busy Season is a **white-label production studio** that makes short-form video ad creative for agencies running Meta ads for home service businesses. The agency owns the client relationship and the ad account; the studio is the production arm behind it, and the agency's client never sees the Busy Season name.

The site's job is to back up outreach, not to generate its own traffic. Everything on it serves the 90 seconds after an agency owner clicks through.

**Success** = an agency replies, takes a paid trial batch of 2–3 videos, and comes back for repeat batches. The funnel is outreach → reply → sample → trial batch → repeat batch (brief §7).

The business is also a resume portfolio project for the founder (brief "Portfolio Goals"). **The public site never says so.** It presents as a real studio, because it is one.

## Positioning

A dependable production partner, not an artist. Hero line: *"White-label video ads for agencies running home service accounts."* Supporting line, matching the Instagram bio: *"You sell. We create."*

What the studio sells to an agency: fresh creative on a refresh cadence, with no shoot to schedule and no footage to chase, back in 3 to 5 business days, unbranded, in every format. AI-assisted production is why turnaround is days and the price works for refresh volume. That is said plainly when asked, never dodged.

Tone: plain, direct, short sentences. A capable supplier that respects a marketing professional's time. No hype vocabulary ("elevate", "unleash", "game-changing").

## Operating Context

- **Sales motion is outbound, written first:** email or LinkedIn DM with a link to the home or Work page, follow-ups at day 5 and day 12, then stop. Phone only for people who replied. No deck. The site closes; outreach discovers. Don't over-invest in SEO or content.
- **The site is geography-agnostic.** Agencies can be anywhere in Canada or the US. "Oshawa, ON" appears once, in the "Who's behind it" block, as a real-person signal, not a service area.
- **Agency workflow (brief §5):** brief → concept/script approved by the agency → AI-assisted production (client assets used where supplied) → internal QA → delivery in all requested formats, unbranded → one revision round per batch → follow-up asking how the creative performed.
- **Client assets are welcome but optional.** No published sample has been built from real client photos, so the site never claims that method.
- **Pricing is never on the site** (brief §4). Working numbers live in the pitch and the agency agreement. Payment is 50% upfront on the first batch, net terms in writing after; Interac e-Transfer default, Stripe on request; CAD unless agreed otherwise.
- **Instagram (@busyseasonn)** is a portfolio for agency outreach, linked from the footer. No other social links.

## Capabilities and Constraints

**What the agency gets (the "What you get" list):** 15 second ads in 9:16, 1:1 and 16:9 · one revision round per batch · fully white label, no watermark or credit · we never contact your clients · flexible volume, one-off batches or ongoing refreshes. Turnaround 3 to 5 business days per batch once the brief is in. A small paid trial batch is offered; a free sample only for an agency that has replied and has real volume (handled in conversation, not promised on the site).

**Explicitly out of scope:** campaign setup or management, ad account access of any kind, media buying, landing pages and websites, CRM, SEO, organic social, any direct contact with the agency's clients.

**Copy rules (brief §6), the main way this site goes wrong:**

1. Talk to agencies only. "Your clients," never "your customers" or "your business."
2. No prices anywhere: not per video, not "starting at," not ranges. The FAQ answer on cost is "Per video, depending on volume. Email for rates."
3. No campaign management claims, and no ad account access.
4. Never claim the samples were built from real client photos.
5. No fake proof: no testimonials, client logos, "trusted by" bars or client counts until real ones exist with written permission.
6. Say "white label" plainly, and say the studio never contacts the agency's clients.
7. Answer "is this AI?" honestly.
8. Plain words. Short sentences.

**Retired in v4, never to reappear:** Launch Pack, Single Video, Growth, any dollar figure, recommended ad spend, "all in", the free spec ad for contractors, the deposit-back guarantee, "We make your video ads and launch them for you", campaign setup, handover, ad account access, the before/after photo showcase.

**Pages (and only these):** `index.html` (Home), `work.html`, `contact.html`, `terms.html`, `privacy.html`. Old URLs (pricing, how-it-works, about, quote, samples, zh) are 301 redirects in `website/vercel.json`, which also sets `cleanUrls: true`. Old links in past outreach and captions must never 404.

**Legal:** `terms.html` is written for agency engagements and states money in **percentages, never dollar figures**, so repricing never touches it. It carries a `NEEDS LEGAL REVIEW` comment. Both legal pages are `noindex`.

**Technical constraints:**

- **Static HTML/CSS/JS, no build step, no `node_modules`.** One HTML file per route, sharing `styles.css` and `script.js`. Adding a dependency means adding a build step, so reconsider first.
- **The contact form is the conversion point.** Fields: name, agency or company, email, home service accounts run (optional: 1 to 5 / 6 to 15 / 16+), what you need (optional). It posts to Formspree (system of record, emails each enquiry on); on failure the page offers a pre-filled email to `info@busyseason.ca` so nothing is dropped. Honeypot field `company_website`.
- **Video:** compressed web versions (H.264, 720×1280, `+faststart`, ideally under 4 MB) with a webp poster. Sample cards use `preload="none"` and play muted only when scrolled into view (`data-autoplay-visible`); tapping a video toggles sound. Masters live in `assets-source/` (gitignored).
- Deploy is push-to-`main` (Vercel, git-connected, Root Directory `website`, config at `website/vercel.json`, not the repo root).

**Terminology:** "white label", "batch" (one order of videos), "trial batch", "refresh", "the brief" (the agency's account details), "spec work" (the studio's own samples). Primary CTA wording is **"Ask about a sample"** site-wide, linking to Contact.

## Brand Commitments

- **Name:** Busy Season. Domain `busyseason.ca`. Email `info@busyseason.ca`, and all outreach goes from the domain, never Gmail. `legacylinkstudio.com` is fully retired.
- **Why the name still fits:** agencies running home service accounts live by their clients' seasons. But the name doesn't say what the studio does, so the hero states it plainly with no wordplay. Page title pattern: "Busy Season · White-Label Video Ads for Agencies".
- **No "AI" in any public-facing name.** Avoid generic agency vocabulary (Apex, Elevate, Summit, Peak, Digital, Solutions).
- **Never reference or link to the founder's other business (Loyal Tale)** anywhere a visitor can see. The two are marketed as fully independent.
- **Logo/wordmark:** typographic, headline sans at semibold, no icon mark. Not planned.
- **The founder is named:** Jolin, based in Oshawa, ON, in the Home "Who's behind it" block. No photo yet. Don't invent a bio beyond what the brief states.

**Design system:** see `DESIGN.md`. In short: cool paper and deep charcoal, one amber action colour, steel blue for support, Space Grotesk + Inter, no serif, crisp 6px/10px geometry, video-first. Kept from v3 with the pricing, all-in, guarantee and before/after components removed.

## Evidence on Hand

- **`BusySeason_Master_Build_Brief_v4.md`**: the full spec, including the §11 rebuild work order and change log.
- **`website/progress.md`**: build log; the 2026-10-05 entry records the v4 rebuild.
- **Published samples (all studio spec work, AI-assisted):** HVAC "First cold night" (also the hero), snow removal (its Instagram reel reached 816 views), and the redone roofing ad. All 15s, 9:16.
- **`ffmpeg`** (winget Gyan build) works on this machine for re-encodes and posters.

**Deliberate absences future work must NOT fabricate:**

- **No agency clients yet, no delivered batches, no performance data, no testimonials, no logos.** Agency client work never appears publicly unless the agency agrees in writing; the public site shows the studio's own spec work only.
- **No sample built from real client photos exists.** A "photos in, ad out" piece from licensed stock photos may be added to Work later, captioned honestly (brief §2).
- **Unused or held-back media:** the old photo-built roofing ad (`finished-ad`) and old `roof1` are retired. `hvac1` has a burnt-in typo ("FURNANCE") and stays off. The HVAC technician-to-camera ad (`hvac2`) was dropped by the founder.
- **No 16:9 or 1:1 sample is published yet**, even though those formats are offered.

## Product Principles

1. **Copy accuracy is the main risk, not visual polish.** Most failures are claims that outrun what the studio does: prices, campaign management, client results, real-photo claims. Run the brief §11.4 search sweep after any copy change.
2. **The work is the pitch.** Video gets the most space on every page. Fewer, bigger, better.
3. **One action:** "Ask about a sample." Never split attention.
4. **Fast on a phone.** The visitor came from an email on mobile. Posters first, lazy video, nothing heavy above the fold.
5. **Confidence over warmth.** A dependable supplier talking to another professional. Plain statements, no hype, no art-speak.
6. **White label is the promise.** Say it plainly, and never do anything on the site that reads as competing with the agency for its clients.

## Accessibility & Inclusion

- **WCAG AA contrast is a hard floor.** Amber is 6.67:1 on charcoal and 2.55:1 on paper, so amber is never text, an icon or a focus ring on light grounds. Steel takes those roles there. Near-black on the amber button is 6.46:1.
- **Mobile-first and touch-first:** 44×44px minimum touch targets, especially on the contact form and sound toggles.
- Full keyboard navigation with visible focus states (steel on light, amber on dark).
- Video never autoplays with sound, uses `muted playsinline`, shows a poster first, and degrades gracefully on slow connections.
- `prefers-reduced-motion` is respected: transitions are cut, and no video plays on its own. The sample cards and the hero reel stay still until someone taps for sound.
