'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function Accordion({ title, subtitle, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="w-full bg-[#023430]/40 border border-[#00684A] rounded-2xl overflow-hidden backdrop-blur-sm transition-colors hover:border-[#00ED64]/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
      >
        <div>
          <h3 className="text-xl font-medium text-white">{title}</h3>
          {subtitle && <p className="text-[#00ED64]/70 text-sm mt-1">{subtitle}</p>}
        </div>
        <div
          className={`text-[#00ED64] transition-transform duration-300 ease-in-out ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <ChevronDown size={24} />
        </div>
      </button>
      
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 pt-0 border-t border-[#00684A]/30 mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
