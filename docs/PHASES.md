# Phase reports

Phases 1–5 are complete. Per the brief, work stops after each phase report. Phase 6 has not started.

## Phase 5 progress

Built: a versioned browser-local enquiry basket (`mcc-basket-v1`) with corrupt-storage validation and in-memory fallback; option-aware product merging; quantity controls from 1–999; per-department fixed-price subtotals and configurable minimum progress; quote/from-price items excluded from fixed totals; and delivery shown separately. The basket collects optional name, delivery area and notes, then builds an encoded WhatsApp message with a URL-length cap and visible note truncation. No-JavaScript WhatsApp links remain available in the header and product/enquiry flows.

Added custom crochet and peanut bulk enquiry forms with validation, visible generated-message previews, safe length handling, and clipboard copy with a manual-copy fallback. The forms ask for customer preferences without inventing peanut varieties, pack sizes or food facts. Cookieless Plausible analytics loads only when `PUBLIC_ANALYTICS_ID` is configured. `whatsapp_click`, `basket_add`, `basket_open` and `enquiry_copy` events contain only department/product identifiers; message text is never sent to analytics.

Verified: `pnpm check` passed: 44 Astro files with zero diagnostics, lint, 35 unit tests, production build and output guard, 15 production browser checks, and 6 axe accessibility scans across mobile/tablet/desktop. `pnpm build` plus `pnpm test:preview` passed all 18 preview checks across mobile/tablet/desktop, including basket persistence, quote/minimum handling, WhatsApp URL generation, form validation/message previews, long-message handling and accessibility. `PUBLIC_ANALYTICS_ID` is unset in this environment, so no analytics request is made during these checks.

Still needed: Phase 6 supporting routes and SEO/structured data; approved product and business content, photos and domain; and a configured analytics ID if event collection is desired. The Phase 3 Lighthouse performance result remains open for Phase 7.

## Phase 4 progress

Built: `/crochet/` with category, intended wearer (only when populated) and price-type filters; `/peanuts/` with a bulk quote path; sample product detail routes with options/confirmed details and a keyboard-operable image lightbox; a masonry `/gallery/` with department filters and its own lightbox. Seeded eight crochet and three peanut preview samples. Exactly one sample listing, `sample-crochet-featured`, carries ₦40,000. Filters update the URL, and filter state can be restored with browser navigation. Product detail galleries render configured image arrays when approved photos are supplied.

Content safety: every seeded item is marked sample and excluded from production. Peanut variety, pack size and food-safety fields stay blank because they were not supplied. Preview art is original SVG illustration labelled as sample content; there are no real approved product photos yet. Production therefore emits the homepage, crochet enquiry/catalogue shell and peanuts bulk enquiry shell only; product detail and gallery routes are omitted until approved non-sample entries exist. The output guard found a generated asset-name false positive during validation; the illustration component now uses a neutral filename, and the guard remains unchanged.

Verified: `pnpm typecheck`, `pnpm lint`, and `pnpm test` passed (27 unit tests); `pnpm build:prod` passed the production guard; `pnpm test:e2e` passed 15 production browser checks across mobile/tablet/desktop; `pnpm test:a11y` passed all 3 axe checks; `pnpm build` plus `pnpm test:preview` passed all 12 preview checks across mobile/tablet/desktop, including filters, route visibility, lightbox keyboard close and focus restoration. Preview catalogue screenshots are in `test-results/catalogue-{mobile,tablet,desktop}.png`.

Still needed for populated product/photo pages: approved product names and identities, real photographs, prices and options; confirmed peanut variety/pack size and any ingredients/allergen/storage/shelf-life details; brand/domain approvals and pricing-minimum confirmation. The current full-page Lighthouse baseline remains below the target recorded in Phase 3; performance hardening remains scheduled for Phase 7.

## Phase 3 progress

Built the `/` homepage with a split hero, department panels, marquee ribbon, four ordering steps, confirmed minimum/delivery/payment details, four ground-truth FAQs, and a final WhatsApp CTA. Founder and reviews remain absent because approved content has not been supplied; there are no published products to feature. Illustrations are labelled sample content in preview.

Verified: `pnpm check` passed (27 unit tests, 12 production browser tests, 3 axe tests, production build and guard). `pnpm test:preview` passed all 6 homepage/styleguide runs across mobile, tablet and desktop, with no serious/critical axe violations or horizontal overflow. Full-page homepage screenshots are in `test-results/homepage-{mobile,tablet,desktop}.png`. Production emits only `/` and `/robots.txt`.

The latest three-run mobile Lighthouse audit does not meet the final performance budget: median Performance 68, Accessibility 100, Best Practices 100, SEO 100; LCP 2,732 ms, CLS 0, TBT 1,835 ms. The local four-times CPU slowdown shows substantial style/layout work on the complete page. Phase 7 is the planned performance-hardening phase; this result is recorded as open work and the page is not represented as meeting the final performance target.

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
