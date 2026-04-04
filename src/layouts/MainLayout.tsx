import type { CSSProperties } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { UI_CONFIG } from '@constants/variable.constant';
import { NavBottom } from './NavBottom';
import { NavTop } from './NavTop';

export function MainLayout() {
  const [navBottomVisible, setNavBottomVisible] = useState(false);

  const mainStyle: CSSProperties = {
    flex: 1,
    padding: UI_CONFIG.spacing.pagePadding,
    position: 'relative',
    zIndex: UI_CONFIG.zIndex.pageAboveBg,
    minHeight: 'calc(100dvh - var(--header-height, 88px))',
    backgroundColor: 'transparent',
    paddingBottom: navBottomVisible
      ? `calc(${UI_CONFIG.spacing.pagePadding} + ${UI_CONFIG.spacing.navBottomHeight})`
      : UI_CONFIG.spacing.pagePadding,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: 'transparent',
      }}
    >
      <NavTop />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: UI_CONFIG.motion.pageTransition }}
        style={mainStyle}
      >
        <Outlet />
      </motion.main>
      <NavBottom onVisibleChange={setNavBottomVisible} />
    </div>
  );
}
