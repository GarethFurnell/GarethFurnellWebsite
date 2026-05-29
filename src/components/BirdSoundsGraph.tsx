'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the 3D graph to avoid SSR issues with canvas/three.js
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

export interface GraphNode {
  id: string;
  name: string;
  group?: number;
  val?: number; // size
  color?: string;
  desc?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  value?: number;
  color?: string;
}

interface BirdSoundsGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick?: (node: GraphNode) => void;
}

export default function BirdSoundsGraph({ nodes, links, onNodeClick }: BirdSoundsGraphProps) {
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-resize graph to fit container
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height: height || 600 });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[600px] rounded-xl overflow-hidden border border-[#00684A] bg-[#001E2B]/80 relative">
      <ForceGraph3D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={{ nodes, links }}
        nodeLabel="name"
        nodeColor={(node: any) => node.color || '#00ED64'}
        linkColor={(link: any) => link.color || '#00684A'}
        linkWidth={(link: any) => link.value || 1}
        nodeResolution={16}
        onNodeClick={(node: any) => {
          // Aim at node from outside it
          const distance = 40;
          const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
          fgRef.current.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
            node, // lookAt ({ x, y, z })
            3000 // ms transition duration
          );
          if (onNodeClick) onNodeClick(node);
        }}
        backgroundColor="#001E2B"
      />
      <div className="absolute top-4 left-4 pointer-events-none text-[#00ED64]/50 text-xs font-mono">
        Drag to rotate • Scroll to zoom • Click node to focus
      </div>
    </div>
  );
}
