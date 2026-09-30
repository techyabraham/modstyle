import { defineConfig } from 'astro/config';
const site = process.env.SITE_URL;
if (!site) console.warn('[site] SITE_URL is unset; canonical URLs are omitted.');
export default defineConfig({ output: 'static', site, trailingSlash: 'always' });
