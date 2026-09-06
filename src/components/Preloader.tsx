import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let meshLoaded = 0;
    let pendantLoaded = 0;

    const loader = new GLTFLoader();

    const updateCombinedProgress = () => {
      // 3dmesh.glb is much larger so give it 80% weight, pendant 20%
      const combined = Math.min(100, Math.round(meshLoaded * 80 + pendantLoaded * 20));
      setProgress((prev) => Math.max(prev, combined));

      if (combined >= 100) {
        finishLoading();
      }
    };

    const finishLoading = () => {
      setProgress(100);
      setTimeout(() => {
        setIsFinished(true);
        setTimeout(onComplete, 700); // Allow fade out exit animation
      }, 500);
    };

    // Load 3D Mesh GLB
    loader.load(
      '/3dmesh.glb',
      () => {
        meshLoaded = 1;
        updateCombinedProgress();
      },
      (xhr) => {
        if (xhr.lengthComputable && xhr.total > 0) {
          meshLoaded = xhr.loaded / xhr.total;
        } else {
          meshLoaded = Math.min(0.95, meshLoaded + 0.1);
        }
        updateCombinedProgress();
      },
      () => {
        meshLoaded = 1;
        updateCombinedProgress();
      }
    );

    // Load Pendant Light GLB
    loader.load(
      '/pendant_light.glb',
      () => {
        pendantLoaded = 1;
        updateCombinedProgress();
      },
      (xhr) => {
        if (xhr.lengthComputable && xhr.total > 0) {
          pendantLoaded = xhr.loaded / xhr.total;
        } else {
          pendantLoaded = Math.min(0.95, pendantLoaded + 0.2);
        }
        updateCombinedProgress();
      },
      () => {
        pendantLoaded = 1;
        updateCombinedProgress();
      }
    );

    // Safety fallback interval to guarantee completion if cached or network total unavailable
    const fallbackTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(fallbackTimer);
          finishLoading();
          return 100;
        }
        const next = prev + 4;
        if (next >= 100) {
          clearInterval(fallbackTimer);
          finishLoading();
          return 100;
        }
        return next;
      });
    }, 120);

    return () => clearInterval(fallbackTimer);
  }, []);

  // Total blocks in the pixel loader bar (10 blocks)
  const totalBlocks = 10;
  const activeBlocks = Math.floor((progress / 100) * totalBlocks);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] bg-[#0C0C0C] flex flex-col items-center justify-center p-4 select-none cursor-wait"
        >
          {/* Main Loader Card */}
          <div className="flex flex-col items-center max-w-md w-full p-10 sm:p-12 rounded-3xl bg-white text-black shadow-2xl border border-white/20 relative overflow-hidden select-none">
            {/* Retro Loading Header Text */}
            <div className="text-center font-mono text-sm font-bold tracking-[0.25em] text-black mb-4 uppercase">
              LOADING.....
            </div>

            {/* Animated Pixel Segmented Progress Bar */}
            <div className="w-full max-w-[320px] bg-white p-1 border-[3px] border-black flex items-center justify-between gap-1 mb-2 shadow-sm">
              {Array.from({ length: totalBlocks }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-7 flex-1 transition-all duration-200 ${
                    idx < activeBlocks
                      ? 'bg-black scale-y-100'
                      : 'bg-transparent border border-black/10 scale-y-90'
                  }`}
                />
              ))}
            </div>

            {/* Retro "Please wait...." Subtext */}
            <div className="w-full max-w-[320px] flex justify-end font-mono text-xs text-black/70 font-semibold mb-6">
              Please wait....
            </div>

            {/* Live Progress Bar & Percentage */}
            <div className="w-full max-w-[320px] pt-4 border-t border-black/10 flex items-center justify-between font-mono text-xs font-bold tracking-wider text-black/80">
              <span className="animate-pulse">LOADING 3D ASSETS...</span>
              <span className="text-sm font-black text-black">{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
