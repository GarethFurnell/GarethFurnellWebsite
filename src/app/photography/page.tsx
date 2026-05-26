import Link from 'next/link';
import { getImages } from '@/utils/getImages';
import ImageGallery from '@/components/ImageGallery';

export const metadata = {
  title: 'Photography | Gareth Furnell',
  description: 'Film Photos and 35mm Snapshots',
};

export default function PhotographyPage() {
  const golfImages = getImages('photography/golf');
  const motorcycleImages = getImages('photography/motorcycle');
  const natureImages = getImages('photography/nature');

  const emptyMsg = "Out in the field taking pictures or the negatives are currently being developed";

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800">
      <header className="w-full max-w-6xl mx-auto px-6 py-12 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white hover:opacity-80 transition-opacity">
          ← Back
        </Link>
        <h1 className="text-xl font-medium text-zinc-400">Photography</h1>
      </header>

      <main className="w-full max-w-6xl mx-auto px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-16">
          <h2 className="font-handscript text-4xl sm:text-5xl font-bold tracking-wide text-white mb-4">
            Film & 35mm
          </h2>
          <p className="text-zinc-400 max-w-2xl text-lg">
            A curated selection of my film photography. Capturing moments and exploring visual aesthetics through the lens of a 35mm camera.
          </p>
        </div>

        <div className="flex flex-col gap-24">
          <section>
            <h3 className="font-handscript text-2xl sm:text-3xl font-bold tracking-wide text-white mb-8 border-b border-zinc-900 pb-4">
              Golf
            </h3>
            <ImageGallery images={golfImages} layout="masonry" emptyMessage={emptyMsg} />
          </section>

          <section>
            <h3 className="font-handscript text-2xl sm:text-3xl font-bold tracking-wide text-white mb-8 border-b border-zinc-900 pb-4">
              Motorcycles
            </h3>
            <ImageGallery images={motorcycleImages} layout="masonry" emptyMessage={emptyMsg} />
          </section>

          <section>
            <h3 className="font-handscript text-2xl sm:text-3xl font-bold tracking-wide text-white mb-8 border-b border-zinc-900 pb-4">
              Nature
            </h3>
            <ImageGallery images={natureImages} layout="masonry" emptyMessage={emptyMsg} />
          </section>
        </div>
      </main>
    </div>
  );
}
