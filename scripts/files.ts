import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
export async function files(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory() ? files(join(root, entry.name)) : [join(root, entry.name)]));
  return nested.flat();
}
