import { parseMode } from '../lib/visibility';
export function GET() {
  const preview = parseMode(import.meta.env.PUBLIC_SITE_MODE) === 'preview';
  return new Response(`User-agent: *\n${preview ? 'Disallow: /' : 'Allow: /'}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
