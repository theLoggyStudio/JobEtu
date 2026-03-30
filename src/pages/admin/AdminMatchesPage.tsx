import type { CSSProperties } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MatchStatus } from '@constants/types.constant';
import {
  ADMIN_MATCHES_UI_CONFIG,
  API_ENDPOINTS,
  MATCH_STATUS_UI,
  MESSAGE_CONFIG,
  ROUTE_PATHS,
  UI_CONFIG,
} from '@constants/variable.constant';
import { apiClient } from '../../api/client';
import { Alert } from '../../items/Alert';
import { Button } from '../../items/Button';
import { CenteredPage } from '../../items/CenteredPage';
import { TextPanel } from '../../items/TextPanel';
import { Table, type TableColumn } from '../../items/Table';
import type { AdminMatchListItem, AdminMatchParty } from '../../types/match';

const selectStyle: CSSProperties = {
  padding: '0.45rem 0.5rem',
  borderRadius: UI_CONFIG.radii.sm,
  border: `1px solid ${UI_CONFIG.colors.black}22`,
  background: UI_CONFIG.colors.white,
  fontSize: '0.85rem',
  maxWidth: '120px',
};

function PartyCell({ party }: { party: AdminMatchParty | null }) {
  if (!party) {
    return <span style={{ color: `${UI_CONFIG.colors.black}66` }}>—</span>;
  }
  return (
    <div style={{ lineHeight: 1.35 }}>
      <div style={{ fontWeight: 600 }}>{party.userDisplayName ?? '—'}</div>
      <div style={{ fontSize: '0.78rem', color: `${UI_CONFIG.colors.black}99` }}>{party.userEmail}</div>
      <div style={{ fontSize: '0.78rem', marginTop: 2 }}>{party.questionnaireTitle}</div>
    </div>
  );
}

function RatingSelect({
  value,
  onChange,
  ariaLabel,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  ariaLabel: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value === null ? '' : String(value)}
      onChange={(e) => {
        const raw = e.target.value;
        onChange(raw === '' ? null : Number(raw));
      }}
      style={selectStyle}
    >
      <option value="">{ADMIN_MATCHES_UI_CONFIG.ratingUnset}</option>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <option key={n} value={n}>
          {n}/10
        </option>
      ))}
    </select>
  );
}

export function AdminMatchesPage() {
  const [items, setItems] = useState<AdminMatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null);

  const statusBadgeStyle = (s: MatchStatus): CSSProperties => {
    const base: CSSProperties = {
      display: 'inline-block',
      fontSize: '0.78rem',
      fontWeight: 700,
      padding: '0.2rem 0.5rem',
      borderRadius: UI_CONFIG.radii.sm,
    };
    if (s === 'validated') return { ...base, background: `${UI_CONFIG.colors.success}22`, color: UI_CONFIG.colors.success };
    if (s === 'rejected') return { ...base, background: `${UI_CONFIG.colors.black}14`, color: `${UI_CONFIG.colors.black}88` };
    return { ...base, background: `${UI_CONFIG.colors.secondaryLight}33`, color: UI_CONFIG.colors.secondary };
  };

  const fetchMatches = useCallback(async () => {
    const { data } = await apiClient.get<{ items: AdminMatchListItem[] }>(API_ENDPOINTS.matches);
    setItems(data.items);
  }, []);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      await fetchMatches();
    } catch {
      setError(MESSAGE_CONFIG.errorGeneric);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [fetchMatches]);

  useEffect(() => {
    void load();
  }, [load]);

  const patchRow = async (row: AdminMatchListItem) => {
    setSavingId(row.id);
    setInfo('');
    setError('');
    try {
      await apiClient.patch(API_ENDPOINTS.matchRatings(row.id), {
        adminRatingEntreprise: row.adminRatingEntreprise,
        adminRatingEtudiant: row.adminRatingEtudiant,
      });
      setInfo(ADMIN_MATCHES_UI_CONFIG.saved);
    } catch {
      setError(MESSAGE_CONFIG.errorGeneric);
    } finally {
      setSavingId(null);
    }
  };

  const updateRow = (id: string, patch: Partial<AdminMatchListItem>) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const patchStatus = async (id: string, status: 'validated' | 'rejected') => {
    setStatusBusyId(id);
    setInfo('');
    setError('');
    try {
      await apiClient.patch(API_ENDPOINTS.matchStatus(id), { status });
      setInfo(status === 'validated' ? ADMIN_MATCHES_UI_CONFIG.statusValidated : ADMIN_MATCHES_UI_CONFIG.statusRejected);
      await fetchMatches();
    } catch {
      setError(MESSAGE_CONFIG.errorGeneric);
    } finally {
      setStatusBusyId(null);
    }
  };

  const columns: TableColumn<AdminMatchListItem>[] = [
    {
      id: 'date',
      header: ADMIN_MATCHES_UI_CONFIG.colDate,
      width: '130px',
      cell: (r) =>
        new Date(r.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      sortValue: (r) => r.createdAt,
    },
    {
      id: 'status',
      header: ADMIN_MATCHES_UI_CONFIG.colStatus,
      width: '168px',
      sortValue: (r) => r.status,
      cell: (r) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <span style={statusBadgeStyle(r.status)}>{MATCH_STATUS_UI[r.status]}</span>
          {r.status === 'pending' ? (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={statusBusyId === r.id}
                onClick={() => void patchStatus(r.id, 'validated')}
              >
                {ADMIN_MATCHES_UI_CONFIG.validate}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={statusBusyId === r.id}
                onClick={() => void patchStatus(r.id, 'rejected')}
              >
                {ADMIN_MATCHES_UI_CONFIG.reject}
              </Button>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      id: 'e',
      header: ADMIN_MATCHES_UI_CONFIG.colEntreprise,
      cell: (r) => <PartyCell party={r.entreprise} />,
      sortValue: (r) => r.entreprise?.userEmail ?? '',
    },
    {
      id: 'f',
      header: ADMIN_MATCHES_UI_CONFIG.colEtudiant,
      cell: (r) => <PartyCell party={r.etudiant} />,
      sortValue: (r) => r.etudiant?.userEmail ?? '',
    },
    {
      id: 're',
      header: ADMIN_MATCHES_UI_CONFIG.colRatingE,
      width: '140px',
      sortValue: (r) => r.adminRatingEntreprise,
      cell: (r) => (
        <RatingSelect
          ariaLabel={`Note entreprise pour le match ${r.id}`}
          value={r.adminRatingEntreprise}
          onChange={(v) => updateRow(r.id, { adminRatingEntreprise: v })}
        />
      ),
    },
    {
      id: 'rf',
      header: ADMIN_MATCHES_UI_CONFIG.colRatingF,
      width: '160px',
      sortValue: (r) => r.adminRatingEtudiant,
      cell: (r) => (
        <RatingSelect
          ariaLabel={`Note étudiant pour le match ${r.id}`}
          value={r.adminRatingEtudiant}
          onChange={(v) => updateRow(r.id, { adminRatingEtudiant: v })}
        />
      ),
    },
    {
      id: 'save',
      header: ADMIN_MATCHES_UI_CONFIG.colAction,
      width: '120px',
      cell: (r) => (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={savingId === r.id}
          onClick={() => void patchRow(r)}
        >
          {savingId === r.id ? ADMIN_MATCHES_UI_CONFIG.saving : ADMIN_MATCHES_UI_CONFIG.save}
        </Button>
      ),
    },
  ];

  if (loading) {
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
        <h2 style={{ color: UI_CONFIG.colors.primary, marginTop: '0.35rem' }}>
          {ADMIN_MATCHES_UI_CONFIG.pageTitle}
        </h2>
        <p style={{ color: UI_CONFIG.colors.black, opacity: 0.75, maxWidth: '48rem' }}>
          {ADMIN_MATCHES_UI_CONFIG.intro}
        </p>
        <Alert show={Boolean(error)} variant="error" message={error} />
        <Alert show={Boolean(info)} variant="success" message={info} />
        <Table
          rows={items}
          columns={columns}
          getRowId={(r) => r.id}
          pageSize={6}
          emptyLabel={ADMIN_MATCHES_UI_CONFIG.empty}
        />
      </TextPanel>
    </CenteredPage>
  );
}
