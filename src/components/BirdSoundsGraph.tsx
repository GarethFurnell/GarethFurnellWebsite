'use client';

import React, { useRef, useEffect, useState, useCallback, Component, ErrorInfo, ReactNode } from 'react';
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
  scientific_name?: string;
  genus?: string;
  country?: string;
  location?: any;
  file_url?: string;
  val?: number;
  color?: string;
  anatomical_part?: string;
  anatomical_label?: string;
  x?: number;
  y?: number;
  z?: number;
  fx?: number;
  fy?: number;
  fz?: number;
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
  const [layoutMode, setLayoutMode] = useState<'constellation' | 'free'>('constellation');
  const [isFlapping, setIsFlapping] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  // Store original base Y coordinates for flap oscillation
  const baseYRef = useRef<Map<string, number>>(new Map());

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

  // Save baseline Y coordinates whenever nodes change
  useEffect(() => {
    baseYRef.current.clear();
    nodes.forEach(n => {
      if (typeof n.y === 'number') {
        baseYRef.current.set(n.id, n.y);
      }
    });
  }, [nodes]);

  // Set initial 3D flight perspective camera
  useEffect(() => {
    if (fgRef.current) {
      setTimeout(() => {
        fgRef.current.cameraPosition(
          { x: 0, y: 110, z: 250 }, // Looking down from front-quarter flight angle
          { x: 0, y: 0, z: 0 },
          2000
        );
      }, 500);
    }
  }, [nodes]);

  // Manage Layout Mode (Pinned 3D Bird in Flight vs Free Physics Simulation)
  const currentGraphData = React.useMemo(() => {
    const formattedNodes = nodes.map(node => {
      if (layoutMode === 'constellation') {
        return {
          ...node,
          fx: node.x,
          fy: node.y,
          fz: node.z
        };
      } else {
        return {
          ...node,
          fx: undefined,
          fy: undefined,
          fz: undefined
        };
      }
    });

    return { nodes: formattedNodes, links };
  }, [nodes, links, layoutMode]);

  // Wing-Beat Flapping Animation Loop
  useEffect(() => {
    if (!isFlapping || layoutMode !== 'constellation') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      // Restore default Y positions
      nodes.forEach(n => {
        const baseY = baseYRef.current.get(n.id);
        if (baseY !== undefined) {
          n.fy = baseY;
          n.y = baseY;
        }
      });
      return;
    }

    let startTime = performance.now();

    const animateWingFlap = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const flapPhase = Math.sin(elapsed * 4.5); // Wingbeat frequency

      nodes.forEach(n => {
        if (n.anatomical_part === 'left_wing' || n.anatomical_part === 'right_wing') {
          const baseY = baseYRef.current.get(n.id) ?? (n.y || 0);
          const spanRatio = Math.min(Math.abs(n.x || 0) / 130, 1.2);
          const flapDisplacement = flapPhase * Math.pow(spanRatio, 1.3) * 16;
          n.fy = baseY + flapDisplacement;
          n.y = baseY + flapDisplacement;
        }
      });

      if (fgRef.current) {
        fgRef.current.refresh();
      }

      animFrameRef.current = requestAnimationFrame(animateWingFlap);
    };

    animFrameRef.current = requestAnimationFrame(animateWingFlap);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isFlapping, layoutMode, nodes]);

  const handleResetCamera = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.cameraPosition(
        { x: 0, y: 110, z: 250 },
        { x: 0, y: 0, z: 0 },
        1200
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[650px] rounded-2xl overflow-hidden border border-[#00684A]/60 bg-[#001E2B]/95 relative shadow-2xl shadow-[#001E2B]/80 flex flex-col">
      {/* Top HUD Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Title & Status */}
        <div className="bg-[#001E2B]/90 backdrop-blur-md border border-[#00684A]/50 px-3.5 py-2 rounded-xl pointer-events-auto flex items-center gap-2.5 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00ED64] animate-pulse"></div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>🦅 3D Bird in Flight Vector Topography</span>
              <span className="text-[10px] bg-[#00ED64]/15 text-[#00ED64] px-1.5 py-0.5 rounded border border-[#00ED64]/30 font-mono">1024-Dim</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              Voyage AI Semantic Latents + Fourier Spatial Harmonics
            </div>
          </div>
        </div>

        {/* View Mode & Animation Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Mode Switcher */}
          <div className="bg-[#001E2B]/90 backdrop-blur-md border border-[#00684A]/50 p-1 rounded-xl flex items-center gap-1 shadow-lg">
            <button
              onClick={() => { setLayoutMode('constellation'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                layoutMode === 'constellation'
                  ? 'bg-[#00ED64] text-[#001E2B] font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🦅 Constellation
            </button>
            <button
              onClick={() => { setLayoutMode('free'); setIsFlapping(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                layoutMode === 'free'
                  ? 'bg-[#00ED64] text-[#001E2B] font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🌀 Free Physics
            </button>
          </div>

          {/* Wing Flap Animation Toggle (Active only in Constellation mode) */}
          {layoutMode === 'constellation' && (
            <button
              onClick={() => setIsFlapping(!isFlapping)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-lg ${
                isFlapping
                  ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]'
                  : 'bg-[#001E2B]/90 border-[#00684A]/50 text-zinc-400 hover:text-white'
              }`}
              title="Toggle aerodynamic wing-beat cycle"
            >
              <span className={isFlapping ? 'animate-bounce' : ''}>🪽</span>
              <span>{isFlapping ? 'Flapping Active' : 'Flap Wings'}</span>
            </button>
          )}

          {/* Camera Reset */}
          <button
            onClick={handleResetCamera}
            className="bg-[#001E2B]/90 backdrop-blur-md border border-[#00684A]/50 hover:border-[#00ED64]/60 text-zinc-300 hover:text-white p-2 rounded-xl text-xs transition-colors shadow-lg"
            title="Reset to 3D Flight Perspective"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
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
            graphData={currentGraphData}
            nodeLabel={(node: any) => `
              <div style="background: rgba(0, 30, 43, 0.95); border: 1px solid #00ED64; padding: 8px 12px; border-radius: 8px; font-family: sans-serif; font-size: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.6); max-width: 260px;">
                <div style="font-weight: bold; color: #ffffff; font-size: 13px;">${node.name}</div>
                <div style="color: #00ED64; font-size: 11px; font-style: italic; margin-bottom: 6px;">${node.scientific_name || node.genus}</div>
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${node.color};"></span>
                  <span style="color: ${node.color}; font-weight: 600; font-size: 11px;">${node.anatomical_label || node.anatomical_part}</span>
                </div>
                ${node.country ? `<div style="color: #94a3b8; font-size: 10px;">📍 Origin: ${node.country}</div>` : ''}
                <div style="color: #38bdf8; font-size: 10px; margin-top: 4px;">🎧 Click node to play song & load photo</div>
              </div>
            `}
            nodeColor={(node: any) => node.color || '#00ED64'}
            nodeVal={(node: any) => node.val || 2}
            linkColor={(link: any) => link.color || 'rgba(0, 237, 100, 0.3)'}
            linkWidth={(link: any) => (link.value ? Math.max(link.value * 1.5, 0.8) : 1)}
            nodeResolution={24}
            cooldownTime={layoutMode === 'constellation' ? 0 : 3000}
            enableNodeDrag={layoutMode === 'free'}
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

      {/* Bottom Anatomical Sector Legend & Interaction Hint */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Interaction Hint */}
        <div className="text-[11px] text-zinc-400 font-mono bg-[#001E2B]/85 backdrop-blur-sm border border-[#00684A]/40 px-3 py-1.5 rounded-lg">
          Drag to rotate • Scroll to zoom • Click point for audio & telemetry
        </div>

        {/* Anatomy Color Swatches */}
        <div className="bg-[#001E2B]/90 backdrop-blur-sm border border-[#00684A]/40 px-3 py-1.5 rounded-lg flex items-center gap-3 text-[11px] font-mono pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFEA00]"></span>
            <span className="text-zinc-300">Beak/Head</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ED64]"></span>
            <span className="text-zinc-300">Spine/Keel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]"></span>
            <span className="text-zinc-300">Wings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF007F]"></span>
            <span className="text-zinc-300">Tail Fan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]"></span>
            <span className="text-zinc-300">Talons</span>
          </div>
        </div>
      </div>
    </div>
  );
}
