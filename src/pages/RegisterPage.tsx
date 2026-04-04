import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  API_ENDPOINTS,
  MESSAGE_CONFIG,
  postRegisterAbsoluteDashboardUrl,
  ROLE_CONFIG,
  ROUTE_PATHS,
  UI_CONFIG,
} from '@constants/variable.constant';
import type { UserRole } from '@constants/types.constant';
import { apiClient } from '../api/client';
import { encryptAuthPasswordFields } from '../security/clientPayloadCrypto';
import { Alert } from '../items/Alert';
import { Button } from '../items/Button';
import { FormPageShell } from '../items/FormPageShell';
import { Input, RequiredAsterisk } from '../items/Input';
import { Tel } from '../items/Tel';
import { useAuthStore } from '../store/authStore';
import type { AuthUser } from '../store/authStore';
import { INTERNATIONAL_TEL_REGEX } from '../utils/internationalTel';

type FormValues = {
  email: string;
  password: string;
  displayName: string;
  phone: string;
  role: UserRole;
};

const roleOptions: { value: UserRole; label: string }[] = [
  { value: ROLE_CONFIG.entreprise, label: 'Entreprise' },
  { value: ROLE_CONFIG.etudiant, label: 'Étudiant' },
  { value: ROLE_CONFIG.particulier, label: 'Particulier' },
];

export function RegisterPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
      phone: '',
      role: ROLE_CONFIG.entreprise,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setApiError('');
    try {
      const payload = await encryptAuthPasswordFields({ ...values }, ['password']);
      const { data } = await apiClient.post<{ token: string; user: AuthUser }>(
        API_ENDPOINTS.authRegister,
        payload
      );
      setAuth(data.user, data.token);
      const target = new URL(postRegisterAbsoluteDashboardUrl(data.user.role));
      target.searchParams.set('welcome', '1');
      window.location.assign(target.href);
    } catch {
      setApiError(MESSAGE_CONFIG.errorGeneric);
    }
  };

  return (
    <FormPageShell
      title="Inscription"
      subtitle="Créez un compte entreprise, étudiant ou particulier pour accéder aux questionnaires OneJob."
    >
      <Alert show={Boolean(apiError)} variant="error" message={apiError} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Nom affiché"
          required
          {...register('displayName', { required: MESSAGE_CONFIG.validationRequired })}
          error={errors.displayName?.message}
        />
        <Tel
          label="Téléphone (WhatsApp)"
          required
          {...register('phone', {
            required: MESSAGE_CONFIG.validationRequired,
            validate: (v) =>
              INTERNATIONAL_TEL_REGEX.test(String(v).trim()) || MESSAGE_CONFIG.validationInternationalTel,
          })}
          error={errors.phone?.message}
        />
        <Input
          label="Email"
          type="email"
          required
          {...register('email', { required: MESSAGE_CONFIG.validationRequired })}
          error={errors.email?.message}
        />
        <Input
          label="Mot de passe"
          type="password"
          required
          {...register('password', {
            required: MESSAGE_CONFIG.validationRequired,
            minLength: { value: 8, message: MESSAGE_CONFIG.validationPasswordMin },
          })}
          error={errors.password?.message}
        />
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <span
            style={{
              display: 'block',
              fontWeight: 600,
              marginBottom: 6,
              color: UI_CONFIG.colors.primary,
            }}
          >
            Type de compte
            <RequiredAsterisk />
          </span>
          <select
            {...register('role')}
            required
            style={{
              display: 'block',
              marginTop: 8,
              padding: '0.65rem 0.85rem',
              borderRadius: UI_CONFIG.radii.sm,
              width: '100%',
              border: `1px solid ${UI_CONFIG.colors.black}22`,
              background: UI_CONFIG.colors.white,
              boxSizing: 'border-box',
            }}
          >
            {roleOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          fullWidth
          disabled={isSubmitting}
          style={{ marginTop: '0.25rem' }}
        >
          {isSubmitting ? MESSAGE_CONFIG.loading : "S'inscrire"}
        </Button>
      </form>
      <p
        style={{
          marginTop: '1.35rem',
          marginBottom: 0,
          textAlign: 'center',
          fontSize: '0.95rem',
          color: UI_CONFIG.forms.subtitleColor,
        }}
      >
        Déjà inscrit ?{' '}
        <Link to={ROUTE_PATHS.login} style={{ fontWeight: 600 }}>
          Connexion
        </Link>
      </p>
    </FormPageShell>
  );
}
