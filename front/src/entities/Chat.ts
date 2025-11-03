// src/entities/Chat.ts
export interface ChatType {
  id: string;
  title: string;
  preview?: string;
  message_count?: number;
  last_activity?: string;
}

// Dummy in-memory chat list for demonstration
let chats: ChatType[] = [
  {
    id: "1",
    title: "Welcome Chat",
    preview: "Hello!",
    message_count: 1,
    last_activity: new Date().toISOString(),
  },
];

export const Chat = {
  list: async (sortBy?: string): Promise<ChatType[]> => {
    // Optionally sort by last_activity
    if (sortBy === "-last_activity") {
      return [...chats].sort((a, b) => (b.last_activity || "") > (a.last_activity || "") ? 1 : -1);
    }
    return chats;
  },
  create: async (data: Partial<ChatType>): Promise<ChatType> => {
    const newChat: ChatType = {
      id: (Math.random() * 100000).toFixed(0),
      title: data.title || "Untitled Chat",
      preview: data.preview || "",
      message_count: data.message_count || 0,
      last_activity: new Date().toISOString(),
    };
    chats.push(newChat);
    return newChat;
  },
};

export default Chat;
