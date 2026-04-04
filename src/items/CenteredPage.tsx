import { UI_CONFIG } from '@constants/variable.constant';

export type CenteredPageWidth = 'sm' | 'md' | 'lg' | 'xl';

const widthMap: Record<CenteredPageWidth, string> = {
  sm: UI_CONFIG.layout.centeredSm,
  md: UI_CONFIG.layout.centeredMd,
  lg: UI_CONFIG.layout.centeredLg,
  xl: UI_CONFIG.layout.centeredXl,
};

type CenteredPageProps = {
  children: React.ReactNode;
  width?: CenteredPageWidth;
  softBg?: boolean;
};

export const CenteredPage = ({ children, width = 'md', softBg }: CenteredPageProps) => {
  const maxW = widthMap[width];

  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        ...(softBg
          ? {
              minHeight: 'calc(100dvh - var(--header-height, 58px) - 2.5rem)',
              padding: `${UI_CONFIG.spacing.pagePadding} 0`,
              background: 'transparent',
            }
          : {}),
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: maxW,
          marginLeft: 'auto',
          marginRight: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  );
};
