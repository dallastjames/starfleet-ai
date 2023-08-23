import { createSignal } from "solid-js";
import { Message } from "../../models/message";
import { MessageAuthor } from "../../enums";
import { Chat } from "../../models/chat";

const [messages, setMessages] = createSignal<Message[]>([
  {
    id: "1",
    createdAt: new Date(),
    createdBy: MessageAuthor.Human,
    text: `In the Genesys Role Playing Game, design a talent that encourages a melee character to move in combat`,
  },
  {
    id: "2",
    createdAt: new Date(),
    createdBy: MessageAuthor.Ai,
    text: `Certainly! Here's a talent designed specifically for the Genesys Role Playing Game that encourages a melee character to remain mobile during combat:

  **Name:** Dance of Battle
  
  **Tier:** 2
  
  **Activation:** Passive
  
  **Rank:** 1
  
  **Description:** Trained in the graceful arts of combat, a character with this talent learns to utilize movement as both an offense and defense. Their combat style is reminiscent of a dance, making them both deadly and hard to pin down.
  
  **Effect:** Every time the character moves at least one range band during their turn, they gain a boost die (a blue d6) to their next melee attack made in that same turn. If they also avoid being hit in melee combat until their next turn, they receive a boost die (a blue d6) to their melee defense for the next incoming attack. Both effects can stack if the character moves in multiple turns consecutively, but the maximum number of boost dice that can be gained from this talent is 3. 
  
  **Special:** If the character makes a successful melee attack after moving two or more range bands in a single turn, the target suffers 1 strain due to the difficulty of defending against such a swiftly moving opponent. This strain is not reduced by soak.
  
  This talent provides both offensive and defensive benefits for characters that stay on the move. The offensive boost rewards aggressive maneuvering, while the defensive boost provides some protection for characters that stay mobile. The added strain effect for larger moves is a fun bonus that represents the psychological and physical toll on an opponent trying to defend against a rapidly moving and aggressive combatant.`,
  },
]);
const [currentChat, setCurrentChat] = createSignal<Chat | null>(null);

export function useChatContext() {
  return {
    chat: currentChat,
    messages,
    addMessage: (message: string, author: MessageAuthor.TYPE) => {
      const newMessage: Message = {
        id: "",
        createdAt: new Date(),
        createdBy: author,
        text: message,
      };
      setMessages([...messages(), newMessage]);
    },
    openChat: (chat: Chat) => setCurrentChat(chat),
  };
}
