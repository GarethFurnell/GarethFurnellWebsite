"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface AudioVisualizerProps {
  audioId: string;
}

export default function AudioVisualizer({ audioId }: AudioVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const audioElement = document.getElementById(audioId) as HTMLAudioElement;
    if (!containerRef.current || !audioElement) return;

    // 1. Setup Three.js Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    // We want the canvas to perfectly fit the container
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 2. Create the Sphere (Icosahedron for cool low-poly distortion effects)
    const geometry = new THREE.IcosahedronGeometry(1.5, 4); 
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ED64, // Brand green
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Save original vertices for distortion
    const originalPositions = Array.from(geometry.attributes.position.array);

    // 3. Setup Audio Context variables (but don't initialize yet due to autoplay policies)
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;
    let source: MediaElementAudioSourceNode | null = null;

    const initAudio = () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      // Ensure we have window.AudioContext
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContext = new AudioCtx();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      // Connect audio element to analyser
      // IMPORTANT: If source already exists for this audio element from a previous mount, this will throw.
      // So we wrap it in a try-catch.
      try {
        source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
      } catch (e) {
        console.warn('AudioSource already connected', e);
      }
    };

    // Listen for play to initialize audio context
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

      // Rotate sphere
      sphere.rotation.x += 0.002;
      sphere.rotation.y += 0.003;

      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray as any);
        
        // Calculate average bass (lower frequencies)
        const bassAvg = Array.from(dataArray.slice(0, 10)).reduce((a, b) => a + b, 0) / 10;
        
        // Scale sphere based on bass
        const scale = 1 + (bassAvg / 255) * 0.4;
        sphere.scale.set(scale, scale, scale);

        // Distort vertices based on higher frequencies
        const positionAttribute = geometry.attributes.position;
        for (let i = 0; i < positionAttribute.count; i++) {
          const ix = i * 3;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;

          const freqIndex = i % dataArray.length;
          const offset = (dataArray[freqIndex] / 255) * 0.3;
          
          const ox = originalPositions[ix];
          const oy = originalPositions[iy];
          const oz = originalPositions[iz];

          const length = Math.sqrt(ox*ox + oy*oy + oz*oz);
          const nx = ox / length;
          const ny = oy / length;
          const nz = oz / length;

          positionAttribute.setXYZ(
            i, 
            ox + nx * offset, 
            oy + ny * offset, 
            oz + nz * offset
          );
        }
        positionAttribute.needsUpdate = true;

        // Change color dynamically based on mids
        const midAvg = Array.from(dataArray.slice(20, 60)).reduce((a, b) => a + b, 0) / 40;
        const hue = (0.33 + (midAvg / 255) * 0.2) % 1.0; 
        material.color.setHSL(hue, 1, 0.5);
      }

      renderer.render(scene, camera);
    };
    animate();

    // 5. Handle Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
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
      className="absolute inset-0 w-full h-full pointer-events-none z-10 mix-blend-screen transition-opacity duration-700 opacity-90"
    />
  );
}
