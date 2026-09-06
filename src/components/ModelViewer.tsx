import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MoveHorizontal, Loader2, RotateCcw } from 'lucide-react';

interface ModelViewerProps {
  modelUrl?: string;
  className?: string;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({
  modelUrl = '/3dmesh.glb',
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const previousPointerXRef = useRef(0);
  const rotationVelocityRef = useRef(0);
  const autoRotateSpeed = 0.005;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.2, 5.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    container.appendChild(renderer.domElement);

    // High quality lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.8);
    mainLight.position.set(5, 8, 5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffeedd, 1.4);
    fillLight.position.set(-5, 3, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffe0bb, 1.8);
    rimLight.position.set(0, -4, 5);
    scene.add(rimLight);

    // Warm Accent Light for floating embers
    const amberPointLight = new THREE.PointLight(0xff9933, 1.5, 10);
    amberPointLight.position.set(0, -1.5, 1);
    scene.add(amberPointLight);

    // Group to hold and pivot the model
    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);
    modelGroupRef.current = pivotGroup;

    // Particle Embers System (Floating Sparks)
    const particleCount = 130;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 3.5;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: Math.random() * 0.006 + 0.002, // float upwards
        z: (Math.random() - 0.5) * 0.003,
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffaa44,
      size: 0.04,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Load GLTF Models (Knight Character + Rock Pedestal Platform)
    const loader = new GLTFLoader();

    loader.load(
      modelUrl,
      (knightGltf) => {
        const knightModel = knightGltf.scene;

        // Bounding box of knight
        const knightBox = new THREE.Box3().setFromObject(knightModel);
        const knightCenter = knightBox.getCenter(new THREE.Vector3());
        const knightSize = knightBox.getSize(new THREE.Vector3());

        // Position knight so feet rest at Y = 0
        knightModel.position.set(-knightCenter.x, -knightBox.min.y, -knightCenter.z);

        // Load Rock Pedestal
        loader.load(
          '/rock.glb',
          (rockGltf) => {
            const rockModel = rockGltf.scene;

            const rockBox = new THREE.Box3().setFromObject(rockModel);
            const rockSize = rockBox.getSize(new THREE.Vector3());

            // Scale rock so it forms a wide, solid pedestal platform under the knight's stance
            const targetRockWidth = Math.max(knightSize.x * 3.4, 2.8);
            const rockMaxDim = Math.max(rockSize.x, rockSize.z);
            const rockScale = rockMaxDim > 0 ? targetRockWidth / rockMaxDim : 1;

            rockModel.scale.set(rockScale, rockScale, rockScale);

            // Re-calculate scaled rock box
            const scaledRockBox = new THREE.Box3().setFromObject(rockModel);
            const scaledRockCenter = scaledRockBox.getCenter(new THREE.Vector3());
            const scaledRockHeight = scaledRockBox.max.y - scaledRockBox.min.y;

            // Raise rock slightly up to close air gap so boots touch rock surface directly
            const surfaceOverlap = scaledRockHeight * 0.06;

            rockModel.position.set(
              -scaledRockCenter.x,
              -scaledRockBox.max.y + surfaceOverlap,
              -scaledRockCenter.z
            );

            // Add both knight and rock to pivotGroup so they rotate together
            pivotGroup.add(knightModel);
            pivotGroup.add(rockModel);

            // Calculate combined bounding box to center overall scene
            const combinedBox = new THREE.Box3().setFromObject(pivotGroup);
            const combinedSize = combinedBox.getSize(new THREE.Vector3());
            const combinedCenter = combinedBox.getCenter(new THREE.Vector3());

            // Adjust pivotGroup position so character & rock are balanced vertically
            pivotGroup.position.set(0, -combinedCenter.y * 0.25, 0);

            // Fit camera with slight eye-level view
            const maxDim = Math.max(combinedSize.x, combinedSize.y, combinedSize.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
            cameraZ *= 1.3;

            camera.position.set(0, 0.2, Math.max(cameraZ, 2.4));
            camera.lookAt(0, 0.1, 0);

            setLoading(false);
          },
          undefined,
          (rockErr) => {
            console.warn('Could not load rock pedestal GLB, adding knight only:', rockErr);
            pivotGroup.add(knightModel);
            setLoading(false);
          }
        );
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setProgress(percent);
        } else {
          setProgress((prev) => (prev < 90 ? prev + 10 : 95));
        }
      },
      (error) => {
        console.error('Error loading GLTF model:', error);
        setLoadError('Failed to load 3D mesh model.');
        setLoading(false);
      }
    );

    // Animation Loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Animate floating ember particles upwards
      const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 1] += particleVelocities[i].y;
        posArr[i * 3] += particleVelocities[i].x;
        posArr[i * 3 + 2] += particleVelocities[i].z;

        if (posArr[i * 3 + 1] > 2.5) {
          posArr[i * 3 + 1] = -2.2;
          posArr[i * 3] = (Math.random() - 0.5) * 3.5;
          posArr[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
        }
      }
      posAttr.needsUpdate = true;

      // Rotate model on Y-axis
      if (pivotGroup) {
        pivotGroup.rotation.x = 0;
        pivotGroup.rotation.z = 0;

        if (isDraggingRef.current) {
          // Controlled by pointer
        } else {
          if (Math.abs(rotationVelocityRef.current) > 0.0001) {
            pivotGroup.rotation.y += rotationVelocityRef.current;
            rotationVelocityRef.current *= 0.92;
          } else {
            pivotGroup.rotation.y += autoRotateSpeed;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  // Pointer events for horizontal-only rotation
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    previousPointerXRef.current = e.clientX;
    rotationVelocityRef.current = 0;
    setIsGrabbing(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !modelGroupRef.current) return;

    const deltaX = e.clientX - previousPointerXRef.current;
    previousPointerXRef.current = e.clientX;

    const sensitivity = 0.008;
    const rotDelta = deltaX * sensitivity;

    modelGroupRef.current.rotation.y += rotDelta;
    rotationVelocityRef.current = rotDelta;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsGrabbing(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleResetRotation = () => {
    if (modelGroupRef.current) {
      modelGroupRef.current.rotation.y = 0;
      rotationVelocityRef.current = 0;
    }
  };

  return (
    <div
      className={`relative w-full h-[450px] sm:h-[550px] lg:h-[650px] flex items-center justify-center select-none touch-none overflow-hidden ${
        isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
      } ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 1. Concentric Halo Background Rings & Central Glow */}
      <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 flex items-center justify-center">
        {/* Soft Radial Center Light Glow */}
        <div className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full bg-radial from-white via-white/80 to-transparent blur-xl opacity-90" />

        {/* Inner Halo Ring */}
        <div className="absolute w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] rounded-full border border-black/15 shadow-sm" />

        {/* Middle Halo Ring */}
        <div className="absolute w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] rounded-full border border-black/10" />

        {/* Outer Halo Ring */}
        <div className="absolute w-[480px] h-[480px] sm:w-[600px] sm:h-[600px] rounded-full border border-black/[0.05]" />
      </div>

      {/* 2. 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 z-10" />

      {/* 3. Atmospheric Smoke / Ground Mist overlay */}
      <div className="absolute bottom-0 inset-x-0 h-44 pointer-events-none z-20 flex flex-col justify-end">
        <div
          className="w-full h-full"
          style={{
            background:
              'linear-gradient(to top, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.8) 35%, rgba(255, 255, 255, 0.3) 70%, transparent 100%)',
          }}
        />
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-30">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
          <div className="text-sm font-medium tracking-wider text-black/70">
            LOADING 3D MESH ({progress}%)
          </div>
          <div className="w-36 h-1.5 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {loadError && (
        <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-2 z-30 px-4 text-center">
          <p className="text-red-500 font-semibold">{loadError}</p>
          <p className="text-xs text-black/50">Ensure 3dmesh.glb exists in public directory.</p>
        </div>
      )}

      {/* Interactive Drag Pill Badge */}
      {!loading && !loadError && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#2A2A2A] text-white backdrop-blur-md text-[11px] font-semibold tracking-wider uppercase shadow-xl border border-white/10 transition-opacity duration-300">
          <MoveHorizontal className="w-4 h-4 text-white/80 animate-pulse" />
          <span>Drag horizontally to rotate</span>
        </div>
      )}

      {/* Reset button */}
      {!loading && !loadError && (
        <button
          onClick={handleResetRotation}
          title="Reset Rotation"
          className="absolute top-6 right-6 z-30 p-3 rounded-full bg-white text-black shadow-lg border border-black/10 transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ModelViewer;
