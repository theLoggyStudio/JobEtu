/**
 * Affichage côté client du parcours PayDunya.
 * Les clés secrètes et l’appel API restent sur le backend (`onejob-back/Constants/paydunya.constant.ts` + `.env`).
 */
export const PAYDUNYA_UI_CONFIG = {
  /** Même montant que `PAYDUNYA_SUBMISSION_AMOUNT` sur l’API (défaut 2500 FCFA). */
  submissionAmountFcfa: 2500,
  currencyLabel: 'FCFA',
  finalSubmitLabel: 'Payer et envoyer (2500 FCFA)',
  paymentPendingTitle: 'Confirmation du paiement…',
  paymentPendingBody:
    'Nous vérifions votre paiement PayDunya. Patientez quelques secondes. Ne fermez pas cette page.',
  paymentSuccessTitle: 'Paiement confirmé',
  paymentSuccessBody: 'Votre formulaire a bien été enregistré.',
  paymentErrorTitle: 'Paiement non confirmé',
  missingToken: 'Lien de retour invalide (token manquant).',
} as const;
