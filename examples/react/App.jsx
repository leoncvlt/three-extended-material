import React, { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ExtendedMaterial } from '../../src/ExtendedMaterial.react';
import { MeshBasicMaterial, MeshStandardMaterial, MeshNormalMaterial } from 'three';
import { Checkerboard } from '../extensions';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

function Box({superMaterial, ...props}) {
  const meshRef = useRef(null)
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta;
    meshRef.current.rotation.y += delta;
    meshRef.current.rotation.z += delta;
  })

  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <ExtendedMaterial 
        superMaterial={superMaterial} 
        extensions={[Checkerboard]} 
        color={hovered ? 'hotpink' : 'orange'}
        checkersSize={active ? 20.0 : 10.0}
        /> 
    </mesh>
  )
}

const materials = {
  "basic": MeshBasicMaterial, 
  "standard": MeshStandardMaterial,
  "normal" : MeshNormalMaterial,
}

export default function App() {
  const [superMaterial, setSuperMaterial] = useState("basic");
  useEffect(()=> {
    const gui = new GUI();
    const params = { superMaterial }
    gui
      .add(params, 'superMaterial', Object.fromEntries(Object.keys(materials).map(k => [k, k])))
      .onChange( value => setSuperMaterial(value));
  }, []);

  return (
    <Canvas>
      <color attach="background" args={["black"]} />
      <hemisphereLight skyColor={0xffffbb} groundColor={0x080820} intensity={1}/>
      <Box position={[-1.2, 0, 0]} superMaterial={materials[superMaterial]}/>
      <Box position={[1.2, 0, 0]} superMaterial={materials[superMaterial]}/>
    </Canvas>
  )
}