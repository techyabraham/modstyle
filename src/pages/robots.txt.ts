import { parseMode } from '../lib/visibility';
export function GET() {
  const preview = parseMode(import.meta.env.PUBLIC_SITE_MODE) === 'preview';
  const siteUrl = import.meta.env.SITE;
  return new Response(`User-agent: *\n${preview ? 'Disallow: /' : 'Allow: /'}\n${!preview && siteUrl ? `Sitemap: ${new URL('/sitemap.xml', siteUrl).href}\n` : ''}`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
