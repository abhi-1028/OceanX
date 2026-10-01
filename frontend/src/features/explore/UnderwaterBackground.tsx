import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import underwaterImage from '../../assets/oceanx-underwater-photorealistic.jpg';

type Particle = { x:number; y:number; z:number; s:number; speed:number; phase:number; opacity:number };
type Bubble = { x:number; y:number; z:number; s:number; speed:number; phase:number };

function usePointer() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      pointer.current.x = (event.clientX / Math.max(1, window.innerWidth) - .5) * 2;
      pointer.current.y = (event.clientY / Math.max(1, window.innerHeight) - .5) * 2;
    };
    window.addEventListener('mousemove', onMove, { passive:true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return pointer;
}

function PhotorealisticOcean() {
  const texture = useTexture(underwaterImage);
  texture.colorSpace = THREE.SRGBColorSpace;
  const pointer = usePointer();
  const scene = useRef<THREE.Group>(null);
  const image = useRef<THREE.Mesh>(null);
  const particles = useRef<(THREE.Mesh | null)[]>([]);
  const bubbles = useRef<(THREE.Mesh | null)[]>([]);

  const particleData = useMemo<Particle[]>(() => Array.from({ length: 240 }, (_, i) => ({
    x: -7.5 + ((i * 1.731) % 15),
    y: -4.2 + ((i * 2.113) % 8.4),
    z: -2.0 + ((i * 1.173) % 4.6),
    s: .006 + (i % 6) * .004,
    speed: .012 + (i % 8) * .004,
    phase: i * .47,
    opacity: .10 + (i % 5) * .035,
  })), []);

  const bubbleData = useMemo<Bubble[]>(() => Array.from({ length: 26 }, (_, i) => ({
    x: -6.7 + ((i * 2.61) % 13.4),
    y: -3.7 + ((i * 1.71) % 5.2),
    z: -1.1 + ((i * 1.37) % 2.8),
    s: .018 + (i % 5) * .009,
    speed: .12 + (i % 6) * .022,
    phase: i * .83,
  })), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (scene.current) {
      scene.current.rotation.y = THREE.MathUtils.lerp(scene.current.rotation.y, pointer.current.x * .018, .035);
      scene.current.rotation.x = THREE.MathUtils.lerp(scene.current.rotation.x, -pointer.current.y * .012, .035);
    }
    if (image.current) {
      image.current.position.x = THREE.MathUtils.lerp(image.current.position.x, pointer.current.x * -.09, .035);
      image.current.position.y = THREE.MathUtils.lerp(image.current.position.y, pointer.current.y * .055, .035);
    }
    particles.current.forEach((m, i) => {
      if (!m) return;
      const p = particleData[i];
      m.position.y = p.y + Math.sin(t * p.speed * 5 + p.phase) * .045;
      m.position.x = p.x + Math.sin(t * .08 + p.phase) * .035;
    });
    bubbles.current.forEach((m, i) => {
      if (!m) return;
      const b = bubbleData[i];
      const travel = (t * b.speed + b.phase) % 5.5;
      m.position.y = b.y + travel - 2.7;
      m.position.x = b.x + Math.sin(t * .26 + b.phase) * .10;
      m.scale.setScalar(.82 + .18 * Math.sin(t * .9 + b.phase));
    });
  });

  return <group ref={scene}>
    <mesh ref={image} position={[0,0,-4.8]} scale={[1.02,1.02,1]}>
      <planeGeometry args={[15.6,10.4,1,1]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>

    <mesh position={[0,-.35,-2.7]}>
      <planeGeometry args={[16,10]} />
      <meshBasicMaterial color="#42cde8" transparent opacity={.035} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>

    {particleData.map((p, i) => <mesh key={i} ref={el => { particles.current[i] = el; }} position={[p.x,p.y,p.z]}>
      <sphereGeometry args={[p.s,5,5]} />
      <meshBasicMaterial color="#d8f8ff" transparent opacity={p.opacity} depthWrite={false} />
    </mesh>)}

    {bubbleData.map((b, i) => <mesh key={i} ref={el => { bubbles.current[i] = el; }} position={[b.x,b.y,b.z]}>
      <sphereGeometry args={[b.s,10,10]} />
      <meshBasicMaterial color="#d9faff" transparent opacity={.20} depthWrite={false} />
    </mesh>)}
  </group>;
}

function UnderwaterScene() {
  return <>
    <color attach="background" args={['#021522']} />
    <fogExp2 attach="fog" args={['#06324a', .018]} />
    <ambientLight intensity={.20} color="#8bdff0" />
    <hemisphereLight args={['#a9efff','#020b12',.65]} />
    <directionalLight position={[-3,8,2]} intensity={1.0} color="#b8f6ff" />
    <group position={[0,0,0]}>
      <PhotorealisticOcean />
    </group>
  </>;
}

export function UnderwaterBackground({ className='' }: { className?: string }) {
  return <div className={`underwater-background ${className}`} aria-hidden="true">
    <Canvas
      camera={{ position:[0,0,8.5], fov:48 }}
      dpr={[1,1.3]}
      gl={{ antialias:true, alpha:false, powerPreference:'high-performance', toneMapping:THREE.ACESFilmicToneMapping, toneMappingExposure:1.0 }}
    >
      <UnderwaterScene />
    </Canvas>
    <div className="underwater-vignette" />
    <div className="underwater-surface-glow" />
    <div className="underwater-depth-haze" />
    <div className="underwater-photo-grade" />
  </div>;
}
