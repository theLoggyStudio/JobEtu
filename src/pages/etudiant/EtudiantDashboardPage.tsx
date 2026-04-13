import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  API_ENDPOINTS,
  MESSAGE_CONFIG,
  ONEJOB_EXTERNAL_LINKS,
  ONEJOB_WHATSAPP_PREFILL,
  ROLE_CONFIG,
  ROUTE_BUILDERS,
  ROUTE_PATHS,
  UI_CONFIG,
} from '@constants/variable.constant';
import { CenteredPage } from '../../items/CenteredPage';
import { DashboardSegmentNav } from '../../items/DashboardSegmentNav';
import { Panel } from '../../items/Panel';
import { PostRegisterWelcomeModal } from '../../items/PostRegisterWelcomeModal';
import { WhatsAppContactTrigger } from '../../items/WhatsAppContactTrigger';
import { apiClient } from '../../api/client';
import { usePostRegisterWelcomeModal } from '../../hooks/usePostRegisterWelcomeModal';
import { useAuthStore } from '../../store/authStore';
import type { QuestionnaireDto } from '../../types/questionnaire';

const actionRow: CSSProperties = {
  display: 'block',
  fontWeight: 600,
  color: UI_CONFIG.colors.secondary,
  textDecoration: 'none',
  padding: '0.65rem 0',
  borderBottom: `1px solid ${UI_CONFIG.colors.black}12`,
};

const listShell: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '0.5rem 0 0',
};

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
        <DashboardSegmentNav basePath={ROUTE_PATHS.etudiantDashboard} />
        <nav aria-label="Actions du tableau de bord">
          <ul style={listShell}>
            <li>
              <Link to={ROUTE_PATHS.account} style={actionRow}>
                Mon compte
              </Link>
            </li>
            <li>
              <Link to={ROUTE_PATHS.etudiantMatches} style={actionRow}>
                Mes mises en relation
              </Link>
            </li>
            <li>
              {q ? (
                <Link to={ROUTE_BUILDERS.etudiantQuestionnaire(q.slug)} style={actionRow}>
                  Remplir un nouveau formulaire
                </Link>
              ) : (
                <span
                  style={{
                    ...actionRow,
                    color: UI_CONFIG.forms.subtitleColor,
                    cursor: 'default',
                  }}
                >
                  Remplir un nouveau formulaire — aucun questionnaire actif pour le moment
                </span>
              )}
            </li>
            <li style={{ borderBottom: 'none' }}>
              <WhatsAppContactTrigger
                baseUrl={ONEJOB_EXTERNAL_LINKS.whatsappAdeMeda}
                prefillMessage={ONEJOB_WHATSAPP_PREFILL.adeLine1}
                triggerLabel="Apprendre une compétence avec nous (ADE : nous contacter via WhatsApp)"
                presentation="row"
                triggerStyle={{ ...actionRow, borderBottom: 'none' }}
              />
            </li>
          </ul>
        </nav>
      </Panel>
    </CenteredPage>
  );
}
