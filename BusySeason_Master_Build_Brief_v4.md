# Busy Season: Master Build Brief (v4)

**Version:** 4.0, revised 2026-10-05. Supersedes v3.2 (2026-09-28). Earlier versions are summarized in the change log (Section 12).

> **Agencies only, 2026-10-05.** Busy Season now sells one thing: white-label short-form video ad creative to marketing agencies and media buyers who run Meta ads for home service businesses. Direct sales to contractors are stopped. The Launch Pack ($750), the free spec ad for contractors, the guarantee, campaign setup and launch, ad account access, and all contractor-facing copy are retired. They are not to appear on the site, in outreach, in ads, or on Instagram.
>
> **Why.** The agency channel was promoted to a main track on 2026-09-27 and has been getting most of the effort since. One agency relationship replaces several direct clients. There's no ad account trust hurdle. An agency owner can judge the work in 90 seconds without a case study. An agency's book spans trades, so the work isn't tied to one season. And the studio doesn't have access to real contractor job photos, which the direct offer depended on. Running two audiences on one site also made the site actively hurt the agency pitch: an agency landing on a page selling campaigns directly to contractors reads it as competition.
>
> **What changes.** The whole site is rebuilt for agencies (Section 11). Sections rewritten: all of them. The design system (Section 8) is mostly kept.

**Purpose:** the single handoff spec for Busy Season, written so a builder (WebStorm's AI assistant, Claude, or a person) can rebuild the website from it.

**How to use this document if you're building the website:**

1. Read **Section 1** (what's sold) and the **copy rules in Section 6** first. Most of the ways this site can go wrong are copy accuracy problems, not design problems.
2. **Section 11 is the rebuild list:** which files to delete, which to rewrite, which redirects to add, and what "done" looks like. Start there for the actual work.
3. **Sections 6 and 8** are the page spec and design system.
4. Everything else is business context that decides what the copy can and can't say.

The repo has a `website/CLAUDE.md` and a `website/progress.md`. Read `CLAUDE.md` before editing. Add an entry to `progress.md` when the rebuild is done.

---

## Portfolio Goals & Success Criteria

> Busy Season is a real, operating business, but its primary purpose is a **resume portfolio project** for **project coordinator** and **digital marketing** roles, ahead of April 2027 graduation. When the business and the portfolio pull in different directions, this section wins.

### What this project has to demonstrate (updated for v4)

| Role | What a hiring manager looks for | Evidence this project produces | Status (2026-10-05) |
|---|---|---|---|
| **Digital marketing** | Content and creative production | Finished 15s video ads in 9:16, 1:1 and 16:9, across at least two verticals | Snow removal demo done (its reel reached 816 views); new HVAC videos done; roofing being redone |
| **Digital marketing** | Campaigns with real numbers | Either anonymized performance data an agency shares on the creative, or a self-run Meta campaign with real spend | Open: see Section 10 |
| **Digital marketing** | Funnel thinking | Outreach → reply → sample → trial batch → repeat batch, counted at each step in the tracker | Outreach started; funnel not yet measured |
| **Project coordination** | B2B partner management | Agency agreement, turnaround tracking, delivery against deadlines | Agreement not yet written |
| **Project coordination** | Change control | This brief's version history (v1 → v4), each change dated with its reason | Exists. Keep every future change dated |
| **Project coordination** | Multi-vendor coordination | The Aug 2026 rebrand and domain cutover (registrar, email, transactional email, hosting, database, repo) | Done; not written up |
| **Project coordination** | Tracking and risk | The tracker (Section 7) and a risk register | Tracker in use; risk register not yet written |

### Done means

1. **At least one paid agency batch delivered** on time, with written permission to keep a private reel and describe the work anonymously.
2. **Real numbers on at least one piece of creative**: agency-shared performance data, or a self-run campaign (Section 10).
3. **A project-management artifact set:** charter, roadmap, risk register, change log, tracker.
4. **A short retrospective**, including the decision to go agencies only and what the data showed.

### Honesty rules

- **The public site never says "portfolio project."** It's a real studio.
- **Resume claims use only verified numbers.** No rounded-up client counts. Results from spec ads are never presented as client results.
- **Agency client work never appears publicly** unless the agency agrees in writing. The public site shows the studio's own spec work only.

---

## 0. Brand & Naming

**Name:** Busy Season. **Domain:** `busyseason.ca`. **Email:** `info@busyseason.ca`, live and in use. All outreach goes from the domain, never from Gmail.

**The name still fits.** Agencies running home service accounts live by their clients' seasons. "Busy Season" is the thing their clients plan the year around, and the name signals the studio knows that world.

**The name doesn't say what the studio does,** so the copy has to:

- The hero headline states plainly what the studio does and for whom. No wordplay on the name.
- Page `<title>` pattern: "Busy Season · White-Label Video Ads for Agencies".
- Supporting line (matches the Instagram bio): *"You sell. We create."*

**Naming constraints** for anything downstream: no "AI" in any public-facing name. Avoid generic agency vocabulary (Apex, Elevate, Summit, Peak, Digital, Solutions).

---

## 1. What's Sold

**Busy Season is a white-label production studio.** It makes short-form video ad creative for marketing agencies and media buyers whose clients are home service businesses. The agency owns the client relationship and the ad account. The studio is the production arm behind it. The agency's client never sees the Busy Season name.

| Step | Who does it |
|---|---|
| Account brief: offer, audience, brand assets | **Agency** |
| Creative concept and script | **Studio** (agency approves) |
| Video production | **Studio** |
| Delivery in the formats needed | **Studio** |
| One revision round per batch | **Studio** |
| Running the ads, budgets, targeting, reporting | **Agency** |
| Client relationship and communication | **Agency** |

**Explicitly out of scope:** campaign setup or management, ad account access of any kind, media buying, landing pages and websites, CRM, SEO, organic social, any direct contact with the agency's clients.

**The problem it solves for agencies.** Meta creative fatigues within a few weeks. Agencies tend to be strong at media buying and weak at production, so refreshing creative means booking a videographer or chasing a contractor for footage he never sends. Stale ads mean slowly decaying performance, which puts the agency's client retention at risk. The studio fixes that with fast, reliable refreshes and no shoot to schedule.

**Positioning:** a dependable production partner, not an artist. Agency owners are marketing-literate buyers. They care about turnaround, reliability, formats, and whether the creative will perform. The site should read like a capable supplier that respects their time.

---

## 2. The Product

- **~15 second ads**, the strongest-performing length on Reels, TikTok and Shorts. 30s versions on request later.
- **Formats:** 9:16 vertical, 1:1 feed, 16:9 on request.
- **Built with AI-assisted production.** Higgsfield and similar tools carry the hook, motion, b-roll, transitions, text treatment and polish.
- **Client assets are welcome but optional.** If the agency has the client's logo, job photos, truck shots or footage, the studio can build around them. That's a bonus offered once there's a real job, not the headline, because no published sample has been built from real client photos yet.

**On AI, be straight.** Agencies will ask. The answer is yes, AI is part of the production process, and that's why turnaround is days instead of weeks and the price works for refresh volume. Never dodge it.

**When a sample proving the photo-to-ad method exists** (for example, an ad built from licensed stock job photos shown next to those photos and captioned honestly), it can be added to the Work page and the pitch.

---

## 3. Target Clients

**In priority order:**

1. **Solo Meta media buyers or tiny teams (1 to 3 people) running 5 to 10 contractor accounts.** One decision-maker, feels creative fatigue weekly, can say yes on one call. Found mostly on LinkedIn and in media-buyer Facebook and Skool groups.
2. **Small agencies (2 to 15 people) running Meta ads for home services with no in-house video.** Clearest fit among agencies with a public website.
3. **Web design and SEO shops serving trades** whose clients keep asking for video or ads they can't produce.
4. **Larger contractor agencies with in-house video.** Lower priority. Pitch overflow, speed and volume, not capability.
5. **White-label and outsourced marketing firms** that sell to other agencies. Possible reseller.

**Verticals the samples should cover:** snow removal, HVAC, roofing, windows and doors, landscaping, garage doors, plumbing. At least two on the site at launch.

**Geography:** the site stays geography-agnostic. Agencies can be anywhere in Canada or the US. "Oshawa, ON" appears once, in the contact or founder block, as a real-person signal, not as a service area.

---

## 4. Offer & Pricing

**Agency pricing is never published on the site.** It lives in the pitch email and the agreement. Rates depend on volume, and agencies negotiate.

**Working numbers (starting point, not settled):**

- **$175 CAD per video**, stepping down toward $125 at steady volume. Test on the first 2 to 3 conversations.
- **Trial:** one paid trial batch of 2 to 3 videos. A free sample only for an agency that has already replied and has real volume.
- **Turnaround:** 3 to 5 business days per batch once the brief and any assets are in. Reliability matters more than brilliance. One missed deadline likely ends the relationship.
- **One revision round** per batch.
- **Payment:** 50% upfront on the first batch. Net terms in writing after that (agencies often run net 30 or 60). Interac e-Transfer default; Stripe on request. Currency CAD unless agreed otherwise for a US agency.

**Retired in v4 (do not use anywhere):** Launch Pack, $750, $250 per video, $375 deposit, free spec ad for contractors, the deposit-back guarantee, $200 to $300 recommended ad spend, "about $1,000 all in," "We make your video ads and launch them for you," and any mention of campaign setup, handover, or ad account access.

**Margin.** Tool cost is small: the Sept 2026 snow removal demo ran ~73 Higgsfield credits including retries, stills and voice. Hours are the real cost, estimated at 3 to 5 per finished video. Log actual hours on the first agency batches; that sets the volume floor.

**Tax.** Open item: accountant conversation on voluntary GST/HST registration. Mandatory once taxable revenue passes $30,000 over four consecutive quarters.

---

## 5. Production Workflow (agency job)

1. **Brief.** Agency sends the account details: trade, offer, audience, CTA, brand assets (logo, colours), and any client photos or footage. A short intake form or email template covers it.
2. **Concept.** One short script or shot concept per video, approved by the agency before production spends credits.
3. **Production.** AI-assisted build, client assets used where supplied.
4. **Internal QA.** A deliberate review pass before anything goes out.
5. **Delivery.** All requested formats, clearly named files, unbranded (no Busy Season watermark, logo or credit).
6. **Revision.** One round per batch.
7. **Follow-up.** Ask how the creative performed. If they'll share anonymized numbers, that's portfolio evidence.

**Intake brief (agency version):** agency name and contact · client trade and service area (city level is enough) · offer being advertised · audience notes · CTA (call, form, message) · brand assets · any photos or footage · formats needed · deadline · anything to avoid.

---

## 6. Site Structure & Pages

**Three pages plus legal.** The site's job is to back up outreach. An agency owner clicks the link in a cold email, usually on a phone, watches two or three ads, and decides whether to reply. Everything on the site serves that 90 seconds.

### Copy rules (read before writing any copy)

1. **Talk to agencies only.** No copy written to a contractor or homeowner anywhere. "Your clients," never "your customers" or "your business."
2. **No prices anywhere.** Not per video, not "starting at," not ranges.
3. **No campaign management claims.** The studio doesn't launch, run, manage or optimize campaigns, and doesn't need ad account access.
4. **Never claim the samples were built from real client photos.** They weren't.
5. **No fake proof.** No testimonials, client logos, "trusted by" bars, or client counts until real ones exist with written permission.
6. **Say "white label" plainly** and say the studio never contacts the agency's clients.
7. **Answer "is this AI?" honestly** (Section 2).
8. **Plain words.** Short sentences. No hype vocabulary ("elevate," "unleash," "game-changing").

### Home (`index.html`)

Dark charcoal background throughout or for the top half. It's a video-first page.

1. **Hero.** Headline states what the studio is and for whom, for example: *"White-label video ads for agencies running home service accounts."* Supporting line: *"You sell. We create."* One CTA button: **"Ask about a sample"** (goes to Contact). Immediately below or behind: the best sample ad, muted autoplay.
2. **The work.** 3 sample ads, 9:16, muted autoplay when scrolled into view, tap for sound. One-line caption each: vertical, length, format (e.g. "Snow removal · 15s · 9:16"). At least two verticals. Link to the Work page for more.
3. **The problem, in two lines.** Creative fatigues in a few weeks. Fresh ads shouldn't need a shoot or a chase for footage.
4. **How it works.** Three steps: *Send the account brief → we script and produce → finished ads back in 3 to 5 business days, under your name.*
5. **What you get.** Short list: 15s ads in 9:16, 1:1 and 16:9 · one revision round per batch · fully white label, no watermark or credit · we never contact your clients · flexible volume, one-off batches or ongoing refreshes.
6. **FAQ** (short accordion):
   - **Is it really white label?** Yes. No watermark, no credit, and we never contact your clients.
   - **What do you need from us?** The trade, the offer, the CTA, and brand assets. Client photos or footage are welcome but not required.
   - **How fast is turnaround?** 3 to 5 business days per batch once we have the brief.
   - **Do you use AI?** Yes, as part of production. It's why turnaround is days, not weeks, and why refresh volume is affordable. Every ad is scripted and checked by a person.
   - **Which formats?** 9:16, 1:1 and 16:9.
   - **How much does it cost?** Per video, depending on volume. Email for rates.
   - **Can we try it first?** Yes. Ask about a small trial batch.
7. **Who's behind it.** Two or three sentences: Jolin, based in Oshawa, ON, producing short-form ad creative for home service accounts. Optional small photo. This replaces the old About page.
8. **Closing CTA.** "Ask about a sample" button plus `info@busyseason.ca` as a mailto link.

### Work (`work.html`)

All published sample ads, each given real space. Fewer, bigger, better. Captions: vertical, length, format. Only the strongest pieces; the current roofing ads stay off until redone. No vertical filter until there are 8+ pieces. If a stock-photo "photos in, ad out" piece exists, it goes here with an honest caption.

### Contact (`contact.html`)

Short single-column form: name · agency or company · email · roughly how many home service accounts you run (optional dropdown: 1 to 5 / 6 to 15 / 16+) · what you need (optional free text). Submits to `info@busyseason.ca` using the same mechanism the current quote form uses. `info@busyseason.ca` shown beside the form as a mailto link for people who'd rather just email.

### Legal (`terms.html`, `privacy.html`)

- **Terms** rewritten for agency engagements: scope (creative production only), per-batch ordering, one revision round, turnaround as a target not a guarantee, payment (deposit on first batch, net terms in writing), white label and non-solicitation of the agency's clients, ownership (agency or its client owns delivered videos once paid in full), the studio's right to keep a private reel and describe work anonymously, confidentiality of client assets. **Money stays as percentages, never dollar figures** (existing `CLAUDE.md` convention). **Flag "NEEDS LEGAL REVIEW."**
- **Privacy** updated so the data described matches the new contact form fields. Otherwise mostly unchanged.

### Navigation and footer

- **Nav:** wordmark left; links **Work** and **Contact**; "Ask about a sample" button right.
- **Footer:** dark charcoal, wordmark, *"White-label video ads for agencies."*, `info@busyseason.ca`, Instagram link (@busyseasonn), Terms, Privacy. No other social links.

---

## 7. Operations

One tracker (spreadsheet) covering pipeline and delivery. No custom admin tool.

- **Pipeline:** agency name · contact name · email · source · location · tier (A to D) · approx. number of home service clients · in-house video (yes/no) · stage (not contacted / contacted / replied / sample sent / trial batch / repeat / lost) · touch count · last touch · next touch · notes in their words.
- **Delivery:** agency · batch · videos · brief received · concept approved · delivered · revision status · deposit received · invoice sent · paid · actual hours.

---

## 8. Website Design System

Mostly unchanged from v3. Founder directive: lots of white space, high-end, clean, easy to navigate. Confident B2B supplier, not a creative agency selling art.

### 8.1 Principles

1. **The work is the pitch.** Video gets the most space on every page.
2. **Confidence over warmth.** Plain, direct statements.
3. **One CTA:** "Ask about a sample." Never split attention.
4. **Fast on a phone.** Most visitors open the link from an email on mobile.

### 8.2 Colour palette (kept)

| Role | Colour |
|---|---|
| Background (light) | `#FAFAF9` |
| Background (dark) | `#16181C`, used more heavily now since the site is video-first |
| Primary text | `#1A1B1E` |
| Text on dark | `#F2F2F0` |
| Accent / CTA | `#E8862E` amber-orange |
| Secondary accent | `#3E5C76` steel blue |
| Borders | `#E2E2E0` |
| Success | `#3F8F5F` (form confirmation only now; the guarantee block is gone) |

### 8.3 Typography (kept)

Clean grotesque sans for headlines (General Sans, Neue Montreal or similar), legible sans for body (same family lighter, or Inter). **No serif.** Desktop: H1 60 to 72px, H2 36 to 42px, H3 20 to 24px, body 16 to 18px. Mobile: H1 36 to 40px, H2 26 to 28px, body 16px minimum.

### 8.4 Spacing & grid (kept)

8px base grid · max content width 1280px, full-bleed allowed for video sections · section padding 96 to 120px desktop, 64px mobile · 12-column desktop, 4-column mobile, 24px gutters.

### 8.5 Components

- **Buttons:** solid amber CTA, 4 to 8px radius. One outline secondary style.
- **Video card:** 9:16 video dominant, poster frame, caption below (vertical · length · format). Muted autoplay in view, tap or click for sound, visible play state.
- **Steps row:** three numbered steps, horizontal on desktop, stacked on mobile.
- **FAQ accordion.**
- **Contact form:** single column, large touch targets, few required fields, clear success state.
- **Removed in v4:** pricing card, guarantee block, all-in cost callout, before/after showcase (may return later with stock photos, honestly captioned).

### 8.6 Video & imagery

- Only real output from the studio. No stock "business people" photos.
- **Compressed web versions** of each video (H.264 MP4, ideally under ~4MB each) with a poster image. Lazy-load anything below the fold. Never autoplay with sound.
- `playsinline` and `muted` on all autoplay video so it works on iOS.

### 8.7 Motion

Quick transitions (100 to 150ms), subtle hover scale on video cards. No confetti, no cursor effects, no slow drifting animations.

### 8.8 Responsive & accessibility

Mobile-first. WCAG AA contrast (check amber on both light and dark backgrounds). Full keyboard navigation with visible focus states. Touch targets at least 44×44px. Videos must degrade gracefully on slow connections (poster frame shows if video doesn't load).

---

## 9. Go-to-Market

**Outbound, written first.** Email or LinkedIn DM with a link to the site (home or Work page) and a short pitch. Follow up at day 5 and day 12, then stop. Phone only for people who replied. No deck.

**The pitch (template):**

> Hi [name], I produce short-form video ad creative for home service accounts. Finished 15 second ads, 3 to 5 day turnaround, fully white label.
>
> If creative fatigue is hurting performance on your contractor accounts, I can be your production arm without you hiring anyone.
>
> A few samples: busyseason.ca
>
> Jolin, Oshawa ON

**Where to find agencies:** LinkedIn ("Meta ads" or "Facebook ads" plus contractors, roofing, HVAC, home services) · media-buyer Facebook and Skool groups · Google ("contractor marketing agency Ontario" and per-trade equivalents) · Meta Ad Library, where an unusually polished contractor ad often has a findable agency behind it.

**Tracking opens (optional):** add a query string per message, e.g. `busyseason.ca/?a=cicon`, so analytics shows which agency opened the link.

**Instagram (@busyseasonn)** runs as a portfolio for agency outreach, not a growth account: Reels of finished ads and spec concepts are the main content, carousels only as portfolio breakdowns. Bio is agency-facing and links to busyseason.ca.

**Effort split:** about 60% agency outreach, 30% producing portfolio ads, 10% Instagram.

**Risks:**

- **Concentration.** One agency could become most of the revenue. Keep adding targets even after a first yes.
- **Price pressure.** Know the floor before the call (Section 4).
- **Invisibility.** Agency work is uncredited. Negotiate private reel rights and anonymous description in every agreement.
- **Cash flow.** Net terms mean a gap between work and payment.
- **Reliability.** One missed deadline likely ends a relationship. Don't take a batch you can't deliver on time.

---

## 10. Open Items

**Before the rebuilt site goes live**

- [ ] **3 strong samples ready** in at least two verticals, compressed for web with poster frames. Roofing stays off until redone.
- [ ] **Check the Meta ad account.** Pause or retarget any campaign still sending homeowners or contractors to the site.
- [ ] **Instagram cleanup.** Archive contractor-facing posts (e.g. the "Free Sample Ad" post) so the feed matches the agency bio. Confirm the bio link points to busyseason.ca.
- [ ] **Facebook page.** If it's going to be built out, build it agency-facing, or leave it empty for now.

**Before the first agency job**

- [ ] **Agency agreement (one page):** per-video rate, turnaround, revision round, 50% upfront on first batch, net terms after, non-solicitation of their clients, private reel and anonymous description rights, confidentiality.
- [ ] **Agency rate:** test $175 on the first 2 to 3 conversations; set the volume step-down from measured hours.
- [ ] **Legal review** of the rewritten Terms and Privacy.
- [ ] **Accountant conversation** on voluntary GST/HST registration.

**Decide**

- [ ] **Where the digital marketing campaign evidence comes from now.** Options: (a) ask each agency for anonymized performance data on the creative; (b) run a small self-funded Meta campaign promoting Busy Season to agency owners, logged properly; (c) still run the detailing pilot purely as a resume campaign, not as a client. Pick one before the end of October so the numbers exist before graduation job applications.
- [ ] **Recurring arrangement:** once one agency orders a second batch, consider a monthly refresh package (e.g. a set number of videos per month at a lower per-video rate), priced from measured hours. Never published on the site.

**Ongoing**

- [ ] Log real hours and credits per batch.
- [ ] Budget Higgsfield credits per job at the start of each month. Credits renew on the 17th and are shared with another project, so balance drops aren't always Busy Season.
- [ ] Monitor revenue against the $30,000 four-quarter GST/HST threshold.
- [ ] Revisit ad length once any agency shares performance data.
- [ ] Logo and wordmark: keep it typographic, headline sans at semibold, no icon.

**Resolved**

- [x] **Go-to-market:** agencies only, 2026-10-05. Direct contractor sales stopped.
- [x] **Agency pricing on the site:** never published.
- [x] **Name and domain:** Busy Season, busyseason.ca, info@busyseason.ca.
- [x] **No custom admin build.** Spreadsheet tracker.
- [x] **Ad length:** ~15 seconds. **Revisions:** one round per batch.
- [x] **Currency:** CAD by default.
- [x] **Site geography:** geography-agnostic; Oshawa mentioned once as a real-person signal.

---

## 11. Website Rebuild List (v4)

> This is the work order. File paths are relative to `website/`. The current site was built for v3 (contractor-facing, Launch Pack, guarantee, campaign launch). Line numbers aren't given because they've drifted; search for the text instead.

### Ground rules

- **Read `website/CLAUDE.md` first** and follow its conventions unless this brief overrides them.
- **Keep the design system** (Section 8). This is a content and structure rebuild, not a redesign.
- **Follow the copy rules in Section 6.** Every sentence should be written to an agency owner.
- **Keep the existing form submission mechanism** (it currently emails `info@busyseason.ca`). Change the fields, not the plumbing.
- **Don't delete anything outside `website/`.**

### 1. Pages: keep, rewrite, remove

| File | Action |
|---|---|
| `index.html` | **Rewrite completely** to the Home spec in Section 6. |
| `work.html` | **Rewrite** to the Work spec. Remove any contractor-facing copy, results claims or CTAs. |
| `contact.html` | **Create** from the Contact spec. Reuse the form handling from `quote.html`. |
| `quote.html` | **Remove** after `contact.html` works. Redirect to `/contact`. |
| `pricing.html` | **Remove.** Redirect to `/`. |
| `how-it-works.html` | **Remove.** Its job moves to the Home "How it works" section. Redirect to `/`. |
| `about.html` | **Remove.** Its job moves to the Home "Who's behind it" block. Redirect to `/`. |
| `samples.html` | **Don't create.** The v3 plan for an unlisted agency samples page is replaced by making the whole site agency-facing. If it already exists, redirect it to `/work`. |
| `terms.html` | **Rewrite** for agency engagements (Section 6, Legal). Percentages only, no dollar figures. Add "NEEDS LEGAL REVIEW" in a comment at the top. |
| `privacy.html` | **Update** the collected-data description to match the new form fields. |
| `zh/` (all pages) | **Remove.** The agency audience is English-language. Redirect `/zh/*` to `/`. |
| `sitemap.xml` (if present) | Update to list only `/`, `/work`, `/contact`, `/terms`, `/privacy`. |
| `robots.txt` (if present) | Make sure it doesn't block the public pages. |

### 2. Redirects

Add permanent (301) redirects in whatever config the host uses (for example `vercel.json` on Vercel, `_redirects` on Netlify). Cover both `/page` and `/page.html` forms:

- `/pricing` → `/`
- `/how-it-works` → `/`
- `/about` → `/`
- `/quote` → `/contact`
- `/samples` → `/work`
- `/zh` and `/zh/*` → `/`

Old links in past outreach, Instagram captions and Meta ads must not 404.

### 3. Shared pieces on every page

- **Nav:** wordmark · Work · Contact · "Ask about a sample" button.
- **Footer:** *"White-label video ads for agencies."* · info@busyseason.ca · Instagram · Terms · Privacy. Remove "Made and launched," the old positioning line, and any links to removed pages.
- **`<title>` and meta description** on every page rewritten for agencies. Example meta description: "White-label short-form video ads for agencies running home service accounts. 15 second ads in every format, 3 to 5 day turnaround."
- **Open Graph tags** (title, description, image) updated to match, so a link pasted into LinkedIn or email previews correctly.

### 4. Search sweep (do this last)

Search all of `website/` for each term below. Every hit should be gone, or deliberately kept for a reason you can state:

`Launch Pack` · `750` · `250` · `375` · `1,000` · `all in` · `ad spend` · `guarantee` · `refund` · `deposit` · `Free Sample Ad` · `spec ad` · `launch them` · `launched` · `campaign` · `ad account` · `access` · `Business Manager` · `handover` · `homeowner` · `your business` · `your customers` · `quote` · `Growth` · `monthly` · `retainer` · `managed` · `pricing.html` · `about.html` · `how-it-works.html` · `quote.html` · `zh/`

Note: words like `campaign`, `deposit` and `access` may legitimately appear in `terms.html` or `privacy.html`. Check each hit in context.

### 5. Done when

- [ ] The site has Home, Work, Contact, Terms, Privacy, and nothing else public.
- [ ] Every old URL in the redirect list lands on a live page, not a 404.
- [ ] No prices, contractor-facing copy, campaign or ad account claims appear anywhere (search sweep is clean).
- [ ] The contact form submits end to end and the email arrives at `info@busyseason.ca`.
- [ ] All sample videos autoplay muted on an iPhone and an Android phone, show a poster frame first, and the home page loads quickly on mobile data.
- [ ] Amber-on-dark and amber-on-light contrast pass WCAG AA.
- [ ] `terms.html` is marked NEEDS LEGAL REVIEW.
- [ ] `website/progress.md` has a dated entry: "v4 rebuild: site rebuilt for agencies only. Removed pricing, how-it-works, about, quote, zh pages; added contact page and redirects. Reason: Busy Season moved to white-label agency work only on 2026-10-05."

---

## 12. Change Log

| Date | Version | Change | Why |
|---|---|---|---|
| 2026-08-16 | v1 | First brief. | |
| 2026-08-17 | v2 | Studio produces and manages campaigns, not just creative. Offer ladder: free spec ad → $750 Launch Pack → $1,500/mo Growth. Real job photos made a required intake item. "No tax added" copy removed. Seasonality and sales system added. | Selling creative alone while promising results depended on distribution the studio didn't touch. |
| 2026-09-18 | v3.0 | Growth tier dropped. Positioning changed to "make and launch," not "make and run." Brief made standalone. Portfolio Goals added. Recommended ad spend set at $500. Live site change list added. | A $1,500/mo retainer was too big an ask with no case studies. |
| 2026-09-27 | v3.1 | Agency white-label track promoted to a main track alongside direct. Agency pitch leads with quality and speed, not real photos. Unlisted samples page specced. | Best long-term channel for a one-person studio; no real client photos available. |
| 2026-09-28 | v3.2 | Recommended ad spend changed to $200 to $300, about $1,000 all in. Samples page drops the photo claim. | Lower all-in figure is an easier first yes for a cold contractor. |
| 2026-10-05 | v4.0 | **Agencies only.** Direct contractor offer retired entirely. Site rebuilt for agencies: Home, Work, Contact, Legal. Unlisted samples page dropped in favour of an agency-facing public site. Portfolio Goals updated. | Most effort was already going to agencies; no access to real contractor photos; a contractor-facing site undercut the agency pitch. |
