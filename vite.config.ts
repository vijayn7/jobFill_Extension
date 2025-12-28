import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';

const rootDir = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'dist');

const filesToCopy = [
  { source: resolve(rootDir, 'manifest.json'), destination: 'manifest.json' },
  { source: resolve(rootDir, 'content/ui/styles.css'), destination: 'content/ui/styles.css' }
];

const directoriesToCopy = [
  { source: resolve(__dirname, 'testsite'), destination: 'testsite' }
];

const ensureDir = async (path: string) => {
  await mkdir(path, { recursive: true });
};

const copyFile = async ({ source, destination }: { source: string; destination: string }) => {
  const target = resolve(outDir, destination);
  await ensureDir(dirname(target));
  await cp(source, target);
};

const copyDirectory = async ({
  source,
  destination
}: {
  source: string;
  destination: string;
}) => {
  const target = resolve(outDir, destination);
  await ensureDir(target);
  await cp(source, target, { recursive: true });
};

export default defineConfig({
  root: rootDir,
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(rootDir, 'background/index.ts'),
        content: resolve(rootDir, 'content/index.ts'),
        options: resolve(rootDir, 'options/options.html')
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') {
            return 'background/index.js';
          }
          if (chunk.name === 'content') {
            return 'content/index.js';
          }
          if (chunk.name === 'options') {
            return 'options/index.js';
          }
          return 'assets/[name].js';
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'options.css') {
            return 'options/options.css';
          }
          return 'assets/[name][extname]';
        }
      }
    }
  },
  plugins: [
    {
      name: 'copy-extension-assets',
      apply: 'build',
      async closeBundle() {
        await Promise.all(filesToCopy.map(copyFile));
        await Promise.all(directoriesToCopy.map(copyDirectory));
      }
    }
  ]
});
