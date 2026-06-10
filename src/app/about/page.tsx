import Link from 'next/link';

export const metadata = {
  title: 'About | Gareth Furnell',
  description: 'Learn more about Gareth Furnell.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen text-white font-sans selection:bg-zinc-800">
      <header className="w-full max-w-4xl mx-auto px-6 py-12 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white hover:opacity-80 transition-opacity">
          ← Back
        </Link>
        <h1 className="text-xl font-medium text-zinc-400">About</h1>
      </header>

      <main className="w-full max-w-4xl mx-auto px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            My Background
          </h2>
          <p className="text-zinc-400 max-w-2xl text-lg">
            A little bit about my journey, experience, and passions.
          </p>
        </div>

        {/* Empty Placeholder Section */}
        <div className="w-full h-64 border border-dashed border-zinc-800 rounded-2xl flex items-center justify-center bg-zinc-900/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
          <p className="text-zinc-500 font-medium">About me content coming soon...</p>
        </div>
      </main>
    </div>
  );
}
