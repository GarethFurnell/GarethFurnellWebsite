'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ImageGallery from '@/components/ImageGallery';
import Accordion from '@/components/Accordion';
import BirdSoundsGraph, { GraphNode, GraphLink } from '@/components/BirdSoundsGraph';

const basePath = '';



export default function MongodbClient({ mongodbImages }: { mongodbImages: string[] }) {
  // Vector Search States
  const [vsSearchQuery, setVsSearchQuery] = useState('');
  const [vsResults, setVsResults] = useState<any[] | null>(null);
  const [vsLoading, setVsLoading] = useState(false);
  const [vsError, setVsError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{nodes: GraphNode[], links: GraphLink[]} | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [selectedGraphNode, setSelectedGraphNode] = useState<any | null>(null);
  const [selectedBirdImage, setSelectedBirdImage] = useState<string | null>(null);
  const [selectedBirdAudio, setSelectedBirdAudio] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);

  useEffect(() => {
    loadGraphData();
  }, []);

  useEffect(() => {
    if (!selectedGraphNode) {
      setSelectedBirdImage(null);
      setSelectedBirdAudio(null);
      return;
    }

    const fetchMedia = async () => {
      setMediaLoading(true);
      setSelectedBirdImage(null);
      setSelectedBirdAudio(null);
      
      const birdName = selectedGraphNode.name;

      try {
        // Fetch Wikipedia Image
        const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(birdName)}&prop=pageimages&format=json&pithumbsize=400&origin=*`);
        const wikiData = await wikiRes.json();
        const pages = wikiData.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1' && pages[pageId].thumbnail) {
            setSelectedBirdImage(pages[pageId].thumbnail.source);
          }
        }
      } catch (err) {
        console.error('Wiki fetch error:', err);
      }

      try {
        // Fetch Xeno-canto Audio
        // Note: Direct fetch might hit CORS issues depending on browser, but xeno-canto API sometimes allows it.
        // If it fails, the user will just see no audio.
        const xcRes = await fetch(`https://xeno-canto.org/api/2/recordings?query=${encodeURIComponent(birdName)}`);
        const xcData = await xcRes.json();
        if (xcData.recordings && xcData.recordings.length > 0) {
          setSelectedBirdAudio(xcData.recordings[0].file);
        }
      } catch (err) {
        console.error('Xeno-canto fetch error:', err);
      }

      setMediaLoading(false);
    };

    fetchMedia();
  }, [selectedGraphNode]);
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

  
  
  return (
    <div className="min-h-screen  text-white font-sans selection:bg-[#00684A]/50 relative overflow-hidden">
      {/* Immersive Brand Gradient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#00ED64]/15 via-[#00684A]/5 to-transparent pointer-events-none z-0"></div>
      
      

      <main className="relative w-full max-w-7xl mx-auto px-6 py-12 z-10 flex flex-col gap-6">
        
        {/* Accordion 1: Certifications */}
        <Accordion title="Certifications" subtitle="My professional MongoDB certifications" defaultOpen={false}>
          <div className="py-4">
            <ImageGallery images={mongodbImages} layout="grid" emptyMessage="Currently studying for the next one!" />
          </div>
        </Accordion>

        
        
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
                    className="flex-1  border border-[#00684A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00ED64]" 
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
                  <div className="mt-8 p-6 bg-[#023430]/40 border border-[#00684A] rounded-xl animate-in fade-in overflow-hidden flex flex-col">
                     <h4 className="text-sm font-bold text-[#00ED64] mb-2">Selected Node</h4>
                     <div className="text-white font-bold mb-1 text-xl">{selectedGraphNode.name}</div>
                     <div className="text-xs text-[#00ED64] font-mono mb-4">Genus: {selectedGraphNode.genus || selectedGraphNode.family}</div>
                     
                     {/* Dynamic Bird Image */}
                     {mediaLoading ? (
                       <div className="w-full h-48 bg-[#001E2B]/50 rounded-lg animate-pulse mb-4 flex items-center justify-center border border-[#00684A]/50">
                         <span className="text-[#00ED64]/50 text-xs font-mono">Fetching Media...</span>
                       </div>
                     ) : selectedBirdImage ? (
                       <div className="w-full h-48 relative rounded-lg overflow-hidden mb-4 border border-[#00684A]">
                         <img src={selectedBirdImage} alt={selectedGraphNode.name} className="w-full h-full object-cover" />
                       </div>
                     ) : (
                       <div className="w-full h-24 bg-[#001E2B]/30 rounded-lg flex items-center justify-center mb-4 border border-[#00684A]/30">
                         <span className="text-zinc-500 text-xs italic">No image found on Wikipedia</span>
                       </div>
                     )}

                     {/* Dynamic Bird Audio */}
                     {!mediaLoading && selectedBirdAudio && (
                        <div className="mb-4">
                          <audio controls src={selectedBirdAudio} className="w-full h-10 outline-none rounded-lg" controlsList="nodownload">
                            Your browser does not support the audio element.
                          </audio>
                          <span className="text-[10px] text-zinc-500 mt-1 block">Audio provided by Xeno-canto</span>
                        </div>
                     )}

                     <div className="grid grid-cols-2 gap-2 mt-2">
                       {selectedGraphNode.country && (
                         <div className="text-xs text-zinc-300 flex items-center gap-1.5 bg-[#001E2B]/50 p-2 rounded-lg border border-[#00684A]/30">
                           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                           <span className="truncate">{selectedGraphNode.country}</span>
                         </div>
                       )}
                       {selectedGraphNode.location?.coordinates && (
                         <div className="text-xs text-zinc-400 font-mono flex items-center gap-1.5 bg-[#001E2B]/50 p-2 rounded-lg border border-[#00684A]/30">
                           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                           [{selectedGraphNode.location.coordinates[0].toFixed(2)}, {selectedGraphNode.location.coordinates[1].toFixed(2)}]
                         </div>
                       )}
                     </div>
                  </div>
                )}
              </div>
              <div className="lg:col-span-2">
                {graphLoading ? (
                  <div className="w-full h-[600px] flex flex-col items-center justify-center text-[#00ED64]/50 border border-[#00684A] rounded-xl /50">
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
                  <div className="w-full h-[600px] flex flex-col items-center justify-center text-[#00ED64]/50 border border-[#00684A] rounded-xl /50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-[#00684A]">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <p>No graph data. Click &quot;Seed Data&quot; to begin.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        

      </main>
    </div>
  );
}
