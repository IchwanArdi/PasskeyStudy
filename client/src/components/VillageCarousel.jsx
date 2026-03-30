import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Daftar gambar yang ditampilkan di carousel
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

  // Fungsi untuk berpindah ke slide berikutnya
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  // Fungsi untuk berpindah ke slide sebelumnya
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Efek untuk menjalankan auto-play (berpindah otomatis setiap 5 detik)
  useEffect(() => {
    timerRef.current = setInterval(nextSlide, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Fungsi untuk mereset timer auto-play saat ada interaksi pengguna
  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, 5000);
  };

  // Handler untuk memulai geseran (drag/swipe)
  const handleStart = (e) => {
    setIsDragging(true);
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    setStartX(clientX);
    clearInterval(timerRef.current);
  };

  // Handler saat proses geser berlangsung
  const handleMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const offset = clientX - startX;
    setDragOffset(offset);
  };

  // Handler saat geseran selesai
  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Ambang batas geseran (threshold) untuk memicu pindah slide
    if (dragOffset > 100) {
      prevSlide();
    } else if (dragOffset < -100) {
      nextSlide();
    }
    
    setDragOffset(0);
    resetTimer();
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-3xl bg-black/20 group">
      {/* Pembungkus Slide dengan transisi */}
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
            {/* Hamparan Gradasi Hitam di Bagian Bawah */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Tombol Navigasi Kiri/Kanan (Hanya tampil di Desktop saat hover) */}
      <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <button 
          onClick={prevSlide}
          className="p-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-white pointer-events-auto hover:bg-emerald-500 transition-all font-bold"
          aria-label="Slide sebelumnya"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextSlide}
          className="p-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-white pointer-events-auto hover:bg-emerald-500 transition-all font-bold"
          aria-label="Slide berikutnya"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Indikator Halaman (Pagination Dots) */}
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

      {/* Label Informasi Foto */}
      <div className="absolute top-6 left-6 px-3 py-1 bg-black/20 backdrop-blur-md border border-white/10 dark:border-black/10 dark:bg-white/20 rounded-full">
        <span className="text-[10px] font-black dark:text-white text-black uppercase tracking-widest">Foto Desa Kami</span>
      </div>
    </div>
  );
};

export default VillageCarousel;
