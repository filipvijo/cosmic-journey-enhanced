import React from 'react';

export function Model(props: JSX.IntrinsicElements['mesh']) {
  return (
    <mesh {...props}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="yellow" emissive="orange" emissiveIntensity={1} />
    </mesh>
  );
}
