import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import {
  API_ENDPOINTS,
  MATCH_CONFIG,
  MESSAGE_CONFIG,
  UI_CONFIG,
} from '@constants/variable.constant';
import type { AdminMatchListItem } from '../../types/match';
import { apiClient } from '../../api/client';
import { Button } from '../../items/Button';
import { Modal } from '../../items/Modal';
import { AnswersReadout, ProfileSnapshotReadout } from '../../items/SubmissionDetailReadout';
import { Table, type TableColumn } from '../../items/Table';

export type SubmissionSummary = {
  id: string;
  questionnaireTitle: string;
  userEmail: string;
  userDisplayName: string | null;
  profileSnapshot: Record<string, unknown> | null;
  answers: { fieldName: string; value: string }[];
  targetUserType: string;
  createdAt: string;
};

type PickerKind = 'entreprise' | 'etudiant';

type MatchModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

function formatSubmissionDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function answersPreview(s: SubmissionSummary, max = 96): string {
  if (!s.answers.length) return '—';
  const t = s.answers.map((a) => `${a.fieldName}: ${a.value}`).join(' · ');
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

const submissionTableColumns: TableColumn<SubmissionSummary>[] = [
  {
    id: 'date',
    header: 'Date',
    width: '128px',
    cell: (s) => formatSubmissionDate(s.createdAt),
    sortValue: (s) => s.createdAt,
  },
  { id: 'email', header: 'Email', cell: (s) => s.userEmail, sortValue: (s) => s.userEmail },
  {
    id: 'name',
    header: 'Nom',
    width: '112px',
    cell: (s) => s.userDisplayName ?? '—',
    sortValue: (s) => s.userDisplayName ?? '',
  },
  {
    id: 'form',
    header: 'Formulaire',
    cell: (s) => s.questionnaireTitle,
    sortValue: (s) => s.questionnaireTitle,
  },
  {
    id: 'answers',
    header: 'Réponses (extrait)',
    cell: (s) => <span style={{ lineHeight: 1.35 }}>{answersPreview(s)}</span>,
    sortValue: (s) => s.answers.map((a) => `${a.fieldName}\t${a.value}`).join('\n'),
  },
];

export const MatchModal = ({ open, onClose, onCreated }: MatchModalProps) => {
  const [entreprise, setEntreprise] = useState<SubmissionSummary[]>([]);
  const [etudiant, setEtudiant] = useState<SubmissionSummary[]>([]);
  const [eId, setEId] = useState('');
  const [fId, setFId] = useState('');
  const [picker, setPicker] = useState<PickerKind | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [adminMatches, setAdminMatches] = useState<AdminMatchListItem[]>([]);

  const blockedPairs = useMemo(() => {
    const set = new Set<string>();
    for (const m of adminMatches) {
      if (m.status !== 'pending' && m.status !== 'validated') continue;
      const es = m.entreprise?.submissionId;
      const fs = m.etudiant?.submissionId;
      if (es && fs) set.add(`${es}|${fs}`);
    }
    return set;
  }, [adminMatches]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const [r1, r2, r3] = await Promise.all([
          apiClient.get<{ items: SubmissionSummary[] }>(`${API_ENDPOINTS.submissions}?target=entreprise`),
          apiClient.get<{ items: SubmissionSummary[] }>(
            `${API_ENDPOINTS.submissions}?target=etudiant`
          ),
          apiClient.get<{ items: AdminMatchListItem[] }>(API_ENDPOINTS.matches),
        ]);
        if (!cancelled) {
          setEntreprise(r1.data.items);
          setEtudiant(r2.data.items);
          setAdminMatches(r3.data.items);
        }
      } catch {
        if (!cancelled) setError(MESSAGE_CONFIG.errorGeneric);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setPicker(null);
      setEId('');
      setFId('');
      setError('');
      setSuccess(false);
    }
  }, [open]);

  const selectedE = entreprise.find((s) => s.id === eId);
  const selectedF = etudiant.find((s) => s.id === fId);

  const pairKey = eId && fId ? `${eId}|${fId}` : '';
  const isPairBlocked = Boolean(pairKey && blockedPairs.has(pairKey));

  const submit = async () => {
    setError('');
    setSuccess(false);
    if (!eId || !fId) {
      setError('Sélectionnez les deux profils.');
      return;
    }
    if (blockedPairs.has(`${eId}|${fId}`)) {
      setError(MESSAGE_CONFIG.matchPairConflict);
      return;
    }
    setLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.matches, {
        entrepriseSubmissionId: eId,
        etudiantSubmissionId: fId,
      });
      setSuccess(true);
      onCreated?.();
      try {
        const { data } = await apiClient.get<{ items: AdminMatchListItem[] }>(API_ENDPOINTS.matches);
        setAdminMatches(data.items);
      } catch {
        /* ignore */
      }
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        const msg = e.response.data as { error?: string };
        setError(typeof msg?.error === 'string' ? msg.error : MESSAGE_CONFIG.matchPairConflict);
      } else {
        setError(MESSAGE_CONFIG.errorGeneric);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      titleId="match-modal-title"
      panelMaxWidth={picker ? 'min(960px, 100%)' : 720}
    >
      <h2 id="match-modal-title" style={{ color: UI_CONFIG.colors.primary, marginTop: 0 }}>
        {MATCH_CONFIG.modalTitle}
      </h2>
      <p
        style={{
          marginTop: '-0.25rem',
          marginBottom: '0.5rem',
          fontSize: '0.88rem',
          color: `${UI_CONFIG.colors.black}99`,
          lineHeight: 1.45,
        }}
      >
        {MATCH_CONFIG.modalSubtitle}
      </p>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <span style={{ fontWeight: 600, display: 'block' }}>{MATCH_CONFIG.selectEntreprise}</span>
          <Button
            type="button"
            variant="outline"
            fullWidth
            style={{ marginTop: 8, padding: '0.55rem 0.85rem' }}
            onClick={() => setPicker('entreprise')}
          >
            {MATCH_CONFIG.chooseEntreprise}
          </Button>
          {selectedE ? (
            <p style={{ fontSize: '0.82rem', marginTop: 8, color: `${UI_CONFIG.colors.black}aa` }}>
              {MATCH_CONFIG.selectedLabel} : {selectedE.userEmail} — {selectedE.questionnaireTitle}
            </p>
          ) : null}
        </div>
        <div>
          <span style={{ fontWeight: 600, display: 'block' }}>{MATCH_CONFIG.selectEtudiant}</span>
          <Button
            type="button"
            variant="outline"
            fullWidth
            style={{ marginTop: 8, padding: '0.55rem 0.85rem' }}
            onClick={() => setPicker('etudiant')}
          >
            {MATCH_CONFIG.chooseClient}
          </Button>
          {selectedF ? (
            <p style={{ fontSize: '0.82rem', marginTop: 8, color: `${UI_CONFIG.colors.black}aa` }}>
              {MATCH_CONFIG.selectedLabel} : {selectedF.userEmail} — {selectedF.questionnaireTitle}
            </p>
          ) : null}
        </div>
      </div>
      <div style={{ marginTop: '1.25rem', display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
        <SummaryCard title="Entreprise" data={selectedE} />
        <SummaryCard title="Étudiant" data={selectedF} />
      </div>
      {isPairBlocked && !success ? (
        <p style={{ color: UI_CONFIG.colors.error, fontSize: '0.88rem', marginBottom: 0 }}>
          {MESSAGE_CONFIG.matchPairConflict}
        </p>
      ) : null}
      {error ? <p style={{ color: UI_CONFIG.colors.error }}>{error}</p> : null}
      {success ? <p style={{ color: UI_CONFIG.colors.success }}>{MESSAGE_CONFIG.matchDemandCreated}</p> : null}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
        <Button type="button" variant="outlineMuted" onClick={onClose} style={{ padding: '0.6rem 1rem' }}>
          Fermer
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={loading || isPairBlocked}
          onClick={() => void submit()}
          style={{ padding: '0.6rem 1.2rem' }}
        >
          {loading ? MESSAGE_CONFIG.loading : MATCH_CONFIG.confirmLabel}
        </Button>
      </div>

      {picker ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: UI_CONFIG.colors.white,
            zIndex: 2,
            borderRadius: UI_CONFIG.radii.lg,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <h3 style={{ margin: 0, color: UI_CONFIG.colors.primary, fontSize: '1.1rem' }}>
              {picker === 'entreprise'
                ? MATCH_CONFIG.pickerEntrepriseTitle
                : MATCH_CONFIG.pickerClientTitle}
            </h3>
            <Button
              type="button"
              variant="outlineMuted"
              onClick={() => setPicker(null)}
              style={{ padding: '0.45rem 0.9rem' }}
            >
              {MATCH_CONFIG.pickerClose}
            </Button>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: `${UI_CONFIG.colors.black}99` }}>
            Cliquez sur une ligne pour la sélectionner.
          </p>
          <Table
            rows={picker === 'entreprise' ? entreprise : etudiant}
            columns={submissionTableColumns}
            getRowId={(s) => s.id}
            selectedRowId={picker === 'entreprise' ? eId || null : fId || null}
            onRowClick={(s) => {
              if (picker === 'entreprise') setEId(s.id);
              else setFId(s.id);
              setPicker(null);
            }}
            pageSize={5}
            emptyLabel={MESSAGE_CONFIG.emptyList}
          />
        </div>
      ) : null}
    </Modal>
  );
};

function SummaryCard({ title, data }: { title: string; data?: SubmissionSummary }) {
  if (!data) return <div style={{ border: `1px dashed ${UI_CONFIG.colors.black}33`, minHeight: 120 }} />;
  return (
    <div
      style={{
        border: `1px solid ${UI_CONFIG.colors.black}18`,
        borderRadius: UI_CONFIG.radii.md,
        padding: '0.75rem',
        fontSize: '0.9rem',
      }}
    >
      <strong style={{ color: UI_CONFIG.colors.primary }}>{title}</strong>
      <p style={{ margin: '0.35rem 0' }}>Email : {data.userEmail}</p>
      {data.userDisplayName ? <p style={{ margin: '0.35rem 0' }}>Nom : {data.userDisplayName}</p> : null}
      <ProfileSnapshotReadout snapshot={data.profileSnapshot} />
      <AnswersReadout answers={data.answers} maxItems={8} />
    </div>
  );
}
