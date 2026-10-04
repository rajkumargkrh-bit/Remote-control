import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import crypto from "crypto";

const app = express();
const server = http.createServer(app);
const browserWss = new WebSocketServer({ noServer: true });

app.use(express.static("public"));
app.get("/health", (_, res) => res.json({ ok: true, service: "Samsung Crystal Remote" }));

server.on("upgrade", (request, socket, head) => {
  if (request.url !== "/remote") {
    socket.destroy();
    return;
  }
  browserWss.handleUpgrade(request, socket, head, ws => {
    browserWss.emit("connection", ws, request);
  });
});

function b64(value) {
  return Buffer.from(value, "utf8").toString("base64");
}

function tvUrl(ip, name, token = "") {
  const params = new URLSearchParams({ name: b64(name) });
  if (token) params.set("token", token);
  return `wss://${ip}:8002/api/v2/channels/samsung.remote.control?${params}`;
}

browserWss.on("connection", browser => {
  let tv = null;

  const send = msg => {
    if (browser.readyState === WebSocket.OPEN) browser.send(JSON.stringify(msg));
  };

  browser.on("message", raw => {
    let msg;
    try { msg = JSON.parse(raw.toString()); }
    catch { return send({ type: "error", message: "Invalid message" }); }

    if (msg.type === "connect") {
      if (tv) try { tv.close(); } catch {}
      const ip = String(msg.ip || "").trim();
      const name = String(msg.name || "Crystal Remote");
      const token = String(msg.token || "").trim();

      if (!ip) return send({ type: "error", message: "Enter the TV IP address." });

      try {
        tv = new WebSocket(tvUrl(ip, name, token), { rejectUnauthorized: false });
      } catch {
        return send({ type: "error", message: "Could not create TV connection." });
      }

      tv.on("open", () => send({ type: "connected", message: "Connected to Samsung TV" }));
      tv.on("message", data => {
        const text = data.toString();
        let parsed;
        try { parsed = JSON.parse(text); } catch {}
        if (parsed?.event === "ms.channel.connect" && parsed?.data?.token) {
          send({ type: "token", token: String(parsed.data.token) });
        }
        send({ type: "tv", data: parsed ?? text });
      });
      tv.on("error", err => send({ type: "error", message: err?.message || "TV connection error" }));
      tv.on("close", () => send({ type: "disconnected", message: "TV connection closed" }));
      return;
    }

    if (msg.type === "key") {
      if (!tv || tv.readyState !== WebSocket.OPEN)
        return send({ type: "error", message: "Connect to the TV first." });

      const key = String(msg.key || "");
      const allowed = /^KEY_[A-Z0-9_]+$/.test(key);
      if (!allowed) return send({ type: "error", message: "Unsupported key." });

      tv.send(JSON.stringify({
        method: "ms.remote.control",
        params: {
          Cmd: "Click",
          DataOfCmd: key,
          Option: "false",
          TypeOfRemote: "SendRemoteKey"
        }
      }));
      return;
    }

    if (msg.type === "disconnect") {
      if (tv) try { tv.close(); } catch {}
      tv = null;
    }
  });

  browser.on("close", () => {
    if (tv) try { tv.close(); } catch {}
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Crystal Remote running on http://localhost:${port}`));
