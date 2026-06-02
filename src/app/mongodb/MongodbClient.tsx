'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ImageGallery from '@/components/ImageGallery';
import Accordion from '@/components/Accordion';
import BirdSoundsGraph, { GraphNode, GraphLink } from '@/components/BirdSoundsGraph';

const basePath = '';

interface QueryOption {
  id: string;
  name: string;
  description: string;
  operator: string;
  sampleCode: string;
}

const queryOptions: QueryOption[] = [
  {
    id: 'gte',
    name: 'Greater Than or Equal ($gte)',
    description: 'Finds all books with a price of 12 or more.',
    operator: '$gte',
    sampleCode: `// Find documents where "price" is >= 12
const results = await db
  .collection('presentation_books')
  .find({ price: { $gte: 12 } })
  .toArray();`
  },
  {
    id: 'and',
    name: 'Logical AND ($and)',
    description: 'Finds books that are in-stock AND belong to the "Technology" genre.',
    operator: '$and',
    sampleCode: `// Combine filters: genre matches AND status matches
const results = await db
  .collection('presentation_books')
  .find({
    $and: [
      { genre: "Technology" },
      { status: "in-stock" }
    ]
  })
  .toArray();`
  },
  {
    id: 'elemMatch',
    name: 'Array Match ($elemMatch)',
    description: 'Queries nested objects inside an array: Finds books that have a writer with 5+ awards.',
    operator: '$elemMatch',
    sampleCode: `// Matches if at least one array element satisfies all conditions
const results = await db
  .collection('presentation_books')
  .find({
    authors: {
      $elemMatch: {
        role: "writer",
        awards: { $gte: 5 }
      }
    }
  })
  .toArray();`
  },
  {
    id: 'sortLimitProj',
    name: 'Sort, Limit & Project',
    description: 'Finds in-stock books, projects only title/price, sorts descending, and returns top 2 results.',
    operator: 'sort/limit/project',
    sampleCode: `// Projection hides fields; sort & limit reduce output scope
const results = await db
  .collection('presentation_books')
  .find({ status: "in-stock" })
  .project({ title: 1, price: 1, _id: 0 })
  .sort({ price: -1 })
  .limit(2)
  .toArray();`
  },
  {
    id: 'count',
    name: 'Count Documents',
    description: 'Counts the total number of books that are in-stock.',
    operator: 'countDocuments',
    sampleCode: `// Returns the numeric count of matching documents
const count = await db
  .collection('presentation_books')
  .countDocuments({ status: "in-stock" });`
  }
];

export default function MongodbClient({ mongodbImages }: { mongodbImages: string[] }) {
  const [selectedQuery, setSelectedQuery] = useState<QueryOption>(queryOptions[0]);
  const [dbState, setDbState] = useState<{ isEmpty: boolean; count: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultsTab, setResultsTab] = useState<'visual' | 'json'>('visual');
  const [queryOutput, setQueryOutput] = useState<{
    queryObject?: any;
    queryCode?: string;
    results?: any;
    error?: string;
  } | null>(null);

  // Vector Search States
  const [vsSearchQuery, setVsSearchQuery] = useState('');
  const [vsResults, setVsResults] = useState<any[] | null>(null);
  const [vsLoading, setVsLoading] = useState(false);
  const [vsError, setVsError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{nodes: GraphNode[], links: GraphLink[]} | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [selectedGraphNode, setSelectedGraphNode] = useState<any | null>(null);

  // Check database status on load
  const checkDatabase = async () => {
    try {
      const res = await fetch(`${basePath}/api/mongodb-demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check' })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setDbState({ isEmpty: data.isEmpty, count: data.count });
      }
    } catch (err) {
      console.error('Error checking DB status:', err);
    }
  };

  useEffect(() => {
    checkDatabase();
    loadGraphData();
  }, []);

  const loadGraphData = async () => {
    setGraphLoading(true);
    try {
      const res = await fetch(`${basePath}/api/vector-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'graph_data' })
      });
      const data = await res.json();
      if (data.status === 'success' && data.nodes.length > 0) {
        setGraphData({ nodes: data.nodes, links: data.links });
      }
    } catch (err) {
      console.error('Failed to load graph data', err);
    } finally {
      setGraphLoading(false);
    }
  };

  const handleVectorSearch = async () => {
    if (!vsSearchQuery.trim()) return;
    setVsLoading(true);
    setVsError(null);
    try {
      const res = await fetch(`${basePath}/api/vector-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query: vsSearchQuery })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setVsResults(data.results);
      } else {
        setVsError(data.error);
      }
    } catch (err: any) {
      setVsError(err.message || 'Search failed');
    } finally {
      setVsLoading(false);
    }
  };

  const seedVectorData = async () => {
    setVsLoading(true);
    setVsError(null);
    try {
      const res = await fetch(`${basePath}/api/vector-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' })
      });
      const data = await res.json();
      if (data.status === 'success') {
        loadGraphData(); // Reload graph once seeded
      } else {
        setVsError(data.error);
      }
    } catch (err: any) {
      setVsError(err.message || 'Seeding failed');
    } finally {
      setVsLoading(false);
    }
  };

  // Seed Database Handler
  const seedDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${basePath}/api/mongodb-demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setQueryOutput({
          queryCode: data.queryCode,
          results: data.results
        });
        checkDatabase();
        setResultsTab('json');
      } else {
        setQueryOutput({ error: data.error });
      }
    } catch (err: any) {
      setQueryOutput({ error: err.message || 'API connection failed' });
    } finally {
      setLoading(false);
    }
  };

  // Run Query Handler
  const runQuery = async () => {
    setLoading(true);
    setQueryOutput(null);
    try {
      const res = await fetch(`${basePath}/api/mongodb-demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: selectedQuery.id })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setQueryOutput({
          queryObject: data.queryObject,
          queryCode: data.queryCode,
          results: data.results
        });
      } else {
        setQueryOutput({ error: data.error });
      }
    } catch (err: any) {
      setQueryOutput({ error: err.message || 'API connection failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#001E2B] text-white font-sans selection:bg-[#00684A]/50 relative overflow-hidden">
      {/* Immersive Brand Gradient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#00ED64]/15 via-[#00684A]/5 to-transparent pointer-events-none z-0"></div>
      
      <header className="relative w-full max-w-7xl mx-auto px-6 py-12 flex justify-between items-center border-b border-[#00684A] z-10">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white hover:opacity-80 transition-opacity">
          ← Back to Home
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-medium text-zinc-300">MongoDB</h1>
          {dbState !== null && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#00ED64]/10 border border-[#00ED64]/30 rounded-full text-[#00ED64] text-xs font-semibold">
              <span className="flex h-2 w-2 rounded-full bg-[#00ED64] animate-pulse"></span>
              Connected to MongoDB Cluster
            </div>
          )}
        </div>
      </header>

      <main className="relative w-full max-w-7xl mx-auto px-6 py-12 z-10 flex flex-col gap-6">
        
        {/* Accordion 1: Certifications */}
        <Accordion title="Certifications" subtitle="My professional MongoDB certifications" defaultOpen={false}>
          <div className="py-4">
            <ImageGallery images={mongodbImages} layout="grid" emptyMessage="Currently studying for the next one!" />
          </div>
        </Accordion>

        {/* Accordion 2: Live Console */}
        <Accordion title="Live Operators Console" subtitle="Interactive playground running queries live on a MongoDB Atlas cluster" defaultOpen={true}>
          <div className="py-4">
            {/* Seed Database Warning Banner */}
            {dbState?.isEmpty && (
              <div className="mb-8 p-6 bg-[#00684A]/20 border border-[#00ED64]/30 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
                <div>
                  <h4 className="text-[#00ED64] font-semibold mb-1">Database Collection Empty</h4>
                  <p className="text-zinc-300 text-sm max-w-xl">
                    Your MongoDB cluster collection `presentation_books` is currently empty. Seed it with sample books first to make query demonstrations active.
                  </p>
                </div>
                <button
                  onClick={seedDatabase}
                  disabled={loading}
                  className="px-6 py-3 bg-[#00ED64] text-[#001E2B] hover:bg-[#00ED64]/90 font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-[#00ED64]/20 active:scale-95 disabled:opacity-50"
                >
                  Seed Presentation Data
                </button>
              </div>
            )}

            {/* Cheat Sheet Section for Presentation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Projections Card */}
              <div className="p-5 bg-[#001E2B]/60 border border-[#00ED64]/20 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ED64]/5 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                <h4 className="text-lg font-bold text-[#00ED64] mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  Projections (Inclusion & Exclusion)
                </h4>
                <ul className="text-sm text-zinc-300 space-y-2 relative z-10">
                  <li><code className="text-[#00ED64] bg-[#00684A]/30 px-1.5 py-0.5 rounded mr-2 font-bold">1</code> Include <span className="text-zinc-500 text-xs ml-1">(unspecified fields are excluded)</span></li>
                  <li><code className="text-[#00ED64] bg-[#00684A]/30 px-1.5 py-0.5 rounded mr-2 font-bold">0</code> Exclude <span className="text-zinc-500 text-xs ml-1">(unspecified fields are included)</span></li>
                  <li className="text-[#00ED64]/70 text-xs italic pt-1">Note: Inclusion & exclusion cannot be combined in projections.</li>
                  <li className="pt-3 border-t border-[#00684A]/30 mt-2">
                    <span className="font-semibold text-white text-xs uppercase tracking-wider">_id Field Exception:</span>
                    <ul className="list-disc pl-5 mt-1.5 space-y-1 text-xs text-zinc-400">
                      <li>Included by default (no 1 necessary).</li>
                      <li>May always be excluded, even with an inclusive projection.</li>
                    </ul>
                  </li>
                </ul>
              </div>

              {/* Comparison Operators Card */}
              <div className="p-5 bg-[#001E2B]/60 border border-[#00ED64]/20 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ED64]/5 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                <h4 className="text-lg font-bold text-[#00ED64] mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Comparison Operators
                </h4>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm text-zinc-300 relative z-10 items-center mt-4">
                  <code className="text-[#001E2B] bg-[#00ED64] px-2 py-1 rounded font-bold text-center">$gt</code>
                  <div><span className="text-[#00ED64] font-bold mr-2">&gt;</span> Greater than specified value</div>
                  
                  <code className="text-[#001E2B] bg-[#00ED64] px-2 py-1 rounded font-bold text-center">$lt</code>
                  <div><span className="text-[#00ED64] font-bold mr-2">&lt;</span> Less than specified value</div>
                  
                  <code className="text-[#001E2B] bg-[#00ED64] px-2 py-1 rounded font-bold text-center">$gte</code>
                  <div><span className="text-[#00ED64] font-bold mr-2">&gt;=</span> At least specified value</div>
                  
                  <code className="text-[#001E2B] bg-[#00ED64] px-2 py-1 rounded font-bold text-center">$lte</code>
                  <div><span className="text-[#00ED64] font-bold mr-2">&lt;=</span> No more than specified value</div>
                </div>
              </div>
            </div>

            {/* Dashboard Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT PANEL: SELECTOR & CONSOLE */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="p-6 bg-[#023430]/60 border border-[#00684A] rounded-2xl backdrop-blur-md">
                  <h3 className="text-lg font-medium text-zinc-300 mb-4">Select Operator Demo</h3>
                  <div className="flex flex-col gap-2">
                    {queryOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSelectedQuery(option);
                          setQueryOutput(null);
                        }}
                        className={`p-4 rounded-xl text-left border transition-all duration-300 ${
                          selectedQuery.id === option.id
                            ? 'bg-[#00ED64]/10 border-[#00ED64]/50 text-white'
                            : 'bg-[#001E2B]/40 border-[#00684A]/50 text-zinc-400 hover:border-[#00684A] hover:text-zinc-200'
                        }`}
                      >
                        <div className="font-semibold text-sm mb-1">{option.name}</div>
                        <div className="text-xs text-zinc-500 line-clamp-1">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Console */}
                <div className="p-6 bg-[#001E2B] border border-[#00684A] rounded-2xl font-mono text-base overflow-hidden flex flex-col">
                  <div className="flex justify-between items-center pb-3 border-b border-[#00684A] mb-4 text-[#00ED64]/70 text-sm">
                    <span>query_command.js</span>
                    <span className="flex h-2 w-2 rounded-full bg-[#00ED64]"></span>
                  </div>
                  <pre className="text-[#00ED64] whitespace-pre-wrap leading-relaxed overflow-x-auto select-all max-h-60">
                    {selectedQuery.sampleCode}
                  </pre>
                </div>

                {/* Run Button */}
                <button
                  onClick={runQuery}
                  disabled={loading}
                  className="w-full py-4 bg-[#00ED64] hover:bg-[#00ED64]/90 text-[#001E2B] font-bold rounded-2xl shadow-lg hover:shadow-[#00ED64]/20 transition-all flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-[#001E2B] border-t-transparent rounded-full animate-spin"></div>
                      Querying MongoDB Atlas...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      Run MongoDB Query
                    </>
                  )}
                </button>

                {/* Optional Reset/Clear Button */}
                {!dbState?.isEmpty && (
                  <button
                    onClick={seedDatabase}
                    disabled={loading}
                    className="w-full py-3 bg-[#023430] hover:bg-[#00684A] border border-[#00684A] text-zinc-300 hover:text-white font-medium text-sm rounded-xl transition-all active:scale-98 disabled:opacity-50"
                  >
                    Reset & Re-Seed Database
                  </button>
                )}
              </div>

              {/* RIGHT PANEL: LIVE RESULTS */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Header Tabs */}
                <div className="flex justify-between items-center bg-[#023430]/60 border border-[#00684A] rounded-2xl p-2 backdrop-blur-md">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setResultsTab('visual')}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        resultsTab === 'visual'
                          ? 'bg-[#00684A] text-white'
                          : 'text-[#00ED64]/70 hover:text-[#00ED64]'
                      }`}
                    >
                      Visual Results
                    </button>
                    <button
                      onClick={() => setResultsTab('json')}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        resultsTab === 'json'
                          ? 'bg-[#00684A] text-white'
                          : 'text-[#00ED64]/70 hover:text-[#00ED64]'
                      }`}
                    >
                      Raw JSON Payload
                    </button>
                  </div>
                  <span className="text-xs text-[#00ED64]/70 px-4">Live MongoDB Returns</span>
                </div>

                {/* Output Display Container */}
                <div className="flex-1 min-h-[400px] bg-[#001E2B]/80 border border-[#00684A] rounded-2xl p-6 backdrop-blur-md overflow-hidden flex flex-col justify-center">
                  
                  {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="h-10 w-10 border-4 border-[#00ED64] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[#00ED64]/70 text-sm">Querying document clusters...</p>
                    </div>
                  )}

                  {!loading && !queryOutput && (
                    <div className="flex flex-col items-center justify-center text-center py-20 text-[#00ED64]/50 gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#00684A]">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="9"></line>
                        <line x1="9" y1="13" x2="15" y2="13"></line>
                        <line x1="9" y1="17" x2="15" y2="17"></line>
                      </svg>
                      <div>
                        <h4 className="font-semibold text-[#00ED64]/70 mb-1">Live Database Terminal</h4>
                        <p className="text-xs text-[#00ED64]/50 max-w-xs">Select an operator on the left and click &quot;Run MongoDB Query&quot; to fetch live results.</p>
                      </div>
                    </div>
                  )}

                  {!loading && queryOutput?.error && (
                    <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex gap-3">
                      <span className="font-bold">Error:</span>
                      <span>{queryOutput.error}</span>
                    </div>
                  )}

                  {!loading && queryOutput && !queryOutput.error && (
                    <>
                      {/* TAB 1: VISUAL CARD VIEWER */}
                      {resultsTab === 'visual' && (
                        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                          
                          {/* Count Badge (Special visualization for count query) */}
                          {selectedQuery.id === 'count' && (
                            <div className="flex flex-col items-center justify-center py-12">
                              <div className="relative h-40 w-40 rounded-full bg-[#00ED64]/5 border-2 border-[#00ED64]/20 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,237,100,0.05)]">
                                <div className="absolute inset-0 bg-[#00ED64]/5 rounded-full blur-xl animate-pulse"></div>
                                <div className="text-6xl font-bold font-handscript text-[#00ED64]">
                                  {queryOutput.results?.count}
                                </div>
                                <div className="text-xs text-[#00ED64]/50 uppercase tracking-widest mt-2">Documents</div>
                              </div>
                              <p className="text-[#00ED64]/70 text-xs mt-6 text-center max-w-sm">
                                Operation executed: <code className="text-[#00ED64]">countDocuments({JSON.stringify(queryOutput.queryObject)})</code>
                              </p>
                            </div>
                          )}

                          {/* Document Card List */}
                          {selectedQuery.id !== 'count' && Array.isArray(queryOutput.results) && (
                            <div className="flex flex-col gap-4">
                              <div className="text-xs text-zinc-500 flex justify-between">
                                <span>Documents Found: {queryOutput.results.length}</span>
                                <span>Mapped Keys</span>
                              </div>

                              {queryOutput.results.map((doc: any, index: number) => (
                                <div
                                  key={doc._id || index}
                                  className="p-5 bg-[#023430]/40 border border-[#00684A] rounded-xl flex flex-col gap-3 transition-all hover:border-[#00ED64]/50"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-bold text-white text-base">{doc.title}</h4>
                                      {doc.genre && (
                                        <span className="inline-block px-2.5 py-0.5 mt-1.5 rounded-full text-xs font-semibold bg-[#00684A] text-[#00ED64]">
                                          {doc.genre}
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* Price Badge (Highlighter for GTE) */}
                                    {doc.price !== undefined && (
                                      <div className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                                        selectedQuery.id === 'gte' && doc.price >= 12
                                          ? 'bg-[#00ED64]/10 border border-[#00ED64]/30 text-[#00ED64] shadow-[0_0_15px_rgba(0,237,100,0.1)]'
                                          : 'bg-[#001E2B] text-[#00ED64]/50 border border-[#00684A]'
                                      }`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91 2.95.73 4.18 1.94 4.18 3.93-.01 2.11-1.63 3.15-3.12 3.14z"></path></svg>
                                        ${doc.price}
                                      </div>
                                    )}
                                  </div>

                                  {/* Tags List */}
                                  {doc.tags && (
                                    <div className="flex flex-wrap gap-1.5">
                                      {doc.tags.map((tag: string, tIndex: number) => (
                                        <span
                                          key={tIndex}
                                          className="px-2 py-0.5 text-2xs font-mono bg-[#001E2B]/80 rounded border border-[#00684A] text-[#00ED64]/70"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Nested Authors Array (Highlighter for ElemMatch) */}
                                  {doc.authors && (
                                    <div className={`p-3 rounded-lg border flex flex-col gap-1.5 ${
                                      selectedQuery.id === 'elemMatch'
                                        ? 'bg-[#00ED64]/5 border-[#00ED64]/20'
                                        : 'bg-[#001E2B]/30 border-[#00684A]'
                                    }`}>
                                      <div className="text-2xs text-[#00ED64]/50 uppercase tracking-widest font-semibold">Authors</div>
                                      <div className="flex flex-col gap-1.5">
                                        {doc.authors.map((member: any, mIndex: number) => {
                                          const isMatch = selectedQuery.id === 'elemMatch' && member.role === 'writer' && member.awards >= 5;
                                          return (
                                            <div
                                              key={mIndex}
                                              className={`text-xs flex justify-between items-center p-1 rounded ${
                                                isMatch ? 'bg-[#00ED64]/10 text-[#00ED64] font-semibold px-2' : 'text-[#00ED64]/70'
                                              }`}
                                            >
                                              <span className="capitalize">{member.role}</span>
                                              <span>{member.awards} awards {isMatch && '🏆'}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 2: RAW JSON PAYLOAD */}
                      {resultsTab === 'json' && (
                        <div className="flex-1 flex flex-col overflow-hidden max-h-[500px] animate-in fade-in duration-300 font-mono text-base">
                          <div className="flex justify-between items-center pb-2 border-b border-[#00684A] mb-3 text-[#00ED64]/70 text-sm">
                            <span>raw_results.json</span>
                            <span>{JSON.stringify(queryOutput.results).length} bytes</span>
                          </div>
                          <pre className="flex-1 overflow-y-auto text-[#00ED64] leading-relaxed bg-[#001E2B]/40 p-4 rounded-xl border border-[#00684A] select-all max-h-[400px]">
                            {JSON.stringify(queryOutput.results, null, 2)}
                          </pre>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Accordion>

        {/* Accordion 3: Vector Search & Graph */}
        <Accordion title="Vector Search & AI Graph" subtitle="Explore high-dimensional vector embeddings with Voyage AI and Atlas Vector Search">
          <div className="py-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 flex flex-col gap-4">
                <h3 className="text-xl font-bold text-white mb-2">Semantic Bird Search</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Query the MongoDB Atlas Vector Store using Voyage AI embeddings. 
                  Search for descriptive qualities of bird calls (e.g. &quot;majestic eagle&quot;).
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={vsSearchQuery}
                    onChange={(e) => setVsSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVectorSearch()}
                    placeholder="e.g. majestic eagle call" 
                    className="flex-1 bg-[#001E2B] border border-[#00684A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00ED64]" 
                  />
                  <button 
                    onClick={handleVectorSearch}
                    disabled={vsLoading}
                    className="bg-[#00ED64] text-[#001E2B] px-4 py-3 rounded-xl font-bold hover:bg-[#00ED64]/90 transition-colors disabled:opacity-50"
                  >
                    {vsLoading ? '...' : 'Search'}
                  </button>
                </div>

                {vsError && (
                  <div className="text-red-400 text-xs mt-2 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                    {vsError}
                  </div>
                )}

                {!graphLoading && (
                  <button onClick={seedVectorData} disabled={vsLoading} className="mt-4 w-full bg-[#023430] border border-[#00684A] text-[#00ED64] px-4 py-3 rounded-xl font-bold hover:bg-[#00684A]/50 transition-colors">
                    {vsLoading ? 'Seeding Data...' : 'Seed Data from Xeno-canto'}
                  </button>
                )}

                {vsResults && (
                  <div className="mt-6 flex flex-col gap-3 flex-1 overflow-y-auto max-h-[400px]">
                    <h4 className="text-sm font-bold text-[#00ED64]">Top Matches</h4>
                    {vsResults.map((res: any) => (
                      <div key={res._id} className="p-4 bg-[#023430]/40 border border-[#00684A] rounded-xl hover:border-[#00ED64]/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-white text-sm">{res.name}</div>
                          <div className="text-xs bg-[#00ED64]/10 text-[#00ED64] px-2 py-0.5 rounded border border-[#00ED64]/20">
                            Score: {res.score.toFixed(3)}
                          </div>
                        </div>
                        <div className="text-xs text-zinc-400 font-mono mb-1">{res.scientific_name} • {res.family}</div>
                        <div className="text-xs text-zinc-500 line-clamp-2">{res.remarks || 'No remarks available.'}</div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedGraphNode && !vsResults && (
                  <div className="mt-8 p-6 bg-[#023430]/40 border border-[#00684A] rounded-xl animate-in fade-in">
                     <h4 className="text-sm font-bold text-[#00ED64] mb-2">Selected Node</h4>
                     <div className="text-white font-bold mb-1">{selectedGraphNode.name}</div>
                     <div className="text-xs text-zinc-400 font-mono mb-3">{selectedGraphNode.family}</div>
                     <p className="text-xs text-zinc-500">This node's color represents its taxonomy family. Nodes clustered closely together have high cosine similarity (&gt;0.65) in Voyage AI's 1024-dimensional embedding space.</p>
                  </div>
                )}
              </div>
              <div className="lg:col-span-2">
                {graphLoading ? (
                  <div className="w-full h-[600px] flex flex-col items-center justify-center text-[#00ED64]/50 border border-[#00684A] rounded-xl bg-[#001E2B]/50">
                    <div className="h-8 w-8 border-2 border-[#00ED64] border-t-transparent rounded-full animate-spin mb-4"></div>
                    Loading 3D Graph Model...
                  </div>
                ) : graphData ? (
                  <BirdSoundsGraph 
                    nodes={graphData.nodes}
                    links={graphData.links}
                    onNodeClick={setSelectedGraphNode}
                  />
                ) : (
                  <div className="w-full h-[600px] flex flex-col items-center justify-center text-[#00ED64]/50 border border-[#00684A] rounded-xl bg-[#001E2B]/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-[#00684A]">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <p>No graph data. Click &quot;Seed Data&quot; to begin.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Accordion>

      </main>
    </div>
  );
}
