import React, { useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import ParticleSystem from './components/ParticleSystem';
import HandTracker from './components/HandTracker';
import Controls from './components/Controls';
import { ParticleShape } from './types';

const App: React.FC = () => {
  const [shape, setShape] = useState<ParticleShape>(ParticleShape.SATURN);
  const [color, setColor] = useState<string>('#ffcc00');
  
  // Hand State
  const [expansion, setExpansion] = useState<number>(1.0);
  const [dispersion, setDispersion] = useState<number>(0.0);
  const [rotation, setRotation] = useState<number>(0.0);
  const [isHandsDetected, setIsHandsDetected] = useState<boolean>(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState<boolean>(true);

  // Update multiple stats from tracker
  const handleHandStateChange = useCallback((state: { expansion: number; dispersion: number; rotation: number }) => {
    setExpansion(state.expansion);
    setDispersion(state.dispersion);
    setRotation(state.rotation);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* 3D Scene */}
      <Canvas className="absolute inset-0 z-10" dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
        
        <color attach="background" args={['#050505']} />
        
        <Suspense fallback={null}>
          <ParticleSystem 
            shape={shape} 
            color={color} 
            expansion={expansion}
            dispersion={dispersion}
            rotation={rotation}
            count={14000}
          />
          
          <Stars 
            radius={100} 
            depth={50} 
            count={5000} 
            factor={4} 
            saturation={0} 
            fade 
            speed={1} 
          />
        </Suspense>

        {/* Lighting & Post Processing */}
        <ambientLight intensity={0.5} />
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.9} 
            intensity={1.5} 
            radius={0.6}
          />
        </EffectComposer>

        {/* Mouse Orbit Fallback */}
        <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            autoRotate={!isHandsDetected} 
            autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Computer Vision Layer */}
      <HandTracker 
        onHandStateChange={handleHandStateChange} 
        onHandsDetected={setIsHandsDetected}
        isCameraEnabled={isCameraEnabled}
      />

      {/* UI Overlay */}
      <Controls 
        currentShape={shape}
        setShape={setShape}
        color={color}
        setColor={setColor}
        isHandsDetected={isHandsDetected}
        isCameraEnabled={isCameraEnabled}
        setIsCameraEnabled={setIsCameraEnabled}
      />
      
    </div>
  );
};

export default App;