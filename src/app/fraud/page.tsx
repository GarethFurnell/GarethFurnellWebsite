"use client";

import { useEffect, useState } from 'react';

export default function FraudDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/fraud/metrics');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/fraud/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setError(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Claims & Fraud Overview</h1>
          <p className="text-zinc-400">High-level metrics and system health for the fraud detection platform.</p>
        </div>
        <button 
          onClick={seedDatabase} 
          disabled={seeding}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {seeding ? 'Generating...' : 'Seed Mock Data'}
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse flex gap-4">
          <div className="h-32 w-full bg-zinc-900 rounded-xl"></div>
          <div className="h-32 w-full bg-zinc-900 rounded-xl"></div>
          <div className="h-32 w-full bg-zinc-900 rounded-xl"></div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400">
          <p>{error}</p>
        </div>
      ) : metrics ? (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Total Claims</h3>
              <p className="text-3xl font-bold">{metrics.totalClaims}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Flagged</h3>
              <p className="text-3xl font-bold text-amber-500">{metrics.flaggedClaims}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Fraud Rate</h3>
              <p className="text-3xl font-bold text-red-500">{metrics.fraudRate}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Most Common</h3>
              <p className="text-lg font-bold text-zinc-200 mt-2 leading-tight">{metrics.mostCommonType || 'N/A'}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl md:col-span-4">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Total Value at Risk</h3>
              <p className="text-4xl font-bold text-green-500">R {metrics.totalValue.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-inner mt-4">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Risk Score Algorithm Documentation
            </h2>
            <p className="text-zinc-400 mb-6 max-w-3xl leading-relaxed">
              The automated fraud detection system assigns a Risk Score from 0 to 100 to every incoming grocery claim. Any score over 75 automatically flags the claim for manual analyst review. Scores are calculated using the following primary heuristics:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-lg">Repeat Offender Penalty</h4>
                  <span className="text-red-400 font-mono text-sm font-bold">+30 pts</span>
                </div>
                <p className="text-sm text-zinc-400">If the user (identified by `userId`) has submitted 3 or more claims within a rolling 30-day window. Retail fraud heavily indexes on account abuse.</p>
              </div>
              <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-lg">EXIF Date Discrepancy</h4>
                  <span className="text-red-400 font-mono text-sm font-bold">+40 pts</span>
                </div>
                <p className="text-sm text-zinc-400">If the provided photo's internal EXIF `dateTaken` metadata indicates the photo was taken prior to the order being placed. A classic indicator of recycled images.</p>
              </div>
              <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-lg">High Value Spike</h4>
                  <span className="text-amber-500 font-mono text-sm font-bold">+20 pts</span>
                </div>
                <p className="text-sm text-zinc-400">If the requested refund amount is greater than 3x the user's historical average basket size. Scammers often test with small items before hitting high-ticket goods.</p>
              </div>
              <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-lg">Image Hash Re-use</h4>
                  <span className="text-red-400 font-mono text-sm font-bold">+50 pts</span>
                </div>
                <p className="text-sm text-zinc-400">If the cryptographic hash of the uploaded image exactly matches a hash already in our database from a previous, unrelated claim by any user.</p>
              </div>
              <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-lg">Velocity of Claims</h4>
                  <span className="text-red-400 font-mono text-sm font-bold">+35 pts</span>
                </div>
                <p className="text-sm text-zinc-400">If a single account attempts to file multiple claims across different devices within minutes of each other, signaling automated fraud farm activity.</p>
              </div>
              <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-lg">Geolocation Mismatch</h4>
                  <span className="text-amber-500 font-mono text-sm font-bold">+25 pts</span>
                </div>
                <p className="text-sm text-zinc-400">If the GPS coordinates of the device submitting the claim do not match the delivery address on record, or if the user is masking their IP address via a known proxy/VPN.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
