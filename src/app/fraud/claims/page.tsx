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
    try {
      const res = await fetch(`/api/fraud/claims?userId=${claim.userId}`);
      const data = await res.json();
      if (data.success) {
        // Filter out the currently selected claim from the history
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
      {/* Main Table Area */}
      <div className={`flex flex-col gap-6 w-full transition-all duration-300 ${selectedClaim ? 'lg:pr-80' : ''}`}>
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
        className={`fixed top-0 right-0 w-80 h-full bg-zinc-950 border-l border-zinc-800 p-6 shadow-2xl transition-transform duration-300 z-50 overflow-y-auto ${selectedClaim ? 'translate-x-0' : 'translate-x-full'}`}
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

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 mb-8">
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
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Date Filed</p>
                  <p className="text-sm font-medium text-white">{new Date(selectedClaim.dateFiled).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Risk Score</p>
                  <p className="text-sm font-medium text-red-400">{selectedClaim.riskScore}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-zinc-300">{selectedClaim.description}</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-4">Associated History ({associatedClaims.length})</h3>
            
            {loadingAssociated ? (
              <p className="text-zinc-500 text-sm">Loading history...</p>
            ) : associatedClaims.length === 0 ? (
              <p className="text-zinc-500 text-sm italic">No previous claims found for this user.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {associatedClaims.map(historyClaim => (
                  <div key={historyClaim.claimId} className="bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50 flex justify-between items-center cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => handleClaimClick(historyClaim)}>
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
