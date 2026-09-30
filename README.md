# Modstyle Crunch And Cream

Static Astro website. This checkout currently contains Phase 1 (foundation), not the complete website.

Use Node 24 LTS and pnpm 11.19.0.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm dev
pnpm check
pnpm lhci
```

On Windows, use `pnpm lhci:local` for the same mobile score and transfer budgets. The LHCI Chrome launcher cannot remove its temporary profile on this host.

`pnpm build` defaults to preview with noindex and disallow-all robots. `pnpm build:prod` explicitly builds production and runs the output guard. Copy `.env.example` to `.env` to configure an approved domain. Unknown content stays empty. Never put private documents in this repository.

Decisions: `docs/DECISIONS.md`. Phase status: `docs/PHASES.md`.
