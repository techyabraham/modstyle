# Editing the site

This is a static Astro site. Edit the files in `src/config/` and `src/content/`, then run the checks before publishing. Unknown information stays empty in production. Do not add real customer, product, food-safety or business-registration claims until they have been supplied and approved.

## Add a product

Create `src/content/products/<unique-kebab-case-slug>.json`. Start from the schema in `src/lib/schemas.ts`; every key is validated at build time. A crochet entry has `category`, and may have `intendedWearer`, `sizes`, `colours`, `materials` and `care`. A peanuts entry may have `variety`, `packSize`, `ingredients`, `allergens`, `storage` and `shelfLife`. Leave unknown values `null` or empty. Never infer food facts.

Use this shape, replacing every example value with approved information:

```json
{
  "slug": "approved-product-slug",
  "status": "draft",
  "sample": false,
  "department": "crochet",
  "category": "approved category",
  "name": "Approved product name",
  "summary": "A short, approved description.",
  "description": "The approved product description.",
  "pricing": { "type": "quote" },
  "images": [
    {
      "src": "/images/products/crochet-approved-product-slug-01.jpg",
      "alt": "Specific, accurate description of the item in the photo"
    }
  ],
  "leadTime": null,
  "intendedWearer": null,
  "sizes": [],
  "colours": [],
  "materials": null,
  "care": null
}
```

Use the matching department-specific fields from the schema; do not copy crochet-only fields into a peanuts entry. Save the image under `public/images/products/`; `src` is its site-root path beginning with `/`. Product cards, detail pages, and gallery entries use this path and alt text. Set `status` to `published` and keep `sample` false only when the item and all displayed details are ready for production. A draft or sample item cannot enter the production catalogue. Duplicate or non-kebab-case slugs and invalid fields fail the build.

Choose exactly one price type:

- `{ "type": "fixed", "amountNaira": 25000 }` for a confirmed single price.
- `{ "type": "from", "amountNaira": 25000 }` only when the displayed starting price is confirmed.
- `{ "type": "quote" }` for custom or bulk enquiries with no confirmed price.

Amounts are whole naira. A quote never contributes a numeric basket total. Do not treat sample amounts as real prices.

## Assign an approved ₦40,000 price

No current listing uses ₦40,000. The schema rejects that amount while `featuredPriceProductSlug` in `src/config/pricing.ts` is unset. Set it to the exact slug of an approved listing before assigning that amount; the content check rejects it on every other product.

## Replace the logo

Put the approved, web-ready SVG at `public/images/brand/logo.svg` and set `brand.logo` in `src/config/site.ts` to `'/images/brand/logo.svg'`. The wordmark keeps a fixed-height slot (208 × 56 CSS-pixel intrinsic box); supply a horizontal lockup that remains legible inside it. Keep the text/SVG wordmark by leaving the field `null` until the replacement is approved. See [ASSET-CHECKLIST.md](ASSET-CHECKLIST.md) for the PNG companion and file requirements.

## Add founder and contact details

Enter an approved founder name, title and story in `site.founder` and the approved story in `site.brandStory` in `src/config/site.ts`. Reference an approved portrait with a public path such as `'/images/brand/founder-portrait.jpg'`. Production stays brand-only while story details are empty.

WhatsApp is already configured for enquiry links. To show a phone number separately, set `contact.phoneApproved` true only after display approval. Email stays hidden until `contact.emailApproved` is true. Set `instagram.verified` true only after confirming the handle belongs to this business. Enter only approved hours, address or response expectations; the default location remains Lagos, Nigeria.

## Enter CAC or NAFDAC identifiers

Only enter identifiers supplied and approved for public display in `site.compliance` in `src/config/site.ts`: `cacRcNumber`, `registeredName` and `nafdacNumber`. Supplied values appear as text chips on `/peanuts/`; empty values produce no chips. Never add certificate scans, receipts, bank account details or private registration documents anywhere in the repository.

## Add a review

Create a unique JSON file under `src/content/reviews/` using this schema:

```json
{
  "slug": "approved-review-slug",
  "status": "published",
  "sample": false,
  "approved": true,
  "name": "Approved display name or initials",
  "text": "The customer's approved words, reproduced accurately.",
  "product": null,
  "photo": null
}
```

Set `approved` true only after the customer has agreed to publication of the text and the chosen name/initials. If adding a photo, include both `src` and an accurate `alt`. Without an approved review the production review route and homepage review section stay absent; preview-only sample review content is never published.

## Publish an FAQ

Add a Markdown file in `src/content/faqs/`. Copy the frontmatter fields and group values from an existing file, use a unique kebab-case `slug`, set `status: published` and `sample: false`, and put the approved question and answer in frontmatter. Allowed groups are `Ordering`, `Minimums and pricing`, `Payment`, `Delivery`, `Custom crochet` and `Peanuts and bulk`. Choose an `order` number within its group. Do not publish an answer that adds a new delivery, ingredient, allergen, payment or policy claim without confirmation.

## Preview and production builds

Local `pnpm dev` runs preview mode by default. The product catalogues, gallery and reviews contain no sample listing cards; the preview-only styleguide and labelled notes for unconfirmed business information remain. Preview also uses `noindex,nofollow` and disallows crawling. `pnpm build` creates the preview output in `dist/`; `pnpm test:preview` exercises the published catalogue and responsive menu interactions.

`pnpm build:prod` forces production mode, creates `dist/`, and automatically runs the output guard. Set `SITE_URL` to the approved canonical origin for canonical tags, social URLs, sitemap and `robots.txt`. PowerShell example:

```powershell
$env:SITE_URL = 'https://your-approved-domain.example'
pnpm build:prod
pnpm check
pnpm lhci
Remove-Item Env:SITE_URL
```

Replace the example origin; do not publish it. A missing `SITE_URL` omits canonical and absolute sitemap URLs. `pnpm check` includes type checking, lint, unit tests, a guarded production build, production browser checks and axe checks. Run it before deployment.

Use the Cloudflare Pages or Netlify settings in [DEPLOY.md](DEPLOY.md). Never put credentials in `src/config/`, content files, or the repository; `.env` is ignored by Git. `PUBLIC_ANALYTICS_ID` is a public analytics site identifier, not a secret. Analytics is off when it is unset; see the deployment guide's CSP note before enabling it.
