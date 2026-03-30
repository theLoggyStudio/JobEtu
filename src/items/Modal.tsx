import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { UI_CONFIG } from '@constants/variable.constant';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** id pour aria-labelledby */
  titleId?: string;
  /** Largeur max du panneau (nombre = px, ou chaîne CSS). */
  panelMaxWidth?: number | string;
  panelStyle?: CSSProperties;
};

export const Modal = ({
  open,
  onClose,
  children,
  titleId,
  panelMaxWidth = 720,
  panelStyle,
}: ModalProps) => {
  const maxW =
    typeof panelMaxWidth === 'number' ? `${panelMaxWidth}px` : panelMaxWidth;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          style={{
            position: 'fixed',
            inset: 0,
            background: `${UI_CONFIG.colors.black}99`,
            zIndex: UI_CONFIG.zIndex.modal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: UI_CONFIG.spacing.pagePadding,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby={titleId}
            onClick={(ev) => ev.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: UI_CONFIG.motion.pageTransition }}
            style={{
              position: 'relative',
              background: UI_CONFIG.colors.white,
              maxWidth: maxW,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              borderRadius: UI_CONFIG.radii.lg,
              padding: '1.25rem',
              ...panelStyle,
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
};
