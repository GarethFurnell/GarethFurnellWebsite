import NetworkBackground from './NetworkBackground';

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-white/95 text-black border-t border-zinc-200 mt-auto">
      {/* Dark inverted network background constrained to the footer */}
      <NetworkBackground 
        theme="dark" 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0" 
      />
      
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 py-12">
        <p className="text-zinc-500 text-sm font-medium">
          Documenting & sharing my experiences on my creative and technical journey.
        </p>
      </div>
    </footer>
  );
}
