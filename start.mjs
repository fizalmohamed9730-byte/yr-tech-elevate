import http from 'http';
import { Readable } from 'stream';
const mod = await import('./dist/server/server.js');
const port = process.env.PORT || 3000;
const listener = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (v) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
    }
    const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await new Promise((resolve) => {
      let chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => resolve(Buffer.concat(chunks)));
    });
    const request = new Request(url, { method: req.method, headers, body, redirect: 'manual' });
    const response = await mod.default.fetch(request, process.env, {});
    res.statusCode = response.status;
    for (const [k, v] of response.headers) res.setHeader(k, v);
    if (response.body) {
      const reader = response.body.getReader();
      const pump = () => reader.read().then(({ done, value }) => {
        if (done) return res.end();
        res.write(Buffer.from(value));
        pump();
      });
      pump();
    } else {
      res.end();
    }
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html');
    res.end(mod.r());
  }
});
listener.listen(port, () => console.log(`http://localhost:${port}`));
