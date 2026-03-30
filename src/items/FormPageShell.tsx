import { motion } from 'framer-motion';
import { UI_CONFIG } from '@constants/variable.constant';

type FormPageShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const panelEnterTransition = {
  duration: UI_CONFIG.motion.panelEnterDuration,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const FormPageShell = ({ title, subtitle, children }: FormPageShellProps) => {
  const f = UI_CONFIG.forms;
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: f.shellMinHeight,
        padding: `${UI_CONFIG.spacing.pagePadding} 0`,
        boxSizing: 'border-box',
        background: 'transparent',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: UI_CONFIG.motion.panelEnterY }}
        animate={{ opacity: 1, y: 0 }}
        transition={panelEnterTransition}
        style={{
          width: '100%',
          maxWidth: f.shellMaxWidth,
        }}
      >
        <div
          style={{
            background: UI_CONFIG.colors.white,
            borderRadius: UI_CONFIG.radii.lg,
            boxShadow: f.cardShadow,
            border: f.cardBorder,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: f.accentBarHeight,
              background: `linear-gradient(90deg, ${UI_CONFIG.colors.secondary}, ${UI_CONFIG.colors.secondaryLight})`,
            }}
          />
          <div style={{ padding: f.cardPadding }}>
            <h1
              style={{
                margin: 0,
                marginBottom: subtitle ? '0.35rem' : f.titleMarginBottom,
                fontSize: f.titleSize,
                fontWeight: 700,
                color: UI_CONFIG.colors.primary,
                textAlign: 'center',
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>
            {subtitle ? (
              <p
                style={{
                  margin: 0,
                  marginBottom: '1.25rem',
                  textAlign: 'center',
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                  color: f.subtitleColor,
                }}
              >
                {subtitle}
              </p>
            ) : null}
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
