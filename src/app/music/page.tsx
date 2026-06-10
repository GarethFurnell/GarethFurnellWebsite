import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Music | Gareth Furnell',
  description: 'Ambient explorations, dub techno, and original music.',
};

export default function MusicPage() {
  const tracks = [
    {
      id: 1,
      title: 'Ambient Granular Exploration',
      description: 'An atmospheric, generative ambient exploration using granular synthesis.',
      audioSrc: '', // e.g., '/audio/project-alpha.mp3'
      image: '/images/music/ambient.png',
      bandcampLink: 'https://bandcamp.com' // Placeholder
    },
    {
      id: 2,
      title: 'Dub Techno Track 1',
      description: 'First attempt at a 909 dub techno track using the analog synthesizer.',
      audioSrc: '/music/dub-techno-track1.mp3',
      image: '/images/music/techno.png',
      bandcampLink: 'https://bandcamp.com' // Placeholder
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800">
      <header className="w-full max-w-4xl mx-auto px-6 py-12 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white hover:opacity-80 transition-opacity">
          ← Back
        </Link>
        <h1 className="text-xl font-medium text-zinc-400">Music</h1>
      </header>

      <main className="w-full max-w-4xl mx-auto px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Ambient & Audio
          </h2>
          <p className="text-zinc-400 max-w-2xl text-lg">
            A collection of my original music, shifting focus towards deep ambient soundscapes and generative audio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="relative group overflow-hidden bg-zinc-900/50 border border-zinc-800/80 rounded-3xl flex flex-col transition-all duration-500 hover:border-zinc-500/50 hover:bg-zinc-900 shadow-2xl shadow-black/50"
            >
              <div className="relative w-full aspect-square overflow-hidden bg-black">
                <Image
                  src={track.image}
                  alt={track.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent opacity-90"></div>
                
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{track.title}</h3>
                  <p className="text-zinc-300 text-sm drop-shadow-md">{track.description}</p>
                </div>
              </div>

              <div className="p-6 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800/80 flex flex-col gap-4">
                {track.audioSrc ? (
                  <audio
                    controls
                    controlsList="nodownload"
                    className="w-full h-12 opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                    src={track.audioSrc}
                  >
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <div className="flex items-center justify-center h-12 bg-black/40 rounded-full border border-dashed border-zinc-700 text-zinc-500 text-sm font-medium">
                    Audio file pending upload...
                  </div>
                )}
                
                {track.bandcampLink && (
                  <a
                    href={track.bandcampLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#629aa9]/10 text-[#629aa9] hover:bg-[#629aa9] hover:text-white border border-[#629aa9]/30 rounded-xl font-bold text-sm transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M0 18.75l7.437-13.5H24l-7.438 13.5H0z"/>
                    </svg>
                    Support on Bandcamp — $1
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
