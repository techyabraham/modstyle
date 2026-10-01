# Deployment

The site is a static Astro build. It does not need a server adapter, database, function runtime or payment service. Deploy the contents of `dist/` to a static host. The production build runs the sample-content and private-document guard; do not deploy the preview build.

## Before the first deployment

1. Push the reviewed repository to the Git provider you will connect to the host.
2. Run the release checks in [EDITING.md](EDITING.md), including `pnpm check` and `pnpm lhci`.
3. Collect an approved production domain. `SITE_URL` must be its origin, for example `https://shop.example`, with no path or trailing slash.
4. Keep `PUBLIC_ANALYTICS_ID` unset unless analytics is approved and the CSP note below has been applied.

The local environment is pinned to Node `24.15.0` (`.node-version`) and pnpm `11.19.0` (`package.json`). The Pages build image supports selecting these versions; do not rely on its defaults. The project is static (`output: 'static'`), so no Cloudflare or Netlify Astro adapter is needed.

## Cloudflare Pages (primary)

Cloudflare's [Astro Pages guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) and [build configuration guide](https://developers.cloudflare.com/pages/configuration/build-configuration/) describe Git-connected static builds.

1. In Cloudflare, create a Pages project and connect the Git repository.
2. Set the root/base directory to the repository root. Use these build settings:

   | Setting | Value |
   | --- | --- |
   | Build command | `pnpm build:prod` |
   | Build output directory | `dist` |
   | Node version | `24.15.0` (already in `.node-version`; set `NODE_VERSION` to this if overriding in the dashboard) |
   | pnpm version | Set the build variable `PNPM_VERSION` to `11.19.0` |

3. Add `SITE_URL` as a build environment variable, using the approved public origin. `pnpm build:prod` sets production mode itself and runs the output guard. Do not change the production build command to plain `pnpm build`.
4. Save and deploy. Cloudflare builds new commits and provides deployment previews. This command builds production-mode pages for every branch, so previews also exclude samples; use local preview mode for sample content.
5. Check the deployment URL before connecting a custom domain. Connect only the client-approved domain through Pages' Custom Domains settings. Keep `SITE_URL` equal to the approved canonical domain and redeploy after changing it.

Cloudflare Pages reads `public/_headers` from the build output. Verify the deployed response headers include the CSP, `X-Content-Type-Options`, `Referrer-Policy` and immutable caching for `/_astro/*`. Check `/`, `/crochet/`, `/peanuts/`, `/our-story/`, `/faq/`, `/contact/`, `/policies/`, `/robots.txt`, `/sitemap.xml`, `/favicon.svg`, `/site.webmanifest`, and a nonexistent route. The nonexistent route should return the branded 404 page.

## Netlify (alternative)

Netlify's [Astro guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/astro/) documents the static `dist` output; its [dependency guide](https://docs.netlify.com/build/configure-builds/manage-dependencies/) documents Node and pnpm selection.

1. Import the Git repository as a new Netlify site and use the repository root as the base directory.
2. Set the build command to `pnpm build:prod` and publish directory to `dist`.
3. Keep Node at `24.15.0` using `.node-version` (or the site's `NODE_VERSION` setting). `package.json` pins pnpm to `11.19.0`; if the build image needs an explicit pnpm selection, set the package-manager version in the site's dependency settings.
4. Add `SITE_URL` with the approved public origin. `pnpm build:prod` sets production mode and runs the output guard.
5. Deploy, verify the routes and headers listed above, then connect only the approved custom domain. Set `SITE_URL` to that canonical origin and redeploy if it changes.

Netlify supports a root `_headers` file for static deploys; verify the deployed response headers rather than assuming it was picked up. Use the deploy preview only to review the production build. The preview branch also excludes sample content because it uses `pnpm build:prod`.

## Optional analytics and CSP

Analytics stays off by default. If the client approves Plausible, set `PUBLIC_ANALYTICS_ID` to the site's Plausible domain identifier and update `public/_headers` to allow `https://plausible.io` in both `script-src` and `connect-src`. Rebuild and verify the deployed CSP before expecting analytics events. Do not add message text, contact details or enquiry contents to analytics.

## Release verification and rollback

- The GitHub workflow runs `pnpm check` and `pnpm lhci` on pushes and pull requests.
- Locally, use `pnpm build:prod` to prove the production output guard passes. Use `pnpm lhci:local` on Windows if the Lighthouse CI Chrome cleanup fails; it runs the project's three-pass mobile audit and budget assertions.
- Confirm `SITE_URL` is the approved origin, the sitemap lists production routes only, and the site has no sample or draft content.
- If verification fails after deploy, use the host's deployment history to restore the last known-good deployment and correct the build before promoting another one.

This repository does not configure DNS, create a hosting account, or publish the site. The domain owner must approve and complete those account-level steps.
