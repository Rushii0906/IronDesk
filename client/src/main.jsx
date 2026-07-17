import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';

// Override global fetch to automatically resolve server host when running in wrappers
const originalFetch = window.fetch;
window.fetch = (input, init) => {
  if (typeof input === 'string' && input.startsWith('/api/')) {
    const isWrapper = window.location.protocol.startsWith('file:') || 
                      window.location.protocol.startsWith('capacitor:') ||
                      navigator.userAgent.toLowerCase().includes('electron');
    const host = isWrapper ? 'http://localhost:5000' : '';
    return originalFetch(`${host}${input}`, init);
  }
  return originalFetch(input, init);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
