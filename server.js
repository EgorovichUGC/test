/* Steal a Drop — minimal server (HTTP static + WebSocket PvP) */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORT = Number(process.env.PORT || 3000);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8", ...headers });
  res.end(body);
}

function serveStatic(req, res) {
  const url = new URL(req.url || "/", "http://localhost");
  let pathname = url.pathname;
  if (pathname === "/") pathname = "/index.html";
  if (pathname === "/ws") return false; // websocket handled elsewhere

  // Prevent path traversal
  const withoutLeadingSlash = pathname.replace(/^\/+/, "");
  const safePath = path.normalize(withoutLeadingSlash).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(__dirname, safePath);

  if (!filePath.startsWith(__dirname)) {
    send(res, 403, "Forbidden");
    return true;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, "Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const ct = MIME[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": ct,
      "Cache-Control": "no-store"
    });
    res.end(data);
  });

  return true;
}

const server = http.createServer((req, res) => {
  if (serveStatic(req, res)) return;
  send(res, 404, "Not found");
});

// ---- WebSocket PvP (Rock-Paper-Scissors) ----

/** @type {Map<string, {id: string, name: string, ws: import('ws').WebSocket, roomId: string|null, queued: boolean}>} */
const clients = new Map();
/** @type {string[]} */
const queue = [];
/** @type {Map<string, {id: string, a: string, b: string, moves: Record<string, string|null>}>} */
const rooms = new Map();

function uid(prefix = "") {
  return prefix + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function safeName(raw) {
  const s = String(raw || "").trim().slice(0, 18);
  return s.replace(/[^\p{L}\p{N}_\-.\s]/gu, "") || "Player";
}

function wsSend(ws, obj) {
  try {
    ws.send(JSON.stringify(obj));
  } catch {
    // ignore
  }
}

function getClientIdByWs(ws) {
  for (const [id, c] of clients.entries()) {
    if (c.ws === ws) return id;
  }
  return null;
}

function removeFromQueue(clientId) {
  const idx = queue.indexOf(clientId);
  if (idx >= 0) queue.splice(idx, 1);
}

function cleanupRoom(roomId, leaverId) {
  const room = rooms.get(roomId);
  if (!room) return;
  const otherId = room.a === leaverId ? room.b : room.a;
  const other = clients.get(otherId);
  if (other && other.ws.readyState === other.ws.OPEN) {
    other.roomId = null;
    wsSend(other.ws, { type: "opponent_left" });
  }
  rooms.delete(roomId);
}

function leaveAll(clientId) {
  const c = clients.get(clientId);
  if (!c) return;

  if (c.queued) {
    c.queued = false;
    removeFromQueue(clientId);
  }

  if (c.roomId) {
    const rid = c.roomId;
    c.roomId = null;
    cleanupRoom(rid, clientId);
  }
}

function tryMatchmake() {
  while (queue.length >= 2) {
    const aId = queue.shift();
    const bId = queue.shift();
    const a = aId ? clients.get(aId) : null;
    const b = bId ? clients.get(bId) : null;

    if (!a || !b) continue;
    if (a.ws.readyState !== a.ws.OPEN || b.ws.readyState !== b.ws.OPEN) continue;
    if (a.roomId || b.roomId) continue;

    a.queued = false;
    b.queued = false;

    const roomId = uid("room_");
    rooms.set(roomId, {
      id: roomId,
      a: aId,
      b: bId,
      moves: { [aId]: null, [bId]: null }
    });
    a.roomId = roomId;
    b.roomId = roomId;

    wsSend(a.ws, { type: "match_found", roomId, opponent: { name: b.name } });
    wsSend(b.ws, { type: "match_found", roomId, opponent: { name: a.name } });
    wsSend(a.ws, { type: "state", state: "waiting_for_moves" });
    wsSend(b.ws, { type: "state", state: "waiting_for_moves" });
  }
}

function rpsOutcome(aMove, bMove) {
  if (aMove === bMove) return "draw";
  if (aMove === "rock" && bMove === "scissors") return "win";
  if (aMove === "paper" && bMove === "rock") return "win";
  if (aMove === "scissors" && bMove === "paper") return "win";
  return "lose";
}

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  const id = uid("c_");
  clients.set(id, { id, name: "Player", ws, roomId: null, queued: false });
  wsSend(ws, { type: "welcome", id });

  ws.on("message", (buf) => {
    let msg;
    try {
      msg = JSON.parse(buf.toString("utf8"));
    } catch {
      wsSend(ws, { type: "error", message: "Bad JSON" });
      return;
    }
    if (!msg || typeof msg.type !== "string") return;

    const client = clients.get(id);
    if (!client) return;

    if (msg.type === "hello") {
      client.name = safeName(msg.name);
      return;
    }

    if (msg.type === "queue") {
      if (client.roomId) {
        wsSend(ws, { type: "error", message: "Вы уже в матче" });
        return;
      }
      if (!client.queued) {
        client.queued = true;
        queue.push(id);
      }
      wsSend(ws, { type: "queued" });
      tryMatchmake();
      return;
    }

    if (msg.type === "leave") {
      leaveAll(id);
      return;
    }

    if (msg.type === "move") {
      const move = String(msg.move || "");
      if (!["rock", "paper", "scissors"].includes(move)) {
        wsSend(ws, { type: "error", message: "Неверный ход" });
        return;
      }
      if (!client.roomId) {
        wsSend(ws, { type: "error", message: "Вы не в матче" });
        return;
      }
      const room = rooms.get(client.roomId);
      if (!room) {
        wsSend(ws, { type: "error", message: "Комната не найдена" });
        client.roomId = null;
        return;
      }

      room.moves[id] = move;

      const aMove = room.moves[room.a];
      const bMove = room.moves[room.b];
      if (!aMove || !bMove) {
        wsSend(ws, { type: "state", state: "waiting_for_opponent" });
        const otherId = room.a === id ? room.b : room.a;
        const other = clients.get(otherId);
        if (other) wsSend(other.ws, { type: "state", state: "waiting_for_moves" });
        return;
      }

      const aClient = clients.get(room.a);
      const bClient = clients.get(room.b);
      if (!aClient || !bClient) {
        rooms.delete(room.id);
        return;
      }

      const aOutcome = rpsOutcome(aMove, bMove);
      const bOutcome = rpsOutcome(bMove, aMove);

      wsSend(aClient.ws, { type: "round_result", yourMove: aMove, oppMove: bMove, outcome: aOutcome });
      wsSend(bClient.ws, { type: "round_result", yourMove: bMove, oppMove: aMove, outcome: bOutcome });

      // reset for next round (rematch in same room)
      room.moves[room.a] = null;
      room.moves[room.b] = null;
      return;
    }
  });

  ws.on("close", () => {
    const cid = getClientIdByWs(ws);
    if (!cid) return;
    leaveAll(cid);
    clients.delete(cid);
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Steal a Drop running on http://localhost:${PORT}`);
  if (process.env.SMOKE_TEST === "1") {
    setTimeout(() => server.close(() => process.exit(0)), 200);
  }
});

