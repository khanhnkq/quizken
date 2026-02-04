import { useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Billboard, useGLTF, Environment, ContactShadows } from "@react-three/drei";
import { TextureLoader, Mesh, Group } from "three";
import { cn } from "@/lib/utils";

interface BossStageProps {
  bossState: "idle" | "attacking" | "hurt" | "dying";
  playerState: "idle" | "attacking" | "hurt";
  bossEmotion: string;
  floatingTexts: {id: number, text: string, x: number, y: number, color: string}[];
}

// Cute 3D Character Model built from Primitives
const CuteHero3D = ({ state }: { state: string }) => {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);

  useFrame((clockState) => {
    if (!groupRef.current || !headRef.current) return;
    const t = clockState.clock.getElapsedTime();

    // Idle Animations
    groupRef.current.position.y = Math.sin(t * 2) * 0.1;
    headRef.current.rotation.z = Math.sin(t * 3) * 0.05;

    // Pulse/Breath
    groupRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.02);

    // Attack Animation (simple jump/spin)
    if (state === "attacking") {
      groupRef.current.position.z = Math.sin(t * 15) * -1.5;
      groupRef.current.rotation.y += 0.5;
    } else {
      groupRef.current.position.z = 0;
      groupRef.current.rotation.y = 0;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Head ONLY (Simplification as requested) */}
      <group ref={headRef} position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.6, 32, 32]} /> 
          <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.2} />
        </mesh>
        
        {/* Face (White area) */}
        <mesh position={[0, 0, 0.35]}>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial color="white" roughness={0.5} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.2, 0.15, 0.75]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.2, 0.15, 0.75]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Little Blush */}
        <mesh position={[-0.25, -0.05, 0.75]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#ffaaaa" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.25, -0.05, 0.75]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#ffaaaa" transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  );
};

// 3D Character Component (Existing Billboard Logic for Boss)
const Character3D = ({ 
  textureUrl, 
  characterState, 
  isBoss = false 
}: { 
  textureUrl: string, 
  characterState: string,
  isBoss?: boolean
}) => {
  const texture = useLoader(TextureLoader, textureUrl);
  const meshRef = useRef<Mesh>(null);

  useFrame((clockState) => {
    if (!meshRef.current) return;
    
    const t = clockState.clock.getElapsedTime();
    
    // Idle Animation (Bobbing)
    meshRef.current.position.y = Math.sin(t * 2) * 0.15;

    // Attack Animation (Z-axis Lunge)
    if (characterState === "attacking") {
       meshRef.current.position.z = Math.sin(t * 15) * 2;
    } else {
       meshRef.current.position.z = 0;
    }

    // Hurt Animation (Shake)
    if (characterState === "hurt") {
       meshRef.current.position.x = Math.sin(t * 50) * 0.2;
    } else {
       meshRef.current.position.x = 0;
    }
  });

  return (
    <Billboard position={[0, 0, 0]}>
       <mesh ref={meshRef} castShadow>
         <planeGeometry args={isBoss ? [8, 8] : [3, 3]} />
         <meshStandardMaterial 
            map={texture} 
            transparent 
            opacity={characterState === "dying" ? 0.3 : 1}
            color={characterState === "hurt" ? "#ff8888" : "white"}
            roughness={0.5}
            metalness={0.1}
         />
       </mesh>
    </Billboard>
  );
};

// Low-poly Mountain Component




// 3D Treehouse Model
// Procedural Cloud Component
const Cloud = ({ position }: { position: [number, number, number] }) => {
  const groupRef = useRef<Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.x += Math.sin(state.clock.getElapsedTime() * 0.5 + position[0]) * 0.005;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="white" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.4, -0.1, 0.1]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="white" transparent opacity={0.8} />
      </mesh>
      <mesh position={[-0.4, -0.1, -0.1]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="white" transparent opacity={0.8} />
      </mesh>
    </group>
  );
};

// 3D Forest House Model
const ForestHouse = () => {
  const { scene } = useGLTF("/models/forest_house/scene.gltf");
  
  // Enable shadows for all meshes in the model
  scene.traverse((node) => {
    if ((node as Mesh).isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  return <primitive object={scene} scale={2.2} position={[-6, -2.5, -15]} rotation={[0, Math.PI/-15, 0]} />;
};

// Main Scene Content
const Scene = ({ bossState, playerState, bossEmotion }: BossStageProps) => {
  return (
    <>
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />

      {/* Background - The Forest House */}
      <ForestHouse />

      {/* Floating Clouds */}
      <group position={[0, 0, -10]}>
        <Cloud position={[-10, 15, -15]} />
        <Cloud position={[12, 12, -20]} />
        <Cloud position={[0, 18, -25]} />
      </group>

      {/* Floor - Lush Green Grass Area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4ade80" roughness={0.8} /> 
      </mesh>

      {/* Soft Contact Shadows (Sketchfab Style) */}
      <ContactShadows 
        position={[0, -2.4, 0]} 
        opacity={0.4} 
        scale={40} 
        blur={2} 
        far={4.5} 
      />

      {/* BOSS (Deep background) */}
      <group position={[0, 1, -15]}>
        <Character3D 
          textureUrl={`/images/mascot/${bossEmotion}.png`} 
          characterState={bossState}
          isBoss
        />
      </group>

      {/* PLAYER (Foreground - Near camera) */}
      <group position={[0, -1.2, 4]}>
        <CuteHero3D state={playerState} />
      </group>
    </>
  );
};

export const BossStage = (props: BossStageProps) => {
  return (
    <div className="fixed inset-0 bg-sky-400 overflow-hidden z-0">
      
      <Canvas camera={{ position: [0, 0.5, 10], fov: 60 }} shadows>
        <Scene {...props} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          minPolarAngle={Math.PI/2.1} 
          maxPolarAngle={Math.PI/1.9} 
          minAzimuthAngle={-Math.PI/12}
          maxAzimuthAngle={Math.PI/12}
        />
      </Canvas>

      {/* 2D Overlay for Damage Numbers */}
      <div className="absolute inset-0 pointer-events-none">
        {props.floatingTexts.map((ft) => (
             <div
               key={ft.id}
               className={cn(
                 "absolute top-[30%] left-1/2 text-6xl font-black drop-shadow-lg transition-all duration-1000 transform -translate-x-1/2 -translate-y-1/2", 
                 ft.color,
                 "animate-bounce"
               )}
             >
               {ft.text}
             </div>
        ))}
      </div>
      
    </div>
  );
};
