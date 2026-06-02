import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Music | Gareth Furnell',
  description: 'Ableton projects and original music.',
};

export default function MusicPage() {
  const tracks = [
    {
      id: 1,
      title: 'Project Beta (Placeholder)',
      description: 'An ambient exploration using granular synthesis.',
      audioSrc: '', // e.g., '/audio/project-alpha.mp3'
      image: '/images/music/ambient.png'
    },
    {
      id: 2,
      title: 'Dub Techno Track 1',
      description: 'First attempt at a 909 dub techno track. using the analog synthesizer',
      audioSrc: '/music/dub-techno-track1.mp3',
      image: '/images/music/techno.png'
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
            Ableton Projects
          </h2>
          <p className="text-zinc-400 max-w-2xl text-lg">
            A collection of my original music and audio experiments.
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

              <div className="p-6 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800/80">
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
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
