import type { CSSProperties, ElementType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { UI_CONFIG } from '@constants/variable.constant';

const panelEnterTransition = {
  duration: UI_CONFIG.motion.panelEnterDuration,
  ease: [0.22, 1, 0.36, 1] as const,
};

const compactPadding = '1rem 1.15rem';

export type PanelProps = {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  /** Sans ombre ni relief (carte plate). */
  flat?: boolean;
  /**
   * Ombre type carte. Par défaut `false` (blocs de texte discrets).
   * Passez `true` pour les cartes mises en avant (dashboards, accueil).
   */
  elevated?: boolean;
  /** Padding réduit (messages courts, chargement). */
  compact?: boolean;
  /** Aucun padding (mise en page interne, ex. logo + onglets). */
  flush?: boolean;
  as?: 'div' | 'section' | 'article';
  id?: string;
  /** Entrée : fondu + translation du bas vers le haut. */
  animated?: boolean;
};

function panelPadding(flush: boolean, compact: boolean): string {
  if (flush) return '0';
  if (compact) return compactPadding;
  return UI_CONFIG.forms.cardPadding;
}

function panelShadow(flat: boolean, elevated: boolean): string {
  if (flat) return 'none';
  return elevated ? UI_CONFIG.forms.cardShadow : 'none';
}

/**
 * Carte / panneau unique du projet : fond blanc, bordure, option ombre et animation.
 * Remplace l’ancien duo `Panel` + `TextPanel`.
 */
export function Panel({
  children,
  style,
  className,
  flat = false,
  elevated = false,
  compact = false,
  flush = false,
  as,
  id,
  animated = false,
}: PanelProps) {
  const Tag = (as ?? 'div') as ElementType;
  const padding = panelPadding(flush, compact);
  const boxShadow = panelShadow(flat, elevated);

  const baseStyle: CSSProperties = {
    padding,
    borderRadius: UI_CONFIG.radii.lg,
    border: UI_CONFIG.forms.cardBorder,
    background: UI_CONFIG.colors.white,
    boxShadow,
    ...style,
  };

  if (animated) {
    if (as === 'section') {
      return (
        <motion.section
          id={id}
          className={className}
          initial={{ opacity: 0, y: UI_CONFIG.motion.panelEnterY }}
          animate={{ opacity: 1, y: 0 }}
          transition={panelEnterTransition}
          style={baseStyle}
        >
          {children}
        </motion.section>
      );
    }
    if (as === 'article') {
      return (
        <motion.article
          id={id}
          className={className}
          initial={{ opacity: 0, y: UI_CONFIG.motion.panelEnterY }}
          animate={{ opacity: 1, y: 0 }}
          transition={panelEnterTransition}
          style={baseStyle}
        >
          {children}
        </motion.article>
      );
    }
    return (
      <motion.div
        id={id}
        className={className}
        initial={{ opacity: 0, y: UI_CONFIG.motion.panelEnterY }}
        animate={{ opacity: 1, y: 0 }}
        transition={panelEnterTransition}
        style={baseStyle}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <Tag id={id} className={className} style={baseStyle}>
      {children}
    </Tag>
  );
}
