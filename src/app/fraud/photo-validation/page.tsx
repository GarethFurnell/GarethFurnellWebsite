"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function PhotoValidation() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">Photo Validation</h1>
        <p className="text-zinc-400">Manually review flagged claims that contain suspected fraudulent image attachments.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading cases...</div>
      ) : claims.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">No claims currently require photo validation.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {claims.map((claim) => (
            <div key={claim._id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
              <div className="relative w-full h-48 bg-zinc-950">
                {claim.photoUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-500 border-b border-zinc-800 bg-zinc-900">
                    <span className="text-sm">Mock Damage Image</span>
                    {/* Real implementation would use: <Image src={claim.photoUrl} alt="Claim attachment" fill className="object-cover" /> */}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600">No Image Provided</div>
                )}
                <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                  Risk Score: {claim.riskScore}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{claim.claimId}</h3>
                    <span className="text-green-400 font-medium">${claim.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-1"><span className="text-zinc-500">Type:</span> {claim.type}</p>
                  <p className="text-sm text-zinc-400 line-clamp-2"><span className="text-zinc-500">Desc:</span> {claim.description}</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 py-2 bg-zinc-800 hover:bg-red-900/80 hover:text-red-200 text-zinc-300 text-sm font-medium rounded-lg transition-colors border border-zinc-700 hover:border-red-800">
                    Reject Claim
                  </button>
                  <button className="flex-1 py-2 bg-zinc-800 hover:bg-green-900/80 hover:text-green-200 text-zinc-300 text-sm font-medium rounded-lg transition-colors border border-zinc-700 hover:border-green-800">
                    Clear Flag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
