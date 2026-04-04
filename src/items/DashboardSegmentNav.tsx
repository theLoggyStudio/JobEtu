import type { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTE_PATHS, UI_CONFIG } from '@constants/variable.constant';

const tabBorder = `1px solid ${UI_CONFIG.colors.black}28`;

function tabStyle(active: boolean, index: number): CSSProperties {
  return {
    flex: 1,
    minWidth: 0,
    margin: 0,
    padding: '0.75rem 0.4rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 'clamp(0.68rem, 2.8vw, 0.9rem)',
    lineHeight: 1.25,
    color: UI_CONFIG.colors.primary,
    background: UI_CONFIG.colors.white,
    borderTop: active ? `4px solid ${UI_CONFIG.colors.secondary}` : '4px solid transparent',
    borderLeft: index === 0 ? 'none' : tabBorder,
    borderRight: 'none',
    borderBottom: 'none',
    boxSizing: 'border-box',
    transition: 'border-top-color 0.2s ease',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'block',
  };
}

type Props = {
  /** Préfixe de route pour l’onglet « Accueil » actif (ex. `/entreprise`, `/etudiant`). */
  basePath: typeof ROUTE_PATHS.entrepriseDashboard | typeof ROUTE_PATHS.etudiantDashboard;
};

/**
 * Barre à 3 segments (style accueil OneJob) : espace connecté, liens vers l’accueil public.
 */
export const DashboardSegmentNav = ({ basePath }: Props) => {
  const { pathname } = useLocation();
  const accueilActive = pathname.startsWith(basePath);

  return (
    <nav
      aria-label="Navigation dans votre espace"
      style={{
        marginBottom: '1rem',
        border: tabBorder,
        borderRadius: UI_CONFIG.radii.md,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div
        role="tablist"
        style={{
          display: 'flex',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Link to={basePath} style={tabStyle(accueilActive, 0)} role="tab" aria-selected={accueilActive}>
          Bienvenue sur OneJob
        </Link>
        <a
          href={`${ROUTE_PATHS.home}#a-propos`}
          style={tabStyle(false, 1)}
          role="tab"
          aria-selected={false}
        >
          À propos
        </a>
        <a
          href={`${ROUTE_PATHS.home}#contact`}
          style={tabStyle(false, 2)}
          role="tab"
          aria-selected={false}
        >
          Contact
        </a>
      </div>
    </nav>
  );
};
