import type { FieldType, QuestionnaireTarget } from '@constants/types.constant';

export type QuestionnaireFieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
};

/** Une étape du parcours = une seule question (`fields` contient exactement un champ). */
export type QuestionnaireStepDef = {
  title: string;
  fields: QuestionnaireFieldDef[];
};

export type QuestionnaireDefinition = {
  title: string;
  targetUserType: QuestionnaireTarget;
  description?: string;
  whatsappLink?: string;
  steps: QuestionnaireStepDef[];
};

export type QuestionnaireDto = {
  id: string;
  slug: string;
  title: string;
  targetUserType: QuestionnaireTarget;
  description: string | null;
  whatsappLink: string | null;
  definition: QuestionnaireDefinition;
  isActive: boolean;
};
