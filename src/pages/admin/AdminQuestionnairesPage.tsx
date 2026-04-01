import type { CSSProperties } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  API_ENDPOINTS,
  CANONICAL_QUESTIONNAIRE_SLUG,
  MESSAGE_CONFIG,
  QUESTIONNAIRE_FIELD_TYPE_LABELS,
  QUESTIONNAIRE_FIELD_TYPES,
  ROUTE_PATHS,
  UI_CONFIG,
} from '@constants/variable.constant';
import type { QuestionnaireTarget } from '@constants/types.constant';
import { Alert } from '../../items/Alert';
import { Button } from '../../items/Button';
import { CenteredPage } from '../../items/CenteredPage';
import { TextPanel } from '../../items/TextPanel';
import { RequiredAsterisk } from '../../items/Input';
import { apiClient } from '../../api/client';
import { DEFAULT_ENTREPRISE_QUESTIONNAIRE_STEPS } from '../../data/defaultEntrepriseQuestionnaireSteps';
import { DEFAULT_ETUDIANT_QUESTIONNAIRE_STEPS } from '../../data/defaultEtudiantQuestionnaireSteps';
import type { QuestionnaireDefinition, QuestionnaireDto, QuestionnaireFieldDef } from '../../types/questionnaire';

function slugifyLabelSegment(label: string): string {
  const s = label
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 72);
  return s || 'champ';
}

/** Identifiant technique : segment dérivé du libellé + suffixe unique (UUID tronqué). */
function generateTechnicalFieldName(label: string): string {
  const base = slugifyLabelSegment(label.trim());
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  return `${base}_${suffix}`;
}

/** Une ligne d’édition = une étape du parcours (titre d’étape + une question). */
type QuestionnaireStepRow = {
  title: string;
  field: QuestionnaireFieldDef;
};

type FormState = {
  id: string | null;
  title: string;
  description: string;
  whatsappLink: string;
  isActive: boolean;
  steps: QuestionnaireStepRow[];
};

const TARGETS: QuestionnaireTarget[] = ['entreprise', 'etudiant'];

const defaultSteps = (target: QuestionnaireTarget): QuestionnaireStepRow[] =>
  target === 'entreprise'
    ? DEFAULT_ENTREPRISE_QUESTIONNAIRE_STEPS.map((row) => ({
        title: row.title,
        field: { ...row.field },
      }))
    : DEFAULT_ETUDIANT_QUESTIONNAIRE_STEPS.map((row) => ({
        title: row.title,
        field: { ...row.field },
      }));

function emptyForm(target: QuestionnaireTarget): FormState {
  return {
    id: null,
    title: target === 'entreprise' ? 'Formulaire entreprise' : 'Formulaire étudiant',
    description: '',
    whatsappLink: '',
    isActive: true,
    steps: defaultSteps(target),
  };
}

function pickForTarget(list: QuestionnaireDto[], target: QuestionnaireTarget): QuestionnaireDto | null {
  const slug = CANONICAL_QUESTIONNAIRE_SLUG[target];
  return (
    list.find((q) => q.slug === slug && q.targetUserType === target) ??
    list.find((q) => q.targetUserType === target) ??
    null
  );
}

/** Importe une définition existante : chaque champ devient une étape (rétrocompatibilité). */
function dtoToForm(q: QuestionnaireDto): FormState {
  const steps: QuestionnaireStepRow[] = [];
  for (const s of q.definition.steps) {
    if (s.fields.length === 0) continue;
    for (const field of s.fields) {
      const title =
        s.fields.length === 1 && s.title.trim()
          ? s.title.trim()
          : [s.title.trim(), field.label.trim()].filter(Boolean).join(' — ') ||
            field.label.trim() ||
            'Étape';
      const name =
        field.name?.trim() ||
        generateTechnicalFieldName(field.label.trim() || title || 'champ');
      steps.push({ title, field: { ...field, name } });
    }
  }
  return {
    id: q.id,
    title: q.title,
    description: q.description ?? '',
    whatsappLink: q.whatsappLink ?? '',
    isActive: q.isActive,
    steps: steps.length > 0 ? steps : defaultSteps(q.targetUserType),
  };
}

function normalizeField(q: QuestionnaireFieldDef): QuestionnaireFieldDef {
  const label = q.label.trim();
  const name =
    q.name.trim() || generateTechnicalFieldName(label || 'champ');
  const base = { ...q, name, label };
  const needsOptions =
    base.type === 'select' || base.type === 'radio' || base.type === 'checkboxes';
  if (!needsOptions) {
    const { options: _o, ...rest } = base;
    return rest;
  }
  return base;
}

function buildDefinition(target: QuestionnaireTarget, f: FormState): QuestionnaireDefinition {
  return {
    title: f.title.trim(),
    targetUserType: target,
    description: f.description.trim() || undefined,
    whatsappLink: f.whatsappLink.trim(),
    steps: f.steps.map((row) => ({
      title: row.title.trim() || row.field.label.trim() || 'Étape',
      fields: [normalizeField(row.field)],
    })),
  };
}

function validateForm(f: FormState): string | null {
  if (!f.title.trim()) return 'Le titre du formulaire est obligatoire.';
  if (f.steps.length === 0) return 'Ajoutez au moins une étape.';
  const names = new Set<string>();
  for (let i = 0; i < f.steps.length; i += 1) {
    const row = f.steps[i];
    if (!row.title.trim()) return `Étape ${i + 1} : titre d’étape obligatoire.`;
    const q = row.field;
    const nm = q.name.trim() || generateTechnicalFieldName(q.label.trim() || 'champ');
    if (!q.label.trim()) return `Étape ${i + 1} : libellé de la question obligatoire.`;
    if (names.has(nm)) return `Conflit d’identifiant technique pour l’étape ${i + 1}. Ré-enregistrez ou recréez l’étape.`;
    names.add(nm);
    if (
      (q.type === 'select' || q.type === 'radio' || q.type === 'checkboxes') &&
      (!q.options || q.options.length === 0)
    ) {
      return `Étape « ${row.title} » : ajoutez au moins une option.`;
    }
  }
  return null;
}

export function AdminQuestionnairesPage() {
  const [tab, setTab] = useState<QuestionnaireTarget>('entreprise');
  const [draft, setDraft] = useState<Record<QuestionnaireTarget, FormState>>(() => ({
    entreprise: emptyForm('entreprise'),
    etudiant: emptyForm('etudiant'),
  }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const load = useCallback(async () => {
    const { data } = await apiClient.get<{ items: QuestionnaireDto[] }>(API_ENDPOINTS.questionnaires);
    setDraft({
      entreprise: (() => {
        const q = pickForTarget(data.items, 'entreprise');
        return q ? dtoToForm(q) : emptyForm('entreprise');
      })(),
      etudiant: (() => {
        const q = pickForTarget(data.items, 'etudiant');
        return q ? dtoToForm(q) : emptyForm('etudiant');
      })(),
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch {
        if (!cancelled) setError(MESSAGE_CONFIG.errorGeneric);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const updateDraft = (target: QuestionnaireTarget, patch: Partial<FormState>) => {
    setDraft((d) => ({ ...d, [target]: { ...d[target], ...patch } }));
  };

  const updateStep = (
    target: QuestionnaireTarget,
    index: number,
    patch: { title?: string; field?: Partial<QuestionnaireFieldDef> }
  ) => {
    setDraft((d) => {
      const next = [...d[target].steps];
      const cur = next[index];
      if (!cur) return d;
      next[index] = {
        title: patch.title !== undefined ? patch.title : cur.title,
        field: patch.field ? { ...cur.field, ...patch.field } : cur.field,
      };
      return { ...d, [target]: { ...d[target], steps: next } };
    });
  };

  const addStep = (target: QuestionnaireTarget) => {
    setDraft((d) => {
      const n = d[target].steps.length + 1;
      return {
        ...d,
        [target]: {
          ...d[target],
          steps: [
            ...d[target].steps,
            {
              title: `Étape ${n}`,
              field: {
                name: generateTechnicalFieldName(`Question ${n}`),
                label: `Question ${n}`,
                type: 'text',
                required: false,
              },
            },
          ],
        },
      };
    });
  };

  const removeStep = (target: QuestionnaireTarget, index: number) => {
    setDraft((d) => ({
      ...d,
      [target]: {
        ...d[target],
        steps: d[target].steps.filter((_, i) => i !== index),
      },
    }));
  };

  const moveStep = (target: QuestionnaireTarget, index: number, dir: -1 | 1) => {
    setDraft((d) => {
      const list = [...d[target].steps];
      const j = index + dir;
      if (j < 0 || j >= list.length) return d;
      [list[index], list[j]] = [list[j], list[index]];
      return { ...d, [target]: { ...d[target], steps: list } };
    });
  };

  const save = async (target: QuestionnaireTarget) => {
    setError('');
    setInfo('');
    const f = draft[target];
    const msg = validateForm(f);
    if (msg) {
      setError(msg);
      return;
    }
    try {
      const definition = buildDefinition(target, f);
      await apiClient.post(API_ENDPOINTS.questionnaires, { definition });
      setInfo(MESSAGE_CONFIG.successSaved);
      await load();
    } catch {
      setError('Erreur serveur ou données invalides (vérifiez les champs et le lien WhatsApp).');
    }
  };

  const toggle = async (target: QuestionnaireTarget) => {
    const id = draft[target].id;
    if (!id) {
      setError('Enregistrez d’abord le formulaire pour pouvoir l’activer ou le désactiver.');
      return;
    }
    setError('');
    try {
      await apiClient.patch(API_ENDPOINTS.questionnaireToggle(id));
      await load();
    } catch {
      setError(MESSAGE_CONFIG.errorGeneric);
    }
  };

  if (loading) {
    return (
      <CenteredPage width="lg">
        <TextPanel compact>
          <p style={{ textAlign: 'center', margin: 0 }}>{MESSAGE_CONFIG.loading}</p>
        </TextPanel>
      </CenteredPage>
    );
  }

  const f = draft[tab];
  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.65rem',
    borderRadius: UI_CONFIG.radii.sm,
    border: `1px solid ${UI_CONFIG.colors.black}22`,
    fontSize: '0.95rem',
  };
  const labelStyle: CSSProperties = { display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '0.9rem' };

  return (
    <CenteredPage width="xl">
      <TextPanel>
        <p>
          <Link to={ROUTE_PATHS.adminDashboard}>← Retour admin</Link>
        </p>
        <h2 style={{ color: UI_CONFIG.colors.primary, marginTop: '0.35rem' }}>
          Formulaires (entreprise & étudiant)
        </h2>
        <p style={{ color: UI_CONFIG.colors.black, opacity: 0.75, maxWidth: '42rem' }}>
          Un seul formulaire par profil. Chaque étape du questionnaire correspond à une question (titre d’étape + champ).
          L’URL publique reste <code>/{tab}/questionnaire/{CANONICAL_QUESTIONNAIRE_SLUG[tab]}</code>.
        </p>
        <Alert show={Boolean(error)} variant="error" message={error} />
        <Alert show={Boolean(info)} variant="success" message={info} />

        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {TARGETS.map((t) => (
            <Button
              key={t}
              type="button"
              variant="segment"
              active={tab === t}
              onClick={() => setTab(t)}
              style={{ padding: '0.5rem 1rem' }}
            >
              {t === 'entreprise' ? 'Entreprise' : 'Étudiant'}
            </Button>
          ))}
        </div>

        <div style={{ marginTop: 20, paddingTop: 4 }}>
          <p style={{ marginTop: 0 }}>
            Statut :{' '}
            <strong>{f.isActive ? 'actif' : 'inactif'}</strong>
            {f.id ? ` — id ${f.id.slice(0, 8)}…` : ' — pas encore enregistré'}
          </p>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>
              Titre du formulaire
              <RequiredAsterisk />
            </label>
            <input
              style={inputStyle}
              value={f.title}
              onChange={(e) => updateDraft(tab, { title: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Description (facultatif)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
              value={f.description}
              onChange={(e) => updateDraft(tab, { description: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Lien WhatsApp (facultatif, URL complète)</label>
            <input
              style={inputStyle}
              value={f.whatsappLink}
              onChange={(e) => updateDraft(tab, { whatsappLink: e.target.value })}
              placeholder="https://chat.whatsapp.com/..."
            />
          </div>

          <h3 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Étapes (une question par écran)</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {f.steps.map((row, i) => {
              const q = row.field;
              return (
                <li
                  key={`${q.name}-${i}`}
                  style={{
                    marginBottom: 14,
                    padding: 12,
                    borderRadius: UI_CONFIG.radii.sm,
                    background: UI_CONFIG.colors.gray,
                  }}
                >
                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>
                      Titre de l’étape
                      <RequiredAsterisk />
                    </label>
                    <input
                      style={inputStyle}
                      value={row.title}
                      onChange={(e) => updateStep(tab, i, { title: e.target.value })}
                      placeholder="Ex. Votre expérience"
                    />
                  </div>
                  <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr', maxWidth: '100%' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>
                        Libellé de la question
                        <RequiredAsterisk />
                      </label>
                      <input
                        style={inputStyle}
                        value={q.label}
                        onChange={(e) => updateStep(tab, i, { field: { label: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>
                        Type
                        <RequiredAsterisk />
                      </label>
                      <select
                        style={inputStyle}
                        value={q.type}
                        onChange={(e) => {
                          const next = e.target.value as QuestionnaireFieldDef['type'];
                          const withOptions =
                            next === 'select' || next === 'radio' || next === 'checkboxes';
                          updateStep(tab, i, {
                            field: {
                              type: next,
                              options: withOptions ? (q.options?.length ? q.options : ['Option A', 'Option B']) : undefined,
                            },
                          });
                        }}
                      >
                        {QUESTIONNAIRE_FIELD_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {QUESTIONNAIRE_FIELD_TYPE_LABELS[t]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 22 }}>
                      <input
                        type="checkbox"
                        checked={Boolean(q.required)}
                        onChange={(e) => updateStep(tab, i, { field: { required: e.target.checked } })}
                      />
                      Obligatoire
                    </label>
                  </div>
                  {q.type === 'select' || q.type === 'radio' || q.type === 'checkboxes' ? (
                    <div style={{ marginTop: 10 }}>
                      <label style={labelStyle}>
                        Options (une par ligne)
                        <RequiredAsterisk />
                      </label>
                      <textarea
                        style={{ ...inputStyle, minHeight: 80, fontFamily: 'inherit' }}
                        value={(q.options ?? []).join('\n')}
                        onChange={(e) =>
                          updateStep(tab, i, {
                            field: {
                              options: e.target.value
                                .split('\n')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            },
                          })
                        }
                      />
                    </div>
                  ) : null}
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={i === 0}
                      onClick={() => moveStep(tab, i, -1)}
                    >
                      Monter
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={i === f.steps.length - 1}
                      onClick={() => moveStep(tab, i, 1)}
                    >
                      Descendre
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeStep(tab, i)}>
                      Supprimer
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
          <Button
            type="button"
            variant="dashed"
            onClick={() => addStep(tab)}
            style={{ marginTop: 8, padding: '0.45rem 0.9rem', borderRadius: UI_CONFIG.radii.sm }}
          >
            + Ajouter une étape
          </Button>

          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <Button type="button" variant="primary" onClick={() => void save(tab)} style={{ padding: '0.65rem 1.2rem' }}>
              Enregistrer ce formulaire
            </Button>
            <Button
              type="button"
              variant="outlineSecondary"
              onClick={() => void toggle(tab)}
              style={{ padding: '0.65rem 1.2rem' }}
            >
              Activer / désactiver
            </Button>
          </div>
        </div>
      </TextPanel>
    </CenteredPage>
  );
}
