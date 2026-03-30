import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { BACKGROUND_CONFIG, UI_CONFIG } from '@constants/variable.constant';

/** Fichiers dans `src/assets/backgrounds` — ajoutez des images sans toucher au code. */
const backgroundUrls: string[] = Object.values(
  import.meta.glob<string>('../assets/backgrounds/**/*.{png,jpg,jpeg,webp,svg,gif}', {
    eager: true,
    query: '?url',
    import: 'default',
  })
);

function pickRandomUrl(urls: readonly string[]): string | null {
  if (urls.length === 0) return null;
  return urls[Math.floor(Math.random() * urls.length)]!;
}

export const BlurredBackground = () => {
  const location = useLocation();
  const selectedUrl = useMemo(() => pickRandomUrl(backgroundUrls), [location.key]);

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        top: 'var(--header-height, 64px)',
        bottom: 0,
        width: '100%',
        minHeight: 0,
        zIndex: UI_CONFIG.zIndex.backgroundLayer,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {selectedUrl ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            minHeight: '100%',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -BACKGROUND_CONFIG.blurPx,
              left: -BACKGROUND_CONFIG.blurPx,
              right: -BACKGROUND_CONFIG.blurPx,
              bottom: -BACKGROUND_CONFIG.blurPx,
              backgroundImage: `url(${selectedUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: `blur(${BACKGROUND_CONFIG.blurPx}px)`,
              transform: `scale(${BACKGROUND_CONFIG.scale})`,
            }}
          />
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            minHeight: '100%',
            background: BACKGROUND_CONFIG.fallbackGradient,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          minHeight: '100%',
          background: BACKGROUND_CONFIG.overlayGradient,
          zIndex: 1,
        }}
      />
    </div>
  );
};
