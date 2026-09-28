'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { yearlyClimateRecords, YearlyClimateRecord } from '@/utils/bigqueryData';

type MapViewMode = 'nasa_gistemp' | 'era5_surface' | 'noaa_daily' | 'noaa_anim' | 'nasa_spotlight';

export default function GlobalTemperatureMap() {
  const [viewMode, setViewMode] = useState<MapViewMode>('nasa_gistemp');
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [noaaSubLayer, setNoaaSubLayer] = useState<'ssta' | 'sst'>('ssta');
  const [spotlightYear, setSpotlightYear] = useState<'2015' | '2022'>('2015');
  const [showSqlDrawer, setShowSqlDrawer] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeRecord: YearlyClimateRecord =
    yearlyClimateRecords.find(r => r.year === selectedYear) || yearlyClimateRecords[yearlyClimateRecords.length - 3];

  // Timeline Auto-play Loop for NASA GISTEMP
  useEffect(() => {
    if (isPlaying && viewMode === 'nasa_gistemp') {
      animationTimerRef.current = setInterval(() => {
        setSelectedYear(prev => (prev >= 2026 ? 2015 : prev + 1));
      }, 1800);
    } else {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    }
    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [isPlaying, viewMode]);

  // Pre-load images for instant scrubbing
  useEffect(() => {
    yearlyClimateRecords.forEach((record) => {
      if (record.mapImage) {
        const img = new window.Image();
        img.src = record.mapImage;
      }
    });
  }, []);

  return (
    <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Top Banner: Scientific Provenance & Reputable Sources */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              OFFICIAL CLIMATE SATELLITE ARCHIVE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              NASA GISS • NOAA OSPO • ECMWF ERA5 • Google Earth Engine
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Planetary Thermal Surface & Anomaly Map
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl">
            Authentic, verified satellite telemetry and atmospheric reanalysis models from NASA, NOAA, and Copernicus ECMWF. Track equatorial Super El Niño heat waves, Pacific cold tongues, and multi-year planetary warming.
          </p>
        </div>

        {/* Action Controls: Inspect SQL & Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSqlDrawer(!showSqlDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-blue-400 bg-blue-950/30 border border-blue-800/40 hover:bg-blue-900/40 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>BigQuery ERA5 SQL</span>
          </button>
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-300 bg-zinc-900 border border-zinc-700/80 hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
            <span>{isZoomed ? 'Normal' : 'Expand'}</span>
          </button>
        </div>
      </div>

      {/* Primary Layer Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl w-fit">
        <button
          onClick={() => { setViewMode('nasa_gistemp'); setIsPlaying(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            viewMode === 'nasa_gistemp'
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>NASA GISTEMP Anomaly (2015–2025)</span>
        </button>

        <button
          onClick={() => { setViewMode('era5_surface'); setIsPlaying(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            viewMode === 'era5_surface'
              ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Copernicus ERA5 Surface Temp (°C)</span>
        </button>

        <button
          onClick={() => { setViewMode('noaa_daily'); setIsPlaying(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            viewMode === 'noaa_daily'
              ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>NOAA Daily Satellite Blend</span>
        </button>

        <button
          onClick={() => { setViewMode('noaa_anim'); setIsPlaying(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            viewMode === 'noaa_anim'
              ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span>NOAA Pacific Loop (Animated)</span>
        </button>

        <button
          onClick={() => { setViewMode('nasa_spotlight'); setIsPlaying(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
            viewMode === 'nasa_spotlight'
              ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span>NASA Pacific Extremes (2015 vs 2022)</span>
        </button>
      </div>

      {/* Mode-Specific Sub-Controls */}
      {viewMode === 'nasa_gistemp' && (
        <div className="mb-6 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Select Year (2015–2026):
              </span>
              <span className="text-lg font-bold font-mono text-blue-400">
                {selectedYear}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                activeRecord.ensoState === 'Super El Niño' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                activeRecord.ensoState.includes('La Niña') ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                activeRecord.ensoState === 'El Niño' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}>
                {activeRecord.ensoState} (ONI: {activeRecord.oniIndex > 0 ? `+${activeRecord.oniIndex}°C` : `${activeRecord.oniIndex}°C`})
              </span>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-mono font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_12px_rgba(37,99,235,0.4)]"
            >
              {isPlaying ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  <span>PAUSE TIMELINE</span>
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
          </div>

          {/* Scrubbing Slider */}
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
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-3"
          />

          {/* Quick-Pick Year Pills */}
          <div className="flex flex-wrap gap-1.5">
            {yearlyClimateRecords.map((r) => (
              <button
                key={r.year}
                onClick={() => { setIsPlaying(false); setSelectedYear(r.year); }}
                className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
                  r.year === selectedYear
                    ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                    : r.year === 2024 || r.year === 2015 || r.year === 2016
                    ? 'bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/50'
                    : r.year >= 2020 && r.year <= 2022
                    ? 'bg-sky-950/40 text-sky-300 border border-sky-800/40 hover:bg-sky-900/50'
                    : r.year >= 2025
                    ? 'bg-purple-950/40 text-purple-300 border border-purple-800/40 hover:bg-purple-900/50'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                {r.year}
              </button>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'noaa_daily' && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">NOAA Satellite Product:</span>
            <button
              onClick={() => setNoaaSubLayer('ssta')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                noaaSubLayer === 'ssta' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              SST Anomaly (Kelvin Wave)
            </button>
            <button
              onClick={() => setNoaaSubLayer('sst')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                noaaSubLayer === 'sst' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Absolute SST (°C)
            </button>
          </div>
          <div className="text-xs font-mono text-emerald-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Updated Daily via NOAA OSPO Operational Satellite Blend</span>
          </div>
        </div>
      )}

      {viewMode === 'nasa_spotlight' && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400">Select Pacific Event:</span>
            <button
              onClick={() => setSpotlightYear('2015')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                spotlightYear === '2015' ? 'bg-rose-600 text-white font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              2015 Godzilla El Niño (Surge)
            </button>
            <button
              onClick={() => setSpotlightYear('2022')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                spotlightYear === '2022' ? 'bg-sky-600 text-white font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              2022 Triple-Dip La Niña (Cold Tongue)
            </button>
          </div>
          <span className="text-xs font-mono text-zinc-400">NASA Earth Observatory Altimetry Telemetry</span>
        </div>
      )}

      {/* Main Image Display Container */}
      <div className={`relative w-full rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl flex items-center justify-center transition-all duration-300 ${
        isZoomed ? 'min-h-[580px] max-h-[800px]' : 'min-h-[380px] max-h-[520px]'
      }`}>
        {/* Layer 1: NASA GISTEMP Annual Anomaly */}
        {viewMode === 'nasa_gistemp' && (
          <div className="relative w-full h-full p-2 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-[16/9] max-h-[500px]">
              <Image
                src={activeRecord.mapImage || '/images/climate/nasa_gistemp_2024.png'}
                alt={`NASA GISTEMP Global Temperature Anomaly Map for ${selectedYear}`}
                fill
                priority
                className="object-contain transition-opacity duration-300"
              />
            </div>

            {/* Scientific Watermark / Attribution Badge */}
            <div className="absolute top-4 left-4 bg-black/85 border border-zinc-800/90 px-3.5 py-2 rounded-xl text-xs font-mono text-white backdrop-blur-md flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              <span>NASA GISS GISTEMP v4</span>
              <span className="text-zinc-600">|</span>
              <span className="text-blue-400 font-bold">{selectedYear}</span>
              <span className="text-zinc-600">|</span>
              <span className="text-amber-400 font-mono">+{activeRecord.globalMeanAnomalyC}°C Anomaly</span>
            </div>

            {/* Projection & Resolution Readout */}
            <div className="absolute bottom-4 right-4 bg-black/85 border border-zinc-800/90 px-3 py-1.5 rounded-xl text-[11px] font-mono text-zinc-400 backdrop-blur-md">
              Robinson Projection • 1200km GHCNv4 + ERSSTv5 Smoothing
            </div>
          </div>
        )}

        {/* Layer 2: Copernicus ECMWF ERA5 Planetary Surface Temperature */}
        {viewMode === 'era5_surface' && (
          <div className="relative w-full h-full p-2 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-[7/4] max-h-[500px]">
              <Image
                src="/images/climate/era5_surface_temp.jpg"
                alt="Copernicus ECMWF ERA5 Surface Temperature Map from Google Earth Engine"
                fill
                priority
                className="object-contain"
              />
            </div>

            <div className="absolute top-4 left-4 bg-black/85 border border-zinc-800/90 px-3.5 py-2 rounded-xl text-xs font-mono text-white backdrop-blur-md flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Copernicus ECMWF ERA5 Reanalysis</span>
              <span className="text-zinc-600">|</span>
              <span className="text-amber-300">Google Earth Engine & BigQuery Public Table</span>
            </div>

            <div className="absolute bottom-4 left-4 bg-black/85 border border-zinc-800/90 px-3 py-1.5 rounded-xl text-[11px] font-mono text-zinc-300 backdrop-blur-md">
              Absolute 2m Air/Surface Temp • Full Range: -40°C (Polar) to +40°C (Sahara/Equator)
            </div>
          </div>
        )}

        {/* Layer 3: NOAA Daily Satellite Blend (SSTA / SST) */}
        {viewMode === 'noaa_daily' && (
          <div className="relative w-full h-full p-2 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-[16/9] max-h-[500px]">
              <Image
                src={noaaSubLayer === 'ssta' ? '/images/climate/noaa_ssta_daily.png' : '/images/climate/noaa_sst_daily.png'}
                alt="NOAA OSPO Daily Blended Sea Surface Temperature Satellite Analysis"
                fill
                priority
                className="object-contain"
              />
            </div>

            <div className="absolute top-4 left-4 bg-black/85 border border-zinc-800/90 px-3.5 py-2 rounded-xl text-xs font-mono text-white backdrop-blur-md flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>NOAA OSPO Coral Reef Watch</span>
              <span className="text-zinc-600">|</span>
              <span className="text-emerald-300 font-bold">{noaaSubLayer === 'ssta' ? 'SST Anomaly (°C)' : 'Daily SST (°C)'}</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">Live Satellite Constellation (VIIRS/MetOp)</span>
            </div>
          </div>
        )}

        {/* Layer 4: NOAA Pacific Multi-Month Loop (Animated) */}
        {viewMode === 'noaa_anim' && (
          <div className="relative w-full h-full p-2 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-[16/9] max-h-[500px] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/climate/noaa_sstanim.gif"
                alt="NOAA Climate Prediction Center Pacific SST Anomaly Animated Loop"
                className="max-h-[480px] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="absolute top-4 left-4 bg-black/85 border border-zinc-800/90 px-3.5 py-2 rounded-xl text-xs font-mono text-white backdrop-blur-md flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
              <span>NOAA Climate Prediction Center (CPC)</span>
              <span className="text-zinc-600">|</span>
              <span className="text-purple-300">Continuous Equatorial Pacific Evolution</span>
            </div>

            <div className="absolute bottom-4 left-4 bg-black/85 border border-zinc-800/90 px-3 py-1.5 rounded-xl text-[11px] font-mono text-zinc-300 backdrop-blur-md">
              Watch Kelvin wave propagation and trade wind shifts across Niño 1+2, 3, 3.4, and 4
            </div>
          </div>
        )}

        {/* Layer 5: NASA Pacific Extremes Spotlight */}
        {viewMode === 'nasa_spotlight' && (
          <div className="relative w-full h-full p-2 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-[16/9] max-h-[500px]">
              <Image
                src={spotlightYear === '2015' ? '/images/climate/nasa_elnino_2015.jpg' : '/images/climate/nasa_lanina_2022.jpg'}
                alt={`NASA Earth Observatory Pacific Anomaly Spotlight: ${spotlightYear}`}
                fill
                priority
                className="object-contain"
              />
            </div>

            <div className="absolute top-4 left-4 bg-black/85 border border-zinc-800/90 px-3.5 py-2 rounded-xl text-xs font-mono text-white backdrop-blur-md flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
              <span>NASA Earth Observatory Altimeter & Microwave Telemetry</span>
              <span className="text-zinc-600">|</span>
              <span className="text-rose-300 font-bold">{spotlightYear === '2015' ? '2015 Godzilla El Niño' : '2022 Triple-Dip La Niña'}</span>
            </div>

            <div className="absolute bottom-4 left-4 bg-black/85 border border-zinc-800/90 px-3 py-1.5 rounded-xl text-[11px] font-mono text-zinc-300 backdrop-blur-md">
              Jason-2 & Jason-3 Sea Surface Height Anomaly + MUR SST
            </div>
          </div>
        )}
      </div>

      {/* Deep-Dive Scientific Bulletin */}
      <div className="mt-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <span>
              {viewMode === 'nasa_gistemp' ? `${selectedYear}: ${activeRecord.phase}` :
               viewMode === 'era5_surface' ? 'Copernicus ECMWF ERA5 Thermal Reanalysis Field' :
               viewMode === 'noaa_daily' ? 'NOAA Operational Coral Reef Watch & Blended SST' :
               viewMode === 'noaa_anim' ? 'Equatorial Pacific Kelvin Wave Evolution Loop' :
               `${spotlightYear}: NASA Earth Observatory Extreme Telemetry`}
            </span>
            {viewMode === 'nasa_gistemp' && (
              <span className="text-xs font-mono text-blue-400">
                (Global Mean: +{activeRecord.globalMeanAnomalyC}°C)
              </span>
            )}
          </h4>
          <span className="text-xs font-mono text-zinc-500">
            {viewMode === 'era5_surface' ? 'Google BigQuery: `bigquery-public-data.ecmwf_era5`' :
             viewMode === 'nasa_gistemp' ? 'NASA GISS GISTEMP v4 Surface Analysis' :
             viewMode === 'noaa_daily' || viewMode === 'noaa_anim' ? 'NOAA NCEP / NESDIS OSPO Operational Telemetry' :
             'NASA Earth Observatory & JPL PO.DAAC'}
          </span>
        </div>

        <p className="text-sm font-semibold text-amber-300">
          {viewMode === 'nasa_gistemp' ? activeRecord.headlineEvent :
           viewMode === 'era5_surface' ? 'High-accuracy planetary boundary temperature field showing global thermal belts, polar vortex gradients, and tropical heat corridors.' :
           viewMode === 'noaa_daily' ? 'Sub-daily blended microwave and infrared radiometer measurements calibrated against Argo profiling floats.' :
           viewMode === 'noaa_anim' ? 'Observe the cyclic eastward surge of high-temperature anomalous seawater suppressing coastal upwelling.' :
           spotlightYear === '2015' ? 'The 2015 event featured a massive Kelvin wave with +3.2°C anomalies across the central Pacific and devastating torrential floods in Peru.' :
           'The 2022 event marked a rare three-year consecutive La Niña with anomalous cold waters locking persistent drought into the Horn of Africa.'}
        </p>

        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          {viewMode === 'nasa_gistemp' ? activeRecord.bulletin :
           viewMode === 'era5_surface' ? 'ERA5 is the fifth-generation ECMWF atmospheric reanalysis of global climate. Available as a Google Cloud Public Dataset, it combines vast amounts of historical observations into advanced numerical weather prediction models to reconstruct past weather conditions at hourly intervals worldwide.' :
           viewMode === 'noaa_daily' ? 'NOAA Daily Coral Reef Watch (CRW) 5km satellite coral bleaching thermal stress monitoring products provide near real-time global sea surface temperature and anomaly analysis, critical for monitoring ENSO phases and marine ecosystem health.' :
           viewMode === 'noaa_anim' ? 'ENSO is governed by coupled ocean-atmosphere interactions. When trade winds weaken, equatorial Kelvin waves carry warm water eastward across the Pacific basin, shifting precipitation engines towards the Americas and drying out Australasia.' :
           'Satellite radar altimeters measure the sea surface height anomaly (SSHA). Because warm water expands, sea level rises 10–20 cm in the eastern Pacific during El Niño, while dropping during La Niña cold tongue upwelling.'}
        </p>
      </div>

      {/* SQL & Google Cloud BigQuery Pipeline Drawer */}
      {showSqlDrawer && (
        <div className="mt-6 bg-black/90 border border-blue-900/60 rounded-2xl p-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h5 className="text-sm font-mono font-bold text-white">Google BigQuery ECMWF ERA5 Analysis SQL</h5>
            </div>
            <span className="text-xs font-mono text-zinc-500">Dataset: `bigquery-public-data.ecmwf_era5`</span>
          </div>

          <pre className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-mono text-blue-300 overflow-x-auto leading-relaxed">
{`-- Extract 2m Surface Temperature and Compute Spatial Anomalies
WITH era5_monthly AS (
  SELECT
    latitude,
    longitude,
    EXTRACT(YEAR FROM valid_time) AS obs_year,
    EXTRACT(MONTH FROM valid_time) AS obs_month,
    ROUND(AVG(temperature_2m - 273.15), 2) AS temp_celsius
  FROM
    \`bigquery-public-data.ecmwf_era5.surface_daily\`
  WHERE
    valid_time BETWEEN '2015-01-01' AND '2026-09-01'
    AND latitude BETWEEN -60 AND 60
  GROUP BY
    latitude, longitude, obs_year, obs_month
),
baseline_climatology AS (
  SELECT
    latitude,
    longitude,
    obs_month,
    AVG(temp_celsius) AS baseline_temp_c
  FROM
    era5_monthly
  WHERE
    obs_year BETWEEN 2015 AND 2020
  GROUP BY
    latitude, longitude, obs_month
)
SELECT
  e.obs_year,
  e.obs_month,
  e.latitude,
  e.longitude,
  e.temp_celsius,
  ROUND(e.temp_celsius - b.baseline_temp_c, 2) AS temp_anomaly_celsius
FROM
  era5_monthly e
JOIN
  baseline_climatology b
ON
  e.latitude = b.latitude
  AND e.longitude = b.longitude
  AND e.obs_month = b.obs_month
ORDER BY
  e.obs_year DESC, temp_anomaly_celsius DESC;`}
          </pre>
        </div>
      )}
    </div>
  );
}
