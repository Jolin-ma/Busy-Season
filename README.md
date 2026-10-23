# Busy Season

A white-label production studio making short-form video ad creative for
marketing agencies and media buyers who run Meta ads for home service
businesses. 15-second ads in every format, 3 to 5 day turnaround.

The full spec — positioning, production workflow, copy rules, design system — is
`BusySeason_Master_Build_Brief_v4.md`. Read that before changing anything
customer-facing.

## What's in here

| Directory | What it is | Runs on |
|---|---|---|
| `website/` | The marketing site. Static HTML/CSS/JS; the contact form posts to Formspree. | Vercel → `busyseason.ca` |

That's the whole repo. There is no build step and no `node_modules` anywhere.

## Getting started

No install, no build. Open `website/index.html`, or serve the folder. Copy
decisions are logged in `website/progress.md`.

## Notes

`CLAUDE.md` carries the operational detail worth knowing before touching
deployment config — including a Vercel root-directory trap that has bitten this
repo more than once, and how the contact form delivers a lead.
