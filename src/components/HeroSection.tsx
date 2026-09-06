import React from 'react';
import { motion } from 'framer-motion';
import { Magnet } from './Magnet';
import { ContactButton } from './ContactButton';

interface HeroSectionProps {
  onContactClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onContactClick }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen w-full flex flex-col justify-between overflow-x-clip bg-[#0C0C0C] select-none">
      {/* 1. NAVBAR */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8 z-30 relative"
      >
        <button
          onClick={() => scrollToSection('about')}
          className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm md:text-lg lg:text-[1.4rem] hover:opacity-70 transition-opacity duration-200 cursor-pointer bg-transparent border-0"
        >
          About
        </button>
        <button
          onClick={() => scrollToSection('services')}
          className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm md:text-lg lg:text-[1.4rem] hover:opacity-70 transition-opacity duration-200 cursor-pointer bg-transparent border-0"
        >
          Services
        </button>
        <button
          onClick={() => scrollToSection('projects')}
          className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm md:text-lg lg:text-[1.4rem] hover:opacity-70 transition-opacity duration-200 cursor-pointer bg-transparent border-0"
        >
          Projects
        </button>
        <button
          onClick={onContactClick}
          className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm md:text-lg lg:text-[1.4rem] hover:opacity-70 transition-opacity duration-200 cursor-pointer bg-transparent border-0"
        >
          Contact
        </button>
      </motion.nav>

      {/* 2. HERO HEADING */}
      <div className="w-full overflow-hidden flex justify-center items-center relative z-0 px-4 mt-2 sm:mt-0">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          className="hero-heading font-black uppercase tracking-tight leading-none whitespace-nowrap w-full text-center text-[7.8vw] sm:text-[8.5vw] md:text-[9.2vw] lg:text-[9.8vw]"
        >
          Hi, i&apos;m ghanshyam
        </motion.h1>
      </div>

      {/* 3. HERO PORTRAIT WITH MAGNET */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute left-1/2 -translate-x-1/2 z-10 w-[220px] sm:w-[280px] md:w-[340px] lg:w-[390px] top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 sm:bottom-0 pointer-events-auto"
      >
        <Magnet
          padding={150}
          strength={3}
          activeTransition="transform 0.3s ease-out"
          inactiveTransition="transform 0.6s ease-in-out"
          className="w-full h-full flex items-end justify-center"
        >
          <div className="relative group cursor-grab active:cursor-grabbing">
            {/* Ambient soft backlight */}
            <div className="absolute -inset-4 bg-gradient-to-t from-[#B600A8]/20 via-[#7621B0]/10 to-transparent blur-2xl rounded-full opacity-60 pointer-events-none group-hover:opacity-80 transition-opacity" />
            
            <img
              src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png"
              alt="Ghanshyam - 3D Creator Portrait"
              className="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] filter brightness-95 contrast-105"
              loading="eager"
            />
          </div>
        </Magnet>
      </motion.div>

      {/* 4. BOTTOM BAR */}
      <div className="w-full flex justify-between items-end px-6 md:px-10 pb-7 sm:pb-8 md:pb-10 z-20 relative">
        {/* Left Text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
          className="text-[#D7E2EA] font-light uppercase tracking-wide leading-snug max-w-[160px] sm:max-w-[220px] md:max-w-[280px]"
        >
          a 3d creator &amp; front-end developer driven by crafting striking and unforgettable projects
        </motion.p>

        {/* Right Contact Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <ContactButton onClick={onContactClick} />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
