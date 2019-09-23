import Websocket from "ws";

// Types
import { IWebsocket } from "../../types";

// Detect broken connections. For more info, see:
// https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
export const checkHeartbeat = (wss: Websocket.Server) => {
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
};

// Broadcast to all connected WebSockets except for the server itself
export const broadcast = (
  wss: Websocket.Server,
  ws: Websocket,
  text: string
) => {
  wss.clients.forEach(client => {
    if (client === ws || client.readyState !== Websocket.OPEN) {
      return;
    }

    client.send(`@all: ${text}`);
  });
};

// Echo message back to client
export const echo = (ws: Websocket, text: string) =>
  ws.send(`Message received: ${text}`);
