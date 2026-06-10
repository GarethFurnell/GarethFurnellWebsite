import Link from 'next/link';

export const metadata = {
  title: 'Cinematography | Gareth Furnell',
  description: 'Selected cinematic video works and short films.',
};

export default function CinematographyPage() {
  const videos = [
    {
      id: 1,
      title: 'Saving Her',
      description: 'A cinematic short piece.',
      url: 'https://www.dropbox.com/scl/fi/nnaqm4h1xpl5wychkxag7/Saving-Her.mov?rlkey=njm9euo6nxs9qllvf8psa3as4&st=pdztmx03&raw=1',
    },
    {
      id: 2,
      title: 'Rom Immortal',
      description: 'Visual exploration and visual effects.',
      url: 'https://www.dropbox.com/scl/fi/uhlsfiuy722cldzrdegm9/rom_immortal_LF_MZ_v05.mov?rlkey=l7uh7intslegkhte9psjuz1lr&st=rl2m3nu3&raw=1',
    }
  ];

  return (
    <div className="min-h-screen text-white font-sans selection:bg-zinc-800">
      <header className="w-full w-full px-6 md:px-12 lg:px-24 py-12 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white hover:opacity-80 transition-opacity">
          ← Back
        </Link>
        <h1 className="text-xl font-medium text-zinc-400">Cinematography</h1>
      </header>

      <main className="w-full w-full px-6 md:px-12 lg:px-24 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Cinematic Video
          </h2>
          <p className="text-zinc-400 max-w-2xl text-lg">
            High-fidelity video projects streaming directly from the cloud.
          </p>
        </div>

        <div className="flex flex-col gap-16">
          {videos.map((video) => (
            <div key={video.id} className="flex flex-col gap-4 group">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:border-zinc-600 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                <video 
                  controls 
                  preload="metadata"
                  className="w-full h-full object-cover"
                  controlsList="nodownload"
                >
                  <source src={video.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="px-2">
                <h3 className="text-2xl font-semibold text-white drop-shadow-md">{video.title}</h3>
                <p className="text-zinc-400 mt-1 drop-shadow-md">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
