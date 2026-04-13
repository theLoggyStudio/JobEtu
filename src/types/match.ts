import type { MatchStatus, QuestionnaireTarget } from '@constants/types.constant';

export type MyMatchDto = {
  id: string;
  matchedAt: string;
  myRole: QuestionnaireTarget;
  counterparty: {
    displayName: string | null;
    email: string;
    questionnaireTitle: string;
    answersPreview: { fieldName: string; value: string }[];
  };
};

export type MatchMessageDto = {
  id: string;
  senderUserId: string;
  /** Côté entreprise / étudiant dans le match (fourni par l’API). */
  senderSide?: QuestionnaireTarget;
  body: string;
  createdAt: string;
};

export type AdminMatchParty = {
  submissionId: string;
  userEmail: string;
  userDisplayName: string | null;
  questionnaireTitle: string;
};

export type AdminMatchListItem = {
  id: string;
  createdAt: string;
  entreprise: AdminMatchParty | null;
  etudiant: AdminMatchParty | null;
  adminRatingEntreprise: number | null;
  adminRatingEtudiant: number | null;
  status: MatchStatus;
};
