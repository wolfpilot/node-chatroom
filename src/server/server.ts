import express from "express";
import http from "http";
import Websocket from "ws";

// Types
import { AddressInfo } from "net";

// Setup
const app = express();
const server = http.createServer(app);
const wsServer = new Websocket.Server({ server });

wsServer.on("connection", ws => {
  // Send on connection
  ws.send("WebSocket server started.");

  ws.on("message", msg => {
    console.log("received: %s", msg);
    ws.send(`Message received: ${msg}`);
  });
});

server.listen(process.env.SERVER_PORT, () => {
  const { port } = server.address() as AddressInfo;

  console.log(`Server started on port: ${port}`);
});

export default server;
