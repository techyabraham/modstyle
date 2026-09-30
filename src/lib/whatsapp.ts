export function buildWhatsAppLink(intlNumber: string, message: string): string {
  if (!/^[1-9]\d{7,14}$/.test(intlNumber)) throw new Error('WhatsApp number must contain international digits only');
  const url = new URL(`https://wa.me/${intlNumber}`);
  url.searchParams.set('text', message);
  return url.toString();
}
