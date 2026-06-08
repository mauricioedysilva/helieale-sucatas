// Sessão simples baseada em cookie assinado (HMAC-SHA256), sem dependências externas.
// Funciona tanto em rotas de API (Node.js) quanto no middleware (Edge runtime),
// pois usa apenas a Web Crypto API (`crypto.subtle`), disponível nos dois ambientes.

const encoder = new TextEncoder();

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/** Cria um token de sessão assinado no formato `userId.expiresAt.assinatura`. */
export async function createSessionToken(
  userId: string,
  secret: string,
  maxAgeSeconds: number
): Promise<string> {
  const expiresAt = Date.now() + maxAgeSeconds * 1000;
  const payload = `${userId}.${expiresAt}`;
  const key = await getKey(secret);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${toBase64Url(signatureBuffer)}`;
}

/** Verifica um token de sessão. Retorna o `userId` se válido, ou `null` caso contrário. */
export async function verifySessionToken(
  token: string,
  secret: string
): Promise<{ userId: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [userId, expiresAtRaw, signatureRaw] = parts;
  const expiresAt = Number(expiresAtRaw);
  if (!userId || !Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

  try {
    const key = await getKey(secret);
    const signature = fromBase64Url(signatureRaw);
    const payload = encoder.encode(`${userId}.${expiresAtRaw}`);
    const valid = await crypto.subtle.verify("HMAC", key, signature, payload);
    return valid ? { userId } : null;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dias
