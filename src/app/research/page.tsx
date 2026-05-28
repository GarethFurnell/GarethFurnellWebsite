import Link from 'next/link';

export const metadata = {
  title: 'Research | Gareth Furnell',
  description: 'Exploring AI vectors, embeddings, and data visualisations.',
};

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800">
      <header className="w-full max-w-4xl mx-auto px-6 py-12 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white hover:opacity-80 transition-opacity">
          ← Back
        </Link>
        <h1 className="text-xl font-medium text-zinc-400">Research</h1>
      </header>

      <main className="w-full max-w-4xl mx-auto px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-6">
            Vectors & Embeddings
          </h2>
          <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed">
            This space is dedicated to my ongoing study of machine learning representations. Specifically, I am interested in how high-dimensional vectors can be used to understand and classify complex data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-4 transition-all hover:border-zinc-700">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <h3 className="text-2xl font-medium text-white">Bird Sound Analysis</h3>
            <p className="text-zinc-400 leading-relaxed">
              Inspired by recent research on understanding bird language, this upcoming project will visualize how different bird sounds map onto a vector space. By converting audio frequencies into embeddings, we can visually cluster distinct calls and perhaps even cross-reference them with musical stems.
            </p>
            <div className="mt-auto pt-4 flex items-center text-sm font-medium text-zinc-500">
              <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
              In Development
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-4 transition-all hover:border-zinc-700">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <h3 className="text-2xl font-medium text-white">HNSW Graph Traversal</h3>
            <p className="text-zinc-400 leading-relaxed">
              A 3D visualization experiment showing how algorithms navigate Hierarchical Navigable Small World (HNSW) graphs. This will interactively demonstrate the differences between distance metrics like Cosine Similarity and Dot Product when querying nearest neighbors.
            </p>
            <div className="mt-auto pt-4 flex items-center text-sm font-medium text-zinc-500">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
              Concept Phase
            </div>
          </div>

          <Link href="/research/mongodb" className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-4 transition-all hover:border-cyan-500/50 hover:bg-cyan-950/5 group text-left">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mb-2 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                <path d="M3 12A9 3 0 0 0 21 12"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-medium text-white group-hover:text-cyan-400 transition-colors">MongoDB Live Console</h3>
            <p className="text-zinc-400 leading-relaxed">
              An interactive presentation dashboard running live queries against a MongoDB Atlas cluster to demonstrate common operators ($gte, $and, $elemMatch), sorting, limiting, projection, and document counting.
            </p>
            <div className="mt-auto pt-4 flex items-center text-sm font-medium text-cyan-500">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Live Presentation
            </div>
          </Link>
        </div>

        <div className="p-8 rounded-2xl border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700 mb-4">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <h3 className="text-xl font-medium text-zinc-300 mb-2">Interactive Canvas</h3>
          <p className="text-zinc-500 max-w-md mx-auto">
            Future iterations of this page will include WebGL or Three.js canvases allowing you to rotate, zoom, and explore vector spaces directly in the browser.
          </p>
        </div>
      </main>
    </div>
  );
}
