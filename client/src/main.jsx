// ENTRY POINT: File utama React yang melakukan render pertama kali ke DOM browser (index.html)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './App.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// PWA CONFIG: Registrasi Service Worker lewat manifest Vite
// Berfungsi mengatur caching agar web bisa di-install layaknya aplikasi native dan mendukung mode offline
registerSW({
  onRegisteredSW(swUrl, registration) {
    // Check for updates every 60 minutes
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    }
  },
  onOfflineReady() {

  },
});
