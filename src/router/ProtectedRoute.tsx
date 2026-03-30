import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTE_PATHS } from '@constants/variable.constant';
import type { UserRole } from '@constants/types.constant';
import { MESSAGE_CONFIG } from '@constants/variable.constant';
import { useAuthStore, roleHomePath } from '../store/authStore';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '@constants/variable.constant';

type Props = {
  children: React.ReactNode;
  roles: UserRole[];
};

export function ProtectedRoute({ children, roles }: Props) {
  const location = useLocation();
  const { user, token, setAuth, clearAuth, hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!token || user) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.get<{ user: typeof user }>(API_ENDPOINTS.authMe);
        if (!cancelled && data.user) setAuth(data.user, token);
      } catch {
        if (!cancelled) clearAuth();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, user, setAuth, clearAuth]);

  if (!token) {
    return <Navigate to={ROUTE_PATHS.login} state={{ from: location }} replace />;
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        {MESSAGE_CONFIG.loading}
      </div>
    );
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  return <>{children}</>;
}
