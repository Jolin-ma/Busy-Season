# Parked: Simplified Chinese site (`zh-hans/`)

**Parked 2026-09-18. Not deployed.** This folder sits outside `website/` (Vercel's Root Directory), so nothing here is published. The Chinese pages were taken down until the founder needs a bilingual version — for example, when applying for a role that requires it.

## What's here

The six `zh/` pages (index, work, how-it-works, pricing, about, quote), **already updated to brief v3** on 2026-09-18: Growth plan removed, "launch them for you" wording, single Launch Pack card, the ad-account-access block. They are a **Claude draft the founder has not approved.** Approve every line before publishing — especially pricing, the guarantee, the ad-account-access block and the payment answer — and keep each Chinese paragraph on a single source line (see `DESIGN.md`, "The CJK Reset Rule").

## How to restore

1. **Review and approve the copy** (above). Re-check it against the current English pages first — if the English has changed since 2026-09-18, mirror those changes.
2. `git mv _parked/zh-hans website/zh`
3. **Delete the temporary redirect** in `website/vercel.json` (`"source": "/zh/:path*"`). If it stays, `/zh/` will keep redirecting to the English home page even though the pages exist.
4. **Put the links back in the English pages.** They were removed in the commit that parked this folder — `git show <that commit>` shows exactly what to reinstate:
   - the `<div class="lang-toggle">` EN / 中文 block in each page's header (`.lang-toggle` CSS is still in `styles.css`);
   - the three `hreflang` `<link rel="alternate">` lines (`en`, `zh-Hans`, `x-default`) in the `<head>` of the six marketing pages — they must be reciprocal with the `zh/` pages;
   - the short Chinese note at the top of `terms.html` and `privacy.html` pointing to `zh/index.html`.
5. Verify every `zh/` page loads, both toggles work, and the quote form's "Sending…" label still localizes (`data-sending-label` in `script.js` was left in place).

Everything the `zh/` pages need — `styles.css` (including the `:lang(zh)` rules) and `script.js` — is still in `website/`.
