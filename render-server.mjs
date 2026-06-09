import { createServer } from "http";
import { readFileSync, existsSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const mimeTypes = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

const clientDir = join(__dirname, "dist/client");

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost`);
  const filePath = join(clientDir, url.pathname);

  if (existsSync(filePath) && !filePath.endsWith("/") && extname(filePath)) {
    const ext = extname(filePath);
    const mime = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });
    res.end(readFileSync(filePath));
    return;
  }

  // Read body as buffer first
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const bodyBuffer = Buffer.concat(chunks);

  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    headers[k] = v;
  }

  const { default: handler } = await import("./dist/server/server.js");
  
  const request = new Request(`http://localhost${req.url}`, {
    method: req.method,
    headers: headers,
    body: bodyBuffer.length > 0 ? bodyBuffer : undefined,
    duplex: "half",
  });

  const response = await handler.fetch(request, {}, {});
  
  const respHeaders = {};
  response.headers.forEach((v, k) => { respHeaders[k] = v; });
  res.writeHead(response.status, respHeaders);
  
  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
