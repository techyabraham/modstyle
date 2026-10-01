# Modstyle Crunch And Cream

Static Astro website for the Crochet and Peanuts departments. Phases 1–8 are complete; read the handover documents before adding client content or deploying.

Use Node `24.15.0` and pnpm `11.19.0`.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm dev
```

Local preview mode is the default. Product catalogues, the gallery and reviews show only published listings; they do not include sample cards. The preview-only styleguide and labelled notes for unconfirmed business information remain. To verify a production build, set `SITE_URL` to the approved domain origin and run `pnpm build:prod`; this build runs the output guard. `pnpm check` runs typecheck, lint, unit tests, production browser checks and axe checks. Run `pnpm lhci` for the configured mobile Lighthouse budgets; on Windows use `pnpm lhci:local` if LHCI cannot clean up its temporary Chrome profile.

Read the handover guides:

- [Editing products, prices, reviews, FAQs and configuration](docs/EDITING.md)
- [Photo, logo and other asset specifications](docs/ASSET-CHECKLIST.md)
- [Peanut photo map and contact sheet](docs/PEANUT-PHOTO-NAMES.md)
- [Crochet product photo map and contact sheet](docs/CROCHET-PHOTO-NAMES.md)
- [Cloudflare Pages and Netlify deployment](docs/DEPLOY.md)
- [Keyboard and accessibility check record](docs/A11Y-CHECK.md)
- [Client inputs still needed](docs/CLIENT-INPUTS.md)
- [Phase reports](docs/PHASES.md) and [decisions](docs/DECISIONS.md)

Never commit `.env`, payment details, receipts, certificates or private documents. Unknown claims remain empty until the client supplies and approves them.
