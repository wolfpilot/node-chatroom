import express from "express";
import http from "http";
import Websocket from "ws";

/* Types */
import { AddressInfo } from "net";

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

wss.on("connection", ws => {
  // Send on connection
  ws.send("WebSocket server started.");

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
