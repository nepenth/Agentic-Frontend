import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

console.log('Main.tsx: Starting app initialization');
console.log('Main.tsx: Looking for root element...');
const rootElement = document.getElementById('root');
console.log('Main.tsx: Root element found:', rootElement);

if (!rootElement) {
  console.error('Main.tsx: Root element not found!');
  throw new Error('Root element not found');
}

console.log('Main.tsx: Creating React root...');
const root = createRoot(rootElement);

console.log('Main.tsx: Rendering App component...');
try {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('Main.tsx: App rendered successfully');
} catch (error) {
  console.error('Main.tsx: Error rendering app:', error);
}