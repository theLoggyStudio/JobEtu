import type { InputHTMLAttributes } from 'react';
import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UI_CONFIG } from '@constants/variable.constant';
import { sanitizeInternationalTelInput } from '../utils/internationalTel';
import { RequiredAsterisk } from './Input';

type TelProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

/**
 * Champ téléphone au format international : +indicatif (1–4 chiffres), espace, numéro (6–15 chiffres).
 */
export const Tel = forwardRef<HTMLInputElement, TelProps>(function Tel(
  { label, error, id, style, onFocus, onBlur, required, onChange, ...rest },
  ref
) {
  const inputId = id ?? rest.name;
  const [focused, setFocused] = useState(false);
  return (
    <motion.label
      layout
      htmlFor={inputId}
      style={{ display: 'block', marginBottom: '1rem', ...style }}
      whileFocus={{ scale: 1.01 }}
      transition={{ duration: UI_CONFIG.motion.inputExpandDuration }}
    >
      <span style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: UI_CONFIG.colors.primary }}>
        {label}
        {required ? <RequiredAsterisk /> : null}
      </span>
      <div
        style={{
          width: '100%',
          maxWidth: '100%',
          borderRadius: UI_CONFIG.radii.sm,
          transition: `box-shadow ${UI_CONFIG.motion.inputExpandDuration}s ease`,
          boxShadow: focused ? `0 0 0 3px ${UI_CONFIG.colors.secondaryLight}55` : 'none',
        }}
      >
        <input
          ref={ref}
          {...rest}
          id={inputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+221 771234567"
          required={required}
          onChange={(e) => {
            const next = sanitizeInternationalTelInput(e.target.value);
            e.target.value = next;
            onChange?.(e);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={{
            width: '100%',
            padding: '0.65rem 0.85rem',
            borderRadius: UI_CONFIG.radii.sm,
            border: `1px solid ${UI_CONFIG.colors.black}22`,
          }}
        />
      </div>
      {error ? (
        <span style={{ color: UI_CONFIG.colors.error, fontSize: '0.85rem' }}>{error}</span>
      ) : null}
    </motion.label>
  );
});
