import { create } from 'zustand';
import { API_ENDPOINTS, ROLE_CONFIG, ROUTE_PATHS, SECURITY_CONFIG } from '@constants/variable.constant';
import type { UserRole } from '@constants/types.constant';
import { apiClient } from '../api/client';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  displayName: string | null;
  phone: string | null;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  hydrateFromStorage: () => void;
  restoreSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    localStorage.setItem(SECURITY_CONFIG.tokenStorageKey, token);
    set({ user, token });
  },
  setUser: (user) => set({ user }),
  clearAuth: () => {
    localStorage.removeItem(SECURITY_CONFIG.tokenStorageKey);
    set({ user: null, token: null });
  },
  hydrateFromStorage: () => {
    const token = localStorage.getItem(SECURITY_CONFIG.tokenStorageKey);
    set({ token });
  },
  restoreSession: async () => {
    const token = localStorage.getItem(SECURITY_CONFIG.tokenStorageKey);
    if (!token) {
      set({ user: null, token: null });
      return;
    }
    try {
      const { data } = await apiClient.get<{ user: AuthUser }>(API_ENDPOINTS.authMe);
      set({ user: data.user, token });
    } catch {
      localStorage.removeItem(SECURITY_CONFIG.tokenStorageKey);
      set({ user: null, token: null });
    }
  },
}));

export function roleHomePath(role: UserRole): string {
  if (role === ROLE_CONFIG.admin) return ROUTE_PATHS.adminDashboard;
  if (role === ROLE_CONFIG.entreprise) return ROUTE_PATHS.entrepriseDashboard;
  return ROUTE_PATHS.etudiantDashboard;
}
