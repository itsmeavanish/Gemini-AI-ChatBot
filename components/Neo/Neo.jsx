import { Canvas } from '@react-three/fiber';
import React from 'react'
import ParticleSphere from './NeoParticle';
import { OrbitControls } from '@react-three/drei';

export default function Neo({ color }) {
  return (
    <Canvas
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        // Ensure it's behind other content
      }}
      camera={{ position: [0, 0, 5], fov: 75 }}
    >
      <ambientLight intensity={0.5} />
      <ParticleSphere color={color} />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
};
