/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 public/models/earth.glb --output src/components/EarthModel.tsx --types --shadows --keepnames --transform 
Files: public/models/earth.glb [85.72MB] > J:\cosmic-journey-secondbackup\src\components\earth-transformed.glb [592.01KB] (99%)
*/

import * as THREE from 'three'
import React from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    Earth: THREE.Mesh
    Earth_Clouds: THREE.Mesh
  }
  materials: {
    Earth: THREE.MeshStandardMaterial
    Earth_Clouds: THREE.MeshStandardMaterial
  }
  animations: GLTFAction[]
}

export function Model(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/earth.glb') as GLTFResult
  return (
    <group {...props} dispose={null}>
      <mesh name="Earth" castShadow receiveShadow geometry={nodes.Earth.geometry} material={materials.Earth} position={[0, 1, 1.861]} scale={25.4} />
      <mesh name="Earth_Clouds" castShadow receiveShadow geometry={nodes.Earth_Clouds.geometry} material={materials.Earth_Clouds} position={[0, 1, 1.861]} scale={25.43} />
    </group>
  )
}

useGLTF.preload('/models/earth.glb')
