const PREFIX = 'enc:v1:';

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function parseAesKeyHex(): string | null {
  const raw = import.meta.env.VITE_CLIENT_PAYLOAD_AES_KEY;
  if (typeof raw !== 'string') return null;
  const lower = raw.trim().toLowerCase();
  return /^[0-9a-f]{64}$/.test(lower) ? lower : null;
}

/** Indique si le chiffrement symétrique des secrets dans le JSON est actif (même clé que `CLIENT_PAYLOAD_AES_KEY` côté API). */
export function isClientPayloadCryptoEnabled(): boolean {
  return parseAesKeyHex() !== null;
}

/**
 * Chiffrement AES-256-GCM (navigateur). Si aucune clé valide n’est définie, renvoie le texte en clair (ex. dev local).
 * Ne remplace pas HTTPS : la clé est présente dans le bundle.
 */
export async function encryptSecretForTransport(plain: string): Promise<string> {
  const keyHex = parseAesKeyHex();
  if (!keyHex) {
    return plain;
  }
  const keyRaw = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    keyRaw[i] = parseInt(keyHex.slice(i * 2, i * 2 + 2), 16);
  }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey('raw', keyRaw, 'AES-GCM', false, ['encrypt']);
  const enc = new TextEncoder().encode(plain);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc));
  const ivHex = [...iv].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${PREFIX}${ivHex}:${bytesToBase64(ct)}`;
}

type PasswordFieldKey = 'password' | 'currentPassword' | 'newPassword';

/** Chiffre les champs mot de passe non vides avant envoi à l’API. */
export async function encryptAuthPasswordFields<T extends Record<string, unknown>>(
  body: T,
  keys: PasswordFieldKey[]
): Promise<T> {
  const out: T = { ...body };
  for (const k of keys) {
    const v = out[k];
    if (typeof v === 'string' && v.length > 0) {
      (out as Record<string, unknown>)[k] = await encryptSecretForTransport(v);
    }
  }
  return out;
}
