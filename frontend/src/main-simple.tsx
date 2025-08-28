import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

function SimpleApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Simple React App Test</h1>
      <p>If you can see this, React is mounting correctly.</p>
      <button onClick={() => alert('React events working!')}>
        Click me to test events
      </button>
    </div>
  )
}

const root = document.getElementById('root');
console.log('Root element found:', root);

if (root) {
  console.log('Creating React root...');
  try {
    const reactRoot = createRoot(root);
    console.log('React root created, rendering app...');
    reactRoot.render(
      <StrictMode>
        <SimpleApp />
      </StrictMode>
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error creating/rendering React app:', error);
  }
} else {
  console.error('Root element not found!');
}