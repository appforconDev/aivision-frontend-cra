// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';        // importera dina globala stilar
import App from './App';     // din huvudkomponent
const container = document.getElementById('root');
if (!container) {
  throw new Error("Root container missing in public/index.html");
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
   
    <App />
  
  </React.StrictMode>
);
