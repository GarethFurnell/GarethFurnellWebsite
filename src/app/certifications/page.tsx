import Link from 'next/link';
import { getImages } from '@/utils/getImages';
import ImageGallery from '@/components/ImageGallery';

export const metadata = {
  title: 'Certifications | Gareth Furnell',
  description: 'MongoDB and Google Cloud Certificates',
};

export default function CertificationsPage() {
  const mongodbImages = getImages('certifications/mongodb');
  const googleImages = getImages('certifications/google');

  const emptyMsg = "Currently studying for the next one!";

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800">
      <header className="w-full max-w-6xl mx-auto px-6 py-12 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white hover:opacity-80 transition-opacity">
          ← Back
        </Link>
        <h1 className="text-xl font-medium text-zinc-400">Certifications</h1>
      </header>

      <main className="w-full max-w-6xl mx-auto px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-16">
          <h2 className="font-handscript text-4xl sm:text-5xl font-bold tracking-wide text-white mb-4">
            Professional Certifications
          </h2>
          <p className="text-zinc-400 max-w-2xl text-lg">
            A collection of my technical certificates validating my expertise and ongoing learning journey.
          </p>
        </div>

        <div className="flex flex-col gap-24">
          <section>
            <h3 className="font-handscript text-2xl sm:text-3xl font-bold tracking-wide text-white mb-8 border-b border-zinc-900 pb-4">
              MongoDB
            </h3>
            <ImageGallery images={mongodbImages} layout="grid" emptyMessage={emptyMsg} />
          </section>

          <section>
            <h3 className="font-handscript text-2xl sm:text-3xl font-bold tracking-wide text-white mb-8 border-b border-zinc-900 pb-4">
              Google Cloud
            </h3>
            <ImageGallery images={googleImages} layout="grid" emptyMessage={emptyMsg} />
          </section>
        </div>
      </main>
    </div>
  );
}
