import { UI_CONFIG } from '@constants/variable.constant';

export function applyThemeToDocument(): void {
  const root = document.documentElement;
  const c = UI_CONFIG.colors;
  root.style.setProperty('--color-primary', c.primary);
  root.style.setProperty('--color-primary-light', c.primaryLight);
  root.style.setProperty('--color-secondary', c.secondary);
  root.style.setProperty('--color-secondary-light', c.secondaryLight);
  root.style.setProperty('--color-white', c.white);
  root.style.setProperty('--color-black', c.black);
  root.style.setProperty('--color-gray', c.gray);
  root.style.setProperty('--color-error', c.error);
  root.style.setProperty('--color-success', c.success);
  root.style.setProperty('--radius-md', UI_CONFIG.radii.md);
  root.style.setProperty('--header-height', UI_CONFIG.spacing.headerHeight);
}
