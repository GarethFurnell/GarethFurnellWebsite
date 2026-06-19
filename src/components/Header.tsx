import Link from 'next/link';
import NetworkBackground from './NetworkBackground';

export default function Header() {
  return (
    <header className="relative w-full overflow-hidden bg-white/95 text-black border-b border-zinc-200">
      {/* Dark inverted network background constrained to the header */}
      <NetworkBackground 
        theme="dark" 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0" 
      />
      
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 py-8 flex justify-between items-center">
        <Link href="/" className="text-2xl font-semibold tracking-tight hover:opacity-80 transition-opacity cursor-pointer">
          gareth furnell
        </Link>
        <nav className="flex gap-6 text-sm font-medium text-zinc-600">
          <Link href="/work" className="hover:text-black transition-all">Work</Link>
          <Link href="/about" className="hover:text-black transition-all">About</Link>
          <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
