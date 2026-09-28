'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import {
  yearlyClimateRecords,
  YearlyClimateRecord,
  monthlyClimateBreakdowns,
  cfsv2ForecastMonths,
  MonthlyClimateRecord,
  CFSv2ForecastMonth
} from '@/utils/bigqueryData';

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
  { year: 2026, label: '2026–27 NOAA CFSv2', enso: 'Forecast' }
];

export default function GlobalTemperatureMap() {
  // Mode: Annual 40-year timeline vs. Monthly in-between breakdown
  const [temporalView, setTemporalView] = useState<'annual' | 'monthly'>('annual');

  // Annual mode state
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1200); // ms per frame

  // Monthly mode state
  const [monthlyDataset, setMonthlyDataset] = useState<'2024' | '2023' | '2015' | 'cfsv2'>('2024');
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(8); // September default (peak flood/typhoon)
  const [isMonthlyPlaying, setIsMonthlyPlaying] = useState<boolean>(false);

  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [showSqlDrawer, setShowSqlDrawer] = useState<boolean>(false);

  const annualTimerRef = useRef<NodeJS.Timeout | null>(null);
  const monthlyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeRecord: YearlyClimateRecord = useMemo(() => {
    return yearlyClimateRecords.find(r => r.year === selectedYear) || yearlyClimateRecords[yearlyClimateRecords.length - 2];
  }, [selectedYear]);

  // Current active monthly dataset
  const activeMonthlyList: MonthlyClimateRecord[] | null = useMemo(() => {
    if (monthlyDataset === 'cfsv2') return null;
    const yr = parseInt(monthlyDataset, 10);
    return monthlyClimateBreakdowns[yr] || monthlyClimateBreakdowns[2024];
  }, [monthlyDataset]);

  const activeMonthRecord: MonthlyClimateRecord | null = useMemo(() => {
    if (!activeMonthlyList) return null;
    return activeMonthlyList[selectedMonthIdx] || activeMonthlyList[0];
  }, [activeMonthlyList, selectedMonthIdx]);

  const activeCFSv2Record: CFSv2ForecastMonth | null = useMemo(() => {
    if (monthlyDataset !== 'cfsv2') return null;
    return cfsv2ForecastMonths[selectedMonthIdx] || cfsv2ForecastMonths[0];
  }, [monthlyDataset, selectedMonthIdx]);

  // Pre-load all annual & monthly images immediately on client mount
  useEffect(() => {
    yearlyClimateRecords.forEach((record) => {
      if (record.mapImage) {
        const img = new window.Image();
        img.src = record.mapImage;
      }
    });

    Object.values(monthlyClimateBreakdowns).forEach((months) => {
      months.forEach((m) => {
        const img = new window.Image();
        img.src = m.mapImage;
      });
    });

    cfsv2ForecastMonths.forEach((m) => {
      const img = new window.Image();
      img.src = m.mapImage;
    });
  }, []);

  // Annual Timeline Auto-play Loop
  useEffect(() => {
    if (isPlaying && temporalView === 'annual') {
      annualTimerRef.current = setInterval(() => {
        setSelectedYear(prev => (prev >= 2026 ? 1985 : prev + 1));
      }, playbackSpeed);
    } else {
      if (annualTimerRef.current) clearInterval(annualTimerRef.current);
    }
    return () => {
      if (annualTimerRef.current) clearInterval(annualTimerRef.current);
    };
  }, [isPlaying, temporalView, playbackSpeed]);

  // Monthly Loop Auto-play
  useEffect(() => {
    if (isMonthlyPlaying && temporalView === 'monthly') {
      const maxLen = monthlyDataset === 'cfsv2' ? cfsv2ForecastMonths.length : 12;
      monthlyTimerRef.current = setInterval(() => {
        setSelectedMonthIdx(prev => (prev >= maxLen - 1 ? 0 : prev + 1));
      }, playbackSpeed);
    } else {
      if (monthlyTimerRef.current) clearInterval(monthlyTimerRef.current);
    }
    return () => {
      if (monthlyTimerRef.current) clearInterval(monthlyTimerRef.current);
    };
  }, [isMonthlyPlaying, temporalView, monthlyDataset, playbackSpeed]);

  // Switch to monthly view for a specific year
  const drillDownToMonthly = (yr: '2024' | '2023' | '2015' | 'cfsv2') => {
    setIsPlaying(false);
    setIsMonthlyPlaying(false);
    setMonthlyDataset(yr);
    setSelectedMonthIdx(yr === 'cfsv2' ? 0 : 8);
    setTemporalView('monthly');
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
              40-YEAR PLANETARY TIMELINE & MONTHLY ANOMALIES
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              NASA GISS GISTEMP v4 • NOAA CFSv2 Model • 1200km Robinson Projection
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Global Planetary Temperature Shift & Monthly Anomalies
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl">
            Seamlessly toggle between the 40-year annual timeline and in-between monthly satellite progressions. Inspect individual months (Jan–Dec) across major Super El Niño cycles and the official NOAA CFSv2 forward forecast models.
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

      {/* Primary Granularity Selector: Annual vs Monthly In-Between */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center bg-zinc-900/90 border border-zinc-800 p-1 rounded-2xl">
          <button
            onClick={() => { setTemporalView('annual'); setIsMonthlyPlaying(false); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-medium transition-all ${
              temporalView === 'annual'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
            </svg>
            <span>40-YEAR ANNUAL (1985–2025)</span>
          </button>

          <button
            onClick={() => { setTemporalView('monthly'); setIsPlaying(false); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-medium transition-all ${
              temporalView === 'monthly'
                ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)] font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>MONTHLY BREAKDOWN & NOAA CFSv2</span>
            <span className="hidden sm:inline text-[10px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30">
              In-Between
            </span>
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-xl p-1 text-xs font-mono">
          <span className="text-zinc-500 px-2 text-[11px]">Speed:</span>
          <button
            onClick={() => setPlaybackSpeed(1800)}
            className={`px-2.5 py-1 rounded-lg transition-colors ${playbackSpeed === 1800 ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
          >
            0.7x
          </button>
          <button
            onClick={() => setPlaybackSpeed(1200)}
            className={`px-2.5 py-1 rounded-lg transition-colors ${playbackSpeed === 1200 ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
          >
            1x
          </button>
          <button
            onClick={() => setPlaybackSpeed(600)}
            className={`px-2.5 py-1 rounded-lg transition-colors ${playbackSpeed === 600 ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
          >
            2x
          </button>
        </div>
      </div>

      {/* VIEW A: ANNUAL 40-YEAR TIMELINE CONTROLS */}
      {temporalView === 'annual' && (
        <div className="mb-6 bg-zinc-900/60 border border-zinc-800/90 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
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
                  Annual Anomaly: +{activeRecord.globalMeanAnomalyC}°C
                </span>
                <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
                  ONI: {activeRecord.oniIndex > 0 ? `+${activeRecord.oniIndex}°C` : `${activeRecord.oniIndex}°C`}
                </span>
              </div>
            </div>

            {/* Transport Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setIsPlaying(false); setSelectedYear(prev => Math.max(1985, prev - 1)); }}
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
                onClick={() => { setIsPlaying(false); setSelectedYear(prev => Math.min(2026, prev + 1)); }}
                className="px-2.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition-colors"
              >
                +1 Yr ▶
              </button>

              {/* Drill-down shortcut if current year has monthly data */}
              {(selectedYear === 2024 || selectedYear === 2023 || selectedYear === 2015) && (
                <button
                  onClick={() => drillDownToMonthly(String(selectedYear) as '2024' | '2023' | '2015')}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-mono font-bold transition-all ml-2"
                >
                  <span>Inspect 12 Months ▾</span>
                </button>
              )}
              {selectedYear === 2026 && (
                <button
                  onClick={() => drillDownToMonthly('cfsv2')}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 text-xs font-mono font-bold transition-all ml-2"
                >
                  <span>CFSv2 Monthly Forecast ▾</span>
                </button>
              )}
            </div>
          </div>

          {/* Slider */}
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

          {/* Decade Buttons & Event Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
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
                  onClick={() => { setIsPlaying(false); setSelectedYear(d.yr); }}
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

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-zinc-500 text-[11px] font-mono mr-1 hidden xl:inline">Key Milestones:</span>
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
      )}

      {/* VIEW B: MONTHLY IN-BETWEEN BREAKDOWN & NOAA CFSv2 CONTROLS */}
      {temporalView === 'monthly' && (
        <div className="mb-6 bg-zinc-900/60 border border-amber-900/40 rounded-2xl p-4 sm:p-5">
          {/* Target Sequence Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-zinc-400 mr-1">Monthly Series:</span>
              {[
                { id: '2024', label: '2024 Super El Niño (12 Mo)' },
                { id: '2023', label: '2023 Rapid Transition (12 Mo)' },
                { id: '2015', label: '2015 Godzilla El Niño (12 Mo)' },
                { id: 'cfsv2', label: 'NOAA CFSv2 Forward Forecast (6 Mo)' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setIsMonthlyPlaying(false);
                    setMonthlyDataset(tab.id as '2024' | '2023' | '2015' | 'cfsv2');
                    setSelectedMonthIdx(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                    monthlyDataset === tab.id
                      ? tab.id === 'cfsv2'
                        ? 'bg-purple-600 text-white font-bold shadow-[0_0_12px_rgba(147,51,234,0.5)]'
                        : 'bg-amber-600 text-white font-bold shadow-[0_0_12px_rgba(217,119,6,0.5)]'
                      : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Play/Pause Monthly Loop */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const maxLen = monthlyDataset === 'cfsv2' ? cfsv2ForecastMonths.length : 12;
                  setSelectedMonthIdx(prev => (prev <= 0 ? maxLen - 1 : prev - 1));
                }}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition-colors"
              >
                ◀ -1 Mo
              </button>

              <button
                onClick={() => setIsMonthlyPlaying(!isMonthlyPlaying)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-mono font-bold text-white transition-all ${
                  monthlyDataset === 'cfsv2' ? 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_15px_rgba(217,119,6,0.4)]'
                }`}
              >
                {isMonthlyPlaying ? 'PAUSE' : 'PLAY MONTHLY LOOP'}
              </button>

              <button
                onClick={() => {
                  const maxLen = monthlyDataset === 'cfsv2' ? cfsv2ForecastMonths.length : 12;
                  setSelectedMonthIdx(prev => (prev >= maxLen - 1 ? 0 : prev + 1));
                }}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition-colors"
              >
                +1 Mo ▶
              </button>
            </div>
          </div>

          {/* Month Slider */}
          <div className="mb-3">
            <input
              type="range"
              min={0}
              max={monthlyDataset === 'cfsv2' ? cfsv2ForecastMonths.length - 1 : 11}
              step={1}
              value={selectedMonthIdx}
              onChange={(e) => {
                setIsMonthlyPlaying(false);
                setSelectedMonthIdx(parseInt(e.target.value, 10));
              }}
              className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Individual Clickable Month Pills */}
          <div className="flex flex-wrap gap-1.5">
            {monthlyDataset !== 'cfsv2' ? (
              activeMonthlyList?.map((m, idx) => (
                <button
                  key={m.month}
                  onClick={() => { setIsMonthlyPlaying(false); setSelectedMonthIdx(idx); }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
                    idx === selectedMonthIdx
                      ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                  }`}
                >
                  {m.monthName.slice(0, 3)}
                </button>
              ))
            ) : (
              cfsv2ForecastMonths.map((m, idx) => (
                <button
                  key={m.index}
                  onClick={() => { setIsMonthlyPlaying(false); setSelectedMonthIdx(idx); }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
                    idx === selectedMonthIdx
                      ? 'bg-purple-600 text-white font-bold shadow-[0_0_12px_rgba(147,51,234,0.6)]'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                  }`}
                >
                  {m.targetMonth}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Single-Format Map Canvas Container */}
      <div className={`relative w-full rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl flex flex-col items-center justify-center transition-all duration-300 ${
        isZoomed ? 'min-h-[580px] max-h-[820px]' : 'min-h-[380px] max-h-[540px]'
      }`}>
        <div className="relative w-full aspect-[16/10] max-h-[520px] p-2 flex items-center justify-center">
          {temporalView === 'annual' ? (
            <Image
              src={activeRecord.mapImage || `/images/climate/nasa_gistemp_${selectedYear}.png`}
              alt={`NASA GISTEMP Global Surface Temperature Anomaly Map for ${selectedYear}`}
              fill
              priority
              className="object-contain transition-opacity duration-150"
            />
          ) : monthlyDataset !== 'cfsv2' && activeMonthRecord ? (
            <Image
              src={activeMonthRecord.mapImage}
              alt={`NASA GISTEMP Monthly Anomaly Map for ${activeMonthRecord.monthName} ${activeMonthRecord.year}`}
              fill
              priority
              className="object-contain transition-opacity duration-150"
            />
          ) : activeCFSv2Record ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={activeCFSv2Record.mapImage}
              alt={`NOAA CFSv2 Monthly SST Anomaly Forecast for ${activeCFSv2Record.targetMonth}`}
              className="max-h-[500px] w-auto object-contain rounded-xl"
            />
          ) : null}
        </div>

        {/* Top-Left Live Watermark HUD */}
        <div className="absolute top-4 left-4 bg-black/90 border border-zinc-800 px-4 py-2.5 rounded-2xl text-xs font-mono text-white backdrop-blur-md flex items-center gap-3 shadow-xl">
          <span className={`w-2.5 h-2.5 rounded-full ${temporalView === 'annual' ? 'bg-blue-400 animate-pulse' : monthlyDataset === 'cfsv2' ? 'bg-purple-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
          {temporalView === 'annual' ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-zinc-400">YEAR:</span>
                <span className="text-lg font-bold text-blue-400 font-mono">{selectedYear}</span>
              </div>
              <span className="text-zinc-600">|</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-zinc-400">MEAN:</span>
                <span className="text-amber-400 font-bold font-mono">+{activeRecord.globalMeanAnomalyC}°C</span>
              </div>
            </>
          ) : monthlyDataset !== 'cfsv2' && activeMonthRecord ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-zinc-400">MONTH:</span>
                <span className="text-lg font-bold text-amber-400 font-mono">{activeMonthRecord.monthName} {activeMonthRecord.year}</span>
              </div>
              <span className="text-zinc-600">|</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-zinc-400">MONTHLY ANOMALY:</span>
                <span className="text-rose-400 font-bold font-mono">+{activeMonthRecord.globalMeanAnomalyC}°C</span>
              </div>
            </>
          ) : activeCFSv2Record ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-zinc-400">FORECAST TARGET:</span>
                <span className="text-lg font-bold text-purple-400 font-mono">{activeCFSv2Record.targetMonth}</span>
              </div>
              <span className="text-zinc-600">|</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-zinc-400">NIÑO 3.4 ANOMALY:</span>
                <span className="text-sky-300 font-bold font-mono">{activeCFSv2Record.projectedNiño34AnomalyC}°C</span>
              </div>
            </>
          ) : null}
        </div>

        {/* Top-Right Projection & Resolution Badge */}
        <div className="absolute top-4 right-4 bg-black/90 border border-zinc-800 px-3 py-1.5 rounded-xl text-[11px] font-mono text-zinc-400 backdrop-blur-md shadow-xl hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>
            {temporalView === 'annual' ? 'Annual Robinson Projection (1200km GISTEMP)' :
             monthlyDataset === 'cfsv2' ? 'NOAA CFSv2 Global Coupled Forecast Model' :
             'Monthly Surface Air & Ocean Thermal Anomaly'}
          </span>
        </div>

        {/* Bottom Legend Color Bar */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-black/90 border border-zinc-800 p-2.5 rounded-xl text-[10px] font-mono text-zinc-300 backdrop-blur-md flex flex-col gap-1 shadow-2xl">
          <div className="flex justify-between items-center px-1">
            <span className="text-sky-400">&lt; -4.0°C (Cold Tongue)</span>
            <span>-1.0°C</span>
            <span>0°C (Baseline)</span>
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

      {/* 40-Year Sparkline Chart (Only shown in Annual view) */}
      {temporalView === 'annual' && (
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
      )}

      {/* Deep-Dive Scientific Bulletin */}
      <div className="mt-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            {temporalView === 'annual' ? (
              <>
                <span>{selectedYear}: {activeRecord.phase}</span>
                <span className="text-xs font-mono text-blue-400">
                  (Global Anomaly: +{activeRecord.globalMeanAnomalyC}°C vs 1951–1980 Baseline)
                </span>
              </>
            ) : monthlyDataset !== 'cfsv2' && activeMonthRecord ? (
              <>
                <span>{activeMonthRecord.monthName} {activeMonthRecord.year}: {activeMonthRecord.seasonName}</span>
                <span className="text-xs font-mono text-amber-400">
                  (Monthly Global Anomaly: +{activeMonthRecord.globalMeanAnomalyC}°C)
                </span>
              </>
            ) : activeCFSv2Record ? (
              <>
                <span>NOAA CFSv2 Forecast: {activeCFSv2Record.targetMonth}</span>
                <span className="text-xs font-mono text-purple-400">
                  (Niño 3.4 SST Anomaly: {activeCFSv2Record.projectedNiño34AnomalyC}°C)
                </span>
              </>
            ) : null}
          </h4>

          <span className="text-xs font-mono text-zinc-500">
            {temporalView === 'annual' ? 'NASA GISS GISTEMP v4 Surface Analysis' :
             monthlyDataset === 'cfsv2' ? 'NOAA Climate Prediction Center (CPC) CFSv2 Model' :
             'NASA Goddard Institute for Space Studies Monthly Telemetry'}
          </span>
        </div>

        <p className="text-sm font-semibold text-amber-300">
          {temporalView === 'annual' ? activeRecord.headlineEvent :
           monthlyDataset !== 'cfsv2' && activeMonthRecord ? activeMonthRecord.headline :
           activeCFSv2Record ? activeCFSv2Record.headline : ''}
        </p>

        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          {temporalView === 'annual' ? activeRecord.bulletin :
           monthlyDataset !== 'cfsv2' && activeMonthRecord ? (
            `Monthly temperature anomalies highlight the dynamic lifecycle of equatorial Kelvin waves and seasonal teleconnections. During ${activeMonthRecord.monthName} ${activeMonthRecord.year}, the Oceanic Niño Index was ${activeMonthRecord.oniIndex > 0 ? `+${activeMonthRecord.oniIndex}°C` : `${activeMonthRecord.oniIndex}°C`}, driving regional storm tracks and monsoon variations.`
           ) : activeCFSv2Record ? (
            `The NCEP Climate Forecast System version 2 (CFSv2) is a fully coupled ocean-land-atmosphere dynamical model initialized from recent operational observations. It projects sea surface temperature anomalies across global basins 1 to 6 months into the future to monitor ENSO phase transitions.`
           ) : ''}
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

// Compute Monthly Anomaly for Specific Month
var monthlyAnomaly = sstCollection
  .filter(ee.Filter.calendarRange(2024, 2024, 'year'))
  .filter(ee.Filter.calendarRange(9, 9, 'month'))
  .mean()
  .select('anom');

Map.addLayer(monthlyAnomaly, {min: -3, max: 3, palette: ['blue', 'white', 'red']}, 'Sept 2024 Anomaly');

-- 2. BigQuery SQL: Aggregate Monthly Anomaly Trends
SELECT
  EXTRACT(YEAR FROM PARSE_DATE('%Y%m%d', date)) AS year,
  EXTRACT(MONTH FROM PARSE_DATE('%Y%m%d', date)) AS month,
  ROUND(AVG((temp - 32) * 5/9), 2) AS mean_temp_c,
  COUNT(DISTINCT stn) AS active_reporting_stations
FROM
  \`bigquery-public-data.noaa_gsod.gsod202*stn
WHERE
  stn = '476620' -- Tokyo Station
GROUP BY
  year, month
ORDER BY
  year DESC, month DESC;`}
          </pre>
        </div>
      )}
    </div>
  );
}
