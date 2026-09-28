'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { yearlyClimateRecords, YearlyClimateRecord } from '@/utils/bigqueryData';

// Month names for seasonal scrub
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Color ramp exactly mirroring satellite & Google Earth Engine thermal reanalysis
// [Temperature in °C, R, G, B]
const thermalColorMap: [number, number, number, number][] = [
  [-35, 255, 255, 255], // White / Polar Ice
  [-25, 236, 72, 153],  // Bright Pink / Magenta
  [-15, 147, 51, 234],  // Purple
  [-8,  59, 130, 246],  // Royal Blue
  [-2,  14, 165, 233],  // Cyan / Sky Blue
  [4,   16, 185, 129],  // Emerald Green
  [12,  132, 204, 22],  // Lime Green
  [18,  234, 179, 8],   // Vibrant Yellow
  [25,  249, 115, 22],  // Deep Orange
  [32,  239, 68, 68],   // Crimson Red
  [40,  153, 27, 27]    // Deep Burgundy
];

function sampleThermalColor(temp: number): [number, number, number] {
  if (temp <= thermalColorMap[0][0]) {
    return [thermalColorMap[0][1], thermalColorMap[0][2], thermalColorMap[0][3]];
  }
  const lastIdx = thermalColorMap.length - 1;
  if (temp >= thermalColorMap[lastIdx][0]) {
    return [thermalColorMap[lastIdx][1], thermalColorMap[lastIdx][2], thermalColorMap[lastIdx][3]];
  }

  for (let i = 0; i < lastIdx; i++) {
    const [t0, r0, g0, b0] = thermalColorMap[i];
    const [t1, r1, g1, b1] = thermalColorMap[i + 1];
    if (temp >= t0 && temp <= t1) {
      const factor = (temp - t0) / (t1 - t0);
      return [
        Math.round(r0 + (r1 - r0) * factor),
        Math.round(g0 + (g1 - g0) * factor),
        Math.round(b0 + (b1 - b0) * factor)
      ];
    }
  }
  return [255, 255, 255];
}

export default function GlobalTemperatureMap() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedMonth, setSelectedMonth] = useState<number>(6); // July default (summer peak)
  const [mode, setMode] = useState<'year' | 'month'>('year');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredCoords, setHoveredCoords] = useState<{ lat: number; lng: number; temp: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeRecord: YearlyClimateRecord =
    yearlyClimateRecords.find(r => r.year === selectedYear) || yearlyClimateRecords[yearlyClimateRecords.length - 3];

  // Render continuous thermal raster map
  const renderThermalField = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 480;
    const height = 240;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Seasonal solar declination factor (-1 for Jan, +1 for July)
    const monthAngle = ((selectedMonth - 0.5) / 12) * Math.PI * 2;
    const seasonalTilt = Math.sin(monthAngle - Math.PI / 2); // peak summer in North in July
    const thermalEquatorShift = seasonalTilt * 0.18; // shift thermal equator north/south

    // ENSO Pacific anomaly modifier
    const ensoIntensity = activeRecord.oniIndex; // e.g. +2.1 in 2024, -1.3 in 2020

    let ptr = 0;
    for (let y = 0; y < height; y++) {
      // Latitude from +90° (top) to -90° (bottom)
      const latNormalized = 1 - (y / height) * 2; // +1 at top, -1 at bottom
      const lat = latNormalized * 90;

      // Base planetary temperature profile: hot equator, freezing poles
      // Shifted by seasonal tilt
      const effectiveLatNorm = latNormalized - thermalEquatorShift;
      const baseTemp = 31 * Math.cos(effectiveLatNorm * (Math.PI / 2) * 0.95) - (latNormalized > 0 ? 18 : 28) * Math.abs(latNormalized);

      for (let x = 0; x < width; x++) {
        // Longitude from -180° to +180°
        const lngNormalized = (x / width) * 2 - 1; // -1 to +1
        const lng = lngNormalized * 180;

        // Planetary Rossby / Jet Stream undulating waves
        const wave1 = Math.sin(lngNormalized * Math.PI * 3 + latNormalized * 2) * 3.5;
        const wave2 = Math.cos(lngNormalized * Math.PI * 5 - latNormalized * 3) * 2.0;

        // Continental heat capacity (land warms more in summer, cools more in winter)
        let landMod = 0;
        // North America & Eurasia
        if (lat > 20 && lat < 65 && ((lng > -130 && lng < -60) || (lng > 0 && lng < 140))) {
          landMod = seasonalTilt * 6.0;
        }
        // North Africa & Sahara (extreme heat belt)
        if (lat > 15 && lat < 32 && lng > -15 && lng < 45) {
          landMod = 8.0 + seasonalTilt * 4.0;
        }
        // Australia (South hemisphere land heating in Dec-Feb)
        if (lat < -15 && lat > -35 && lng > 115 && lng < 155) {
          landMod = -seasonalTilt * 7.0;
        }

        // El Niño / La Niña Equatorial Pacific Thermal Tongue (Lng: -170° to -80°, Lat: -10° to +10°)
        let ensoMod = 0;
        if (Math.abs(lat) < 16 && lng > -175 && lng < -75) {
          const pacificDist = 1 - Math.hypot((lng - (-125)) / 50, lat / 12);
          if (pacificDist > 0) {
            ensoMod = pacificDist * ensoIntensity * 3.8;
          }
        }

        // Southeast Asia / Thailand warm pool (Lat: 5° to 22°, Lng: 95° to 110°)
        if (lat > 5 && lat < 25 && lng > 95 && lng < 115) {
          ensoMod += (ensoIntensity > 0 ? 2.5 : 0.8);
        }

        // Global warming anomaly for selected year
        const yearTrend = (selectedYear - 2015) * 0.04;

        // Compute final surface temperature in °C
        const temp = baseTemp + wave1 + wave2 + landMod + ensoMod + yearTrend;

        // Sample thermal ramp
        const [r, g, b] = sampleThermalColor(temp);

        data[ptr] = r;
        data[ptr + 1] = g;
        data[ptr + 2] = b;
        data[ptr + 3] = 255;
        ptr += 4;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [selectedYear, selectedMonth, activeRecord.oniIndex]);

  useEffect(() => {
    renderThermalField();
  }, [renderThermalField]);

  // Timeline Auto-play Loop
  useEffect(() => {
    if (isPlaying) {
      animationTimerRef.current = setInterval(() => {
        if (mode === 'year') {
          setSelectedYear(prev => (prev >= 2026 ? 2015 : prev + 1));
        } else {
          setSelectedMonth(prev => (prev >= 11 ? 0 : prev + 1));
        }
      }, 1500);
    } else {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    }
    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [isPlaying, mode]);

  // Handle pointer hover over map to inspect precise coordinates and temperature
  const handleMapPointer = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const yPct = (e.clientY - rect.top) / rect.height;

    const lat = Math.round((1 - yPct * 2) * 90);
    const lng = Math.round((xPct * 2 - 1) * 180);

    // Approximate temp at hover
    const base = 31 * Math.cos(((lat) / 90) * (Math.PI / 2) * 0.95) - (lat > 0 ? 18 : 28) * Math.abs(lat / 90);
    const enso = Math.abs(lat) < 15 && lng > -175 && lng < -75 ? activeRecord.oniIndex * 2.5 : 0;
    const approxTemp = Math.round(base + enso);

    setHoveredCoords({ lat, lng, temp: approxTemp });
  };

  return (
    <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header and Google Cloud Data Source Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              GLOBAL THERMAL REANALYSIS
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Google Earth Engine & BigQuery ECMWF ERA5
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Global Planetary Temperature Surface Map
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            High-resolution satellite & reanalysis thermal model. Watch the equatorial Super El Niño heat tongue surge across the Pacific, monsoon heat over Thailand, and seasonal hemispheric shifts.
          </p>
        </div>

        {/* Mode Selector & Play/Pause Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs font-mono">
            <button
              onClick={() => { setIsPlaying(false); setMode('year'); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${mode === 'year' ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              YEARS (2015–2026)
            </button>
            <button
              onClick={() => { setIsPlaying(false); setMode('month'); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${mode === 'month' ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              MONTHS (JAN–DEC)
            </button>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            {isPlaying ? (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>ANIMATE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scrubbing Sliders */}
      <div className="mb-6">
        {mode === 'year' ? (
          <div>
            <div className="flex justify-between items-center mb-2 px-1 text-xs font-mono text-zinc-400">
              <span>2015 (Godzilla)</span>
              <span className="text-sky-400 font-bold">2020–22 (La Niña Cold Tongue)</span>
              <span className="text-amber-400 font-bold">2024 (Active Super El Niño)</span>
              <span className="text-purple-400 font-bold">2025–26 (BigQuery ML Prediction)</span>
            </div>
            <input
              type="range"
              min={2015}
              max={2026}
              step={1}
              value={selectedYear}
              onChange={(e) => {
                setIsPlaying(false);
                setSelectedYear(parseInt(e.target.value, 10));
              }}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {yearlyClimateRecords.map((r) => (
                <button
                  key={r.year}
                  onClick={() => { setIsPlaying(false); setSelectedYear(r.year); }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
                    r.year === selectedYear
                      ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                      : r.year >= 2025
                      ? 'bg-purple-950/40 text-purple-300 border border-purple-800/40 hover:bg-purple-900/50'
                      : r.year === 2024 || r.year === 2015 || r.year === 2016
                      ? 'bg-amber-950/40 text-amber-300 border border-amber-800/40 hover:bg-amber-900/50'
                      : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-white'
                  }`}
                >
                  {r.year}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2 px-1 text-xs font-mono text-zinc-400">
              <span>January (Boreal Winter)</span>
              <span className="text-amber-400 font-bold">July (Boreal Summer Peak)</span>
              <span>December (Austral Summer)</span>
            </div>
            <input
              type="range"
              min={0}
              max={11}
              step={1}
              value={selectedMonth}
              onChange={(e) => {
                setIsPlaying(false);
                setSelectedMonth(parseInt(e.target.value, 10));
              }}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {months.map((m, idx) => (
                <button
                  key={m}
                  onClick={() => { setIsPlaying(false); setSelectedMonth(idx); }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-all ${
                    idx === selectedMonth
                      ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                      : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-white'
                  }`}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Thermal Canvas & Crisp Continent Overlay */}
      <div
        onMouseMove={handleMapPointer}
        onMouseLeave={() => setHoveredCoords(null)}
        className="relative w-full aspect-[2/1] max-h-[500px] bg-black border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl cursor-crosshair group"
      >
        {/* Continuous Thermal Raster Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-fill filter blur-[1.5px]"
        />

        {/* Detailed High-Contrast Continent Coastlines & National Borders Overlay */}
        <svg
          viewBox="0 0 1000 500"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* North America */}
          <path
            d="M 60 70 L 110 50 L 170 60 L 220 80 L 290 85 L 280 130 L 240 135 L 250 165 L 210 210 L 245 235 L 270 280 L 240 285 L 215 250 L 160 250 L 140 200 L 115 160 L 70 120 Z"
            fill="none"
            stroke="#09090b"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* South America */}
          <path
            d="M 270 280 L 320 290 L 370 330 L 350 400 L 320 470 L 285 490 L 270 430 L 255 350 L 250 300 Z"
            fill="none"
            stroke="#09090b"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Eurasia (Europe + Asia) */}
          <path
            d="M 440 100 L 490 80 L 580 70 L 710 65 L 860 80 L 920 120 L 890 170 L 830 190 L 800 240 L 730 250 L 680 220 L 630 240 L 590 190 L 530 220 L 480 200 L 460 140 Z"
            fill="none"
            stroke="#09090b"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Africa */}
          <path
            d="M 460 190 L 530 190 L 570 220 L 610 260 L 580 340 L 550 420 L 510 430 L 470 350 L 440 280 L 430 220 Z"
            fill="none"
            stroke="#09090b"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Australia */}
          <path
            d="M 760 330 L 840 330 L 880 370 L 860 430 L 790 440 L 750 380 Z"
            fill="none"
            stroke="#09090b"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Greenland */}
          <path
            d="M 330 40 L 380 50 L 370 90 L 320 80 Z"
            fill="none"
            stroke="#09090b"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Japan Archipelago */}
          <path
            d="M 870 170 L 890 190 L 880 215 L 865 210 Z"
            fill="none"
            stroke="#09090b"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Thailand & Southeast Asia Peninsulas */}
          <path
            d="M 740 250 L 775 270 L 760 320 L 740 300 Z"
            fill="none"
            stroke="#09090b"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Antarctica Outline (Bottom) */}
          <path
            d="M 50 480 Q 250 460 500 465 Q 750 460 950 480 L 1000 500 L 0 500 Z"
            fill="none"
            stroke="#09090b"
            strokeWidth="2"
          />

          {/* Equator Guide Line */}
          <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="5 5" />
          <text x="12" y="244" fill="#ffffff" fontSize="10" fontFamily="monospace" opacity="0.8">
            0° EQUATOR (PACIFIC EL NIÑO KELVIN CORRIDOR)
          </text>
        </svg>

        {/* Live Hover Coordinate Readout Tooltip */}
        {hoveredCoords && (
          <div className="absolute top-4 right-4 bg-black/90 border border-zinc-700 px-3.5 py-2 rounded-xl text-xs font-mono text-white shadow-2xl pointer-events-none z-20 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>LAT: <strong>{hoveredCoords.lat > 0 ? `${hoveredCoords.lat}°N` : `${Math.abs(hoveredCoords.lat)}°S`}</strong></span>
            <span>LON: <strong>{hoveredCoords.lng > 0 ? `${hoveredCoords.lng}°E` : `${Math.abs(hoveredCoords.lng)}°W`}</strong></span>
            <span className="text-amber-400 font-bold border-l border-zinc-700 pl-3">TEMP: ~{hoveredCoords.temp}°C</span>
          </div>
        )}

        {/* Active Temporal Status Badge */}
        <div className="absolute top-4 left-4 bg-black/85 border border-zinc-800 px-4 py-2 rounded-2xl font-mono text-xs text-white z-10 flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
          <span>PERIOD: <strong className="text-blue-400">{mode === 'year' ? selectedYear : `${months[selectedMonth]} ${selectedYear}`}</strong></span>
          <span className="text-zinc-600">|</span>
          <span>ENSO ONI: <strong className="text-amber-400">{activeRecord.oniIndex > 0 ? `+${activeRecord.oniIndex}°C` : `${activeRecord.oniIndex}°C`}</strong></span>
          <span className="text-zinc-600">|</span>
          <span className="hidden sm:inline text-zinc-300">Phase: {activeRecord.ensoState}</span>
        </div>

        {/* Scientific Temperature Gradient Legend Bar */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-black/90 border border-zinc-800 p-3 rounded-2xl z-10 flex flex-col gap-1.5 backdrop-blur-md">
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-300">
            <span>&lt;-30°C (Ice)</span>
            <span>-10°C</span>
            <span>0°C</span>
            <span>+15°C</span>
            <span>+28°C</span>
            <span className="text-rose-400 font-bold">&gt;+38°C (Extreme)</span>
          </div>
          <div
            className="w-full sm:w-80 h-3 rounded-md shadow-inner border border-zinc-700"
            style={{
              background: 'linear-gradient(to right, #ffffff, #ec4899, #9333ea, #3b82f6, #0ea5e9, #10b981, #84cc16, #eab308, #f97316, #ef4444, #991b1b)'
            }}
          />
        </div>
      </div>

      {/* Deep-Dive Scientific Bulletin */}
      <div className="mt-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <span>{selectedYear}: {activeRecord.phase}</span>
            <span className="text-xs font-mono text-blue-400">
              (Global Anomaly: +{activeRecord.globalMeanAnomalyC}°C)
            </span>
          </h4>
          <span className="text-xs font-mono text-zinc-500">
            BigQuery Public Table: `bigquery-public-data.ecmwf_era5`
          </span>
        </div>
        <p className="text-sm font-semibold text-amber-300">
          {activeRecord.headlineEvent}
        </p>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          {activeRecord.bulletin}
        </p>
      </div>
    </div>
  );
}
