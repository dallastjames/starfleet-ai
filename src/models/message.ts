import { MessageAuthor } from "../enums";

export interface Message {
  id: string;
  text: string;
  createdAt: Date;
  createdBy: MessageAuthor.TYPE;
}
