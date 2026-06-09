import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'

window.addEventListener('error', (event) => {
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100vw';
  errorDiv.style.height = '100vh';
  errorDiv.style.backgroundColor = '#1e1b4b';
  errorDiv.style.color = '#e0e7ff';
  errorDiv.style.padding = '2rem';
  errorDiv.style.zIndex = '999999';
  errorDiv.style.fontFamily = 'monospace';
  errorDiv.style.whiteSpace = 'pre-wrap';
  errorDiv.style.overflow = 'auto';
  errorDiv.innerHTML = `
    <h2 style="color: #f43f5e; margin-bottom: 1rem;">[Runtime Error Detected]</h2>
    <p style="font-size: 1.1rem; font-weight: bold; margin-bottom: 1rem;">${event.message}</p>
    <pre style="background: #312e81; padding: 1rem; border-radius: 8px; border: 1px solid #4338ca;">${event.error?.stack || 'No stack trace available'}</pre>
  `;
  document.body.appendChild(errorDiv);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
