# Phase reports

Phases 1 and 2 are complete. Per the brief, work stops after each phase report. Phase 3 has not started.

## Phase 2 progress

Built: design tokens and responsive type scale, self-hosted Fraunces and Inter with Latin Extended and ₦ support, wordmark placeholder, accessible buttons/cards/stickers/dividers, original SVG sample art, and a preview-only `/_styleguide/` route. The final homepage composition and actual catalogue content belong to later phases.

Verified: `pnpm check` passed (34 Astro/TypeScript files with zero diagnostics, lint, 27 unit tests, production build and guard, 12 production browser tests, 3 axe tests). `pnpm test:preview` passed at mobile, tablet and desktop widths, including accessibility and overflow checks. Browser font inspection confirms both custom fonts render every glyph of `₦40,000` without fallback. Production output still contains only `/` and `/robots.txt`.

Three-run local mobile Lighthouse median on the production shell: Performance 97, Accessibility 100, Best Practices 100, SEO 100; LCP 2,277 ms, CLS 0.00005, TBT 0; transfer 293,840 bytes. One individual Best Practices run scored 96; the median met the budget. This remains a shell benchmark, to be remeasured as real content and interactions arrive.

Still pending: client logo and imagery, brand/design approval, verified content and business details, full homepage and inner-page compositions.

## Phase 1 progress

Built: Astro 7 project, strict TypeScript, content schemas, central visibility gate, preview/production switch, production output guard, minimum order/contact configuration, CI scripts and a confirmed-facts shell at `/`.

Verified after the loader workaround: `pnpm check` passed (typecheck, lint, 16 unit tests, production build and guard, 9 browser journeys at three widths, 3 axe runs with zero serious/critical issues). The production build emitted only `/` and `/robots.txt`.

Preview build emits `noindex,nofollow` and disallow-all robots. Local three-run mobile Lighthouse median: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 757 ms, CLS 0, TBT 80.5 ms; transfer 2,065 bytes. This is the small foundation shell and must be remeasured after visual and interactive phases. `pnpm lhci` is retained for Linux CI; its Chrome cleanup fails on this Windows host, so `pnpm lhci:local` is the local budget check.

Still empty by design: product, FAQ, review and gallery collections; logo, product imagery, founder, approvals, business domain. Phase 2 will add the final design system, self-hosted fonts and price glyph test.

1. Foundation: configuration, schemas, visibility, build guards, CI and shell.
2. Design system: fonts/glyphs, tokens, components, original artwork, preview styleguide.
3. Homepage: final composition and three-width screenshots.
4. Catalogue: department/product pages, samples, filters, gallery and lightbox.
5. Enquiry: basket, progress, forms, truncation and analytics.
6. Supporting pages: content routes, SEO and structured data.
7. Hardening: complete-route accessibility and performance verification.
8. Handover: final editing, asset and deployment documentation.
