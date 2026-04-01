import type { QuestionnaireFieldDef } from '../types/questionnaire';

/** Une ligne = une étape (un écran) du formulaire entreprise par défaut. */
export type DefaultEntrepriseStepRow = { title: string; field: QuestionnaireFieldDef };

const SECTEUR_OPTIONS = [
  'Commerce',
  'Services',
  'Communication / Digital',
  'Comptabilité / Finance',
  'Éducation / Formation',
  'Santé',
  'Hôtellerie / Restauration',
  'ONG / Association',
  'Autre',
] as const;

const TYPE_BESOIN_OPTIONS = [
  'Mission ponctuelle',
  'Temps partiel',
  'Stage',
  'Renfort temporaire',
  'Autre',
] as const;

const COMPETENCES_RECHERCHEES_OPTIONS = [
  'Bureautique (Word, Excel)',
  'Saisie de données',
  'Secrétariat / Administration',
  'Comptabilité basique',
  'Gestion de stock',
  'Vente / Commerce',
  'Accueil & service client',
  'Community management',
  'Graphisme (Canva, Photoshop)',
  'Rédaction / Communication',
  'Informatique / Support technique',
  'Développement web (niveau junior)',
  'Enseignement / Formation',
  'Livraison / Logistique',
  'Hôtellerie / Restauration',
  'Enquêtes terrain / Collecte de données',
  'Autre (à préciser)',
] as const;

const DUREE_MISSION_OPTIONS = [
  'Quelques jours',
  '1 semaine',
  '1 mois',
  "Plus d'un mois",
  'À définir',
] as const;

const BUDGET_OPTIONS = [
  'Moins de 50 000 FCFA',
  '50 000 – 100 000 FCFA',
  '100 000 FCFA et plus',
  'À définir',
] as const;

const REMUNERATION_OPTIONS = ['Journalier', 'Hebdomadaire', 'Forfait', 'Autre'] as const;

const OUI_NON = ['Oui', 'Non'] as const;

/**
 * Formulaire entreprise par défaut (maquettes : besoin, contact, compétences, conditions).
 */
export const DEFAULT_ENTREPRISE_QUESTIONNAIRE_STEPS: DefaultEntrepriseStepRow[] = [
  {
    title: "Secteur d'activité",
    field: {
      name: 'ent_secteur_activite',
      label: "Secteur d'activité",
      type: 'checkboxes',
      required: true,
      options: [...SECTEUR_OPTIONS],
    },
  },
  {
    title: 'Ville / quartier',
    field: {
      name: 'ent_ville_quartier',
      label: 'Ville / Quartier',
      type: 'text',
      required: true,
    },
  },
  {
    title: 'Contact principal',
    field: {
      name: 'ent_nom_responsable',
      label: 'Nom du responsable / contact principal (indiquez aussi le poste si utile)',
      type: 'text',
      required: true,
    },
  },
  {
    title: 'Indicatif téléphone',
    field: {
      name: 'ent_whatsapp_indicatif',
      label: 'Indicatif régional (WhatsApp / téléphone)',
      type: 'text',
      required: true,
    },
  },
  {
    title: 'Numéro WhatsApp / téléphone',
    field: {
      name: 'ent_whatsapp_numero',
      label: 'Numéro de téléphone',
      type: 'tel',
      required: true,
    },
  },
  {
    title: 'E-mail',
    field: {
      name: 'ent_email',
      label: 'Adresse e-mail (facultatif) — exemple@exemple.com',
      type: 'email',
      required: false,
    },
  },
  {
    title: 'Type de besoin',
    field: {
      name: 'ent_type_besoin',
      label: 'Quel type de besoin avez-vous ?',
      type: 'checkboxes',
      required: true,
      options: [...TYPE_BESOIN_OPTIONS],
    },
  },
  {
    title: 'Compétences recherchées',
    field: {
      name: 'ent_competences_recherchees',
      label: 'Compétences recherchées',
      type: 'checkboxes',
      required: true,
      options: [...COMPETENCES_RECHERCHEES_OPTIONS],
    },
  },
  {
    title: 'Autre compétence',
    field: {
      name: 'ent_competences_autre_precision',
      label: 'Si autre compétence, précisez :',
      type: 'textarea',
      required: false,
    },
  },
  {
    title: 'Durée estimée',
    field: {
      name: 'ent_duree_mission',
      label: 'Durée estimée de la mission',
      type: 'radio',
      required: true,
      options: [...DUREE_MISSION_OPTIONS],
    },
  },
  {
    title: 'Jours et horaires',
    field: {
      name: 'ent_jours_horaires',
      label: 'Jours / horaires prévus',
      type: 'textarea',
      required: true,
    },
  },
  {
    title: 'Date de démarrage',
    field: {
      name: 'ent_date_demarrage',
      label: 'Date souhaitée de démarrage',
      type: 'date',
      required: true,
    },
  },
  {
    title: 'Budget',
    field: {
      name: 'ent_budget_estime',
      label: 'Budget estimé pour la mission',
      type: 'radio',
      required: true,
      options: [...BUDGET_OPTIONS],
    },
  },
  {
    title: 'Rémunération',
    field: {
      name: 'ent_mode_remuneration',
      label: 'Mode de rémunération',
      type: 'checkboxes',
      required: true,
      options: [...REMUNERATION_OPTIONS],
    },
  },
  {
    title: 'Expérience avec étudiants',
    field: {
      name: 'ent_deja_etudiants_stagiaires',
      label: 'Avez-vous déjà travaillé avec des étudiants ou stagiaires ?',
      type: 'radio',
      required: true,
      options: [...OUI_NON],
    },
  },
  {
    title: 'Recontact rapide',
    field: {
      name: 'ent_recontact_rapide',
      label: 'Souhaitez-vous être recontacté rapidement ?',
      type: 'radio',
      required: true,
      options: [...OUI_NON],
    },
  },
  {
    title: 'Découverte de la plateforme',
    field: {
      name: 'ent_comment_connu_plateforme',
      label: 'Comment avez-vous connu cette plateforme ?',
      type: 'text',
      required: true,
    },
  },
];
