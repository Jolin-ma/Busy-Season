# LegacyLink Studio — Master Build Brief (v2)

**Version:** 2.0 — rewritten 2026-08-17. Supersedes v1 (2026-08-16) entirely.
**Purpose:** The single handoff spec for LegacyLink Studio. Give this to Claude (or another builder) as the starting point for the website build.

**Name and domain are unchanged.** A rename was considered on 2026-08-17 and declined — the domain is bought and the site is built, and the name is not what wins or loses deals. Section 0 covers what that means for the copy, which now has to carry all the explaining.

**What changed in v2 and why:** v1 sold video creative only, while promising an outcome ("we get your phone ringing") that depends on distribution the studio wasn't touching. v2 closes that gap: the studio now produces **and runs** the ads. Pricing, offers, site copy, and workflow are all restructured around that. The full reasoning is in the companion doc `claude/LegacyLink_Critical_Review_2026-08-16.md` — read it if you want to know why a given decision was made rather than just what it is.

**How to use this document if you're building the website:** Sections 0, 6, 7 and 8 are the build spec. Sections 1–5 and 9–11 are business context that determines what the copy has to say and what it must not claim. Read the context before writing a single line of copy — most of the failure modes on this site are copy accuracy problems, not design problems.

---

**Relationship to Loyal Tale (important, read first):** LegacyLink Studio and Loyal Tale are built and marketed as two fully independent businesses. Neither site links to, credits, or references the other anywhere a visitor can see. This is deliberate, not an oversight: the two audiences have nothing in common, and each site is stronger when it doesn't have to vouch for the other. If the founder ever wants to surface the shared-ownership relationship — to investors, press, or partners — that belongs in private materials, not on either public website.

---

## 0. Brand & Naming

**Name:** LegacyLink Studio
**Primary domain:** `legacylinkstudio.com` — already owned and in use. **No change.**

A rename was considered and deliberately declined on 2026-08-17 (see Open Items for the shortlist, kept in case it's ever revisited). The reasoning: the domain is bought, the site is built, and the name is not what closes or loses a deal. Switching now would spend a week of momentum on the eighth most important variable in the business. Revisit only if a prospect ever actually reacts to it.

**The design implication — this matters for the build.** "LegacyLink Studio" carries no meaning a contractor can decode. It doesn't say video, ads, marketing, or home services, and "legacy" leans faintly toward estate or memorial. That is survivable, but it means **the name will do none of the explaining — the copy has to do all of it.** Consequences for the site:

- The **hero headline must state what the studio does in plain words**, not riff on the name. A visitor arriving from a cold email has zero context and the logo won't give them any.
- The **positioning statement doubles as the tagline** — *"We make the video ads that get your phone ringing — and we run them for you."* There is no separate clever tagline, and there shouldn't be; a second abstract line stacked under an abstract name is two things to decode before anything is understood.
- In the nav and the browser tab, pair the wordmark with a short descriptor where there's room (e.g. "LegacyLink Studio — Video Ads for Home Services"). Set the page `<title>` this way; the bare name in a tab tells a returning visitor nothing.
- On the phone, the script always follows the name immediately with the clause that explains it: *"I'm with LegacyLink Studio — we make video ads for contractors."* Never let the name stand alone.

**Email:** use the domain (`hello@legacylinkstudio.com` or the founder's first name). Never send outreach from a Gmail address; for a business asking a contractor to hand over ad account access, a free email domain undercuts the pitch more than the design of the site helps it. This is worth doing this week — it costs a few dollars a month and it's one of the few credibility signals available before there's a portfolio.

**Naming constraints for anything downstream** (sub-brands, product names, campaign names): no "AI" in any public-facing name. It invites the "is this fake?" objection before the pitch has started, and Section 2 already handles that question on the studio's own terms. Avoid generic agency vocabulary — Apex, Elevate, Summit, Peak, Digital, Solutions — which contractors pattern-match to cold-call spam.

---

## 1. Project Overview

**What LegacyLink Studio is:** a small AI-assisted video ad studio for home service businesses that **produces the ads and gets them running**. The client receives finished video creative *and* a live, managed ad campaign. Roofing and contracting are the flagship examples; the offer serves home services broadly (Section 3).

**What's being sold — the v2 definition:**

| Step | Who does it |
|---|---|
| Creative concept and script | **Studio** |
| Video production | **Studio** |
| Campaign build and launch on Meta | **Studio** |
| Targeting, budget setup, optimization | **Studio** |
| Ad spend (paid directly to Meta) | Client |
| Answering the leads that come in | Client |

The studio does not take custody of client ad spend at any point — the client's own payment method sits on their own ad account. This is non-negotiable and must be stated plainly on the site (Section 6, FAQ).

**Explicitly still out of scope:** Google Ads (different skill set, higher complexity — Meta only at launch), landing page and website builds, CRM setup, answering or qualifying leads, SEO, organic social management.

**Why this business exists:** it's a deliberate parallel revenue stream to Loyal Tale. It reuses the production tool and skill set already being paid for (Higgsfield AI), it generates cash per-client in weeks rather than the months a consumer product takes, and it funds the founder while Loyal Tale is unproven. It is intentionally the leaner of the two businesses — see Section 9 on why it should **not** get a custom admin build.

**Positioning:** confident, results-oriented, unapologetically commercial. The opposite tone from Loyal Tale on purpose. Loyal Tale is warm because its customers are making an emotional purchase; LegacyLink Studio's customers are business owners making a practical decision about what gets them more booked jobs. The site should read like a studio that understands small-business marketing, not like a creative agency selling art.

---

## 2. The Product — and the thing that makes it different

**The ads are built around the client's real work.** This is the core product decision in v2 and it drives both the intake process and the website copy.

Purely AI-generated footage is a poor fit for home services. A homeowner choosing a $15,000 roof is making a trust decision, and generic AI imagery of a house that doesn't exist, a crew that doesn't exist, and a truck with no logo on it is trust-negative. Audiences in 2026 are also good at spotting AI output, and "this is fake" in the comments of a contractor's ad is worse than no ad.

**So the product is a hybrid:**

- **The client's real assets carry the trust** — job site photos, before/afters, drone shots, phone footage of completed work, the crew, the trucks, the logo. Every contractor has hundreds of these on their phone and considers them worthless.
- **AI carries the production value** — the hook, motion and camera moves, transitions, b-roll, atmosphere, text treatment, and the overall polish that makes phone footage look like it cost money.

This solves three problems at once: it defeats the biggest objection ("is this AI?"), it makes the work meaningfully better than a generic AI render, and it's a moat against anyone else who has a Higgsfield login.

**Consequence for intake:** client job photos are a **required** intake item, not an optional one (Section 5.1). A client who can't supply 20–30 recent job photos is a client whose ads will underperform. This should be framed to them as a feature, not a chore: "send us 30 photos off your phone and we'll turn them into something that looks like a national brand shot it."

**Consequence for the website:** "built around your real jobs" is a headline-level feature on the homepage and a step in How It Works — not a line buried in a spec sheet. Section 6 covers placement.

**Ad length:** roughly 15 seconds, the best-performing length on Reels/TikTok/Shorts. Consistent across both offers. Now that the studio manages the campaigns, real performance data will eventually inform whether to vary this — revisit after ~3 months of live campaigns.

---

## 3. Target Clients & Positioning

**Vertical framing: home service businesses, roofing-led.** The site speaks to home service contractors generally; portfolio pieces and examples lean roofing. This is deliberate — a roofing-only site would contradict the outreach plan every August through October, when roofers are booked solid and other trades are the live opportunity (Section 4).

**Core verticals:** roofing, HVAC, windows and doors, plumbing, landscaping, snow removal, gutters, garage doors, interior renovation and basement finishing.

**Why home services:** high customer lifetime value (a single roofing or HVAC job is worth thousands), so a client can justify real money for creative that generates even one or two extra jobs. They typically have no in-house marketing or video capability. And they are used to paying for lead generation, which is now what this studio actually sells.

**Positioning statement:** *"We make the video ads that get your phone ringing — and we run them for you."*

Every piece of copy should be legible to a business owner who has five minutes and wants to know exactly what they get, what it costs, and what it costs *all in*.

**Geographic scope — website vs. outreach:** the founder is based in Oshawa, operating out of Durham Region / East GTA. The public website stays geography-agnostic — positioning is vertical-led, not location-led, since the work can serve a client anywhere and a hard-coded local claim would cap the pitch. Location is used instead as a rapport lever in outreach conversations (Section 4). Revisit if the client base ever consolidates locally enough to make a "proudly serving Durham Region" trust line worth adding to the About page.

---

## 4. Business Model & Pricing

**Currency — CAD.** Every client-facing price is in Canadian dollars. The founder is in Ontario and the first prospects are Durham Region contractors, so CAD is what they'd assume from a bare `$` anyway. Prices are marked CAD on the plan cards and an "All prices are in Canadian dollars (CAD)" line appears on the homepage and pricing page. This does not apply to tool-cost figures below (Higgsfield credits, the $129/mo Ultra plan) — those are vendor list prices as billed.

**Tax — changed in v2.** v1 stated "no tax is added" as a selling point across three pages. **Remove this from the site.** Two reasons: any HST-registered contractor recovers HST as an input tax credit, so it's cost-neutral to a business buyer and not a selling point at all; and at v2 pricing, two Growth clients running a full year is $36,000, which crosses the $30,000 four-quarter registration threshold inside year one. Putting copy on the site that must come down within months is not worth the zero benefit it provides.

> **Open item:** confirm with an accountant whether to register for GST/HST voluntarily now. Voluntary registration lets the studio recover HST on Higgsfield, software, and hardware, and an HST line on the invoice reads as more established to a contractor, not less. Registration becomes mandatory once taxable revenue passes $30,000 over four consecutive calendar quarters.

### 4.1 The offer ladder

Three rungs, each with a clear job:

| | What it is | Price | Job |
|---|---|---|---|
| **Spec ad** | One free sample ad, built for their business | Free | Proof. Converts a cold pitch with no track record. |
| **Launch Pack** | 3 videos + campaign setup | $750 CAD one-off | The easy first yes. |
| **Growth** | 4 videos/mo + managed campaign + monthly readout | $1,500 CAD/mo | The business. |

The spec ad is the trial. Launch Pack is not a second trial — it's the first real transaction, and it exists so a prospect who isn't ready to commit monthly has somewhere to go.

### 4.2 Launch Pack — $750 CAD, one-off

- **3 finished video ads**, ~15 seconds each, built from the client's real job photos and footage.
- **Delivered in the formats they need:** 9:16 vertical for Reels/TikTok/Shorts, 1:1 for feed, 16:9 for YouTube/Facebook on request.
- **One-time campaign setup:** the studio builds and launches one Meta campaign on the client's own ad account — radius targeting, audience, lead form or click-to-call, budget configured to the client's number. After launch it's theirs to run.
- **One revision round** across the batch.
- **Turnaround:** ~2 weeks from receiving assets.
- **Guarantee:** if the client isn't happy with the first drafts, the deposit is refunded in full. See 4.4.
- **Ad spend is separate** and paid by the client directly to Meta. Recommended minimum $500 for a meaningful first test.

**Per-video rate:** $250 CAD. Deliberately higher than Growth's — a 3-video batch carries relatively more of the fixed cost of onboarding a new client (intake, first brief, first-time revisions) than an ongoing retainer does, and that higher unit price is exactly what makes Growth read as the better deal.

### 4.3 Growth — $1,500 CAD/month

- **4 new videos every month** ($375/video... but never sell it this way, see below), delivered as **biweekly batches of 2** so the creative in market stays fresh through the month rather than landing in one lump.
- **Managed Meta campaign** — the studio runs it: creative rotation, audience and budget adjustments, turning off what's losing, scaling what's working.
- **Monthly performance readout** — a short plain-language summary of what ran, what it cost, and what's working. This is a real deliverable now, not a guess. (In v1 this was promised while the studio had no ad account access, which made it unfulfillable. Fixed.)
- **One revision round per batch** (not per video — six separate revision threads a month was an operational mistake in v1).
- **Month-to-month. Cancel any time with 30 days notice. No long-term contract.**
- **Ad spend is separate** and paid by the client directly to Meta. **Recommended minimum $1,000/month** — below that there isn't enough data to optimize on and the engagement will fail for reasons unrelated to the creative.

**Never sell Growth on the video count.** Nobody wakes up wanting four videos. The pitch is: *"We keep fresh ads running in front of homeowners in your area every month, and we tell you what's working."* The video count is an implementation detail that appears on the pricing page, not in the pitch.

**Why 4 and not 6 or 8:** v1 proposed 6/month (revised down from 8), on a pace that had never been production-tested. At 4/month plus campaign management, the studio spends its hours on the part the client actually values — ads that are live and working — instead of manufacturing creative volume a small local advertiser can't consume. A contractor spending $1,000–2,000/month does not exhaust three creatives in a month; six would have piled up unused and looked like padding by month three.

### 4.4 Risk reversal — lead with this

The studio has no track record. The cheapest and most effective thing it can offer a skeptical contractor is **removing the risk of going first.**

- **Launch Pack:** 50% deposit ($375) to start. **If the client isn't happy with the first drafts, the deposit is refunded in full.** Exposure is capped at production time on three videos.
- **Growth:** month-to-month, cancel any time with 30 days notice, no contract.

This appears prominently on the homepage and pricing page — not as fine print. It should be more visually prominent than the rate lock.

### 4.5 Launch pricing + rate lock

$750 and $1,500 are presented as **launch rates**, not permanent ones. The site says the studio is new, that the price reflects that, and that it will rise as the portfolio builds.

**No public deadline or client-count cap.** A fake deadline that gets extended is worse than none.

What replaces the deadline is the **rate lock**: a Growth client who signs at $1,500/mo keeps that rate for as long as the retainer runs uninterrupted, whatever the studio charges later. It's honest urgency, it costs almost nothing while client count is low, and it works as a retention hook later. Launch Pack is a one-off, so nothing is locked; each batch is priced at the rate current when ordered. If a retainer lapses or is cancelled, re-engagement is at then-current rates.

**Demote this below the guarantee in the copy hierarchy.** It's a real benefit but it is not why anyone signs — nobody commits $18,000 a year to an unproven vendor because the price might rise later. The guarantee is the conversion lever; the rate lock is a supporting reason.

> **Open item:** decide when launch pricing ends and what standard rates become. There's deliberately no public deadline, so this won't force itself. Every client signed before it ends holds their rate permanently, so the longer it runs the larger the grandfathered book. Revisit once there are 2–3 real case studies with numbers.

### 4.6 Total investment — state it upfront

A contractor will mentally add the fee and the ad spend and arrive at a number bigger than the one on the pricing card. If he discovers that himself, mid-call, it feels like a bait and switch.

**So the site states it plainly:**

> **Growth — $1,500/mo studio fee.** Ad spend is separate and paid directly to Meta on your own account — we recommend starting at $1,000/month. **Most clients are investing $2,500/month all in.**

For context, a full-service roofing marketing agency typically charges $2,500–$8,000/month in fees *alone*, before ad spend. Against that, $2,500 all-in is genuinely competitive, and saying so plainly converts better than hiding the second number.

### 4.7 Payment & terms

- **Launch Pack:** $375 deposit to start (refundable under the guarantee), $375 on delivery.
- **Growth, month 1:** $750 setup deposit at signing (covers onboarding, campaign build, and the first batch of 2, delivered within ~2 weeks) + $750 when the second batch lands (~day 30). **Total $1,500 — identical to every month after.** The split is a labeling change that makes the first month easy for a prospect to follow, not a discount.
- **Growth, month 2 onward:** $1,500/month.
- **Method:** Interac e-Transfer is the default for one-off payments and deposits — no fee, and it matches how contractor clients already pay their suppliers and subs. Stripe (card) is available on any individual payment if a client asks.
- **Changed in v2 — the recurring charge:** collecting a $1,500/month retainer by manual e-transfer means the client actively re-decides to pay every month. That's twelve chances a year to churn plus the founder chasing invoices. **Push for pre-authorized debit or card on file for the retainer specifically**, framed as "so it's off your plate." E-transfer remains available if a client insists, but it should not be the default for recurring.
- **Ad spend never flows through the studio.** The client's own card sits on their own Meta ad account. The studio holds partner/admin access only.
- **Simple written agreement per client** — scope, revision limits, cancellation notice, ad account access, and usage rights.

> **Open item, decide before client one:** usage rights. Recommended default — the client owns the delivered videos outright; the studio retains the right to display the work in its own portfolio and marketing. That second half is non-negotiable for a studio that currently has no portfolio. Put it in writing before the first client, not after.

### 4.8 Margin and capacity

**Tool cost is negligible.** Higgsfield runs roughly $1–5 in credits per video, so a 4-video month costs $5–20 per client. Credits are not the constraint.

**Hours are the constraint.** Realistic time per finished 15-second hybrid video — scripting, generation with rerolls, selection, assembly, QA, export to three aspect ratios, plus a revision round — is 3–5 hours. Campaign management after setup is another 2–4 hours a month.

| | Videos | Campaign mgmt | Total hrs/mo | Revenue | Effective rate |
|---|---|---|---|---|---|
| **Growth client** | 12–20 hrs | 2–4 hrs | **~15–25 hrs** | $1,500 | **~$60–100/hr CAD** |

**Practical ceiling: 5–6 Growth clients**, or roughly **$90,000–108,000 CAD/year**, before sales and admin time crowds out delivery — and that's alongside Loyal Tale. Worth knowing before optimizing anything else.

*(For comparison, v1's structure — 6 videos, no campaign management, $1,000/mo — worked out to roughly $30–50/hr and capped around $48k. The restructure roughly doubles the effective rate and the ceiling. That is the main argument for it.)*

**Higgsfield plan:** the Plus plan's 1,000 monthly credits are shared with Loyal Tale. Budget for upgrading to Ultra ($129/mo, 3,000 credits) once 2+ Growth clients are running — retainer revenue covers that many times over. Track usage across both businesses; if ad clients ever delay a Loyal Tale order, that's the trigger to upgrade or fund a second seat, not to let the two compete silently for one pool.

---

## 5. Production & Campaign Workflow

1. **Intake** — brief plus asset collection (5.1). Asset collection is the step that most determines output quality; chase it actively rather than waiting.
2. **Ad account access** — client grants partner access to their Meta ad account and page, or the studio helps them create one. Do this at intake, not at launch — it's the most common place a project stalls.
3. **Concept / script** — a short script or shot concept per video, shared with the client for a quick sanity check *before* production burns credits.
4. **Production** — hybrid build: client footage and photos as the spine, Higgsfield AI for hook, motion, b-roll and polish.
5. **Internal QA** — a deliberate pause-and-review pass before the client sees anything. Solo operation, so this is a discipline, not a second person.
6. **Client review** — one revision round per batch.
7. **Campaign build & launch** — radius targeting, audience, placements, lead form or click-to-call, budget set to the client's number. Client's payment method, client's account.
8. **Optimization** — ongoing for Growth clients: rotate creative, kill losers, scale winners.
9. **Monthly readout** — plain-language summary: what ran, what it cost, what's working, what's next.

### 5.1 Intake brief template

**Business basics**
- Business name & service area
- Core service being advertised
- Ideal customer (homeowner vs. renter, age range, urgency signals like storm damage or a dead furnace)
- One clear selling point or current offer ("free inspection," "financing available")
- Anything they explicitly don't want (competitor comparisons, certain music styles)

**Assets — required, not optional**
- **20–30 recent job photos** (before/afters especially valuable)
- Any video off their phone — job sites, drone shots, crew, trucks
- Logo, in the highest quality they have
- Photos of the owner and crew if they're willing to appear

**Campaign setup**
- Meta ad account and Facebook page access (or help creating them)
- Where leads should go — email, text, phone
- Monthly ad budget
- Service radius / postal codes to target

---

## 6. Site Structure & Pages

Six pages. The site's job is to **close deals that outreach opens**, not to generate its own traffic — don't over-invest in SEO or content before the outbound motion is proven.

### Homepage

1. **Hero** — dark charcoal background for drama. **Headline states plainly that the studio makes the ads *and runs them*** — no wordplay, no riffing on the company name. A prospect landing here from a cold email has no idea what LegacyLink Studio is, and the name won't tell them (Section 0). The positioning statement serves as the supporting line beneath the headline; there is no separate tagline. One CTA: "Get a Free Sample Ad." A looping muted reel of sample work in the background or immediately below the fold — "show, don't tell" is the entire pitch for this business.
2. **The real-footage section** — the differentiator, high on the page. Ideally a visual: a few raw client job photos on one side, the finished ad on the other. Headline along the lines of "Your real jobs. Ads that look like a national brand made them." This is the most important non-hero block on the site.
3. **What you actually get** — three items, not a feature list: finished video ads, a live campaign, and a monthly report on what's working. Make the "we run them" part unmissable; it's the thing that separates this from every freelancer who ever cold-emailed them.
4. **How it works** — three steps: *send us photos off your phone → we build your ads and launch them → you get the calls.* Generous horizontal spacing on desktop.
5. **The guarantee** — its own block, visually prominent. "Don't like the first drafts? You don't pay." Not fine print.
6. **Proof** — client results once they exist. Before then, a spec reel and an honest "new studio, here's what we can do" framing. Do not fake testimonials or invent logos.
7. **Pricing preview** — both offers at a glance with the all-in investment stated, linking to the full pricing page.
8. **Closing CTA** — a final "Get a Free Sample Ad" before the footer. Don't make anyone scroll back up to convert.

### Our Work / Portfolio

Grid of video cards. Each piece gets real space — resist cramming small thumbnails into a dense grid; a smaller number of prominently displayed pieces reads as more premium than a crowded wall. Results framing (spend, cost per lead, calls generated) wherever the client has shared numbers and given permission; otherwise just the work. Filterable by vertical only once there are enough pieces to warrant it — not at launch. **This page carries the most weight in closing deals; give it more space and polish than the rest of the site.**

### Services & Pricing

- Two-column comparison: Launch Pack / Growth. Growth visually emphasized as "Best Value" using the steel-blue accent.
- **Ad spend stated clearly on both cards** as separate, paid directly to Meta, with the recommended minimum and the all-in figure.
- Guarantee restated.
- What's *not* included, stated plainly: Google Ads, website builds, SEO, answering leads.
- FAQ accordion (below).
- One final CTA at the bottom.

**FAQ — must cover, in roughly this order:**

- **Do you run the ads for us?** — Yes. We build the campaign, launch it on your account, and manage it monthly. *(In v1 this question existed to explain a "no." It's now the strongest answer on the page — give it top position.)*
- **Who pays for the ads?** — You do, directly to Meta, on your own account with your own card. We never touch your ad budget.
- **How much should I spend on ads?** — Recommended minimum, plus the honest reason: below that there isn't enough data to optimize.
- **What's it cost all in?** — Fee plus recommended spend, stated as one number.
- **Do I need a Facebook page or ad account already?** — No, we'll help you set one up.
- **Is this AI?** — Answer honestly and confidently. We use AI for production polish; the ads are built around your real jobs, your real photos, your crew, your trucks. Don't dodge this question — a straight answer beats a defensive one, and prospects will ask regardless.
- **What if I don't like the first drafts?** — The guarantee.
- **How long am I locked in?** — Month to month, cancel any time with 30 days notice.
- **How fast do I get my ads?** — ~2 weeks from receiving your photos.
- **What if I already run my own ads?** — We can work with your existing account and just supply fresh creative.
- **Why is Growth cheaper per video?** — Straight answer about onboarding cost being spread across an ongoing relationship.

### How It Works

The workflow from Section 5, written for a client audience — less internal detail, more "here's what working with us looks like week to week." Emphasize how little work it is for them: send photos, approve a draft, answer the phone.

### About

Brief studio credibility page: who's behind it, why AI-assisted video makes sense for small-business budgets, why real job footage matters. Nothing about Loyal Tale or any other product.

### Get a Quote / Contact

The site's single most important conversion point. Short, single-column form: name, business, phone/email, what they do, and one optional free-text field. Every extra field is a reason to abandon it. Direct phone and email listed alongside — contractors often prefer to just call.

**CTA wording across the site:** "Get a Free Sample Ad" outperforms "Get a Quote" for this business — it offers something concrete instead of asking for a commitment. Use it as the primary CTA everywhere.

### Legal

Terms of Service and Privacy Policy — **flag both "NEEDS LEGAL REVIEW"**. Plus a plain-language note on usage rights for delivered video, and a clear statement that the client owns and funds their own ad account.

---

## 7. Operations (deliberately lightweight)

**Do not build a custom admin tool for this business at launch.** Loyal Tale's admin site exists because Loyal Tale has real operational complexity. LegacyLink Studio at launch is one person with a handful of clients; a bespoke admin build would solve a problem that doesn't exist and eat time better spent on outreach and production.

**Use instead:** one simple tracker (spreadsheet, Notion, or Airtable) covering **both pipeline and delivery** — v1's version only tracked delivery, which misses where the actual risk is.

- *Pipeline columns:* business name, vertical, contact, source, stage (contacted / spec ad sent / call booked / proposal / won / lost), last touch date, next touch date, notes.
- *Client columns:* package, status (intake / awaiting assets / production / review / delivered / campaign live), deposit received, ad account access granted, ad budget, next batch due, revision status.

Set this up **before** the first outreach call, not before the first client.

Rebuild as real software only if and when volume makes the spreadsheet genuinely painful.

---

## 8. Website Design System

Same founder directive as Loyal Tale — **lots of white space, high-end, clean, easy to navigate** — but a different visual language, because this is a confident B2B service site, not a warm consumer brand. The DNA (restraint, generous spacing, one clear action per page) is shared; palette, type and tone are deliberately distinct so nothing about this site feels like it belongs to the same brand family.

### 8.1 Design principles

1. **Confidence over warmth.** Bold, clear statements about outcomes rather than soft, feeling-forward language.
2. **White space signals quality here too**, but reads as "premium studio" rather than "gentle and unhurried" — sharper edges, more contrast, still generously spaced.
3. **Proof over promises.** Every page should be built to showcase actual work. Design so a portfolio piece can be featured prominently, never buried.
4. **One CTA, always "Get a Free Sample Ad."** Never split attention between competing actions.
5. **New in v2 — clarity about money.** Prices, ad spend, and all-in cost are design elements, not disclaimers. Give them real typographic weight. A contractor who has to hunt for the real number assumes he's being handled.

### 8.2 Color palette

| Role | Color | Notes |
|---|---|---|
| Background (primary) | Near-white, cool-neutral — `#FAFAF9` | Cleaner and cooler than Loyal Tale's warm off-white |
| Background (dark section) | Deep charcoal-black — `#16181C` | Hero and portfolio-highlight sections; this site supports more drama than Loyal Tale |
| Primary text | Near-black — `#1A1B1E` | |
| Text on dark background | Off-white — `#F2F2F0` | |
| Accent (primary / CTA) | Confident amber-orange — `#E8862E` | Energetic, action-oriented |
| Accent (secondary) | Steel blue — `#3E5C76` | Icons, secondary highlights, the "Best Value" emphasis on Growth |
| Borders / dividers | Neutral gray — `#E2E2E0` | |
| Success / confirmation | Clean green — `#3F8F5F` | Also used for the guarantee block |

Intentionally cooler, higher-contrast, and more saturated in its accent than Loyal Tale — a visitor should never mistake one site for the other.

### 8.3 Typography

- **Headlines:** clean, confident grotesque / geometric-leaning sans (General Sans, Neue Montreal, or similar). **No serif anywhere** — serif is reserved for Loyal Tale's emotional register.
- **Body & UI:** highly legible sans — same family at lighter weight, or a companion sans such as Inter.
- **Type scale (desktop):**
  - H1 (hero): 60–72px, bold/semibold, tight leading
  - H2 (section headers): 36–42px, semibold
  - H3 (card/subsection): 20–24px, medium
  - Body: 16–18px, regular, 1.5–1.6 line height
  - Small/meta: 13–14px
- **Mobile:** H1 drops to 36–40px, H2 to 26–28px, body stays 16px minimum.
- **Numbers get emphasis.** Prices, results, cost-per-lead figures use a larger, bolder treatment than body text. This site is allowed to make data feel prominent in a way Loyal Tale deliberately avoids.

### 8.4 Spacing & grid

- 8px base grid.
- Max content width 1280px; full-bleed permitted for portfolio and video showcase sections.
- Section vertical padding: 96–120px desktop, 64px mobile — slightly more generous in portfolio-heavy sections so individual pieces stand out rather than compete.
- 12-column desktop grid, 4-column mobile, 24px gutters.

### 8.5 Components

- **Buttons:** solid amber CTA, 4–8px radius (crisper than Loyal Tale's softer rounding), high contrast. One secondary outline style.
- **Portfolio cards:** large video thumbnail dominant, minimal text overlay (vertical/type only), generous gutters, hover reveals a subtle "watch" affordance.
- **Pricing table:** two-column comparison. Growth emphasized with the steel-blue accent and a "Best Value" marker. **Each card carries three tiers of information in descending weight:** the monthly fee (largest), what's included (bullets), and the ad spend note plus all-in figure (smaller but clearly legible, never grey-on-grey).
- **NEW — Guarantee block:** its own full-width component, green accent, sized to be seen on a phone without scrolling past it. Short: headline, one sentence, no legalese.
- **NEW — Before/after asset showcase:** the real-footage differentiator. Raw client photos on one side, finished ad frame or video on the other. Should work on mobile as a stacked pair or a simple slider.
- **NEW — All-in cost callout:** a small, reusable component pairing the studio fee with recommended ad spend and a total. Appears on homepage pricing preview and the pricing page.
- **Navigation:** logo left; minimal links (Work, Services & Pricing, How It Works, About); single prominent "Get a Free Sample Ad" button right, high contrast, unmissable.
- **Lead form:** short, single-column, large touch targets, minimal required fields.
- **Footer:** simple, dark charcoal background, contact info prominent, legal links, no social sprawl.

### 8.6 Imagery & video direction

- **Real footage from produced ads wherever possible.** This site showcases actual output, not stock imagery pretending to be output.
- Confident, high-production-value framing even on spec pieces — the portfolio is the product demo.
- **No stock photography of generic "business people in an office."** Every image traceable to real client work or an honest sample.
- **New in v2:** raw, unpolished client job photos are welcome as a design element in the before/after showcase. The contrast between the phone snapshot and the finished ad *is* the sales argument — don't prettify the "before."

### 8.7 Motion & interaction

- More energy than Loyal Tale is appropriate — quicker transitions (100–150ms), subtle scale-on-hover for portfolio thumbnails.
- Muted video autoplay for portfolio previews on hover and in the hero is appropriate and expected.
- Tasteful, energetic, not gimmicky. No confetti, no cursor trails.

### 8.8 Responsive & accessibility

- **Mobile-first** — most prospects will first see this site from a text or email on their phone, often standing on a job site.
- WCAG AA contrast minimum; verify the amber accent specifically against both light and dark backgrounds.
- Full keyboard navigability, visible focus states matching the design system.
- Touch targets minimum 44×44px, especially on the lead form.
- Video must not autoplay with sound, and must degrade gracefully on slow mobile connections.

---

## 9. Go-to-Market

**This is an outbound business at launch.** The site closes deals that outreach opens; it is not the discovery mechanism.

### 9.1 Seasonality — plan around it

Home services are sharply seasonal in Ontario, and v1 ignored this entirely. Roofers in August are on roofs, booked out, hardest to reach, and least interested in more leads — "we'll get your phone ringing" lands worst at the moment the phone is already ringing.

| Window | Lead with | Why |
|---|---|---|
| **Aug–Oct** | Snow removal, HVAC, windows & doors, gutters, garage doors | Snow removal is selling seasonal contracts *right now* with a hard deadline — the single best current target. HVAC hits heating season. Windows/doors sell on pre-winter urgency. |
| **Nov–Feb** | Roofing, interior renovation, basement finishing | Roofers are slow, planning spring, and having budget conversations. Interior work peaks. |
| **Mar–May** | Roofing, landscaping, paving | Spring booking season; demand-gen matters most. |
| **Any time** | Storm response | A hail or wind event is the one thing that makes a roofer buy in-season. Keep a fast-turnaround storm play ready. |

### 9.2 The sales system

v1 specified type scales to the pixel and said almost nothing about how deals get made. **The website will not determine whether this works — several hundred contacted contractors will.** Build this with the same rigour as the design system.

- **A named list of 100+ Durham / East GTA home service businesses** — owner name, phone, vertical, source. Build it from Google Maps, Facebook, and local trade directories.
- **A cold call opener and a voicemail script.** Lead with the local angle: *"I'm just up the road in Oshawa, working with contractors across Durham."*
- **A three-email follow-up sequence.**
- **A weekly contact target** — something like 25 new contacts and 15 follow-ups. This is the single highest-leverage variable in the business.
- **A follow-up cadence.** Most trades sales close on touch 5–8, not touch 1. The polite "send me something and I'll take a look" is where most of the pipeline will die; never end a call without a specific next contact time.
- **Objection prep** — see the companion critique doc for the ten objections that will actually come up and how to answer each.

### 9.3 The spec ad — the best tactic in the plan

Producing one unsolicited sample ad for a specific prospect before they've agreed to anything converts a cold pitch better than anything else available to a studio with no track record. Two rules:

1. **Build it from their real assets** — pull job photos from their website, Google Business Profile, and Facebook. A spec ad using their actual work is dramatically more persuasive than a generic render, and it demonstrates the product's whole premise in one shot.
2. **Make it genuinely good.** A mediocre spec ad kills a pitch harder than no spec ad. One excellent one beats five rushed ones.

### 9.4 Manufacture a proof point

The hardest question in months 1–3 is "who else have you done this for?" Don't wait for a client to answer it.

**Spend $200–300 of your own money running one of your videos as a real Meta ad for a friendly local business.** Whatever the numbers come back as, you now have numbers. *"This ad got 41 clicks at $1.10 each targeting homeowners in Whitby"* outperforms any portfolio page you can build — and it's the only way to practise campaign management before a paying client is depending on it.

---

## 10. Build Priority Order

1. **Homepage + Services & Pricing + Get a Quote** — the minimum needed to close deals from outreach. Ahead of the portfolio, since there's no client work to show yet.
2. **Meta Ads competence** — set up Business Manager, run the self-funded test campaign (9.4). This is now a core deliverable and it can't be learned on a paying client.
3. **Spec / sample video production** (2–3 pieces) to seed the portfolio and give outreach something concrete.
4. **Prospect list + tracker + scripts** (Sections 7 and 9.2) — before the first outreach call.
5. **Our Work / Portfolio page** — populate as real and spec pieces exist.
6. **How It Works, About, Legal.**
7. **Revisit:** is a bespoke admin/CRM ever worth building? Only once the spreadsheet is genuinely painful.

---

## 11. Open Items

**Before the first paying client**

- [ ] **Client agreement** — scope, revision limits, cancellation notice, ad account access terms, and usage/ownership rights. Recommended default: client owns delivered videos, studio retains portfolio display rights.
- [ ] **Legal review** of Terms of Service and Privacy Policy.
- [ ] **Accountant conversation** — voluntary GST/HST registration now vs. waiting for the $30,000 threshold (Section 4).
- [ ] **Meta ad account access process** — document exactly what to ask a client for and how to walk them through granting it. This is where projects stall.
- [ ] **Recurring payment method** — set up pre-authorized debit or Stripe subscription for retainers (Section 4.7).
- [ ] **Second revision round policy** — what happens when a client wants more than the included round. Worth deciding once for both businesses.

**Ongoing / revisit**

- [ ] **Validate the ladder with real clients** — does the free spec ad convert to Launch Pack, and Launch Pack to Growth? Revise pricing upward once there are case studies with numbers.
- [ ] **Decide when launch pricing ends** and what standard rates become (Section 4.5). This won't force itself; it needs a decision. Revisit at 2–3 real case studies.
- [ ] **Monitor revenue against the $30,000 four-quarter threshold.**
- [ ] **Monitor Higgsfield credit usage** against Loyal Tale; upgrade to Ultra at 2+ Growth clients.
- [ ] **Revisit ad length** after ~3 months of live campaign data — 15s is the starting assumption, not a finding.
- [ ] **Higher tier** — a $2,500/mo tier (more videos, or multi-platform once TikTok/Google are in scope) once Growth is proven and capacity is understood.
- [ ] **30-second premium ad** as an upsell once there's a portfolio and known per-video production time.
- [ ] **Set up email on the domain** (Section 0) — `hello@legacylinkstudio.com` or similar. Do this before any outreach goes out.
- [ ] **Logo and wordmark.** Not specified here — the design system (Section 8) defines the environment it lives in. Keep it simple and typographic; a wordmark in the headline sans at semibold, no icon, is entirely sufficient for a studio at this stage and ages better than a logo mark drawn before the business has a personality.
- [ ] **Google Ads** as a future add-on, once Meta is genuinely competent.
- [ ] **Agency / white-label channel** — selling creative volume to marketing agencies already serving contractors is a viable second channel with a much better structural fit for a solo operator (one sales conversation replaces four). Worth testing once the direct motion is running.

**Resolved**

- [x] **The name — decided 2026-08-17: keep LegacyLink Studio.** A rename was priced out and declined. The domain is owned, the site is built, and the name ranks roughly eighth among the variables that determine whether this works — well behind outreach volume, ad management, real-footage creative, the guarantee, and proof. Renaming now would spend momentum on the wrong thing. The mitigation is in Section 0: the copy carries all the explaining, and the name never appears without the clause that decodes it.

> **If it's ever revisited** — the switching cost only rises from here, but it stays low until there are clients, printed material, or search equity. Shortlist from the 2026-08-17 exercise, all confirmed available at the time: **Busy Season** (`busyseason.ca`, tagline "Make busy season last all year" — the strongest of the four; names the outcome a contractor organizes their year around), **Jobsite Studio** (`jobsitestudio.ca`), **Foreman Media** (`foremanmedia.ca`), **Dispatch Ads** (`dispatchads.ca`). Re-check availability before acting; these were not registered. The trigger to revisit is a prospect actually reacting to the name — not a slow month.
- [x] **Ad management** — resolved 2026-08-17: the studio produces *and* runs the ads. Meta only at launch; client funds their own account. This is the central change from v1.
- [x] **Offer structure** — resolved 2026-08-17: free spec ad → $750 Launch Pack (3 videos + setup) → $1,500/mo Growth (4 videos + managed campaign + readout).
- [x] **Vertical framing** — resolved 2026-08-17: home services broadly, roofing-led, so the site doesn't contradict off-season outreach.
- [x] **Risk reversal** — resolved 2026-08-17: deposit refunded if the client dislikes the first drafts; Growth is month-to-month with 30 days notice. Leads the copy hierarchy, above the rate lock.
- [x] **Real footage requirement** — resolved 2026-08-17: client job photos are a required intake item and a headline product feature.
- [x] **Tax copy** — resolved 2026-08-17: "no tax is added" comes off the site. Cost-neutral to a business buyer, and the threshold is crossed inside year one at v2 pricing.
- [x] **Currency** — CAD, marked explicitly.
- [x] **Payment methods** — e-transfer default for one-offs and deposits; PAD or card preferred for the recurring retainer; Stripe available on request; ad spend never through the studio.
- [x] **Ad length** — ~15 seconds on both offers.
- [x] **Revisions** — one round per batch, not per video.
- [x] **Outreach channel** — cold email, phone and in-person, with the Oshawa/Durham base used as a rapport lever in conversation, not as a website claim.
- [x] **No custom admin build** at launch — a shared tracker covering pipeline and delivery instead.
- [x] **Geographic scope** — site stays geography-agnostic; location is a sales-conversation asset.
