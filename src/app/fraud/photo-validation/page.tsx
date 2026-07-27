"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function PhotoValidation() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sidebar state
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [associatedClaims, setAssociatedClaims] = useState<any[]>([]);
  const [loadingAssociated, setLoadingAssociated] = useState(false);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await fetch('/api/fraud/photo-validation');
        const data = await res.json();
        if (data.success) setClaims(data.claims);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  const handleOpenHistory = async (claim: any) => {
    setSelectedClaim(claim);
    setLoadingAssociated(true);
    setAssociatedClaims([]);
    try {
      const res = await fetch(`/api/fraud/claims?userId=${claim.userId}`);
      const data = await res.json();
      if (data.success) {
        const history = data.claims.filter((c: any) => c.claimId !== claim.claimId);
        setAssociatedClaims(history);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAssociated(false);
    }
  };

  return (
    <div className="relative flex animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      <div className={`flex flex-col gap-6 w-full transition-all duration-300 ${selectedClaim ? 'lg:pr-96' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold mb-2">Photo Validation</h1>
          <p className="text-zinc-400">Manually review flagged claims that contain suspected fraudulent image attachments and EXIF discrepancies.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-500">Loading cases...</div>
        ) : claims.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">No claims currently require photo validation.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {claims.map((claim) => {
              const filedDate = new Date(claim.dateFiled);
              const takenDate = claim.imageMetadata ? new Date(claim.imageMetadata.dateTaken) : null;
              
              // Calculate difference in days. If the photo is more than 3 days older than the claim, flag it red.
              const isDiscrepancy = takenDate && ((filedDate.getTime() - takenDate.getTime()) / (1000 * 3600 * 24)) > 3;
              const isDuplicateHash = claim.imageMetadata?.imageHash === 'duplicate-hash-8f43';

              return (
                <div key={claim._id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                  <div className="relative w-full h-48 bg-zinc-950">
                    {claim.photoUrl ? (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-500 border-b border-zinc-800 bg-zinc-900">
                        <span className="text-sm">Mock Grocery Image</span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-600">No Image Provided</div>
                    )}
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                      Risk Score: {claim.riskScore}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white">{claim.claimId}</h3>
                        <p className="font-mono text-xs text-zinc-500">{claim.userId}</p>
                      </div>
                      <span className="text-green-400 font-medium">R {claim.amount.toLocaleString()}</span>
                    </div>
                    
                    <p className="text-sm text-zinc-400 line-clamp-2"><span className="text-zinc-500">Issue:</span> {claim.description}</p>

                    <div className="bg-black/50 p-3 rounded-lg border border-zinc-800 text-sm">
                      <div className="grid grid-cols-2 gap-2 mb-2 pb-2 border-b border-zinc-800/50">
                        <div>
                          <p className="text-xs text-zinc-500 uppercase">Date Filed</p>
                          <p className="text-white">{filedDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 uppercase">Image EXIF Date</p>
                          <p className={`font-medium ${isDiscrepancy ? 'text-red-500' : 'text-green-500'}`}>
                            {takenDate ? takenDate.toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      {isDiscrepancy && (
                        <div className="text-xs text-red-400 flex items-center gap-1 mt-1 mb-1">
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          <span>Critical: Photo taken significantly before order date.</span>
                        </div>
                      )}
                      {isDuplicateHash && (
                        <div className="text-xs text-red-400 flex items-center gap-1 mt-1">
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          <span>Critical: Image hash matches a previously submitted photo.</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={() => handleOpenHistory(claim)}
                        className="flex-1 py-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 text-sm font-medium rounded-lg transition-colors border border-zinc-700"
                      >
                        View User History
                      </button>
                      <button className="flex-1 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 text-sm font-medium rounded-lg transition-colors border border-red-800">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-out Sidebar (Reused from Claims Management) */}
      <div 
        className={`fixed top-0 right-0 w-96 h-full bg-zinc-950 border-l border-zinc-800 p-6 shadow-2xl transition-transform duration-300 z-50 overflow-y-auto ${selectedClaim ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedClaim && (
          <div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedClaim.claimId}</h2>
                <p className="font-mono text-sm text-zinc-500">{selectedClaim.userId}</p>
              </div>
              <button onClick={() => setSelectedClaim(null)} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <h3 className="text-lg font-bold text-white mb-4">Associated History ({associatedClaims.length})</h3>
            
            {loadingAssociated ? (
              <p className="text-zinc-500 text-sm">Loading history...</p>
            ) : associatedClaims.length === 0 ? (
              <p className="text-zinc-500 text-sm italic">No previous claims found for this user.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {associatedClaims.map(historyClaim => (
                  <div key={historyClaim.claimId} className="bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50 flex justify-between items-center cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => handleOpenHistory(historyClaim)}>
                    <div>
                      <p className="text-sm font-medium text-white">{historyClaim.claimId}</p>
                      <p className="text-xs text-zinc-500">{new Date(historyClaim.dateFiled).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-400">R {historyClaim.amount.toLocaleString()}</p>
                      <p className={`text-[10px] uppercase font-bold ${historyClaim.status === 'Flagged for Review' ? 'text-amber-500' : 'text-zinc-500'}`}>{historyClaim.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Sidebar Backdrop Overlay */}
      {selectedClaim && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity duration-300 lg:hidden"
          onClick={() => setSelectedClaim(null)}
        ></div>
      )}
    </div>
  );
}
