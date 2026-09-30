import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const css = readFileSync(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8');
const colour = (name: string): string => {
  const value = css.match(new RegExp(`--${name}: (#[0-9a-f]{6})`, 'i'))?.[1];
  if (!value) throw new Error(`Missing colour token: ${name}`);
  return value;
};
const luminance = (hex: string): number => {
  const channels = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = channels.map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
};
const contrast = (foreground: string, background: string): number => {
  const a = luminance(colour(foreground));
  const b = luminance(colour(background));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};
describe('design token contrast', () => {
  it.each([
    ['ink', 'cream'], ['forest', 'cream'], ['cream', 'forest'],
    ['cream', 'forest-deep'], ['magenta', 'cream'], ['magenta', 'magenta-soft'],
    ['orange', 'cream'], ['cream', 'orange'], ['cream', 'magenta'],
    ['forest', 'sand'], ['forest', 'orange-soft'],
  ])('%s on %s meets AA body contrast', (foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});
