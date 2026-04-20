"use client";
import React, { useState, useEffect, useCallback } from 'react';

const slides = [
  {
    src: "/images/carousel_living_room.png",
    alt: "Cozy living room with grey sofa and warm lighting",
  },
  {
    src: "/images/carousel_bedroom.png",
    alt: "Minimal bedroom with white platform bed",
  },
  {
    src: "/images/carousel_wfh.png",
    alt: "Clean work-from-home desk setup",
  },
  {
    src: "/images/carousel_studio.png",
    alt: "Modern studio apartment interior",
  },
  {
    src: "/images/carousel_dining.png",
    alt: "Bright minimalist dining area",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [paused, next]);

  return (
    <div
      className="group relative rounded-full overflow-hidden w-72 h-72 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px] bg-slate-100 select-none shadow-2xl border-8 border-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          aria-hidden={idx !== current}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <img
            src={slide.src}
            alt={slide.alt}
            className={`w-full h-full object-cover transition-transform duration-[6s] ease-out ${idx === current ? 'scale-[1.08]' : 'scale-100'}`}
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
          {/* Very subtle bottom vignette only - image stays bright */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>
      ))}

      <div className="absolute top-12 right-12 sm:top-14 sm:right-14 lg:top-16 lg:right-16 z-50 transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-white/20 p-3 rounded-full text-white shadow-2xl flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Dot navigation — bottom center, minimal */}
      <div className="absolute bottom-5 left-1/2 z-20 flex items-center gap-2"
        style={{ transform: 'translateX(-50%)' }}>
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm ${idx === current
                ? 'w-7 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
          />
        ))}
      </div>
    </div>
  );
}
