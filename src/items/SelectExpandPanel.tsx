import type { ReactNode } from 'react';
import { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UI_CONFIG } from '@constants/variable.constant';

export type SelectExpandPanelProps = {
  /** Titre affiché sur la ligne « select » */
  title: string;
  /** Texte secondaire sous le titre (optionnel) */
  subtitle?: string;
  children: ReactNode;
  /** Ouvert au montage */
  defaultOpen?: boolean;
  /**
   * Marge négative haute (px) pour chevaucher visuellement le panneau au-dessus.
   * Le 2ᵉ panneau utilise typiquement 20–28.
   */
  overlapTopPx?: number;
};

/**
 * Volet blanc indépendant : en-tête cliquable (style select) + contenu repliable.
 * Plusieurs instances peuvent être superposées (`overlapTopPx`) ; chaque état ouvert/fermé est local.
 */
export function SelectExpandPanel({
  title,
  subtitle,
  children,
  defaultOpen = false,
  overlapTopPx = 0,
}: SelectExpandPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const uid = useId().replace(/:/g, '');
  const panelId = `select-expand-${uid}`;

  return (
    <div
      style={{
        marginTop: overlapTopPx ? -overlapTopPx : 0,
        position: 'relative',
        zIndex: open ? 3 : 2,
      }}
    >
      <div
        style={{
          background: UI_CONFIG.colors.white,
          borderRadius: UI_CONFIG.radii.lg,
          border: UI_CONFIG.forms.cardBorder,
          boxShadow: open ? UI_CONFIG.forms.cardShadow : '0 4px 14px rgba(10, 10, 10, 0.06)',
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          id={`${panelId}-trigger`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.85rem 1.1rem',
            border: 'none',
            background: UI_CONFIG.colors.white,
            cursor: 'pointer',
            font: 'inherit',
            textAlign: 'left',
          }}
        >
          <span style={{ minWidth: 0 }}>
            <span
              style={{
                display: 'block',
                fontWeight: 700,
                fontSize: UI_CONFIG.forms.titleSize,
                color: UI_CONFIG.colors.primary,
              }}
            >
              {title}
            </span>
            {subtitle ? (
              <span
                style={{
                  display: 'block',
                  marginTop: 4,
                  fontSize: '0.88rem',
                  lineHeight: 1.45,
                  color: UI_CONFIG.forms.subtitleColor,
                }}
              >
                {subtitle}
              </span>
            ) : null}
          </span>
          <motion.span
            aria-hidden
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: UI_CONFIG.motion.pageTransition * 0.85 }}
            style={{
              flexShrink: 0,
              fontSize: '0.65rem',
              color: UI_CONFIG.colors.primary,
              opacity: 0.85,
            }}
          >
            ▼
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              key="body"
              id={panelId}
              role="region"
              aria-labelledby={`${panelId}-trigger`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: UI_CONFIG.motion.inputExpandDuration, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                style={{
                  borderTop: `1px solid ${UI_CONFIG.colors.black}10`,
                  padding: '1rem 1.35rem 1.35rem',
                }}
              >
                {children}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
