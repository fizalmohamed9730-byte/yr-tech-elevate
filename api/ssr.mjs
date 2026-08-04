import server from "../dist/server/server.js";

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? req : undefined,
  });
  const response = await server.fetch(request, {}, {});
  res.statusCode = response.status;
  response.headers.forEach((v, k) => res.setHeader(k, v));
  const body = await response.text();
  res.end(body);
}
