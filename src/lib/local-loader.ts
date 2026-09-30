import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import type { Loader } from 'astro/loaders';
import type matterType from 'gray-matter';
const matter = createRequire(import.meta.url)('gray-matter') as typeof matterType;

// Loads one file per entry through Astro's current Content Loader API.
export function localLoader(collection: string, extension: '.json' | '.md'): Loader {
  return {
    name: `modstyle-${collection}`,
    async load({ config, store, parseData, renderMarkdown, watcher }) {
      const root = fileURLToPath(new URL(`src/content/${collection}/`, config.root));
      const reload = async () => {
        store.clear();
        const entries = await readdir(root, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isFile() || extname(entry.name) !== extension) continue;
          const path = join(root, entry.name);
          const source = await readFile(path, 'utf8');
          const parsed = extension === '.md' ? matter(source) : { data: JSON.parse(source), content: '' };
          const id = parsed.data.slug ?? entry.name.slice(0, -extension.length);
          const data = await parseData({ id, data: parsed.data });
          const rendered = extension === '.md' ? await renderMarkdown(parsed.content, { fileURL: new URL(`src/content/${collection}/${entry.name}`, config.root) }) : undefined;
          store.set({ id, data, rendered });
        }
      };
      await reload();
      for (const event of ['add', 'change', 'unlink'] as const) watcher?.on(event, async path => {
        if (path.startsWith(root) && extname(path) === extension) await reload();
      });
    },
  };
}
