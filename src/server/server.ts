import dotenv from "dotenv";

import express from "express";
import http from "http";
import Websocket from "ws";

/* Types */
import { AddressInfo } from "net";
import { IWebsocket, IMessage } from "../types/";

// Utils
import * as wsHelpers from "./utils/wsHelpers";

/* Setup */
dotenv.config();

// Parse .env variables
const SERVER_PORT = parseInt(process.env.SERVER_PORT!, 10);
const WEBSOCKETS_PORT = parseInt(process.env.WEBSOCKETS_PORT!, 10);

// Setup local variables
const HEARTBEAT_INTERVAL = 10000;

const app = express();
const server = http.createServer(app);
const wss = new Websocket.Server({
  port: WEBSOCKETS_PORT,
  server,
});

/* Utils */
const keepAlive = (ws: IWebsocket) => {
  ws.isAlive = true;
  ws.missedHeartbeats = 0;
};

const handleSocketRequest = (
  wss: Websocket.Server,
  ws: IWebsocket,
  message: IMessage
) => {
  switch (message.type) {
    case "broadcast":
      wsHelpers.broadcast(wss, ws, message.text);
      break;
    default:
      wsHelpers.echo(ws, message.text);
  }
};

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

      if (!json.text) {
        ws.send("Text field is required and missing.");

        return;
      }
    } catch (err) {
      ws.send(`Cannot parse data, error: ${err.text}`);

      return;
    }

    handleSocketRequest(wss, ws, json);
  });
});

server.listen(SERVER_PORT, () => {
  const { port } = server.address() as AddressInfo;

  console.log("\n");
  console.log(`🔥  Server started on port: ${port}`);
  console.log(`🔥  Websockets started on port: ${WEBSOCKETS_PORT}`);
  console.log("\n");

  setInterval(() => wsHelpers.checkHeartbeat(wss), HEARTBEAT_INTERVAL);
});

export default server;
