import Link from 'next/link';
import { getImages } from '@/utils/getImages';
import ImageGallery from '@/components/ImageGallery';

export const metadata = {
  title: 'Google Cloud | Gareth Furnell',
  description: 'Google Cloud Certificates',
};

export default function GooglePage() {
  const googleImages = getImages('certifications/google');

  return (
    <div className="min-h-screen text-white font-sans selection:bg-blue-500/30">
      

      <main className="w-full w-full px-6 md:px-12 lg:px-24 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Professional Certifications
          </h2>
          <p className="text-zinc-400 max-w-2xl text-lg">
            A collection of my technical certificates validating my expertise and ongoing learning journey within the Google Cloud ecosystem.
          </p>
        </div>

        <section>
          <ImageGallery images={googleImages} layout="grid" emptyMessage="Currently studying for the next one!" />
        </section>
      </main>
    </div>
  );
}
