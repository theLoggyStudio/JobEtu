import type { CSSProperties, ElementType, ReactNode } from 'react';
import { UI_CONFIG } from '@constants/variable.constant';

export type TextPanelProps = {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  /** Ombre type carte (défaut : non, bloc de texte discret) */
  elevated?: boolean;
  /** Padding réduit (messages courts, chargement) */
  compact?: boolean;
  as?: 'div' | 'section' | 'article';
};

/**
 * Fond blanc + cadre pour tout bloc de texte / formulaire hors carte existante.
 * Ne pas imbriquer dans un `Panel` ou `FormPageShell` déjà blanc.
 */
export function TextPanel({
  children,
  style,
  className,
  elevated = false,
  compact = false,
  as,
}: TextPanelProps) {
  const Tag = (as ?? 'div') as ElementType;
  return (
    <Tag
      className={className}
      style={{
        background: UI_CONFIG.colors.white,
        borderRadius: UI_CONFIG.radii.lg,
        border: UI_CONFIG.forms.cardBorder,
        boxShadow: elevated ? UI_CONFIG.forms.cardShadow : 'none',
        padding: compact ? '1rem 1.15rem' : UI_CONFIG.forms.cardPadding,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
