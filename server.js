import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== 'ENOENT' && error.code !== 'ERR_DOTENV_FILE_NOT_FOUND') throw error;
}

const adminPassword = process.env.ADMIN_PASSWORD;
const sessionSecret = process.env.SESSION_SECRET;

if (!adminPassword || adminPassword.length < 12) {
  throw new Error('Set ADMIN_PASSWORD in .env to a password of at least 12 characters.');
}
if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error('Set SESSION_SECRET in .env to a random value of at least 32 characters.');
}

const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
const dirname = path.dirname(fileURLToPath(import.meta.url));
const sessions = new Map();
const loginAttempts = new Map();
const sessionLifetimeMs = 8 * 60 * 60 * 1000;
const cookieName = 'mixo_admin_session';
const secureCookie = isProduction ? '; Secure' : '';

function sendJson(response, status, body, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  response.end(JSON.stringify(body));
}

function getCookie(request, name) {
  const cookies = request.headers.cookie?.split(';') ?? [];
  const entry = cookies.find((part) => part.trim().startsWith(`${name}=`));
  return entry ? entry.trim().slice(name.length + 1) : '';
}

function authenticated(request) {
  const token = getCookie(request, cookieName);
  const expiry = sessions.get(token);
  if (!expiry) return false;
  if (expiry <= Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function validPassword(candidate) {
  const digest = (value) => createHmac('sha256', sessionSecret).update(value).digest();
  return timingSafeEqual(digest(candidate), digest(adminPassword));
}

function readJson(request, maxBytes = 4096) {
  return new Promise((resolve, reject) => {
    let body = '';
    let tooLarge = false;
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      if (Buffer.byteLength(body) + Buffer.byteLength(chunk) > maxBytes) {
        tooLarge = true;
        return;
      }
      body += chunk;
    });
    request.on('end', () => {
      if (tooLarge) {
        reject(Object.assign(new Error('Request body too large'), { status: 413 }));
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { status: 400 }));
      }
    });
    request.on('error', reject);
  });
}

function requestHasSameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.host;
  } catch {
    return false;
  }
}

async function handleApi(request, response) {
  const url = new URL(request.url, 'http://localhost');

  if (url.pathname === '/api/admin/session' && request.method === 'GET') {
    const isAuthenticated = authenticated(request);
    sendJson(response, isAuthenticated ? 200 : 401, { authenticated: isAuthenticated });
    return true;
  }

  if (url.pathname === '/api/admin/login' && request.method === 'POST') {
    if (!requestHasSameOrigin(request)) {
      sendJson(response, 403, { error: 'Forbidden' });
      return true;
    }

    const now = Date.now();
    const ip = request.socket.remoteAddress ?? 'unknown';
    let attempts = loginAttempts.get(ip);
    if (!attempts || attempts.resetAt <= now) {
      attempts = { count: 0, resetAt: now + 15 * 60 * 1000 };
      loginAttempts.set(ip, attempts);
    }
    if (attempts.count >= 5) {
      sendJson(response, 429, { error: 'Too many attempts' });
      return true;
    }

    try {
      const body = await readJson(request);
      if (typeof body.password !== 'string' || !validPassword(body.password)) {
        attempts.count += 1;
        sendJson(response, 401, { error: 'Invalid credentials' });
        return true;
      }
    } catch (error) {
      sendJson(response, error.status ?? 400, { error: error.status ? error.message : 'Invalid request' });
      return true;
    }

    loginAttempts.delete(ip);
    const token = randomBytes(32).toString('base64url');
    sessions.set(token, Date.now() + sessionLifetimeMs);
    sendJson(response, 200, { authenticated: true }, {
      'Set-Cookie': `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secureCookie}`,
    });
    return true;
  }

  if (url.pathname === '/api/admin/logout' && request.method === 'POST') {
    if (!requestHasSameOrigin(request)) {
      sendJson(response, 403, { error: 'Forbidden' });
      return true;
    }
    sessions.delete(getCookie(request, cookieName));
    sendJson(response, 200, { authenticated: false }, {
      'Set-Cookie': `${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureCookie}`,
    });
    return true;
  }

  if (url.pathname.startsWith('/api/')) {
    sendJson(response, 404, { error: 'Not found' });
    return true;
  }
  return false;
}

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
    server: { middlewareMode: true },
    appType: 'spa',
  });

  const server = createServer(async (request, response) => {
    try {
      if (await handleApi(request, response)) return;
      if (vite) {
        vite.middlewares(request, response, (error) => {
          if (error) {
            console.error(error);
            if (!response.headersSent) sendJson(response, 500, { error: 'Internal server error' });
          }
        });
      } else {
        serveBuiltApp(request, response);
      }
    } catch (error) {
      console.error(error);
      if (!response.headersSent) sendJson(response, 500, { error: 'Internal server error' });
    }
  });

  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '0.0.0.0';
  server.listen(port, host, () => {
    console.log(`Mixò server listening on http://${host}:${port}`);
  });

  const cleanup = async () => {
    server.close();
    await vite?.close();
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of sessions) {
    if (expiry <= now) sessions.delete(token);
  }
  for (const [ip, attempts] of loginAttempts) {
    if (attempts.resetAt <= now) loginAttempts.delete(ip);
  }
}, 15 * 60 * 1000);
cleanupTimer.unref();

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
