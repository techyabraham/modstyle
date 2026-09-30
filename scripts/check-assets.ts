import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { files } from './files';
export async function checkAssets(): Promise<void> {
  for (const root of ['public', 'src/assets']) {
    if (!existsSync(root)) continue;
    for (const file of await files(root)) {
      if (/receipt|cac|certificate/i.test(file)) throw new Error(`Private document filename forbidden: ${file}`);
      if (/elements\.abraham\.com\.ng/i.test(await readFile(file, 'utf8'))) throw new Error(`Forbidden third-party asset reference: ${file}`);
    }
  }
}
