import React from 'react';

export function DebugSphere({ position = [0, 0, 0], color = 'red', scale = 1 }) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}
