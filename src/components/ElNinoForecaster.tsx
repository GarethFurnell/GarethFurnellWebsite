'use client';

import React, { useState, useMemo } from 'react';
import {
  elNinoExplanation,
  elNinoLocations,
  elNinoBigQuerySQL,
  LocationImpact
} from '@/utils/bigqueryData';
import BigQueryQueryViewer from './BigQueryQueryViewer';
import GlobalTemperatureMap from './GlobalTemperatureMap';

export default function ElNinoForecaster() {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('bangkok-thailand');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSql, setShowSql] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Filter locations by search query
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return elNinoLocations;
    const q = searchQuery.toLowerCase();
    return elNinoLocations.filter(
      loc =>
        loc.name.toLowerCase().includes(q) ||
        loc.country.toLowerCase().includes(q) ||
        loc.region.toLowerCase().includes(q) ||
        loc.status.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const selectedLocation = useMemo(() => {
    return elNinoLocations.find(l => l.id === selectedLocationId) || elNinoLocations[0];
  }, [selectedLocationId]);

  // Chart coordinate calculations
  const chartPoints = selectedLocation.historicalData;
  const chartHeight = 220;
  const chartWidth = 700;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Min and max temperature anomalies for scaling
  const minTemp = -0.5;
  const maxTemp = 4.0;

  const getX = (index: number) => padding.left + (index / (chartPoints.length - 1)) * innerWidth;
  const getY = (temp: number) => padding.top + innerHeight - ((temp - minTemp) / (maxTemp - minTemp)) * innerHeight;

  // Generate SVG path for historical data (solid line)
  const historicalPath = useMemo(() => {
    const points = chartPoints
      .map((p, idx) => (p.historicalAnomaly !== null ? `${getX(idx)},${getY(p.historicalAnomaly)}` : null))
      .filter(Boolean);
    return points.length > 0 ? `M ${points.join(' L ')}` : '';
  }, [chartPoints]);

  // Generate SVG path for forecast data (dashed line)
  const forecastPath = useMemo(() => {
    const points = chartPoints
      .map((p, idx) => (p.forecastAnomaly !== null ? `${getX(idx)},${getY(p.forecastAnomaly)}` : null))
      .filter(Boolean);
    return points.length > 0 ? `M ${points.join(' L ')}` : '';
  }, [chartPoints]);

  // Generate confidence interval area polygon (ARIMA_PLUS upper and lower bounds)
  const confidenceArea = useMemo(() => {
    const upperPoints: string[] = [];
    const lowerPoints: string[] = [];

    chartPoints.forEach((p, idx) => {
      if (p.confidenceUpper !== null && p.confidenceLower !== null) {
        upperPoints.push(`${getX(idx)},${getY(p.confidenceUpper)}`);
        lowerPoints.unshift(`${getX(idx)},${getY(p.confidenceLower)}`);
      }
    });

    if (upperPoints.length === 0) return '';
    return `M ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`;
  }, [chartPoints]);

  return (
    <div className="flex flex-col gap-10">
      {/* 1. Educational Explainer: What El Niño Is, How It Forms & Periodicity */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-900/40 bg-gradient-to-br from-blue-950/30 via-zinc-950/80 to-black p-6 md:p-10 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                CLIMATE INTELLIGENCE
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                BigQuery ML ARIMA+
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {elNinoExplanation.title}
            </h2>
          </div>

          {/* Current ONI Status Widget */}
          <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
              </span>
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Oceanic Niño Index (ONI)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-amber-400">{elNinoExplanation.currentStatus.oniIndex}</span>
                <span className="text-xs text-zinc-300 font-medium">({elNinoExplanation.currentStatus.classification})</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-4xl mb-8">
          {elNinoExplanation.overview}
        </p>

        {/* 3-Stage Formation Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {elNinoExplanation.formation.map((stage, idx) => (
            <div key={idx} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-blue-400 mb-2">{stage.stage}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{stage.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Periodicity Note */}
        <div className="bg-blue-950/20 border border-blue-900/40 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            <strong className="text-white">Recurrence & Cycle: </strong>
            {elNinoExplanation.periodicity}
          </p>
        </div>
      </div>

      {/* 2. Multi-Year Temperature Anomaly Progression Map (2015-2026) */}
      <GlobalTemperatureMap />

      {/* 3. Location Search & Global ENSO Teleconnection Forecast */}
      <div className="bg-zinc-950/60 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Global Impact Center Forecaster
            </h3>
            <p className="text-sm text-zinc-400">
              Select or search an impact zone to project 12-month temperature anomalies and severe weather anomalies generated by BigQuery ML.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, region, or weather status..."
              className="w-full bg-zinc-900/80 border border-zinc-700/80 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Location Selection Chips */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {filteredLocations.map((loc) => {
            const isSelected = loc.id === selectedLocation.id;
            return (
              <button
                key={loc.id}
                onClick={() => setSelectedLocationId(loc.id)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400'
                    : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <span>{loc.name}, {loc.country}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    loc.status === 'Typhoon & Storm Surge'
                      ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                      : loc.status === 'Drought & Heatwaves'
                      ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                      : loc.status === 'Extreme Rainfall & Floods'
                      ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                      : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                  }`}
                >
                  {loc.status}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Location Highlight Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Key Metrics */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="text-2xl font-bold text-white">{selectedLocation.name}</h4>
                <span className="text-xs font-mono text-zinc-500">[{selectedLocation.coordinates[0].toFixed(2)}°, {selectedLocation.coordinates[1].toFixed(2)}°]</span>
              </div>
              <p className="text-xs text-blue-400 font-medium mb-6">{selectedLocation.region}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/40 border border-zinc-800/80 rounded-xl p-3.5">
                  <p className="text-[11px] font-mono text-zinc-500 uppercase">Temp Anomaly</p>
                  <p className="text-2xl font-bold font-mono text-rose-400 mt-1">+{selectedLocation.tempAnomalyC}°C</p>
                </div>
                <div className="bg-black/40 border border-zinc-800/80 rounded-xl p-3.5">
                  <p className="text-[11px] font-mono text-zinc-500 uppercase">Precip Anomaly</p>
                  <p className={`text-2xl font-bold font-mono mt-1 ${selectedLocation.precipAnomalyPct > 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                    {selectedLocation.precipAnomalyPct > 0 ? `+${selectedLocation.precipAnomalyPct}%` : `${selectedLocation.precipAnomalyPct}%`}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-800/80 pt-4">
              <span className="text-xs text-zinc-500 font-mono block mb-1">Climatic Threat Profile:</span>
              <span className="text-sm font-semibold text-white">{selectedLocation.status}</span>
            </div>
          </div>

          {/* Teleconnection & Pacific Dynamics */}
          <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h5 className="text-sm font-semibold text-zinc-200 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Regional Atmospheric Dynamics & Teleconnection
              </h5>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                {selectedLocation.summary}
              </p>
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/30 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {selectedLocation.teleconnectionInsight}
              </div>
            </div>

            {selectedLocation.id === 'tokyo-japan' && (
              <div className="mt-4 p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs text-purple-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <strong>Western Pacific Super Typhoon Alert:</strong> Over 20 tropical cyclones recorded recently due to elevated ocean heat content.
              </div>
            )}
          </div>
        </div>

        {/* 3. BigQuery ML ARIMA_PLUS Time-Series Forecast Chart */}
        <div className="bg-black/50 border border-zinc-800/80 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                BigQuery ML Time-Series Anomaly Projection (2023–2025)
              </h4>
              <p className="text-xs text-zinc-500 font-mono">
                Model: ARIMA_PLUS with 95% Confidence Interval Cone
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-blue-500 inline-block" />
                <span>Historical Observations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-rose-400 inline-block" />
                <span>ARIMA+ Forecast</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-blue-500/20 rounded inline-block" />
                <span>95% Confidence</span>
              </div>
            </div>
          </div>

          {/* SVG Visualizer */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[600px] select-none"
            >
              {/* Grid Lines */}
              {[0, 1, 2, 3].map((temp) => (
                <g key={temp}>
                  <line
                    x1={padding.left}
                    y1={getY(temp)}
                    x2={chartWidth - padding.right}
                    y2={getY(temp)}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="1"
                    strokeDasharray={temp === 0 ? 'none' : '4 4'}
                  />
                  <text
                    x={padding.left - 8}
                    y={getY(temp) + 4}
                    fill="#71717a"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    +{temp}°C
                  </text>
                </g>
              ))}

              {/* Confidence Interval Area */}
              {confidenceArea && (
                <path
                  d={confidenceArea}
                  fill="rgba(59, 130, 246, 0.12)"
                  stroke="none"
                />
              )}

              {/* Forecast Line */}
              {forecastPath && (
                <path
                  d={forecastPath}
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                />
              )}

              {/* Historical Line */}
              {historicalPath && (
                <path
                  d={historicalPath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />
              )}

              {/* Data Points */}
              {chartPoints.map((point, idx) => {
                const cx = getX(idx);
                const isForecast = point.historicalAnomaly === null;
                const value = isForecast ? point.forecastAnomaly : point.historicalAnomaly;
                if (value === null) return null;
                const cy = getY(value);
                const isHovered = hoveredPointIndex === idx;

                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 6 : 4}
                      fill={isForecast ? '#fb7185' : '#3b82f6'}
                      stroke="#000"
                      strokeWidth="2"
                      className="transition-all duration-150"
                    />

                    {/* Quarter Label */}
                    <text
                      x={cx}
                      y={chartHeight - 12}
                      fill={isHovered ? '#fff' : '#71717a'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {point.date}
                    </text>

                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <g>
                        <rect
                          x={cx - 50}
                          y={cy - 44}
                          width="100"
                          height="36"
                          rx="6"
                          fill="#18181b"
                          stroke="#3f3f46"
                          strokeWidth="1"
                        />
                        <text
                          x={cx}
                          y={cy - 28}
                          fill="#fff"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {value > 0 ? `+${value}°C` : `${value}°C`}
                        </text>
                        <text
                          x={cx}
                          y={cy - 16}
                          fill="#93c5fd"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {isForecast ? 'ARIMA+ Forecast' : 'Observed'}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Toggle BigQuery Architecture Viewer */}
        <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-between items-center">
          <div>
            <h4 className="text-sm font-semibold text-white">Inspect Cloud Pipeline & SQL</h4>
            <p className="text-xs text-zinc-500">View the BigQuery ML model definition and Dremel engine query plan.</p>
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
              createModelSql={elNinoBigQuerySQL.createModel}
              querySql={elNinoBigQuerySQL.forecastQuery}
              stats={elNinoBigQuerySQL.dremelStats}
            />
          </div>
        )}
      </div>
    </div>
  );
}
