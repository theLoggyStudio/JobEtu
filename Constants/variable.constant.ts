import type { FieldType, MatchStatus, QuestionnaireTarget, UserRole } from './types.constant';

/**
 * URL de base de l’API (où le front envoie les requêtes).
 * Définir `VITE_API_URL` dans `.env` / `.env.production` pour chaque environnement.
 * Le mode test (mémoire, JSON, PostgreSQL) se configure uniquement sur le backend.
 */
function resolveApiBaseURL(): string {
  const env = import.meta.env.VITE_API_URL;
  if (typeof env === 'string' && env.trim() !== '') {
    return env.trim();
  }
  return 'http://localhost:4000/api';
}

/**
 * Toutes les variables modifiables de l'application frontend.
 */
export const APP_CONFIG = {
  name: 'OneJob',
  version: '0.1.0',
} as const;

/** Liens externes (WhatsApp). Renseigner dans `.env` : `VITE_ONEJOB_WHATSAPP_MEDA`, `VITE_ONEJOB_WHATSAPP_ADE_DANY`. */
export const ONEJOB_EXTERNAL_LINKS = {
  /** Contact Meda (QR fin de formulaire, même base que l’offre ADE Meda si une seule variable). */
  whatsappMeda: (import.meta.env.VITE_ONEJOB_WHATSAPP_MEDA as string | undefined)?.trim() || 'https://wa.me/221000000000',
  whatsappAdeMeda:
    (import.meta.env.VITE_ONEJOB_WHATSAPP_MEDA as string | undefined)?.trim() || 'https://wa.me/221000000000',
  whatsappAdeDany:
    (import.meta.env.VITE_ONEJOB_WHATSAPP_ADE_DANY as string | undefined)?.trim() || 'https://wa.me/221000000000',
} as const;

export const UI_CONFIG = {
  colors: {
    primary: '#1e3a8a',
    primaryLight: '#3b82f6',
    secondary: '#ea580c',
    secondaryLight: '#fb923c',
    white: '#ffffff',
    black: '#0a0a0a',
    gray: '#f4f4f5',
    error: '#dc2626',
    success: '#16a34a',
  },
  radii: { sm: '6px', md: '10px', lg: '16px' },
  spacing: {
    headerHeight: '64px',
    pagePadding: '1.25rem',
    /** Barre de copyright en bas (visible au scroll vers le bas) */
    navBottomHeight: '44px',
  },
  /** Pages formulaires (connexion / inscription) : centrage + carte */
  forms: {
    shellMaxWidth: 'min(100%, 660px)',
    shellMinHeight: 'calc(100dvh - var(--header-height, 64px) - 3rem)',
    cardPadding: '2rem 1.75rem',
    cardShadow: '0 16px 48px rgba(10, 10, 10, 0.1)',
    cardBorder: '1px solid rgba(10, 10, 10, 0.08)',
    accentBarHeight: '4px',
    titleSize: '1.5rem',
    titleMarginBottom: '1.25rem',
    subtitleColor: 'rgba(10, 10, 10, 0.65)',
  },
  /** Centrage horizontal du contenu (formulaires, dashboards, admin) */
  /** Largeurs max +50 % par rapport à la base initiale (960 / 1080 / 1380 / 1620). */
  layout: {
    centeredSm: 'min(100%, 960px)',
    centeredMd: 'min(100%, 1080px)',
    centeredLg: 'min(100%, 1380px)',
    centeredXl: 'min(100%, 1620px)',
  },
  motion: {
    typewriterMsPerChar: 42,
    inputExpandDuration: 0.28,
    pageTransition: 0.35,
    alertDuration: 0.4,
    /** Entrée des panneaux / cartes : fondu + glissement depuis le bas (vers le haut). */
    panelEnterY: 28,
    panelEnterDuration: 0.42,
  },
  zIndex: {
    /** Sous la barre du haut ; au-dessus du contenu des pages */
    navBottom: 90,
    /** Barre de navigation supérieure (ex-nav header) */
    navTop: 100,
    /** Modales / overlays plein écran — au-dessus de navTop (souvent via portail `body`) */
    modal: 5000,
    pageAboveBg: 10,
    backgroundLayer: 0,
  },
} as const;

/** Arrière-plan flouté (images dans src/assets/backgrounds/) — zone sous la navbar uniquement */
export const BACKGROUND_CONFIG = {
  /** Flou d’arrière-plan (px) — plus bas = motif plus net */
  blurPx: 3,
  scale: 1.08,
  /** Voile léger : un voile trop opaque ressemble à un gris uniforme sous le contenu */
  overlayGradient:
    'linear-gradient(165deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.12) 100%)',
  fallbackGradient:
    'linear-gradient(135deg, #c7d2fe 0%, #fed7aa 50%, #bfdbfe 100%)',
} as const;

export const ROUTE_PATHS = {
  home: '/',
  login: '/connexion',
  register: '/inscription',
  account: '/compte',
  entrepriseDashboard: '/entreprise',
  etudiantDashboard: '/etudiant',
  adminDashboard: '/admin',
  adminQuestionnaires: '/admin/questionnaires',
  adminSubmissions: '/admin/soumissions',
  adminMatches: '/admin/matches',
  questionnaireEntreprise: '/entreprise/questionnaire/:slug',
  questionnaireEtudiant: '/etudiant/questionnaire/:slug',
  /** Ancienne route retour paiement (conservée pour les liens déjà émis). */
  paiementSoumission: '/paiement/soumission/:sessionId',
  entrepriseMatches: '/entreprise/matches',
  entrepriseMatchChat: '/entreprise/matches/:matchId',
  etudiantMatches: '/etudiant/matches',
  etudiantMatchChat: '/etudiant/matches/:matchId',
} as const;

export const API_CONFIG = {
  baseURL: resolveApiBaseURL(),
  timeoutMs: 30000,
} as const;

export const API_ENDPOINTS = {
  health: '/health',
  authRegister: '/auth/register',
  authRegisterAdmin: '/auth/register-admin',
  authLogin: '/auth/login',
  authMe: '/auth/me',
  questionnaires: '/questionnaires',
  questionnaireBySlug: (slug: string) => `/questionnaires/by-slug/${slug}`,
  questionnaireById: (id: string) => `/questionnaires/${id}`,
  questionnaireToggle: (id: string) => `/questionnaires/${id}/toggle`,
  submissions: '/submissions',
  submissionsPaydunyaInit: '/submissions/paydunya/init',
  submissionsPaydunyaConfirm: (sessionId: string) => `/submissions/paydunya/confirm/${sessionId}`,
  submissionById: (id: string) => `/submissions/${id}`,
  matches: '/matches',
  matchesMy: '/matches/my',
  matchMessages: (matchId: string) => `/matches/${matchId}/messages`,
  matchRatings: (matchId: string) => `/matches/${matchId}/ratings`,
  matchStatus: (matchId: string) => `/matches/${matchId}/status`,
} as const;

export const SECURITY_CONFIG = {
  tokenStorageKey: 'onejob_access_token',
} as const;

export const ROLE_CONFIG = {
  admin: 'admin',
  entreprise: 'entreprise',
  etudiant: 'etudiant',
  particulier: 'particulier',
} as const;

/**
 * Après inscription : redirection absolue vers le front déployé (défaut [job-etu.vercel.app](https://job-etu.vercel.app)).
 * En local, définir `VITE_POST_REGISTER_APP_ORIGIN=http://localhost:5173` pour garder le jeton (même origine).
 */
export const POST_REGISTER_APP_ORIGIN =
  (import.meta.env.VITE_POST_REGISTER_APP_ORIGIN as string | undefined)?.trim().replace(/\/$/, '') ||
  'https://job-etu.vercel.app';

export function postRegisterAbsoluteDashboardUrl(role: UserRole): string {
  const base = POST_REGISTER_APP_ORIGIN;
  if (role === ROLE_CONFIG.entreprise) {
    return `${base}${ROUTE_PATHS.entrepriseDashboard}`;
  }
  if (role === ROLE_CONFIG.admin) {
    return `${base}${ROUTE_PATHS.adminDashboard}`;
  }
  return `${base}${ROUTE_PATHS.etudiantDashboard}`;
}

export const MESSAGE_CONFIG = {
  loading: 'Chargement…',
  emptyList: 'Aucun élément à afficher.',
  errorGeneric: 'Une erreur est survenue. Réessayez.',
  successSaved: 'Enregistré avec succès.',
  adminUserCreated: 'Compte administrateur créé. Le nouvel utilisateur peut se connecter avec cet e-mail.',
  loginSuccess: 'Connexion réussie.',
  logoutSuccess: 'Déconnexion effectuée.',
  validationRequired: 'Ce champ est obligatoire.',
  validationPasswordMin: 'Le mot de passe doit contenir au moins 8 caractères.',
  validationPhoneMax: 'Le numéro ne peut pas dépasser 40 caractères.',
  validationInternationalTel:
    'Indicatif obligatoire : +XXX puis espace puis le numéro (ex. +221 771234567).',
  validationFileMaxSize: 'Le fichier dépasse la taille maximale autorisée (4 Mo).',
  networkError: 'Problème réseau ou serveur indisponible.',
  matchPairConflict:
    'Une demande ou une mise en relation validée existe déjà pour cette paire entreprise / étudiant.',
  matchDemandCreated:
    'Demande enregistrée. Validez-la dans « Matchs & évaluations » pour activer le chat entre les deux parties.',
  profileUpdated: 'Vos informations ont été mises à jour.',
} as const;

export const MATCH_STATUS_UI: Record<MatchStatus, string> = {
  pending: 'En attente',
  validated: 'Validé',
  rejected: 'Refusé',
};

export const FEATURE_FLAGS = {
  enableWhatsAppCta: true,
  enablePaymentPlaceholder: false,
} as const;

export const MATCHES_UI_CONFIG = {
  pageTitle: 'Mes mises en relation',
  listIntro:
    'Lorsqu’un administrateur valide un match avec votre dossier, la fiche de l’autre partie apparaît ici. Ouvrez une conversation pour échanger.',
  chatIntro:
    'Conversation réservée aux deux parties déjà mises en relation. Soyez professionnel·le·s.',
  emptyList: 'Aucune mise en relation pour le moment.',
  openChat: 'Ouvrir le chat',
  backToList: '← Toutes les mises en relation',
  matchedOn: 'Mis en relation le',
  counterpartyEntreprise: 'Entreprise',
  counterpartyEtudiant: 'Étudiant',
  email: 'Email',
  formTitle: 'Formulaire',
  answers: 'Réponses (extrait)',
  messagePlaceholder: 'Écrire un message…',
  send: 'Envoyer',
  you: 'Vous',
  other: 'Autre partie',
} as const;

export const ADMIN_MATCHES_UI_CONFIG = {
  pageTitle: 'Matchs & évaluations',
  intro:
    'Les demandes créées depuis le dashboard sont en attente jusqu’à validation. Une fois validées, les deux parties voient la mise en relation et peuvent chatter. Vous pouvez noter chaque tiers sur 10.',
  colDate: 'Date',
  colStatus: 'Statut',
  colEntreprise: 'Entreprise',
  colEtudiant: 'Étudiant',
  colRatingE: 'Note entreprise /10',
  colRatingF: 'Note étudiant /10',
  colAction: 'Enregistrer',
  save: 'Enregistrer',
  saving: '…',
  saved: 'Notations enregistrées.',
  statusValidated: 'Demande validée.',
  statusRejected: 'Demande refusée.',
  validate: 'Valider',
  reject: 'Refuser',
  empty: 'Aucun match pour le moment.',
  ratingUnset: 'Non noté',
} as const;

export const MATCH_CONFIG = {
  modalTitle: 'Demande de mise en relation',
  modalSubtitle:
    'La paire choisie ne doit pas déjà avoir une demande en cours ou un match validé. Après envoi, validez la demande dans « Matchs & évaluations ».',
  confirmLabel: 'Créer la demande',
  selectEntreprise: 'Sélectionner une soumission entreprise',
  selectEtudiant: 'Sélectionner une soumission étudiant',
  chooseEntreprise: 'Choisir l’entreprise',
  chooseClient: 'Choisir le client',
  pickerEntrepriseTitle: 'Soumissions entreprise',
  pickerClientTitle: 'Soumissions étudiant',
  pickerClose: 'Fermer la liste',
  selectedLabel: 'Sélection actuelle',
} as const;

export const WHATSAPP_CONFIG = {
  defaultLabel: 'Rejoindre le groupe WhatsApp',
} as const;

export const QUESTIONNAIRE_UI_CONFIG = {
  progressHeight: 8,
  stepTransition: 0.3,
} as const;

/** Un formulaire par cible ; l’URL utilise ce slug (`/entreprise/questionnaire/entreprise`, etc.). */
export const CANONICAL_QUESTIONNAIRE_SLUG: Record<QuestionnaireTarget, QuestionnaireTarget> = {
  entreprise: 'entreprise',
  etudiant: 'etudiant',
};

export const QUESTIONNAIRE_FIELD_TYPES: readonly FieldType[] = [
  'text',
  'textarea',
  'email',
  'tel',
  'number',
  'select',
  'radio',
  'checkboxes',
  'file',
  'info',
  'date',
  'time',
  'datetime',
];

export const QUESTIONNAIRE_FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Texte court',
  textarea: 'Texte long',
  email: 'E-mail',
  tel: 'Téléphone',
  number: 'Nombre',
  select: 'Liste déroulante',
  radio: 'Choix unique (boutons)',
  checkboxes: 'Choix multiples (cases)',
  file: 'Fichier',
  info: 'Texte informatif (sans saisie)',
  date: 'Date',
  time: 'Heure',
  datetime: 'Date et heure',
};

/** Chemins dynamiques (slug) — centralisés pour éviter les chaînes magiques */
export const ROUTE_BUILDERS = {
  entrepriseQuestionnaire: (slug: string) =>
    `${ROUTE_PATHS.entrepriseDashboard}/questionnaire/${slug}`,
  etudiantQuestionnaire: (slug: string) =>
    `${ROUTE_PATHS.etudiantDashboard}/questionnaire/${slug}`,
  entrepriseMatchChat: (matchId: string) => `${ROUTE_PATHS.entrepriseMatches}/${matchId}`,
  etudiantMatchChat: (matchId: string) => `${ROUTE_PATHS.etudiantMatches}/${matchId}`,
} as const;
