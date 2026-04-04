import type { CSSProperties } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG, ROUTE_PATHS, UI_CONFIG } from '@constants/variable.constant';
import logoHero from '../assets/LogoEtSlogan.png';
import { CenteredPage } from '../items/CenteredPage';
import { TextPanel } from '../items/TextPanel';
import { Typewriter } from '../items/Typewriter';

const tagline =
  'Bienvenue sur OneJob — la mise en relation Entreprise, étudiant et Particulier.';

type HomeTab = 'bienvenue' | 'apropos' | 'contact';

const TAB_CONFIG: { id: HomeTab; label: string; hash: string }[] = [
  { id: 'bienvenue', label: 'Bienvenue sur OneJob', hash: 'bienvenue' },
  { id: 'apropos', label: 'À propos', hash: 'a-propos' },
  { id: 'contact', label: 'Contact', hash: 'contact' },
];

function parseTabFromHash(): HomeTab {
  const raw = window.location.hash.replace(/^#/, '').trim().toLowerCase();
  if (raw === 'a-propos' || raw === 'apropos') return 'apropos';
  if (raw === 'contact') return 'contact';
  if (raw === 'formulaire') return 'bienvenue';
  return 'bienvenue';
}

function setHashForTab(tab: HomeTab): void {
  const entry = TAB_CONFIG.find((t) => t.id === tab);
  if (!entry) return;
  if (tab === 'bienvenue') {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    return;
  }
  window.location.hash = entry.hash;
}

const tabBorder = `1px solid ${UI_CONFIG.colors.black}28`;

const cardShell: CSSProperties = {
  padding: 0,
  overflow: 'hidden',
  maxWidth: 'min(100%, 640px)',
  marginLeft: 'auto',
  marginRight: 'auto',
};

export function HomePage() {
  const [tab, setTab] = useState<HomeTab>(() =>
    typeof window !== 'undefined' ? parseTabFromHash() : 'bienvenue'
  );

  const syncFromHash = useCallback(() => setTab(parseTabFromHash()), []);

  useEffect(() => {
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [syncFromHash]);

  const selectTab = (id: HomeTab) => {
    setTab(id);
    setHashForTab(id);
  };

  const tabButtonStyle = (active: boolean, index: number): CSSProperties => ({
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
  });

  return (
    <CenteredPage width="lg">
      {/* Panneau logo + onglets uniquement (maquette) */}
      <TextPanel as="section" elevated style={cardShell}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem 1.5rem 1.25rem',
          }}
        >
          <img
            src={logoHero}
            alt={APP_CONFIG.name}
            style={{
              maxWidth: 'min(260px, 88%)',
              width: 'auto',
              height: 'auto',
              maxHeight: 130,
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        <div
          style={{
            margin: '0 1rem 1rem',
            border: tabBorder,
            borderRadius: UI_CONFIG.radii.md,
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          <div
            role="tablist"
            aria-label="Sections OneJob"
            style={{
              display: 'flex',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {TAB_CONFIG.map((t, index) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`home-tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`home-panel-${t.id}`}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => selectTab(t.id)}
                style={tabButtonStyle(tab === t.id, index)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </TextPanel>

      {/* Panneau d’affichage du contenu (séparé) */}
      <TextPanel
        as="section"
        elevated
        style={{
          ...cardShell,
          marginTop: '1.15rem',
        }}
      >
        <div
          style={{
            padding: '1.5rem 1.5rem 1.75rem',
            minHeight: 'min(42vh, 420px)',
            boxSizing: 'border-box',
          }}
        >
          {tab === 'bienvenue' ? (
            <div
              role="tabpanel"
              id="home-panel-bienvenue"
              aria-labelledby="home-tab-bienvenue"
              style={{ outline: 'none' }}
            >
              <h1
                style={{
                  color: UI_CONFIG.colors.primary,
                  fontSize: 'clamp(1.25rem, 4vw, 1.85rem)',
                  marginBottom: '0.65rem',
                  marginTop: 0,
                  lineHeight: 1.3,
                }}
              >
                <Typewriter text={tagline} />
              </h1>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                OneJob est une plateforme pensée pour le contexte sénégalais (indicatif +221) et au-delà : elle met
                en relation les <strong>entreprises</strong> qui ont un besoin ponctuel ou récurrent, les{' '}
                <strong>étudiants</strong> qui cherchent une mission ou un stage, et les{' '}
                <strong>particuliers</strong> disponibles pour des missions adaptées. Les parcours s’appuient sur des
                questionnaires clairs ; une équipe peut vous accompagner aussi via WhatsApp (formation ADE).
              </p>
              <p
                style={{
                  fontSize: '0.98rem',
                  lineHeight: 1.55,
                  color: UI_CONFIG.forms.subtitleColor,
                  marginBottom: '1.25rem',
                }}
              >
                Créez un compte selon votre profil (entreprise, étudiant ou particulier), complétez le formulaire
                adapté, puis échangez lorsque une mise en relation est validée.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <Link
                  to={ROUTE_PATHS.register}
                  style={{
                    background: UI_CONFIG.colors.secondary,
                    color: UI_CONFIG.colors.white,
                    padding: '0.7rem 1.15rem',
                    borderRadius: UI_CONFIG.radii.md,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Créer un compte
                </Link>
                <Link
                  to={ROUTE_PATHS.login}
                  style={{
                    border: `2px solid ${UI_CONFIG.colors.primary}`,
                    color: UI_CONFIG.colors.primary,
                    padding: '0.7rem 1.15rem',
                    borderRadius: UI_CONFIG.radii.md,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Se connecter
                </Link>
              </div>
              <div
                style={{
                  paddingTop: '1.25rem',
                  borderTop: `1px solid ${UI_CONFIG.colors.black}14`,
                }}
              >
                <h2
                  style={{
                    fontSize: '1.05rem',
                    color: UI_CONFIG.colors.primary,
                    marginTop: 0,
                    marginBottom: '0.5rem',
                  }}
                >
                  Formulaire
                </h2>
                <p style={{ lineHeight: 1.6, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  Après inscription, un questionnaire entreprise ou étudiant / particulier vous permet de détailler
                  votre besoin ou votre profil. Vous pouvez être guidé·e par l’équipe ADE sur WhatsApp ou tout
                  remplir en ligne.
                </p>
                <Link to={ROUTE_PATHS.register} style={{ fontWeight: 600, color: UI_CONFIG.colors.secondary }}>
                  Commencer par créer un compte →
                </Link>
              </div>
            </div>
          ) : null}

          {tab === 'apropos' ? (
            <div
              role="tabpanel"
              id="home-panel-apropos"
              aria-labelledby="home-tab-apropos"
              style={{ outline: 'none' }}
            >
              <h2 style={{ color: UI_CONFIG.colors.primary, marginTop: 0, fontSize: '1.35rem' }}>À propos</h2>
              <p style={{ lineHeight: 1.65, margin: 0, fontSize: '1.02rem' }}>
                OneJob facilite les mises en relation professionnelles structurées : moins de friction pour les
                entreprises, plus de visibilité pour les profils étudiants et particuliers. La démarche s’inscrit
                dans une logique locale (dont le Sénégal et le +221) tout en restant ouverte aux formats
                internationaux pour les numéros de téléphone.
              </p>
            </div>
          ) : null}

          {tab === 'contact' ? (
            <div
              role="tabpanel"
              id="home-panel-contact"
              aria-labelledby="home-tab-contact"
              style={{ outline: 'none' }}
            >
              <h2 style={{ color: UI_CONFIG.colors.primary, marginTop: 0, fontSize: '1.35rem' }}>Contact</h2>
              <p style={{ lineHeight: 1.65, marginBottom: '0.75rem', fontSize: '1.02rem' }}>
                Pour les formations et accompagnements ADE, utilisez les contacts WhatsApp proposés après votre
                inscription ou scannez le QR code affiché à la fin de l’envoi du formulaire (prise de contact avec
                Meda).
              </p>
              <p style={{ lineHeight: 1.6, margin: 0, color: UI_CONFIG.forms.subtitleColor, fontSize: '0.95rem' }}>
                E-mail et identifiants de connexion : ceux renseignés sur votre compte OneJob.
              </p>
            </div>
          ) : null}
        </div>
      </TextPanel>
    </CenteredPage>
  );
}
