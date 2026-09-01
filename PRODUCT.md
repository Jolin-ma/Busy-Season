# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Scope of this record

This file covers the **public marketing site** (`website/`, deployed to `busyseason.ca`). The `studio/` back office (Next.js + Prisma; clients, production pipeline, leads inbox) is a restored internal tool that supports operations but is not the subject of this product record or of design work driven by it. If the back office ever needs its own design treatment, give it its own PRODUCT scope then.

The authoritative business spec is `BusySeason_Master_Build_Brief.md` (v2), which supersedes v1 entirely. `CLAUDE.md` and `website/progress.md` carry operational and build history. Where this file and the brief disagree, the brief wins unless the founder has since overruled it (as with the back office, brief §7).

## Users

**Primary user:** the owner or operator of a home service business — roofing, HVAC, windows and doors, plumbing, landscaping, snow removal, gutters, garage doors, interior renovation and basement finishing. Roofing is the flagship example; the site speaks to home services broadly so it never contradicts off-season outreach.

**Situation:** a busy small-business owner with no in-house marketing or video capability, who is used to paying for lead generation. Often first sees the site on a phone, prompted by a cold email, call, or in-person approach — sometimes standing on a job site. Has roughly five minutes and wants to know exactly what they get, what it costs, and what it costs *all in*.

**Job to be done:** decide whether this studio can reliably get their phone ringing with booked jobs, without the owner having to learn advertising or hand over money they can't see.

**Secondary context:** the founder is the other reader of the site during outreach calls — the site's job is to close deals that outreach opens, not to generate its own traffic.

## Product Purpose

Busy Season is a small AI-assisted video ad studio for home service businesses that **produces the video ads and runs them as Meta campaigns** on the client's own ad account. The client receives finished 15-second video creative *and* a live, managed campaign, plus a monthly plain-language performance readout on the Growth plan.

It exists as a deliberate parallel revenue stream to a separate consumer business (Loyal Tale): it reuses production tooling already being paid for, it generates cash per client in weeks rather than months, and it is intentionally the leaner of the two operations.

**Success** = a contacted contractor becomes a paying client (free spec ad → $750 Launch Pack → $1,500/mo Growth), and Growth clients stay on the retainer because live ads keep producing calls.

## Positioning

*"We make the video ads that get your phone ringing — and we run them for you."* This positioning statement doubles as the tagline; there is no separate clever tagline.

The mechanism a neighboring studio cannot truthfully copy: **the ads are hybrids built around the client's real work.** The client's own job-site photos, before/afters, drone shots, phone footage, crew, trucks and logo carry the trust; AI carries the production value — hook, motion, camera moves, transitions, b-roll, atmosphere, text treatment, polish. This defeats the "is this AI?" objection, makes the work meaningfully better than a generic AI render, and is a moat against anyone else with a video-AI login. Purely AI-generated footage is a deliberate anti-pattern for this business — a homeowner choosing a $15,000 roof is making a trust decision, and a house/crew/truck that don't exist read as trust-negative.

Tone: confident, results-oriented, unapologetically commercial — a studio that understands small-business marketing, not a creative agency selling art. Deliberately the opposite register from the founder's consumer brand.

## Operating Context

- **Sales motion is outbound.** Several hundred contacted Durham Region / East GTA contractors determine whether the business works; the website closes, it does not discover. Don't over-invest in SEO or content.
- **Seasonality drives which verticals outreach leads with** (Aug–Oct: snow removal, HVAC, windows/doors, gutters; Nov–Feb: roofing, interior reno; Mar–May: roofing, landscaping, paving; storm response any time). The public site stays vertical-led and season-agnostic so it never contradicts the current outreach focus.
- **The site is geography-agnostic on purpose.** The founder operates out of Oshawa / Durham Region, but location is a rapport lever in conversation, not a website claim — a hard-coded local claim would cap the pitch.
- **The site is bilingual: English and Simplified Chinese.** The GTA — Markham, Richmond Hill, Scarborough especially — has a large population of Chinese-Canadian home-service business owners, and a cold approach in their own language closes better. English lives at the root; Simplified Chinese is a parallel static set under `/zh/`. This is a distribution lever for outreach (send a prospect the URL that fits), not an SEO play — there is no auto-detection or language redirect. Traditional Chinese was considered and deferred; if it's ever added it's a third `/zh-hant/` set, not a replacement.
- **Client workflow:** intake + asset collection → client grants Meta ad account + Page access → concept/script sanity check → hybrid production → internal QA → one client revision round per batch → campaign build & launch → ongoing optimization → monthly readout.
- **Client job photos (20–30 recent) are a required intake item**, framed to the client as a feature ("send us 30 photos off your phone…"), not a chore.
- **The studio never takes custody of ad spend.** The client's own payment method sits on the client's own ad account; the studio holds partner/admin access only. This must be stated plainly on the site.
- **Payment:** Interac e-Transfer is the default for one-offs and deposits; pre-authorized debit or card on file is pushed for the recurring retainer. Card (Stripe) is offered only on request, never as a menu item — the copy is deliberately phrased as an exception to avoid processing fees on payments that would otherwise be free.
- **Currency is CAD**, marked explicitly on plan cards and with an "All prices are in Canadian dollars (CAD)" line on the homepage and pricing page.

## Capabilities and Constraints

**Offer ladder (launch rates, presented as launch rates that will rise):**

| Rung | What it is | Price |
|---|---|---|
| Spec ad | One free sample ad built for their business | Free |
| Launch Pack | 3 videos (~15s) + one-time Meta campaign setup, one revision round, ~2 weeks | $750 CAD one-off |
| Growth | 4 videos/mo in biweekly batches of 2 + managed Meta campaign + monthly readout, one revision round per batch, month-to-month | $1,500 CAD/mo |

- **Per-video rate is higher on Launch Pack ($250) than Growth ($375 nominal but never sold per-video)** — the pricing page's "why is Growth cheaper per video?" logic depends on Growth staying below the one-off's per-unit rate. If prices move, that relationship must hold.
- **All-in cost is stated everywhere the fee is** — studio fee + recommended ad spend + total, as a real reusable component, never grey-on-grey. Growth all-in is framed as "most clients are investing $2,500/month all in" (recommended $1,000+ spend).
- **Risk reversal leads the copy hierarchy, above the rate lock:** Launch Pack 50% deposit refunded in full if the client dislikes the first drafts; Growth is month-to-month, cancel with 30 days notice, no contract. This gets its own visually prominent block, not fine print. Marketing copy says "cancel with notice" — never "cancel anytime" — to stay consistent with `terms.html`.
- **Rate lock** (a Growth client keeps their signing rate as long as the retainer runs uninterrupted) is a supporting reason, demoted below the guarantee.
- **Explicitly out of scope, stated plainly on the site:** Google Ads, landing page / website builds, CRM setup, answering or qualifying leads, SEO, organic social management. Meta only at launch.
- **Ad length ~15 seconds**, consistent across both offers; framed as the length that performs on Reels/TikTok/Shorts, not as a cap. Revisit after ~3 months of live campaign data.
- **`terms.html` states money in percentages, never dollar figures** ("50% of the first month's fee") so repricing never touches the legal text. Keep it that way.
- **Both legal pages carry a visible "NEEDS LEGAL REVIEW" banner and are `noindex`.** Terms of Service and Privacy Policy have not had legal review.

**Technical constraints:**

- The marketing site is **static HTML/CSS/JS with no build step and no `node_modules`** — one HTML file per route, sharing `styles.css` and `script.js`. This is deliberate. The only dynamic piece is `website/api/quote.js`, a zero-dependency CommonJS Vercel serverless function behind the quote form. Adding a dependency to `website/` means adding a build step — reconsider first.
- **The quote form is the single most important conversion point.** It emails each lead to `info@busyseason.ca` via Resend; the email is the system of record. Every failure path deliberately logs the full lead payload before returning an error — that is the recovery mechanism, not noise to clean up.
- Deploy is push-to-`main` (Vercel, git-connected, Root Directory `website`, config at `website/vercel.json` — not repo root).

**Terminology:** "spec ad" (the free sample), "Launch Pack", "Growth", "all-in" (fee + spend), "readout" (the monthly performance summary), "hybrid" (real footage + AI production). Primary CTA wording is **"Get a Free Sample Ad"** site-wide — it outperforms "Get a Quote" because it offers something concrete. The `quote.html` filename is kept so no redirect is needed.

## Brand Commitments

- **Name:** Busy Season. Domain `busyseason.ca` (registered 2026-08-21, replacing `legacylinkstudio.com`, which is fully retired and decommissioned — not redirected). The rename from LegacyLink Studio is complete across DNS, Zoho, Resend, Vercel, Neon, and GitHub.
- **The name now does more of the explaining than "LegacyLink Studio" did**, but the hero headline must still state plainly what the studio does — makes the ads *and* runs them — with no wordplay on the company name. Page `<title>`s pair the wordmark with a descriptor ("Video Ads for Home Services"). Revisit whether all the v1 name-compensation copy guidance is still load-bearing; "Busy Season" is more self-explanatory to a contractor.
- **No "AI" in any public-facing name** (sub-brands, product names, campaign names) — it invites the "is this fake?" objection before the pitch starts. Avoid generic agency vocabulary (Apex, Elevate, Summit, Peak, Digital, Solutions) that contractors pattern-match to cold-call spam.
- **Never reference or link to the founder's other business (Loyal Tale) anywhere a visitor can see.** The two businesses are marketed as fully independent; neither site vouches for the other. Shared-ownership disclosure, if ever wanted, belongs in private materials only. Every mention of memorials/tributes/pets and any cross-link has been removed and grep-verified — do not add one back.
- **Outreach email must be on the domain**, never a Gmail address — a free email domain undercuts a pitch that asks a contractor to hand over ad account access.
- **Logo/wordmark:** deliberately kept simple and typographic — a wordmark in the headline sans at semibold, no icon mark. The nav is the wordmark alone. A drawn logo mark before the business has a personality ages badly; not planned.

**Design system (brief §8) — established and in production, treat as the incumbent visual world:**

- Founder directive shared with the sister brand: *lots of white space, high-end, clean, easy to navigate* — but a deliberately distinct visual language (sharper edges, more contrast, more drama, more saturated accent) so nothing reads as the same brand family.
- Palette: near-white cool-neutral bg `#FAFAF9`; deep charcoal `#16181C` for hero and portfolio-highlight sections; near-black text `#1A1B1E`; off-white on dark `#F2F2F0`; primary/CTA accent amber-orange `#E8862E`; secondary steel blue `#3E5C76` (used for the Growth "Best Value" emphasis); neutral gray borders `#E2E2E0`; green `#3F8F5F` for the guarantee block.
- **Amber accessibility constraint, verified and load-bearing:** `#E8862E` on the near-white bg is 2.6:1 and **fails AA for text** — it may fill a shape but must never set type on light. The amber CTA button takes near-black label text (7.3:1); white-on-amber fails. Amber as text is used only on charcoal (6.4:1). Steel blue is the eyebrow/label colour on light (6.9:1). There is a comment block restating this at the top of `styles.css`.
- Type: Space Grotesk (headlines) + Inter (body). **No serif anywhere** — serif is reserved for the sister brand's emotional register. Numbers (prices, results, cost-per-lead) get deliberately larger/bolder treatment than body — data is allowed to feel prominent here.
- 8px grid, 1280px max content width (full-bleed permitted for portfolio/video), 4–8px radius (crisper than the sister brand), 96–120px desktop section padding / 64px mobile, 12-col desktop grid.
- Named components from §8.5: solid amber CTA button + one outline secondary; portfolio cards (dominant video thumbnail, minimal overlay, hover "watch" affordance); two-column pricing table with Growth emphasized; **guarantee block** (own full-width component, green accent, visible on a phone without scrolling past it); **before/after asset showcase** (raw client photos vs. finished ad frame — don't prettify the "before"); **all-in cost callout** (reusable fee + spend + total).
- Motion: quicker than the sister brand (100–150ms), subtle scale-on-hover for portfolio thumbnails, muted autoplay video for portfolio/hero previews, `prefers-reduced-motion` respected. No confetti, no cursor trails.
- Mobile-first (most prospects arrive from a phone). WCAG AA contrast minimum, full keyboard navigability with visible focus states, 44×44px minimum touch targets (especially the lead form), video never autoplays with sound.
- **Imagery rule:** real footage from produced ads wherever possible; no stock photography of generic "business people in an office"; every image traceable to real client work or an honest sample. Raw unpolished client job photos are welcome as a design element in the before/after showcase — the contrast *is* the sales argument.
- **Bilingual build:** the Simplified-Chinese pages under `/zh/` share the one `styles.css` / `script.js`, carry `<html lang="zh-Hans">` and reciprocal `hreflang`, and get a CJK system-font fallback (no CJK webfont — a multi-MB download is wrong for a job-site phone). Latin negative tracking and `ch`-based width caps are reset under `:lang(zh)` (DESIGN.md — "The CJK Reset Rule"). The wordmark "Busy Season" is **not** translated. **`terms.html` and `privacy.html` stay English-only** with a short Chinese note; a mistranslation of unreviewed legal text is real risk, and both are `noindex` anyway. Every marketing page ships in both languages or neither. Chinese copy is founder-supplied / founder-approved — copy accuracy is the site's #1 risk in either language.

## Evidence on Hand

- **`BusySeason_Master_Build_Brief.md` (v2)** — the full business spec: pricing, positioning, production workflow, design system, go-to-market, open items.
- **A companion critical review** (`claude/LegacyLink_Critical_Review_2026-08-16.md`) records why v2 decisions were made and lists the ten objections outreach will face — referenced by the brief but not verified present in this working tree.
- **`website/progress.md`** — a detailed running build log with the founder decisions behind every copy and pricing change.
- **Real media on the site:** four real job photos (before/after/worksite/truck/drone) and a small set of encoded video clips — a winter hero cut and two finished HVAC spec ads (`hvac1`/`hvac2`). Every video the site serves matches one encode profile (H.264 High, 540×960, 24fps, `+faststart`); masters live in gitignored `assets-source/`.
- **`ffmpeg` is blocked by Application Control on this machine** — use the `ffmpeg-static` npm binary for any re-encode work.

**Deliberate absences future work must NOT fabricate:**

- **No paying clients, no case studies, no live campaign numbers, no client logos, no testimonials.** The business is pre-first-client. `work.html` says so honestly and sells the spec-ad offer instead.
- **The self-funded proof-point campaign from brief §9.4 has not run yet** — there are no real "$1.10 per click in Whitby"-style numbers to cite.
- **The two HVAC spec ads are demonstration pieces** — no client has run them, so there are no performance figures. `hvac1.mp4` has a known burnt-in spelling error ("FREE FURNANCE CHECK") that needs a re-export from the editor; do not present it as polished portfolio work until fixed.
- **Founder identity is undecided** — name, bio, and photo for the About page were never supplied. The About page carries a placeholder. Do not invent a name, background, or headshot.
- All site imagery/video is currently AI-generated and is labelled honestly as demonstration/illustration ("Illustration, not a client's job"). The `about.html` argument that fully AI-generated footage is a poor fit for this business is the core differentiator and stays as written — do not weaken it to match the current placeholder media.

## Product Principles

1. **Copy accuracy is the main risk on this site, not visual polish.** Most failure modes are claims that outrun what the studio actually does or has done. Never add a testimonial, logo, client name, or performance number that isn't real. Ask before changing factual copy or pricing.
2. **The differentiator is "built around your real jobs."** It is a headline-level feature and a step in How It Works — never buried in a spec sheet. Design every page so an actual portfolio piece can be featured prominently, never buried.
3. **Clarity about money is a design element.** Prices, ad spend, and all-in cost get real typographic weight. A contractor who has to hunt for the real number assumes he's being handled.
4. **Risk reversal is the conversion lever.** The guarantee outranks the rate lock everywhere in the copy hierarchy and gets the more prominent visual treatment.
5. **The site closes; outreach discovers.** Optimize for a five-minute read by a skeptical owner on a phone. One clear action per page, always "Get a Free Sample Ad."
6. **Confidence over warmth.** Bold, clear statements about outcomes. This site must never be mistakable for the founder's warmer consumer brand — cooler, higher-contrast, more saturated accent, sharper geometry.

## Accessibility & Inclusion

- **WCAG AA contrast is a hard floor**, with the amber accent specifically verified against both the light and dark backgrounds (it fails as text on light — see the Brand Commitments constraint).
- **Mobile-first and touch-first** — most prospects first see the site on a phone, often on a job site. 44×44px minimum touch targets, especially on the lead form.
- Full keyboard navigability with visible focus states matching the design system.
- Video must not autoplay with sound and must degrade gracefully on slow mobile connections.
- `prefers-reduced-motion` is respected.
- **Language is marked for assistive tech:** `<html lang="zh-Hans">` on the Chinese pages, `lang="zh-Hans"` on the `中文` toggle link within an English page, so a screen reader switches voice correctly. The language toggle is a real keyboard-navigable control with a visible focus state and an `aria-current` marker on the active language.
