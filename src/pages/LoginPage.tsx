import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  API_ENDPOINTS,
  MESSAGE_CONFIG,
  ROUTE_PATHS,
  UI_CONFIG,
} from '@constants/variable.constant';
import { apiClient } from '../api/client';
import { encryptAuthPasswordFields } from '../security/clientPayloadCrypto';
import { Alert } from '../items/Alert';
import { Button } from '../items/Button';
import { FormPageShell } from '../items/FormPageShell';
import { Input } from '../items/Input';
import { useAuthStore, roleHomePath } from '../store/authStore';
import type { AuthUser } from '../store/authStore';

type FormValues = { email: string; password: string };

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
  const setAuth = useAuthStore((s) => s.setAuth);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (values: FormValues) => {
    setApiError('');
    try {
      const payload = await encryptAuthPasswordFields({ ...values }, ['password']);
      const { data } = await apiClient.post<{ token: string; user: AuthUser }>(
        API_ENDPOINTS.authLogin,
        payload
      );
      setAuth(data.user, data.token);
      navigate(from ?? roleHomePath(data.user.role), { replace: true });
    } catch {
      setApiError(MESSAGE_CONFIG.errorGeneric);
    }
  };

  return (
    <FormPageShell
      title="Connexion"
      subtitle="Accédez à votre espace entreprise, étudiant ou admin."
    >
      <Alert show={Boolean(apiError)} variant="error" message={apiError} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          {...register('email', { required: MESSAGE_CONFIG.validationRequired })}
          error={errors.email?.message}
        />
        <Input
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          required
          {...register('password', { required: MESSAGE_CONFIG.validationRequired })}
          error={errors.password?.message}
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={isSubmitting}
          style={{ marginTop: '0.25rem' }}
        >
          {isSubmitting ? MESSAGE_CONFIG.loading : 'Se connecter'}
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
        Pas encore de compte ?{' '}
        <Link to={ROUTE_PATHS.register} style={{ fontWeight: 600 }}>
          Inscription
        </Link>
      </p>
    </FormPageShell>
  );
}
