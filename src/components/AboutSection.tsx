import React from 'react';
import { FadeIn } from './FadeIn';
import { AnimatedText } from './AnimatedText';
import { ContactButton } from './ContactButton';

interface AboutSectionProps {
  onContactClick: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onContactClick }) => {
  const bioText =
    "With a strong background in front-end development, UI/UX design, and 3D web experiences, i focus on creating clean, interactive, and visually memorable digital products. Let's build something incredible together!";

  return (
    <section
      id="about"
      className="relative min-h-screen w-full flex flex-col items-center justify-center px-5 sm:px-8 md:px-10 py-20 bg-[#0C0C0C] overflow-hidden select-none"
    >
      {/* 4 DECORATIVE 3D CORNER ASSETS */}
      {/* Top-Left: Moon Icon */}
      <FadeIn
        delay={0.1}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute top-[4%] left-[1%] sm:left-[2%] md:left-[4%] pointer-events-none z-10 w-[120px] sm:w-[160px] md:w-[210px]"
      >
        <img
          src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png"
          alt="3D Moon Icon"
          className="w-full h-auto object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] animate-pulse"
          style={{ animationDuration: '6s' }}
        />
      </FadeIn>

      {/* Bottom-Left: 3D Object */}
      <FadeIn
        delay={0.25}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%] pointer-events-none z-10 w-[100px] sm:w-[140px] md:w-[180px]"
      >
        <img
          src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png"
          alt="3D Decorative Shape"
          className="w-full h-auto object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] hover:rotate-6 transition-transform duration-700"
        />
      </FadeIn>

      {/* Top-Right: Lego Icon */}
      <FadeIn
        delay={0.15}
        x={80}
        y={0}
        duration={0.9}
        className="absolute top-[4%] right-[1%] sm:right-[2%] md:right-[4%] pointer-events-none z-10 w-[120px] sm:w-[160px] md:w-[210px]"
      >
        <img
          src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png"
          alt="3D Lego Icon"
          className="w-full h-auto object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] animate-bounce"
          style={{ animationDuration: '8s' }}
        />
      </FadeIn>

      {/* Bottom-Right: 3D Group */}
      <FadeIn
        delay={0.3}
        x={80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%] pointer-events-none z-10 w-[130px] sm:w-[170px] md:w-[220px]"
      >
        <img
          src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png"
          alt="3D Group Icon"
          className="w-full h-auto object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
        />
      </FadeIn>

      {/* CENTERED CONTENT WRAPPER */}
      <div className="flex flex-col items-center justify-center text-center max-w-4xl z-20">
        {/* Heading */}
        <FadeIn delay={0} y={40}>
          <h2
            className="hero-heading font-black uppercase leading-none tracking-tight text-center"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            About me
          </h2>
        </FadeIn>

        {/* Spacing between Heading and Animated Text */}
        <div className="h-10 sm:h-14 md:h-16" />

        {/* Scroll-driven character reveal text */}
        <div className="max-w-[560px] px-4">
          <AnimatedText
            text={bioText}
            className="text-[#D7E2EA] font-medium text-center leading-relaxed"
          />
        </div>

        {/* Spacing between Animated Text and Contact Button */}
        <div className="h-16 sm:h-20 md:h-24" />

        {/* Contact Button */}
        <FadeIn delay={0.2} y={20}>
          <ContactButton onClick={onContactClick} />
        </FadeIn>
      </div>
    </section>
  );
};

export default AboutSection;
