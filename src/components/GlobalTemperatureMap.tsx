'use client';

import React, { useState, useEffect, useRef } from 'react';
import { yearlyClimateRecords, YearlyClimateRecord } from '@/utils/bigqueryData';

export default function GlobalTemperatureMap() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const activeRecord: YearlyClimateRecord =
    yearlyClimateRecords.find(r => r.year === selectedYear) || yearlyClimateRecords[yearlyClimateRecords.length - 3]; // default 2024

  // Auto-play timeline animation
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setSelectedYear(prev => {
          const nextYear = prev + 1;
          if (nextYear > 2026) {
            return 2015; // loop back to 2015
          }
          return nextYear;
        });
      }, 1600);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              HISTORICAL & PREDICTIVE RADAR
            </span>
            <span className="text-xs font-mono text-zinc-500">2015 – 2026 Timeline</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Planetary Temperature & Ocean Anomaly Tracker
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Monitor the multi-year progression of El Niño thermal waves, the triple-dip La Niña, and BigQuery ML’s forward climate anomaly forecast.
          </p>
        </div>

        {/* Play/Pause & Year Display */}
        <div className="flex items-center gap-4 bg-zinc-900/80 border border-zinc-700/80 px-4 py-2.5 rounded-2xl w-fit">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
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
                <span>PLAY TIMELINE</span>
              </>
            )}
          </button>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{selectedYear}</span>
            <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
              ({activeRecord.ensoState})
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Year Timeline Slider */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2 px-1 text-xs font-mono text-zinc-500">
          <span>2015 (Godzilla)</span>
          <span className="text-blue-400 font-bold">2020–22 (La Niña)</span>
          <span className="text-amber-400 font-bold">2024 (Super El Niño)</span>
          <span className="text-purple-400 font-bold">2025–26 (BQML Forecast)</span>
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

        {/* Quick Year Pill Selectors */}
        <div className="flex flex-wrap gap-2 mt-4">
          {yearlyClimateRecords.map((r) => (
            <button
              key={r.year}
              onClick={() => {
                setIsPlaying(false);
                setSelectedYear(r.year);
              }}
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

      {/* World Map Equirectangular Projection with Regional Thermal Anomalies */}
      <div className="relative w-full aspect-[2/1] max-h-[420px] bg-zinc-950 border border-zinc-800/90 rounded-2xl overflow-hidden mb-6 shadow-inner flex items-center justify-center">
        {/* World Map Continents Outline (Stylized SVG) */}
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full object-cover opacity-60 pointer-events-none"
        >
          {/* Lat/Long Grid Lines */}
          {[100, 200, 300, 400].map(y => (
            <line key={`lat-${y}`} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 6" />
          ))}
          {[200, 400, 600, 800].map(x => (
            <line key={`lon-${x}`} x1={x} y1="0" x2={x} y2="500" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 6" />
          ))}

          {/* Equator (0° Latitude) */}
          <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(56,189,248,0.25)" strokeWidth="1.5" />
          <text x="12" y="244" fill="#38bdf8" fontSize="10" fontFamily="monospace">EQUATOR (ENSO CORRIDOR)</text>

          {/* Americas Continent Silhouette */}
          <path
            d="M 120 70 Q 180 80 220 120 Q 250 160 210 200 L 260 260 Q 340 320 300 420 Q 260 460 240 400 Q 200 300 160 230 Q 120 170 80 120 Z"
            fill="rgba(255,255,255,0.07)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
          />

          {/* Eurasia & Africa Silhouette */}
          <path
            d="M 450 100 Q 600 70 780 100 Q 880 140 850 220 Q 750 250 680 190 Q 620 220 580 170 L 520 220 Q 560 300 520 400 Q 460 420 440 320 Q 420 250 450 190 Z"
            fill="rgba(255,255,255,0.07)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
          />

          {/* Southeast Asia & Australia Silhouette */}
          <path
            d="M 740 230 Q 820 240 800 310 Q 740 300 720 260 Z M 780 340 Q 880 340 880 430 Q 800 460 760 390 Z"
            fill="rgba(255,255,255,0.07)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Dynamic Thermal Anomaly Overlays */}
        {activeRecord.regions.map((reg, idx) => {
          const isCritical = reg.intensity === 'critical';
          const isSevere = reg.intensity === 'severe';
          const isCooling = reg.intensity === 'cooling';

          const color = isCooling
            ? '#38bdf8'
            : isCritical
            ? '#f43f5e'
            : isSevere
            ? '#f97316'
            : '#eab308';

          return (
            <div
              key={idx}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto group cursor-pointer transition-all duration-700"
              style={{ left: `${reg.xPct}%`, top: `${reg.yPct}%` }}
            >
              {/* Outer Pulsing Glow */}
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full animate-ping opacity-40 absolute"
                style={{ backgroundColor: color }}
              />

              {/* Main Thermal Bubble */}
              <div
                className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg border border-white/40 transition-transform duration-300 group-hover:scale-125"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 25px ${color}`
                }}
              >
                <span className="text-[10px] sm:text-xs font-mono font-bold text-black select-none">
                  {reg.anomalyC > 0 ? `+${reg.anomalyC}` : reg.anomalyC}
                </span>
              </div>

              {/* Hover Region Tag */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2 bg-black/90 text-white text-[11px] font-mono px-2.5 py-1 rounded-md border border-zinc-700 whitespace-nowrap shadow-xl z-20">
                <span className="font-bold">{reg.name}: </span>
                <span style={{ color }}>{reg.anomalyC > 0 ? `+${reg.anomalyC}°C` : `${reg.anomalyC}°C`}</span>
              </div>
            </div>
          );
        })}

        {/* Map Watermark & Active Year Badge */}
        <div className="absolute top-4 left-4 bg-black/80 border border-zinc-800 px-3 py-1.5 rounded-xl font-mono text-xs text-zinc-300 z-10 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span>YEAR: <strong className="text-white">{selectedYear}</strong></span>
          <span className="text-zinc-500">|</span>
          <span>ONI: <strong className="text-amber-400">{activeRecord.oniIndex > 0 ? `+${activeRecord.oniIndex}°C` : `${activeRecord.oniIndex}°C`}</strong></span>
        </div>

        {/* Color Legend */}
        <div className="absolute bottom-4 right-4 bg-black/85 border border-zinc-800 px-3 py-2 rounded-xl text-[10px] font-mono text-zinc-400 flex items-center gap-3 z-10 hidden sm:flex">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>&gt;+2.5°C (Critical)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>+1.5°C to +2.4°C</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span>&lt;0°C (La Niña Cooling)</span>
          </div>
        </div>
      </div>

      {/* Active Year Scientific Bulletin Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <span>{selectedYear}: {activeRecord.phase}</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                activeRecord.ensoState === 'Super El Niño'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  : activeRecord.ensoState === 'La Niña' || activeRecord.ensoState === 'Triple-Dip La Niña'
                  ? 'bg-sky-950/80 text-sky-300 border border-sky-800'
                  : activeRecord.ensoState === 'BigQuery ML Forecast'
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                  : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {activeRecord.ensoState}
            </span>
          </h4>
          <span className="text-xs font-mono text-zinc-400">
            Global Mean Anomaly: <strong className="text-white">+{activeRecord.globalMeanAnomalyC}°C</strong>
          </span>
        </div>

        <p className="text-sm font-medium text-amber-300/90 mb-2">
          {activeRecord.headlineEvent}
        </p>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          {activeRecord.bulletin}
        </p>
      </div>
    </div>
  );
}
