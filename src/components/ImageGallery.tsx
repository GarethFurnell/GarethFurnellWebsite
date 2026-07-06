"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  layout: 'grid' | 'masonry';
  emptyMessage?: string;
  isPurchaseMode?: boolean;
}

import { resolveImagePath } from '@/utils/resolveImagePath';

const getImagePath = (src: string) => {
  return resolveImagePath(src);
};

export default function ImageGallery({ images, layout, emptyMessage, isPurchaseMode = false }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cartAdded, setCartAdded] = useState(false);

  // Close lightbox on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (images.length === 0) {
    return (
      <div className="text-zinc-500 py-12 text-center text-lg italic">
        {emptyMessage || "No images found. Add some images to the folder to see them here."}
      </div>
    );
  }

  return (
    <>
      <div
        className={
          layout === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            : "columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6"
        }
      >
        {images.map((src, index) => (
          <div
            key={index}
            className={`relative group cursor-pointer overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:border-zinc-600 ${layout === 'masonry' ? 'break-inside-avoid mb-6' : 'aspect-square'}`}
            onClick={() => setSelectedImage(src)}
          >
            {layout === 'grid' ? (
              <Image
                src={getImagePath(src)}
                alt={`Gallery image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              /* For masonry we need a standard img to retain natural height */
              <img
                src={getImagePath(src)}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            )}

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
              <span className={`opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-white backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium ${isPurchaseMode ? 'bg-green-600/80 shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'bg-black/50'}`}>
                {isPurchaseMode ? 'Purchase Print' : 'Enlarge'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / MacBook Quick Look style */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row ${isPurchaseMode ? 'bg-zinc-950' : ''}`}>
              <div className={`relative ${isPurchaseMode ? 'w-full md:w-2/3 lg:w-3/4 h-1/2 md:h-full' : 'w-full h-full'}`}>
                <Image
                  src={getImagePath(selectedImage)}
                  alt="Enlarged view"
                  fill
                  className="object-contain"
                  quality={100}
                />
              </div>

              {isPurchaseMode && (
                <div className="w-full md:w-1/3 lg:w-1/4 h-1/2 md:h-full bg-zinc-900 border-t md:border-t-0 md:border-l border-zinc-800 p-8 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Fine Art Print</h3>
                  <p className="text-zinc-400 mb-8">High quality 35mm film scan printed on archival photographic paper. Ships worldwide.</p>
                  
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Select Size</label>
                    <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-green-500">
                      <option>8" x 10" (Standard)</option>
                      <option>11" x 14" (Medium)</option>
                      <option>16" x 20" (Large)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-zinc-800">
                    <span className="text-zinc-400">Total</span>
                    <span className="text-3xl font-bold text-white">$500</span>
                  </div>

                  <button 
                    onClick={() => { setCartAdded(true); setTimeout(() => setCartAdded(false), 3000); }}
                    className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg ${cartAdded ? 'bg-green-600 text-white shadow-green-900/50' : 'bg-white text-black hover:bg-zinc-200'}`}
                  >
                    {cartAdded ? 'Added to Cart ✓' : 'Add to Cart'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
