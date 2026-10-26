'use client';

import React, { useRef, useEffect, useState, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import dynamic from 'next/dynamic';

class WebGLErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WebGL Error caught by boundary:', error, errorInfo);
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
  scientific_name?: string;
  genus?: string;
  family?: string;
  sound_type?: string;
  country?: string;
  location?: any;
  file_url?: string;
  val?: number;
  color?: string;
  x?: number;
  y?: number;
  z?: number;
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

  // Reset camera to standard perspective
  const handleResetCamera = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.cameraPosition(
        { x: 0, y: 0, z: 280 },
        { x: 0, y: 0, z: 0 },
        1200
      );
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[620px] rounded-2xl overflow-hidden border border-[#00684A]/60 bg-[#001E2B]/95 relative shadow-2xl shadow-[#001E2B]/80 flex flex-col"
    >
      {/* Top HUD Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Status / Title */}
        <div className="bg-[#001E2B]/90 backdrop-blur-md border border-[#00684A]/50 px-3.5 py-2 rounded-xl pointer-events-auto flex items-center gap-2.5 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00ED64] animate-pulse"></div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>3D Vector Similarity Space</span>
              <span className="text-[10px] bg-[#00ED64]/15 text-[#00ED64] px-1.5 py-0.5 rounded border border-[#00ED64]/30 font-mono">
                1024-Dim
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              Force-directed semantic & acoustic clustering (Voyage AI)
            </div>
          </div>
        </div>

        {/* Camera Reset */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleResetCamera}
            className="bg-[#001E2B]/90 backdrop-blur-md border border-[#00684A]/50 hover:border-[#00ED64]/60 text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl text-xs transition-colors shadow-lg flex items-center gap-1.5"
            title="Reset to center perspective"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            <span>Center View</span>
          </button>
        </div>
      </div>

      {/* ForceGraph 3D Canvas */}
      <div className="w-full flex-1">
        <WebGLErrorBoundary>
          <ForceGraph3D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={{ nodes, links }}
            nodeLabel={(node: any) => `
              <div style="background: rgba(0, 30, 43, 0.95); border: 1px solid #00ED64; padding: 8px 12px; border-radius: 8px; font-family: sans-serif; font-size: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.6); max-width: 260px;">
                <div style="font-weight: bold; color: #ffffff; font-size: 13px;">${node.name}</div>
                <div style="color: #00ED64; font-size: 11px; font-style: italic; margin-bottom: 4px;">${node.scientific_name || node.genus}</div>
                ${node.family ? `<div style="color: #6ee7b7; font-size: 10px; margin-bottom: 2px;">Family: ${node.family}</div>` : ''}
                ${node.sound_type ? `<div style="color: #a7f3d0; font-size: 10px; margin-bottom: 2px;">Sound: ${node.sound_type}</div>` : ''}
                ${node.country ? `<div style="color: #94a3b8; font-size: 10px;">📍 Origin: ${node.country}</div>` : ''}
                <div style="color: #38bdf8; font-size: 10px; margin-top: 5px;">🎧 Click node to focus, play audio & view photo</div>
              </div>
            `}
            nodeColor={(node: any) => node.color || '#00ED64'}
            nodeVal={(node: any) => node.val || 2}
            linkColor={(link: any) => link.color || 'rgba(0, 237, 100, 0.28)'}
            linkWidth={(link: any) => (link.value ? Math.max((link.value - 0.5) * 4, 0.8) : 1)}
            nodeResolution={20}
            cooldownTime={3500}
            onNodeClick={(node: any) => {
              // Aim camera smoothly at the selected node
              const distance = 45;
              const distRatio = 1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1);
              if (fgRef.current) {
                fgRef.current.cameraPosition(
                  { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
                  node,
                  1500
                );
              }
              if (onNodeClick) onNodeClick(node);
            }}
            backgroundColor="#00141D"
          />
        </WebGLErrorBoundary>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="text-[11px] text-zinc-400 font-mono bg-[#001E2B]/85 backdrop-blur-sm border border-[#00684A]/40 px-3 py-1.5 rounded-lg">
          Drag to rotate • Scroll to zoom • Click node to inspect details • Proximity reflects semantic vector closeness
        </div>
      </div>
    </div>
  );
}
