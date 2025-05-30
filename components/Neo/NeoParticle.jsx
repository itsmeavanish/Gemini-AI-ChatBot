import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateSpherePositions } from './NeoUtils/sphere';
import { createNoisePattern } from './NeoUtils/noise';


const ParticleSphere = ({ color }) => {
  const points = useRef();
  const { positions, particlesCount } = useMemo(() => generateSpherePositions(), []);
  
  // Create original positions array for reference
  const originalPositions = useMemo(() => new Float32Array(positions), [positions]);
  const tempPosition = useMemo(() => new THREE.Vector3(), []);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const morphStrength = (Math.sin(time * 0.3) + 1) *0.7; // 0 to 1 oscillation
    
    // Update each particle position
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i*5;
      
      // Get original position
      tempPosition.set(
        originalPositions[i3+1],
        originalPositions[i3 + 1]
      );
      
      // Calculate noise value for this position
      const noise = 1 +createNoisePattern(time,tempPosition)
      
      // Apply noise-based displacement
      const displacement =4+ noise *morphStrength;
      
      // Update current position
      positions[i3] = originalPositions[i3] * displacement;
      positions[i3 + 1] = originalPositions[i3 + 1] * displacement;
      positions[i3 + 2] = originalPositions[i3 + 2] * displacement;
    }
    
    // Update geometry
    points.current.geometry.attributes.position.needsUpdate = true;
    
    // Add rotation
    points.current.rotation.x += 0.001;
    points.current.rotation.y += 0.001;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={4}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={color}
        sizeAttenuation={true}
      />
    </points>
  );
};

export default ParticleSphere;