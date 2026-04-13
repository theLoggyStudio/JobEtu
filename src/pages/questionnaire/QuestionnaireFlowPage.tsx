import { useEffect, useMemo, useState } from 'react';
import type {
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetError,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  API_ENDPOINTS,
  MESSAGE_CONFIG,
  ONEJOB_EXTERNAL_LINKS,
  ONEJOB_WHATSAPP_PREFILL,
  QUESTIONNAIRE_UI_CONFIG,
  ROLE_CONFIG,
  UI_CONFIG,
} from '@constants/variable.constant';
import type { QuestionnaireTarget } from '@constants/types.constant';
import { apiClient } from '../../api/client';
import { Alert } from '../../items/Alert';
import { Button } from '../../items/Button';
import { CenteredPage } from '../../items/CenteredPage';
import { RequiredAsterisk } from '../../items/Input';
import { Panel } from '../../items/Panel';
import { WhatsAppContactTrigger } from '../../items/WhatsAppContactTrigger';
import { Typewriter } from '../../items/Typewriter';
import type {
  QuestionnaireDto,
  QuestionnaireFieldDef,
  QuestionnaireStepDef,
} from '../../types/questionnaire';
import { roleHomePath, useAuthStore } from '../../store/authStore';
import type { AuthUser } from '../../store/authStore';
import {
  isValidInternationalTel,
  sanitizeInternationalTelInput,
  splitInternationalTel,
} from '../../utils/internationalTel';

type Props = { userType: 'entreprise' | 'etudiant' };

/** Anciennes définitions : plusieurs champs par étape → une étape par question. */
function normalizeOneQuestionPerStep(steps: QuestionnaireStepDef[]): QuestionnaireStepDef[] {
  const out: QuestionnaireStepDef[] = [];
  for (const s of steps) {
    if (s.fields.length === 0) continue;
    for (const f of s.fields) {
      const title =
        s.fields.length === 1 && s.title.trim()
          ? s.title.trim()
          : [s.title.trim(), f.label.trim()].filter(Boolean).join(' — ') || f.label.trim() || 'Étape';
      out.push({ title, fields: [{ ...f }] });
    }
  }
  return out.length > 0 ? out : steps;
}

function withNormalizedDefinition(data: QuestionnaireDto): QuestionnaireDto {
  return {
    ...data,
    definition: {
      ...data.definition,
      steps: normalizeOneQuestionPerStep(data.definition.steps),
    },
  };
}

function buildDefaultValues(steps: QuestionnaireDto['definition']['steps']): Record<string, string> {
  const out: Record<string, string> = {};
  for (const step of steps) {
    for (const f of step.fields) {
      out[f.name] = '';
    }
  }
  return out;
}

function mergeProfileIntoDefaults(
  base: Record<string, string>,
  user: AuthUser | null
): Record<string, string> {
  if (!user) return base;
  const next = { ...base };
  const apply = (key: string, val: string | undefined) => {
    if (!val || !Object.prototype.hasOwnProperty.call(next, key)) return;
    if (String(next[key]).trim() !== '') return;
    next[key] = val;
  };
  apply('etu_email', user.email);
  apply('etu_email_secondaire', user.email);
  apply('etu_nom_prenom', user.displayName ?? undefined);
  apply('etu_whatsapp', user.phone ?? undefined);
  apply('ent_email', user.email);
  apply('ent_nom_responsable', user.displayName ?? undefined);
  const split = splitInternationalTel(user.phone);
  if (split) {
    apply('ent_whatsapp_indicatif', split.indicatif);
    apply('ent_whatsapp_numero', split.numero);
  }
  return next;
}

/** Référence stable quand `q` est null — évite une boucle reset → re-render (useMemo [steps]). */
const EMPTY_STEPS: QuestionnaireDto['definition']['steps'] = [];

/** Une valeur par ligne pour les cases à cocher (soumission = chaîne côté API). */
const CHECKBOX_ANSWER_LINE = '\n';

const MAX_QUESTIONNAIRE_FILE_BYTES = 4 * 1024 * 1024;

function renderField(
  field: QuestionnaireFieldDef,
  register: UseFormRegister<Record<string, string>>,
  errors: FieldErrors<Record<string, string>>,
  stepIndex: number,
  watch: UseFormWatch<Record<string, string>>,
  setValue: UseFormSetValue<Record<string, string>>,
  setError: UseFormSetError<Record<string, string>>,
  clearErrors: UseFormClearErrors<Record<string, string>>
) {
  const err = errors[field.name]?.message as string | undefined;
  const labelPrefix = (
    <span style={{ fontWeight: 600, display: 'block', marginBottom: 10 }}>
      <Typewriter key={`${stepIndex}-${field.name}-label`} text={field.label} />
      {field.required ? <RequiredAsterisk /> : null}
    </span>
  );
  const inputStyle = {
    width: '100%' as const,
    maxWidth: '100%' as const,
    padding: '0.65rem',
    borderRadius: UI_CONFIG.radii.sm,
    border: `1px solid ${UI_CONFIG.colors.black}22`,
  };

  if (field.type === 'info') {
    return (
      <div key={field.name} style={{ marginBottom: '1rem' }}>
        <input type="hidden" {...register(field.name)} />
        <p style={{ margin: 0, lineHeight: 1.55, color: UI_CONFIG.forms.subtitleColor }}>{field.label}</p>
      </div>
    );
  }

  if (field.type === 'radio' && field.options?.length) {
    return (
      <fieldset key={field.name} style={{ border: 'none', margin: '0 0 1rem', padding: 0 }}>
        {labelPrefix}
        <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {field.options.map((o) => (
            <label
              key={o}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.95rem' }}
            >
              <input
                type="radio"
                value={o}
                {...register(field.name, {
                  required: field.required ? MESSAGE_CONFIG.validationRequired : false,
                })}
              />
              <span>{o}</span>
            </label>
          ))}
        </div>
        {err ? <span style={{ color: UI_CONFIG.colors.error, fontSize: '0.85rem' }}>{err}</span> : null}
      </fieldset>
    );
  }

  if (field.type === 'checkboxes' && field.options?.length) {
    const raw = watch(field.name) ?? '';
    const selected = new Set(
      raw
        .split(CHECKBOX_ANSWER_LINE)
        .map((s) => s.trim())
        .filter(Boolean)
    );
    return (
      <fieldset key={field.name} style={{ border: 'none', margin: '0 0 1rem', padding: 0 }}>
        {labelPrefix}
        <input
          type="hidden"
          {...register(field.name, {
            validate: (v) => {
              if (!field.required) return true;
              const n = String(v ?? '')
                .split(CHECKBOX_ANSWER_LINE)
                .map((s) => s.trim())
                .filter(Boolean).length;
              return n > 0 || MESSAGE_CONFIG.validationRequired;
            },
          })}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {field.options.map((o) => (
            <label
              key={o}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.95rem' }}
            >
              <input
                type="checkbox"
                checked={selected.has(o)}
                onChange={(e) => {
                  const next = new Set(selected);
                  if (e.target.checked) next.add(o);
                  else next.delete(o);
                  setValue(field.name, [...next].join(CHECKBOX_ANSWER_LINE), {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />
              <span>{o}</span>
            </label>
          ))}
        </div>
        {err ? <span style={{ color: UI_CONFIG.colors.error, fontSize: '0.85rem' }}>{err}</span> : null}
      </fieldset>
    );
  }

  if (field.type === 'file') {
    return (
      <div key={field.name} style={{ marginBottom: '1rem' }}>
        {labelPrefix}
        <input type="hidden" {...register(field.name)} />
        <input
          type="file"
          accept=".pdf,.doc,.docx,image/png,image/jpeg,image/jpg,image/webp"
          style={{ fontSize: '0.9rem', maxWidth: '100%' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            clearErrors(field.name);
            if (!file) {
              setValue(field.name, '', { shouldValidate: true });
              return;
            }
            if (file.size > MAX_QUESTIONNAIRE_FILE_BYTES) {
              setError(field.name, { type: 'manual', message: MESSAGE_CONFIG.validationFileMaxSize });
              setValue(field.name, '', { shouldValidate: false });
              e.target.value = '';
              return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              setValue(field.name, String(reader.result ?? ''), { shouldValidate: true });
            };
            reader.readAsDataURL(file);
          }}
        />
        <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: UI_CONFIG.forms.subtitleColor, lineHeight: 1.4 }}>
          Formats courants : PDF, Word, PNG, JPEG. Taille max. 4 Mo (mode test).
        </p>
        {err ? <span style={{ color: UI_CONFIG.colors.error, fontSize: '0.85rem', display: 'block', marginTop: 6 }}>{err}</span> : null}
      </div>
    );
  }

  if (field.type === 'tel') {
    const telRegister = register(field.name, {
      required: field.required ? MESSAGE_CONFIG.validationRequired : false,
      validate: (v) => {
        const t = String(v ?? '').trim();
        if (!field.required && t === '') return true;
        return isValidInternationalTel(t) || MESSAGE_CONFIG.validationInternationalTel;
      },
    });
    return (
      <label key={field.name} style={{ display: 'block', marginBottom: '1rem' }}>
        {labelPrefix}
        <input
          type="tel"
          inputMode="tel"
          placeholder="+225 07 12 34 56 78"
          name={telRegister.name}
          ref={telRegister.ref}
          onBlur={telRegister.onBlur}
          onChange={(e) => {
            const el = e.target as HTMLInputElement;
            el.value = sanitizeInternationalTelInput(el.value);
            void telRegister.onChange(e);
          }}
          style={inputStyle}
        />
        {err ? <span style={{ color: UI_CONFIG.colors.error, fontSize: '0.85rem' }}>{err}</span> : null}
      </label>
    );
  }

  const base = {
    ...register(field.name, {
      required: field.required ? MESSAGE_CONFIG.validationRequired : false,
    }),
    style: inputStyle,
  };

  if (field.type === 'textarea') {
    return (
      <label key={field.name} style={{ display: 'block', marginBottom: '1rem' }}>
        {labelPrefix}
        <textarea rows={4} {...base} />
        {err ? <span style={{ color: UI_CONFIG.colors.error, fontSize: '0.85rem' }}>{err}</span> : null}
      </label>
    );
  }

  if (field.type === 'select' && field.options?.length) {
    return (
      <label key={field.name} style={{ display: 'block', marginBottom: '1rem' }}>
        {labelPrefix}
        <select {...base}>
          <option value="">—</option>
          {field.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {err ? <span style={{ color: UI_CONFIG.colors.error, fontSize: '0.85rem' }}>{err}</span> : null}
      </label>
    );
  }

  const inputType =
    field.type === 'email'
      ? 'email'
      : field.type === 'number'
          ? 'number'
          : field.type === 'date'
            ? 'date'
            : field.type === 'time'
              ? 'time'
              : field.type === 'datetime'
                ? 'datetime-local'
                : 'text';

  return (
    <label key={field.name} style={{ display: 'block', marginBottom: '1rem' }}>
      {labelPrefix}
      <input type={inputType} {...base} />
      {err ? <span style={{ color: UI_CONFIG.colors.error, fontSize: '0.85rem' }}>{err}</span> : null}
    </label>
  );
}

export function QuestionnaireFlowPage({ userType }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [q, setQ] = useState<QuestionnaireDto | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);
  const [submittingFinal, setSubmittingFinal] = useState(false);

  const expectedRole: QuestionnaireTarget =
    userType === 'entreprise' ? ROLE_CONFIG.entreprise : ROLE_CONFIG.etudiant;

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.get<QuestionnaireDto>(API_ENDPOINTS.questionnaireBySlug(slug));
        if (!cancelled) {
          if (data.targetUserType !== expectedRole) {
            setQ(null);
          } else {
            setQ(withNormalizedDefinition(data));
          }
        }
      } catch {
        if (!cancelled) setQ(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, expectedRole]);

  const steps = q?.definition.steps ?? EMPTY_STEPS;
  const mergedDefaults = useMemo(() => {
    const s = q?.definition.steps ?? EMPTY_STEPS;
    const base = buildDefaultValues(s);
    return mergeProfileIntoDefaults(base, user);
  }, [q?.id, user?.id, user?.email, user?.displayName, user?.phone]);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<Record<string, string>>({
    defaultValues: mergedDefaults,
  });

  useEffect(() => {
    reset(mergedDefaults);
  }, [mergedDefaults, reset]);

  useEffect(() => {
    setStepIndex(0);
  }, [q?.id]);

  const totalSteps = steps.length;
  const progress = totalSteps ? ((stepIndex + 1) / totalSteps) * 100 : 0;

  const stepField = steps[stepIndex]?.fields?.[0];
  const currentFields = stepField != null ? [stepField] : [];

  const onNext = async () => {
    const names = currentFields.filter((f) => f.required).map((f) => f.name);
    const optionalNames = currentFields.filter((f) => !f.required).map((f) => f.name);
    const ok = await trigger([...names, ...optionalNames]);
    if (ok && stepIndex < totalSteps - 1) setStepIndex((i) => i + 1);
  };

  const onPrev = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const onFinal = handleSubmit(async (values) => {
    if (!q || !user || !slug) return;
    setSubmitError('');
    setSubmittingFinal(true);
    const profileSnapshot = {
      email: user.email,
      displayName: user.displayName,
    };
    try {
      await apiClient.post(API_ENDPOINTS.submissions, {
        questionnaireId: q.id,
        answers: values,
        profileSnapshot,
      });
      setDone(true);
    } catch (e) {
      const data = axios.isAxiosError(e) ? (e.response?.data as { error?: string } | undefined) : undefined;
      setSubmitError(
        typeof data?.error === 'string' && data.error.trim() !== '' ? data.error : MESSAGE_CONFIG.errorGeneric
      );
    } finally {
      setSubmittingFinal(false);
    }
  });

  if (loading) {
    return (
      <CenteredPage width="sm">
        <Panel compact>
          <p style={{ textAlign: 'center', margin: 0 }}>{MESSAGE_CONFIG.loading}</p>
        </Panel>
      </CenteredPage>
    );
  }
  if (!q) {
    return (
      <CenteredPage width="sm">
        <Panel compact>
          <p style={{ color: UI_CONFIG.colors.error, textAlign: 'center', margin: 0 }}>
            {MESSAGE_CONFIG.emptyList}
          </p>
        </Panel>
      </CenteredPage>
    );
  }

  if (done) {
    const homeRole = user?.role ?? expectedRole;
    return (
      <CenteredPage width="sm" softBg>
        <div
          style={{
            background: UI_CONFIG.colors.white,
            padding: '1.75rem',
            borderRadius: UI_CONFIG.radii.lg,
            boxShadow: UI_CONFIG.forms.cardShadow,
            border: UI_CONFIG.forms.cardBorder,
            textAlign: 'center',
          }}
        >
          <h2 style={{ color: UI_CONFIG.colors.success, marginTop: 0 }}>{MESSAGE_CONFIG.successSaved}</h2>
          <p style={{ color: UI_CONFIG.forms.subtitleColor, lineHeight: 1.5, marginBottom: '1rem' }}>
            Pour la suite (prise de contact, consignes éventuelles), ouvrez le lien ci-dessous : un message est
            prérempli et un QR code permet d’ouvrir WhatsApp depuis votre téléphone.
          </p>
          <div style={{ marginBottom: '1.25rem' }}>
            <WhatsAppContactTrigger
              baseUrl={ONEJOB_EXTERNAL_LINKS.whatsappMeda}
              prefillMessage={ONEJOB_WHATSAPP_PREFILL.questionnaireFollowUp}
              triggerLabel="WhatsApp — message prêt + QR code"
              modalTitle="Suite du formulaire OneJob"
              variant="secondary"
              fullWidth
            />
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate(roleHomePath(homeRole))}
            style={{ padding: '0.65rem 1.2rem' }}
          >
            Retour au tableau de bord
          </Button>
        </div>
      </CenteredPage>
    );
  }

  return (
    <CenteredPage width="sm" softBg>
    <div
      style={{
        background: UI_CONFIG.colors.white,
        padding: '1.5rem 1.25rem',
        borderRadius: UI_CONFIG.radii.lg,
        boxShadow: UI_CONFIG.forms.cardShadow,
        border: UI_CONFIG.forms.cardBorder,
      }}
    >
      <h2 style={{ color: UI_CONFIG.colors.primary, marginTop: 0 }}>
        <Typewriter key={`${slug ?? ''}-form-title`} text={q.definition.title} />
      </h2>
      {q.definition.description ? (
        <p style={{ color: UI_CONFIG.forms.subtitleColor, lineHeight: 1.45, marginTop: '0.35rem' }}>
          <Typewriter key={`${slug ?? ''}-form-desc`} text={q.definition.description} />
        </p>
      ) : null}
      <div
        style={{
          height: QUESTIONNAIRE_UI_CONFIG.progressHeight,
          background: UI_CONFIG.colors.gray,
          borderRadius: UI_CONFIG.radii.sm,
          overflow: 'hidden',
          marginBottom: '1.25rem',
        }}
      >
        <motion.div
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: QUESTIONNAIRE_UI_CONFIG.stepTransition }}
          style={{ height: '100%', background: UI_CONFIG.colors.secondary }}
        />
      </div>
      <p style={{ fontWeight: 600, minHeight: '1.35em' }}>
        <Typewriter
          key={stepIndex}
          text={`Étape ${stepIndex + 1} / ${totalSteps} — ${steps[stepIndex]?.title ?? ''}`}
        />
      </p>
      <Alert show={Boolean(submitError)} variant="error" message={submitError} />
      {stepIndex === totalSteps - 1 ? (
        <p
          style={{
            fontSize: '0.82rem',
            color: UI_CONFIG.forms.subtitleColor,
            marginBottom: '0.75rem',
            lineHeight: 1.45,
          }}
        >
          Après validation, votre formulaire est enregistré sur OneJob. Un QR code vers notre WhatsApp vous sera
          proposé pour la suite des échanges.
        </p>
      ) : null}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (stepIndex === totalSteps - 1) void onFinal();
          else void onNext();
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: QUESTIONNAIRE_UI_CONFIG.stepTransition }}
          >
            {currentFields.map((f) =>
              renderField(f, register, errors, stepIndex, watch, setValue, setError, clearErrors)
            )}
          </motion.div>
        </AnimatePresence>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button type="button" variant="outline" disabled={stepIndex === 0} onClick={onPrev}>
            Précédent
          </Button>
          <Button
            type="submit"
            variant="secondary"
            disabled={submittingFinal}
            style={{ padding: '0.6rem 1.2rem' }}
          >
            {submittingFinal
              ? MESSAGE_CONFIG.loading
              : stepIndex === totalSteps - 1
                ? 'Envoyer le formulaire'
                : 'Suivant'}
          </Button>
        </div>
      </form>
    </div>
    </CenteredPage>
  );
}
