import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UI_CONFIG } from '@constants/variable.constant';

type TypewriterProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
};

export const Typewriter = ({ text, className, style }: TypewriterProps) => {
  const [shown, setShown] = useState('');
  useEffect(() => {
    setShown('');
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, UI_CONFIG.motion.typewriterMsPerChar);
    return () => window.clearInterval(id);
  }, [text]);

  return (
    <motion.span
      className={className}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: UI_CONFIG.motion.pageTransition * 0.5 }}
    >
      {shown}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.9 }}
        style={{ color: UI_CONFIG.colors.secondary }}
      >
        |
      </motion.span>
    </motion.span>
  );
};
