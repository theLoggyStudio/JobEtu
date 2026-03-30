import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UI_CONFIG } from '@constants/variable.constant';

const COPYRIGHT_LINE = 'Loggy-studio · JobEtu';

const SCROLL_DELTA = 8;
const TOP_HIDE_THRESHOLD = 48;

type NavBottomProps = {
  /** Pour ajuster le padding du contenu quand la barre est visible */
  onVisibleChange?: (visible: boolean) => void;
};

/**
 * Barre fixe en bas : visible lorsque l’utilisateur fait défiler vers le bas,
 * masquée en haut de page ou lors d’un scroll vers le haut.
 */
export function NavBottom({ onVisibleChange }: NavBottomProps) {
  const [visible, setVisible] = useState(false);
  const lastY = useRef(0);
  const visibleRef = useRef(false);
  const ticking = useRef(false);
  const onVisibleChangeRef = useRef(onVisibleChange);
  onVisibleChangeRef.current = onVisibleChange;

  useEffect(() => {
    lastY.current = window.scrollY;
  }, []);

  useEffect(() => {
    const apply = () => {
      ticking.current = false;
      const y = window.scrollY;
      const prev = lastY.current;
      const delta = y - prev;
      lastY.current = y;

      let next = visibleRef.current;
      if (y < TOP_HIDE_THRESHOLD) {
        next = false;
      } else if (delta > SCROLL_DELTA) {
        next = true;
      } else if (delta < -SCROLL_DELTA) {
        next = false;
      }

      if (next !== visibleRef.current) {
        visibleRef.current = next;
        setVisible(next);
        onVisibleChangeRef.current?.(next);
      }
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(apply);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.nav
          key="nav-bottom"
          id="nav-bottom"
          role="contentinfo"
          aria-label="Copyright"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'tween', duration: UI_CONFIG.motion.pageTransition }}
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            height: UI_CONFIG.spacing.navBottomHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `0 ${UI_CONFIG.spacing.pagePadding}`,
            background: `${UI_CONFIG.colors.primary}f2`,
            color: UI_CONFIG.colors.white,
            fontSize: '0.78rem',
            letterSpacing: '0.02em',
            zIndex: UI_CONFIG.zIndex.navBottom,
            boxShadow: '0 -4px 20px rgba(10, 10, 10, 0.12)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {COPYRIGHT_LINE}
        </motion.nav>
      ) : null}
    </AnimatePresence>
  );
}
