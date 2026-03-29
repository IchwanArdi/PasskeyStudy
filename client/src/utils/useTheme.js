import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    // Baca dari localStorage, defaultnya adalah dark mode
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('light');
      html.classList.add('dark');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newDark = !prev;
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
      return newDark;
    });
  };

  return { isDark, toggleTheme };
};
