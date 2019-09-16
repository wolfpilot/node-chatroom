import express from "express";
import http from "http";
import Websocket from "ws";

/* Types */
import { AddressInfo } from "net";

interface IWebsocket extends Websocket {
  isAlive?: boolean;
  missedHeartbeats?: number;
}

/* Setup */
const app = express();
const server = http.createServer(app);
const wss = new Websocket.Server({ server });

/* Utils */
// Broadcast to all connected WebSockets except for the server itself
const broadcast = (ws: Websocket, msg: string) => {
  wss.clients.forEach(client => {
    if (client === ws || client.readyState !== Websocket.OPEN) {
      return;
    }

    client.send(`@all: ${msg}`);
  });
};

const keepAlive = (ws: IWebsocket) => {
  ws.isAlive = true;
  ws.missedHeartbeats = 0;
};

// Detect broken connections. For more info, see:
// https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
setInterval(() => {
  if (!wss.clients.size) {
    return;
  }

  wss.clients.forEach((client: IWebsocket) => {
    if (
      typeof client.isAlive === "undefined" ||
      typeof client.missedHeartbeats === "undefined"
    ) {
      return;
    }

    try {
      if (client.missedHeartbeats >= 3) {
        throw new Error("Too many missed heartbeats.");
      }

      if (client.isAlive === false) {
        return client.terminate();
      }

      client.isAlive = false;
      client.missedHeartbeats++;
      client.ping();
    } catch (err) {
      console.warn(`Closing connection. Reason: ${err.message}`);

      client.close();
    }
  });
}, 10000);

wss.on("connection", (ws: IWebsocket) => {
  // Send on connection
  ws.send("WebSocket server started.");

  ws.isAlive = true;
  ws.missedHeartbeats = 0;

  ws.on("pong", () => keepAlive(ws));

  ws.on("message", (data: string) => {
    let json;

    try {
      json = JSON.parse(data);

      if (!json.message) {
        ws.send("Message field is required and missing.");

        return;
      }
    } catch (err) {
      ws.send(`Cannot parse data, error: ${err.message}`);

      return;
    }

    if (json.type === "broadcast") {
      broadcast(ws, json.message);

      return;
    }

    ws.send(`Message received: ${json.message}`);
  });
});

server.listen(process.env.SERVER_PORT, () => {
  const { port } = server.address() as AddressInfo;

  console.log(`Server started on port: ${port}`);
});

export default server;
