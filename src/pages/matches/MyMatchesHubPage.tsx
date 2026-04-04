import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  API_ENDPOINTS,
  MATCHES_UI_CONFIG,
  MESSAGE_CONFIG,
  ROLE_CONFIG,
  ROUTE_PATHS,
  ROUTE_BUILDERS,
  UI_CONFIG,
} from '@constants/variable.constant';
import type { QuestionnaireTarget } from '@constants/types.constant';
import { apiClient } from '../../api/client';
import { Button } from '../../items/Button';
import { CenteredPage } from '../../items/CenteredPage';
import { Panel } from '../../items/Panel';
import { useAuthStore } from '../../store/authStore';
import type { MatchMessageDto, MyMatchDto } from '../../types/match';

const POLL_MS = 4500;

type Props = {
  baseListPath: string;
  buildChatPath: (matchId: string) => string;
  dashboardPath: string;
  /** Rôle attendu de l’utilisateur sur cette arborescence de routes */
  expectedRole: QuestionnaireTarget;
};

export function MyMatchesHubPage({ baseListPath, buildChatPath, dashboardPath, expectedRole }: Props) {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [matches, setMatches] = useState<MyMatchDto[]>([]);
  const [messages, setMessages] = useState<MatchMessageDto[]>([]);
  const [draft, setDraft] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMatches = useCallback(async () => {
    const { data } = await apiClient.get<{ items: MyMatchDto[] }>(API_ENDPOINTS.matchesMy);
    setMatches(data.items);
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    const { data } = await apiClient.get<{ items: MatchMessageDto[] }>(
      API_ENDPOINTS.matchMessages(id)
    );
    setMessages(data.items);
  }, []);

  useEffect(() => {
    if (!user) return;
    const okEtudiantSide =
      expectedRole === 'etudiant' &&
      (user.role === ROLE_CONFIG.etudiant || user.role === ROLE_CONFIG.particulier);
    const ok = user.role === expectedRole || okEtudiantSide;
    if (!ok) {
      navigate(dashboardPath, { replace: true });
    }
  }, [user, expectedRole, navigate, dashboardPath]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError('');
      setLoadingList(true);
      try {
        await loadMatches();
      } catch {
        if (!cancelled) setError(MESSAGE_CONFIG.errorGeneric);
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadMatches]);

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;
    (async () => {
      setLoadingChat(true);
      setError('');
      try {
        await loadMessages(matchId);
      } catch {
        if (!cancelled) setError(MESSAGE_CONFIG.errorGeneric);
      } finally {
        if (!cancelled) setLoadingChat(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [matchId, loadMessages]);

  useEffect(() => {
    if (!matchId) return;
    const t = window.setInterval(() => {
      void loadMessages(matchId);
    }, POLL_MS);
    return () => window.clearInterval(t);
  }, [matchId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const activeMatch = matchId ? matches.find((m) => m.id === matchId) : undefined;

  useEffect(() => {
    if (!matchId || loadingList) return;
    if (!matches.some((m) => m.id === matchId)) {
      setError('Ce match n’existe pas ou ne vous concerne pas.');
      navigate(baseListPath, { replace: true });
    }
  }, [matchId, matches, loadingList, navigate, baseListPath]);

  const counterpartyKind = (m: MyMatchDto) =>
    m.myRole === 'entreprise' ? MATCHES_UI_CONFIG.counterpartyEtudiant : MATCHES_UI_CONFIG.counterpartyEntreprise;

  const send = async () => {
    if (!matchId || !draft.trim()) return;
    setSending(true);
    setError('');
    try {
      await apiClient.post(API_ENDPOINTS.matchMessages(matchId), { body: draft.trim() });
      setDraft('');
      await loadMessages(matchId);
    } catch {
      setError(MESSAGE_CONFIG.errorGeneric);
    } finally {
      setSending(false);
    }
  };

  if (!matchId) {
    if (loadingList) {
      return (
        <CenteredPage width="lg">
          <Panel compact>
            <p style={{ textAlign: 'center', margin: 0 }}>{MESSAGE_CONFIG.loading}</p>
          </Panel>
        </CenteredPage>
      );
    }
    return (
      <CenteredPage width="lg">
        <Panel>
          <p>
            <Link to={dashboardPath}>← Tableau de bord</Link>
          </p>
          <h2 style={{ color: UI_CONFIG.colors.primary, marginTop: '0.35rem' }}>
            {MATCHES_UI_CONFIG.pageTitle}
          </h2>
          <p style={{ color: `${UI_CONFIG.colors.black}aa`, maxWidth: 560 }}>{MATCHES_UI_CONFIG.listIntro}</p>
          {error ? <p style={{ color: UI_CONFIG.colors.error }}>{error}</p> : null}

          {matches.length === 0 ? (
            <p style={{ marginBottom: 0 }}>{MATCHES_UI_CONFIG.emptyList}</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {matches.map((m) => (
              <li
                key={m.id}
                style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  border: `1px solid ${UI_CONFIG.colors.black}18`,
                  borderRadius: UI_CONFIG.radii.md,
                  background: UI_CONFIG.colors.gray,
                }}
              >
                <p style={{ marginTop: 0, fontWeight: 700, color: UI_CONFIG.colors.primary }}>
                  {counterpartyKind(m)} : {m.counterparty.displayName ?? m.counterparty.email}
                </p>
                <p style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>
                  {MATCHES_UI_CONFIG.matchedOn}{' '}
                  {new Date(m.matchedAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
                <p style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>
                  {MATCHES_UI_CONFIG.email} : {m.counterparty.email}
                </p>
                <p style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>
                  {MATCHES_UI_CONFIG.formTitle} : {m.counterparty.questionnaireTitle}
                </p>
                <Button
                  type="button"
                  variant="primary"
                  style={{ marginTop: 8 }}
                  onClick={() => navigate(buildChatPath(m.id))}
                >
                  {MATCHES_UI_CONFIG.openChat}
                </Button>
              </li>
            ))}
            </ul>
          )}
        </Panel>
      </CenteredPage>
    );
  }

  if (loadingList && matches.length === 0) {
    return (
      <CenteredPage width="lg">
        <Panel compact>
          <p style={{ textAlign: 'center', margin: 0 }}>{MESSAGE_CONFIG.loading}</p>
        </Panel>
      </CenteredPage>
    );
  }

  if (!activeMatch) {
    return (
      <CenteredPage width="lg">
        <Panel compact>
          <p style={{ textAlign: 'center', margin: 0 }}>{MESSAGE_CONFIG.loading}</p>
        </Panel>
      </CenteredPage>
    );
  }

  return (
    <CenteredPage width="lg">
      <Panel>
        <p>
          <Link to={dashboardPath}>← Tableau de bord</Link>
        </p>
        <p>
          <Link to={baseListPath}>{MATCHES_UI_CONFIG.backToList}</Link>
        </p>
        <h2 style={{ color: UI_CONFIG.colors.primary, marginTop: 8 }}>{MATCHES_UI_CONFIG.pageTitle}</h2>
        <p style={{ color: `${UI_CONFIG.colors.black}aa`, maxWidth: 560 }}>{MATCHES_UI_CONFIG.chatIntro}</p>

        <div
          style={{
            marginTop: 16,
            padding: '1rem',
            borderRadius: UI_CONFIG.radii.md,
            border: `1px solid ${UI_CONFIG.colors.black}18`,
            background: UI_CONFIG.colors.gray,
          }}
        >
          <p style={{ marginTop: 0, fontWeight: 700, color: UI_CONFIG.colors.secondary }}>
            {counterpartyKind(activeMatch)}
          </p>
          <p>
            <strong>{MATCHES_UI_CONFIG.email}</strong> : {activeMatch.counterparty.email}
          </p>
          {activeMatch.counterparty.displayName ? (
            <p>
              <strong>Nom</strong> : {activeMatch.counterparty.displayName}
            </p>
          ) : null}
          <p>
            <strong>{MATCHES_UI_CONFIG.formTitle}</strong> : {activeMatch.counterparty.questionnaireTitle}
          </p>
          <ul style={{ paddingLeft: '1.2rem', marginBottom: 0 }}>
            {activeMatch.counterparty.answersPreview.map((a) => (
              <li key={a.fieldName}>
                <strong>{a.fieldName}</strong> : {a.value}
              </li>
            ))}
          </ul>
        </div>

        {error ? <p style={{ color: UI_CONFIG.colors.error }}>{error}</p> : null}

        <div
          style={{
            marginTop: 20,
            border: `1px solid ${UI_CONFIG.colors.black}18`,
            borderRadius: UI_CONFIG.radii.md,
            background: UI_CONFIG.colors.gray,
            minHeight: 280,
            maxHeight: '48vh',
            overflowY: 'auto',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {loadingChat && messages.length === 0 ? (
            <p style={{ margin: 0 }}>{MESSAGE_CONFIG.loading}</p>
          ) : null}
          {messages.map((msg) => {
            const mine = user?.id === msg.senderUserId;
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  maxWidth: 'min(100%, 420px)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: UI_CONFIG.radii.md,
                  background: mine ? UI_CONFIG.colors.primary : UI_CONFIG.colors.white,
                  color: mine ? UI_CONFIG.colors.white : UI_CONFIG.colors.black,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
              >
                <div style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: 4 }}>
                  {mine ? MATCHES_UI_CONFIG.you : MATCHES_UI_CONFIG.other} ·{' '}
                  {new Date(msg.createdAt).toLocaleString('fr-FR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.body}</div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={MATCHES_UI_CONFIG.messagePlaceholder}
            rows={3}
            style={{
              flex: '1 1 240px',
              minWidth: 200,
              padding: '0.65rem 0.85rem',
              borderRadius: UI_CONFIG.radii.sm,
              border: `1px solid ${UI_CONFIG.colors.black}22`,
              fontFamily: 'inherit',
              fontSize: '0.95rem',
            }}
          />
          <Button type="button" variant="secondary" disabled={sending || !draft.trim()} onClick={() => void send()}>
            {sending ? MESSAGE_CONFIG.loading : MATCHES_UI_CONFIG.send}
          </Button>
        </div>
      </Panel>
    </CenteredPage>
  );
}

export function EntrepriseMatchesPage() {
  return (
    <MyMatchesHubPage
      baseListPath={ROUTE_PATHS.entrepriseMatches}
      buildChatPath={ROUTE_BUILDERS.entrepriseMatchChat}
      dashboardPath={ROUTE_PATHS.entrepriseDashboard}
      expectedRole="entreprise"
    />
  );
}

export function EtudiantMatchesPage() {
  return (
    <MyMatchesHubPage
      baseListPath={ROUTE_PATHS.etudiantMatches}
      buildChatPath={ROUTE_BUILDERS.etudiantMatchChat}
      dashboardPath={ROUTE_PATHS.etudiantDashboard}
      expectedRole="etudiant"
    />
  );
}
