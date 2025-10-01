import * as fs from 'fs';
import * as path from 'path';
import { defineConfig } from 'vite';

const input = fs.readdirSync(__dirname)
  .reduce((acc: string[], file) => {
    const filePath = path.join(__dirname, file);
    const stats = fs.statSync(filePath);

    if (!stats.isDirectory() && path.extname(file) === '.html') {
      return [...acc, path.resolve(filePath)];
    }

    return acc;
  }, []);

export default defineConfig({
  build: {
    outDir: '../fs/',
    emptyOutDir: true,
    rollupOptions: {
      input,
    }
  },
  server: {
    port: 3000,
  },
});
