import * as THREE from 'three';
import { ParticleShape } from '../types';

export const generateShapePositions = (shape: ParticleShape, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    let x = 0, y = 0, z = 0;

    switch (shape) {
      case ParticleShape.HEART: {
        // Parametric Heart
        const t = Math.random() * Math.PI * 2;
        const p = Math.random() * Math.PI * 2; // Volume distribution
        const r = Math.pow(Math.random(), 1/3); // Uniform sphere distribution-ish
        
        // Base heart curve
        let hx = 16 * Math.pow(Math.sin(t), 3);
        let hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        let hz = 2 * Math.cos(t) * Math.sin(t) * 4; // Add some depth

        // Add volume noise
        x = hx * 0.1 + (Math.random() - 0.5) * 0.5;
        y = hy * 0.1 + (Math.random() - 0.5) * 0.5;
        z = hz * 0.1 + (Math.random() - 0.5) * 2;
        break;
      }

      case ParticleShape.FLOWER: {
        // Rose/Flower curve
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const k = 4; // Petals
        const r = 2 * Math.cos(k * theta) + 1; 
        
        const dist = Math.random() * 2;
        x = dist * r * Math.sin(phi) * Math.cos(theta);
        y = dist * r * Math.sin(phi) * Math.sin(theta);
        z = dist * r * Math.cos(phi) * 0.3; // Flattened z
        break;
      }

      case ParticleShape.SATURN: {
        // Sphere + Ring
        const isRing = Math.random() > 0.4;
        if (isRing) {
          const theta = Math.random() * Math.PI * 2;
          const r = 2.5 + Math.random() * 1.5;
          x = r * Math.cos(theta);
          z = r * Math.sin(theta);
          y = (Math.random() - 0.5) * 0.1; // Thin ring
        } else {
          // Planet
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = 1.5;
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
        }
        
        // Tilt
        const tilt = Math.PI / 6;
        const tempX = x;
        x = tempX * Math.cos(tilt) - y * Math.sin(tilt);
        y = tempX * Math.sin(tilt) + y * Math.cos(tilt);
        break;
      }

      case ParticleShape.BUDDHA: {
        // Abstract Meditative Figure (Stacked spheres approximation)
        const part = Math.random();
        let cy = 0, r = 0;
        
        if (part < 0.25) { // Head
            cy = 1.8; r = 0.6;
        } else if (part < 0.6) { // Body
            cy = 0.5; r = 1.0;
        } else { // Legs/Base
            cy = -1.0; r = 1.6;
            // Flatten base
             const theta = Math.random() * Math.PI * 2;
             const phi = Math.acos(2 * Math.random() - 1);
             x = r * Math.sin(phi) * Math.cos(theta);
             y = cy + r * Math.sin(phi) * Math.sin(theta) * 0.6;
             z = r * Math.cos(phi);
             positions[i3] = x;
             positions[i3 + 1] = y;
             positions[i3 + 2] = z;
             continue;
        }

        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = cy + r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }

      case ParticleShape.FIREWORKS: {
        // Explosion sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const velocity = 0.5 + Math.random() * 4.0;
        // Store velocity direction as position for now, shader/anim loop will expand it
        x = velocity * Math.sin(phi) * Math.cos(theta);
        y = velocity * Math.sin(phi) * Math.sin(theta);
        z = velocity * Math.cos(phi);
        break;
      }

      default: { // Sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 2;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
      }
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }

  return positions;
};
