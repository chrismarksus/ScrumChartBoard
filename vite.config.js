import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

const { version } = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));

export default defineConfig({
  root: 'app',
  publicDir: '../public',
  base: process.env.VITE_BASE || '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'app/dashboard.html'),
        landing: path.resolve(__dirname, 'app/index.html'),
        editor: path.resolve(__dirname, 'app/editor.html'),
      },
    },
  },
  server: {
    port: 9000,
  },
  plugins: [
    {
      name: 'inject-version',
      transformIndexHtml: html => html.replace(/%APP_VERSION%/g, version),
    },
    {
      name: 'serve-sample-data',
      configureServer(server) {
        server.middlewares.use('/teams', (req, res, next) => {
          const filePath = path.join(process.cwd(), 'test/teams', req.url);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath);
            let contentType = 'application/octet-stream';
            if (ext === '.json') contentType = 'application/json';
            else if (ext === '.csv') contentType = 'text/csv; charset=utf-8';
            res.setHeader('Content-Type', contentType);
            res.end(fs.readFileSync(filePath));
          } else {
            next();
          }
        });
      },
    },
  ],
});
