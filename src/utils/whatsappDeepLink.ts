/**
 * Ajoute le paramètre `text` pour préremplir le message WhatsApp (wa.me, api.whatsapp.com, etc.).
 * Si l’URL contient déjà des paramètres, utilise `&text=`.
 */
export function whatsappUrlWithPrefill(baseUrl: string, message: string): string {
  const u = baseUrl.trim();
  const m = message.trim();
  if (!u) return u;
  if (!m) return u;
  const encoded = encodeURIComponent(m);
  const hasQuery = u.includes('?');
  const sep = hasQuery ? '&' : '?';
  return `${u}${sep}text=${encoded}`;
}
