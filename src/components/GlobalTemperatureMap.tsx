'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { yearlyClimateRecords, YearlyClimateRecord } from '@/utils/bigqueryData';

// Milestone climate markers for rapid jumping
const climateMilestones = [
  { year: 1988, label: '1988 La Niña', enso: 'La Niña' },
  { year: 1991, label: '1991 Mt. Pinatubo', enso: 'El Niño' },
  { year: 1998, label: '1998 Super El Niño', enso: 'Super El Niño' },
  { year: 2003, label: '2003 EU Heatwave', enso: 'Neutral' },
  { year: 2010, label: '2010 Russian Heat', enso: 'La Niña' },
  { year: 2011, label: '2011 Thailand Floods', enso: 'La Niña' },
  { year: 2015, label: '2015 Godzilla El Niño', enso: 'Super El Niño' },
  { year: 2022, label: '2022 Triple-Dip La Niña', enso: 'Triple-Dip La Niña' },
  { year: 2024, label: '2024 Super El Niño', enso: 'Super El Niño' },
  { year: 2025, label: '2025 Current Analysis', enso: 'Forecast' }
];

export default function GlobalTemperatureMap() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1200); // ms per frame
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [showSqlDrawer, setShowSqlDrawer] = useState<boolean>(false);

  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeRecord: YearlyClimateRecord = useMemo(() => {
    return yearlyClimateRecords.find(r => r.year === selectedYear) || yearlyClimateRecords[yearlyClimateRecords.length - 2];
  }, [selectedYear]);

  // Pre-load all 40+ images immediately on client mount for seamless scrubbing
  useEffect(() => {
    yearlyClimateRecords.forEach((record) => {
      if (record.mapImage) {
        const img = new window.Image();
        img.src = record.mapImage;
      }
    });
  }, []);

  // Timeline Auto-play Loop
  useEffect(() => {
    if (isPlaying) {
      animationTimerRef.current = setInterval(() => {
        setSelectedYear(prev => (prev >= 2026 ? 1985 : prev + 1));
      }, playbackSpeed);
    } else {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    }
    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // Jump to specific decade
  const selectDecade = (startYear: number) => {
    setIsPlaying(false);
    setSelectedYear(startYear);
  };

  // Step -1 / +1 year
  const stepYear = (delta: number) => {
    setIsPlaying(false);
    setSelectedYear(prev => {
      const next = prev + delta;
      if (next < 1985) return 1985;
      if (next > 2026) return 2026;
      return next;
    });
  };

  // Sparkline calculations
  const minAnomaly = 0.0;
  const maxAnomaly = 1.4;

  return (
    <div className="bg-zinc-950/85 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Top Banner: Scientific Provenance */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              40-YEAR PLANETARY TIMELINE (1985–2025)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              NASA GISS GISTEMP v4 • NOAA ERSSTv5 • 1200km Robinson Projection
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Global Planetary Temperature Shift (40-Year Continuous Record)
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl">
            Watch 40 years of planetary temperature shift in the exact same satellite Robinson projection format. Observe the transition from cool 1980s baseline blues, through historic El Niño heatwaves, to current record-breaking warmth.
          </p>
        </div>

        {/* Action Controls: SQL & Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSqlDrawer(!showSqlDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-blue-400 bg-blue-950/30 border border-blue-800/40 hover:bg-blue-900/40 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>BigQuery & GEE Pipeline</span>
          </button>
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-300 bg-zinc-900 border border-zinc-700/80 hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
            <span>{isZoomed ? 'Standard' : 'Expand View'}</span>
          </button>
        </div>
      </div>

      {/* Main Playback & Timeline Controls */}
      <div className="mb-6 bg-zinc-900/60 border border-zinc-800/90 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          {/* Active Status Display */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-extrabold font-mono text-blue-400 tracking-tight">
              {selectedYear}
            </span>
            <div className="h-6 w-px bg-zinc-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                activeRecord.ensoState === 'Super El Niño' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                activeRecord.ensoState.includes('La Niña') ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                activeRecord.ensoState === 'El Niño' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                activeRecord.ensoState === 'Neutral' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}>
                {activeRecord.ensoState}
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold bg-black/40 px-2 py-1 rounded-md border border-zinc-800">
                Anomaly: +{activeRecord.globalMeanAnomalyC}°C
              </span>
              <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
                ONI: {activeRecord.oniIndex > 0 ? `+${activeRecord.oniIndex}°C` : `${activeRecord.oniIndex}°C`}
              </span>
            </div>
          </div>

          {/* Transport Controls (Play, Step, Speed) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => stepYear(-1)}
              title="Previous Year (-1)"
              className="px-2.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition-colors"
            >
              ◀ -1 Yr
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
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
                  <span>PLAY 40-YR TIMELINE</span>
                </>
              )}
            </button>

            <button
              onClick={() => stepYear(1)}
              title="Next Year (+1)"
              className="px-2.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition-colors"
            >
              +1 Yr ▶
            </button>

            {/* Speed Toggle */}
            <div className="flex items-center bg-black/50 border border-zinc-800 rounded-xl p-1 text-[11px] font-mono ml-1">
              <button
                onClick={() => setPlaybackSpeed(1800)}
                className={`px-2 py-1 rounded-lg transition-colors ${playbackSpeed === 1800 ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400'}`}
              >
                0.7x
              </button>
              <button
                onClick={() => setPlaybackSpeed(1200)}
                className={`px-2 py-1 rounded-lg transition-colors ${playbackSpeed === 1200 ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400'}`}
              >
                1x
              </button>
              <button
                onClick={() => setPlaybackSpeed(600)}
                className={`px-2 py-1 rounded-lg transition-colors ${playbackSpeed === 600 ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400'}`}
              >
                2x
              </button>
            </div>
          </div>
        </div>

        {/* 40-Year Continuous Slider */}
        <div className="relative mb-3">
          <input
            type="range"
            min={1985}
            max={2026}
            step={1}
            value={selectedYear}
            onChange={(e) => {
              setIsPlaying(false);
              setSelectedYear(parseInt(e.target.value, 10));
            }}
            className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mt-1 px-1">
            <span>1985 (+0.12°C)</span>
            <span className="hidden sm:inline">1998 (+0.61°C Super El Niño)</span>
            <span className="hidden sm:inline">2010 (+0.72°C)</span>
            <span className="hidden sm:inline">2016 (+1.01°C Godzilla)</span>
            <span className="text-rose-400 font-bold">2024 (+1.29°C Active Record)</span>
            <span>2026 (Forecast)</span>
          </div>
        </div>

        {/* Decade Jumps & Climate Milestone Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
          {/* Decade Jump Buttons */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-zinc-500 text-[11px] mr-1 hidden lg:inline">Decades:</span>
            {[
              { label: '1980s', yr: 1985 },
              { label: '1990s', yr: 1990 },
              { label: '2000s', yr: 2000 },
              { label: '2010s', yr: 2010 },
              { label: '2020s', yr: 2020 }
            ].map(d => (
              <button
                key={d.label}
                onClick={() => selectDecade(d.yr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  selectedYear >= d.yr && selectedYear < d.yr + 10
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold'
                    : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Key Climate Milestones */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-zinc-500 text-[11px] font-mono mr-1 hidden xl:inline">Key Events:</span>
            {climateMilestones.map(m => (
              <button
                key={m.year}
                onClick={() => { setIsPlaying(false); setSelectedYear(m.year); }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all ${
                  selectedYear === m.year
                    ? 'bg-amber-500 text-black font-bold shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Single-Format Map Canvas Container */}
      <div className={`relative w-full rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl flex flex-col items-center justify-center transition-all duration-300 ${
        isZoomed ? 'min-h-[580px] max-h-[820px]' : 'min-h-[380px] max-h-[540px]'
      }`}>
        <div className="relative w-full aspect-[16/10] max-h-[520px] p-2 flex items-center justify-center">
          <Image
            src={activeRecord.mapImage || `/images/climate/nasa_gistemp_${selectedYear}.png`}
            alt={`NASA GISTEMP Global Surface Temperature Anomaly Map for ${selectedYear}`}
            fill
            priority
            className="object-contain transition-opacity duration-150"
          />
        </div>

        {/* Top-Left Live Watermark HUD */}
        <div className="absolute top-4 left-4 bg-black/90 border border-zinc-800 px-4 py-2.5 rounded-2xl text-xs font-mono text-white backdrop-blur-md flex items-center gap-3 shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
          <div className="flex items-baseline gap-2">
            <span className="text-zinc-400">YEAR:</span>
            <span className="text-lg font-bold text-blue-400 font-mono">{selectedYear}</span>
          </div>
          <span className="text-zinc-600">|</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-zinc-400">GLOBAL MEAN:</span>
            <span className="text-amber-400 font-bold font-mono">+{activeRecord.globalMeanAnomalyC}°C</span>
          </div>
        </div>

        {/* Top-Right Projection & Resolution Badge */}
        <div className="absolute top-4 right-4 bg-black/90 border border-zinc-800 px-3 py-1.5 rounded-xl text-[11px] font-mono text-zinc-400 backdrop-blur-md shadow-xl hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Equal-Area Robinson Projection • 761×487 Matrix</span>
        </div>

        {/* Bottom Legend Color Bar */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-black/90 border border-zinc-800 p-2.5 rounded-xl text-[10px] font-mono text-zinc-300 backdrop-blur-md flex flex-col gap-1 shadow-2xl">
          <div className="flex justify-between items-center px-1">
            <span className="text-sky-400">&lt; -4.0°C (Cold Tongue)</span>
            <span>-1.0°C</span>
            <span>0°C (Norm)</span>
            <span>+1.0°C</span>
            <span className="text-rose-400 font-bold">&gt; +4.0°C (Extreme Heat)</span>
          </div>
          <div
            className="w-full sm:w-80 h-2.5 rounded shadow-inner"
            style={{
              background: 'linear-gradient(to right, #1d4ed8, #38bdf8, #f8fafc, #facc15, #f97316, #dc2626, #7f1d1d)'
            }}
          />
        </div>
      </div>

      {/* 40-Year Interactive Warming Anomaly Sparkline / Histogram */}
      <div className="mt-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h4 className="text-xs sm:text-sm font-bold font-mono text-white uppercase tracking-wider">
              40-Year Planetary Heating Progression (+0.12°C in 1985 → +1.29°C in 2024)
            </h4>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Click any bar to jump to year
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="flex items-end gap-1 h-20 w-full pt-2">
          {yearlyClimateRecords.filter(r => r.year <= 2025).map((r) => {
            const heightPct = Math.max(10, Math.min(100, ((r.globalMeanAnomalyC - minAnomaly) / (maxAnomaly - minAnomaly)) * 100));
            const isSelected = r.year === selectedYear;

            return (
              <button
                key={r.year}
                onClick={() => { setIsPlaying(false); setSelectedYear(r.year); }}
                title={`${r.year}: +${r.globalMeanAnomalyC}°C (${r.ensoState})`}
                className="group relative flex-1 h-full flex flex-col justify-end items-center focus:outline-none"
              >
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] scale-110 z-10'
                      : r.ensoState === 'Super El Niño'
                      ? 'bg-rose-500/80 hover:bg-rose-400'
                      : r.ensoState.includes('La Niña')
                      ? 'bg-sky-500/70 hover:bg-sky-400'
                      : 'bg-zinc-600 hover:bg-zinc-400'
                  }`}
                />
                {/* Year Label for select landmarks */}
                {(r.year % 5 === 0 || r.year === 1985 || r.year === 2024) && (
                  <span className={`text-[9px] font-mono mt-1 ${isSelected ? 'text-amber-400 font-bold' : 'text-zinc-500'}`}>
                    {String(r.year).slice(2)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Deep-Dive Scientific Bulletin for Active Year */}
      <div className="mt-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <span>{selectedYear}: {activeRecord.phase}</span>
            <span className="text-xs font-mono text-blue-400">
              (Global Anomaly: +{activeRecord.globalMeanAnomalyC}°C vs 1951–1980 Baseline)
            </span>
          </h4>
          <span className="text-xs font-mono text-zinc-500">
            Source: NASA Goddard Institute for Space Studies (GISTEMP v4)
          </span>
        </div>

        <p className="text-sm font-semibold text-amber-300">
          {activeRecord.headlineEvent}
        </p>

        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          {activeRecord.bulletin}
        </p>
      </div>

      {/* BigQuery & Earth Engine Drawer */}
      {showSqlDrawer && (
        <div className="mt-6 bg-black/95 border border-blue-900/60 rounded-2xl p-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h5 className="text-sm font-mono font-bold text-white">Google Cloud & Earth Engine 40-Year Climate Telemetry</h5>
            </div>
            <span className="text-xs font-mono text-zinc-500">GEE: `NOAA/CDR/OISST/V2_1` • BQ: `noaa_gsod`</span>
          </div>

          <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
            The 40-year daily satellite record is maintained collaboratively by NOAA and NASA, and hosted in Google Cloud via the NOAA Open Data Dissemination (NODD) program. In Google Earth Engine, researchers filter and aggregate global temperature anomalies across any year from 1981 to present in real-time.
          </p>

          <pre className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-mono text-blue-300 overflow-x-auto leading-relaxed">
{`// 1. Google Earth Engine: Query 40 Years of Daily Satellite SST Anomalies
var sstCollection = ee.ImageCollection('NOAA/CDR/OISST/V2_1')
  .filter(ee.Filter.date('1985-01-01', '2025-12-31'))
  .select(['sst', 'anom']);

// Compute Annual Anomaly for Selected Year
var annualAnomaly = sstCollection
  .filter(ee.Filter.calendarRange(${selectedYear}, ${selectedYear}, 'year'))
  .mean()
  .select('anom');

Map.addLayer(annualAnomaly, {min: -3, max: 3, palette: ['blue', 'white', 'red']}, '${selectedYear} Anomaly');

-- 2. BigQuery SQL: Aggregate Global Meteorological Weather Stations
SELECT
  EXTRACT(YEAR FROM PARSE_DATE('%Y%m%d', date)) AS year,
  ROUND(AVG((temp - 32) * 5/9), 2) AS mean_temp_c,
  COUNT(DISTINCT stn) AS active_reporting_stations
FROM
  \`bigquery-public-data.noaa_gsod.gsod198*stn
GROUP BY
  year
ORDER BY
  year ASC;`}
          </pre>
        </div>
      )}
    </div>
  );
}
