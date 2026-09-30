import type { Pricing } from '../config/pricing';
export const formatNaira = (amount: number): string => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
export function priceLabel(price: Pricing): string {
  switch (price.type) {
    case 'fixed': return formatNaira(price.amountNaira);
    case 'from': return `From ${formatNaira(price.amountNaira)}`;
    case 'quote': return 'Request a quote';
    default: { const exhaustive: never = price; throw new Error(`Unknown pricing: ${String(exhaustive)}`); }
  }
}
