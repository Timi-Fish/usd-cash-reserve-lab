import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {viteSingleFile} from 'vite-plugin-singlefile';

// One self-contained dist/index.html: every script, style and font is inlined (course rule), and only
// data.js and bills.js sit beside it. scripts/stage-data.mjs copies those two after the build.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {outDir: 'dist', emptyOutDir: true}
});
