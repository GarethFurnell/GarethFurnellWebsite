"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

// Define the shape of our vector data
export interface VectorNode {
  id: string;
  label?: string;
  vector: [number, number, number]; // 3D coordinates for visualization
}

interface HnswGraphProps {
  data: VectorNode[];
}

// A single point in the graph
function Node({ position, label }: { position: [number, number, number], label?: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame(() => {
    if (mesh.current) {
      // Add a slight floating animation
      mesh.current.position.y = position[1] + Math.sin(Date.now() / 1000 + position[0]) * 0.1;
    }
  });

  return (
    <mesh
      ref={mesh}
      position={position}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial 
        color={hovered ? '#a855f7' : '#3b82f6'} 
        emissive={hovered ? '#a855f7' : '#000000'}
        emissiveIntensity={0.5}
      />
      {hovered && label && (
        <Html distanceFactor={10} position={[0, 0.5, 0]} center>
          <div className="bg-black/80 text-white px-2 py-1 rounded text-xs border border-zinc-700 whitespace-nowrap">
            {label}
          </div>
        </Html>
      )}
    </mesh>
  );
}

// Connections between nodes (simulating HNSW edges)
function Edges({ nodes }: { nodes: VectorNode[] }) {
  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    // Draw lines between some close nodes to simulate graph structure
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const p1 = new THREE.Vector3(...nodes[i].vector);
        const p2 = new THREE.Vector3(...nodes[j].vector);
        if (p1.distanceTo(p2) < 3.0) { // arbitrary distance threshold for edges
          points.push(p1);
          points.push(p2);
        }
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [nodes]);

  return (
    <lineSegments geometry={lineGeometry}>
      <lineBasicMaterial color="#3f3f46" transparent opacity={0.3} />
    </lineSegments>
  );
}

export default function HnswGraph({ data }: HnswGraphProps) {
  // If no data provided (e.g. build time without db connection), generate some dummy data
  const graphData = useMemo(() => {
    if (data && data.length > 0) return data;
    
    // Generate 50 random nodes in a cluster if no data exists
    return Array.from({ length: 50 }).map((_, i) => ({
      id: `dummy-${i}`,
      label: `Vector ${i}`,
      vector: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ] as [number, number, number]
    }));
  }, [data]);

  return (
    <div className="w-full h-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <color attach="background" args={['#09090b']} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#a855f7" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {graphData.map((node) => (
          <Node key={node.id} position={node.vector} label={node.label} />
        ))}
        
        <Edges nodes={graphData} />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
