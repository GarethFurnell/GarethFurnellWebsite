'use client';

import React, { useState, useEffect, useRef } from 'react';
import { nasaAsteroids, asteroidBigQuerySQL, AsteroidBody } from '@/utils/bigqueryData';
import BigQueryQueryViewer from './BigQueryQueryViewer';

export default function OrbitalRadar() {
  const [selectedAsteroid, setSelectedAsteroid] = useState<AsteroidBody>(nasaAsteroids[0]);
  const [showSql, setShowSql] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let sweepAngle = 0;

    const render = () => {
      // High-DPI scaling
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(centerX, centerY) - 20;

      // Clear with dark deep space background
      ctx.fillStyle = '#060609';
      ctx.fillRect(0, 0, width, height);

      // Radar Concentric Circles (Lunar Distances)
      const rings = [
        { r: maxRadius * 0.2, label: '1 LD (384k km)' },
        { r: maxRadius * 0.45, label: '3 LD' },
        { r: maxRadius * 0.75, label: '6 LD' },
        { r: maxRadius, label: '10 LD' }
      ];

      rings.forEach(ring => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#4b5563';
        ctx.font = '10px monospace';
        ctx.fillText(ring.label, centerX + 6, centerY - ring.r + 12);
      });

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Earth at Center
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#e0f2fe';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('EARTH', centerX, centerY + 22);

      // Radar Sweep Effect
      sweepAngle += 0.015;
      const sweepLength = maxRadius;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, sweepLength, sweepAngle - 0.25, sweepAngle);
      ctx.closePath();
      const sweepGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sweepLength);
      sweepGradient.addColorStop(0, 'rgba(56, 189, 248, 0)');
      sweepGradient.addColorStop(1, 'rgba(56, 189, 248, 0.15)');
      ctx.fillStyle = sweepGradient;
      ctx.fill();
      ctx.restore();

      // Plot Asteroids
      nasaAsteroids.forEach((ast) => {
        // Compute position based on orbital radius and angle
        const radius = (ast.orbitRadius / 220) * maxRadius;
        const rad = (ast.angleDeg * Math.PI) / 180;
        const x = centerX + Math.cos(rad) * radius;
        const y = centerY + Math.sin(rad) * radius;

        const isSelected = ast.id === selectedAsteroid.id;

        // Draw orbital trail
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.35)' : 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = isSelected ? 1.5 : 1;
        ctx.stroke();

        // Draw Asteroid Body
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 6 : ast.isPotentiallyHazardous ? 4.5 : 3.5, 0, Math.PI * 2);

        if (ast.isPotentiallyHazardous) {
          ctx.fillStyle = isSelected ? '#ef4444' : '#f87171';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = isSelected ? 15 : 6;
        } else {
          ctx.fillStyle = isSelected ? '#38bdf8' : '#94a3b8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = isSelected ? 12 : 3;
        }

        ctx.fill();
        ctx.shadowBlur = 0;

        // Asteroid Label
        ctx.fillStyle = isSelected ? '#ffffff' : '#9ca3af';
        ctx.font = isSelected ? 'bold 11px monospace' : '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(ast.name.split(' ')[0], x + 8, y + 3);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedAsteroid]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 20;

    // Find clicked asteroid
    nasaAsteroids.forEach(ast => {
      const radius = (ast.orbitRadius / 220) * maxRadius;
      const rad = (ast.angleDeg * Math.PI) / 180;
      const astX = centerX + Math.cos(rad) * radius;
      const astY = centerY + Math.sin(rad) * radius;

      const dist = Math.sqrt((x - astX) ** 2 + (y - astY) ** 2);
      if (dist < 18) {
        setSelectedAsteroid(ast);
      }
    });
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-900/40 bg-gradient-to-br from-blue-950/20 via-zinc-950/80 to-black p-6 md:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            DEEP SPACE RADAR
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            BigQuery ML Logistic Regression
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
          NASA Near-Earth Objects Orbital Radar
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-3xl">
          Real-time orbital tracking and impact probability classification using NASA JPL telemetry hosted in Google BigQuery. Click any asteroid or orbital vector to inspect its trajectory and BigQuery ML hazard risk score.
        </p>
      </div>

      {/* Radar Canvas & Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Radar View */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="w-full flex items-center justify-between mb-4 text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE TELEMETRY SWEEP
            </span>
            <span>DATASET: bigquery-public-data.nasa_jpl_neo</span>
          </div>

          <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              onClick={handleCanvasClick}
              className="w-full h-full rounded-2xl cursor-crosshair border border-zinc-900"
            />
          </div>

          <p className="text-zinc-500 text-xs mt-4 text-center font-mono">
            Click any asteroid on the radar to inspect its trajectory metrics.
          </p>
        </div>

        {/* Selected Asteroid Telemetry & ML Inspector */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-mono text-zinc-500">TARGET DESIGNATION</span>
                <h3 className="text-2xl font-bold text-white mt-0.5">{selectedAsteroid.name}</h3>
                <p className="text-xs text-blue-400 font-mono">Discovered: {selectedAsteroid.discoveryDate}</p>
              </div>

              <span
                className={`text-xs font-mono px-3 py-1 rounded-full font-bold uppercase ${
                  selectedAsteroid.isPotentiallyHazardous
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                }`}
              >
                {selectedAsteroid.isPotentiallyHazardous ? 'Hazard Alert' : 'Nominal Orbit'}
              </span>
            </div>

            {/* BigQuery ML Hazard Score Gauge */}
            <div className="bg-black/60 border border-zinc-800/80 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-zinc-400">BigQuery ML Impact Risk Score</span>
                <span className={`text-sm font-mono font-bold ${selectedAsteroid.hazardScore > 70 ? 'text-rose-400' : selectedAsteroid.hazardScore > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {selectedAsteroid.hazardScore}%
                </span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedAsteroid.hazardScore > 70 ? 'bg-rose-500' : selectedAsteroid.hazardScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${selectedAsteroid.hazardScore}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">
                Calculated via binary logistic regression on minimum orbit intersection distance (MOID) and absolute magnitude.
              </p>
            </div>

            {/* Physical Telemetry Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-xs font-mono">
              <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3">
                <span className="text-zinc-500 block mb-1">DIAMETER</span>
                <span className="text-white font-semibold text-sm">
                  {selectedAsteroid.estimatedDiameterM > 1000
                    ? `${(selectedAsteroid.estimatedDiameterM / 1000).toFixed(1)} km`
                    : `${selectedAsteroid.estimatedDiameterM} m`}
                </span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3">
                <span className="text-zinc-500 block mb-1">VELOCITY</span>
                <span className="text-white font-semibold text-sm">
                  {selectedAsteroid.velocityKmS} km/s
                </span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3">
                <span className="text-zinc-500 block mb-1">MISS DISTANCE</span>
                <span className="text-white font-semibold text-sm">
                  {selectedAsteroid.missDistanceLD} LD ({Math.round(selectedAsteroid.missDistanceKm).toLocaleString()} km)
                </span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3">
                <span className="text-zinc-500 block mb-1">ORBIT PERIOD</span>
                <span className="text-white font-semibold text-sm">
                  {selectedAsteroid.orbitalPeriodDays} days
                </span>
              </div>
            </div>

            {/* Asteroid Selector List */}
            <div>
              <span className="text-xs font-mono text-zinc-500 block mb-2.5">ACTIVE RADAR CATALOG</span>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {nasaAsteroids.map((ast) => (
                  <button
                    key={ast.id}
                    onClick={() => setSelectedAsteroid(ast)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-mono transition-all ${
                      ast.id === selectedAsteroid.id
                        ? 'bg-blue-600/30 text-white border border-blue-500/50'
                        : 'bg-zinc-900/40 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/60'
                    }`}
                  >
                    <span>{ast.name}</span>
                    <span className={ast.isPotentiallyHazardous ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {ast.missDistanceLD} LD
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle BigQuery Architecture Viewer */}
      <div className="bg-zinc-950/60 border border-zinc-800 rounded-3xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-semibold text-white">Inspect NASA BigQuery ML Classification Query</h4>
            <p className="text-xs text-zinc-500">View the logistic regression SQL pipeline executed over NASA JPL orbital telemetry.</p>
          </div>
          <button
            onClick={() => setShowSql(!showSql)}
            className="px-4 py-2 rounded-xl text-xs font-mono font-medium bg-zinc-900 hover:bg-zinc-800 text-blue-400 border border-zinc-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>{showSql ? 'Hide SQL Code' : 'View BigQuery ML SQL'}</span>
          </button>
        </div>

        {showSql && (
          <div className="mt-6 animate-in fade-in duration-300">
            <BigQueryQueryViewer
              createModelSql={asteroidBigQuerySQL.createModel}
              querySql={asteroidBigQuerySQL.predictionQuery}
              stats={asteroidBigQuerySQL.dremelStats}
            />
          </div>
        )}
      </div>
    </div>
  );
}
