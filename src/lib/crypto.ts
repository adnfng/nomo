const encoder = new TextEncoder();

export async function sign(secret: string, message: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return Buffer.from(await crypto.subtle.sign('HMAC', key, encoder.encode(message))).toString('base64url');
}

export function sameText(a: string, b: string) {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  let difference = left.length ^ right.length;
  for (let index = 0; index < Math.max(left.length, right.length); index++) difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  return difference === 0;
}

export async function seal(secret: string, value: object) {
  const body = Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${body}.${await sign(secret, body)}`;
}

export async function unseal<T>(secret: string, token: string | null | undefined): Promise<T | null> {
  const [body, signature] = token?.split('.') ?? [];
  if (!body || !signature || !sameText(signature, await sign(secret, body))) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString()) as T;
  } catch {
    return null;
  }
}
