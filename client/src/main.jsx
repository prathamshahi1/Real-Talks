import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Direct data URI injection to bypass aggressive browser localhost favicon caching
try {
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#059669"/><stop offset="50%" stop-color="#10b981"/><stop offset="100%" stop-color="#14b8a6"/></linearGradient></defs><rect width="64" height="64" rx="18" fill="url(#g)"/><path d="M19 18H45C47.7614 18 50 20.2386 50 23V37C50 39.7614 47.7614 42 45 42H26L17 48V42C15.3431 42 14 40.6569 14 39V23C14 20.2386 16.2386 18 19 18Z" fill="#ffffff"/><path d="M22 27H42M22 33H35" stroke="#059669" stroke-width="3" stroke-linecap="round"/><circle cx="43" cy="33" r="2.5" fill="#10b981"/></svg>`;
  const faviconDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(faviconSvg)}`;
  
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = faviconDataUri;
} catch (e) {
  console.error('Favicon injection error:', e);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
