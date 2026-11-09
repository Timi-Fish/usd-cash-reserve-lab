import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {viteSingleFile} from 'vite-plugin-singlefile';

// One self-contained dist/index.html: every script, style and font is inlined, so the page needs only data.js
// beside it (course rule). scripts/publish.mjs then copies it to the project folder as index.html.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {outDir: 'dist', emptyOutDir: true}
});
