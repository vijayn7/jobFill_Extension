import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import fs from 'fs';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        options: resolve(__dirname, 'src/options/options.html')
      },
      output: {
        entryFileNames: '[name]/index.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        dir: 'dist',
        format: 'es'
      }
    },
    minify: false
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'src/manifest.json', dest: '.' },
        { src: 'src/options/options.html', dest: 'options' },
        { src: 'src/options/options.css', dest: 'options' },
        { src: 'src/content/ui/styles.css', dest: 'content/ui' }
      ]
    }),
    {
      name: 'validate-content-script',
      closeBundle() {
        const contentPath = resolve(__dirname, 'dist/content/index.js');
        if (fs.existsSync(contentPath)) {
          const content = fs.readFileSync(contentPath, 'utf-8');
          if (content.match(/^\s*import\s+/m)) {
            throw new Error(
              '❌ Content script contains import statements!\n' +
              'Content scripts must be bundled as IIFE with no external imports.'
            );
          }
          console.log('✅ Content script validated - no import statements');
        }
      }
    }
  ]
});
