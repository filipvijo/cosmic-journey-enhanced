import React, { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import SolarSystem from './SolarSystem';

// Camera setup component to ensure proper positioning
const CameraSetup = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    // Position camera to see all planets
    camera.position.set(0, 50, 150);
    camera.lookAt(0, 0, 0);
    console.log('Camera position set:', camera.position);
  }, [camera]);
  
  return null;
};

const MainScene = () => {
  return (
    <Canvas style={{ width: '100%', height: '100vh', background: 'black' }}>
      <CameraSetup />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={1} />
      
      <SolarSystem />
      
      <OrbitControls enableZoom={true} enablePan={true} />
      
      {/* Add grid for reference */}
      <gridHelper args={[200, 20]} position={[0, -10, 0]} />
      <axesHelper args={[100]} />
    </Canvas>
  );
};

export default MainScene;
