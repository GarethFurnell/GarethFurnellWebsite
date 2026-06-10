import Link from 'next/link';

export const metadata = {
  title: 'Contact | Gareth Furnell',
  description: 'Get in touch and find my social links.',
};

export default function ContactPage() {
  const platforms = [
    {
      name: 'LinkedIn',
      url: '#', // Add your link here
      hoverColor: 'hover:text-[#0A66C2] hover:border-[#0A66C2] hover:shadow-[0_0_15px_rgba(10,102,194,0.4)]',
      iconColor: 'group-hover:text-[#0A66C2]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      )
    },
    {
      name: 'GitHub',
      url: '#', // Add your link here
      hoverColor: 'hover:text-white hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]',
      iconColor: 'group-hover:text-white',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
          <path d="M9 18c-4.51 2-5-2-7-2"></path>
        </svg>
      )
    },
    {
      name: 'YouTube',
      url: '#', // Add your link here
      hoverColor: 'hover:text-[#FF0000] hover:border-[#FF0000] hover:shadow-[0_0_15px_rgba(255,0,0,0.4)]',
      iconColor: 'group-hover:text-[#FF0000]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
        </svg>
      )
    },
    {
      name: 'Instagram',
      url: '#', // Add your link here
      hoverColor: 'hover:text-[#E1306C] hover:border-[#E1306C] hover:shadow-[0_0_15px_rgba(225,48,108,0.4)]',
      iconColor: 'group-hover:text-[#E1306C]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      )
    },
    {
      name: 'Pinterest',
      url: '#', // Add your link here
      hoverColor: 'hover:text-[#E60023] hover:border-[#E60023] hover:shadow-[0_0_15px_rgba(230,0,35,0.4)]',
      iconColor: 'group-hover:text-[#E60023]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 4.25 2.65 7.9 6.44 9.34-.1-.8-.18-2.03.04-2.92.2-.84 1.28-5.4 1.28-5.4s-.32-.65-.32-1.6c0-1.5.87-2.62 1.95-2.62.91 0 1.35.68 1.35 1.5 0 .91-.58 2.27-.88 3.53-.25 1.05.53 1.9 1.56 1.9 1.87 0 3.32-1.97 3.32-4.8 0-2.5-1.8-4.24-4.36-4.24-2.95 0-4.68 2.22-4.68 4.5 0 .89.34 1.84.77 2.36.08.1.1.18.07.3l-.25 1c-.04.14-.13.17-.28.1C6.2 13.68 5.6 11.83 5.6 10.15c0-3.15 2.3-6.04 6.6-6.04 3.47 0 6.16 2.47 6.16 5.76 0 3.44-2.17 6.22-5.18 6.22-1.01 0-1.96-.53-2.28-1.14l-.62 2.37c-.22.86-.83 1.93-1.24 2.58 1.08.33 2.23.51 3.42.51 5.52 0 10-4.48 10-10S17.52 2 12 2z"></path>
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen text-white font-sans selection:bg-zinc-800">
      <header className="w-full max-w-4xl mx-auto px-6 py-12 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white hover:opacity-80 transition-opacity">
          ← Back
        </Link>
        <h1 className="text-xl font-medium text-zinc-400">Contact</h1>
      </header>

      <main className="w-full max-w-4xl mx-auto px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Get in touch
          </h2>
          <p className="text-zinc-400 max-w-2xl text-lg">
            Find me on the platforms below. Feel free to reach out or explore my other work.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {platforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col items-center justify-center gap-4 p-8 bg-zinc-900 border border-zinc-800 rounded-2xl transition-all duration-300 hover:bg-zinc-800 hover:scale-[1.02] ${platform.hoverColor}`}
            >
              <div className={`p-4 bg-black rounded-full text-zinc-400 transition-colors duration-300 shadow-sm group-hover:shadow-md ${platform.iconColor}`}>
                {platform.icon}
              </div>
              <span className="text-lg font-medium text-zinc-300 group-hover:text-inherit transition-colors duration-300">
                {platform.name}
              </span>
            </a>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-4">
            Recent Videos
          </h2>
          <p className="text-zinc-400 max-w-2xl text-lg">
            Check out some of my latest YouTube content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/R9JHC4t_cJE"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/vg_fECFwUuU"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/GprmHqz1i-c"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </main>
    </div>
  );
}
