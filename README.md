# LegacyLink Studio

A small AI-powered video ad studio. It produces short, ready-to-run video ads
for roofing and home-service companies.

The full spec — pricing, positioning, production workflow, design system — is
`LegacyLink_Studio_Master_Build_Brief.md`. Read that before changing anything
customer-facing.

## What's in here

| Directory | What it is | Runs on |
|---|---|---|
| `website/` | The marketing site. Static HTML/CSS/JS, plus one serverless function for the quote form. | Vercel → `legacylinkstudio.com` |
| `studio/` | The back office: clients, production pipeline, leads inbox. Next.js + Prisma + Neon Postgres. | Vercel (not yet deployed) |

Each is self-contained with its own dependencies. There is no build step at the
repo root and no shared `node_modules`.

## Getting started

**Marketing site** — no install, no build. Open `website/index.html`, or serve
the folder. Copy and pricing decisions are logged in `website/progress.md`.

**Back office** — see `studio/README.md`. Short version:

```bash
cd studio
npm install
cp .env.example .env    # then fill in the Neon connection strings
npm run db:migrate
npm run dev             # http://localhost:3001
```

## Notes

`CLAUDE.md` carries the operational detail worth knowing before touching
deployment config — including a Vercel root-directory trap that has bitten this
repo more than once, and how the quote form's lead path spans both projects.

This repository previously held a separate QR-memorial product. It was retired
on 2026-08-16 and its code removed; recover it from git history if ever needed.
