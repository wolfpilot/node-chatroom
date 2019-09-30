export type IMessageType = "register" | "broadcast";

export interface IMessage {
  type?: IMessageType;
  text: string;
}
