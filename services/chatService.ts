import { GoogleGenAI, Chat } from "@google/genai";
import type { ChatMessage } from '../types';

let chat: Chat | null = null;

const getChat = (): Chat => {
  if (!chat) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are Luci, a friendly and helpful AI assistant for the AuthentiCheck AI app. Your goal is to answer user questions about product authenticity, how the app works, and general inquiries about counterfeit products. Be concise, cheerful, and use simple language. Start your first message with a friendly greeting like 'Hi there! I'm Luci. How can I help you today?'.",
      },
    });
  }
  return chat;
};

export const sendMessage = async (
  message: string,
  history: ChatMessage[]
): Promise<AsyncGenerator<string, void, unknown>> => {
  const chatInstance = getChat();

  const stream = await chatInstance.sendMessageStream({ message });

  async function* processStream() {
    for await (const chunk of stream) {
      yield chunk.text;
    }
  }

  return processStream();
};