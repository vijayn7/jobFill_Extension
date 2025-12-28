import { cp, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const filesToCopy = [
  'src/manifest.json',
  'src/options/options.html',
  'src/options/options.css',
  'src/content/ui/styles.css'
];

const directoriesToCopy = ['testsite'];

const ensureDir = async (path) => {
  await mkdir(path, { recursive: true });
};

const copyFile = async (path) => {
  const destination = join('dist', path.replace(/^src\//, ''));
  await ensureDir(dirname(destination));
  await cp(path, destination);
};

const copyDirectory = async (path) => {
  const destination = join('dist', path.replace(/^src\//, ''));
  await ensureDir(destination);
  await cp(path, destination, { recursive: true });
};

await Promise.all(filesToCopy.map(copyFile));
await Promise.all(directoriesToCopy.map(copyDirectory));
