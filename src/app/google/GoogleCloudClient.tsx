'use client';

import React, { useState } from 'react';
import ImageGallery from '@/components/ImageGallery';
import ElNinoForecaster from '@/components/ElNinoForecaster';
import OrbitalRadar from '@/components/OrbitalRadar';

interface GoogleCloudClientProps {
  googleImages: string[];
}

export default function GoogleCloudClient({ googleImages }: GoogleCloudClientProps) {
  const [activeTab, setActiveTab] = useState<'elnino' | 'radar' | 'certs'>('elnino');

  return (
    <div className="min-h-screen text-white font-sans selection:bg-blue-500/30">
      <main className="w-full px-6 md:px-12 lg:px-24 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Page Hero Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-2 shadow-[0_0_20px_rgba(66,133,244,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Google Cloud & BigQuery ML Showcase
            </h1>
          </div>
          <p className="text-zinc-400 max-w-3xl text-base sm:text-lg leading-relaxed">
            Interactive enterprise analytics, serverless Dremel pipelines, and BigQuery ML algorithms deployed over public planetary climate and deep space telemetry.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mb-10 p-1.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl w-fit backdrop-blur-xl">
          <button
            onClick={() => setActiveTab('elnino')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'elnino'
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <span>Super El Niño Forecaster</span>
            <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
              Primary
            </span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'radar'
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v18M3 12h18" />
            </svg>
            <span>NASA Orbital Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('certs')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'certs'
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span>Certifications</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div>
          {activeTab === 'elnino' && (
            <div className="animate-in fade-in duration-300">
              <ElNinoForecaster />
            </div>
          )}

          {activeTab === 'radar' && (
            <div className="animate-in fade-in duration-300">
              <OrbitalRadar />
            </div>
          )}

          {activeTab === 'certs' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
                  Professional Certifications
                </h3>
                <p className="text-zinc-400 text-sm max-w-2xl">
                  Accredited Google Cloud credentials validating cloud architecture, data warehousing, and machine learning competencies.
                </p>
              </div>
              <ImageGallery images={googleImages} layout="grid" emptyMessage="Currently studying for the next one!" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
