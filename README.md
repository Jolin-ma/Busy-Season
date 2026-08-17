# LegacyLink Studio

A small AI-powered video ad studio. It produces short video ads for home
service businesses — and runs them as Meta campaigns on the client's own ad
account.

The full spec — pricing, positioning, production workflow, design system — is
`LegacyLink_Studio_Master_Build_Brief.md`. Read that before changing anything
customer-facing.

## What's in here

| Directory | What it is | Runs on |
|---|---|---|
| `website/` | The marketing site. Static HTML/CSS/JS, plus one serverless function for the quote form. | Vercel → `legacylinkstudio.com` |

That's the whole repo. There is no build step and no `node_modules` anywhere.

## Getting started

No install, no build. Open `website/index.html`, or serve the folder. Copy and
pricing decisions are logged in `website/progress.md`.

## Notes

`CLAUDE.md` carries the operational detail worth knowing before touching
deployment config — including a Vercel root-directory trap that has bitten this
repo more than once, and what the quote form needs in order to deliver a lead.

Two things used to live here and no longer do. Recover either from git history
if it's ever wanted again, but treat both as gone rather than dormant:

- **A QR-memorial product**, retired 2026-08-16 along with its Vercel projects,
  its Railway API, and its DNS records.
- **A custom back office** (`studio/` — clients, production pipeline, leads
  inbox; Next.js + Prisma + Neon), removed 2026-08-17. Brief v2 §7 is explicit
  that there is **no custom admin build at launch**: pipeline and delivery go in
  one shared tracker (spreadsheet, Notion, or Airtable) instead. Rebuild as real
  software only if volume makes the tracker genuinely painful.
