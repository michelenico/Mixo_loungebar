import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
const dirname = path.dirname(fileURLToPath(import.meta.url));

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};

function serveBuiltApp(request, response) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  const distDir = path.join(dirname, 'dist');
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }
  let filePath = path.resolve(distDir, `.${pathname}`);
  if (!filePath.startsWith(`${distDir}${path.sep}`) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    filePath = path.join(distDir, 'index.html');
  }
  if (!existsSync(filePath)) {
    response.writeHead(503).end('Run npm run build before starting the production server.');
    return;
  }

  response.writeHead(200, {
    'Content-Type': contentTypes[path.extname(filePath)] ?? 'application/octet-stream',
    'Cache-Control': path.basename(filePath) === 'index.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(filePath).pipe(response);
}

async function start() {
  const vite = isProduction ? null : await (await import('vite')).createServer({
    server: { middlewareMode: true, allowedHosts: true },
    appType: 'spa',
  });

  const server = createServer(async (request, response) => {
    try {
      if (vite) {
        vite.middlewares(request, response, (error) => {
          if (error) {
            console.error(error);
            if (!response.headersSent) {
              response.writeHead(500, { 'Content-Type': 'application/json' });
              response.end(JSON.stringify({ error: 'Internal server error' }));
            }
          }
        });
      } else {
        serveBuiltApp(request, response);
      }
    } catch (error) {
      console.error(error);
      if (!response.headersSent) {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Internal server error' }));
      }
    }
  });

  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '0.0.0.0';
  server.listen(port, host, () => {
    console.log(`Mixò server running on http://${host}:${port}`);
  });

  const cleanup = async () => {
    server.close();
    await vite?.close();
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
