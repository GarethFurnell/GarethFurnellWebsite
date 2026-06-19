import Link from 'next/link';
import ListItem from '@/components/ListItem';
import InteractiveEye from '@/components/InteractiveEye';
import HomeCarousel from '@/components/HomeCarousel';

export default function Home() {
  return (
    <div className="min-h-screen text-white selection:bg-zinc-800 selection:text-white flex flex-col font-sans">
      

      <main className="flex-1 w-full px-6 md:px-12 lg:px-24 pb-24">
        <InteractiveEye />

        <ul className="flex flex-col gap-2 mt-8">
          <ListItem
            title="MongoDB"
            subtitle="AI Vector Search & 3D Graph"
            href="/mongodb"
            icon={
              <svg viewBox="0 0 100 100" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
                <path fill="#47A248" d="M50 0C50 0 25 30 25 60C25 80 40 95 50 95C60 95 75 80 75 60C75 30 50 0 50 0Z" />
                <path fill="#3B8B3B" d="M50 0C50 0 75 30 75 60C75 80 60 95 50 95V0Z" />
                <path fill="#A3D4A3" d="M50 20L48 95C48 95 50 96 52 95L50 20Z" />
              </svg>
            }
          />
          <ListItem
            title="Google Cloud"
            subtitle="Professional Cloud Certifications"
            href="/google"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            }
          />

          <div className="my-10">
            <HomeCarousel />
          </div>

          <ListItem
            title="Photography"
            subtitle="Film Photos / 35mm"
            href="/photography"
          />
          <ListItem
            title="Cinematography"
            subtitle="Short Films & VFX"
            href="/cinematography"
          />
          <ListItem
            title="AI"
            subtitle="Agentic Coding & Automation"
            href="/ai"
          />
          <ListItem
            title="Music"
            subtitle="Ableton Projects & Audio"
            href="/music"
          />
        </ul>
      </main>

      
    </div>
  );
}
