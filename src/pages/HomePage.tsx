import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG, ROUTE_PATHS, UI_CONFIG } from '@constants/variable.constant';
import logoHero from '../assets/LogoEtSlogan.png';
import { CenteredPage } from '../items/CenteredPage';
import { Panel } from '../items/Panel';
import { TextPanel } from '../items/TextPanel';
import { Typewriter } from '../items/Typewriter';

const tagline =
  'Bienvenue sur OneJob — la mise en relation Entreprise, étudiant et Particulier.';

type HomePanel = 'accueil' | 'formulaire' | 'apropos' | 'contact';

function parseHomePanelFromHash(): HomePanel {
  const raw = window.location.hash.replace(/^#/, '').trim().toLowerCase();
  if (raw === 'formulaire') return 'formulaire';
  if (raw === 'a-propos' || raw === 'apropos') return 'apropos';
  if (raw === 'contact') return 'contact';
  return 'accueil';
}

const panelLinkStyle: CSSProperties = {
  fontWeight: 600,
  color: UI_CONFIG.colors.secondary,
  textDecoration: 'none',
  fontSize: '0.95rem',
};

/** Liens # pour changer de panneau (affichage unique). */
function HomePanelHashNav({ style }: { style?: CSSProperties }) {
  return (
    <nav
      aria-label="Sections OneJob"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.65rem 1.15rem',
        alignItems: 'center',
        ...style,
      }}
    >
      <a href="#" style={panelLinkStyle}>
        Accueil
      </a>
      <span style={{ color: UI_CONFIG.forms.subtitleColor, userSelect: 'none' }} aria-hidden="true">
        |
      </span>
      <a href="#formulaire" style={panelLinkStyle}>
        Formulaire
      </a>
      <span style={{ color: UI_CONFIG.forms.subtitleColor, userSelect: 'none' }} aria-hidden="true">
        |
      </span>
      <a href="#a-propos" style={panelLinkStyle}>
        À propos
      </a>
      <span style={{ color: UI_CONFIG.forms.subtitleColor, userSelect: 'none' }} aria-hidden="true">
        |
      </span>
      <a href="#contact" style={panelLinkStyle}>
        Contact
      </a>
    </nav>
  );
}

export function HomePage() {
  const [panel, setPanel] = useState<HomePanel>(() =>
    typeof window !== 'undefined' ? parseHomePanelFromHash() : 'accueil'
  );

  useEffect(() => {
    const sync = () => setPanel(parseHomePanelFromHash());
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return (
    <CenteredPage width="lg">
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
          src={logoHero}
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

      {panel === 'accueil' ? (
        <TextPanel as="section" id="accueil" elevated aria-labelledby="home-accueil-title">
          <h1
            id="home-accueil-title"
            style={{ color: UI_CONFIG.colors.primary, fontSize: '2rem', marginBottom: '0.5rem', marginTop: 0 }}
          >
            <Typewriter text={tagline} />
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            OneJob est une plateforme pensée pour le contexte sénégalais (indicatif +221) et au-delà : elle met en
            relation les <strong>entreprises</strong> qui ont un besoin ponctuel ou récurrent, les{' '}
            <strong>étudiants</strong> qui cherchent une mission ou un stage, et les <strong>particuliers</strong>{' '}
            disponibles pour des missions adaptées. Les parcours s’appuient sur des questionnaires clairs ; une
            équipe peut vous accompagner aussi via WhatsApp (formation ADE).
          </p>
          <p style={{ fontSize: '1rem', lineHeight: 1.55, color: UI_CONFIG.forms.subtitleColor, margin: 0 }}>
            Créez un compte selon votre profil (entreprise, étudiant ou particulier), complétez le formulaire
            adapté, puis échangez lorsque une mise en relation est validée.
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
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.35rem',
              borderTop: `1px solid ${UI_CONFIG.colors.black}14`,
            }}
          >
            <p
              style={{
                margin: '0 0 0.65rem',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: UI_CONFIG.colors.primary,
              }}
            >
              Aller à la section
            </p>
            <HomePanelHashNav />
          </div>
        </TextPanel>
      ) : null}

      {panel === 'formulaire' ? (
        <TextPanel as="section" id="formulaire" elevated>
          <h2 style={{ color: UI_CONFIG.colors.primary, marginTop: 0 }}>Formulaire</h2>
          <p style={{ lineHeight: 1.6, marginBottom: '1rem' }}>
            Après inscription, vous accédez à un espace dédié : un questionnaire entreprise pour décrire votre
            besoin, ou un parcours étudiant / particulier pour vos compétences et disponibilités. Vous pouvez être
            guidé·e par l’équipe ADE sur WhatsApp ou tout remplir en ligne.
          </p>
          <Link to={ROUTE_PATHS.register} style={{ fontWeight: 600, color: UI_CONFIG.colors.secondary }}>
            Commencer par créer un compte →
          </Link>
          <HomePanelHashNav
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: `1px solid ${UI_CONFIG.colors.black}14`,
            }}
          />
        </TextPanel>
      ) : null}

      {panel === 'apropos' ? (
        <TextPanel as="section" id="a-propos" elevated>
          <h2 style={{ color: UI_CONFIG.colors.primary, marginTop: 0 }}>À propos</h2>
          <p style={{ lineHeight: 1.6, margin: 0 }}>
            OneJob facilite les mises en relation professionnelles structurées : moins de friction pour les
            entreprises, plus de visibilité pour les profils étudiants et particuliers. La démarche s’inscrit dans
            une logique locale (dont le Sénégal et le +221) tout en restant ouverte aux formats internationaux pour
            les numéros de téléphone.
          </p>
          <HomePanelHashNav
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: `1px solid ${UI_CONFIG.colors.black}14`,
            }}
          />
        </TextPanel>
      ) : null}

      {panel === 'contact' ? (
        <TextPanel as="section" id="contact" elevated>
          <h2 style={{ color: UI_CONFIG.colors.primary, marginTop: 0 }}>Contact</h2>
          <p style={{ lineHeight: 1.6, marginBottom: '0.75rem' }}>
            Pour les formations et accompagnements ADE, utilisez les contacts WhatsApp proposés après votre
            inscription ou scannez le QR code affiché à la fin de l’envoi du formulaire (prise de contact avec Meda).
          </p>
          <p style={{ lineHeight: 1.6, margin: 0, color: UI_CONFIG.forms.subtitleColor, fontSize: '0.95rem' }}>
            E-mail et identifiants de connexion : ceux renseignés sur votre compte OneJob.
          </p>
          <HomePanelHashNav
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: `1px solid ${UI_CONFIG.colors.black}14`,
            }}
          />
        </TextPanel>
      ) : null}
    </CenteredPage>
  );
}
