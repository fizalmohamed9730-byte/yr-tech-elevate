import server from "../dist/server/server.js";

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: hasBody ? req : undefined,
      duplex: "half",
    });
    const response = await server.fetch(request, {}, {});
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    const body = await response.text();
    res.end(body);
  } catch (error) {
    console.error("[api/ssr] Unhandled error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
}
