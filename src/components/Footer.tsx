import NetworkBackground from './NetworkBackground';

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-zinc-950/70 backdrop-blur-xl text-white border-t border-zinc-800 mt-auto">
      {/* Dark inverted network background constrained to the footer */}
      <NetworkBackground 
        theme="light" 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20 z-0" 
      />
      
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 py-12 flex justify-center items-center text-center">
        <p className="text-zinc-500 text-xs italic font-medium">
          "the most important story you'll ever read is the reflection of the life you leave behind"
        </p>
      </div>
    </footer>
  );
}
