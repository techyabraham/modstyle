import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import matter from 'gray-matter';
import { site } from '../src/config/site';
import { files } from './files';
export function inspectOutput(path: string, content: string, sampleSlugs: string[] = []): string[] {
  const errors: string[] = [];
  if (/receipt|cac|certificate/i.test(path)) errors.push(`${path}: forbidden private-document filename`);
  if (/Sample content|TBD|Lorem|placeholder/i.test(content)) errors.push(`${path}: sample or unfinished text`);
  for (const slug of sampleSlugs) if (content.includes(slug)) errors.push(`${path}: sample slug ${slug}`);
  if (/\d{10}/.test(content.replaceAll(site.contact.whatsapp, ''))) errors.push(`${path}: potential bank-account number`);
  if (/elements\.abraham\.com\.ng/i.test(content)) errors.push(`${path}: forbidden third-party asset`);
  return errors;
}
export async function guardProduction(root = 'dist'): Promise<void> {
  const slugs: string[] = [];
  if (existsSync('src/content')) for (const file of await files('src/content')) {
    if (!/\.(json|md)$/.test(file)) continue;
    const raw = await readFile(file, 'utf8');
    const data = extname(file) === '.json' ? JSON.parse(raw) : matter(raw).data;
    if (data.sample === true && typeof data.slug === 'string') slugs.push(data.slug);
  }
  const errors: string[] = [];
  for (const file of await files(root)) {
    // Scan textual output for account numbers; binary assets still get filename checks.
    const content = /\.(html|css|js|json|xml|txt|svg|map|webmanifest)$/.test(file) ? await readFile(file, 'utf8') : '';
    errors.push(...inspectOutput(file, content, slugs));
  }
  if (errors.length) throw new Error(`Production guard failed:\n${errors.join('\n')}`);
  console.log('Production guard passed.');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await guardProduction();
