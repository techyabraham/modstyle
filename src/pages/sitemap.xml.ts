import { getCollection } from 'astro:content';
import { visibleGallery, visibleProducts, visibleReviews } from '../lib/catalogue';
import { parseMode } from '../lib/visibility';

const xmlEscape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

export async function GET() {
  const mode = parseMode(import.meta.env.PUBLIC_SITE_MODE);
  const siteUrl = import.meta.env.SITE;
  const routes: string[] = [];
  if (mode === 'production' && siteUrl) {
    routes.push('/', '/crochet/', '/peanuts/', '/our-story/', '/faq/', '/contact/', '/policies/');
    if (visibleGallery(await getCollection('gallery'), mode).length) routes.push('/gallery/');
    if (visibleReviews(await getCollection('reviews'), mode).length) routes.push('/reviews/');
    routes.push(...visibleProducts(await getCollection('products'), mode).map(({ data }) => `/products/${data.slug}/`));
  }
  const urls = [...new Set(routes)].map(path => `  <url><loc>${xmlEscape(new URL(path, siteUrl || 'https://invalid.example').href)}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls ? `\n${urls}\n` : ''}</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
