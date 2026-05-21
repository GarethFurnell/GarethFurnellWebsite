import Link from 'next/link';
import ListItem from '@/components/ListItem';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-zinc-800 selection:text-white flex flex-col font-sans">
      <header className="w-full max-w-4xl mx-auto px-6 py-12 sm:py-20 flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white hover:opacity-80 transition-opacity cursor-pointer">
          gareth furnell
        </h1>
        <nav className="flex gap-6 text-sm font-medium text-zinc-400">
          <Link href="#" className="hover:text-white transition-colors">Work</Link>
          <Link href="#" className="hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </nav>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 pb-24">
        <ul className="flex flex-col gap-2 mt-8">
          <ListItem
            title="Certifications"
            subtitle="MongoDB & Google Cloud Certificates"
            href="/certifications"
          />
          <ListItem
            title="Photography"
            subtitle="Film Photos / 35mm"
            href="/photography"
          />
          <ListItem
            title="AI"
            subtitle="Agentic Coding & Automation"
            href="/ai"
          />
          <ListItem
            title="Music"
            subtitle="Ableton Projects & Audio"
            href="/music"
          />
          <ListItem
            title="Research"
            subtitle="Vectors & Embeddings Visualisations"
            href="/research"
          />
        </ul>
      </main>

      <footer className="w-full max-w-4xl mx-auto px-6 py-12 border-t border-zinc-900">
        <p className="text-zinc-500 text-sm">
          Documenting & sharing my experiences on my creative and technical journey.
        </p>
      </footer>
    </div>
  );
}
