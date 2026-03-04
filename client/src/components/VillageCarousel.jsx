import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
  { src: '/pwt1.jpg', title: 'Pemandangan Desa 1' },
  { src: '/pwt2.jpg', title: 'Pemandangan Desa 2' },
  { src: '/pwt3.jpg', title: 'Pemandangan Desa 3' },
];

const VillageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const timerRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Auto-play
  useEffect(() => {
    timerRef.current = setInterval(nextSlide, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, 5000);
  };

  // Drag/Swipe Handlers
  const handleStart = (e) => {
    setIsDragging(true);
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    setStartX(clientX);
    clearInterval(timerRef.current);
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const offset = clientX - startX;
    setDragOffset(offset);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Threshold to trigger slide change
    if (dragOffset > 100) {
      prevSlide();
    } else if (dragOffset < -100) {
      nextSlide();
    }
    
    setDragOffset(0);
    resetTimer();
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[32px] bg-black/20 group">
      {/* Slides Wrapper */}
      <div 
        className={`flex w-full h-full transition-transform duration-500 ease-out ${isDragging ? 'transition-none' : ''}`}
        style={{ transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))` }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {images.map((img, idx) => (
          <div key={idx} className="w-full h-full shrink-0 select-none">
            <img 
              src={img.src} 
              alt={img.title} 
              className="w-full h-full object-cover pointer-events-none"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Navigation Buttons (Desktop Only) */}
      <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <button 
          onClick={prevSlide}
          className="p-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-white pointer-events-auto hover:bg-emerald-500 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextSlide}
          className="p-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-white pointer-events-auto hover:bg-emerald-500 transition-all"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Pagination Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              resetTimer();
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === idx ? 'w-8 bg-emerald-400' : 'w-2 bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Tip Badge */}
      <div className="absolute top-6 left-6 px-3 py-1 bg-black/20 backdrop-blur-md border border-white/10 rounded-full">
        <span className="text-[10px] font-black text-white uppercase tracking-widest">Foto Desa Kami</span>
      </div>
    </div>
  );
};

export default VillageCarousel;
