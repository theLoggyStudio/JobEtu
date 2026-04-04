/**
 * Types partagés côté frontend (dupliqués conceptuellement avec le back, sans import croisé).
 */
export type UserRole = 'admin' | 'entreprise' | 'etudiant' | 'particulier';

export type QuestionnaireTarget = 'entreprise' | 'etudiant';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkboxes'
  | 'file'
  | 'info'
  | 'date'
  | 'time'
  | 'datetime';

export type MatchStatus = 'pending' | 'validated' | 'rejected';
