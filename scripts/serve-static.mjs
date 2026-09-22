import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'out');
const port = Number(process.env.PORT ?? 3100);
const types = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
};

async function readExport(pathname) {
  for (const candidate of [pathname, `${pathname}.html`, join(pathname, 'index.html')]) {
    try {
      return { body: await readFile(join(root, candidate)), type: types[extname(candidate)] };
    } catch {}
  }
  return null;
}

createServer(async (request, response) => {
  const pathname = normalize(decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  const file = await readExport(pathname);
  if (file) {
    response.writeHead(200, { 'Content-Type': file.type ?? 'application/octet-stream' });
    response.end(file.body);
    return;
  }
  response.writeHead(404, { 'Content-Type': types['.html'] });
  response.end(await readFile(join(root, '404.html')));
}).listen(port);
