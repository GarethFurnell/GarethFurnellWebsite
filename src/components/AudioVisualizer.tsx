"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AudioVisualizerProps {
  audioId: string;
}

export default function AudioVisualizer({ audioId }: AudioVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const timeRef = useRef(0);

  useEffect(() => {
    const audioElement = document.getElementById(audioId) as HTMLAudioElement;
    if (!containerRef.current || !audioElement) return;

    // 1. Setup Three.js Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 8; // Moved back to prevent clipping with header/footer

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    // We want the canvas to perfectly fit the screen
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 2. Create the Sphere & Morph it into a Biological Heart
    // Detail 24 provides a very dense, fleshy mesh
    const geometry = new THREE.IcosahedronGeometry(2.0, 24); 
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ED64, // Brand green
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Pre-calculate the biological heart shape as the base
    const positionAttribute = geometry.attributes.position;
    const originalPositions = new Float32Array(positionAttribute.count * 3);
    
    for (let i = 0; i < positionAttribute.count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      let ox = positionAttribute.array[ix];
      let oy = positionAttribute.array[iy];
      let oz = positionAttribute.array[iz];

      // Heart Morph Math (Anatomical Organ style)
      const length = Math.sqrt(ox*ox + oy*oy + oz*oz);
      let nx = ox / length;
      let ny = oy / length;
      let nz = oz / length;

      if (ny < 0) {
        // Taper the ventricles into the apex
        nx *= (1.0 + ny * 0.8); 
        nz *= (1.0 + ny * 0.5); // Flatten the back
        ny *= 1.4; // Elongate the bottom
        // Twist apex to the left (anatomical orientation)
        nx -= ny * 0.3; 
      } else {
        // Atria and vessels at the top
        nx *= 1.1;
        nz *= 0.8;
        
        // Right atrium bulge
        if (nx > 0) nx += Math.pow(ny, 2) * 0.5;
        
        // Aorta / Pulmonary artery cluster bulge on the top left
        if (nx < 0) ny += Math.abs(nx) * 0.9;
      }

      // Re-scale to desired size (smaller so it fits the screen center)
      const scale = 1.1;
      originalPositions[ix] = nx * scale;
      originalPositions[iy] = ny * scale;
      originalPositions[iz] = nz * scale;
    }

    // 3. Setup Audio Context variables
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;
    let source: MediaElementAudioSourceNode | null = null;

    const initAudio = () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContext = new AudioCtx();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      try {
        source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
      } catch (e) {
        console.warn('AudioSource already connected', e);
      }
    };

    const handlePlay = () => {
      if (!initializedRef.current) {
        initAudio();
      }
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
      }
    };
    audioElement.addEventListener('play', handlePlay);

    // 4. Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      timeRef.current += 0.01;

      // Slow idle rotation - imitating a slow tumble/spin
      sphere.rotation.y += 0.002;

      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray as any);
        
        // Calculate average bass (lower frequencies)
        const bassAvg = Array.from(dataArray.slice(0, 15)).reduce((a, b) => a + b, 0) / 15;
        const bassIntensity = bassAvg / 255; // 0.0 to 1.0
        
        // Scale heart based on heavy bass (simulating a heartbeat pulse)
        const pulse = Math.pow(bassIntensity, 4) * 0.4;
        const scale = 1 + (bassIntensity * 0.1) + pulse;
        sphere.scale.set(scale, scale, scale);

        // Intricate vertex distortion & pumping
        for (let i = 0; i < positionAttribute.count; i++) {
          const ix = i * 3;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;

          // Map vertex to a frequency bin
          const freqIndex = (i * 3) % dataArray.length;
          const rawFreq = dataArray[freqIndex] / 255;
          
          // Exponential distortion for organic spikes/vibrations
          const offset = Math.pow(rawFreq, 3) * 1.5 * bassIntensity;
          
          const ox = originalPositions[ix];
          const oy = originalPositions[iy];
          const oz = originalPositions[iz];

          const length = Math.sqrt(ox*ox + oy*oy + oz*oz);
          const nx = ox / length;
          const ny = oy / length;
          const nz = oz / length;

          // Add a rapid heartbeat flutter based on time and audio
          const breathing = Math.sin(timeRef.current * 8 + length * 2) * 0.06 * bassIntensity;

          positionAttribute.setXYZ(
            i, 
            ox + nx * (offset + breathing), 
            oy + ny * (offset + breathing), 
            oz + nz * (offset + breathing)
          );
        }
        positionAttribute.needsUpdate = true;

        // Color Logic: Transition to Crimson Red on High Bass
        // Increase sensitivity: multiply bassIntensity by 1.8 so it reaches 1.0 much faster
        const effectiveBass = Math.min(1.0, bassIntensity * 1.8);
        const redShift = Math.pow(effectiveBass, 2.0); // Fast curve to 1.0
        
        // Shifts from 0.33 (Green) down to 0.0 (Red)
        const hue = 0.33 - (redShift * 0.33); 
        
        // Brighten and increase opacity on loud hits
        material.opacity = 0.2 + (effectiveBass * 0.6);
        material.color.setHSL(Math.max(0, hue), 1, 0.4 + (redShift * 0.2));
      } else {
        // Idle biological breathing when no music
        for (let i = 0; i < positionAttribute.count; i++) {
          const ix = i * 3;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;
          
          const ox = originalPositions[ix];
          const oy = originalPositions[iy];
          const oz = originalPositions[iz];

          const length = Math.sqrt(ox*ox + oy*oy + oz*oz);
          const nx = ox / length;
          const ny = oy / length;
          const nz = oz / length;

          // Slow resting heartbeat
          const breathing = Math.sin(timeRef.current * 2 + (nx * 5)) * 0.05;

          positionAttribute.setXYZ(
            i, 
            ox + nx * breathing, 
            oy + ny * breathing, 
            oz + nz * breathing
          );
        }
        positionAttribute.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 5. Handle Resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      audioElement.removeEventListener('play', handlePlay);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [audioId]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 w-screen h-screen pointer-events-none z-0 mix-blend-screen opacity-70"
    />
  );
}
