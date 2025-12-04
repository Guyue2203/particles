import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleShape } from '../types';
import { generateShapePositions } from '../utils/geometry';

interface ParticleSystemProps {
  shape: ParticleShape;
  color: string;
  expansion: number;
  dispersion: number;
  rotation: number;
  count?: number;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ 
  shape, 
  color, 
  expansion, 
  dispersion,
  rotation,
  count = 15000 
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Store target positions
  const targetPositions = useMemo(() => {
    return generateShapePositions(shape, count);
  }, [shape, count]);

  // Initial buffer
  const initialPositions = useMemo(() => {
    return new Float32Array(count * 3);
  }, [count]);

  // Random offsets for dispersion/explosion effect
  const randomOffsets = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for(let i=0; i<count*3; i++) {
        arr[i] = (Math.random() - 0.5) * 5.0; // Explosion range
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const geometry = pointsRef.current.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    
    const time = state.clock.getElapsedTime();

    // Responsive rotation: Snappier blend
    // Increased interpolation factor from 0.1 to 0.25 for rapid response
    pointsRef.current.rotation.z += (rotation - pointsRef.current.rotation.z) * 0.25;
    
    // Slight ambient rotation on Y
    pointsRef.current.rotation.y += 0.001;
    // Ambient floating on X
    pointsRef.current.rotation.x = Math.sin(time * 0.2) * 0.05;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // 1. Get Base Shape Position
      let tx = targetPositions[i3];
      let ty = targetPositions[i3 + 1];
      let tz = targetPositions[i3 + 2];

      // 2. Apply Scale (Hand Distance / Spread)
      let currentExpansion = expansion;

      // Special handling for specific shapes
      if (shape === ParticleShape.HEART) {
         const beat = 1 + Math.sin(time * 3) * 0.05;
         currentExpansion *= beat;
      }

      // 3. Apply Dispersion (Fist/Open Hand)
      // Calculate shape-bound position
      const shapeX = tx * currentExpansion;
      const shapeY = ty * currentExpansion;
      const shapeZ = tz * currentExpansion;

      // Calculate dispersed position (Chaos)
      // Add a time-based wave factor so dispersed particles move lively
      const noise = Math.sin(time * 2 + i * 0.1) * 0.2;
      
      const chaosX = shapeX + randomOffsets[i3] * dispersion + noise * dispersion;
      const chaosY = shapeY + randomOffsets[i3+1] * dispersion + noise * dispersion;
      const chaosZ = shapeZ + randomOffsets[i3+2] * dispersion + noise * dispersion;

      // Lerp current particle position to the calculated target
      // Mixing shape vs chaos based on dispersion
      const finalTargetX = shapeX * (1 - dispersion) + chaosX * dispersion;
      const finalTargetY = shapeY * (1 - dispersion) + chaosY * dispersion;
      const finalTargetZ = shapeZ * (1 - dispersion) + chaosZ * dispersion;

      // Physics easing
      // Increased from 0.1 to 0.25 for real-time responsiveness
      positions[i3] += (finalTargetX - positions[i3]) * 0.25;
      positions[i3 + 1] += (finalTargetY - positions[i3 + 1]) * 0.25;
      positions[i3 + 2] += (finalTargetZ - positions[i3 + 2]) * 0.25;
    }

    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={initialPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={color}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        transparent={true}
        opacity={0.8}
      />
    </points>
  );
};

export default ParticleSystem;