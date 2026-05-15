import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  root: 'app',
  base: process.env.VITE_BASE || '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'app/index.html'),
        landing: path.resolve(__dirname, 'app/landing.html'),
      },
    },
  },
  server: {
    port: 9000,
  },
  plugins: [
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
