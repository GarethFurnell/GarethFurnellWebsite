import Link from 'next/link';

interface ListItemProps {
  title: string;
  subtitle: string;
  href: string;
  linkText?: string;
}

export default function ListItem({ title, subtitle, href, linkText = 'See more' }: ListItemProps) {
  return (
    <li className="group border-b border-zinc-800 last:border-b-0">
      <Link
        href={href}
        className="flex flex-col sm:flex-row sm:items-center justify-between py-6 px-4 rounded-2xl transition-all duration-300 ease-in-out hover:bg-zinc-900/50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
      >
        <div className="flex flex-col gap-1 mb-4 sm:mb-0">
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-zinc-100 group-hover:text-white transition-colors duration-300">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center text-sm font-medium text-zinc-400 group-hover:text-white transition-colors duration-300">
          <span>{linkText}</span>
          <svg
            className="w-4 h-4 ml-2 transform transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </li>
  );
}
