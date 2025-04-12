import React from 'react';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Sun, Earth, Mars, Venus, Mercury, Jupiter, Saturn, Uranus, Neptune } from './Planets';

const Scene = () => {
  console.log('Scene rendering');
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 30, 100]} />
      <ambientLight intensity={0.2} />
      <Sun position={[0, 0, 0]} />
      <Earth position={[30, 0, 0]} />
      <Mars position={[45, 0, 0]} />
      <Venus position={[20, 0, 0]} />
      <Mercury position={[15, 0, 0]} />
      <Jupiter position={[60, 0, 0]} />
      <Saturn position={[80, 0, 0]} />
      <Uranus position={[95, 0, 0]} />
      <Neptune position={[110, 0, 0]} />
      <OrbitControls enableZoom={true} enablePan={true} />
    </>
  );
};

export default Scene;