'use client';

import React, { useRef, useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import dynamic from 'next/dynamic';

class WebGLErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): {hasError: boolean} {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("WebGL Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-[#001E2B]/80 text-[#00ED64]/70">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
          <h3 className="text-lg font-bold mb-2 text-white">WebGL Not Supported</h3>
          <p className="text-sm">Your browser or device was unable to create a WebGL context for the 3D Graph. Hardware acceleration may be disabled or unsupported.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

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
      <WebGLErrorBoundary>
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
            if (fgRef.current) {
              fgRef.current.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
                node, // lookAt ({ x, y, z })
                3000 // ms transition duration
              );
            }
            if (onNodeClick) onNodeClick(node);
          }}
          backgroundColor="#001E2B"
        />
        <div className="absolute top-4 left-4 pointer-events-none text-[#00ED64]/50 text-xs font-mono">
          Drag to rotate • Scroll to zoom • Click node to focus
        </div>
      </WebGLErrorBoundary>
    </div>
  );
}
