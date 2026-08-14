# LegacyLink Studio — Master Build Brief

**Purpose of this document:** A single handoff file for LegacyLink Studio — a separate business from Loyal Tale, sharing an owner but nothing else public-facing. Give this to Claude (or another builder) as the starting spec for development work.

**Relationship to Loyal Tale (important, read first):** LegacyLink Studio and Loyal Tale are built and marketed as two fully independent businesses. Neither site links to, credits, or references the other anywhere a visitor can see. This is deliberate, not an oversight — see the Loyal Tale brief's opening note for the full reasoning (short version: the two audiences have nothing in common, and each site is stronger when it doesn't have to vouch for the other). If the founder ever wants to surface the shared-ownership relationship — to investors, press, or partners — that belongs in private materials (a pitch deck, a conversation), not on either public website.

**Origin note:** `legacylinkstudio.com` was originally planned as the small "parent studio" credibility site behind Loyal Tale. That plan is retired. The domain is being put to better use as the sales site for a real, independent second business: AI-produced video ads sold to local service businesses.

---

## 1. Project Overview

**What LegacyLink Studio is:** a small AI-powered video ad production studio. It produces short, high-quality video ads for local service businesses — roofers and contractors are the flagship vertical, with room to expand into adjacent local trades once there's a working sales motion (Section 4).

**Why this business exists (context for whoever builds this):** it's a deliberate parallel revenue stream to Loyal Tale, chosen for three reasons: it reuses the same production tool and skill set already being paid for (Higgsfield AI), it can generate real cash on a per-client basis in weeks rather than the months-to-years it takes a consumer product or an organic content channel to pay off, and it gives the founder income while Loyal Tale is still unproven. It is intentionally the smaller, leaner of the two businesses — see Section 7 on why it should **not** get a full custom admin build the way Loyal Tale does.

**What's being sold:** video creative only. Not media buying, not ad account management, not campaign strategy — the founder made this decision explicitly to keep scope tight at launch. A client receives finished, ready-to-run video files; what they do with them (post organically, run as paid ads themselves, hand to their own marketing person) is up to them. See Section 2.3 for how this could expand later, and Section 9 for why it's flagged as a later decision, not a launch feature.

**Positioning:** confident, results-oriented, unapologetically commercial. This is the opposite tone from Loyal Tale on purpose — Loyal Tale is warm and emotional because its customers are making a personal purchase about a pet they love; LegacyLink Studio's customers are business owners making a practical decision about what gets them more phone calls. The site should read like a studio that understands small-business marketing, not like a creative agency selling art.

---

## 2. Business Model & Pricing

**Currency — CAD (decided 2026-08-14):** every client-facing price in this section and on the website is in **Canadian dollars**. The founder is in Ontario and the first prospects are Durham Region contractors, so CAD is what they'd assume from a bare `$` anyway — this makes it explicit rather than leaving a ~30% gap to surface at invoice time. The website marks it on the plan prices and carries an "All prices are in Canadian dollars (CAD)" line on the homepage and pricing page. Note this does **not** apply to the tool-cost figures below (Higgsfield credits, the $129/mo Ultra plan) — those are vendor list prices as billed, not CAD conversions.

**Tax — none charged (decided 2026-08-14):** the studio is not GST/HST-registered, so no tax is added and the listed price is the total the client pays. The site states this plainly ("No tax is added — what you see is what you pay") on the homepage, the pricing page, and in the payment FAQ, because for a contractor comparing quotes it's a genuine selling point, not just a disclaimer.

**Launch pricing + rate lock (decided 2026-08-14):** $400 and $1,500 are presented as **launch rates**, not permanent ones — the site says the studio is new, that the price reflects that, and that it will rise as the portfolio builds. Deliberately **no public deadline or client-count cap**: the real trigger is GST/HST registration, which can't be stated publicly (it would be strange to prospects and would expose revenue), and a fake deadline that gets extended is worse than none.

What replaces the deadline as the reason to act now is the **rate lock**: a Growth client who signs at $1,500/mo keeps that rate for as long as the retainer runs uninterrupted, whatever the studio charges later. This is honest urgency — the benefit is real and permanent for whoever signs early — and it costs almost nothing while the client count is low, while working as a strong retention hook later. Starter is a one-off, so nothing is locked; each batch is priced at the rate current when ordered. If a retainer lapses or is cancelled, re-engagement is at then-current rates. Recorded in `terms.html` §2 and answered directly in the pricing FAQ.

> **Trigger to watch — the "no tax" half of this expires on its own.** Registration becomes mandatory once taxable revenue passes **$30,000 over four consecutive calendar quarters**. That's ~19 Starter batches or ~1.7 Growth clients running a full year, so it's a plausible year-one outcome rather than a distant hypothetical. When it happens the "No tax is added" copy becomes false and must come off the site the same week.
>
> Note the rate lock and the tax are deliberately **separate promises**, and the site and terms both say so: the locked *fee* stays $1,500, and tax would sit on top of it rather than being absorbed into it. That's what makes the lock safe to offer — it doesn't commit the studio to eating a 13% tax bill on every grandfathered retainer. Keep that distinction if this copy is ever rewritten; collapsing "your price never changes" into one sentence would quietly give away the margin. Confirm the tax specifics with an accountant rather than relying on this note.

**Final structure (2026-08-13):** simplified to two standing offers after testing a three-tier version that added complexity without a clean enough value story. The retainer is deliberately priced *below* the one-off's per-video rate — that resolves the obvious client objection ("why would I pay more to subscribe?") by not requiring an answer: subscribing is simply the cheaper option per video, on top of everything else it includes.

### 2.1 Starter Package — one-off, no commitment
- **Price:** $400 CAD for 2 produced video ads ($200 CAD/video).
- **Purpose:** the small, low-risk trial. A brand-new client sees real, finished work for a small total spend before ever considering a recurring relationship — an easy first yes, especially paired with the spec-ad outreach tactic (Section 4). Priced higher per video than Growth on purpose: a 2-video batch carries relatively more of the fixed cost of onboarding a new client (intake, first-time brief, first-time revisions) than an 8-video batch does, and that higher per-unit price is exactly what makes Growth's rate read as the better deal. Stays available afterward to anyone who wants an occasional one-off batch rather than an ongoing subscription.
- **Includes:** 2 finished video ads based on a single intake brief (business, service offered, target customer, key selling point — see Section 5.1), delivered in the platform-appropriate formats the client needs (vertical for TikTok/Reels, square for feed, widescreen for YouTube/Facebook if requested).
- **Revisions:** one round of revisions per video.
- **Deposit:** 50% upfront before production starts, balance on delivery.

### 2.2 Growth — monthly retainer, $1,500/mo for 8 new videos
- **Price:** $1,500 CAD/month for 8 new videos every month ($187.50 CAD/video — cheaper per video than Starter's $200).
- **Delivery cadence:** biweekly batches of 4 videos, not one lump delivery at month's end. This keeps the client's ad creative genuinely fresh through the month — addressing real ad fatigue — without committing to a full weekly production cycle, which earlier math showed would be operational overkill for this client size and would strain the shared Higgsfield credit pool (Section 4).
- **What's included:** one revision round per video, a reserved production slot (Growth clients aren't queued behind one-off Starter orders), and a short note with each batch on which ad angles/hooks are performing best, so the next batch builds on what's working instead of repeating the same format blind.
- **The pitch:** cheaper per video than the one-off, delivered on a reliable biweekly schedule, with a growing testing loop a client can't replicate by just repeat-buying Starter. Sell it as "we handle your ad creative pipeline," not "here are some files."
- **Sequencing:** pitch this after a client has seen a Starter batch or a free spec ad — lead with proof, not a cold price.

**Margin check:** Higgsfield tool cost per video runs roughly $1–5 in credits depending on clip count, so an 8-video month costs somewhere around $15–40 in tool spend — the real cost is time, not credits, at either tier. Capacity is the actual constraint to watch: 8 videos/month for a single Growth client could use something like half of the Plus plan's 1,000 monthly credits, shared with Loyal Tale's own production. Budget for upgrading to Ultra ($129/mo, 3,000 credits) as soon as the first Growth client signs, not as a someday-later concern — the retainer revenue covers that cost many times over.

### 2.3 What's explicitly out of scope at launch
- Media buying / running the client's ad account.
- Ongoing performance/analytics reporting tied to ad spend (the studio isn't touching the ad account, so it can't report on spend performance directly — a client-shared screenshot of results is a different, lighter thing and fine to ask for as a testimonial/case-study source).
- Full campaign strategy consulting.

These are all reasonable future upsells once the video-only business is proven (see Section 9), but adding them at launch would turn a lean, fast-to-execute service into a heavier agency model before there's any evidence the core offer even sells.

### 2.4 Payment & terms
- 50% deposit on the Starter Package and on the first month of a new Growth retainer; standard invoicing thereafter once a client relationship is established and trusted.
- Simple written agreement per client (Section 9 open item) — scope, revision limits, usage rights (does the client get exclusive use of the footage/edit, or can LegacyLink Studio reuse elements in its own portfolio? decide and put it in writing before the first client, not after).

---

## 3. Target Clients & Positioning

**Flagship vertical: roofing and contracting / home services.** Chosen deliberately: these businesses have high customer lifetime value (a single roofing job can be worth thousands of dollars), so they're accustomed to paying real money for creative that generates even one or two extra leads, and they typically don't have in-house marketing or video capability — a clear gap this studio fills.

**Expansion verticals to consider once the first vertical has traction (not at launch):** HVAC, plumbing, landscaping, real estate agents, dentists, and similar local-trust-based local businesses. Same underlying pitch (video ads that get the phone ringing), different intake specifics.

**Positioning statement:** "We make the video ads that get your phone ringing." Direct, outcome-focused, no creative-agency abstraction. Every piece of copy on the site should be legible to a business owner who has five minutes and wants to know exactly what they get and what it costs.

**Geographic scope — website vs. outreach (decided 2026-08-13):** the founder is based in Oshawa, operating out of the Durham Region / East GTA. The public website stays geography-agnostic — positioning is vertical-led (roofing/contracting), not location-led, since the work is AI-produced and can serve a client anywhere, and a hard-coded local claim on the site would cap the pitch without adding much once a prospect is already looking at the portfolio. Location is used instead as a relationship-building lever in outreach itself (Section 4) — it's a founder/sales-conversation asset, not a site positioning element. Revisit if the client base ever consolidates enough locally to make a "proudly serving Durham Region" trust line worth adding to the About page.

---

## 4. Go-to-Market / Sales Motion

**This is an outbound business at launch, not an inbound one.** The site's job is to close deals that outreach opens, not to generate its own traffic yet. Don't over-invest in SEO or organic content before the outbound motion is proven — that's a Phase 2 consideration (Section 9).

- **Cold outreach:** direct contact with local roofers/contractors — email, phone, in-person, whatever channel the founder has access to. Portfolio site (Section 6) is the credibility-close tool once a conversation has started, not the discovery mechanism.
- **Local angle in outreach (decided 2026-08-13):** the founder operates out of Oshawa / Durham Region, and cold email/phone/in-person outreach should lean into that directly — it's a real rapport-builder with a first-time local prospect ("I'm just up the road, working with contractors across Durham/East GTA...") in a way a generic pitch isn't. This stays an outreach-and-conversation tactic, not a website positioning claim (see Section 3) — the site itself doesn't need to say it.
- **Spec ad tactic:** for early prospects, producing one unsolicited sample ad specifically for their business before they've agreed to anything is a proven way to convert a cold pitch with no track record — it costs one video's worth of time and Higgsfield credits, and gives the prospect something concrete to react to instead of an abstract pitch.
- **Portfolio as proof:** once 2–3 real client ads exist (with permission to display), the site's Work/Portfolio page becomes the primary trust-builder for every subsequent pitch.
- **Shared tool budget — a real constraint to plan around:** Higgsfield AI production is shared with Loyal Tale on the same Plus plan (1,000 credits/month). Track credit usage across both businesses. If retainer clients start consuming a meaningful share of the monthly pool, and it's ever at the expense of a Loyal Tale customer's order being delayed, that's a signal to fund a second Higgsfield seat or upgrade the plan out of the ad business's own revenue — not to let the two compete silently for the same limited pool.

---

## 5. Production Workflow

A lighter-weight version of Loyal Tale's pipeline, adapted for ad clients rather than consumer orders.

1. **Intake** — client brief: business name, service offered, target customer, one key selling point or offer, any brand assets (logo, existing photos/video) they can provide, and which platforms/formats they need.
2. **Concept/script** — a short script or shot concept per video, ideally sharable with the client for a quick sanity check before production burns credits.
3. **Production** — Higgsfield AI generation.
4. **Internal QA** — a self-check pass before the client ever sees it (same discipline as Loyal Tale's Internal QA gate, scaled down — this is a solo operation, so this is a deliberate pause-and-review step, not a separate person).
5. **Client review** — one included revision round per video.
6. **Delivery** — final files in the formats the client needs (9:16 vertical for TikTok/Reels/Shorts, 1:1 for feed, 16:9 for YouTube/Facebook if requested), delivered via a simple shared folder or download link — no need for a bespoke delivery portal at this scale.

### 5.1 Intake brief template (starting point)
- Business name & location
- Core service being advertised
- Who's the ideal customer (age range, homeowner vs. renter, urgency signals like storm damage, etc.)
- One clear selling point or current offer (e.g., "free inspection," "financing available")
- Any existing photos/video/logo assets
- Platforms/formats needed
- Anything they explicitly don't want (competitor comparisons, certain music styles, etc.)

---

## 6. Site Structure / Pages

- **Homepage** — hero: what LegacyLink Studio does and for whom, in one sentence ("We make the video ads that get your phone ringing"), with a clear "Get a Quote" or "See Our Work" CTA. Brief proof section (client logos or results once they exist — placeholder initially). Short "how it works" (3 steps: tell us about your business → we produce your ads → you get videos that convert). Pricing preview linking to full pricing. Footer with contact CTA.
- **Our Work / Portfolio** — case studies / sample ads, organized by vertical (roofing, contracting, etc. as they're added). Before/after or results framing where the client has shared numbers and given permission; otherwise just the work itself. This page carries the most weight in closing deals — give it real space and quality over the rest of the site.
- **Services & Pricing** — both offers (Starter, Growth) laid out side by side, plain-language description of what's included in each (Section 2), clear statement that this is video creative only (not ad management), FAQ addressing "do you run the ads for us?", "what if we don't like the first draft?", "how fast do we get our videos?", "why is Growth cheaper per video than Starter?"
- **How It Works** — the production workflow from Section 5, written for a client audience (less internal detail, more "here's what working with us looks like week to week").
- **About** — brief studio credibility page: who's behind it, why AI-produced video makes sense for small-business budgets, nothing about Loyal Tale or any other product.
- **Get a Quote / Contact** — simple lead form (business name, contact info, what they're looking for) plus direct contact info. This is the site's single most important conversion point — keep it short and frictionless.
- **Legal** — Terms of Service, Privacy Policy (placeholder, flag "NEEDS LEGAL REVIEW"), and ideally a plain-language note on usage rights for delivered video (Section 2.4).

---

## 7. Operations (deliberately lightweight)

**Do not build a custom admin tool for this business at launch.** Loyal Tale's admin site (multi-role, order pipeline, fulfillment tracking) exists because Loyal Tale has real operational complexity — many customers, physical fulfillment, recurring billing, staff roles. LegacyLink Studio at launch is one person managing a handful of clients; a full bespoke admin build would be solving a problem that doesn't exist yet and would eat time better spent on outreach and production.

**Recommended instead:** a simple shared tracker — a spreadsheet or a lightweight tool (Notion, Airtable, or similar) with one row per client covering: business name, contact info, package (Starter / Growth), status (intake / in production / delivered / awaiting payment), deposit received, delivery date, revision status, and notes. This can be rebuilt as real software later if and when client volume actually justifies it (Section 9).

---

## 8. Detailed Website Design System

Same founder directive as Loyal Tale — **lots of white space, high-end, clean, easy to navigate** — but a different visual language, because this is a confident B2B service site, not a warm emotional consumer brand. The DNA (restraint, generous spacing, one clear action per page) is shared; the palette, type, and tone are deliberately distinct so nothing about this site feels like it belongs to the same brand family as Loyal Tale.

### 8.1 Design principles
1. **Confidence over warmth.** Bold, clear statements about outcomes ("videos that get your phone ringing") rather than soft, feeling-forward language.
2. **White space signals quality here too**, but reads as "premium studio" rather than "gentle and unhurried" — sharper edges, more contrast, still generously spaced.
3. **Proof over promises.** Every page should be built to showcase actual work (once it exists) — the design should make it easy to feature a portfolio piece prominently, not bury it.
4. **One CTA, always "Get a Quote" or equivalent** — never split attention between multiple competing actions.

### 8.2 Color palette

| Role | Color | Notes |
|---|---|---|
| Background (primary) | Near-white, cool-neutral — `#FAFAF9` | Cleaner and cooler than Loyal Tale's warm off-white — deliberate contrast |
| Background (dark section) | Deep charcoal-black — `#16181C` | Used for a bold hero or portfolio-highlight section — this site can support more contrast/drama than Loyal Tale |
| Primary text | Near-black — `#1A1B1E` | |
| Text on dark background | Off-white — `#F2F2F0` | |
| Accent (primary/CTA) | Confident amber/orange — `#E8862E` | Energetic, action-oriented — distinct from Loyal Tale's muted gold |
| Accent (secondary) | Steel blue — `#3E5C76` | Supporting accent for icons, secondary highlights |
| Borders/dividers | Neutral gray — `#E2E2E0` | |
| Success/confirmation | Clean green — `#3F8F5F` | |

This palette is intentionally cooler, higher-contrast, and more saturated in its accent than Loyal Tale's — a visitor should never mistake one site for the other.

### 8.3 Typography
- **Headlines:** a clean, confident grotesque/sans-serif (e.g., General Sans, Neue Montreal, or similar geometric-leaning sans) — no serif anywhere on this site; serif is reserved for Loyal Tale's emotional register.
- **Body & UI text:** a highly legible sans-serif, can be the same family as headlines at a lighter weight, or a companion sans (e.g., Inter).
- **Type scale (desktop):**
  - H1 (hero): 60–72px, bold/semibold, tight leading
  - H2 (section headers): 36–42px, semibold
  - H3 (card/subsection titles): 20–24px, medium
  - Body: 16–18px, regular, 1.5–1.6 line height
  - Small/meta: 13–14px
- **Mobile scale:** H1 drops to 36–40px, H2 to 26–28px, body stays 16px minimum.
- Numbers/results (e.g., a stat in a case study) can use a slightly larger, bolder treatment than body text — this site is allowed to make data feel prominent in a way Loyal Tale deliberately avoids.

### 8.4 Spacing & grid
- Same 8px base grid discipline as Loyal Tale.
- Max content width: 1280px, up to full-bleed for portfolio/video-showcase sections.
- Section vertical padding: 96–120px desktop, 64px mobile — if anything, slightly more generous than Loyal Tale in portfolio-heavy sections, to let individual pieces of work stand out rather than compete.
- 12-column desktop grid, 4-column mobile, 24px gutters.

### 8.5 Components
- **Buttons:** solid amber CTA button, sharp or minimally-rounded corners (4–8px radius — crisper than Loyal Tale's softer rounding), high contrast. One secondary outline style.
- **Portfolio cards:** large video thumbnail as the dominant element, minimal text overlay (client vertical/type only), generous gutter between items, hover state reveals a subtle "watch" affordance.
- **Pricing table:** side-by-side two-column comparison (Starter / Growth), clear bullet breakdown of inclusions, the Growth column visually emphasized (e.g. "Best Value") using the steel-blue accent, with its lower per-video price ($187.50 vs. Starter's $200) called out explicitly as the reason to subscribe.
- **Navigation:** logo left, minimal links (Work, Services & Pricing, How It Works, About), single prominent "Get a Quote" button right, styled with high contrast so it's unmissable.
- **Lead form (Get a Quote):** short, single-column, large touch targets, minimal required fields (name, business, contact, what they need) — every extra field is a reason someone abandons it.
- **Footer:** simple, dark background (using the charcoal from the palette) for contrast against the rest of the site, contact info prominent, legal links, no social sprawl — this business doesn't need a heavy social presence to function.

### 8.6 Page-by-page layout notes

**Homepage:**
1. Hero — bold, high-contrast (can use the dark charcoal background here for drama), single confident headline, one CTA. A looping muted video reel of sample work in the background or immediately below the fold works well for this business specifically, since "show, don't tell" is the whole pitch.
2. Proof section — client logos/results once available; a simple, honest "new studio, here's what we can do" placeholder (e.g., a spec reel) if not.
3. How it works — three clean steps, generous horizontal spacing on desktop.
4. Pricing preview — both packages visible at a glance, link to full pricing page.
5. Footer/CTA repeat — a final "Get a Quote" prompt before the footer; don't make someone scroll back up to convert.

**Our Work / Portfolio:** grid of video cards, filterable by vertical once there are enough pieces to warrant it (not needed at launch with only a handful of pieces). Each piece gets real space — resist the urge to cram many small thumbnails into a dense grid; a smaller number of prominently-displayed pieces reads as more premium than a crowded wall.

**Services & Pricing:** two-column pricing comparison at the top, FAQ accordion below, one final CTA at the bottom of the page.

**Get a Quote:** short form, minimal distraction around it — this page's only job is to capture the lead.

### 8.7 Imagery & video direction
- Real footage/stills from produced ads wherever possible — this site should showcase actual output, not stock imagery pretending to be output.
- Confident, high-production-value framing even for a spec/sample piece — the portfolio is the product demo.
- No stock photography of generic "business people in an office" — every image should be traceable to real client work or an honest sample.

### 8.8 Motion & interaction
- More energy than Loyal Tale is appropriate here — quicker transitions (100–150ms), subtle scale-on-hover for portfolio thumbnails is fine (unlike Loyal Tale, where restraint is closer to absolute).
- Video autoplay (muted) for portfolio previews on hover or in the hero is appropriate and expected for this kind of site.
- Keep it tasteful — energetic, not gimmicky. No confetti, no cursor trails.

### 8.9 Responsive & accessibility
- Mobile-first — many prospects will first see a link to this site from a text or email on their phone.
- WCAG AA contrast minimum — verify the amber accent against both the light and dark backgrounds specifically.
- Full keyboard navigability, visible focus states matching the design system.
- Touch targets minimum 44x44px on mobile, especially on the Get a Quote form.

---

## 9. Build Priority Order

1. Homepage + Services & Pricing + Get a Quote (the minimum needed to start closing deals from outreach — this is the priority, ahead of a full portfolio, since there's no client work yet to show)
2. Spec/sample video production (1–2 pieces) to seed the portfolio and give outreach something concrete to point to
3. Our Work / Portfolio page (populate as real and spec pieces exist)
4. How It Works, About, Legal
5. Simple client tracker (Section 7) — set this up before or alongside the first real client, not after
6. Revisit: is a lightweight bespoke admin/CRM ever worth building? Only once client volume makes the spreadsheet genuinely painful (Section 7)

---

## 10. Open Items / Needs Founder Input

- [ ] Validate Starter ($400/2) and Growth ($1,500/mo/8, biweekly) with real clients — confirm the "cheaper per video to subscribe" pitch actually converts Starter buyers into Growth retainers, and revisit both prices upward once there are case studies to point to
- [ ] Decide the written client agreement: scope, revision limits, usage/ownership rights for delivered video and any right to reuse in LegacyLink's own portfolio
- [ ] Confirm domain/branding: keep `legacylinkstudio.com` as-is, or consider whether "LegacyLink Studio" (which reads more "legacy/memorial-adjacent" than "local business marketing") is worth revisiting once there's budget to think about it — not urgent, the name still functions fine as a studio name
- [ ] Decide whether to eventually offer media buying/ad management as a premium upsell (Section 2.3) — explicitly deferred until the video-only offer is proven
- [x] Decide outreach channel/volume plan — resolved 2026-08-13: cold email, phone, and in-person, with the founder's Oshawa/Durham Region base used as a relationship-building angle in outreach conversations specifically (Section 4); realistic weekly outreach targets still to be set, since early sales are expected to be slow
- [ ] Confirm deposit/invoicing tooling (Stripe invoicing, PayPal, or similar) — keep it simple at this scale
- [x] Decide whether HST is included in or added to the listed prices — resolved 2026-08-14: the studio isn't GST/HST-registered, so no tax is charged and the listed price is what the client pays. Stated on the site (Section 2)
- [ ] **Monitor revenue against the $30,000 four-quarter GST/HST registration threshold** (Section 2). Crossing it forces registration and makes the site's "No tax is added" line false — that copy comes off the same week, and clients on a locked rate get notice before tax appears on an invoice
- [ ] **Decide when launch pricing ends and what the standard rates become** (Section 2). There's deliberately no public deadline, so this won't force itself — it needs a decision. Every client signed before it ends holds their rate permanently, so the longer it runs the larger the grandfathered book. Revisit once there are 2–3 real portfolio pieces, since that's the stated reason the rate is low
- [ ] Decide how to handle a client who wants a second revision round beyond the one included — same open question as Loyal Tale's policy, worth deciding once for both businesses' shared philosophy even though the sites don't reference each other
- [ ] Monitor shared Higgsfield credit usage against Loyal Tale (Section 4) and set a concrete trigger point (e.g., "if either business is regularly hitting the monthly credit ceiling") for funding a second seat or upgrading the plan
- [ ] Legal review of Terms of Service and Privacy Policy before taking on paying clients
- [ ] Decide whether to expand beyond roofing/contracting to other local-trade verticals, and when (Section 3)
