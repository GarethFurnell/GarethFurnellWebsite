'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const basePath = '/GarethFurnellWebsite';

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
    description: 'Finds all projects with 12 or more stars.',
    operator: '$gte',
    sampleCode: `// Find documents where "stars" is >= 12
const results = await db
  .collection('presentation_projects')
  .find({ stars: { $gte: 12 } })
  .toArray();`
  },
  {
    id: 'and',
    name: 'Logical AND ($and)',
    description: 'Finds projects that are completed AND belong to "AI & Automation".',
    operator: '$and',
    sampleCode: `// Combine filters: category matches AND status matches
const results = await db
  .collection('presentation_projects')
  .find({
    $and: [
      { category: "AI & Automation" },
      { status: "completed" }
    ]
  })
  .toArray();`
  },
  {
    id: 'elemMatch',
    name: 'Array Match ($elemMatch)',
    description: 'Queries nested objects inside an array: Finds projects that have a developer with 5+ years of experience.',
    operator: '$elemMatch',
    sampleCode: `// Matches if at least one array element satisfies all conditions
const results = await db
  .collection('presentation_projects')
  .find({
    team: {
      $elemMatch: {
        role: "developer",
        experience: { $gte: 5 }
      }
    }
  })
  .toArray();`
  },
  {
    id: 'sortLimitProj',
    name: 'Sort, Limit & Project',
    description: 'Finds completed projects, projects only name/stars, sorts descending, and returns top 2 results.',
    operator: 'sort/limit/project',
    sampleCode: `// Projection hides fields; sort & limit reduce output scope
const results = await db
  .collection('presentation_projects')
  .find({ status: "completed" })
  .project({ name: 1, stars: 1, _id: 0 })
  .sort({ stars: -1 })
  .limit(2)
  .toArray();`
  },
  {
    id: 'count',
    name: 'Count Documents',
    description: 'Counts the total number of projects that are completed.',
    operator: 'countDocuments',
    sampleCode: `// Returns the numeric count of matching documents
const count = await db
  .collection('presentation_projects')
  .countDocuments({ status: "completed" });`
  }
];

export default function MongodbPresentation() {
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
  }, []);

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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800">
      <header className="w-full max-w-7xl mx-auto px-6 py-12 flex justify-between items-center border-b border-zinc-900">
        <Link href="/research" className="text-xl font-semibold tracking-tight text-white hover:opacity-80 transition-opacity">
          ← Back to Research
        </Link>
        <h1 className="text-xl font-medium text-zinc-400">MongoDB Atlas Live Demo</h1>
      </header>

      <main className="w-full max-w-7xl mx-auto px-6 py-12">
        {/* Seed Database Warning Banner */}
        {dbState?.isEmpty && (
          <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
            <div>
              <h4 className="text-amber-400 font-semibold mb-1">Database Collection Empty</h4>
              <p className="text-zinc-400 text-sm max-w-xl">
                Your MongoDB cluster collection `presentation_projects` is currently empty. Seed it with sample projects first to make query demonstrations active.
              </p>
            </div>
            <button
              onClick={seedDatabase}
              disabled={loading}
              className="px-6 py-3 bg-amber-500 text-black hover:bg-amber-400 font-medium text-sm rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 disabled:opacity-50"
            >
              Seed Presentation Data
            </button>
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            MongoDB Operators Live Console
          </h2>
          <p className="text-zinc-400 max-w-2xl text-lg">
            An interactive playground running queries live on a MongoDB Atlas cluster. Inspect the query filters, run the operations, and view the raw returns.
          </p>
        </div>

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: SELECTOR & CONSOLE */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl backdrop-blur-md">
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
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                        : 'bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">{option.name}</div>
                    <div className="text-xs text-zinc-500 line-clamp-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Code Console */}
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl font-mono text-xs overflow-hidden flex flex-col">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-900 mb-4 text-zinc-500">
                <span>query_command.js</span>
                <span className="flex h-2 w-2 rounded-full bg-cyan-500"></span>
              </div>
              <pre className="text-cyan-400/90 whitespace-pre-wrap leading-relaxed overflow-x-auto select-all max-h-40">
                {selectedQuery.sampleCode}
              </pre>
            </div>

            {/* Run Button */}
            <button
              onClick={runQuery}
              disabled={loading}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-2xl shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
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
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-medium text-sm rounded-xl transition-all active:scale-98 disabled:opacity-50"
              >
                Reset & Re-Seed Database
              </button>
            )}
          </div>

          {/* RIGHT PANEL: LIVE RESULTS */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Header Tabs */}
            <div className="flex justify-between items-center bg-zinc-900/60 border border-zinc-800 rounded-2xl p-2 backdrop-blur-md">
              <div className="flex gap-2">
                <button
                  onClick={() => setResultsTab('visual')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    resultsTab === 'visual'
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Visual Results
                </button>
                <button
                  onClick={() => setResultsTab('json')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    resultsTab === 'json'
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Raw JSON Payload
                </button>
              </div>
              <span className="text-xs text-zinc-500 px-4">Live MongoDB Returns</span>
            </div>

            {/* Output Display Container */}
            <div className="flex-1 min-h-[400px] bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-md overflow-hidden flex flex-col justify-center">
              
              {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-zinc-400 text-sm">Querying document clusters...</p>
                </div>
              )}

              {!loading && !queryOutput && (
                <div className="flex flex-col items-center justify-center text-center py-20 text-zinc-500 gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="9"></line>
                    <line x1="9" y1="13" x2="15" y2="13"></line>
                    <line x1="9" y1="17" x2="15" y2="17"></line>
                  </svg>
                  <div>
                    <h4 className="font-semibold text-zinc-400 mb-1">Live Database Terminal</h4>
                    <p className="text-xs text-zinc-600 max-w-xs">Select an operator on the left and click &quot;Run MongoDB Query&quot; to fetch live results.</p>
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
                          <div className="relative h-40 w-40 rounded-full bg-cyan-500/5 border-2 border-cyan-500/20 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.05)]">
                            <div className="absolute inset-0 bg-cyan-500/5 rounded-full blur-xl animate-pulse"></div>
                            <div className="text-6xl font-bold font-handscript text-cyan-400">
                              {queryOutput.results?.count}
                            </div>
                            <div className="text-xs text-zinc-500 uppercase tracking-widest mt-2">Documents</div>
                          </div>
                          <p className="text-zinc-500 text-xs mt-6 text-center max-w-sm">
                            Operation executed: <code className="text-cyan-500">countDocuments({JSON.stringify(queryOutput.queryObject)})</code>
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
                              className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl flex flex-col gap-3 transition-all hover:border-zinc-700"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-white text-base">{doc.name}</h4>
                                  {doc.category && (
                                    <span className="inline-block px-2.5 py-0.5 mt-1.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400">
                                      {doc.category}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Star Badge (Highlighter for GTE) */}
                                {doc.stars !== undefined && (
                                  <div className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                                    selectedQuery.id === 'gte' && doc.stars >= 12
                                      ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                      : 'bg-zinc-800 text-zinc-500'
                                  }`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    {doc.stars} Stars
                                  </div>
                                )}
                              </div>

                              {/* Tags List */}
                              {doc.tags && (
                                <div className="flex flex-wrap gap-1.5">
                                  {doc.tags.map((tag: string, tIndex: number) => (
                                    <span
                                      key={tIndex}
                                      className="px-2 py-0.5 text-2xs font-mono bg-zinc-950/80 rounded border border-zinc-900 text-zinc-500"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Nested Team Array (Highlighter for ElemMatch) */}
                              {doc.team && (
                                <div className={`p-3 rounded-lg border flex flex-col gap-1.5 ${
                                  selectedQuery.id === 'elemMatch'
                                    ? 'bg-cyan-500/5 border-cyan-500/20'
                                    : 'bg-black/30 border-zinc-900'
                                }`}>
                                  <div className="text-2xs text-zinc-500 uppercase tracking-widest font-semibold">Team Configuration</div>
                                  <div className="flex flex-col gap-1.5">
                                    {doc.team.map((member: any, mIndex: number) => {
                                      const isMatch = selectedQuery.id === 'elemMatch' && member.role === 'developer' && member.experience >= 5;
                                      return (
                                        <div
                                          key={mIndex}
                                          className={`text-xs flex justify-between items-center p-1 rounded ${
                                            isMatch ? 'bg-cyan-500/10 text-cyan-400 font-semibold px-2' : 'text-zinc-400'
                                          }`}
                                        >
                                          <span className="capitalize">{member.role}</span>
                                          <span>{member.experience} yrs exp {isMatch && '🔥'}</span>
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
                    <div className="flex-1 flex flex-col overflow-hidden max-h-[500px] animate-in fade-in duration-300 font-mono text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-900 mb-3 text-zinc-500">
                        <span>raw_results.json</span>
                        <span>{JSON.stringify(queryOutput.results).length} bytes</span>
                      </div>
                      <pre className="flex-1 overflow-y-auto text-emerald-400/90 leading-relaxed bg-black/40 p-4 rounded-xl border border-zinc-900 select-all max-h-[400px]">
                        {JSON.stringify(queryOutput.results, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
