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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Total Claims Processed</h3>
            <p className="text-4xl font-bold">{metrics.totalClaims}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Flagged for Review</h3>
            <p className="text-4xl font-bold text-amber-500">{metrics.flaggedClaims}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Fraud Rate</h3>
            <p className="text-4xl font-bold text-red-500">{metrics.fraudRate}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl md:col-span-3">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Total Value at Risk</h3>
            <p className="text-4xl font-bold text-green-500">R {metrics.totalValue.toLocaleString()}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
