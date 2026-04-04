import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { API_ENDPOINTS, MESSAGE_CONFIG, UI_CONFIG } from '@constants/variable.constant';
import { PAYDUNYA_UI_CONFIG } from '@constants/paydunya.constant';
import { apiClient } from '../../api/client';
import { Button } from '../../items/Button';
import { CenteredPage } from '../../items/CenteredPage';
import { Panel } from '../../items/Panel';
import { roleHomePath, useAuthStore } from '../../store/authStore';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function PaiementSoumissionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [phase, setPhase] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const runConfirm = useCallback(async () => {
    if (!sessionId || !token) {
      setPhase('error');
      setErrorMsg(PAYDUNYA_UI_CONFIG.missingToken);
      return;
    }
    const url = API_ENDPOINTS.submissionsPaydunyaConfirm(sessionId);
    const maxTries = 10;
    for (let i = 0; i < maxTries; i++) {
      try {
        const { data } = await apiClient.get<{ id?: string; status?: string }>(url, {
          params: { token },
        });
        if (data.status === 'completed' && data.id) {
          setPhase('success');
          return;
        }
        if (data.status === 'pending') {
          await sleep(2000);
          continue;
        }
      } catch (e) {
        const msg =
          axios.isAxiosError(e) && e.response?.data && typeof e.response.data === 'object'
            ? String((e.response.data as { error?: string }).error ?? '')
            : '';
        setPhase('error');
        setErrorMsg(msg || MESSAGE_CONFIG.errorGeneric);
        return;
      }
    }
    setPhase('error');
    setErrorMsg(PAYDUNYA_UI_CONFIG.paymentErrorTitle);
  }, [sessionId, token]);

  useEffect(() => {
    void runConfirm();
  }, [runConfirm]);

  const home = user ? roleHomePath(user.role) : '/';  

  if (phase === 'success') {
    return (
      <CenteredPage width="sm" softBg>
        <Panel>
          <h2 style={{ color: UI_CONFIG.colors.success, marginTop: 0 }}>
            {PAYDUNYA_UI_CONFIG.paymentSuccessTitle}
          </h2>
          <p style={{ color: UI_CONFIG.forms.subtitleColor, lineHeight: 1.5 }}>
            {PAYDUNYA_UI_CONFIG.paymentSuccessBody}
          </p>
          <p style={{ color: UI_CONFIG.forms.subtitleColor }}>{MESSAGE_CONFIG.successSaved}</p>
          <Button type="button" variant="primary" onClick={() => navigate(home)} style={{ marginTop: 16 }}>
            Retour au tableau de bord
          </Button>
        </Panel>
      </CenteredPage>
    );
  }

  if (phase === 'error') {
    return (
      <CenteredPage width="sm" softBg>
        <Panel>
          <h2 style={{ color: UI_CONFIG.colors.error, marginTop: 0 }}>
            {PAYDUNYA_UI_CONFIG.paymentErrorTitle}
          </h2>
          <p style={{ lineHeight: 1.5 }}>{errorMsg}</p>
          <Button type="button" variant="outline" onClick={() => navigate(home)} style={{ marginTop: 16 }}>
            Retour au tableau de bord
          </Button>
        </Panel>
      </CenteredPage>
    );
  }

  return (
    <CenteredPage width="sm" softBg>
      <Panel compact>
        <h2 style={{ color: UI_CONFIG.colors.primary, marginTop: 0 }}>
          {PAYDUNYA_UI_CONFIG.paymentPendingTitle}
        </h2>
        <p style={{ textAlign: 'center', margin: 0, color: UI_CONFIG.forms.subtitleColor, lineHeight: 1.5 }}>
          {PAYDUNYA_UI_CONFIG.paymentPendingBody}
        </p>
        <p style={{ textAlign: 'center', marginTop: 12 }}>{MESSAGE_CONFIG.loading}</p>
      </Panel>
    </CenteredPage>
  );
}
