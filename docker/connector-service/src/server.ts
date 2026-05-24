import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;
const PICONEW_API_URL = process.env.PICONEW_API_URL ?? "https://piconew.com";

const ALLOWED_PATH = "/Vendors/input.cshtml";
const STRIP_HEADERS = new Set([
  "authorization", "cookie", "x-forwarded-for", "x-real-ip", "x-forwarded-host",
]);

app.use(express.raw({ type: "*/*", limit: "1mb" }));

app.all("*", async (req, res) => {
  // Path allowlist — only forward known PicoBrew API paths
  if (!req.path.startsWith(ALLOWED_PATH)) {
    console.log(`[${new Date().toISOString()}] BLOCKED ${req.method} ${req.path} — not in allowlist`);
    return res.status(404).send("Not Found");
  }

  const target = `${PICONEW_API_URL}${req.url}`;
  const bodyPreview = Buffer.isBuffer(req.body) && req.body.length > 0
    ? req.body.slice(0, 200).toString("utf8").replace(/\n/g, " ")
    : "";

  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.hostname}${req.url}` +
    (bodyPreview ? ` | body: ${bodyPreview}` : "")
  );

  try {
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string" && !STRIP_HEADERS.has(key.toLowerCase())) {
        headers[key] = value;
      }
    }
    headers["host"] = new URL(PICONEW_API_URL).host;

    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: Buffer.isBuffer(req.body) && req.body.length > 0 ? req.body : undefined,
      redirect: "manual", // never auto-follow upstream redirects
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (!["transfer-encoding", "connection"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const buffer = await upstream.buffer();
    res.send(buffer);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ERROR proxying ${target}:`, err);
    res.status(502).send("Bad Gateway — connector could not reach piconew.com");
  }
});

app.listen(PORT, () => {
  console.log(`PicoNew connector-service listening on :${PORT}`);
  console.log(`Proxying to: ${PICONEW_API_URL}`);
  console.log(`Allowed path: ${ALLOWED_PATH}`);
});
