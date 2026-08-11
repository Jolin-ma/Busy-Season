# LegacyLink Studio Website — Progress Log

Tracks build status for **Site 2 (LegacyLink Studio, the company/studio
site)** against `Loyal_Tale_Master_Build_Brief.md` Section 4. Scoped to
this `website/` folder only — the rest of this repo (`src/`, `admin/`,
`ops-dashboard/`, `lambda/`, `prisma/`, etc.) is a separate, larger product
(a QR-code memorial platform, formerly "Remember Paws") that predates the
current Loyal Tale / LegacyLink Studio plan and is not tracked here.

Per `CLAUDE.md`, this folder deploys as its own Vercel project to
`legacylinkstudio.com` (repo-root `vercel.json`, `outputDirectory: website`)
— separate from the Fastify API, admin app, and ops dashboard, which deploy
to their own subdomains from other folders in this repo.

**Note on scope:** the master brief also covers Site 1 (Loyal Tale — repo
`Loyal Tale`) and Site 3 (the admin ops tool — repo `Loyal Tale Admin`).
Each has its own `progress.md`. Not tracked here.

---

## 2026-08-10 — Audit + mobile nav fix

Audited all six pages against brief §4.3. All required pages already
existed and matched the brief closely:

| Page | Status | Notes |
|---|---|---|
| Homepage | ✅ | Hero, "Our Products" (Loyal Tale live + "More coming soon" placeholder card), "why this matters" framing, "For Partners" section with CTA |
| About | ✅ | Mission, honest placeholder for founder background ("will be added here as the studio grows"), links out to Loyal Tale |
| Partners | ✅ | Vet/crematorium/insurance-framed pitch, inquiry form (clearly marked "in preview — submissions are not yet sent... also email partners@ directly") |
| Press | ✅ | Boilerplate, logo asset, "coming soon" tags for press kit / brand assets, media contact |
| Contact | ✅ | Form + direct emails routed by purpose (general/partnerships/press/product support) |
| Legal (Privacy/Terms) | ✅ | Both scoped explicitly to the studio site only (not the products), both carry a visible "needs legal review" notice |

Cross-linking with Loyal Tale (brief §7 item 9) was already done on both
sides — this site links to `loyaltale.com` in the hero, product card, and
footer; the Loyal Tale site links back to `legacylinkstudio.com`.

**Bug found and fixed:** on screens ≤760px, the Contact button
(`.nav-cta-wrap`) was hidden by the mobile media query, but the hamburger
menu's `.open` toggle only ever re-revealed `.nav-links` — never
`.nav-cta-wrap`. Since "Contact" isn't one of the plain text nav links (it
lives in its own pill-button wrapper for the desktop layout), mobile
visitors had **no way to reach the Contact page from the nav at all**, on
any of the six pages, short of scrolling to the footer.

Fixed by wrapping `.nav-links` and `.nav-cta-wrap` in a new `.nav-panel`
container that uses `display: contents` by default — zero layout effect,
so desktop is pixel-identical to before — and only becomes a real flex
column when `.site-header.open`, so both the nav links and the Contact
button now render inside the same mobile dropdown. Applied identically
across all six pages, since they share the same header markup.

**Verification method:** this environment's browser-resize tool doesn't
actually shrink the real viewport (confirmed via `window.innerWidth`
staying at desktop size after resize calls), so a real mobile screenshot
wasn't possible here. Verified instead by: (1) confirming the desktop
screenshot is unchanged after the fix, and (2) injecting the mobile
media-query rules directly via a `<style>` tag and toggling `.open`,
which confirmed via computed styles that the Contact link becomes visible
and reachable. Worth a real device/DevTools-responsive-mode check before
the next deploy, since that's a more direct test than the workaround used
here.

---

## Known open gaps (deliberate, not oversights — all flagged in the UI itself)

- **Founder background** — About page placeholder, brief §4.3 asks for it but no content exists yet
- **Press kit downloads** — logo pack, screenshots, headshots all "coming soon"
- **Partner inquiry form** — doesn't submit anywhere yet (no backend); explicitly labeled "in preview," directs to a direct email in the meantime
- **Contact form** — same as above, client-side-only success state, no real submission
- **Privacy Policy / Terms of Service** — draft content, both carry a visible legal-review warning banner

## Suggested next steps

1. Do a real mobile-device or DevTools-responsive-mode check of the nav
   fix before the next production deploy (see verification note above).
2. Once a form backend/email service is chosen, wire the Partner inquiry
   and Contact forms to actually send somewhere.
3. Add founder background copy and real press kit assets once available.
