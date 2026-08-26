/**
 * Serves ./out the way Cloudflare Pages does: directory index resolution,
 * Brotli/gzip for text assets, immutable caching for /_next/static.
 * Used for local preview and for taking honest Lighthouse numbers.
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { createBrotliCompress, createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

const root = new URL('../out/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const port = Number(process.env.PORT ?? 4173);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
};

const compressible = new Set(['.html', '.css', '.js', '.json', '.txt', '.xml', '.svg']);

async function resolve(pathname) {
  const clean = normalize(decodeURIComponent(pathname.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  for (const candidate of [join(root, clean), join(root, clean, 'index.html'), `${join(root, clean)}.html`]) {
    try {
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

createServer(async (req, res) => {
  const file = (await resolve(req.url ?? '/')) ?? (await resolve('/404.html'));
  if (!file) {
    res.writeHead(404).end('Not found');
    return;
  }

  const ext = extname(file);
  const accept = req.headers['accept-encoding'] ?? '';
  const encoding = compressible.has(ext) ? (/\bbr\b/.test(accept) ? 'br' : /\bgzip\b/.test(accept) ? 'gzip' : null) : null;

  res.setHeader('Content-Type', types[ext] ?? 'application/octet-stream');
  res.setHeader(
    'Cache-Control',
    req.url?.startsWith('/_next/static') ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate',
  );
  if (encoding) res.setHeader('Content-Encoding', encoding);
  res.setHeader('Vary', 'Accept-Encoding');
  res.writeHead(file.endsWith('404.html') ? 404 : 200);

  const stream = createReadStream(file);
  await (encoding
    ? pipeline(stream, encoding === 'br' ? createBrotliCompress() : createGzip(), res)
    : pipeline(stream, res));
}).listen(port, () => console.log(`http://localhost:${port}`));
