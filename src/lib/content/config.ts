export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isNomoAvatar(value: string) {
  return value === '/nomo.svg' || value === '/nomo.png';
}

export function safeAvatar(value: unknown): string | undefined {
  if (typeof value !== 'string') return;
  return isNomoAvatar(value) || /^(\/assets\/|https?:\/\/)/i.test(value) ? value : undefined;
}

export function legacyAvatar(metadata: Record<string, unknown>) {
  const nomo = isRecord(metadata.nomo) ? metadata.nomo : undefined;
  return safeAvatar(nomo?.avatar) ?? safeAvatar(metadata.avatar);
}
