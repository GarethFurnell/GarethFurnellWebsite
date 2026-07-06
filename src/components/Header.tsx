"use client";

import Link from 'next/link';
import NetworkBackground from './NetworkBackground';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full overflow-hidden bg-white/95 backdrop-blur-md text-black border-b border-zinc-200">
      {/* Dark inverted network background constrained to the header */}
      <NetworkBackground 
        theme="dark" 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0" 
      />
      
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 py-8 flex justify-between items-center">
        <Link href="/" className="text-2xl font-semibold tracking-tight hover:opacity-80 transition-opacity cursor-pointer">
          gareth furnell
        </Link>
        <nav className="flex gap-6 items-center text-sm font-medium text-zinc-600">
          <Link href="/work" className="hover:text-black transition-all">Work</Link>
          <Link href="/about" className="hover:text-black transition-all">About</Link>
          <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
          <Link href="/cart" className="relative hover:text-black transition-colors flex items-center gap-1">
            Cart
            {cartCount > 0 && (
              <span className="bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
