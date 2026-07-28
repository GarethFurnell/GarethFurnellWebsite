"use client";

import { useEffect, useState } from 'react';

export default function ClaimsManagement() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
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
      setLoading(true);
      try {
        const res = await fetch(`/api/fraud/claims?status=${filter}`);
        const data = await res.json();
        if (data.success) setClaims(data.claims);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, [filter]);

  const handleClaimClick = async (claim: any) => {
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
    <div className="relative flex animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      {/* Main Table Area */}
      <div className={`flex flex-col gap-6 w-full transition-all duration-300 ${selectedClaim ? 'lg:pr-96' : ''}`}>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-2">Claims Management</h1>
            <p className="text-zinc-400">View and filter through submitted claims and their current risk status.</p>
          </div>
          
          <select 
            className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Flagged for Review">Flagged for Review</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="relative overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm text-left text-zinc-400">
            <thead className="text-xs text-zinc-300 uppercase bg-zinc-900/50">
              <tr>
                <th scope="col" className="px-6 py-4">Claim ID</th>
                <th scope="col" className="px-6 py-4">User ID</th>
                <th scope="col" className="px-6 py-4">Type</th>
                <th scope="col" className="px-6 py-4">Amount</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">Loading claims...</td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">No claims found.</td>
                </tr>
              ) : (
                claims.map((claim) => (
                  <tr 
                    key={claim._id} 
                    onClick={() => handleClaimClick(claim)}
                    className={`border-b border-zinc-800 cursor-pointer transition-colors ${selectedClaim?.claimId === claim.claimId ? 'bg-zinc-800' : 'bg-transparent hover:bg-zinc-900/50'}`}
                  >
                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{claim.claimId}</td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">{claim.userId}</td>
                    <td className="px-6 py-4">{claim.type}</td>
                    <td className="px-6 py-4 text-green-400 font-medium">R {claim.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        claim.status === 'Flagged for Review' ? 'bg-amber-900/50 text-amber-400 border border-amber-800' :
                        claim.status === 'Approved' ? 'bg-green-900/50 text-green-400 border border-green-800' :
                        claim.status === 'Rejected' ? 'bg-red-900/50 text-red-400 border border-red-800' :
                        'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-zinc-800 rounded-full h-2 max-w-[60px]">
                          <div className={`h-2 rounded-full ${claim.riskScore > 75 ? 'bg-red-500' : claim.riskScore > 40 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${claim.riskScore}%` }}></div>
                        </div>
                        <span className="text-xs">{claim.riskScore}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Sidebar */}
      <div 
        className={`fixed top-0 right-0 w-96 h-full bg-zinc-950 border-l border-zinc-800 p-4 shadow-2xl transition-transform duration-300 z-50 overflow-y-auto flex flex-col ${selectedClaim ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedClaim && (
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

                  <div className="sticky bottom-0 bg-zinc-950 pt-4 pb-2 border-t border-zinc-800 mt-auto z-10 -mx-4 px-4">
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
                        <div key={historyClaim.claimId} className="bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50 flex justify-between items-center cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => handleClaimClick(historyClaim)}>
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
