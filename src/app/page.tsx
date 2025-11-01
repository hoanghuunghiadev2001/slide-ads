/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, useRef } from "react";

interface Slide {
  id: number;
  title: string;
  imageUrl: string;
  duration?: number; // thời gian hiển thị (ms)
}

export default function SlideShow() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number>(0);

  useEffect(() => {
    fetch("/api/slides")
      .then((res) => res.json())
      .then(setSlides);
  }, []);

  useEffect(() => {
    if (!slides.length) return;

    const duration = slides[current].duration || 10000;
    const intervalTime = 50;
    progressRef.current = 0;
    setProgress(0);

    const interval = setInterval(() => {
      progressRef.current += intervalTime;
      setProgress(Math.min((progressRef.current / duration) * 100, 100));
      if (progressRef.current >= duration) {
        setCurrent((prev) => (prev + 1) % slides.length);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [current, slides]);

  if (!slides.length) return <div>Loading...</div>;

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-black">
      {/* Slide images */}
      {slides.map((slide, index) => (
        <img
          key={slide.id}
          src={slide.imageUrl}
          alt={slide.title}
          className={`absolute top-0 left-0 w-[100vw] h-[100vh]   transition-opacity duration-500 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Progress bar */}
      <div className="absolute bottom-10 left-0 w-full flex justify-center gap-2">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === current ? "bg-blue-500" : "bg-white/50"
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-4 left-0 w-full h-2 bg-white/30">
        <div
          className="h-2 bg-blue-500 transition-all duration-50 rounded-3xl"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide title */}
      {/* <div className="absolute bottom-16 left-0 w-full text-center text-white text-2xl">
        {slides[current].title}
      </div> */}

      {/* Indicators */}
    </div>
  );
}
