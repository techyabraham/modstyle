import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import matter from 'gray-matter';
import { files } from './files';
import { productSchema, faqSchema, reviewSchema, gallerySchema } from '../src/lib/schemas';
export async function checkContent(): Promise<void> {
  const collections = { products: productSchema, faqs: faqSchema, reviews: reviewSchema, gallery: gallerySchema };
  for (const [name, schema] of Object.entries(collections)) {
    const root = `src/content/${name}`;
    if (!existsSync(root)) continue;
    const seen = new Set<string>();
    for (const file of await files(root)) {
      if (!/\.(json|md)$/.test(file)) continue;
      const raw = await readFile(file, 'utf8');
      const result = schema.safeParse(file.endsWith('.md') ? matter(raw).data : JSON.parse(raw));
      if (!result.success) throw new Error(`Invalid content in ${file}:\n${result.error.message}`);
      if (seen.has(result.data.slug)) throw new Error(`Duplicate ${name} slug: ${result.data.slug} (${file})`);
      seen.add(result.data.slug);
    }
  }
}
