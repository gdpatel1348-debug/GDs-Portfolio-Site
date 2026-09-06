import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { FadeIn } from './FadeIn';
import { LiveProjectButton } from './LiveProjectButton';

interface ProjectData {
  num: string;
  name: string;
  category: string;
  link?: string;
  col1Img1: string;
  col1Img2: string;
  col2Img: string;
  col2Class?: string;
}

const PROJECTS: ProjectData[] = [
  {
    num: '01',
    name: 'Buck Sauce',
    category: 'Client',
    link: 'https://buckssauce-gamma.vercel.app/',
    col1Img1: '/photo1.png',
    col1Img2: '/photo2.png',
    col2Img: '/photo3.png',
  },
  {
    num: '02',
    name: 'Aura Brand Identity',
    category: 'Personal',
    col1Img1: '/aura-1.jpeg',
    col1Img2: '/aura-2.jpeg',
    col2Img: '/aura-3.jpeg',
    col2Class: 'object-[center_25%]',
  },
  {
    num: '03',
    name: 'The Simple Salad',
    category: 'Client',
    link: 'https://the-simpal-salad.vercel.app/',
    col1Img1: '/photo4.png',
    col1Img2: '/photo5.png',
    col2Img: '/photo6.png',
  },
];

interface CardProps {
  project: ProjectData;
  index: number;
  totalCards: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

const Card: React.FC<CardProps> = ({ project, index, range, targetScale, progress }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={containerRef}
      className="h-[85vh] flex items-center justify-center sticky top-20 sm:top-24 md:top-28 w-full"
      style={{
        top: `calc(5rem + ${index * 28}px)`,
      }}
    >
      <motion.div
        style={{
          scale,
        }}
        className="w-full max-w-6xl rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:p-6 md:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative overflow-hidden"
      >
        {/* TOP ROW */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <span
              className="font-black text-[#D7E2EA] leading-none tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 80px)' }}
            >
              {project.num}
            </span>
            <div>
              <span className="text-xs uppercase tracking-widest text-[#BBCCD7]/70 font-medium block">
                {project.category}
              </span>
              <h3 className="text-lg sm:text-2xl md:text-3xl font-bold uppercase tracking-wide text-white">
                {project.name}
              </h3>
            </div>
          </div>

          {project.link && <LiveProjectButton href={project.link} />}
        </div>

        {/* BOTTOM ROW: TWO-COLUMN IMAGE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 w-full">
          {/* Left Column (40% width on md+ => 5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-3 sm:gap-4">
            {/* Top image */}
            <div
              className="w-full overflow-hidden rounded-[30px] sm:rounded-[40px] md:rounded-[45px] bg-[#18181A] relative group"
              style={{ height: 'clamp(130px, 16vw, 230px)' }}
            >
              <img
                src={project.col1Img1}
                alt={`${project.name} Detail 1`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Bottom image */}
            <div
              className="w-full overflow-hidden rounded-[30px] sm:rounded-[40px] md:rounded-[45px] bg-[#18181A] relative group"
              style={{ height: 'clamp(160px, 22vw, 340px)' }}
            >
              <img
                src={project.col1Img2}
                alt={`${project.name} Detail 2`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* Right Column (60% width on md+ => 7 cols) */}
          <div className="md:col-span-7 flex flex-col min-h-0">
            <div className="w-full h-full min-h-[260px] md:min-h-0 overflow-hidden rounded-[30px] sm:rounded-[40px] md:rounded-[45px] bg-[#18181A] relative group">
              <img
                src={project.col2Img}
                alt={`${project.name} Hero Showcase`}
                loading="lazy"
                className={`w-full h-full md:absolute md:inset-0 object-cover group-hover:scale-105 transition-transform duration-700 ${project.col2Class || 'object-center'}`}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const ProjectsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const totalCards = PROJECTS.length;

  return (
    <section
      id="projects"
      ref={containerRef}
      className="w-full bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 relative z-10 pt-20 sm:pt-28 pb-32 px-4 sm:px-6 md:px-8 select-none"
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Heading */}
        <FadeIn delay={0} y={40} className="w-full mb-12 sm:mb-16 md:mb-20">
          <h2
            className="hero-heading font-black uppercase leading-none tracking-tight text-center"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            Project
          </h2>
        </FadeIn>

        {/* Sticky Stacking Cards */}
        <div className="w-full relative">
          {PROJECTS.map((project, index) => {
            const targetScale = 1 - (totalCards - 1 - index) * 0.03;
            return (
              <Card
                key={project.num}
                project={project}
                index={index}
                totalCards={totalCards}
                progress={scrollYProgress}
                range={[index * 0.25, 1]}
                targetScale={targetScale}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
