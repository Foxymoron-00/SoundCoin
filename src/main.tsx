import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Backend Worker URL
const API_URL = "https://soundcoin-api.soundcoin-backend.workers.dev";

// Redirect all frontend /api calls to the Worker
const originalFetch = window.fetch;
window.fetch = (input, init) => {
  if (typeof input === "string" && input.startsWith("/api")) {
    input = API_URL + input;
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
