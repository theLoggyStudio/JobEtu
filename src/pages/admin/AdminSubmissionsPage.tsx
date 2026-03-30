import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS, MESSAGE_CONFIG, ROUTE_PATHS, UI_CONFIG } from '@constants/variable.constant';
import { Button } from '../../items/Button';
import { CenteredPage } from '../../items/CenteredPage';
import { TextPanel } from '../../items/TextPanel';
import { AnswersReadout, ProfileSnapshotReadout } from '../../items/SubmissionDetailReadout';
import { Table, type TableColumn } from '../../items/Table';
import { apiClient } from '../../api/client';
import type { SubmissionSummary } from '../../features/match/MatchModal';

const submissionListColumns: TableColumn<SubmissionSummary>[] = [
  {
    id: 'date',
    header: 'Date',
    width: '140px',
    cell: (s) => new Date(s.createdAt).toLocaleString('fr-FR'),
    sortValue: (s) => s.createdAt,
  },
  {
    id: 'type',
    header: 'Type',
    width: '110px',
    cell: (s) => s.targetUserType,
    sortValue: (s) => s.targetUserType,
  },
  { id: 'email', header: 'Email', cell: (s) => s.userEmail, sortValue: (s) => s.userEmail },
  {
    id: 'q',
    header: 'Questionnaire',
    cell: (s) => s.questionnaireTitle,
    sortValue: (s) => s.questionnaireTitle,
  },
];

export function AdminSubmissionsPage() {
  const [items, setItems] = useState<SubmissionSummary[]>([]);
  const [q, setQ] = useState('');
  const [target, setTarget] = useState<'all' | 'entreprise' | 'etudiant'>('all');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<SubmissionSummary | null>(null);

  const fetchList = async () => {
    const params = new URLSearchParams();
    if (target !== 'all') params.set('target', target);
    if (q.trim()) params.set('search', q.trim());
    const { data } = await apiClient.get<{ items: SubmissionSummary[] }>(
      `${API_ENDPOINTS.submissions}?${params.toString()}`
    );
    setItems(data.items);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetchList();
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSearch = async () => {
    setLoading(true);
    try {
      await fetchList();
    } finally {
      setLoading(false);
    }
  };

  if (loading && items.length === 0) {
    return (
      <CenteredPage width="xl">
        <TextPanel compact>
          <p style={{ textAlign: 'center', margin: 0 }}>{MESSAGE_CONFIG.loading}</p>
        </TextPanel>
      </CenteredPage>
    );
  }

  return (
    <CenteredPage width="xl">
      <TextPanel>
        <p>
          <Link to={ROUTE_PATHS.adminDashboard}>← Retour admin</Link>
        </p>
        <h2 style={{ color: UI_CONFIG.colors.primary, marginTop: '0.35rem' }}>Soumissions</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Recherche email / titre"
          style={{ padding: '0.5rem', minWidth: 220, borderRadius: UI_CONFIG.radii.sm }}
        />
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value as typeof target)}
          style={{ padding: '0.5rem', borderRadius: UI_CONFIG.radii.sm }}
        >
          <option value="all">Tous</option>
          <option value="entreprise">Entreprise</option>
          <option value="etudiant">Étudiant</option>
        </select>
        <Button type="button" variant="primary" onClick={() => void onSearch()} style={{ padding: '0.5rem 1rem' }}>
          Filtrer
        </Button>
      </div>
      <p style={{ fontSize: '0.85rem', color: `${UI_CONFIG.colors.black}99`, marginBottom: 8 }}>
        Cliquez sur une ligne pour ouvrir le détail.
      </p>
      <Table
        rows={items}
        columns={submissionListColumns}
        getRowId={(s) => s.id}
        onRowClick={(s) => setDetail(s)}
        selectedRowId={detail?.id ?? null}
        pageSize={8}
        emptyLabel={MESSAGE_CONFIG.emptyList}
      />
      </TextPanel>
      {detail
        ? createPortal(
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: `${UI_CONFIG.colors.black}88`,
                zIndex: UI_CONFIG.zIndex.modal,
                padding: '2rem',
                overflow: 'auto',
              }}
              onClick={() => setDetail(null)}
            >
              <div
                style={{
                  background: UI_CONFIG.colors.white,
                  maxWidth: 640,
                  margin: '0 auto',
                  padding: '1rem',
                  borderRadius: UI_CONFIG.radii.lg,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ marginTop: 0, color: UI_CONFIG.colors.primary }}>Détail soumission</h3>
                <dl style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 9rem) 1fr',
                      gap: '0.25rem 0.75rem',
                      marginBottom: 6,
                    }}
                  >
                    <dt style={{ fontWeight: 600, margin: 0 }}>E-mail</dt>
                    <dd style={{ margin: 0, wordBreak: 'break-word' }}>{detail.userEmail}</dd>
                  </div>
                  {detail.userDisplayName ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 9rem) 1fr',
                        gap: '0.25rem 0.75rem',
                        marginBottom: 6,
                      }}
                    >
                      <dt style={{ fontWeight: 600, margin: 0 }}>Nom affiché</dt>
                      <dd style={{ margin: 0 }}>{detail.userDisplayName}</dd>
                    </div>
                  ) : null}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 9rem) 1fr',
                      gap: '0.25rem 0.75rem',
                      marginBottom: 6,
                    }}
                  >
                    <dt style={{ fontWeight: 600, margin: 0 }}>Questionnaire</dt>
                    <dd style={{ margin: 0 }}>{detail.questionnaireTitle}</dd>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 9rem) 1fr',
                      gap: '0.25rem 0.75rem',
                      marginBottom: 6,
                    }}
                  >
                    <dt style={{ fontWeight: 600, margin: 0 }}>Profil cible</dt>
                    <dd style={{ margin: 0 }}>{detail.targetUserType}</dd>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 9rem) 1fr',
                      gap: '0.25rem 0.75rem',
                      marginBottom: 0,
                    }}
                  >
                    <dt style={{ fontWeight: 600, margin: 0 }}>Date</dt>
                    <dd style={{ margin: 0 }}>{new Date(detail.createdAt).toLocaleString('fr-FR')}</dd>
                  </div>
                </dl>
                <ProfileSnapshotReadout snapshot={detail.profileSnapshot} />
                <AnswersReadout answers={detail.answers} />
                <Button
                  type="button"
                  variant="outlineMuted"
                  onClick={() => setDetail(null)}
                  style={{ marginTop: '1.25rem' }}
                >
                  Fermer
                </Button>
              </div>
            </div>,
            document.body
          )
        : null}
    </CenteredPage>
  );
}
