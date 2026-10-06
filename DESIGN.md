---
name: Busy Season
description: White-label video ads for agencies running home service accounts.
colors:
  cool-paper: "#fafaf9"
  paper-alt: "#f2f1ef"
  charcoal: "#16181c"
  charcoal-soft: "#1f2229"
  ink: "#1a1b1e"
  ink-muted: "#5a5d63"
  on-dark: "#f2f2f0"
  on-dark-dim: "rgba(242, 242, 240, 0.68)"
  work-light-amber: "#e8862e"
  amber-pressed: "#d4741d"
  steel-blue: "#3e5c76"
  steel-pressed: "#33506a"
  success-green: "#3f8f5f"
  hairline: "#e2e2e0"
  hairline-on-dark: "rgba(242, 242, 240, 0.14)"
typography:
  display:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5.2vw, 4.25rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "clamp(1.625rem, 3.4vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  headline-inline:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  subhead:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title-sm:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  body-ui:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  caption-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.16em"
  micro:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.12em"
  micro-xs:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
  page-title:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4.4vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.03em"
rounded:
  xs: "4px"
  sm: "6px"
  lg: "10px"
  pill: "999px"
  focus: "2px"
spacing:
  base: "8px"
  gutter: "24px"
  section-y: "112px"
  section-y-mobile: "64px"
components:
  button-primary:
    backgroundColor: "{colors.work-light-amber}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "14px 28px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.amber-pressed}"
    textColor: "{colors.ink}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "14px 28px"
    height: "48px"
  nav-cta:
    backgroundColor: "{colors.work-light-amber}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 22px"
    height: "44px"
  card:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "32px"
  video-card:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.lg}"
    padding: "0"
  chip:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
    height: "48px"
---

# Design System: Busy Season

## Overview

**Creative North Star: "The Supplier's Reel"**

Busy Season looks like a production supplier showing its reel to another professional: the work up front, a few plain sentences, one way to get in touch. The visitor is an agency owner or media buyer who clicked a link in a cold email, usually on a phone, and gives the site about 90 seconds. They are marketing-literate; they judge the creative, the turnaround and the reliability, not the decoration. The design's whole job is to get two or three ads playing in front of them quickly and make "Ask about a sample" the obvious next step.

The system runs on high contrast and generous space, and since v4 it is **video-first**: deep charcoal (`#16181c`) carries the hero and the sample reel together as one dark block, so the ads sit on a cinema-dark ground. Near-white cool paper (`#fafaf9`) carries the reading sections (the problem, how it works, what you get, FAQ, who's behind it). One saturated amber is the only action colour, rationed to the CTA button and to accents on charcoal. Steel blue is the quieter supporting voice on light grounds. Geometry is crisp: 6px and 10px corners, 1px hairlines, an 8px grid, flat surfaces.

This is deliberately **not** the register of the founder's warmer consumer brand: no serif, cooler paper, sharper edges, higher contrast. And it is deliberately not a creative agency's portfolio site: no art-direction flourishes, no case-study theatre, no prices, no proof it doesn't have.

**Key Characteristics:**
- The work is the pitch. Video gets the most space on every page.
- One accent colour, one action per page: "Ask about a sample."
- Charcoal for the video, cool paper for reading; no third background mood.
- Crisp 6px/10px geometry and 1px hairlines; flat at rest.
- No serif, ever. Space Grotesk for anything that carries weight, Inter for reading.
- No prices, numbers-as-proof, logos or testimonials. Captions are plain facts: vertical · length · format.

## Colors

A cool, near-monochrome field (paper and charcoal doing almost all the work) with one saturated amber for action and a steel blue for support.

### Primary
- **Work-Light Amber** (`#e8862e`): The single action colour. It fills the primary CTA button and the nav CTA, the `::selection` highlight, and the underline of inline links. On charcoal it may also set text and marks: eyebrows, step numbers, the step top-rule, the focus ring. On paper it is a **fill only**: 2.55:1, so it never sets text, icons or focus rings there. The amber button takes near-black label text (`#1a1b1e`, 6.46:1), never white. On charcoal amber reaches 6.67:1.
- **Amber Pressed** (`#d4741d`): Hover state for the amber button and nav CTA only.

### Secondary
- **Steel Blue** (`#3e5c76`): The accent-coloured text and mark on light grounds (6.71:1 on paper): eyebrows, step numbers, FAQ chevrons, the "What you get" ticks, and the keyboard focus ring on light sections.
- **Steel Pressed** (`#33506a`): Hover state for steel elements.

### Tertiary
- **Success Green** (`#3f8f5f`): Confirmation only, i.e. the left border of the contact form's success notice. (It was the guarantee colour before v4; the guarantee is retired.) 3.9:1 on paper, so never body text.

### Neutral
- **Cool Paper** (`#fafaf9`): The default page background.
- **Paper Alt** (`#f2f1ef`): Alternating band for a light section that needs separation (`.section-alt`): How it works and the FAQ on Home.
- **Charcoal** (`#16181c`): Hero, sample reel, Work grid, closing CTA band, footer.
- **Charcoal Soft** (`#1f2229`): Cards and nested surfaces inside charcoal.
- **Ink** (`#1a1b1e`): Primary text on light, and the label on the amber button.
- **Ink Muted** (`#5a5d63`): Secondary text on light (6.6:1 on paper).
- **On Dark** (`#f2f2f0`) / **On Dark Dim** (`rgba(242,242,240,0.68)`): Primary and secondary text on charcoal, including the video-card captions.
- **Hairline** (`#e2e2e0`) / **Hairline On Dark** (`rgba(242,242,240,0.14)`): 1px borders and dividers.

### Named Rules
**The One Voice Rule.** Amber is the only action colour and appears on no more than ~10% of any screen. If two unrelated things on a light page are amber, one of them is wrong.

**The Amber-Is-Not-Text Rule.** On any light background amber may fill a shape but never sets type, an icon, or a focus ring (2.55:1 fails both the 4.5:1 text and 3:1 non-text minimums). Steel takes those jobs on light; amber takes them on charcoal. A comment block at the top of `styles.css` restates this; keep it.

## Typography

**Display Font:** Space Grotesk (with Inter, then system-ui, sans-serif), weights 500/600/700 from Google Fonts.
**Body Font:** Inter (with system-ui, -apple-system, Segoe UI, sans-serif), weights 400/500/600.

**Character:** A geometric-leaning grotesque paired with a workhorse UI sans. Headlines run tight (down to `-0.035em` on the hero) with `text-wrap: balance`. **No serif anywhere.**

### Hierarchy
- **Display** (600, `clamp(2.25rem → 4.25rem)`, line-height 1.04): The hero H1 only. A plain statement of what the studio is and for whom.
- **Page title** (600, `clamp(2.25rem → 3.5rem)`): Interior-page H1 (Contact, legal). The Work page uses an H1 styled at headline size (`.h2`) so the video grid stays the hero.
- **Headline** (600, `clamp(1.625rem → 2.5rem)`): Section headers (`h2`), 26px floor on mobile.
- **Title** (600, `1.375rem`): Step headings and card headings; **Title Sm** (`1.125rem`) inside cards and for FAQ summaries.
- **Body** (400, 17px, line-height 1.6). **Body Lg** (`1.25rem`) for ledes, Ink Muted, ~38rem measure. **Body Ui** (`1rem`, 600) for buttons.
- **Body Sm / Caption / Caption Sm** (15 / 14 / 13px): supporting text, video-card captions, footer.
- **Label** (700, `0.75rem`, tracking `0.16em`, uppercase): the eyebrow above every section header. Steel on light, amber on charcoal. **Micro** (`0.6875rem`) for the format tag on the hero reel ("HVAC · 15s · 9:16").

Stay on the existing ladder; don't introduce in-between sizes.

### Named Rules
**The Plain-Words Rule.** Every headline says what the studio does, or what the agency gets, in plain language. No puns on the company name, no hype vocabulary.

**The No-Price Rule.** No dollar figure, rate, range or "starting at" appears anywhere in the design. The numeric price styles from v3 were removed along with the pricing components.

## Layout

A single centred column, `max-width: 80rem` (1280px), `1.5rem` gutters. Narrow prose (legal, FAQ, "Who's behind it") caps at `46rem`. 8px base grid.

Section padding is `7rem` desktop, `4rem` below 860px; `.section-tight` uses `5rem`. On Home the sample-reel section uses `.section-flush-top` so it continues straight out of the dark hero as one block.

**Video grid** (`.work-grid`): three 9:16 cards across. On Home it is capped at `60rem` so a card fits a laptop screen, with the section head and button aligned to the same edge; on Work (`.work-grid-large`) it takes the full content width ("fewer, bigger, better"). It stays three across down to 760px, then stacks to a single column capped at `22rem`. No vertical filter until there are 8+ pieces.

Breakpoints: **1000px** (hero and split grids stack; the hero reel centres), **860px** (sections tighten, content grids and steps collapse to one column), **760px** (nav collapses to a toggled dropdown including the CTA; the video grid stacks; button rows go full width).

## Elevation & Depth

**Flat by default.** Cards, inputs and panels are flat surfaces with a 1px hairline. Depth at rest is tonal: charcoal against paper, charcoal-soft against charcoal.

### Shadow Vocabulary
- **Lift** (`0 18px 40px -24px rgba(22,24,28,0.45)`): available as `.card-lift`; unused on the v4 pages.
- **Lift (raised)** (`0 24px 56px -24px rgba(22,24,28,0.5)`): hover/focus on a video card, paired with `scale(1.02)`.

### Named Rules
**The Flat-At-Rest Rule.** A shadow appears only in response to hover or focus on a video card. Adding one anywhere else breaks the system.

## Shapes

Crisp, near-square geometry. **4px** for small tags (the hero format tag); **6px** (`--radius`) for buttons, inputs and the nav CTA; **10px** (`--radius-lg`) for cards, the reel frame and video cards. Focus outlines round at 2px. Fully round only for the circular sound toggle (`50%`) and chips (`999px`).

Borders do the defining: 1px hairline on light, `rgba(242,242,240,0.14)` on charcoal. Numbered steps use a top rule only: 2px ink on light, amber on charcoal.

## Components

### Buttons
- **Shape:** 6px corners, 1px border, `min-height: 3rem` (≥44px), `0.875rem 1.75rem` padding, weight 600.
- **Primary** (`.btn-primary`): amber fill, near-black label. The label is always "Ask about a sample". One per view.
- **Secondary** (`.btn-secondary`): transparent, ink text, `rgba(26,27,30,0.28)` border darkening to ink on hover; on charcoal the text and border flip to on-dark values. Used for "See all the work".
- **Inline link** (`.link`): ink (or on-dark) text with a 2px amber underline. The amber is decoration beside text that already passes, so it is allowed on light.
- **Focus:** 3px outline at 2px offset; steel on light, amber inside `.hero`, `.section-dark`, `.cta-band` and `.site-footer`.

### Video Card (`.work-card` / `.work-thumb`)
The core component. A 9:16 frame (10px corners, charcoal gradient ground, hairline-on-dark border) holding a `<video>` with a webp `poster` and `muted loop playsinline preload="none" data-autoplay-visible`. `script.js` plays it only while at least 35% of it is on screen and pauses it when scrolled away; under reduced motion it stays on the poster. A circular sound toggle sits bottom-right (on-dark icon on a translucent charcoal scrim, amber fill with near-black icon on hover); tapping the video itself does the same, and only one clip is ever audible. Below the frame, `.work-meta` captions it with the vertical (strong, on-dark) and "15s · 9:16" (caption, on-dark-dim, uppercase tracking). Hover/focus: `scale(1.02)` plus the raised shadow.

### Hero Reel (`.reel`)
The same 9:16 container in the hero's right column (max 17.5rem wide), holding the best sample with `autoplay muted loop playsinline preload="metadata"`, a Micro format tag top-left, and the sound toggle. Under reduced motion `script.js` stops it on its first frame until tapped.

### Steps Row (`.steps`)
Three numbered steps, horizontal on desktop, stacked under 860px. Each has a CSS-counter number ("01") above a 2px top rule; numbers are steel on light, amber on charcoal.

### Checklist (`.checklist`)
The "What you get" list: plain rows separated by hairlines, each with a steel tick drawn in CSS. No card chrome.

### FAQ Accordion (`.faq`)
Native `<details>/<summary>`, keyboard-accessible with no JS. A hairline between items, Space Grotesk summaries, and a steel chevron that rotates when open.

### Contact Form
Single column inside a white card: name, agency or company, email (required); accounts run (optional select) and what you need (optional textarea). Inputs are white, 6px corners, `rgba(26,27,30,0.22)` border, `min-height: 3rem`. A full-width primary "Send" button. Success replaces the form with a `.notice-success` (green left border); failure shows a `.notice` with a pre-filled mailto fallback. `info@busyseason.ca` sits beside the form as a link.

### Navigation
Sticky, translucent paper with a 10px backdrop blur, 1px bottom hairline, `4.5rem` tall. Typographic wordmark left ("Busy *Season*", with "Season" in Ink Muted and no icon); links **Work** and **Contact** in Ink Muted; amber "Ask about a sample" right (never wraps). Under 760px everything collapses into a toggled dropdown; Escape closes it and returns focus.

### Footer
Charcoal. Left: wordmark, "White-label video ads for agencies.", and `info@busyseason.ca` with an amber underline. Right: Instagram, Terms, Privacy. A hairline above the copyright line. Nothing else.

### Retired in v4
Pricing cards and the featured-plan treatment, the all-in cost callout, the guarantee block, the before/after photo showcase, radio cards, the fact/stat strip, and the four-column footer. Their CSS was deleted. The before/after showcase may return later with licensed stock photos, honestly captioned.

## Do's and Don'ts

### Do:
- **Do** give video the most space on every page, and keep captions to vertical · length · format.
- **Do** ship every video compressed (H.264, `+faststart`, ideally under 4 MB) with a poster, `muted playsinline`, and lazy-loaded below the fold.
- **Do** keep one amber action per view, always "Ask about a sample".
- **Do** use steel for accent text, icons and focus on light grounds, and amber for those on charcoal.
- **Do** keep surfaces flat with hairlines, and corners at 6px/10px.
- **Do** use only real studio output as imagery.

### Don't:
- **Don't** put a price, rate, range or "starting at" anywhere.
- **Don't** add testimonials, client logos, "trusted by" bars, counts or performance numbers until real ones exist with written permission.
- **Don't** set amber text, icons or focus rings on paper, or white text on the amber button.
- **Don't** introduce a serif, a second accent colour, or a third background mood.
- **Don't** autoplay with sound, or let a sample download before it scrolls into view.
- **Don't** pun on the "Busy Season" name in a headline.
- **Don't** add confetti, cursor effects, slow drifting animation, or transitions longer than ~150ms.
