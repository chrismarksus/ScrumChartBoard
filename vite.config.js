import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

const { version } = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));

export default defineConfig({
  root: 'app',
  base: process.env.VITE_BASE || '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'app/dashboard.html'),
        landing: path.resolve(__dirname, 'app/index.html'),
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
            if (ext === '.json') res.setHeader('Content-Type', 'application/json');
            res.end(fs.readFileSync(filePath));
          } else {
            next();
          }
        });
      },
    },
  ],
});
