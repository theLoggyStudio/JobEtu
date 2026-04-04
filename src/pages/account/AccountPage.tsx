import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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
import { Tel } from '../../items/Tel';
import { INTERNATIONAL_TEL_REGEX } from '../../utils/internationalTel';
import { SelectExpandPanel } from '../../items/SelectExpandPanel';
import type { AuthUser } from '../../store/authStore';
import { useAuthStore } from '../../store/authStore';

const DELETE_CONFIRM_PHRASE = 'SUPPRIMER';

type ProfileForm = {
  displayName: string;
  phone: string;
  email: string;
  newPassword: string;
  currentPassword: string;
};

type DeleteForm = {
  currentPassword: string;
  confirmPhrase: string;
};

function apiErrorMessage(err: unknown, fallback: string): string {
  const msg =
    err && typeof err === 'object' && 'response' in err
      ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
      : undefined;
  return typeof msg === 'string' ? msg : fallback;
}

export function AccountPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      displayName: '',
      phone: '',
      email: '',
      newPassword: '',
      currentPassword: '',
    },
  });

  const deleteForm = useForm<DeleteForm>({
    defaultValues: { currentPassword: '', confirmPhrase: '' },
  });

  const { register: regProfile, handleSubmit: submitProfile, reset: resetProfile, formState: profileFs } =
    profileForm;
  const { register: regDelete, handleSubmit: submitDelete, reset: resetDelete, formState: deleteFs } =
    deleteForm;

  useEffect(() => {
    if (!user) return;
    resetProfile({
      displayName: user.displayName ?? '',
      phone: user.phone ?? '',
      email: user.email,
      newPassword: '',
      currentPassword: '',
    });
  }, [user, resetProfile]);

  const onUpdateProfile = async (values: ProfileForm) => {
    setProfileError('');
    setProfileSuccess('');
    const phoneTrim = values.phone.trim();
    const body: {
      currentPassword: string;
      displayName: string;
      email: string;
      phone: string | null;
      newPassword?: string;
    } = {
      currentPassword: values.currentPassword,
      displayName: values.displayName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: phoneTrim === '' ? null : phoneTrim,
    };
    if (values.newPassword.trim()) {
      body.newPassword = values.newPassword.trim();
    }
    const keys: ('currentPassword' | 'newPassword')[] = ['currentPassword'];
    if (body.newPassword != null && body.newPassword.length > 0) {
      keys.push('newPassword');
    }
    try {
      const payload = await encryptAuthPasswordFields(body, keys);
      const { data } = await apiClient.patch<{ user: AuthUser }>(API_ENDPOINTS.authMe, payload);
      setUser(data.user);
      resetProfile({
        displayName: data.user.displayName ?? '',
        phone: data.user.phone ?? '',
        email: data.user.email,
        newPassword: '',
        currentPassword: '',
      });
      setProfileSuccess(MESSAGE_CONFIG.profileUpdated);
    } catch (err: unknown) {
      setProfileError(apiErrorMessage(err, MESSAGE_CONFIG.errorGeneric));
    }
  };

  const onDeleteAccount = async (values: DeleteForm) => {
    setDeleteError('');
    try {
      const delBody = await encryptAuthPasswordFields(
        { currentPassword: values.currentPassword },
        ['currentPassword']
      );
      await apiClient.delete(API_ENDPOINTS.authMe, { data: delBody });
      clearAuth();
      resetDelete();
      navigate(ROUTE_PATHS.home, { replace: true });
    } catch (err: unknown) {
      setDeleteError(apiErrorMessage(err, MESSAGE_CONFIG.errorGeneric));
    }
  };

  if (!user) {
    return null;
  }

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
          title="Modifier mes informations"
          subtitle="Nom, coordonnées et mot de passe. Votre mot de passe actuel est demandé pour confirmer les changements."
          defaultOpen
        >
          <Alert show={Boolean(profileError)} variant="error" message={profileError} />
          <Alert show={Boolean(profileSuccess)} variant="success" message={profileSuccess} />
          <form onSubmit={submitProfile(onUpdateProfile)} noValidate>
            <Input
              label="Nom affiché"
              required
              autoComplete="name"
              {...regProfile('displayName', { required: MESSAGE_CONFIG.validationRequired })}
              error={profileFs.errors.displayName?.message}
            />
            <Tel
              label="Téléphone"
              autoComplete="tel"
              {...regProfile('phone', {
                validate: (v) => {
                  const t = String(v).trim();
                  if (t === '') return true;
                  return INTERNATIONAL_TEL_REGEX.test(t) || MESSAGE_CONFIG.validationInternationalTel;
                },
              })}
              error={profileFs.errors.phone?.message}
            />
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              required
              {...regProfile('email', { required: MESSAGE_CONFIG.validationRequired })}
              error={profileFs.errors.email?.message}
            />
            <Input
              label="Nouveau mot de passe (optionnel)"
              type="password"
              autoComplete="new-password"
              {...regProfile('newPassword', {
                minLength: { value: 8, message: MESSAGE_CONFIG.validationPasswordMin },
              })}
              error={profileFs.errors.newPassword?.message}
            />
            <Input
              label="Mot de passe actuel"
              type="password"
              autoComplete="current-password"
              required
              {...regProfile('currentPassword', { required: MESSAGE_CONFIG.validationRequired })}
              error={profileFs.errors.currentPassword?.message}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={profileFs.isSubmitting}
              style={{ marginTop: '0.5rem' }}
            >
              {profileFs.isSubmitting ? MESSAGE_CONFIG.loading : 'Enregistrer les modifications'}
            </Button>
          </form>
        </SelectExpandPanel>

        <SelectExpandPanel
          title="Supprimer mon compte"
          subtitle="Action irréversible : vos données liées au compte seront supprimées selon les règles de la plateforme."
          overlapTopPx={24}
        >
          <Alert show={Boolean(deleteError)} variant="error" message={deleteError} />
          <form onSubmit={submitDelete(onDeleteAccount)} noValidate>
            <Input
              label="Mot de passe actuel"
              type="password"
              autoComplete="current-password"
              required
              {...regDelete('currentPassword', { required: MESSAGE_CONFIG.validationRequired })}
              error={deleteFs.errors.currentPassword?.message}
            />
            <Input
              label={`Tapez ${DELETE_CONFIRM_PHRASE} pour confirmer`}
              autoComplete="off"
              required
              {...regDelete('confirmPhrase', {
                required: MESSAGE_CONFIG.validationRequired,
                validate: (v) =>
                  v === DELETE_CONFIRM_PHRASE ? true : 'Saisissez exactement le mot indiqué ci-dessus.',
              })}
              error={deleteFs.errors.confirmPhrase?.message}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={deleteFs.isSubmitting}
              style={{
                marginTop: '0.5rem',
                background: UI_CONFIG.colors.error,
                borderColor: UI_CONFIG.colors.error,
              }}
            >
              {deleteFs.isSubmitting ? MESSAGE_CONFIG.loading : 'Supprimer définitivement mon compte'}
            </Button>
          </form>
        </SelectExpandPanel>
      </div>
    </CenteredPage>
  );
}
