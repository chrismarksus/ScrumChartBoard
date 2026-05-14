import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  root: 'app',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 9000,
  },
  css: {
    preprocessorOptions: {
      less: {},
    },
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
