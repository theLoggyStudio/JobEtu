import { UI_CONFIG } from '@constants/variable.constant';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { BlurredBackground } from './items/BlurredBackground';
import { AppRouter } from './router/AppRouter';
export default function App() {
  const location = useLocation();
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