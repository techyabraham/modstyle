# Decisions

## Phase 6 — supporting pages and SEO (2026-09-30)
- Publish a brand-only story page until founder name, role, portrait and biography are approved. Keep the reviews route and homepage review section absent in production until approved reviews exist; use only an explicitly labeled preview layout note and never add sample or inferred quotations or ratings.
- Use only confirmed business facts for the public FAQ and ordering policy page. Show unconfirmed lead-time, refund and cancellation policy fields only as an explicit preview note; do not invent terms.
- Keep phone, email and Instagram display approval-gated. The contact CTA uses the already-approved WhatsApp enquiry path.
- Generate sitemap URLs only for production pages and currently publishable products/gallery/reviews. Do not include preview, sample, draft or 404 routes. Leave the sitemap URL list empty until `SITE_URL` is configured, rather than inventing a domain.
- Include only confirmed LocalBusiness fields in JSON-LD. Include Product offers only for published fixed-price non-sample products; include FAQPage markup from published FAQs; never emit rating/review markup without approved source content.
- Use a hand-authored SVG favicon and branded share-card source, then rasterize a 1200×630 PNG with the local project browser. No product photography or unapproved logo is implied by the illustration.

## Phase 5 — enquiry (2026-09-30)
- Keep basket contents in versioned browser localStorage with an in-memory fallback. Do not submit customer details or basket data to a site server; WhatsApp is the enquiry destination.
- Treat the configured per-department minimum as advisory progress, calculated from fixed-price items only and excluding delivery. `from` and `quote` items stay out of fixed subtotals and are flagged for confirmation in WhatsApp.
- Preserve direct WhatsApp links without JavaScript. Cap generated message URLs at 1,800 characters and visibly shorten long free-text notes so the customer can finish the enquiry in chat.
- Ask for customer preferences in custom crochet and peanut bulk forms without implying unconfirmed stock options or food/product facts.
- Load cookieless Plausible only when `PUBLIC_ANALYTICS_ID` is set. Track action names and department/product identifiers only; never include enquiry or message content.
- Keep copy available when opening WhatsApp is impractical, with a manual selection fallback when clipboard permission is unavailable.

## Phase 4 — catalogue (2026-09-30)
- Keep sample catalogue entries visible only in preview and visibly label their illustrations; exclude sample content from production output. Seed eight crochet listings and three peanut bulk-enquiry examples for layout and filter review.
- Allow the sample ₦40,000 amount on exactly `sample-crochet-featured`; it remains a sample and cannot appear in production. Do not assign it to an actual product until the client confirms the product identity.
- Do not infer peanut variety, pack size, ingredients, allergens, storage or shelf life. Offer a direct WhatsApp bulk quote path while those values remain unconfirmed.
- Render product image arrays and gallery entries when approved photo files and alt descriptions are supplied. Current preview visuals are original sample SVGs, not product photographs. Production gallery and sample product-detail paths disappear until there are approved published entries.
- Keep product enquiries direct to WhatsApp; basket, enquiry form and analytics belong to Phase 5.

## Phase 3 — homepage (2026-09-30)
- Use the editable `site.brand.headline` candidate “Stitched with love. Packed with crunch.” for the hero. Brand voice and design remain pending client approval.
- Keep the home page as a direct WhatsApp journey, with separate crochet and peanut enquiries and a general enquiry CTA. Do not publish contact details that lack approval.
- Use only confirmed facts for the four homepage FAQs: per-department minimum, delivery range and confirmation, bank transfer, and custom crochet quotes. The minimum remains described as an items subtotal excluding delivery, a configurable assumption still awaiting confirmation.
- Omit featured products, founder and review sections when there are no publishable entries. Preview artwork remains visibly labelled sample content; production output contains none.
- The complete homepage exceeds the final local Lighthouse performance budget on the four-times CPU slowdown profile. Record the current median in `docs/PHASES.md`; tune in Phase 7 before claiming the final budget is met.

## Phase 2 — design system (2026-09-30)
- Use a warm cream, forest and clay light theme with Fraunces headings and Inter body text. Dark mode is deferred because no dark palette was approved or required in the brief.
- Self-host OFL-licensed fonts. Fraunces is split into Latin/₦ and Latin Extended WOFF2 subsets to keep the critical heading font small. Inter remains one subset. Preserve the variable axes needed by the design. Both families pass real-browser glyph coverage for `₦40,000`.
- Preload only the critical Fraunces subset. The Latin Extended file loads when those characters appear. This reduced the production-shell three-run mobile Lighthouse LCP median from 2,717 ms to 2,277 ms.
- Use an original inline SVG yarn/peanut mark as a provisional wordmark, and original SVG shapes as clearly labelled sample art. These are design placeholders awaiting client assets and approval, not claims about products.
- Keep `/_styleguide/` in preview builds only. Production route generation excludes it, and the production guard verifies the output. The styleguide is a review surface for palette, type, components and sample art.
- Mobile, tablet and desktop styleguide screenshots were visually reviewed. Chrome browser tests cover overflow and axe serious/critical violations. These results do not establish approval of the art direction; that remains a client input.

## Phase 1 — foundation (2026-09-30)
- The brief explicitly says to stop and report after each phase. This delivery completes the foundation only; later phases remain scheduled, not represented as complete.
- npm confirmed Astro 7.3.5 as the current stable release. Node 24 LTS and the available pnpm 11.19.0 are pinned. Official APIs checked: https://docs.astro.build/en/guides/content-collections/ and https://docs.astro.build/en/reference/configuration-reference/.
- Empty workspace: created a static Astro project without a UI framework. The initial `/` is a verification shell, not the final art direction.
- Unknown facts are null or empty. The visibility gate rejects empty required content in both modes; future preview components must supply explicitly labelled sample data to demonstrate absent fields.
- Phone and email display approvals default false; Instagram verification defaults false. The WhatsApp number necessarily remains discoverable in wa.me links, as authorised by the brief.
- Minimum order applies independently to each department's items subtotal, excluding delivery. Kept configurable in `src/config/pricing.ts`.
- The production featured-price slug is null. Only `sample-crochet-featured` may carry the sample ₦40,000 price. No sample products are seeded until the catalogue phase.
- Preview is the default; robots disallows crawling. Production is explicit and its guard automatically runs after every project production build. Invalid modes fail closed.
- Collection schema validation rejects incomplete required fields rather than silently accepting malformed files; optional unknown fields remain null. This follows the brief's readable schema-failure requirement. The visibility gate additionally protects render-time required fields.
- Duplicate slugs are checked before Astro loads content so loader overwrites cannot hide duplicates.
- Private-document filename checks cover all output assets; content checks cover text formats. Arbitrary binary files cannot be reliably checked for visually embedded bank details and must be reviewed before inclusion.
- No SITE_URL is invented: build warning, no canonical until configured.
- Lighthouse total blocking time is a laboratory responsiveness proxy, not a measured INP. Real INP requires interaction/field data; do not claim a field INP result from Lighthouse.
- System font and minimal cream/forest styling are temporary foundation choices. Fraunces/Inter and glyph validation belong to Phase 2. Brand voice and design remain pending client approval.
- No analytics script runs in this phase. CSP currently permits only local assets; optional analytics needs a deliberate provider-specific CSP addition in Phase 5.
- No prohibited third-party images or private documents have been downloaded.
- Astro's checker explicitly rejected TypeScript 7.0.2. TypeScript 6.0.3 is used for supported strict checking; no experimental checker was introduced.
- pnpm permits only esbuild's required dependency build script. Windows Playwright runs use installed Chrome; Linux CI uses Playwright Chromium. These test the Chromium engine, not Safari or Firefox.
- On a later preview build, Astro 7.3.5/Vite 8.3.1 tried to evaluate the nested CommonJS `picomatch` module without Node's `require`. Astro's documented custom Content Loader API now reads the same per-file JSON and Markdown collections directly. `gray-matter` is loaded through Node's `createRequire`; Astro content sync, strict typecheck and lint pass with this loader. The failing built-in-loader path is described in https://github.com/cloudflare/workers-sdk/issues/14891 . This workaround should be removed once the upstream module handling is fixed.
- A fresh `pnpm check` passed after the loader change. The local Windows sandbox denied esbuild child creation; the approved execution run resolved that verification blocker.
- LHCI's Chrome launcher fails during Windows temporary-profile cleanup with `EPERM` after generating an audit. `pnpm lhci:local` uses Lighthouse's programmatic API with a manually launched headless Chrome and checks the same score, metric and transfer budgets. Three local mobile runs completed. `pnpm lhci` remains the CI command on Linux. This is a local tooling limitation, not a site audit failure.
