import Websocket from "ws";

export interface IWebsocket extends Websocket {
  isAlive?: boolean;
  missedHeartbeats?: number;
}
