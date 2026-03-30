import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import { UI_CONFIG } from '@constants/variable.constant';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'outlineMuted'
  | 'outlineSecondary'
  | 'dashed'
  | 'ghost'
  /** Texte / bordure blancs sur fond sombre (ex. header). */
  | 'inverseOutline'
  /** Onglet ou segment sélectionnable (utiliser avec `active`). */
  | 'segment';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Avec `variant="segment"` : état actif. */
  active?: boolean;
};

const sizeStyles: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '0.35rem 0.75rem', fontSize: '0.85rem' },
  md: { padding: '0.6rem 1rem', fontSize: '0.95rem' },
  lg: { padding: '0.85rem 1.25rem', fontSize: '1rem' },
};

function variantStyles(variant: ButtonVariant, active?: boolean): CSSProperties {
  switch (variant) {
    case 'primary':
      return {
        background: UI_CONFIG.colors.primary,
        color: UI_CONFIG.colors.white,
        border: 'none',
      };
    case 'secondary':
      return {
        background: UI_CONFIG.colors.secondary,
        color: UI_CONFIG.colors.white,
        border: 'none',
      };
    case 'outline':
      return {
        background: UI_CONFIG.colors.white,
        color: UI_CONFIG.colors.primary,
        border: `1px solid ${UI_CONFIG.colors.primary}`,
      };
    case 'outlineMuted':
      return {
        background: UI_CONFIG.colors.white,
        color: UI_CONFIG.colors.black,
        border: `1px solid ${UI_CONFIG.colors.black}44`,
      };
    case 'outlineSecondary':
      return {
        background: UI_CONFIG.colors.white,
        color: UI_CONFIG.colors.secondary,
        border: `1px solid ${UI_CONFIG.colors.secondary}`,
      };
    case 'dashed':
      return {
        background: 'transparent',
        color: UI_CONFIG.colors.primary,
        border: `1px dashed ${UI_CONFIG.colors.primary}`,
      };
    case 'ghost':
      return {
        background: 'transparent',
        color: UI_CONFIG.colors.primary,
        border: `1px solid ${UI_CONFIG.colors.black}33`,
      };
    case 'inverseOutline':
      return {
        background: 'transparent',
        color: UI_CONFIG.colors.white,
        border: `1px solid ${UI_CONFIG.colors.white}`,
      };
    case 'segment':
      return active
        ? {
            background: UI_CONFIG.colors.primary,
            color: UI_CONFIG.colors.white,
            border: 'none',
          }
        : {
            background: UI_CONFIG.colors.white,
            color: UI_CONFIG.colors.primary,
            border: `1px solid ${UI_CONFIG.colors.black}22`,
          };
    default:
      return {};
  }
}

/**
 * Bouton unique du design system ; préférer ce composant aux `<button>` inline.
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth,
  active,
  disabled,
  style,
  type = 'button',
  ...rest
}: ButtonProps) => {
  const base: CSSProperties = {
    fontWeight: 600,
    borderRadius: UI_CONFIG.radii.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    boxSizing: 'border-box',
    ...(fullWidth ? { width: '100%', display: 'block' } : {}),
    ...sizeStyles[size],
    ...variantStyles(variant, active),
    ...style,
  };

  return <button type={type} disabled={disabled} style={base} {...rest} />;
};
