import React from 'react';

export enum ParticleShape {
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  BUDDHA = 'Meditate', // Procedural approximation
  FIREWORKS = 'Fireworks',
  SPHERE = 'Sphere'
}

export interface AppState {
  currentShape: ParticleShape;
  particleColor: string;
  expansion: number; // Controlled by hand distance (0.5 to 3.0)
  dispersion: number; // Controlled by fist/open hand (0.0 to 1.0)
  rotation: number; // Controlled by hand angle
  particleCount: number;
}

export type HandLandmarkerResult = {
  landmarks: Array<Array<{ x: number; y: number; z: number }>>;
};

// Augment the JSX namespace to support React Three Fiber elements
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      points: any;
      bufferGeometry: any;
      bufferAttribute: any;
      pointsMaterial: any;
      ambientLight: any;
      color: any;
    }
  }
}
