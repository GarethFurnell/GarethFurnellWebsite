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
    camera.position.z = 7; // Moved back slightly to fit the heart shape

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    // We want the canvas to perfectly fit the screen
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 2. Create the Sphere & Morph it into a Biological Heart
    const geometry = new THREE.IcosahedronGeometry(2.0, 16); 
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

      // Heart Morph Math (Biological Organ style)
      // Normalizing first
      const length = Math.sqrt(ox*ox + oy*oy + oz*oz);
      let nx = ox / length;
      let ny = oy / length;
      let nz = oz / length;

      if (ny < 0) {
        // Taper and stretch the bottom into the apex of the heart
        nx *= (1.0 + ny * 0.6); 
        nz *= (1.0 + ny * 0.6);
        ny *= 1.3; 
      } else {
        // Widen the top and create the dual-lobed structure (atria)
        nx *= 1.1;
        nz *= 0.8; // Flatten slightly front-to-back
        ny += Math.abs(nx) * 0.6; // Pull the top sides up
      }

      // Re-scale to desired size
      const scale = 1.8;
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
        // Add an aggressive jump for the beat
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
          const offset = Math.pow(rawFreq, 3) * 1.2 * bassIntensity;
          
          const ox = originalPositions[ix];
          const oy = originalPositions[iy];
          const oz = originalPositions[iz];

          const length = Math.sqrt(ox*ox + oy*oy + oz*oz);
          const nx = ox / length;
          const ny = oy / length;
          const nz = oz / length;

          // Add a rapid heartbeat flutter based on time and audio
          const breathing = Math.sin(timeRef.current * 5 + length) * 0.05 * bassIntensity;

          positionAttribute.setXYZ(
            i, 
            ox + nx * (offset + breathing), 
            oy + ny * (offset + breathing), 
            oz + nz * (offset + breathing)
          );
        }
        positionAttribute.needsUpdate = true;

        // Color Logic: Transition to Crimson Red on High Bass
        // Brand Green is Hue: 0.33, Red is Hue: 0.0 (or 1.0)
        // We use Math.pow to ensure it stays green until bass gets REALLY high
        const redShift = Math.pow(bassIntensity, 2.5); // Fast curve to 1.0 on peak
        const hue = 0.33 - (redShift * 0.33); // Shifts from 0.33 down to 0.0
        
        // Brighten and increase opacity on loud hits
        material.opacity = 0.3 + (bassIntensity * 0.6);
        material.color.setHSL(Math.max(0, hue), 1, 0.5 + (redShift * 0.1));
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
