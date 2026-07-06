"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import AudioVisualizer from '@/components/AudioVisualizer';

const tracks = [
  {
    id: 1,
    title: 'Dusk',
    type: 'Latest Release • EP',
    audioSrc: '/music/dub-techno-track1.mp3', 
    image: '/images/music/ambient.png',
  },
  {
    id: 2,
    title: 'Lost Tales, Vol. 1',
    type: '2025 • EP',
    audioSrc: '/music/dub-techno-track1.mp3',
    image: '/images/music/techno.png',
  },
  {
    id: 3,
    title: 'Zephyr',
    type: '2022 • Album',
    audioSrc: '/music/dub-techno-track1.mp3',
    image: '/images/music/ambient.png',
  },
  {
    id: 4,
    title: 'Old One',
    type: '2024 • Single',
    audioSrc: '/music/dub-techno-track1.mp3',
    image: '/images/music/techno.png',
  },
  {
    id: 5,
    title: 'Wildflower',
    type: '2026 • Single',
    audioSrc: '/music/dub-techno-track1.mp3',
    image: '/images/music/ambient.png',
  },
  {
    id: 6,
    title: 'Nightfall',
    type: '2023 • Single',
    audioSrc: '/music/dub-techno-track1.mp3',
    image: '/images/music/techno.png',
  }
];

export default function MusicClient() {
  const [currentTrack, setCurrentTrack] = useState<typeof tracks[0] | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = (track: typeof tracks[0]) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
    } else {
      setCurrentTrack(track);
      // Wait for React to mount the new src and then play
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log('Autoplay prevented', e));
        }
      }, 0);
    }
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-zinc-800 relative z-10">
      <AudioVisualizer audioId="global-audio" />

      <main className="relative w-full px-6 md:px-12 lg:px-24 pt-12 pb-48 animate-in fade-in slide-in-from-bottom-4 duration-700 z-10">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4 drop-shadow-lg">
            Ambient & Audio
          </h2>
          <p className="text-zinc-300 max-w-2xl text-lg drop-shadow-lg">
            A collection of my original music, shifting focus towards deep ambient soundscapes and generative audio.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10">
          {tracks.map((track) => (
            <div key={track.id} className="flex flex-col gap-3 group cursor-pointer" onClick={() => togglePlay(track)}>
              <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl">
                <Image
                  src={track.image}
                  alt={track.title}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-50"
                />
                
                {/* Play Button Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${currentTrack?.id === track.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <button className="w-14 h-14 flex items-center justify-center rounded-full bg-[#00ED64] text-black shadow-[0_0_20px_rgba(0,237,100,0.4)] hover:scale-110 transition-transform">
                    {currentTrack?.id === track.id && isPlaying ? (
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                         <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
                       </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 translate-x-0.5">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm truncate">{track.title}</h3>
                <p className="text-zinc-400 text-xs mt-0.5 truncate">{track.type}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Global Player Bar */}
      <div className={`fixed bottom-0 left-0 w-full bg-zinc-950/70 backdrop-blur-xl border-t border-zinc-800 p-4 px-6 md:px-12 z-50 transition-transform duration-500 ${currentTrack ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-1/3">
            {currentTrack && (
              <>
                <div className="relative w-14 h-14 rounded-md overflow-hidden shrink-0 shadow-lg">
                  <Image src={currentTrack.image} alt={currentTrack.title} fill className="object-cover" />
                </div>
                <div className="truncate">
                  <div className="text-white font-bold text-sm truncate">{currentTrack.title}</div>
                  <div className="text-zinc-400 text-xs truncate">{currentTrack.type}</div>
                </div>
              </>
            )}
          </div>

          <div className="w-full md:w-1/3 flex justify-center">
             <audio
                id="global-audio"
                ref={audioRef}
                controls
                controlsList="nodownload"
                className="w-full max-w-md h-10 outline-none rounded-full"
                src={currentTrack?.audioSrc}
                crossOrigin="anonymous"
              >
                Your browser does not support the audio element.
              </audio>
          </div>
          
          <div className="hidden md:block md:w-1/3"></div>
        </div>
      </div>
    </div>
  );
}
