export type IMessageType = "broadcast";

export interface IMessage {
  type?: IMessageType;
  text: string;
}
