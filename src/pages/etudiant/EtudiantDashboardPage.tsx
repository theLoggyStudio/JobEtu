import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  API_ENDPOINTS,
  FEATURE_FLAGS,
  MATCHES_UI_CONFIG,
  MESSAGE_CONFIG,
  ONEJOB_EXTERNAL_LINKS,
  ROLE_CONFIG,
  ROUTE_BUILDERS,
  ROUTE_PATHS,
  UI_CONFIG,
  WHATSAPP_CONFIG,
} from '@constants/variable.constant';
import { CenteredPage } from '../../items/CenteredPage';
import { Panel } from '../../items/Panel';
import { PostRegisterWelcomeModal } from '../../items/PostRegisterWelcomeModal';
import { apiClient } from '../../api/client';
import { usePostRegisterWelcomeModal } from '../../hooks/usePostRegisterWelcomeModal';
import { useAuthStore } from '../../store/authStore';
import type { QuestionnaireDto } from '../../types/questionnaire';

export function EtudiantDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { open: welcomeOpen, onClose: welcomeClose } = usePostRegisterWelcomeModal();
  const [list, setList] = useState<QuestionnaireDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.get<{ items: QuestionnaireDto[] }>(
          `${API_ENDPOINTS.questionnaires}?target=etudiant`
        );
        if (!cancelled) setList(data.items);
      } catch {
        if (!cancelled) setError(MESSAGE_CONFIG.errorGeneric);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <CenteredPage width="md">
        <Panel compact>
          <p style={{ textAlign: 'center', margin: 0 }}>{MESSAGE_CONFIG.loading}</p>
        </Panel>
      </CenteredPage>
    );
  }
  if (error) {
    return (
      <CenteredPage width="md">
        <Panel compact>
          <p style={{ color: UI_CONFIG.colors.error, textAlign: 'center', margin: 0 }}>{error}</p>
        </Panel>
      </CenteredPage>
    );
  }

  const q = list.find((item) => item.isActive) ?? list[0] ?? null;
  const spaceTitle =
    user?.role === ROLE_CONFIG.particulier ? 'Espace particulier' : 'Espace étudiant';
  const questionnairePath = q ? ROUTE_BUILDERS.etudiantQuestionnaire(q.slug) : null;

  return (
    <CenteredPage width="md">
      <PostRegisterWelcomeModal
        open={welcomeOpen}
        onClose={welcomeClose}
        questionnairePath={questionnairePath}
        formCtaLabel="Ouvrir le formulaire"
      />
      <Panel style={{ marginBottom: '1rem' }}>
        <h2 style={{ color: UI_CONFIG.colors.primary, marginTop: 0 }}>{spaceTitle}</h2>
        <p style={{ marginBottom: '0.75rem' }}>
          <Link to={ROUTE_PATHS.etudiantMatches} style={{ fontWeight: 600, color: UI_CONFIG.colors.secondary }}>
            {MATCHES_UI_CONFIG.pageTitle}
          </Link>
        </p>
        <p style={{ marginBottom: '0.5rem' }}>
          {q ? (
            <Link
              to={ROUTE_BUILDERS.etudiantQuestionnaire(q.slug)}
              style={{ fontWeight: 600, color: UI_CONFIG.colors.secondary }}
            >
              Remplir un nouveau formulaire
            </Link>
          ) : (
            <span style={{ color: UI_CONFIG.forms.subtitleColor }}>
              Remplir un nouveau formulaire — aucun questionnaire actif pour le moment
            </span>
          )}
        </p>
        <p style={{ marginBottom: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
          <span style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: UI_CONFIG.colors.primary }}>
            
          </span>
          <span style={{ color: UI_CONFIG.forms.subtitleColor }}> · </span>
          <a
            href={ONEJOB_EXTERNAL_LINKS.whatsappAdeDany}
            target="_blank"
            rel="noreferrer"
            style={{ color: UI_CONFIG.colors.secondary, fontWeight: 600 }}
          >
            Apprendre une compétence avec l&apos;ADE (Nous Contacter via WhatsApp ) 
          </a>
        </p>
      </Panel>
      {!q ? (
        <Panel compact>
          <p style={{ margin: 0 }}>{MESSAGE_CONFIG.emptyList}</p>
        </Panel>
      ) : (
        <Panel elevated animated>
          <strong style={{ display: 'block', fontSize: '1.05rem', marginBottom: q.description ? 8 : 12 }}>
            {q.title}
          </strong>
          {q.description ? (
            <p style={{ margin: '0 0 12px', color: UI_CONFIG.forms.subtitleColor, lineHeight: 1.45 }}>
              {q.description}
            </p>
          ) : null}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <Link
              to={ROUTE_BUILDERS.etudiantQuestionnaire(q.slug)}
              style={{
                display: 'inline-block',
                background: UI_CONFIG.colors.primary,
                color: UI_CONFIG.colors.white,
                padding: '0.5rem 1rem',
                borderRadius: UI_CONFIG.radii.sm,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Ouvrir le formulaire
            </Link>
            {FEATURE_FLAGS.enableWhatsAppCta && q.whatsappLink ? (
              <a
                href={q.whatsappLink}
                target="_blank"
                rel="noreferrer"
                style={{ color: UI_CONFIG.colors.secondary, fontWeight: 600 }}
              >
                {WHATSAPP_CONFIG.defaultLabel}
              </a>
            ) : null}
          </div>
        </Panel>
      )}
    </CenteredPage>
  );
}
