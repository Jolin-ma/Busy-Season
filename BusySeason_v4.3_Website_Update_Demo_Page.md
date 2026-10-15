# Busy Season: v4.3 website update and demo landing page setup

**Date:** 2026-10-15
**Goes with:** `BusySeason_Master_Build_Brief_v4.md` (v4.3). If anything here disagrees with the brief, the brief wins.
**For:** whoever is editing `website/` (WebStorm's AI assistant, Claude, or Jolin).

This covers two jobs:

1. **Small copy updates** to Home and Work so the site mentions landing pages as part of a campaign set.
2. **Setting up the roofing demo landing page** at `/demos/roofing-inspection/`.

Do part 1 any time. Part 2 can start now since it uses no Higgsfield credits, but don't link it from the Work page until the page is actually finished and checked.

Read `website/CLAUDE.md` before touching anything. Add a `progress.md` entry at the end (template at the bottom).

---

## Part 1: Copy updates on Home and Work

These are small. If the v4 rebuild isn't done yet, fold them into it instead of doing them separately.

### `index.html`

**"What you get" list.** Change the campaign set item to:

> Campaign sets on request: the video plus matching statics, a carousel and a landing page the ads point to

**FAQ.** Replace the "Which formats?" and "Do you only do video?" answers, and add a new "Do you build websites?" question right after them.

- **Which formats?** Video in 9:16, 1:1 and 16:9. Statics and carousels in 1:1 and 4:5. Landing pages as static files you can host anywhere.
- **Do you only do video?** Video is the main thing. If you want the full set, we can turn the same concept into matching static ads, a carousel and the landing page the ads send people to, so everything in the campaign looks and reads the same. We make the creative only; you host it and run the campaign.
- **Do you build websites?** Not full sites. We build one landing page per campaign set, matched to the ads. You host it and add your own tracking.

**Don't add** anything like "web design," "we build websites," a separate landing page section, or any price.

### `work.html`

Nothing to add yet. When the roofing campaign set is done, the "One concept, every format" section gets a fourth piece: a phone-frame screenshot of the landing page that links to `/demos/roofing-inspection/`. Snippet in Part 2, step 9.

### Search check after part 1

Search `website/` (excluding `demos/`) for `web design` and `websites`. The only allowed hit is the "Do you build websites?" FAQ answer.

---

## Part 2: Demo landing page

### What it is

A spec landing page for a **fictional** roofing company, built to match the roofing seasonal inspection campaign set (same offer, same hook, same look as the video and statics). It shows agencies what the add-on looks like, and it's front-end portfolio evidence.

### The four rules that make it safe to publish

1. **Noindex.** It never shows up in Google.
2. **Spec banner.** A fixed strip at the top says it's a spec page by Busy Season, so nobody thinks it's a real roofer.
3. **Form collects nothing.** Submitting shows a "this is a demo" message. No data is sent anywhere.
4. **Only linked from the Work page.** Not in the nav, footer or sitemap.

### Step 1: Pick the fictional company

- Make up a name, for example **Northfield Roofing Co.** Before using it, Google it plus "roofing Ontario" and check Facebook. If a real company has it, pick another.
- Phone number: use a fake one from the reserved range, like `(905) 555-0142`. Never a real number.
- No real street address. A city-level line like "Serving Durham Region" is fine, it's fake anyway.
- No real logos. Make a simple text wordmark in CSS.

### Step 2: Folder setup

```
website/
  demos/
    roofing-inspection/
      index.html
      styles.css
      main.js
      README.md
      assets/
        hero-poster.jpg
        roofing-15s.mp4
        reason-1.webp
        reason-2.webp
        reason-3.webp
        og-image.jpg
```

Everything the page needs lives in this folder. It shouldn't load anything from the main site's CSS or JS. That keeps it a clean, self-contained example of what an agency would actually get delivered.

**Assets:**

- `roofing-15s.mp4`: the finished roofing ad, compressed H.264, ideally under 4MB.
- `hero-poster.jpg`: a clean frame from that video, used as the poster.
- `reason-1/2/3.webp`: the three static ads, or clean frames from them, compressed.
- `og-image.jpg`: 1200×630, for link previews.

### Step 3: Page sections

Top to bottom, mobile-first:

1. **Spec banner** (fixed, thin, dark): "Spec landing page by Busy Season · See the full campaign set →" linking to `/work`.
2. **Header:** wordmark left, click-to-call button right.
3. **Hero:** headline that matches the main hook of the roofing ad word for word or close to it. One supporting line. One CTA button ("Book a free inspection" or whatever the ad's CTA is) that scrolls to the form.
4. **Video:** the roofing ad, muted, `playsinline`, poster frame, tap for sound.
5. **Three reasons:** one card per static ad angle, image plus a short headline and one sentence. These must say the same thing the statics say.
6. **Trust strip:** fictional details only (years in business, "Licensed and insured," warranty line). No fake reviews, no star ratings, no "trusted by" logos. Keep it believable but clearly made up if anyone checks.
7. **Form:** name, phone, postal code, optional message. Submit button text matches the CTA.
8. **Footer:** company name, fake phone, "Spec page. Not a real business." and a small link back to busyseason.ca.

The colours and fonts should fit a roofing company, not Busy Season's palette. Match whatever look the roofing statics use so the set reads as one campaign.

### Step 4: `<head>` setup

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Spec page: keep out of search -->
  <meta name="robots" content="noindex, nofollow">

  <title>Northfield Roofing Co. · Free Roof Inspection (Spec Page)</title>
  <meta name="description" content="Spec landing page built by Busy Season as part of a roofing campaign set. Not a real business.">

  <meta property="og:title" content="Roofing landing page (spec) · Busy Season">
  <meta property="og:description" content="One concept from ad to form. Spec work, not a real business.">
  <meta property="og:image" content="https://busyseason.ca/demos/roofing-inspection/assets/og-image.jpg">

  <link rel="stylesheet" href="styles.css">

  <!-- AGENCY: paste your Meta pixel / Google tag here -->
  <!-- (left empty on purpose; the studio never installs tracking) -->

  <script src="main.js" defer></script>
</head>
```

The "AGENCY" comment is deliberate. It's the same spot a real delivered page would have, so the demo shows how handover works.

### Step 5: Spec banner

```html
<div class="spec-banner" role="note">
  Spec landing page by Busy Season ·
  <a href="/work">See the full campaign set →</a>
</div>
```

```css
.spec-banner {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #16181C;
  color: #F2F2F0;
  font: 500 13px/1.4 system-ui, sans-serif;
  text-align: center;
  padding: 8px 16px;
}
.spec-banner a { color: #E8862E; }
```

`sticky` is fine here and avoids the content jumping under a `fixed` bar. If you use `fixed`, add top padding to the body.

### Step 6: Video

```html
<video
  class="hero-video"
  src="assets/roofing-15s.mp4"
  poster="assets/hero-poster.jpg"
  muted
  playsinline
  loop
  preload="metadata"
  aria-label="15 second roofing ad"></video>
<button class="sound-toggle" type="button" aria-pressed="false">Tap for sound</button>
```

`muted` and `playsinline` are required or iPhones won't autoplay it. Autoplay only once it scrolls into view (handled in `main.js`).

### Step 7: The form that collects nothing

```html
<form class="lead-form" id="lead-form" novalidate>
  <label>Name <input name="name" autocomplete="off" required></label>
  <label>Phone <input name="phone" type="tel" autocomplete="off" required></label>
  <label>Postal code <input name="postal" autocomplete="off"></label>
  <label>Anything we should know? <textarea name="message" rows="3"></textarea></label>
  <button type="submit">Book my free inspection</button>
  <p class="form-note" id="form-note" role="status" aria-live="polite"></p>
</form>
```

No `action` attribute, no `method`, no form service. `autocomplete="off"` so browsers don't offer to fill in real details.

### Step 8: `main.js`

```js
// Demo form: never sends anything.
const form = document.getElementById('lead-form');
const note = document.getElementById('form-note');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.reset();
    note.textContent =
      'This is a demo form on a spec page. Nothing was sent. On a real page, this would go to the agency\'s CRM.';
  });
}

// Autoplay the video only when it's on screen.
const video = document.querySelector('.hero-video');
if (video && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        video.play().catch(() => {}); // some browsers block it, poster stays
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.5 });
  io.observe(video);
}

// Sound toggle.
const toggle = document.querySelector('.sound-toggle');
if (video && toggle) {
  toggle.addEventListener('click', () => {
    video.muted = !video.muted;
    toggle.setAttribute('aria-pressed', String(!video.muted));
    toggle.textContent = video.muted ? 'Tap for sound' : 'Mute';
  });
}

// Smooth scroll for the CTA buttons.
document.querySelectorAll('a[href="#lead-form"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('lead-form').scrollIntoView({ behavior: 'smooth' });
  });
});
```

The click-to-call button can be a normal `tel:` link with the fake 555 number. It'll just fail to connect, which is fine.

### Step 9: Link it from the Work page (only when finished)

Inside the "One concept, every format" block on `work.html`:

```html
<a class="lp-preview" href="/demos/roofing-inspection/" target="_blank" rel="noopener">
  <img src="/assets/work/roofing-lp-phone.webp"
       alt="Landing page for the roofing campaign set, shown on a phone"
       width="390" height="780" loading="lazy">
  <span>Landing page · opens the live spec page</span>
</a>
```

Take the screenshot on a real phone (or Chrome dev tools at 390px wide), drop it into a simple phone frame, export as WebP.

### Step 10: Keep it out of search and the sitemap

- `sitemap.xml`: don't list anything under `/demos/`.
- `robots.txt`: leave `/demos/` **unblocked**. If robots.txt blocks it, Google can't see the noindex tag and might still list the bare URL. The noindex tag does the work.
- On Vercel, a folder with an `index.html` is served at `/demos/roofing-inspection/` automatically. Check that the trailing-slash version and the no-slash version both load. If `cleanUrls` or `trailingSlash` in `vercel.json` cause a redirect loop or 404, fix it there.

### Step 11: README for the folder

This mirrors what a real agency would get, so write it like one. Put it in `demos/roofing-inspection/README.md`:

```md
# Roofing inspection landing page (spec)

Static page. No build step. Upload the whole folder to any host.

- Tracking: paste your pixel / tags where the `AGENCY` comment is in index.html.
- Form: in a real delivery, the form posts to your CRM or form tool.
  In this spec version it's disabled on purpose.
- Phone number: search index.html for 555-0142 and replace it.
- Video and images: assets/ folder, all compressed for mobile.
```

---

## Part 3: Check before calling it done

**On a real phone (iPhone and Android if possible):**

- [ ] Spec banner shows and stays visible while scrolling
- [ ] Video shows the poster first, autoplays muted when on screen, sound toggle works
- [ ] CTA buttons scroll to the form
- [ ] Submitting the form shows the demo message and nothing gets sent (check the Network tab in dev tools on desktop: no request on submit)
- [ ] No horizontal scrolling at 360px wide
- [ ] Every button and input is easy to tap

**Lighthouse (Chrome dev tools, mobile, incognito):**

- [ ] Performance 90+ if possible. If not, the video and images are usually why. Compress them more.
- [ ] Accessibility 95+
- [ ] Note the scores. They go in the web case study.

**Honesty and setup:**

- [ ] `<meta name="robots" content="noindex, nofollow">` is in the `<head>`
- [ ] Company name isn't a real business, phone is a 555 number, no real address
- [ ] No fake reviews or star ratings anywhere
- [ ] Not in nav, footer or sitemap
- [ ] Only linked from `work.html`

**Log it:**

- [ ] Write down how many hours the page took, start to finish. That number sets the add-on price (brief Section 4).

---

## `progress.md` entry

```
2026-10-?? · v4.3 update
- Home: "What you get" and FAQ updated to mention landing pages as part of a campaign set. Added "Do you build websites?" FAQ.
- Added spec landing page at /demos/roofing-inspection/ (noindex, spec banner, disabled form, self-contained folder). Linked from Work page only. Not in sitemap.
- Lighthouse mobile: Performance __ / Accessibility __ / Best Practices __ / SEO n/a (noindex)
- Hours on landing page: __
- Reason: brief v4.3 added landing pages as a campaign set add-on (2026-10-15).
```
