import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  API_ENDPOINTS,
  MESSAGE_CONFIG,
  ROUTE_PATHS,
  UI_CONFIG,
} from '@constants/variable.constant';
import { apiClient } from '../../api/client';
import { encryptAuthPasswordFields } from '../../security/clientPayloadCrypto';
import { Alert } from '../../items/Alert';
import { Button } from '../../items/Button';
import { CenteredPage } from '../../items/CenteredPage';
import { Input } from '../../items/Input';
import { SelectExpandPanel } from '../../items/SelectExpandPanel';
import { MatchModal } from '../../features/match/MatchModal';
import type { AuthUser } from '../../store/authStore';

type CreateAdminForm = {
  email: string;
  password: string;
  displayName: string;
  phone: string;
};

export function AdminDashboardPage() {
  const [matchOpen, setMatchOpen] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAdminForm>({
    defaultValues: { email: '', password: '', displayName: '', phone: '' },
  });

  const onCreateAdmin = async (values: CreateAdminForm) => {
    setApiError('');
    setApiSuccess('');
    try {
      const body = await encryptAuthPasswordFields(
        {
          email: values.email.trim(),
          password: values.password,
          displayName: values.displayName.trim(),
          phone: values.phone.trim() || undefined,
        },
        ['password']
      );
      await apiClient.post<{ user: AuthUser }>(API_ENDPOINTS.authRegisterAdmin, body);
      setApiSuccess(MESSAGE_CONFIG.adminUserCreated);
      reset();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setApiError(typeof msg === 'string' ? msg : MESSAGE_CONFIG.errorGeneric);
    }
  };

  return (
    <CenteredPage width="md">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          paddingBottom: '0.5rem',
        }}
      >
        <SelectExpandPanel
          title="Administration"
          subtitle="Accès rapide aux outils de gestion et aux demandes de mise en relation."
          defaultOpen
        >
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <li>
              <Link
                to={ROUTE_PATHS.adminQuestionnaires}
                style={{ fontWeight: 600, color: UI_CONFIG.colors.primaryLight }}
              >
                Gestion des questionnaires
              </Link>
            </li>
            <li>
              <Link
                to={ROUTE_PATHS.adminSubmissions}
                style={{ fontWeight: 600, color: UI_CONFIG.colors.primaryLight }}
              >
                Soumissions & réponses
              </Link>
            </li>
            <li>
              <Link
                to={ROUTE_PATHS.adminMatches}
                style={{ fontWeight: 600, color: UI_CONFIG.colors.primaryLight }}
              >
                Matchs & évaluations
              </Link>
            </li>
            <li style={{ marginTop: '0.35rem' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMatchOpen(true)}
                style={{ padding: '0.5rem 1rem' }}
              >
                Matcher
              </Button>
            </li>
          </ul>
        </SelectExpandPanel>

        <SelectExpandPanel
          title="Créer un administrateur"
          subtitle="Seuls les comptes admin peuvent ajouter un autre admin. L’inscription publique ne permet pas ce rôle."
        >
          <Alert show={Boolean(apiError)} variant="error" message={apiError} />
          <Alert
            show={Boolean(apiSuccess)}
            variant="success"
            message={apiSuccess}
            onDismiss={() => setApiSuccess('')}
          />
          <form onSubmit={handleSubmit(onCreateAdmin)} noValidate>
            <Input
              label="Nom affiché"
              required
              {...register('displayName', { required: MESSAGE_CONFIG.validationRequired })}
              error={errors.displayName?.message}
            />
            <Input
              label="E-mail"
              type="email"
              autoComplete="off"
              required
              {...register('email', { required: MESSAGE_CONFIG.validationRequired })}
              error={errors.email?.message}
            />
            <Input
              label="Téléphone"
              type="tel"
              autoComplete="off"
              {...register('phone', {
                maxLength: { value: 40, message: MESSAGE_CONFIG.validationPhoneMax },
              })}
              error={errors.phone?.message}
            />
            <Input
              label="Mot de passe initial"
              type="password"
              autoComplete="new-password"
              required
              {...register('password', {
                required: MESSAGE_CONFIG.validationRequired,
                minLength: { value: 8, message: MESSAGE_CONFIG.validationPasswordMin },
              })}
              error={errors.password?.message}
            />
            <p style={{ fontSize: '0.82rem', color: UI_CONFIG.forms.subtitleColor, marginTop: '-0.5rem' }}>
              Transmettez le mot de passe par un canal sécurisé.
            </p>
            <Button type="submit" variant="primary" disabled={isSubmitting} style={{ marginTop: '0.5rem' }}>
              {isSubmitting ? MESSAGE_CONFIG.loading : 'Créer le compte admin'}
            </Button>
          </form>
        </SelectExpandPanel>
      </div>
      <MatchModal open={matchOpen} onClose={() => setMatchOpen(false)} />
    </CenteredPage>
  );
}
