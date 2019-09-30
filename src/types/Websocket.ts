import Websocket from "ws";

export interface IWebsocket extends Websocket {
  id?: string;
  isAlive?: boolean;
  missedHeartbeats?: number;
}
