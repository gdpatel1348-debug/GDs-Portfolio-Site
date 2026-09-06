import React from 'react';
import { motion } from 'framer-motion';

interface ContactButtonProps {
  onClick?: () => void;
  className?: string;
  label?: string;
}

export const ContactButton: React.FC<ContactButtonProps> = ({
  onClick,
  className = '',
  label = 'Contact Me',
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`relative inline-flex items-center justify-center rounded-full text-white font-medium uppercase tracking-widest cursor-pointer select-none transition-all duration-300 px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base outline outline-2 outline-white -outline-offset-[3px] shadow-[0_10px_30px_rgba(182,0,168,0.35)] ${className}`}
      style={{
        background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
        boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset, 0 10px 30px rgba(182,0,168,0.35)',
      }}
    >
      <span>{label}</span>
    </motion.button>
  );
};

export default ContactButton;
