import React from 'react';
import { createRoot } from 'react-dom/client';
import { z } from 'zod';
import { App } from './app/App';
import './index.css';

z.config({ jitless: true });

/** Initializes and mounts the React application root node. */
export function mountApplication(): void {
  const container = document.getElementById('root');
  if (!container) {
    return;
  }
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

mountApplication();
