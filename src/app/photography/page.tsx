import { getImages } from '@/utils/getImages';
import PhotographyClient from './PhotographyClient';

export const metadata = {
  title: 'Photography | Gareth F',
  description: 'Film Photos and 35mm Snapshots',
};

export default function PhotographyPage() {
  const golfImages = getImages('photography/golf');
  const motorcycleImages = getImages('photography/motorcycle');
  const natureImages = getImages('photography/nature');
  const bwImages = getImages('photography/bw');

  return (
    <div className="min-h-screen text-white font-sans selection:bg-zinc-800">
      <main className="w-full w-full px-6 md:px-12 lg:px-24 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <PhotographyClient 
          golfImages={golfImages}
          motorcycleImages={motorcycleImages}
          natureImages={natureImages}
          bwImages={bwImages}
        />
      </main>
    </div>
  );
}
