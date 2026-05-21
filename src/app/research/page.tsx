import Link from 'next/link';
import clientPromise from '@/utils/mongodb';
import HnswGraph, { VectorNode } from '@/components/HnswGraph';

export const metadata = {
  title: 'Research | Gareth Furnell',
  description: 'Exploring AI vectors, embeddings, and data visualisations.',
};

// Next.js config to ensure this route gets statically generated, 
// pulling data from MongoDB at build time.
export const dynamic = 'error';
export const revalidate = false;

// Function to fetch vectors from MongoDB at build time
async function getVectors(): Promise<VectorNode[]> {
  try {
    const client = await clientPromise;
    const db = client.db('portfolio'); // Update with your actual DB name
    const collection = db.collection('vectors');
    
    // Fetch vectors and map them to our expected format
    const vectors = await collection.find({}).limit(100).toArray();
    
    return vectors.map(v => ({
      id: v._id.toString(),
      label: v.label || 'Unknown',
      vector: v.coordinates || [0, 0, 0] // fallback to 0,0,0 if format is wrong
    }));
  } catch (e) {
    console.error("Could not fetch vectors from MongoDB:", e);
    return []; // Return empty array to fallback to dummy data in the component
  }
}

export default async function ResearchPage() {
  const vectors = await getVectors();

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
          <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed mb-6">
            This space is dedicated to my ongoing study of machine learning representations. Specifically, I am interested in how high-dimensional vectors can be used to understand and classify complex data.
          </p>
          <div className="flex gap-4">
            <button className="px-4 py-2 rounded-full bg-zinc-800 text-sm font-medium text-white hover:bg-zinc-700 transition-colors border border-zinc-700">
              Cosine Similarity
            </button>
            <button className="px-4 py-2 rounded-full bg-black text-sm font-medium text-zinc-400 hover:text-white transition-colors border border-zinc-800">
              Dot Product
            </button>
            <button className="px-4 py-2 rounded-full bg-black text-sm font-medium text-zinc-400 hover:text-white transition-colors border border-zinc-800">
              Euclidean
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas */}
        <div className="w-full h-[500px] mb-16 relative group">
          <HnswGraph data={vectors} />
          <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur text-zinc-400 text-xs px-3 py-1.5 rounded-full border border-zinc-800 pointer-events-none">
            {vectors.length > 0 ? `${vectors.length} Nodes Loaded from MongoDB` : 'Interactive Demo Mode (No DB Connected)'}
          </div>
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
              The visualization above is a 3D experiment showing how algorithms navigate Hierarchical Navigable Small World (HNSW) graphs. It demonstrates the structural mapping of high-dimensional data projected down into an interactable 3-dimensional space.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
