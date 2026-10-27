'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ImageGallery from '@/components/ImageGallery';
import Accordion from '@/components/Accordion';
import BirdSoundsGraph, { GraphNode, GraphLink } from '@/components/BirdSoundsGraph';
import WeatherTimeSeries from '@/components/WeatherTimeSeries';

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

    // Since the Xeno-canto audio URL is already stored directly in the MongoDB vector node,
    // we can instantly set the audio without making any network requests!
    if (selectedGraphNode.file_url) {
      const url = selectedGraphNode.file_url;
      // Ensure the URL is https
      if (url.startsWith('//')) {
        setSelectedBirdAudio(`https:${url}`);
      } else if (!url.startsWith('http')) {
        setSelectedBirdAudio(`https://${url}`);
      } else {
        setSelectedBirdAudio(url);
      }
    } else {
      setSelectedBirdAudio(null);
    }

    const fetchMedia = async () => {
      setMediaLoading(true);
      setSelectedBirdImage(null);
      
      const birdName = selectedGraphNode.name;

      try {
        const res = await fetch(`${basePath}/api/bird-media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ birdName })
        });
        const data = await res.json();
        
        if (data.status === 'success') {
          setSelectedBirdImage(data.image);
        }
      } catch (err) {
        console.error('Media proxy fetch error:', err);
      } finally {
        setMediaLoading(false);
      }
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

  const handleSelectSearchResult = (res: any) => {
    const isCurrentlySelected = selectedGraphNode && (
      selectedGraphNode.id === (res._id?.toString() || res.id) ||
      selectedGraphNode.name === res.name
    );
    if (isCurrentlySelected) {
      setSelectedGraphNode(null);
      return;
    }
    const nodeObj: GraphNode = {
      id: res._id?.toString() || res.id,
      name: res.name,
      scientific_name: res.scientific_name,
      genus: res.genus,
      family: res.family,
      sound_type: res.sound_type,
      country: res.cnt || res.country,
      location: res.location,
      file_url: res.file_url || res.file,
      val: 2,
      color: res.color || '#00ED64'
    };
    setSelectedGraphNode(nodeObj);
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
      
      

      <main className="relative w-full px-6 md:px-12 lg:px-24 py-12 z-10 flex flex-col gap-6">
        
        {/* Accordion 1: Certifications */}
        <Accordion title="Certifications" subtitle="My professional MongoDB certifications" defaultOpen={false}>
          <div className="py-4 flex flex-col items-center">
            {mongodbImages.find(img => img.includes('0mongodb')) && (
              <div className="mb-8 w-full sm:w-1/2 md:w-1/4 px-3 flex justify-center">
                <div className="w-full">
                  <ImageGallery 
                    images={[mongodbImages.find(img => img.includes('0mongodb'))!]} 
                    layout="grid" 
                    gridCols={1}
                    objectFit="contain"
                  />
                </div>
              </div>
            )}
            <div className="w-full">
              <ImageGallery 
                images={mongodbImages.filter(img => !img.includes('0mongodb'))} 
                layout="grid" 
                gridCols={4} 
                objectFit="contain"
                emptyMessage="Currently studying for the next one!" 
              />
            </div>
          </div>
        </Accordion>

        <WeatherTimeSeries />
        
        
          <div className="py-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🐦</span>
                    <h3 className="text-xl font-bold text-white">Semantic Bird Search</h3>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Query the MongoDB Atlas Vector Store across 1024-dimensional Voyage AI embeddings. The 3D force graph positions each bird purely based on acoustic and semantic similarity, forming natural clusters in vector space.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={vsSearchQuery}
                    onChange={(e) => setVsSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVectorSearch()}
                    placeholder="e.g. eagle screech, warbler melody, aquatic call" 
                    className="flex-1 bg-[#001E2B]/60 border border-[#00684A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00ED64]" 
                  />
                  <button 
                    onClick={handleVectorSearch}
                    disabled={vsLoading}
                    className="bg-[#00ED64] text-[#001E2B] px-5 py-3 rounded-xl font-bold hover:bg-[#00ED64]/90 transition-colors disabled:opacity-50 text-sm shadow-md"
                  >
                    {vsLoading ? '...' : 'Search'}
                  </button>
                </div>

                {vsError && (
                  <div className="text-red-400 text-xs mt-1 bg-red-400/10 p-3 rounded-lg border border-red-400/20 font-mono">
                    {vsError}
                  </div>
                )}

                {!graphLoading && (
                  <button 
                    onClick={seedVectorData} 
                    disabled={vsLoading} 
                    className="mt-2 w-full bg-[#023430] border border-[#00684A] text-[#00ED64] px-4 py-3 rounded-xl font-bold hover:bg-[#00684A]/50 transition-colors flex items-center justify-center gap-2 text-sm shadow"
                  >
                    <span>{vsLoading ? 'Embedding & Seeding Vector Space...' : 'Seed Data from Xeno-canto'}</span>
                  </button>
                )}

                {vsResults && (
                  <div className="mt-4 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#00ED64] uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <span>Vector Search Matches</span>
                        <span className="text-[10px] bg-[#00ED64]/15 px-1.5 py-0.5 rounded text-[#00ED64]">
                          {vsResults.length}
                        </span>
                      </h4>
                      <button 
                        onClick={() => setVsResults(null)} 
                        className="text-[11px] text-zinc-400 hover:text-white transition-colors"
                      >
                        Clear Search
                      </button>
                    </div>
                    <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
                      {vsResults.map((res: any) => {
                        const isSelected = selectedGraphNode && (
                          selectedGraphNode.id === (res._id?.toString() || res.id) || 
                          selectedGraphNode.name === res.name
                        );
                        return (
                          <React.Fragment key={res._id || res.id}>
                            <div 
                              onClick={() => handleSelectSearchResult(res)}
                              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left ${
                                isSelected 
                                  ? 'bg-[#00ED64]/15 border-[#00ED64] ring-1 ring-[#00ED64] shadow-md shadow-[#00ED64]/10' 
                                  : 'bg-[#023430]/40 border-[#00684A] hover:border-[#00ED64]/70 hover:bg-[#00684A]/30'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                  <span>{res.name}</span>
                                  {isSelected && <span className="text-xs text-[#00ED64]">●</span>}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="text-[10px] bg-[#00ED64]/10 text-[#00ED64] px-1.5 py-0.5 rounded border border-[#00ED64]/20 font-mono font-semibold">
                                    Score: {res.score?.toFixed(3)}
                                  </div>
                                  <span className="text-xs text-zinc-400 font-mono">
                                    {isSelected ? '▲' : '▼'}
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs text-zinc-400 font-mono mb-1 flex items-center justify-between">
                                <span className="italic">{res.scientific_name || res.genus}</span>
                                {res.country && <span className="text-zinc-500 font-normal">📍 {res.country}</span>}
                              </div>
                              <div className="text-[11px] text-[#00ED64]/80 flex items-center gap-1 mt-1 font-mono">
                                <span>{isSelected ? 'Click to collapse details' : '🎧 Click to open photo & audio'}</span>
                              </div>
                            </div>

                            {/* Render Photo, Audio, and Info directly below this specific card */}
                            {isSelected && (
                              <div className="p-4 bg-[#012520]/90 border border-[#00ED64]/40 border-l-4 border-l-[#00ED64] rounded-xl my-1 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col shadow-xl">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedGraphNode.color || '#00ED64' }}></span>
                                    <h4 className="text-[11px] font-bold text-[#00ED64] uppercase tracking-wider font-mono">
                                      Species Information
                                    </h4>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedGraphNode(null);
                                    }}
                                    className="text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 font-mono transition-colors flex items-center gap-1"
                                    title="Collapse details"
                                  >
                                    <span>✕</span>
                                    <span>Close</span>
                                  </button>
                                </div>

                                <div className="text-white font-bold mb-0.5 text-base leading-snug">{selectedGraphNode.name}</div>
                                <div className="text-xs text-[#00ED64] font-mono mb-2 italic">{selectedGraphNode.scientific_name || selectedGraphNode.genus}</div>

                                {/* Genus / Family / Sound Info */}
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                  <span className="text-xs text-zinc-300 font-mono">
                                    {selectedGraphNode.family ? `Family: ${selectedGraphNode.family}` : `Genus: ${selectedGraphNode.genus}`}
                                  </span>
                                  {selectedGraphNode.sound_type && (
                                    <span className="text-[10px] bg-[#00ED64]/10 text-[#00ED64] px-2 py-0.5 rounded border border-[#00ED64]/20 font-mono capitalize ml-auto">
                                      {selectedGraphNode.sound_type}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Dynamic Bird Image - Responsive Adaptive Container (no cutoff) */}
                                {mediaLoading ? (
                                  <div className="w-full min-h-[160px] bg-[#001E2B]/50 rounded-xl animate-pulse mb-3 flex items-center justify-center border border-[#00684A]/50">
                                    <span className="text-[#00ED64]/50 text-xs font-mono">Fetching High-Res Photo...</span>
                                  </div>
                                ) : selectedBirdImage ? (
                                  <div className="w-full relative rounded-xl overflow-hidden mb-3 border border-[#00684A] bg-[#00141D] flex items-center justify-center transition-all duration-300">
                                    <img 
                                      src={selectedBirdImage} 
                                      alt={selectedGraphNode.name} 
                                      className="w-full h-auto max-h-[340px] object-contain rounded-xl block shadow-lg" 
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full min-h-[70px] bg-[#001E2B]/30 rounded-xl flex items-center justify-center mb-3 border border-[#00684A]/30">
                                    <span className="text-zinc-500 text-xs italic">No image found on iNaturalist</span>
                                  </div>
                                )}

                                {/* Dynamic Bird Audio */}
                                {!mediaLoading && selectedBirdAudio && (
                                  <div className="mb-3">
                                    <audio controls src={selectedBirdAudio} className="w-full h-9 outline-none rounded-lg" controlsList="nodownload">
                                      Your browser does not support the audio element.
                                    </audio>
                                    <span className="text-[10px] text-zinc-500 mt-1 block">Acoustics provided by Xeno-canto</span>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-2 mt-1">
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
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Standalone card display when no search is active, or if user clicked a 3D node that isn't in search results */}
                {selectedGraphNode && (!vsResults || !vsResults.some((r: any) => 
                  (selectedGraphNode.id && (r._id?.toString() === selectedGraphNode.id || r.id === selectedGraphNode.id)) ||
                  r.name === selectedGraphNode.name
                )) && (
                  <div className="mt-4 p-5 bg-[#023430]/40 border border-[#00684A] rounded-2xl animate-in fade-in overflow-hidden flex flex-col shadow-lg transition-all duration-300">
                     <div className="flex items-center justify-between mb-2">
                       <h4 className="text-[11px] font-bold text-[#00ED64] uppercase tracking-wider font-mono">Selected Vector Node</h4>
                       <button
                         onClick={() => setSelectedGraphNode(null)}
                         className="text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 font-mono transition-colors flex items-center gap-1"
                       >
                         <span>✕</span>
                         <span>Close</span>
                       </button>
                     </div>
                     <div className="text-white font-bold mb-0.5 text-lg leading-snug">{selectedGraphNode.name}</div>
                     <div className="text-xs text-[#00ED64] font-mono mb-2.5 italic">{selectedGraphNode.scientific_name || selectedGraphNode.genus}</div>

                     {/* Genus / Family / Sound Info */}
                     <div className="flex items-center gap-2 mb-3">
                       <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedGraphNode.color || '#00ED64' }}></span>
                       <span className="text-xs text-zinc-300 font-mono">
                         {selectedGraphNode.family ? `Family: ${selectedGraphNode.family}` : `Genus: ${selectedGraphNode.genus}`}
                       </span>
                       {selectedGraphNode.sound_type && (
                         <span className="text-[10px] bg-[#00ED64]/10 text-[#00ED64] px-2 py-0.5 rounded border border-[#00ED64]/20 font-mono capitalize ml-auto">
                           {selectedGraphNode.sound_type}
                         </span>
                       )}
                     </div>
                     
                     {/* Dynamic Bird Image - Responsive Adaptive Container (no cutoff) */}
                     {mediaLoading ? (
                       <div className="w-full min-h-[160px] bg-[#001E2B]/50 rounded-xl animate-pulse mb-3 flex items-center justify-center border border-[#00684A]/50">
                         <span className="text-[#00ED64]/50 text-xs font-mono">Fetching Media...</span>
                       </div>
                     ) : selectedBirdImage ? (
                       <div className="w-full relative rounded-xl overflow-hidden mb-3 border border-[#00684A] bg-[#00141D] flex items-center justify-center transition-all duration-300">
                         <img 
                           src={selectedBirdImage} 
                           alt={selectedGraphNode.name} 
                           className="w-full h-auto max-h-[380px] object-contain rounded-xl block shadow-lg" 
                         />
                       </div>
                     ) : (
                       <div className="w-full min-h-[70px] bg-[#001E2B]/30 rounded-xl flex items-center justify-center mb-3 border border-[#00684A]/30">
                         <span className="text-zinc-500 text-xs italic">No image found on iNaturalist</span>
                       </div>
                     )}

                     {/* Dynamic Bird Audio */}
                     {!mediaLoading && selectedBirdAudio && (
                        <div className="mb-3">
                          <audio controls src={selectedBirdAudio} className="w-full h-9 outline-none rounded-lg" controlsList="nodownload">
                            Your browser does not support the audio element.
                          </audio>
                          <span className="text-[10px] text-zinc-500 mt-1 block">Acoustics provided by Xeno-canto</span>
                        </div>
                     )}

                     <div className="grid grid-cols-2 gap-2 mt-1">
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
                    selectedNodeId={selectedGraphNode?.id || selectedGraphNode?.name}
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
