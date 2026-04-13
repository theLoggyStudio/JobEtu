import { ONEJOB_EXTERNAL_LINKS, ONEJOB_WHATSAPP_PREFILL, UI_CONFIG } from '@constants/variable.constant';
import { Button } from './Button';
import { Modal } from './Modal';
import { WhatsAppContactTrigger } from './WhatsAppContactTrigger';

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
        Souhaitez-vous approfondir une compétence avec l’ADE — en nous contactant sur WhatsApp — ou compléter
        votre formulaire sur la plateforme ?
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <WhatsAppContactTrigger
          baseUrl={ONEJOB_EXTERNAL_LINKS.whatsappAdeMeda}
          prefillMessage={ONEJOB_WHATSAPP_PREFILL.adeLine1}
          triggerLabel="WhatsApp — Meda (ADE)"
          modalTitle="WhatsApp — ligne Meda (ADE)"
          variant="secondary"
          fullWidth
        />
        <WhatsAppContactTrigger
          baseUrl={ONEJOB_EXTERNAL_LINKS.whatsappAdeDany}
          prefillMessage={ONEJOB_WHATSAPP_PREFILL.adeLine2}
          triggerLabel="WhatsApp — Dr Dany (ADE)"
          modalTitle="WhatsApp — Dr Dany (ADE)"
          variant="secondary"
          fullWidth
        />
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
