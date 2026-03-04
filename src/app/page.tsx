/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, useRef } from "react";

interface Slide {
  id: number;
  title: string;
  imageUrl: string;
  duration: number;
}

export default function SlideShow() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number>(0);

  useEffect(() => {
    fetch("/api/slides")
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map((s: Slide) => ({
          ...s,
          duration: s.duration || 8, // Tăng lên 8s để xem cho sang
        }));
        setSlides(formattedData);
      });
  }, []);

  useEffect(() => {
    if (!slides.length) return;

    const durationMs = slides[current].duration * 1000;
    const intervalTime = 16; // ~60fps cho thanh progress cực mượt

    progressRef.current = 0;
    setProgress(0);

    const interval = setInterval(() => {
      progressRef.current += intervalTime;
      const percent = (progressRef.current / durationMs) * 100;
      setProgress(Math.min(percent, 100));

      if (progressRef.current >= durationMs) {
        clearInterval(interval);
        setCurrent((prev) => (prev + 1) % slides.length);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [current, slides]);

  if (!slides.length)
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#050505]">
        <div className="animate-pulse text-blue-500 font-light tracking-[0.2em]">
          LOADING EXPERIENCE
        </div>
      </div>
    );

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-black font-sans">
      {/* Lớp phủ Overlay chống lóa & tăng tương phản (Vignette) */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />

      {/* Slide images */}
      {slides.map((slide, index) => {
        const isActive = index === current;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              isActive ? "opacity-100 z-0" : "opacity-0 z-[-1]"
            }`}
          >
            {/* Hiệu ứng Ken Burns (Zoom chậm) */}
            {/* Thay thế đoạn hiển thị ảnh trong map của bạn */}
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                isActive ? "opacity-100 z-0" : "opacity-0 z-[-1]"
              } overflow-hidden`} // Thêm overflow-hidden ở đây
            >
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className={`w-full h-full object-cover contrast-[1] brightness-[1] transition-transform duration-[10000ms] `}
                loading="eager"
              />

              {/* Overlay Gradient */}
            </div>

            {/* Overlay Gradient tối phía dưới để nổi bật Text */}
          </div>
        );
      })}

      {/* Nội dung Text - Thiết kế tối giản sang trọng */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6! md:p-20 pointer-events-none">
        <div
          className={`transition-all duration-1000 transform ${progress > 2 ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <p className="text-blue-500 font-bold tracking-[0.3em] mb-2 text-sm md:text-base uppercase">
            Featured Content
          </p>
          <h2 className="text-white text-5xl! md:text-8xl font-black uppercase leading-none tracking-tighter max-w-4xl drop-shadow-2xl">
            {slides[current].title}
          </h2>
        </div>
      </div>

      {/* Thanh Progress bar siêu mảnh (Ultra-thin) */}
      <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white/10 z-30">
        <div
          className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)] transition-all ease-linear"
          style={{
            width: `${progress}%`,
            transitionDuration: progress === 0 ? "0s" : "16ms",
          }}
        />
      </div>

      {/* Điều hướng số thứ tự (Slide Counter) */}
      <div className="absolute top-10 right-10 z-30 text-white/50 font-mono text-xl">
        <span className="text-white font-bold">
          {String(current + 1).padStart(2, "0")}
        </span>
        <span className="mx-2">/</span>
        <span>{String(slides.length).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
