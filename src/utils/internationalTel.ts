/**
 * Téléphone international : premier caractère « + », indicatif 1 à 4 chiffres,
 * espace, puis le reste numérique (6 à 15 chiffres).
 * Ex. +221 …, +225 …, +237 … (format international)
 */
export const INTERNATIONAL_TEL_REGEX = /^\+\d{1,4}\s\d{6,15}$/;

export const INTERNATIONAL_TEL_MESSAGE =
  'Indicatif obligatoire : +XXX puis espace puis le numéro (ex. +221 …, +225 …, +237 …).';

/** Filtre la saisie : garde « + » en tête, chiffres et un seul espace séparateur. */
export function sanitizeInternationalTelInput(raw: string): string {
  const trimmed = raw.trimStart();
  if (trimmed === '') return '';
  let s = trimmed.replace(/[^\d+ ]/g, '');
  if (!s.startsWith('+')) {
    const digits = s.replace(/\D/g, '');
    return digits.length > 0 ? `+${digits}` : '+';
  }
  const after = s.slice(1);
  const noInvalid = after.replace(/[^\d ]/g, '');
  const spaceIdx = noInvalid.indexOf(' ');
  if (spaceIdx === -1) {
    const cc = noInvalid.replace(/\D/g, '').slice(0, 4);
    return `+${cc}`;
  }
  const cc = noInvalid.slice(0, spaceIdx).replace(/\D/g, '').slice(0, 4);
  const rest = noInvalid
    .slice(spaceIdx + 1)
    .replace(/\D/g, '')
    .slice(0, 15);
  return rest.length > 0 ? `+${cc} ${rest}` : `+${cc} `;
}

/** Pour préremplir le formulaire entreprise (indicatif + numéro séparés). */
export function splitInternationalTel(
  phone: string | null | undefined
): { indicatif: string; numero: string } | null {
  const p = phone?.trim();
  if (!p || !INTERNATIONAL_TEL_REGEX.test(p)) return null;
  const [, cc, num] = p.match(/^\+(\d{1,4})\s(\d{6,15})$/) ?? [];
  if (!cc || !num) return null;
  return { indicatif: `+${cc}`, numero: num };
}
