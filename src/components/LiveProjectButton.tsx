import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface LiveProjectButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
  label?: string;
}

export const LiveProjectButton: React.FC<LiveProjectButtonProps> = ({
  href,
  onClick,
  className = '',
  label = 'Live Project',
}) => {
  const content = (
    <motion.div
      whileHover={{ scale: 1.04, backgroundColor: 'rgba(215, 226, 234, 0.12)' }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base cursor-pointer select-none transition-colors ${className}`}
    >
      <span>{label}</span>
      <ArrowUpRight className="w-4 h-4" />
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-block no-underline">
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className="inline-block bg-transparent border-0 p-0 text-left">
      {content}
    </button>
  );
};

export default LiveProjectButton;
