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

// PWA Service Worker — auto-update via vite-plugin-pwa
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
    console.log('App ready to work offline');
  },
});
