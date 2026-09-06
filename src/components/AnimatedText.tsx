import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface CharacterProps {
  char: string;
  progress: MotionValue<number>;
  range: [number, number];
}

const Character: React.FC<CharacterProps> = ({ char, progress, range }) => {
  const opacity = useTransform(progress, range, [0.2, 1]);

  if (char === ' ') {
    return <span>&nbsp;</span>;
  }

  return (
    <span className="relative inline-block">
      <span className="opacity-0">{char}</span>
      <motion.span style={{ opacity }} className="absolute inset-0 select-none">
        {char}
      </motion.span>
    </span>
  );
};

interface AnimatedTextProps {
  text: string;
  className?: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({ text, className = '' }) => {
  const containerRef = useRef<HTMLParagraphElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.85', 'end 0.35'],
  });

  const characters = text.split('');
  const total = characters.length;

  return (
    <p
      ref={containerRef}
      className={`relative inline-flex flex-wrap justify-center leading-relaxed ${className}`}
    >
      {characters.map((char, index) => {
        const start = index / total;
        const end = Math.min(1, start + 1 / total + 0.05);
        return (
          <Character
            key={index}
            char={char}
            progress={scrollYProgress}
            range={[start, end]}
          />
        );
      })}
    </p>
  );
};

export default AnimatedText;
