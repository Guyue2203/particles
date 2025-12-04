import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface HandTrackerProps {
  onHandStateChange: (state: { expansion: number; dispersion: number; rotation: number }) => void;
  onHandsDetected: (detected: boolean) => void;
  isCameraEnabled: boolean;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandStateChange, onHandsDetected, isCameraEnabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);
  const lastVideoTimeRef = useRef(-1);
  const requestRef = useRef<number | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  // Smooth values to prevent jitter, but faster for responsiveness
  const smoothRef = useRef({ expansion: 1.0, dispersion: 0.0, rotation: 0.0 });
  
  // Increased lerp speed for "Rapid Real-time" feel
  const LERP_SPEED = 0.3; 

  const calculateHandOpenness = useCallback((landmarks: Array<{ x: number; y: number; z: number }>) => {
    // Compare wrist (0) to finger tips (4, 8, 12, 16, 20)
    const wrist = landmarks[0];
    const tips = [4, 8, 12, 16, 20];
    let avgDist = 0;
    
    // Calculate scale of hand (wrist to middle finger mcp) to normalize
    const handSize = Math.sqrt(
      Math.pow(wrist.x - landmarks[9].x, 2) + Math.pow(wrist.y - landmarks[9].y, 2)
    );

    tips.forEach(idx => {
      const d = Math.sqrt(
        Math.pow(wrist.x - landmarks[idx].x, 2) + Math.pow(wrist.y - landmarks[idx].y, 2)
      );
      avgDist += d;
    });
    avgDist /= 5;

    // Ratio > 1.3 usually means open, < 0.8 usually means fist
    const ratio = avgDist / handSize;
    
    // Logic Inverted: 
    // We want Open Hand (High Ratio) -> High Dispersion (1.0)
    // We want Fist (Low Ratio) -> Low Dispersion (0.0)
    
    const openness = (ratio - 0.7) / (1.5 - 0.7);
    return Math.max(0, Math.min(1, openness)); // Returns 1 for Open, 0 for Fist
  }, []);

  const processLandmarks = useCallback((landmarks: Array<Array<{ x: number; y: number; z: number }>>) => {
    let targetExpansion = 1.0;
    let targetRotation = 0.0;
    let targetDispersion = 0.0;

    if (landmarks.length === 2) {
      // --- Two Hands Logic ---
      
      const h1 = landmarks[0][9]; // Middle finger MCP
      const h2 = landmarks[1][9];
      
      // 1. Expansion (Distance)
      const dist = Math.sqrt(Math.pow(h1.x - h2.x, 2) + Math.pow(h1.y - h2.y, 2));
      targetExpansion = Math.max(0.2, Math.min(dist * 3.5, 4.0));

      // 2. Rotation (Angle between hands)
      const dy = h2.y - h1.y;
      const dx = h2.x - h1.x;
      targetRotation = -Math.atan2(dy, dx); 

      // 3. Dispersion (Average Openness of both hands)
      // Open hand = high dispersion (explode)
      const disp1 = calculateHandOpenness(landmarks[0]);
      const disp2 = calculateHandOpenness(landmarks[1]);
      targetDispersion = (disp1 + disp2) / 2;

    } else if (landmarks.length === 1) {
      // --- One Hand Logic (Optimized for Coolness) ---
      const hand = landmarks[0];
      const wrist = hand[0];
      const middleMCP = hand[9];
      const thumbTip = hand[4];
      const pinkyTip = hand[20];

      // 1. Rotation: Hand Tilt (Roll)
      // Calculate angle of the hand orientation (Wrist to Middle MCP)
      const dx = middleMCP.x - wrist.x;
      const dy = middleMCP.y - wrist.y;
      // -atan2 because Y is inverted in screen coords (top is 0)
      // Adjust offset so upright hand is 0 rotation
      targetRotation = -Math.atan2(dy, dx) - Math.PI / 2;

      // 2. Expansion: Hand Spread (Thumb to Pinky)
      // Using distance between thumb and pinky as "Hand Scale"
      const spread = Math.sqrt(Math.pow(thumbTip.x - pinkyTip.x, 2) + Math.pow(thumbTip.y - pinkyTip.y, 2));
      // Map spread: roughly 0.1 (closed) to 0.5 (wide open) -> Expansion 0.5 to 3.5
      targetExpansion = Math.max(0.5, Math.min(spread * 7.0, 3.5));

      // 3. Dispersion: Open Hand Explode
      // Calculate openness (0 = Fist, 1 = Open)
      targetDispersion = calculateHandOpenness(hand);
      
      // Make the explosion trigger snappy
      // If hand is opening (val > 0.5), ramp it up quickly to 1.0
      if (targetDispersion > 0.5) {
        targetDispersion = Math.min(1.0, targetDispersion * 1.4);
      }
    }

    // Apply smoothing (Linear Interpolation) with faster speed
    const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;
    
    smoothRef.current.expansion = lerp(smoothRef.current.expansion, targetExpansion, LERP_SPEED);
    smoothRef.current.dispersion = lerp(smoothRef.current.dispersion, targetDispersion, LERP_SPEED);
    smoothRef.current.rotation = lerp(smoothRef.current.rotation, targetRotation, LERP_SPEED);

    onHandStateChange({
      expansion: smoothRef.current.expansion,
      dispersion: smoothRef.current.dispersion,
      rotation: smoothRef.current.rotation
    });
  }, [calculateHandOpenness, onHandStateChange]);

  const predictWebcam = useCallback(() => {
    if (!handLandmarkerRef.current || !videoRef.current) return;

    let startTimeMs = performance.now();
    if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
      lastVideoTimeRef.current = videoRef.current.currentTime;
      
      const result = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      if (result.landmarks && result.landmarks.length > 0) {
        onHandsDetected(true);
        processLandmarks(result.landmarks);
      } else {
        onHandsDetected(false);
      }
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  }, [onHandsDetected, processLandmarks]);

  useEffect(() => {
    if (!isCameraEnabled) {
      // Cleanup
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      onHandsDetected(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    let running = true;

    const setupMediaPipe = async () => {
      try {
        if (!handLandmarkerRef.current) {
            const vision = await FilesetResolver.forVisionTasks(
              "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
            
            if (!running) return;

            handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2
            });
        }

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: "user" }
          });
          
          if (!running) {
             stream.getTracks().forEach(track => track.stop());
             return;
          }

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener("loadeddata", predictWebcam);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Error initializing MediaPipe:", err);
        setLoading(false);
      }
    };

    setupMediaPipe();

    return () => {
      running = false;
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isCameraEnabled, predictWebcam, onHandsDetected]);

  return (
    <div className="absolute bottom-4 left-4 z-50 pointer-events-none">
      <div className="relative w-32 h-24 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg bg-black/50">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${isCameraEnabled ? 'opacity-100' : 'opacity-0'}`} 
          autoPlay
          playsInline
          muted
        />
        {!isCameraEnabled && (
           <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/50 bg-black/80 font-mono text-center px-1">
             Camera Disabled
           </div>
        )}
        {loading && isCameraEnabled && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-white/70 bg-black/40">
            Init...
          </div>
        )}
      </div>
      <div className="mt-2 text-[10px] text-white/60 font-mono space-y-1">
        <p>{isCameraEnabled ? '📡 Camera Input' : '🚫 Input Disabled'}</p>
      </div>
    </div>
  );
};

export default HandTracker;