import http from "node:http";
import { WebSocketServer } from "ws";

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "hello", ok: true }));
  ws.on("message", () => {
    // placeholder: no realtime logic in ticket 001
  });
});

server.listen(3001, () => {
  // eslint-disable-next-line no-console
  console.log("realtime listening on :3001");
});
