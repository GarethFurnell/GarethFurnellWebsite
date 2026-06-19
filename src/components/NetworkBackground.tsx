'use client';

import React, { useEffect, useRef } from 'react';

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  canvasWidth: number;
  canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number, color: string) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    // Slow, subtle movement
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 2 + 1; // 1px to 3px radius
    this.color = color;
  }

  update(mouseX: number, mouseY: number) {
    // Basic movement
    this.x += this.vx;
    this.y += this.vy;

    // Edge bouncing
    if (this.x < 0 || this.x > this.canvasWidth) this.vx *= -1;
    if (this.y < 0 || this.y > this.canvasHeight) this.vy *= -1;

    // Magnetic Mouse effect
    if (mouseX !== -1000 && mouseY !== -1000) {
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const magnetRadius = 150;

      if (distance < magnetRadius) {
        // Gentle pull towards mouse
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const force = (magnetRadius - distance) / magnetRadius; 
        
        // Adjust velocity smoothly
        this.vx += forceDirectionX * force * 0.05;
        this.vy += forceDirectionY * force * 0.05;
      }
    }

    // Apply friction to prevent them from flying out of control after magnetic pull
    const maxSpeed = 1.5;
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (currentSpeed > maxSpeed) {
      this.vx = (this.vx / currentSpeed) * maxSpeed;
      this.vy = (this.vy / currentSpeed) * maxSpeed;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

interface NetworkBackgroundProps {
  theme?: 'light' | 'dark'; // 'light' means light nodes (for dark background), 'dark' means dark nodes (for light background)
  className?: string; // Optional className override for absolute positioning inside headers
}

export default function NetworkBackground({ theme = 'light', className = "fixed top-0 left-0 w-full h-full -z-50 pointer-events-none opacity-60" }: NetworkBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Mouse tracking
    let mouseX = -1000;
    let mouseY = -1000;

    const nodeColor = theme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
    const rgbLine = theme === 'light' ? '255, 255, 255' : '0, 0, 0';

    const init = () => {
      // For headers/footers, we should track the container size instead of window
      const parent = canvas.parentElement;
      if (parent && className.includes('absolute')) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      
      // Calculate particle count based on size
      const density = Math.floor((canvas.width * canvas.height) / 15000);
      const particleCount = Math.min(Math.max(density, 20), 150); 
      
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height, nodeColor));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(mouseX, mouseY);
        particles[i].draw(ctx);

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            const opacity = 1 - (distance / 120);
            ctx.strokeStyle = `rgba(${rgbLine}, ${opacity * 0.2})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (className.includes('absolute') && canvas.parentElement) {
        const rect = canvas.parentElement.getBoundingClientRect();
        // Check if mouse is inside the container
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          mouseX = e.clientX - rect.left;
          mouseY = e.clientY - rect.top;
        } else {
          mouseX = -1000;
          mouseY = -1000;
        }
      } else {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, className]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
    />
  );
}
