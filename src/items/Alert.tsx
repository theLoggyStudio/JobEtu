import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UI_CONFIG } from '@constants/variable.constant';

type Variant = 'success' | 'error' | 'info';

type AlertProps = {
  show: boolean;
  variant: Variant;
  message: string;
  /** Délai avant masquage (ms). Par défaut : 3000 pour success/info, pas d’auto-hide pour error. */
  autoHideMs?: number;
  /** Appelé après la disparition automatique (pour vider le state parent). */
  onDismiss?: () => void;
};

const colors: Record<Variant, string> = {
  success: UI_CONFIG.colors.success,
  error: UI_CONFIG.colors.error,
  info: UI_CONFIG.colors.primary,
};

const DEFAULT_AUTO_HIDE_SUCCESS_MS = 3000;

export const Alert = ({ show, variant, message, autoHideMs, onDismiss }: AlertProps) => {
  const [visuallyHidden, setVisuallyHidden] = useState(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const resolvedHideMs =
    autoHideMs !== undefined
      ? autoHideMs
      : variant === 'error'
        ? undefined
        : DEFAULT_AUTO_HIDE_SUCCESS_MS;

  useEffect(() => {
    if (!show) {
      setVisuallyHidden(false);
      return;
    }
    setVisuallyHidden(false);
    if (resolvedHideMs === undefined || resolvedHideMs <= 0) return undefined;
    const t = window.setTimeout(() => {
      setVisuallyHidden(true);
      onDismissRef.current?.();
    }, resolvedHideMs);
    return () => window.clearTimeout(t);
  }, [show, message, variant, resolvedHideMs]);

  const visible = show && !visuallyHidden && message.trim() !== '';

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key={`${variant}-${message.slice(0, 48)}`}
          role="alert"
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: UI_CONFIG.motion.alertDuration }}
          style={{
            position: 'fixed',
            top: `calc(${UI_CONFIG.spacing.headerHeight} + 10px)`,
            left: UI_CONFIG.spacing.pagePadding,
            right: UI_CONFIG.spacing.pagePadding,
            zIndex: UI_CONFIG.zIndex.toast,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            pointerEvents: 'none',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              pointerEvents: 'auto',
              maxWidth: 'min(100%, 36rem)',
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: UI_CONFIG.radii.md,
              background: UI_CONFIG.colors.gray,
              borderLeft: `4px solid ${colors[variant]}`,
              color: UI_CONFIG.colors.black,
              boxShadow: `0 8px 24px ${UI_CONFIG.colors.black}18`,
            }}
          >
            {message}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
