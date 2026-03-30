import { Link } from 'react-router-dom';
import { APP_CONFIG, ROUTE_PATHS, UI_CONFIG } from '@constants/variable.constant';
import logoJobEtu from '../assets/LogoEtSlogan.png';
import { CenteredPage } from '../items/CenteredPage';
import { Panel } from '../items/Panel';
import { TextPanel } from '../items/TextPanel';
import { Typewriter } from '../items/Typewriter';

export function HomePage() {
  const tagline = `Bienvenue sur ${APP_CONFIG.name} — la mise en relation par questionnaires intelligents.`;
  return (
    <CenteredPage width="md">
      <Panel
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
          marginBottom: '1.25rem',
          padding: '2rem 1.75rem',
        }}
      >
        <img
          src={logoJobEtu}
          alt={APP_CONFIG.name}
          style={{
            maxWidth: 'min(280px, 85%)',
            width: 'auto',
            height: 'auto',
            maxHeight: 140,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </Panel>
      <TextPanel as="section" elevated>
        <h1 style={{ color: UI_CONFIG.colors.primary, fontSize: '2rem', marginBottom: '0.5rem', marginTop: 0 }}>
          <Typewriter text={tagline} />
        </h1>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
          Entreprises et étudiants : des parcours guidés, un admin pour orchestrer les besoins et les
          compétences.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Link
            to={ROUTE_PATHS.register}
            style={{
              background: UI_CONFIG.colors.secondary,
              color: UI_CONFIG.colors.white,
              padding: '0.75rem 1.25rem',
              borderRadius: UI_CONFIG.radii.md,
              fontWeight: 600,
            }}
          >
            Créer un compte
          </Link>
          <Link
            to={ROUTE_PATHS.login}
            style={{
              border: `2px solid ${UI_CONFIG.colors.primary}`,
              color: UI_CONFIG.colors.primary,
              padding: '0.75rem 1.25rem',
              borderRadius: UI_CONFIG.radii.md,
              fontWeight: 600,
            }}
          >
            Se connecter
          </Link>
        </div>
      </TextPanel>
    </CenteredPage>
  );
}
