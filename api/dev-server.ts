// Local development server - bridges Vite's dev server to the API handlers.
// Run via: npm run dev:api
// Vite proxies /api/* to http://localhost:3001
import http from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { VercelRequest, VercelResponse } from "@vercel/node";

import guessHandler from "./guess.js";
import nameHandler from "./name.js";
import leaderboardHandler from "./leaderboard.js";
import resultHandler from "./result.js";
import eventHandler from "./event.js";

const PORT = 3001;

function parseBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
    const body = await parseBody(req);

    // Attach body and query to req so handlers can read them
    const vReq = req as VercelRequest;
    vReq.body = body;
    vReq.query = Object.fromEntries(url.searchParams);

    const vRes = res as unknown as VercelResponse;
    vRes.status = (code: number) => {
      res.statusCode = code;
      return vRes;
    };
    vRes.json = (data: unknown) => {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
      return vRes;
    };

    const path = url.pathname;
    if (path === "/api/guess") return guessHandler(vReq, vRes);
    if (path === "/api/name") return nameHandler(vReq, vRes);
    if (path === "/api/leaderboard") return leaderboardHandler(vReq, vRes);
    if (path === "/api/result") return resultHandler(vReq, vRes);
    if (path === "/api/event") return eventHandler(vReq, vRes);

    res.writeHead(404);
    res.end("Not found");
  },
);

server.listen(PORT, () =>
  console.log(`API dev server on http://localhost:${PORT}`),
);
