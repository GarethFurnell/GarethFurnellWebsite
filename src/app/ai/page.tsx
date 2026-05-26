import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'AI & Antigravity | Gareth Furnell',
  description: 'Documenting the AI coding process using Google Gemini and Antigravity.',
};

export default function AIPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800">
      <header className="w-full max-w-4xl mx-auto px-6 py-12 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white hover:opacity-80 transition-opacity">
          ← Back
        </Link>
        <h1 className="text-xl font-medium text-zinc-400">AI Collaboration</h1>
      </header>

      <main className="w-full max-w-4xl mx-auto px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-6">
            Agentic Coding with Antigravity
          </h2>
          <p className="text-zinc-400 max-w-2xl text-lg mb-8 leading-relaxed">
            This portfolio isn&apos;t just a display of work; it&apos;s a living experiment in modern web development.
            I build and iterate on this site collaboratively with an AI agent powered by Google Gemini, known as Antigravity.
          </p>
        </div>

        <div className="relative w-full aspect-[4/3] sm:aspect-video mb-12 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
          <Image
            src="/Gemini-Google-Logo.jpg"
            alt="Gemini Logo"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        <div className="prose prose-invert prose-zinc max-w-none">
          <h3 className="text-2xl font-medium text-zinc-200 mb-4">The Workflow</h3>
          <p className="text-zinc-400 leading-relaxed mb-6">
            Our workflow bridges human creativity with machine execution. By connecting my local workspace directly to the AI through a secure GitHub connection and specialised tools, I can express high-level architectural goals or aesthetic desires. In response, Antigravity plans the implementation, writes the React/Next.js code, modifies configurations, and even generates bespoke assets—like the visualization above.
          </p>

          <h3 className="text-2xl font-medium text-zinc-200 mb-4">Continuous Evolution</h3>
          <p className="text-zinc-400 leading-relaxed">
            What makes this approach powerful is the iterative nature of it. When I return to this project, I don&apos;t have to remember exactly where every component lives. I simply describe the new feature—be it embedding a music player or adding a new research page—and we work together to integrate it seamlessly into the existing design system. It is pair programming where the AI has hands on the keyboard.
          </p>
        </div>
      </main>
    </div>
  );
}
