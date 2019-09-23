import Websocket from "ws";

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

export const echo = (ws: Websocket, text: string) =>
  ws.send(`Message received: ${text}`);
