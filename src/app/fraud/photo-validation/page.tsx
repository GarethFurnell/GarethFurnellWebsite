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
  const [activeTab, setActiveTab] = useState<'workspace' | 'details'>('workspace');

  // Notes & Action State
  const [notes, setNotes] = useState('');
  const [actionReason, setActionReason] = useState('');
  
  const predefinedTags = [
    'Called customer, no answer',
    'Spoke to customer',
    'High risk customer',
    'Low risk customer',
    'Valid claim',
    'Invalid claim'
  ];

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
    setActiveTab('workspace');
    setNotes('');
    setActionReason('');
    
    try {
      const res = await fetch(`/api/fraud/customer-details?userId=${claim.userId}`);
      const data = await res.json();
      if (data.success) {
        setAssociatedClaims(data.relatedClaims);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAssociated(false);
    }
  };

  const handleAddTag = (tag: string) => {
    setNotes((prev) => (prev ? `${prev}\n- ${tag}` : `- ${tag}`));
  };

  return (
    <div className="relative flex items-start gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1 flex flex-col gap-6 min-w-0 transition-all duration-300">
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
                      <Image 
                        src={claim.photoUrl} 
                        alt={claim.productName || 'Claim evidence'} 
                        fill 
                        className="object-cover border-b border-zinc-800"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-600">No Image Provided</div>
                    )}
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg z-10">
                      Risk Score: {claim.riskScore}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{claim.productName || claim.type}</h3>
                        <div className="flex gap-2 items-center mt-1">
                          <p className="font-mono text-xs text-zinc-500">{claim.claimId}</p>
                          <span className="text-zinc-600 text-xs">&middot;</span>
                          <p className="font-mono text-xs text-zinc-500">{claim.userId}</p>
                        </div>
                      </div>
                      <span className="text-green-400 font-medium shrink-0">R {claim.amount.toLocaleString()}</span>
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
                        Open Workspace
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inline Sticky Sidebar */}
      {selectedClaim && (
        <div className="sticky top-6 shrink-0 w-80 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-2xl h-[calc(100vh-120px)] overflow-y-auto flex flex-col z-10">
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedClaim.claimId}</h2>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-zinc-500">{selectedClaim.userId}</span>
                  <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">Total Spend: R {selectedClaim.totalSpendToDate?.toLocaleString() || '0'}</span>
                </div>
              </div>
              <button onClick={() => setSelectedClaim(null)} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800 mb-4">
              <button 
                onClick={() => setActiveTab('workspace')}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'workspace' ? 'border-amber-500 text-amber-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              >
                Workspace
              </button>
              <button 
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-amber-500 text-amber-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              >
                Customer Details
              </button>
            </div>

            {activeTab === 'workspace' ? (
              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Status</p>
                      <p className="text-sm font-medium text-white">{selectedClaim.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Amount</p>
                      <p className="text-sm font-medium text-green-400">R {selectedClaim.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Type</p>
                      <p className="text-sm font-medium text-white">{selectedClaim.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Risk Score</p>
                      <p className="text-sm font-medium text-red-400">{selectedClaim.riskScore}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Description</p>
                    <p className="text-sm text-zinc-300 leading-snug">{selectedClaim.description}</p>
                  </div>
                </div>

                {/* Actions & Notes Area */}
                <div className="flex-1 flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Analyst Notes</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {predefinedTags.map(tag => (
                        <button 
                          key={tag} 
                          onClick={() => handleAddTag(tag)}
                          className="px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition-colors"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                    <textarea 
                      className="w-full h-32 bg-black/50 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 focus:outline-none focus:border-amber-500"
                      placeholder="Add investigation notes here..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="mt-auto pt-4 border-t border-zinc-800">
                    <label className="text-sm font-medium text-white mb-2 block">Outcome Reason</label>
                    <select 
                      className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2.5 mb-4"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                    >
                      <option value="">Select reason...</option>
                      <option value="Verified Authentic">Verified Authentic</option>
                      <option value="Policy Violation">Policy Violation</option>
                      <option value="Repeat Offender">Repeat Offender</option>
                      <option value="Duplicate Hash">Duplicate Image Hash</option>
                    </select>
                    <div className="flex gap-2">
                      <button className="flex-1 py-3 bg-red-900/50 hover:bg-red-900 text-red-200 text-sm font-bold rounded-xl transition-colors border border-red-800">
                        Reverse (Reject)
                      </button>
                      <button className="flex-1 py-3 bg-green-900/50 hover:bg-green-900 text-green-200 text-sm font-bold rounded-xl transition-colors border border-green-800">
                        Release (Pay)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
                  <h3 className="font-bold text-white mb-3 text-sm">Identity Signals</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase">Card Hash</p>
                        <p className="text-sm font-mono text-zinc-300">{selectedClaim.cardHash || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase">Delivery Address</p>
                        <p className="text-sm text-zinc-300 leading-tight">{selectedClaim.deliveryAddress || 'N/A'}</p>
                        {selectedClaim.location && (
                          <p className="text-xs text-amber-500 font-mono mt-1">[{selectedClaim.location[0].toFixed(3)}, {selectedClaim.location[1].toFixed(3)}]</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-white mb-3 text-sm">Linked Claims ({associatedClaims.length})</h3>
                  {loadingAssociated ? (
                    <p className="text-zinc-500 text-sm">Loading graph...</p>
                  ) : associatedClaims.length === 1 ? (
                    <p className="text-zinc-500 text-sm italic">No other claims share these signals.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {associatedClaims.filter(c => c.claimId !== selectedClaim.claimId).map(historyClaim => (
                        <div key={historyClaim.claimId} className="bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50 flex justify-between items-center cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => handleOpenHistory(historyClaim)}>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-white">{historyClaim.claimId}</p>
                              {historyClaim.userId !== selectedClaim.userId && (
                                <span className="px-1.5 py-0.5 bg-red-900/50 text-red-400 text-[10px] rounded border border-red-800">Linked Account</span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500">{new Date(historyClaim.dateFiled).toLocaleDateString()} &middot; {historyClaim.userId}</p>
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
