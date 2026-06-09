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

  if (existsSync(filePath) && !filePath.endsWith("/")) {
    const ext = extname(filePath);
    const mime = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });
    res.end(readFileSync(filePath));
    return;
  }

  // SSR fallback
  const { default: handler } = await import("./dist/server/server.js");
  const request = new Request(`http://localhost${req.url}`, {
    method: req.method,
    headers: req.headers,
  });
  const response = await handler.fetch(request, {}, {});
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(await response.text());
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
