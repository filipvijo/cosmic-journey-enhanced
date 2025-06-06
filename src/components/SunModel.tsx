/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 public/models/sun.glb --output src/components/SunModel.tsx --types --shadows --keepnames --transform 
Files: public/models/sun.glb [1.04MB] > J:\cosmic-journey-secondbackup\src\components\sun-transformed.glb [374.36KB] (64%)
*/

import * as THREE from 'three'
import React from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    sun1: THREE.Mesh
  }
  materials: {
    sun: THREE.MeshStandardMaterial
  }
  animations: GLTFAction[]
}

export function Model(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/sun.glb') as GLTFResult
  return (
    <group {...props} dispose={null}>
      <mesh name="sun1" castShadow receiveShadow geometry={nodes.sun1.geometry} material={materials.sun} />
    </group>
  )
}

useGLTF.preload('/models/sun.glb')
