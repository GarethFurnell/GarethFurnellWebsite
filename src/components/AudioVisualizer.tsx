"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
    camera.position.z = 8; 

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 2. Load the Realistic 3D Heart Model
    let wrapperGroup: THREE.Group | null = null;
    const meshes: { mesh: THREE.Mesh, originalPositions: Float32Array }[] = [];
    
    const loader = new GLTFLoader();
    loader.load('/models/heart.glb', (gltf) => {
      const loadedGroup = gltf.scene;
      
      // Traverse and extract meshes
      loadedGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Override material with our reactive wireframe
          child.material = new THREE.MeshBasicMaterial({
            color: 0x00ED64, // Brand green
            wireframe: true,
            transparent: true,
            opacity: 0.4
          });
          
          const posAttr = child.geometry.attributes.position;
          // Store original positions for distortion
          const orig = new Float32Array(posAttr.count * 3);
          for (let i = 0; i < posAttr.count * 3; i++) {
            orig[i] = posAttr.array[i];
          }
          meshes.push({ mesh: child, originalPositions: orig });
        }
      });
      
      // Auto-center the model regardless of its native origin
      const box = new THREE.Box3().setFromObject(loadedGroup);
      const center = box.getCenter(new THREE.Vector3());
      loadedGroup.position.sub(center);
      
      // Auto-scale the model to roughly 4.0 units max dimension
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetDim = 4.0;
      const baseScale = targetDim / maxDim;
      loadedGroup.scale.set(baseScale, baseScale, baseScale);

      // Wrap in a parent group for easy animation scaling/rotation
      wrapperGroup = new THREE.Group();
      wrapperGroup.add(loadedGroup);
      
      // Add a slight anatomical tilt
      wrapperGroup.rotation.x = 0.2; 
      
      scene.add(wrapperGroup);
    }, undefined, (error) => {
      console.error('Error loading 3D model:', error);
    });

    // 3. Setup Audio Context
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

      if (wrapperGroup) {
        // Slow idle tumble
        wrapperGroup.rotation.y += 0.002;
      }

      if (analyser && dataArray && wrapperGroup) {
        analyser.getByteFrequencyData(dataArray as any);
        
        // Calculate average bass
        const bassAvg = Array.from(dataArray.slice(0, 15)).reduce((a, b) => a + b, 0) / 15;
        const bassIntensity = bassAvg / 255; 
        
        // Aggressive pulse for the entire group
        const pulse = Math.pow(bassIntensity, 4) * 0.4;
        const groupScale = 1 + (bassIntensity * 0.1) + pulse;
        wrapperGroup.scale.set(groupScale, groupScale, groupScale);

        // Color Logic: Transition to Crimson Red
        const effectiveBass = Math.min(1.0, bassIntensity * 1.8);
        const redShift = Math.pow(effectiveBass, 2.0); 
        const hue = Math.max(0, 0.33 - (redShift * 0.33)); 

        // Intricate vertex distortion for every mesh in the model
        meshes.forEach(({ mesh, originalPositions }) => {
          const positionAttribute = mesh.geometry.attributes.position;
          
          for (let i = 0; i < positionAttribute.count; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            const freqIndex = (i * 3) % dataArray!.length;
            const rawFreq = dataArray![freqIndex] / 255;
            
            // The organic spike offset
            const offset = Math.pow(rawFreq, 3) * 0.8 * bassIntensity; 
            
            const ox = originalPositions[ix];
            const oy = originalPositions[iy];
            const oz = originalPositions[iz];

            // Calculate local normal direction to explode outwards
            const length = Math.sqrt(ox*ox + oy*oy + oz*oz) || 1; // Prevent div by 0
            const nx = ox / length;
            const ny = oy / length;
            const nz = oz / length;

            // Heartbeat flutter
            const breathing = Math.sin(timeRef.current * 8 + length * 2) * 0.04 * bassIntensity;

            positionAttribute.setXYZ(
              i, 
              ox + nx * (offset + breathing), 
              oy + ny * (offset + breathing), 
              oz + nz * (offset + breathing)
            );
          }
          positionAttribute.needsUpdate = true;

          // Apply color update
          if (mesh.material instanceof THREE.MeshBasicMaterial) {
            mesh.material.opacity = 0.2 + (effectiveBass * 0.6);
            mesh.material.color.setHSL(hue, 1, 0.4 + (redShift * 0.2));
          }
        });

      } else if (wrapperGroup) {
        // Idle breathing when no music
        meshes.forEach(({ mesh, originalPositions }) => {
          const positionAttribute = mesh.geometry.attributes.position;
          
          for (let i = 0; i < positionAttribute.count; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;
            
            const ox = originalPositions[ix];
            const oy = originalPositions[iy];
            const oz = originalPositions[iz];

            const length = Math.sqrt(ox*ox + oy*oy + oz*oz) || 1;
            const nx = ox / length;
            const ny = oy / length;
            const nz = oz / length;

            const breathing = Math.sin(timeRef.current * 2 + (nx * 5)) * 0.03;

            positionAttribute.setXYZ(
              i, 
              ox + nx * breathing, 
              oy + ny * breathing, 
              oz + nz * breathing
            );
          }
          positionAttribute.needsUpdate = true;
        });
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
      // Note: Full memory cleanup for imported scenes requires traversing and disposing all geometry/materials.
      if (wrapperGroup) {
        wrapperGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material) child.material.dispose();
          }
        });
      }
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
