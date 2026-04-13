import type { CSSProperties } from 'react';
import { useId, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import { UI_CONFIG } from '@constants/variable.constant';
import { whatsappUrlWithPrefill } from '../utils/whatsappDeepLink';
import { Button, type ButtonVariant } from './Button';
import { Modal } from './Modal';

export type WhatsAppContactTriggerProps = {
  /** URL de base (ex. https://wa.me/221…) sans `?text=`. */
  baseUrl: string;
  /** Texte inséré dans la conversation WhatsApp (paramètre `text`). */
  prefillMessage: string;
  /** Libellé du bouton / lien qui ouvre le modal. */
  triggerLabel: string;
  /** Titre du modal (défaut : contacter via WhatsApp). */
  modalTitle?: string;
  /** Bouton plein ou ligne type menu (dashboard). */
  presentation?: 'button' | 'row';
  variant?: ButtonVariant;
  fullWidth?: boolean;
  /** Fusionné avec le style du déclencheur en `presentation="row"`. */
  triggerStyle?: CSSProperties;
};

const modalHint =
  'Sur mobile, scannez le QR code avec l’appareil photo ou WhatsApp. Sur ordinateur, utilisez le bouton pour ouvrir WhatsApp Web ou l’app.';

export const WhatsAppContactTrigger = ({
  baseUrl,
  prefillMessage,
  triggerLabel,
  modalTitle = 'Contacter via WhatsApp',
  presentation = 'button',
  variant = 'secondary',
  fullWidth = false,
  triggerStyle,
}: WhatsAppContactTriggerProps) => {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const href = useMemo(() => whatsappUrlWithPrefill(baseUrl, prefillMessage), [baseUrl, prefillMessage]);

  const trigger =
    presentation === 'row' ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          font: 'inherit',
          fontWeight: 600,
          color: UI_CONFIG.colors.secondary,
          textDecoration: 'none',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: '0.65rem 0',
          ...triggerStyle,
        }}
      >
        {triggerLabel}
      </button>
    ) : (
      <Button type="button" variant={variant} fullWidth={fullWidth} onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
    );

  return (
    <>
      {trigger}
      <Modal open={open} onClose={() => setOpen(false)} panelMaxWidth={400} titleId={titleId}>
        <h2 id={titleId} style={{ marginTop: 0, color: UI_CONFIG.colors.primary, fontSize: '1.15rem' }}>
          {modalTitle}
        </h2>
        <p style={{ color: UI_CONFIG.forms.subtitleColor, fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
          {modalHint}
        </p>
        <p style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 6, color: UI_CONFIG.colors.primary }}>
          Message prêt à l’envoi (modifiable dans WhatsApp)
        </p>
        <div
          style={{
            padding: '0.65rem 0.75rem',
            borderRadius: UI_CONFIG.radii.sm,
            border: `1px solid ${UI_CONFIG.colors.black}22`,
            background: UI_CONFIG.colors.gray,
            fontSize: '0.88rem',
            lineHeight: 1.45,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            marginBottom: '1rem',
            maxHeight: 120,
            overflow: 'auto',
          }}
        >
          {prefillMessage}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', padding: '0.5rem' }}>
          <QRCode value={href} size={200} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <a href={href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <Button type="button" variant="secondary" fullWidth>
              Ouvrir WhatsApp avec ce message
            </Button>
          </a>
          <Button type="button" variant="outline" fullWidth onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </div>
      </Modal>
    </>
  );
};
