'use client';

import React, { useState } from 'react';

interface BigQueryQueryViewerProps {
  createModelSql: string;
  querySql: string;
  stats: {
    dataset: string;
    bytesProcessed: string;
    queryRuntimeMs: number;
    slotsAllocated: number;
    algorithm: string;
  };
}

export default function BigQueryQueryViewer({ createModelSql, querySql, stats }: BigQueryQueryViewerProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'predict'>('create');
  const [copied, setCopied] = useState(false);

  const currentSql = activeTab === 'create' ? createModelSql : querySql;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Header with Engine Stats */}
      <div className="px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
              <path d="M12 12v9" />
              <path d="m8 17 4 4 4-4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Google Cloud BigQuery Architecture
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Dremel Execution
              </span>
            </h3>
            <p className="text-xs text-zinc-500 font-mono">{stats.dataset}</p>
          </div>
        </div>

        {/* Dremel Runtime Metrics */}
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 bg-black/60 px-3 py-1.5 rounded-xl border border-zinc-800">
          <div>
            <span className="text-zinc-600">Runtime:</span> <span className="text-emerald-400 font-semibold">{stats.queryRuntimeMs}ms</span>
          </div>
          <div className="w-px h-3 bg-zinc-800" />
          <div>
            <span className="text-zinc-600">Slots:</span> <span className="text-blue-400 font-semibold">{stats.slotsAllocated}</span>
          </div>
          <div className="w-px h-3 bg-zinc-800" />
          <div>
            <span className="text-zinc-600">Scanned:</span> <span className="text-amber-400 font-semibold">{stats.bytesProcessed}</span>
          </div>
        </div>
      </div>

      {/* SQL Tab Controls & Copy Action */}
      <div className="px-5 py-2.5 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'create'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            1. CREATE MODEL (BigQuery ML)
          </button>
          <button
            onClick={() => setActiveTab('predict')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'predict'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            2. ML.FORECAST / PREDICT
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" />
              </svg>
              <span>Copy SQL</span>
            </>
          )}
        </button>
      </div>

      {/* SQL Code Block */}
      <div className="p-5 font-mono text-xs overflow-x-auto text-zinc-300 leading-relaxed bg-black/80">
        <pre className="whitespace-pre">
          {currentSql.split('\n').map((line, idx) => {
            const isComment = line.trim().startsWith('--');
            const isKeyword = /^(CREATE|SELECT|FROM|JOIN|ON|WHERE|ORDER BY|OPTIONS|GROUP BY|STRUCT|ML\.)/i.test(line.trim());
            return (
              <div key={idx} className="table-row">
                <span className="table-cell pr-4 text-zinc-700 select-none text-right w-8">{idx + 1}</span>
                <span className={`table-cell ${isComment ? 'text-zinc-500 italic' : isKeyword ? 'text-blue-400 font-semibold' : 'text-zinc-200'}`}>
                  {line}
                </span>
              </div>
            );
          })}
        </pre>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 bg-zinc-900/30 border-t border-zinc-900 text-xs text-zinc-500 flex items-center justify-between">
        <span>Algorithm: <strong className="text-zinc-400">{stats.algorithm}</strong></span>
        <span>Storage: <span className="text-zinc-400">Capacitor Columnar</span></span>
      </div>
    </div>
  );
}
