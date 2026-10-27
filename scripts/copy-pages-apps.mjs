import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

const appNames = [
  'docs', 'slides', 'sheets', 'studio', 'gx', 'drive', 'meet', 'chat', 'mail'
];

const sourceRoot = path.resolve('pages-apps');
const outputRoot = path.resolve('dist');

for (const appName of appNames) {
  const source = path.join(sourceRoot, appName);
  const destination = path.join(outputRoot, appName);
  await mkdir(destination, { recursive: true });
  await cp(source, destination, { recursive: true, force: true });
  console.log(`Copied MasterMine ${appName} to dist/${appName}/`);
}

console.log('Standalone MasterMine pages are ready in the Vite output directory.');
