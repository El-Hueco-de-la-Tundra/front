import { defineConfig } from 'vite'; // Use this if you have Vite configuration
import react from '@vitejs/plugin-react-swc';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,  // Allows usage of expect without importing
    environment: 'jsdom', // Simulates a browser-like environment for React components
    setupFiles: '/src/setupTests.js', // Optional: Add if you have a setup file
  },
});

