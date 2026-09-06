import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Mail, Github, Linkedin, MapPin, Heart, Phone } from 'lucide-react';
import { ContactButton } from './ContactButton';

interface FooterSectionProps {
  onContactClick: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ onContactClick }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#080808] border-t border-white/10 pt-20 pb-12 px-6 md:px-10 relative z-20 text-[#D7E2EA]">
      <div className="max-w-6xl mx-auto flex flex-col gap-16">
        {/* Top CTA Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#BBCCD7] block mb-2">
              Ready for the next level?
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Let&apos;s create something <br className="hidden sm:inline" />
              <span className="hero-heading">unforgettable</span>.
            </h3>
          </div>
          <ContactButton onClick={onContactClick} label="Get In Touch" />
        </div>

        {/* Middle Info & Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-white text-sm mb-4">Ghanshyam Patel</h4>
            <p className="text-xs text-slate-400 font-light leading-relaxed mb-3">
              3D Creator, Front-End Developer &amp; UI/UX Designer dedicated to building immersive web experiences.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#BBCCD7]">
              <MapPin className="w-3.5 h-3.5 text-[#BBCCD7]" />
              <span>Ahmedabad, India</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-white text-sm mb-4">Navigation</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li>
                <a href="#about" className="hover:text-white transition-colors">About</a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">Services</a>
              </li>
              <li>
                <a href="#projects" className="hover:text-white transition-colors">Projects</a>
              </li>
              <li>
                <button onClick={onContactClick} className="hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs text-left">Contact</button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-white text-sm mb-4">Socials</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li>
                <a href="tel:+918866241512" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> +91 8866241512
                </a>
              </li>
              <li>
                <a href="https://github.com/gdpatel1348-debug" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/ghanshyam-patel-a01766378" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              </li>
              <li>
                <a href="mailto:gdpatel1348@gmail.com" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> gdpatel1348@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-white text-sm mb-4">Back to Top</h4>
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-light">
          <p>&copy; {new Date().getFullYear()} Ghanshyam Patel. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> &amp; Framer Motion
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
