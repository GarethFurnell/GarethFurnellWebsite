import Link from 'next/link';

export default function FraudLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-100px)] text-white w-full max-w-7xl mx-auto px-4 md:px-12 py-8">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 mb-8 md:mb-0 md:mr-12">
        <div className="sticky top-24">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Fraud Center</h2>
          <nav className="flex flex-col gap-2">
            <Link href="/fraud" className="px-4 py-3 rounded-lg hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800 text-sm font-medium">
              Claims & Fraud Dashboard
            </Link>
            <Link href="/fraud/claims" className="px-4 py-3 rounded-lg hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800 text-sm font-medium">
              Claims Management
            </Link>
            <Link href="/fraud/photo-validation" className="px-4 py-3 rounded-lg hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800 text-sm font-medium">
              Photo Validation
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-zinc-950/50 border border-zinc-900 rounded-2xl p-6 md:p-8 min-h-[600px] shadow-2xl backdrop-blur-xl">
        {children}
      </main>
    </div>
  );
}
