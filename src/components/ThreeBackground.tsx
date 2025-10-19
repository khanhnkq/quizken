import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import modelUrl from "@/assets/model/mascot/scene.gltf?url";

gsap.registerPlugin(ScrollTrigger);

const ThreeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const bg = bgRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 5);
    const dir = new THREE.DirectionalLight(0xffffff, 2);
    dir.position.set(3, 5, 5);
    scene.add(ambient, dir);

    // Load model
    const loader = new GLTFLoader();
    let model: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    const clock = new THREE.Clock();

    // Responsive model adjuster
    const updateModelResponsive = () => {
      if (!model || !container) return;
      const width = container.clientWidth;
      const isMobile = width < 640; // sm
      const isTablet = width >= 640 && width < 1024; // md
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

        // Set up animation mixer if animations exist
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const action = mixer.clipAction(gltf.animations[0]);
          const clipDuration = action.getClip().duration;

          // Reset trạng thái ban đầu
          action.reset();
          action.play();
          action.paused = true;
          action.time = 0;

          // ScrollTrigger scrub 2 chiều (cuộn xuống -> tiến, cuộn lên -> lùi)
          ScrollTrigger.create({
            trigger: container,
            start: "top-170", // bắt đầu khi phần đầu section chạm giữa màn hình
            end: "+=1500", // kết thúc khi cuộn hết section
            scrub: true, // cho phép scrub 2 chiều
            onUpdate: (self) => {
              const progress = self.progress; // 0 → 1 khi cuộn xuống, 1 → 0 khi cuộn lên
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
              // Khi cuộn ngược hoàn toàn lên trên, đảm bảo reset animation
              action.reset();
              action.play();
              action.paused = true;
              action.time = 0;
              mixer.update(0);
            },
          });
        } else {
          // Fallback rotation if no animations
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
      (err) => console.error("GLTF load error:", err)
    );

    // Animation loop
    const animate = () => {
      if (mixer) mixer.update(clock.getDelta() * 0.5);
      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Responsive helpers
    let resizeObserver: ResizeObserver | null = null;
    let resizeRafId: number | null = null;

    const updateRendererSize = (w: number, h: number) => {
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    // Observe container size changes
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

    // Fallback: window resize (orientation change, etc.)
    const handleWindowResize = () => {
      if (!container) return;
      updateRendererSize(container.clientWidth, container.clientHeight);
      updateModelResponsive();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleWindowResize);

    // Cleanup
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (resizeObserver) resizeObserver.disconnect();
      if (resizeRafId !== null) cancelAnimationFrame(resizeRafId);
      window.removeEventListener("resize", handleWindowResize);
      renderer.dispose();
      gsap.killTweensOf("*");
      ScrollTrigger.getAll().forEach((t) => t.kill());
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
