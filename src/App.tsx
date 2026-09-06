import React, { useEffect, useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { MarqueeSection } from './components/MarqueeSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { ProjectsSection } from './components/ProjectsSection';
import { FooterSection } from './components/FooterSection';
import { ContactModal } from './components/ContactModal';
import { Preloader } from './components/Preloader';

export const App: React.FC = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Force scroll to top on page refresh
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
    window.scrollTo(0, 0);
  };

  const openContact = () => setIsContactOpen(true);
  const closeContact = () => setIsContactOpen(false);

  return (
    <>
      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}
      <div className="main-wrapper bg-[#0C0C0C] min-h-screen text-[#D7E2EA] selection:bg-[#B600A8] selection:text-white relative">
        {/* 1. HERO SECTION */}
        <HeroSection onContactClick={openContact} />

        {/* 2. MARQUEE SECTION */}
        <MarqueeSection />

        {/* 3. ABOUT SECTION */}
        <AboutSection onContactClick={openContact} />

        {/* 4. SERVICES SECTION */}
        <ServicesSection />

        {/* 5. PROJECTS SECTION */}
        <ProjectsSection />

        {/* 6. FOOTER */}
        <FooterSection onContactClick={openContact} />

        {/* INTERACTIVE CONTACT MODAL */}
        <ContactModal isOpen={isContactOpen} onClose={closeContact} />
      </div>
    </>
  );
};

export default App;
