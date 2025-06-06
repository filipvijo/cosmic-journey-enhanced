/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 public/models/neptune.glb --output src/components/NeptuneModel.tsx --types --shadows --keepnames --transform 
Files: public/models/neptune.glb [1.69MB] > J:\cosmic-journey-secondbackup\src\components\neptune-transformed.glb [108.64KB] (94%)
*/

import * as THREE from 'three'
import React from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    Neptune: THREE.Mesh
  }
  materials: {
    Neptune: THREE.MeshStandardMaterial
  }
  animations: GLTFAction[]
}

export function Model(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/neptune.glb') as GLTFResult
  return (
    <group {...props} dispose={null}>
      <mesh name="Neptune" castShadow receiveShadow geometry={nodes.Neptune.geometry} material={materials.Neptune} position={[0, 1, 7.935]} scale={24.4} />
    </group>
  )
}

useGLTF.preload('/models/neptune.glb')
