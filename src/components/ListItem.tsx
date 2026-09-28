import Link from 'next/link';
import React from 'react';

interface ListItemProps {
  title: string;
  subtitle: string;
  href: string;
  linkText?: string;
  icon?: React.ReactNode;
}

export default function ListItem({ title, subtitle, href, linkText = 'See more', icon }: ListItemProps) {
  return (
    <li className="list-none group h-full">
      <Link
        href={href}
        className="flex flex-col justify-between h-full p-5 sm:p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-900/60 hover:border-zinc-700/80 transition-all duration-300 ease-in-out hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {icon && (
              <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 bg-white rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                {icon}
              </div>
            )}
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-zinc-100 group-hover:text-white transition-colors duration-300 truncate">
              {title}
            </h2>
          </div>
          <div className="flex items-center text-xs sm:text-sm font-medium text-zinc-400 group-hover:text-white transition-colors duration-300 shrink-0 pt-1">
            <span className="hidden sm:inline mr-1">{linkText}</span>
            <svg
              className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <p className="text-sm sm:text-base text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300">
          {subtitle}
        </p>
      </Link>
    </li>
  );
}
