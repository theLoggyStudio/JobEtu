import { Modal } from './Modal';
import { Button } from './Button';
import { UI_CONFIG, ONEJOB_EXTERNAL_LINKS } from '@constants/variable.constant';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Lien vers le questionnaire (ex. ROUTE_BUILDERS.etudiantQuestionnaire(slug)) */
  questionnairePath: string | null;
  /** Libellé du bouton formulaire */
  formCtaLabel: string;
};

/**
 * Après inscription : proposer l’ADE (WhatsApp) ou le formulaire métier.
 */
export function PostRegisterWelcomeModal({ open, onClose, questionnairePath, formCtaLabel }: Props) {
  return (
    <Modal open={open} onClose={onClose} panelMaxWidth={440} titleId="post-register-title">
      <h2 id="post-register-title" style={{ marginTop: 0, color: UI_CONFIG.colors.primary }}>
        Bienvenue sur OneJob
      </h2>
      <p style={{ color: UI_CONFIG.forms.subtitleColor, lineHeight: 1.55, marginBottom: '1rem' }}>
        Souhaitez-vous approfondir une compétence avec l’ADE — via WhatsApp (Meda ou Dr Dany) — ou compléter
        votre formulaire sur la plateforme ?
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <a
          href={ONEJOB_EXTERNAL_LINKS.whatsappAdeMeda}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <Button type="button" variant="secondary" fullWidth>
            WhatsApp — Meda (ADE)
          </Button>
        </a>
        <a
          href={ONEJOB_EXTERNAL_LINKS.whatsappAdeDany}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <Button type="button" variant="secondary" fullWidth>
            WhatsApp — Dr Dany (ADE)
          </Button>
        </a>
        {questionnairePath ? (
          <a href={questionnairePath} style={{ textDecoration: 'none' }} onClick={onClose}>
            <Button type="button" variant="primary" fullWidth>
              {formCtaLabel}
            </Button>
          </a>
        ) : null}
        <Button type="button" variant="outline" fullWidth onClick={onClose}>
          Plus tard
        </Button>
      </div>
    </Modal>
  );
}
