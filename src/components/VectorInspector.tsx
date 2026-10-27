'use client';

import React, { useState, useEffect, useRef } from 'react';

interface VectorInspectorProps {
  node: {
    id: string;
    name: string;
    scientific_name?: string;
    genus?: string;
    family?: string;
    sound_type?: string;
    country?: string;
    location?: any;
    file_url?: string;
    score?: number;
    embedding?: number[];
  };
  onFetchVector?: (id: string) => Promise<number[] | null>;
}

export default function VectorInspector({ node, onFetchVector }: VectorInspectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tensor' | 'bson' | 'theory'>('tensor');
  const [showFullVector, setShowFullVector] = useState(false);
  const [copiedType, setCopiedType] = useState<'vector' | 'bson' | null>(null);
  const [localEmbedding, setLocalEmbedding] = useState<number[] | null>(node.embedding || null);
  const [loading, setLoading] = useState(false);
  const [hoveredDim, setHoveredDim] = useState<{ index: number; value: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Synchronize or load embedding on demand
  useEffect(() => {
    if (node.embedding && node.embedding.length > 0) {
      setLocalEmbedding(node.embedding);
    } else if (isOpen && !localEmbedding && onFetchVector) {
      setLoading(true);
      onFetchVector(node.id)
        .then((emb) => {
          if (emb) setLocalEmbedding(emb);
        })
        .finally(() => setLoading(false));
    }
  }, [node, isOpen]);

  // Render 1,024-Dimension Neural Heat Ribbon onto high-DPI canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !localEmbedding || localEmbedding.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Baseline horizontal center line
    const midY = height / 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    const maxAbs = 0.12; // Normalize peak height based on Voyage-4 distribution (~-0.13 to +0.09)
    const barWidth = width / localEmbedding.length;

    for (let i = 0; i < localEmbedding.length; i++) {
      const val = localEmbedding[i];
      const normalized = Math.min(Math.max(val / maxAbs, -1), 1);
      const barHeight = (normalized * (height / 2 - 2));

      const x = i * barWidth;
      
      if (val >= 0) {
        // Positive weights: Emerald Green (#00ED64)
        ctx.fillStyle = '#00ED64';
        ctx.fillRect(x, midY - barHeight, Math.max(barWidth, 0.8), barHeight);
      } else {
        // Negative weights: Cyan / Electric Blue (#00E5FF)
        ctx.fillStyle = '#00E5FF';
        ctx.fillRect(x, midY, Math.max(barWidth, 0.8), -barHeight);
      }
    }

    // Highlight hovered dimension if active
    if (hoveredDim !== null && hoveredDim.index >= 0 && hoveredDim.index < localEmbedding.length) {
      const hx = hoveredDim.index * barWidth;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(hx - 1, 0, 3, height);
    }
  }, [localEmbedding, hoveredDim]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!localEmbedding || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(x / rect.width, 1));
    const index = Math.min(Math.floor(ratio * localEmbedding.length), localEmbedding.length - 1);
    setHoveredDim({ index, value: localEmbedding[index] });
  };

  const handleCanvasMouseLeave = () => {
    setHoveredDim(null);
  };

  const handleCopyVector = () => {
    if (!localEmbedding) return;
    navigator.clipboard.writeText(JSON.stringify(localEmbedding, null, 2));
    setCopiedType('vector');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyBson = () => {
    const bsonRepresentation = {
      _id: `ObjectId("${node.id}")`,
      name: node.name,
      scientific_name: node.scientific_name,
      genus: node.genus,
      family: node.family,
      sound_type: node.sound_type,
      country: node.country,
      location: node.location,
      file_url: node.file_url,
      embedding: localEmbedding ? `[Array of ${localEmbedding.length} Float32 coordinates]` : '[]'
    };
    navigator.clipboard.writeText(JSON.stringify(bsonRepresentation, null, 2));
    setCopiedType('bson');
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="mt-2.5 border border-[#00684A]/60 rounded-xl overflow-hidden bg-[#00141D]/90 transition-all">
      {/* Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 bg-[#002222]/60 hover:bg-[#003830]/60 transition-colors flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#00ED64]/10 border border-[#00ED64]/30 flex items-center justify-center text-[#00ED64] text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-[#00ED64] transition-colors flex items-center gap-1.5 font-mono">
              <span>Inspect Vector & Atlas BSON</span>
              <span className="text-[10px] bg-[#00ED64]/15 text-[#00ED64] px-1.5 py-0.2 rounded font-mono">
                1024-D
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              Compare database vector storage vs 3D spatial projection
            </div>
          </div>
        </div>
        <div className="text-xs text-zinc-400 font-mono flex items-center gap-1">
          <span>{isOpen ? 'Collapse' : 'Inspect'}</span>
          <span>{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expanded Inspector Panel */}
      {isOpen && (
        <div className="p-3.5 border-t border-[#00684A]/40 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-[#001E2B] p-1 rounded-lg border border-[#00684A]/40 text-[11px] font-mono">
            <button
              onClick={() => setActiveTab('tensor')}
              className={`flex-1 py-1.5 px-2 rounded-md transition-colors text-center ${
                activeTab === 'tensor'
                  ? 'bg-[#00ED64]/20 text-[#00ED64] font-semibold border border-[#00ED64]/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              1,024-D Tensor Ribbon
            </button>
            <button
              onClick={() => setActiveTab('bson')}
              className={`flex-1 py-1.5 px-2 rounded-md transition-colors text-center ${
                activeTab === 'bson'
                  ? 'bg-[#00ED64]/20 text-[#00ED64] font-semibold border border-[#00ED64]/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Atlas BSON Document
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex-1 py-1.5 px-2 rounded-md transition-colors text-center ${
                activeTab === 'theory'
                  ? 'bg-[#00ED64]/20 text-[#00ED64] font-semibold border border-[#00ED64]/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              DB vs 3D Graph
            </button>
          </div>

          {/* TAB 1: 1,024-D Tensor Ribbon & Raw Coordinates */}
          {activeTab === 'tensor' && (
            <div className="flex flex-col gap-2.5">
              {/* Neural Activation Heat Ribbon */}
              <div className="bg-[#001E2B]/80 p-3 rounded-xl border border-[#00684A]/40 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                    <span>Neural Dimension Activation Ribbon</span>
                    <span className="text-[10px] text-zinc-500">(1,024 values)</span>
                  </span>
                  {hoveredDim ? (
                    <span className="text-[#00ED64] font-bold bg-[#00ED64]/10 px-2 py-0.5 rounded border border-[#00ED64]/30">
                      Dim #{hoveredDim.index}: {hoveredDim.value > 0 ? `+${hoveredDim.value.toFixed(6)}` : hoveredDim.value.toFixed(6)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400">Hover canvas to inspect dimension</span>
                  )}
                </div>

                {/* Canvas Ribbon */}
                <div className="relative w-full h-14 bg-[#000E14] rounded-lg border border-[#00684A]/40 overflow-hidden cursor-crosshair">
                  {loading ? (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#00ED64]/60 font-mono animate-pulse">
                      Streaming 1,024 Float32 dimensions from MongoDB...
                    </div>
                  ) : (
                    <canvas
                      ref={canvasRef}
                      width={1024}
                      height={56}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseLeave={handleCanvasMouseLeave}
                      className="w-full h-full block"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#00ED64]"></span>
                      <span>Positive (+weights)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#00E5FF]"></span>
                      <span>Negative (-weights)</span>
                    </span>
                  </div>
                  <span>Center line: 0.0</span>
                </div>
              </div>

              {/* Vector Metadata Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center font-mono">
                <div className="p-2 rounded-lg bg-[#001E2B]/60 border border-[#00684A]/30">
                  <div className="text-[10px] text-zinc-400">Dimensions</div>
                  <div className="text-xs font-bold text-white">1,024</div>
                </div>
                <div className="p-2 rounded-lg bg-[#001E2B]/60 border border-[#00684A]/30">
                  <div className="text-[10px] text-zinc-400">Model</div>
                  <div className="text-xs font-bold text-[#00ED64]">voyage-4</div>
                </div>
                <div className="p-2 rounded-lg bg-[#001E2B]/60 border border-[#00684A]/30">
                  <div className="text-[10px] text-zinc-400">L2 Magnitude</div>
                  <div className="text-xs font-bold text-white">1.0000</div>
                </div>
                <div className="p-2 rounded-lg bg-[#001E2B]/60 border border-[#00684A]/30">
                  <div className="text-[10px] text-zinc-400">Atlas Metric</div>
                  <div className="text-xs font-bold text-[#00E5FF]">Cosine</div>
                </div>
              </div>

              {/* Formatted Tensor Snippet */}
              <div className="bg-[#000E14] border border-[#00684A]/40 rounded-xl p-3 flex flex-col gap-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Float32 Array Payload:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFullVector(!showFullVector)}
                      className="text-[10px] text-[#00ED64] hover:underline"
                    >
                      {showFullVector ? 'Collapse to 20' : 'Show all 1,024'}
                    </button>
                    <button
                      onClick={handleCopyVector}
                      className="text-[10px] bg-[#00ED64]/10 hover:bg-[#00ED64]/20 text-[#00ED64] border border-[#00ED64]/30 px-2 py-0.5 rounded transition-colors"
                    >
                      {copiedType === 'vector' ? '✓ Copied' : 'Copy Vector JSON'}
                    </button>
                  </div>
                </div>

                <pre className="text-[11px] text-zinc-300 max-h-[160px] overflow-y-auto overflow-x-hidden p-2 bg-[#00141D] rounded-lg border border-[#00684A]/20">
                  {localEmbedding ? (
                    showFullVector ? (
                      `[\n  ${localEmbedding.map((n, i) => `${n > 0 ? ' ' : ''}${n.toFixed(8)} /* dim #${i} */`).join(',\n  ')}\n]`
                    ) : (
                      `[\n  ${localEmbedding.slice(0, 16).map((n, i) => `${n > 0 ? ' ' : ''}${n.toFixed(8)} /* dim #${i} */`).join(',\n  ')},\n  ... (+${localEmbedding.length - 16} more Float32 dimensions)\n]`
                    )
                  ) : (
                    'Loading vector coordinates...'
                  )}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: MongoDB Atlas BSON Document */}
          {activeTab === 'bson' && (
            <div className="bg-[#000E14] border border-[#00684A]/40 rounded-xl p-3 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">BSON Document in &apos;gfweb.bird_sounds&apos;:</span>
                <button
                  onClick={handleCopyBson}
                  className="text-[10px] bg-[#00ED64]/10 hover:bg-[#00ED64]/20 text-[#00ED64] border border-[#00ED64]/30 px-2 py-0.5 rounded transition-colors"
                >
                  {copiedType === 'bson' ? '✓ Copied' : 'Copy BSON JSON'}
                </button>
              </div>

              <pre className="text-[11px] text-[#00E5FF] max-h-[220px] overflow-y-auto p-2.5 bg-[#00141D] rounded-lg border border-[#00684A]/20">
                {`{
  "_id": ObjectId("${node.id}"),
  "name": "${node.name}",
  "scientific_name": "${node.scientific_name || ''}",
  "genus": "${node.genus || ''}",
  "family": "${node.family || ''}",
  "sound_type": "${node.sound_type || 'call'}",
  "country": "${node.country || ''}",
  "location": ${node.location ? JSON.stringify(node.location) : 'null'},
  "file_url": "${node.file_url || ''}",
  "embedding": [
    ${localEmbedding ? localEmbedding.slice(0, 5).map(n => n.toFixed(7)).join(', ') + `, ... 1,024 Float32 dimensions` : '...'}
  ]${node.score ? `,\n  "score": ${node.score.toFixed(4)}` : ''}
}`}
              </pre>
            </div>
          )}

          {/* TAB 3: Database Storage vs 3D Projection Comparison */}
          {activeTab === 'theory' && (
            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#001E2B]/80 border border-[#00684A]/40 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-[#00ED64] font-bold">
                  <span>1. In MongoDB Atlas (1,024-D Vector Space)</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                  The bird is stored as a <strong>1,024-dimensional point in hyperspace</strong> produced by Voyage AI. MongoDB Atlas indexes these coordinates using <strong>Hierarchical Navigable Small World (HNSW)</strong> graphs. Vector search calculates the high-dimensional angle (cosine distance) between the search prompt vector <strong>q</strong> and species vector <strong>d</strong> in milliseconds:
                </p>
                <div className="bg-[#000E14] p-2.5 rounded-lg text-center text-[#00ED64] text-[11px] border border-[#00684A]/30 font-mono">
                  Cosine Similarity = (q · d) / (||q|| ||d||) = Σ (q_i × d_i)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#001E2B]/80 border border-[#00684A]/40 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-[#00E5FF] font-bold">
                  <span>2. In the 3D WebGL Visualization (3D Spatial Projection)</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                  Because humans cannot see 1,024 dimensions, we project the high-dimensional topology into 3D $(x, y, z)$ space using <strong>D3 3D Force-Directed Physics</strong>:
                </p>
                <ul className="text-[11px] text-zinc-300 list-disc list-inside space-y-1 font-sans">
                  <li>Pairs with 1,024-D similarity &gt; <strong>0.66</strong> form physical tension springs pulling them together.</li>
                  <li>Electrostatic repulsion pushes unrelated birds away.</li>
                  <li>Birds with close mathematical vectors naturally gather into physical 3D clusters (e.g. Eagles cluster with Hawks; Thrushes cluster with Warblers).</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
