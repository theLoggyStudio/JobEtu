import { ROUTE_PATHS, UI_CONFIG } from '@constants/variable.constant';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BlurredBackground, BLURRED_BACKGROUND_URLS } from './items/BlurredBackground';
import { AppRouter } from './router/AppRouter';
import logoMarkUrl from './assets/Logo.png?url';
import logoHeroUrl from './assets/LogoEtSlogan.png?url';

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const urls = [logoMarkUrl, logoHeroUrl, ...BLURRED_BACKGROUND_URLS];
    for (const src of urls) {
      const img = new Image();
      img.src = src;
    }
  }, []);

  /** Barre du haut plus haute sur l’accueil (logo agrandi) : aligne le fond flouté et les minHeight. */
  useEffect(() => {
    const home = location.pathname === ROUTE_PATHS.home;
    const h = home ? '80px' : UI_CONFIG.spacing.headerHeight;
    document.documentElement.style.setProperty('--header-height', h);
  }, [location.pathname]);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        isolation: 'isolate',
        backgroundColor: 'transparent',
      }}
    >
      <BlurredBackground />
      <div
        style={{
          position: 'relative',
          zIndex: UI_CONFIG.zIndex.pageAboveBg,
          minHeight: '100dvh',
          backgroundColor: 'transparent',
        }}
      >
        <AnimatePresence mode="wait">
          <AppRouter key={location.pathname} />
        </AnimatePresence>
      </div>
    </div>
  );
}