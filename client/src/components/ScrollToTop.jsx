import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Komponen utilitas untuk memastikan halaman selalu bergulir ke atas
 * setiap kali rute (URL) berubah.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Gulir ke koordinat 0,0 (paling atas)
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
