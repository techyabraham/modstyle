export type SiteMode = 'preview' | 'production';
export function parseMode(value?: string): SiteMode {
  if (!value) return 'preview';
  if (value !== 'preview' && value !== 'production') throw new Error('PUBLIC_SITE_MODE must be preview or production');
  return value;
}
export interface VisibilityEntry {
  sample?: boolean;
  status?: 'draft' | 'published';
  approved?: boolean;
  required?: unknown[];
}
export function isPublishable(entry: VisibilityEntry | null | undefined, mode: SiteMode): boolean {
  if (!entry || entry.approved === false) return false;
  if (entry.required?.some(value => value == null || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && !value.length))) return false;
  return mode === 'preview' || (!entry.sample && entry.status !== 'draft');
}
