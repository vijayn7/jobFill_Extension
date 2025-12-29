import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.ts'),
        options: resolve(__dirname, 'src/options/options.html')
      },
      output: {
        entryFileNames: '[name]/index.js'
      }
    }
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'src/manifest.json', dest: '.' },
        { src: 'src/options/options.css', dest: 'options' },
        { src: 'src/content/ui/styles.css', dest: 'content/ui' }
      ]
    })
  ]
});
