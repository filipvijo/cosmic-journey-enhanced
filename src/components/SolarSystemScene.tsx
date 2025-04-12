import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface SolarSystemSceneProps {
  onPlanetSelect: (planetName: string) => void;
}

function PlanetModel({ url, ...props }: { url: string } & JSX.IntrinsicElements['group']) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} {...props} />;
}

const sunScale = 20;
const mercuryScale = 0.1;
const venusScale = 0.3;
const earthScale = 0.1;
const marsScale = 0.1;
const jupiterScale = 0.5;
const saturnScale = 0.4;
const uranusScale = 0.5;
const neptuneScale = 0.5;

const earthOrbitSpeed = 0.1;
const earthOrbitRadius = 50;
const marsOrbitSpeed = 0.08;
const marsOrbitRadius = 80;
const jupiterOrbitSpeed = 0.04;
const jupiterOrbitRadius = 150;
const saturnOrbitSpeed = 0.03;
const saturnOrbitRadius = 250;
const venusOrbitSpeed = 0.12;
const venusOrbitRadius = 35;
const mercuryOrbitSpeed = 0.15;
const mercuryOrbitRadius = 20;
const uranusOrbitSpeed = 0.02;
const uranusOrbitRadius = 350;
const neptuneOrbitSpeed = 0.01;
const neptuneOrbitRadius = 450;

function SceneContent({ onPlanetSelect }: SolarSystemSceneProps) {
  const earthGroupRef = useRef<THREE.Group>(null);
  const marsGroupRef = useRef<THREE.Group>(null);
  const sunGroupRef = useRef<THREE.Group>(null);
  const jupiterGroupRef = useRef<THREE.Group>(null);
  const saturnGroupRef = useRef<THREE.Group>(null);
  const venusGroupRef = useRef<THREE.Group>(null);
  const mercuryGroupRef = useRef<THREE.Group>(null);
  const uranusGroupRef = useRef<THREE.Group>(null);
  const neptuneGroupRef = useRef<THREE.Group>(null);

  const handlePlanetClick = (planetName: string) => {
    console.log(`Clicked on: ${planetName} - Triggering view switch.`);
    onPlanetSelect(planetName);
  };

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    if (earthGroupRef.current) {
      const earthAngle = elapsedTime * earthOrbitSpeed;
      earthGroupRef.current.position.x = Math.cos(earthAngle) * earthOrbitRadius;
      earthGroupRef.current.position.z = Math.sin(earthAngle) * earthOrbitRadius;
    }

    if (marsGroupRef.current) {
      const marsAngle = elapsedTime * marsOrbitSpeed;
      marsGroupRef.current.position.x = Math.cos(marsAngle) * marsOrbitRadius;
      marsGroupRef.current.position.z = Math.sin(marsAngle) * marsOrbitRadius;
    }

    if (mercuryGroupRef.current) {
      const mercuryAngle = elapsedTime * mercuryOrbitSpeed;
      mercuryGroupRef.current.position.x = Math.cos(mercuryAngle) * mercuryOrbitRadius;
      mercuryGroupRef.current.position.z = Math.sin(mercuryAngle) * mercuryOrbitRadius;
    }

    if (venusGroupRef.current) {
      const venusAngle = elapsedTime * venusOrbitSpeed;
      venusGroupRef.current.position.x = Math.cos(venusAngle) * venusOrbitRadius;
      venusGroupRef.current.position.z = Math.sin(venusAngle) * venusOrbitRadius;
    }

    if (jupiterGroupRef.current) {
      const jupiterAngle = elapsedTime * jupiterOrbitSpeed;
      jupiterGroupRef.current.position.x = Math.cos(jupiterAngle) * jupiterOrbitRadius;
      jupiterGroupRef.current.position.z = Math.sin(jupiterAngle) * jupiterOrbitRadius;
    }

    if (saturnGroupRef.current) {
      const saturnAngle = elapsedTime * saturnOrbitSpeed;
      saturnGroupRef.current.position.x = Math.cos(saturnAngle) * saturnOrbitRadius;
      saturnGroupRef.current.position.z = Math.sin(saturnAngle) * saturnOrbitRadius;
    }

    if (uranusGroupRef.current) {
      const uranusAngle = elapsedTime * uranusOrbitSpeed;
      uranusGroupRef.current.position.x = Math.cos(uranusAngle) * uranusOrbitRadius;
      uranusGroupRef.current.position.z = Math.sin(uranusAngle) * uranusOrbitRadius;
    }

    if (neptuneGroupRef.current) {
      const neptuneAngle = elapsedTime * neptuneOrbitSpeed;
      neptuneGroupRef.current.position.x = Math.cos(neptuneAngle) * neptuneOrbitRadius;
      neptuneGroupRef.current.position.z = Math.sin(neptuneAngle) * neptuneOrbitRadius;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 250, 600]} fov={75} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[100, 100, 100]} intensity={1.5} />
      <OrbitControls enableDamping dampingFactor={0.1} maxDistance={10000} />

      <Suspense fallback={null}>
        <group ref={sunGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Sun'); }} scale={sunScale}>
          <PlanetModel url="/models/sun.glb" />
          <pointLight intensity={2.5} distance={2000} color="#FFDAAA" decay={1.5} />
        </group>

        <group ref={mercuryGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Mercury'); }} scale={mercuryScale}>
          <PlanetModel url="/models/mercury.glb" />
        </group>
        <group ref={venusGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Venus'); }} scale={venusScale}>
          <PlanetModel url="/models/venus.glb" />
        </group>
        <group ref={earthGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Earth'); }} scale={earthScale}>
          <PlanetModel url="/models/earth.glb" />
        </group>
        <group ref={marsGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Mars'); }} scale={marsScale}>
          <PlanetModel url="/models/mars.glb" />
        </group>
        <group ref={jupiterGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Jupiter'); }} scale={jupiterScale}>
          <PlanetModel url="/models/jupiter.glb" />
        </group>
        <group ref={saturnGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Saturn'); }} scale={saturnScale}>
          <PlanetModel url="/models/saturn.glb" />
        </group>
        <group ref={uranusGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Uranus'); }} scale={uranusScale}>
          <PlanetModel url="/models/uranus.glb" />
        </group>
        <group ref={neptuneGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Neptune'); }} scale={neptuneScale}>
          <PlanetModel url="/models/neptune.glb" />
        </group>
      </Suspense>

      <Stars radius={1000} depth={60} count={5000} factor={7} />
    </>
  );
}

export function SolarSystemScene({ onPlanetSelect }: SolarSystemSceneProps) {
  console.log('Rendering SolarSystemScene Canvas...');

  return (
    <Canvas style={{ background: 'black', width: '100%', height: '100%' }}>
      <SceneContent onPlanetSelect={onPlanetSelect} />
    </Canvas>
  );
}

useGLTF.preload('/models/sun.glb');
useGLTF.preload('/models/mercury.glb');
useGLTF.preload('/models/venus.glb');
useGLTF.preload('/models/earth.glb');
useGLTF.preload('/models/mars.glb');
useGLTF.preload('/models/jupiter.glb');
useGLTF.preload('/models/saturn.glb');
useGLTF.preload('/models/uranus.glb');
useGLTF.preload('/models/neptune.glb');
