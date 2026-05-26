import Link from 'next/link';

export const metadata = {
  title: 'Music | Gareth Furnell',
  description: 'Ableton projects and original music.',
};

export default function MusicPage() {
  const tracks = [
    {
      id: 1,
      title: 'Project Alpha (Placeholder)',
      description: 'An ambient exploration using granular synthesis.',
      audioSrc: '', // e.g., '/audio/project-alpha.mp3'
    },
    {
      id: 2,
      title: 'Neon Nights (Placeholder)',
      description: 'Synthwave inspired by 80s aesthetics.',
      audioSrc: '', // e.g., '/audio/neon-nights.mp3'
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

        <div className="flex flex-col gap-6">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col gap-4 transition-all duration-300 hover:border-zinc-600"
            >
              <div>
                <h3 className="text-xl font-medium text-zinc-100">{track.title}</h3>
                <p className="text-zinc-400 mt-1">{track.description}</p>
              </div>

              <div className="w-full bg-black rounded-xl p-4 border border-zinc-800">
                {/* Custom Audio Player Placeholder */}
                {track.audioSrc ? (
                  <audio
                    controls
                    className="w-full h-10 custom-audio-player"
                    src={track.audioSrc}
                  >
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <div className="flex items-center justify-center h-10 text-zinc-500 text-sm italic">
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
