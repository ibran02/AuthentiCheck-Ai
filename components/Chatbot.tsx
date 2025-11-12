import React, { useState, useEffect, useRef } from 'react';
import { sendMessage } from '../services/chatService';
import type { ChatMessage } from '../types';
import { SendIcon, CloseIcon, LuciIcon } from './Icons';

interface ChatbotProps {
  onClose: () => void;
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1.5 pl-4">
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
  </div>
);

export const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Initial greeting from Luci
  useEffect(() => {
    const getInitialGreeting = async () => {
      setIsLoading(true);
      setMessages([]); // Clear previous history if any
      const stream = await sendMessage("Hello", []);
      let fullResponse = "";
      for await (const chunk of stream) {
        fullResponse += chunk;
      }
      setMessages([{ role: 'model', parts: [{ text: fullResponse }] }]);
      setIsLoading(false);
    };
    getInitialGreeting();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Add a placeholder for the model's response
    setMessages((prev) => [...prev, { role: 'model', parts: [{ text: '' }] }]);

    try {
      const stream = await sendMessage(input, messages);
      for await (const chunk of stream) {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            const updatedText = lastMessage.parts[0].text + chunk;
            // FIX: Explicitly create a new ChatMessage array to fix type inference issue.
            const updatedMessages: ChatMessage[] = [...prev.slice(0, -1), { role: 'model', parts: [{ text: updatedText }] }];
            return updatedMessages;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
             // FIX: Explicitly create a new ChatMessage array to fix type inference issue.
             const updatedMessages: ChatMessage[] = [...prev.slice(0, -1), { role: 'model', parts: [{ text: "Sorry, I'm having a little trouble right now. Please try again later." }] }];
             return updatedMessages;
          }
          return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] flex flex-col bg-white rounded-2xl shadow-2xl z-50 animate-fade-in-up border border-slate-200/80">
      <header className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <LuciIcon className="w-8 h-8"/>
          <div>
            <h3 className="font-bold text-lg">Luci</h3>
            <p className="text-sm opacity-90">Your AI Assistant</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors" aria-label="Close chat">
          <CloseIcon className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
        <div className="flex flex-col space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <LuciIcon className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <div className={`max-w-xs md:max-w-sm px-4 py-2.5 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-lg' : 'bg-slate-200 text-slate-800 rounded-bl-lg'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
               <TypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white rounded-b-2xl flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 w-full px-4 py-2 bg-slate-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Chat input"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 flex-shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center disabled:bg-slate-400 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Send message"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
