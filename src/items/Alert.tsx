import { motion, AnimatePresence } from 'framer-motion';
import { UI_CONFIG } from '@constants/variable.constant';

type Variant = 'success' | 'error' | 'info';

type AlertProps = {
  show: boolean;
  variant: Variant;
  message: string;
};

const colors: Record<Variant, string> = {
  success: UI_CONFIG.colors.success,
  error: UI_CONFIG.colors.error,
  info: UI_CONFIG.colors.primary,
};

export const Alert = ({ show, variant, message }: AlertProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: UI_CONFIG.motion.alertDuration }}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: UI_CONFIG.radii.md,
            background: UI_CONFIG.colors.gray,
            borderLeft: `4px solid ${colors[variant]}`,
            color: UI_CONFIG.colors.black,
            marginBottom: '1rem',
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
