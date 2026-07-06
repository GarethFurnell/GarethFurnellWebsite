"use client";

import { useState } from 'react';
import ImageGallery from '@/components/ImageGallery';

interface PhotographyClientProps {
  golfImages: string[];
  motorcycleImages: string[];
  natureImages: string[];
  bwImages: string[];
}

export default function PhotographyClient({ golfImages, motorcycleImages, natureImages, bwImages }: PhotographyClientProps) {
  const [isPurchaseMode, setIsPurchaseMode] = useState(false);
  const emptyMsg = "Out in the field taking pictures or the negatives are currently being developed";

  return (
    <>
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Film & 35mm
          </h2>
          <p className="text-zinc-400 max-w-2xl text-lg">
            A curated selection of my film photography. Capturing moments and exploring visual aesthetics through the lens of a 35mm camera.
          </p>
        </div>
        
        {/* Purchase Prints Toggle UI */}
        <div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-full border border-zinc-800 backdrop-blur-md">
          <span className={`text-sm font-medium px-4 py-2 rounded-full transition-colors cursor-pointer whitespace-nowrap text-center ${!isPurchaseMode ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`} onClick={() => setIsPurchaseMode(false)}>Gallery Mode</span>
          <span className={`text-sm font-medium px-4 py-2 rounded-full transition-colors cursor-pointer whitespace-nowrap text-center ${isPurchaseMode ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.5)]' : 'text-zinc-400 hover:text-white'}`} onClick={() => setIsPurchaseMode(true)}>Purchase Prints</span>
        </div>
      </div>

      <div className="flex flex-col gap-24">
        {/* Black & White Section */}
        <section>
          <h3 className="text-2xl font-medium tracking-tight text-white mb-8 border-b border-zinc-900 pb-4">
            Black & White
          </h3>
          <ImageGallery images={bwImages} layout="masonry" emptyMessage={emptyMsg} isPurchaseMode={isPurchaseMode} />
        </section>

        <section>
          <h3 className="text-2xl font-medium tracking-tight text-white mb-8 border-b border-zinc-900 pb-4">
            Golf
          </h3>
          <ImageGallery images={golfImages} layout="masonry" emptyMessage={emptyMsg} isPurchaseMode={isPurchaseMode} />
        </section>

        <section>
          <h3 className="text-2xl font-medium tracking-tight text-white mb-8 border-b border-zinc-900 pb-4">
            Nature
          </h3>
          <ImageGallery images={natureImages} layout="masonry" emptyMessage={emptyMsg} isPurchaseMode={isPurchaseMode} />
        </section>

        <section>
          <h3 className="text-2xl font-medium tracking-tight text-white mb-8 border-b border-zinc-900 pb-4">
            Motorcycles
          </h3>
          <ImageGallery images={motorcycleImages} layout="masonry" emptyMessage={emptyMsg} isPurchaseMode={isPurchaseMode} />
        </section>
      </div>
    </>
  );
}
