import type { CSSProperties } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { APP_CONFIG, ROUTE_PATHS, UI_CONFIG } from '@constants/variable.constant';
import { Button } from '../items/Button';
import { roleHomePath, useAuthStore } from '../store/authStore';
import logoMark from '../assets/Logo.png';

const navTopStyle: CSSProperties = {
  height: UI_CONFIG.spacing.headerHeight,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `0 ${UI_CONFIG.spacing.pagePadding}`,
  background: UI_CONFIG.colors.primary,
  color: UI_CONFIG.colors.white,
  position: 'sticky',
  top: 0,
  zIndex: UI_CONFIG.zIndex.navTop,
};

/** Barre de navigation supérieure (marque + liens compte). */
export function NavTop() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const isHome = location.pathname === ROUTE_PATHS.home;

  /** Sur accueil + parcours auth : pas de liens tableau de bord / compte / déconnexion (ni Connexion/Inscription dans la barre). */
  const hideNavActions =
    isHome ||
    location.pathname === ROUTE_PATHS.login ||
    location.pathname === ROUTE_PATHS.register;

  const homeSectionLink = (hash: string, label: string) => (
    <a
      href={`${ROUTE_PATHS.home}${hash}`}
      style={{ color: UI_CONFIG.colors.white, fontSize: '0.9rem', whiteSpace: 'nowrap' }}
    >
      {label}
    </a>
  );

  const navBarStyle: CSSProperties = isHome
    ? {
        ...navTopStyle,
        minHeight: '80px',
        height: 'auto',
        paddingTop: '10px',
        paddingBottom: '10px',
      }
    : navTopStyle;

  return (
    <nav id="nav-top" aria-label="Navigation principale" style={navBarStyle}>
      <Link
        to={ROUTE_PATHS.home}
        aria-label={APP_CONFIG.name}
        style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}
      >
        <img
          src={logoMark}
          alt=""
          style={{
            height: isHome ? 72 : 58,
            width: 'auto',
            maxWidth: isHome ? 'min(52vw, 300px)' : 'min(42vw, 200px)',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </Link>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {isHome ? (
          <div
            style={{
              display: 'flex',
              gap: '0.65rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginRight: '0.25rem',
            }}
          >
            {homeSectionLink('#', 'Bienvenue')}
            {homeSectionLink('#a-propos', 'À propos')}
            {homeSectionLink('#contact', 'Contact')}
          </div>
        ) : null}
        {hideNavActions ? null : user && token ? (
          <>
            <Link to={roleHomePath(user.role)} style={{ color: UI_CONFIG.colors.white }}>
              Tableau de bord
            </Link>
            <Link to={ROUTE_PATHS.account} style={{ color: UI_CONFIG.colors.white }}>
              Mon compte
            </Link>
            <Button
              type="button"
              variant="inverseOutline"
              size="sm"
              style={{ borderRadius: UI_CONFIG.radii.sm }}
              onClick={() => {
                clearAuth();
                navigate(ROUTE_PATHS.home);
              }}
            >
              Déconnexion
            </Button>
          </>
        ) : (
          <>
            <Link to={ROUTE_PATHS.login} style={{ color: UI_CONFIG.colors.white }}>
              Connexion
            </Link>
            <Link to={ROUTE_PATHS.register} style={{ color: UI_CONFIG.colors.secondaryLight }}>
              Inscription
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
