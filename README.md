# Modstyle Crunch And Cream

Static Astro website. Phases 1–6 are implemented; Phase 7 (accessibility, performance and production hardening) has not started.

Use Node 24 LTS and pnpm 11.19.0.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm dev
pnpm check
pnpm lhci
```

On Windows, use `pnpm lhci:local` for the same mobile score and transfer budgets. The LHCI Chrome launcher cannot remove its temporary profile on this host.

`pnpm build` defaults to preview with noindex and disallow-all robots. It includes clearly labelled sample products and artwork. `pnpm build:prod` explicitly builds production and runs the output guard; sample product and gallery routes are omitted until approved entries are supplied. Copy `.env.example` to `.env` to configure an approved domain. Unknown content stays empty. Never put private documents in this repository.

Decisions: `docs/DECISIONS.md`. Phase status: `docs/PHASES.md`.
