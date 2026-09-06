import React from 'react';
import { FadeIn } from './FadeIn';
import { ModelViewer } from './ModelViewer';

const SERVICES = [
  {
    num: '01',
    name: '3D Modeling & WebGL',
    desc: 'Creation of detailed objects, characters, or environments tailored to specific client needs, ideal for games, products, and immersive 3D web experiences.',
  },
  {
    num: '02',
    name: 'Front-End Development',
    desc: 'Building ultra-clean, high-performance, and responsive web applications using React, Next.js, TypeScript, and modern state-of-the-art interactive architectures.',
  },
  {
    num: '03',
    name: 'UI/UX & Interaction Design',
    desc: 'Designing clean, modern, and conversion-focused interfaces with obsessive attention to layout, visual hierarchy, typography, and memorable user flow.',
  },
  {
    num: '04',
    name: 'Motion Design & Storytelling',
    desc: 'Dynamic animations, kinetic typography, and fluid micro-interactions that add energy, clarity, and unforgettable storytelling to brands and digital products.',
  },
  {
    num: '05',
    name: 'AI Integration & Creative Tech',
    desc: 'Connecting cutting-edge AI workflows, machine learning models, and intelligent features into polished, intuitive user interfaces and web applications.',
  },
];

export const ServicesSection: React.FC = () => {
  return (
    <section
      id="services"
      className="w-full bg-white text-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-12 py-20 sm:py-24 md:py-32 relative z-0 select-none overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col">
        {/* Heading */}
        <FadeIn delay={0} y={40} className="w-full">
          <h2
            className="font-black uppercase tracking-tight text-[#0C0C0C] text-center lg:text-left mb-12 sm:mb-16 md:mb-20 leading-none"
            style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
          >
            Services
          </h2>
        </FadeIn>

        {/* 2-Column Grid Layout: Services on Left, 3D Mesh on Right */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Services List (Left Column) */}
          <div className="lg:col-span-7 flex flex-col order-2 lg:order-1">
            {SERVICES.map((service, index) => (
              <FadeIn
                key={service.num}
                delay={index * 0.1}
                y={30}
                className={`w-full py-8 sm:py-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-8 transition-all duration-300 group hover:pl-2 ${
                  index !== SERVICES.length - 1 ? 'border-b border-[#0C0C0C]/15' : ''
                }`}
              >
                {/* Number */}
                <div
                  className="font-black text-[#0C0C0C] leading-none shrink-0 tracking-tight select-none group-hover:text-black transition-colors"
                  style={{ fontSize: 'clamp(2.5rem, 6vw, 90px)' }}
                >
                  {service.num}
                </div>

                {/* Name + Description */}
                <div className="flex flex-col gap-2 flex-1 pt-1">
                  <h3
                    className="font-medium uppercase text-[#0C0C0C] tracking-wide"
                    style={{ fontSize: 'clamp(1.1rem, 2vw, 1.8rem)' }}
                  >
                    {service.name}
                  </h3>
                  <p
                    className="font-light leading-relaxed text-[#0C0C0C] opacity-60"
                    style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1.15rem)' }}
                  >
                    {service.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* 3D Model Canvas (Right Column - Sticky on Desktop) */}
          <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-28">
            <FadeIn delay={0.2} y={30}>
              <ModelViewer modelUrl="/3dmesh.glb" />
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

