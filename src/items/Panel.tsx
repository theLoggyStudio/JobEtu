import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { UI_CONFIG } from '@constants/variable.constant';

const panelEnterTransition = {
  duration: UI_CONFIG.motion.panelEnterDuration,
  ease: [0.22, 1, 0.36, 1] as const,
};

type PanelProps = {
  children: ReactNode;
  /** Styles additionnels (fusionnés après le cadre de base). */
  style?: CSSProperties;
  className?: string;
  /** Si vrai : pas d’ombre, uniquement bordure + fond. */
  flat?: boolean;
};

/**
 * Cadre type carte (bordure, fond blanc, coins arrondis) — dashboards, sections admin, etc.
 * Entrée : fondu + translation du bas vers le haut.
 */
export function Panel({ children, style, className, flat = false }: PanelProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: UI_CONFIG.motion.panelEnterY }}
      animate={{ opacity: 1, y: 0 }}
      transition={panelEnterTransition}
      style={{
        padding: UI_CONFIG.forms.cardPadding,
        borderRadius: UI_CONFIG.radii.lg,
        border: UI_CONFIG.forms.cardBorder,
        background: UI_CONFIG.colors.white,
        boxShadow: flat ? 'none' : UI_CONFIG.forms.cardShadow,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
