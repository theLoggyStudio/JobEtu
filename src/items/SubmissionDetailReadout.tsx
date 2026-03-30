import { UI_CONFIG } from '@constants/variable.constant';

const SNAPSHOT_KEY_LABELS: Record<string, string> = {
  email: 'E-mail',
  displayName: 'Nom affiché',
};

function humanizeFieldName(name: string): string {
  const spaced = name.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
  const t = spaced.trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : name;
}

const dlRowStyle = {
  display: 'grid' as const,
  gridTemplateColumns: 'minmax(0, 10rem) 1fr',
  gap: '0.25rem 0.85rem',
  marginBottom: 8,
  fontSize: '0.9rem',
};

/** Profil enregistré avec la soumission (objet libre côté API). */
export function ProfileSnapshotReadout({ snapshot }: { snapshot: Record<string, unknown> | null }) {
  if (!snapshot || typeof snapshot !== 'object') return null;
  const entries = Object.entries(snapshot).filter(
    ([, v]) => v != null && String(v).length > 0
  );
  if (!entries.length) return null;
  return (
    <section style={{ marginTop: '0.75rem' }}>
      <h4
        style={{
          margin: '0 0 0.5rem',
          fontSize: '0.95rem',
          fontWeight: 700,
          color: UI_CONFIG.colors.primary,
        }}
      >
        Profil (instantané)
      </h4>
      <dl style={{ margin: 0 }}>
        {entries.map(([k, v]) => (
          <div key={k} style={dlRowStyle}>
            <dt style={{ fontWeight: 600, margin: 0, color: `${UI_CONFIG.colors.black}bb` }}>
              {SNAPSHOT_KEY_LABELS[k] ?? humanizeFieldName(k)}
            </dt>
            <dd style={{ margin: 0, wordBreak: 'break-word' }}>{String(v)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

type AnswerRow = { fieldName: string; value: string };

/** Réponses au questionnaire : libellés lisibles, pas de JSON. */
export function AnswersReadout({
  answers,
  maxItems,
}: {
  answers: AnswerRow[];
  maxItems?: number;
}) {
  const list = maxItems != null ? answers.slice(0, maxItems) : answers;
  const hiddenCount =
    maxItems != null && answers.length > maxItems ? answers.length - maxItems : 0;

  if (!list.length) {
    return (
      <p style={{ margin: '0.75rem 0 0', fontSize: '0.9rem', color: `${UI_CONFIG.colors.black}88` }}>
        Aucune réponse enregistrée.
      </p>
    );
  }

  return (
    <section style={{ marginTop: '1rem' }}>
      <h4
        style={{
          margin: '0 0 0.5rem',
          fontSize: '0.95rem',
          fontWeight: 700,
          color: UI_CONFIG.colors.primary,
        }}
      >
        Réponses au questionnaire
      </h4>
      <dl style={{ margin: 0 }}>
        {list.map((a) => (
          <div key={a.fieldName} style={dlRowStyle}>
            <dt style={{ fontWeight: 600, margin: 0, color: `${UI_CONFIG.colors.black}bb` }}>
              {humanizeFieldName(a.fieldName)}
            </dt>
            <dd style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{a.value}</dd>
          </div>
        ))}
      </dl>
      {hiddenCount > 0 ? (
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: `${UI_CONFIG.colors.black}99` }}>
          … et {hiddenCount} autre{hiddenCount > 1 ? 's' : ''} réponse{hiddenCount > 1 ? 's' : ''} (aperçu
          limité)
        </p>
      ) : null}
    </section>
  );
}
