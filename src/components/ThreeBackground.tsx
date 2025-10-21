import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import modelUrl from "@/assets/model/mascot/scene.gltf?url";

const ThreeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<unknown | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Only enable on desktop with precise pointer
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(min-width: 1024px)").matches &&
      window.matchMedia("(pointer:fine)").matches;
    if (!isDesktop) return;

    let cleanup: (() => void) | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        (async () => {
          const THREE = await import("three");
          const { GLTFLoader } = await import(
            "three/examples/jsm/loaders/GLTFLoader.js"
          );
          const { gsap } = await import("gsap");
          const { ScrollTrigger } = await import("gsap/ScrollTrigger");
          gsap.registerPlugin(ScrollTrigger);

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / Math.max(container.clientHeight, 1),
            0.1,
            1000
          );
          camera.position.z = 5;

          const renderer = new THREE.WebGLRenderer({
            antialias: false, // Disable on high DPI for performance
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
          });
          renderer.setSize(container.clientWidth, container.clientHeight);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap at 1.5 for performance
          container.appendChild(renderer.domElement);
          rendererRef.current = renderer;

          const ambient = new THREE.AmbientLight(0xffffff, 5);
          const dir = new THREE.DirectionalLight(0xffffff, 2);
          dir.position.set(3, 5, 5);
          scene.add(ambient, dir);

          const loader = new GLTFLoader();
          let model: THREE.Group | null = null;
          let mixer: THREE.AnimationMixer | null = null;
          const clock = new THREE.Clock();

          const updateModelResponsive = () => {
            if (!model || !container) return;
            const width = container.clientWidth;
            const isMobile = width < 640;
            const isTablet = width >= 640 && width < 1024;
            const scale = isMobile ? 2 : isTablet ? 1.4 : 3;
            model.scale.set(scale, scale, scale);
            const y = isMobile ? -2.3 : isTablet ? -2.3 : -2;
            model.position.set(0, y, 0);
          };

          loader.load(
            modelUrl,
            (gltf) => {
              model = gltf.scene;
              scene.add(model);
              updateModelResponsive();

              if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(model);
                const action = mixer.clipAction(gltf.animations[0]);
                const clipDuration = action.getClip().duration;

                action.reset();
                action.play();
                action.paused = true;
                action.time = 0;

                ScrollTrigger.create({
                  trigger: container,
                  start: "top-170",
                  end: "+=1500",
                  scrub: true,
                  onUpdate: (self) => {
                    const progress = self.progress;
                    const newTime = THREE.MathUtils.clamp(
                      progress * clipDuration,
                      0,
                      clipDuration
                    );
                    action.time = newTime;
                    mixer.update(0);
                  },
                  onEnter: () => {
                    action.reset();
                    action.play();
                    action.paused = true;
                    action.time = 0;
                  },
                  onLeaveBack: () => {
                    action.reset();
                    action.play();
                    action.paused = true;
                    action.time = 0;
                    mixer.update(0);
                  },
                });
              } else {
                gsap.to(model.rotation, {
                  y: Math.PI * 11,
                  ease: "power1.inOut",
                  scrollTrigger: {
                    trigger: container,
                    start: "top",
                    end: "bottom",
                    scrub: true,
                  },
                });
              }
            },
            undefined,
            (err: unknown) => console.error("GLTF load error:", err)
          );

          // Throttle animation to 30fps for better performance
          let lastTime = 0;
          const targetFPS = 50;
          const frameInterval = 1000 / targetFPS;

          const animate = (currentTime: number) => {
            animationIdRef.current = requestAnimationFrame(animate);
            
            const deltaTime = currentTime - lastTime;
            if (deltaTime < frameInterval) return;
            
            lastTime = currentTime - (deltaTime % frameInterval);
            
            if (mixer) mixer.update(clock.getDelta() * 0.5);
            renderer.render(scene, camera);
          };
          animate(0);

          let resizeObserver: ResizeObserver | null = null;
          let resizeRafId: number | null = null;

          const updateRendererSize = (w: number, h: number) => {
            camera.aspect = w / Math.max(h, 1);
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap at 1.5
          };

          if (container) {
            resizeObserver = new ResizeObserver((entries) => {
              for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (resizeRafId !== null) cancelAnimationFrame(resizeRafId);
                resizeRafId = requestAnimationFrame(() => {
                  updateRendererSize(Math.floor(width), Math.floor(height));
                  updateModelResponsive();
                  ScrollTrigger.refresh();
                });
              }
            });
            resizeObserver.observe(container);
          }

          const handleWindowResize = () => {
            if (!container) return;
            updateRendererSize(container.clientWidth, container.clientHeight);
            updateModelResponsive();
            ScrollTrigger.refresh();
          };
          window.addEventListener("resize", handleWindowResize);

          cleanup = () => {
            if (animationIdRef.current)
              cancelAnimationFrame(animationIdRef.current);
            if (resizeObserver) resizeObserver.disconnect();
            if (resizeRafId !== null) cancelAnimationFrame(resizeRafId);
            window.removeEventListener("resize", handleWindowResize);
            
            // Proper Three.js cleanup
            scene.traverse((object) => {
              if (object instanceof THREE.Mesh) {
                object.geometry?.dispose();
                if (Array.isArray(object.material)) {
                  object.material.forEach(mat => mat.dispose());
                } else {
                  object.material?.dispose();
                }
              }
            });
            
            renderer.dispose();
            renderer.forceContextLoss();
            gsap.killTweensOf("*");
            ScrollTrigger.getAll().forEach((t) => t.kill());
          };
        })();
      },
      { threshold: 0.2 }
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-10 pointer-events-none"
    />
  );
};

export default ThreeBackground;
