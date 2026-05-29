'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function InteractiveEye() {
  const svgRef = useRef<SVGSVGElement>(null);
  const irisRef = useRef<SVGGElement>(null);
  const highlightRef = useRef<SVGGElement>(null);
  const [isMouseActive, setIsMouseActive] = useState(false);

  // Clear inline transforms when mouse becomes inactive so CSS keyframe animations can run
  useEffect(() => {
    if (!isMouseActive) {
      if (irisRef.current) {
        irisRef.current.style.transform = '';
        irisRef.current.removeAttribute('transform');
      }
      if (highlightRef.current) {
        highlightRef.current.style.transform = '';
        highlightRef.current.removeAttribute('transform');
      }
    }
  }, [isMouseActive]);

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const handlePointerMove = (e: PointerEvent) => {
      // Re-enable mouse tracking
      setIsMouseActive(true);

      // Reset idle timer
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsMouseActive(false);
      }, 3000); // 3 seconds of inactivity triggers auto-movement

      if (!svgRef.current || !irisRef.current || !highlightRef.current) return;

      // Get bounding box of the eye SVG
      const rect = svgRef.current.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Validate pointer coordinates
      if (typeof e.clientX !== 'number' || typeof e.clientY !== 'number' || isNaN(e.clientX) || isNaN(e.clientY)) return;

      // Calculate vector from eye center to pointer position
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Max movement radius for the iris inside the sclera
      const maxMove = 20;

      // Angle of the cursor relative to center
      const angle = Math.atan2(dy, dx);

      // Scale distance down so movement is subtle and progressive
      const scaleFactor = 0.08;
      const currentMove = Math.min(distance * scaleFactor, maxMove);

      // Calculate translation coordinates
      const moveX = Math.cos(angle) * currentMove;
      const moveY = Math.sin(angle) * currentMove;

      // Validate translation results
      if (isNaN(moveX) || isNaN(moveY)) return;

      // Apply SVG transform attribute (safer in Safari and correct SVG spec)
      irisRef.current.setAttribute('transform', `translate(${moveX}, ${moveY})`);

      // Parallax effect: major highlights move slightly slower/less to simulate depth
      const highlightX = moveX * 0.45;
      const highlightY = moveY * 0.45;
      if (!isNaN(highlightX) && !isNaN(highlightY)) {
        highlightRef.current.setAttribute('transform', `translate(${highlightX}, ${highlightY})`);
      }
    };

    // Listen at the window level for fluid tracking across the entire screen
    window.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      clearTimeout(idleTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-8 select-none">
      {/* Glow Backdrop */}
      <div className="relative w-48 h-28 flex items-center justify-center">
        <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <svg
          ref={svgRef}
          viewBox="0 0 200 120"
          className="w-full h-full cursor-pointer drop-shadow-[0_0_15px_rgba(34,211,238,0.15)]"
        >
          <defs>
            {/* Iris Radial Gradient (Premium Cyan Glow) */}
            <radialGradient id="iris-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#67e8f9" /> {/* cyan-300 */}
              <stop offset="45%" stopColor="#0891b2" /> {/* cyan-600 */}
              <stop offset="85%" stopColor="#0e7490" /> {/* cyan-700 */}
              <stop offset="100%" stopColor="#0f172a" /> {/* slate-900 */}
            </radialGradient>

            {/* Specular Highlight Gradient */}
            <linearGradient id="highlight-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
            </linearGradient>

            {/* Clip path representing the inner boundary of the eyelids */}
            <clipPath id="eyeball-clip">
              <path
                d="M 20 60 Q 100 12 180 60 Q 100 108 20 60 Z"
                className="blink-element"
                style={{ transformOrigin: '100px 60px' }}
              />
            </clipPath>
          </defs>

          {/* Eye Crease Top (Thin aesthetic layout line) */}
          <path
            d="M 35 32 Q 100 -2 165 32"
            fill="none"
            stroke="rgba(63, 63, 70, 0.4)"
            strokeWidth="1.5"
          />

          {/* Sclera Backdrop (White of the eye - stylized to very dark slate/black) */}
          <path
            d="M 20 60 Q 100 12 180 60 Q 100 108 20 60 Z"
            fill="#09090b"
            stroke="rgba(63, 63, 70, 0.2)"
            strokeWidth="1"
          />

          {/* Masked Eyeball Contents */}
          <g clipPath="url(#eyeball-clip)">
            {/* Tiny radial grid lines inside sclera for premium tech-art detail */}
            <circle cx="100" cy="60" r="85" fill="none" stroke="rgba(34, 211, 238, 0.03)" strokeWidth="0.5" />
            <circle cx="100" cy="60" r="70" fill="none" stroke="rgba(34, 211, 238, 0.02)" strokeWidth="0.5" />

            {/* Dynamic Group: Iris & Pupil (moves with cursor tracking or auto-animation) */}
            <g
              ref={irisRef}
              className={!isMouseActive ? 'animate-[autoLook_8s_infinite_ease-in-out]' : ''}
              style={{
                transition: isMouseActive ? 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
                transformOrigin: '100px 60px',
              }}
            >
              {/* Iris */}
              <circle cx="100" cy="60" r="32" fill="url(#iris-glow)" />

              {/* Iris inner detail ring */}
              <circle cx="100" cy="60" r="24" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

              {/* Pupil */}
              <circle cx="100" cy="60" r="16" fill="#000000" />
              
              {/* Secondary Specular Highlight (Moves with iris, inside pupil) */}
              <circle cx="107" cy="53" r="1.5" fill="rgba(255, 255, 255, 0.4)" />
            </g>

            {/* Parallax Group: Major Specular Highlights (Moves slower to simulate 3D cornea curvature) */}
            <g
              ref={highlightRef}
              className={!isMouseActive ? 'animate-[autoLookParallax_8s_infinite_ease-in-out]' : ''}
              style={{
                transition: isMouseActive ? 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
                transformOrigin: '100px 60px',
              }}
            >
              <ellipse cx="91" cy="51" rx="4.5" ry="3" fill="url(#highlight-grad)" transform="rotate(-30, 91, 51)" />
            </g>
          </g>

          {/* Eyelids Outline (Blinks organically using CSS scaleY animation) */}
          <path
            d="M 20 60 Q 100 12 180 60 Q 100 108 20 60 Z"
            fill="none"
            stroke="#27272a"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="blink-element"
            style={{ transformOrigin: '100px 60px' }}
          />

          {/* Eye Crease Bottom */}
          <path
            d="M 45 88 Q 100 112 155 88"
            fill="none"
            stroke="rgba(63, 63, 70, 0.25)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Global CSS Inject for Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Blink Animation */
        @keyframes blink {
          0%, 88%, 92%, 96%, 100% {
            transform: scaleY(1);
          }
          90%, 94% {
            transform: scaleY(0.03);
          }
        }
        
        .blink-element {
          animation: blink 5.5s infinite ease-in-out;
        }

        /* Auto looking around (mobile or idle) */
        @keyframes autoLook {
          0%, 100% { transform: translate(0px, 0px); }
          8% { transform: translate(-14px, -2px); }
          16% { transform: translate(-14px, -2px); }
          24% { transform: translate(12px, 6px); }
          32% { transform: translate(12px, 6px); }
          40% { transform: translate(0px, 0px); }
          48% { transform: translate(-6px, 12px); }
          56% { transform: translate(14px, -6px); }
          64% { transform: translate(14px, -6px); }
          72% { transform: translate(0px, -10px); }
          80% { transform: translate(-10px, -6px); }
          88% { transform: translate(0px, 0px); }
        }

        /* Parallax highlights following the look-around motion at a reduced rate */
        @keyframes autoLookParallax {
          0%, 100% { transform: translate(0px, 0px); }
          8% { transform: translate(-6.3px, -0.9px); }
          16% { transform: translate(-6.3px, -0.9px); }
          24% { transform: translate(5.4px, 2.7px); }
          32% { transform: translate(5.4px, 2.7px); }
          40% { transform: translate(0px, 0px); }
          48% { transform: translate(-2.7px, 5.4px); }
          56% { transform: translate(6.3px, -2.7px); }
          64% { transform: translate(6.3px, -2.7px); }
          72% { transform: translate(0px, -4.5px); }
          80% { transform: translate(-4.5px, -2.7px); }
          88% { transform: translate(0px, 0px); }
        }
      `}} />
    </div>
  );
}
