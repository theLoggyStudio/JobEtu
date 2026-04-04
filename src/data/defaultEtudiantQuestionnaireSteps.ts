import type { QuestionnaireFieldDef } from '../types/questionnaire';

/** Une ligne = une étape (un écran) du formulaire étudiant par défaut. */
export type DefaultEtudiantStepRow = { title: string; field: QuestionnaireFieldDef };

const COMPETENCES_OPTIONS = [
  'Bureautique (Word, Excel, PowerPoint)',
  'Saisie de données',
  'Secrétariat / Administration',
  'Comptabilité basique',
  'Gestion de stock',
  'Vente / Commerce',
  'Accueil & service client',
  'Community management',
  'Graphisme',
  'Rédaction / Communication',
  'Informatique / Support technique',
  'Développement web (niveau débutant)',
  'Enseignement / Répétiteur',
  'Livraison / Logistique',
  'Hôtellerie / Restauration',
  'Enquêtes terrain / Collecte de données',
  'Autre (à préciser)',
] as const;

const JOURS_OPTIONS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
] as const;

const QUALITES_OPTIONS = [
  'Ponctuel(le)',
  'Sérieux(se)',
  'Organisé(e)',
  'Motivé(e)',
  'Autonome',
  'Bonne communication',
  'Travail en équipe',
] as const;

const OUI_NON = ['OUI', 'NON'] as const;

/**
 * Formulaire étudiant par défaut : chaque entrée correspond à un panneau / écran
 * (aligné sur les maquettes fournies).
 */
export const DEFAULT_ETUDIANT_QUESTIONNAIRE_STEPS: DefaultEtudiantStepRow[] = [
  {
    title: 'Adresse e-mail',
    field: { name: 'etu_email', label: 'Adresse e-mail', type: 'email', required: true },
  },
  {
    title: 'Nom et prénom',
    field: { name: 'etu_nom_prenom', label: 'Nom et Prénom', type: 'text', required: true },
  },
  {
    title: 'WhatsApp',
    field: {
      name: 'etu_whatsapp',
      label: 'Numéro WhatsApp (indicatif pays + numéro, ex. +221, +225, +237…)',
      type: 'tel',
      required: true,
    },
  },
  {
    title: 'Adresse e-mail',
    field: { name: 'etu_email_secondaire', label: 'Adresse e-mail', type: 'email', required: true },
  },
  {
    title: 'Statut actuel',
    field: {
      name: 'etu_statut_actuel',
      label: 'Statut actuel',
      type: 'radio',
      required: true,
      options: ['Étudiant', 'Jeune diplômé', 'autre'],
    },
  },
  {
    title: "Niveau d'étude",
    field: {
      name: 'etu_niveau_etude',
      label: "Niveau d'étude",
      type: 'radio',
      required: false,
      options: ['Licence 1 / 2 / 3', 'Master', 'BTS / DUT', 'Autre'],
    },
  },
  {
    title: 'Domaine',
    field: {
      name: 'etu_domaine_formation',
      label: "Domaine d'étude / formation",
      type: 'text',
      required: false,
    },
  },
  {
    title: 'Compétences',
    field: {
      name: 'etu_competences',
      label: 'Quelles sont vos compétences ?',
      type: 'checkboxes',
      required: true,
      options: [...COMPETENCES_OPTIONS],
    },
  },
  {
    title: 'Autre compétence',
    field: {
      name: 'etu_competences_autre',
      label: 'Si vous avez coché « Autre (à préciser) », détaillez ici :',
      type: 'textarea',
      required: false,
    },
  },
  {
    title: 'Type de disponibilité',
    field: {
      name: 'etu_type_disponibilite',
      label: 'Type de disponibilité',
      type: 'radio',
      required: true,
      options: [
        'Temps partiel',
        'Missions ponctuelles',
        'Stage',
        'Week-ends uniquement',
        'Flexible',
      ],
    },
  },
  {
    title: 'Jours disponibles',
    field: {
      name: 'etu_jours_disponibles',
      label: 'Jours disponibles',
      type: 'checkboxes',
      required: false,
      options: [...JOURS_OPTIONS],
    },
  },
  {
    title: 'Expérience professionnelle',
    field: {
      name: 'etu_experience_pro',
      label: 'Avez-vous déjà une expérience professionnelle ?',
      type: 'radio',
      required: true,
      options: [...OUI_NON],
    },
  },
  {
    title: 'Détail expérience',
    field: {
      name: 'etu_experience_detail',
      label: 'Si oui, précisez brièvement votre expérience :',
      type: 'textarea',
      required: false,
    },
  },
  {
    title: 'CV',
    field: {
      name: 'etu_a_cv',
      label: 'Avez-vous un CV ?',
      type: 'radio',
      required: true,
      options: [...OUI_NON],
    },
  },
  {
    title: 'Joindre le CV',
    field: {
      name: 'etu_cv_fichier',
      label: 'Si oui, joindre le CV (PDF, image — max. 4 Mo en test)',
      type: 'file',
      required: false,
    },
  },
  {
    title: 'Qualités',
    field: {
      name: 'etu_qualities',
      label: 'Quelles sont vos qualités ?',
      type: 'checkboxes',
      required: false,
      options: [...QUALITES_OPTIONS],
    },
  },
  {
    title: 'Contact partenaires',
    field: {
      name: 'etu_consentement_contact',
      label: "Acceptez-vous d'être contacté(e) par des entreprises partenaires ?",
      type: 'radio',
      required: true,
      options: [...OUI_NON],
    },
  },
  {
    title: 'Découverte de la plateforme',
    field: {
      name: 'etu_decouverte_plateforme',
      label: 'Comment avez-vous connu cette plateforme ?',
      type: 'text',
      required: false,
    },
  },
  {
    title: 'À votre attention',
    field: {
      name: 'etu_message_fin',
      label:
        'Merci pour votre inscription. Vous serez contacté(e) uniquement en cas d’opportunité correspondant à votre profil.',
      type: 'info',
      required: false,
    },
  },
];


