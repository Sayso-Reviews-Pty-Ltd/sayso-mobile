export function getInboxUrl(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';

  if (domain.includes('gmail')) return 'https://mail.google.com';
  if (
    domain.includes('outlook') ||
    domain.includes('hotmail') ||
    domain.includes('live')
  ) {
    return 'https://outlook.live.com/mail';
  }
  if (domain.includes('yahoo')) return 'https://mail.yahoo.com';
  if (domain.includes('icloud') || domain.includes('me.com')) {
    return 'https://www.icloud.com/mail';
  }
  if (domain) return `https://${domain}`;

  return 'https://mail.google.com';
}
