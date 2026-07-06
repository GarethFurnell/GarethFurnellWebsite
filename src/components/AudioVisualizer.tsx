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
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    // We want the canvas to perfectly fit the screen
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 2. Create the Sphere (Highly intricate geometry)
    const geometry = new THREE.IcosahedronGeometry(2.0, 16); 
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ED64, // Brand green
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Save original vertices for distortion
    const originalPositions = Array.from(geometry.attributes.position.array);

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

      // Slow idle rotation
      sphere.rotation.x += 0.001;
      sphere.rotation.y += 0.002;

      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray as any);
        
        // Calculate average bass (lower frequencies)
        const bassAvg = Array.from(dataArray.slice(0, 15)).reduce((a, b) => a + b, 0) / 15;
        
        // Scale sphere based on heavy bass
        const scale = 1 + (bassAvg / 255) * 0.3;
        sphere.scale.set(scale, scale, scale);

        // Intricate vertex distortion
        const positionAttribute = geometry.attributes.position;
        for (let i = 0; i < positionAttribute.count; i++) {
          const ix = i * 3;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;

          // Map vertex to a frequency bin (spread across the array)
          const freqIndex = (i * 3) % dataArray.length;
          const rawFreq = dataArray[freqIndex] / 255;
          
          // Exponential distortion for spikes
          const offset = Math.pow(rawFreq, 3) * 1.5;
          
          const ox = originalPositions[ix];
          const oy = originalPositions[iy];
          const oz = originalPositions[iz];

          const length = Math.sqrt(ox*ox + oy*oy + oz*oz);
          const nx = ox / length;
          const ny = oy / length;
          const nz = oz / length;

          // Add a gentle time-based sine wave breathing effect
          const breathing = Math.sin(timeRef.current + length) * 0.05;

          positionAttribute.setXYZ(
            i, 
            ox + nx * (offset + breathing), 
            oy + ny * (offset + breathing), 
            oz + nz * (offset + breathing)
          );
        }
        positionAttribute.needsUpdate = true;

        // Change color dynamically based on mids/highs
        const midAvg = Array.from(dataArray.slice(30, 100)).reduce((a, b) => a + b, 0) / 70;
        const hue = (0.33 + (midAvg / 255) * 0.3) % 1.0; 
        
        // Brighten opacity on loud hits
        material.opacity = 0.3 + (bassAvg / 255) * 0.5;
        material.color.setHSL(hue, 1, 0.6);
      } else {
        // Idle breathing when no music
        const positionAttribute = geometry.attributes.position;
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

          const breathing = Math.sin(timeRef.current + (nx * 5)) * 0.1;

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
