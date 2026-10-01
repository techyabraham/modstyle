import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { parseMode } from '../src/lib/visibility';
import { checkAssets } from './check-assets';
import { checkContent } from './check-content';
import { files } from './files';
import { guardProduction } from './guard-production';

async function pruneDraftAssets(): Promise<void> {
  const draftAssets = new Set<string>();
  const approvedAssets = new Set<string>();

  for (const collection of ['products', 'gallery'] as const) {
    const root = `src/content/${collection}`;
    if (!existsSync(root)) continue;
    for (const file of await files(root)) {
      if (!file.endsWith('.json')) continue;
      const data = JSON.parse(await readFile(file, 'utf8')) as {
        status?: string;
        sample?: boolean;
        images?: Array<{ src?: string }>;
        image?: { src?: string };
      };
      const paths = collection === 'products' ? data.images?.map(image => image.src) ?? [] : [data.image?.src];
      for (const asset of paths) {
        if (!asset?.startsWith('/')) continue;
        if (data.sample || data.status === 'draft') draftAssets.add(asset);
        else approvedAssets.add(asset);
      }
    }
  }

  const outputRoot = resolve('dist');
  for (const asset of draftAssets) {
    if (approvedAssets.has(asset)) continue;
    const outputPath = resolve(outputRoot, `.${asset}`);
    if (!outputPath.startsWith(`${outputRoot}${sep}`)) continue;
    if (existsSync(outputPath)) await rm(outputPath);
  }
}

if (existsSync('.env')) process.loadEnvFile('.env');
const mode = parseMode(process.env.PUBLIC_SITE_MODE);
await checkAssets();
await checkContent();
const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], { stdio: 'inherit', env: { ...process.env, PUBLIC_SITE_MODE: mode } });
if (result.status !== 0) process.exit(result.status ?? 1);
if (mode === 'production') {
  await pruneDraftAssets();
  await guardProduction();
}
