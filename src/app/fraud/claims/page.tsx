"use client";

import { useEffect, useState } from 'react';

export default function ClaimsManagement() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

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

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              <th scope="col" className="px-6 py-4">Type</th>
              <th scope="col" className="px-6 py-4">Amount</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4">Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">Loading claims...</td>
              </tr>
            ) : claims.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">No claims found.</td>
              </tr>
            ) : (
              claims.map((claim) => (
                <tr key={claim._id} className="bg-transparent border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{claim.claimId}</td>
                  <td className="px-6 py-4">{claim.type}</td>
                  <td className="px-6 py-4 text-green-400 font-medium">${claim.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
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
  );
}
