import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { SparklesIcon, XMarkIcon } from './Icon';

interface ChatPanelProps {
  messages: ChatMessage[];
  isOpen: boolean;
  onClose: () => void;
  isStreaming: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isOpen, onClose, isStreaming }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col h-full absolute right-0 top-0 z-20 shadow-2xl transition-all duration-300">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
        <div className="flex items-center space-x-2 text-blue-400 font-semibold">
          <SparklesIcon />
          <span>Gemini Assistant</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <XMarkIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
            <div className="text-center text-slate-500 mt-10">
                <p>Run an analysis or ask a question to start.</p>
            </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-lg p-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-700 text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.role === 'model' ? (
                 <div className="prose prose-invert prose-sm max-w-none">
                     <ReactMarkdown>{msg.content}</ReactMarkdown>
                 </div>
              ) : (
                msg.content
              )}
            </div>
            <span className="text-xs text-slate-500 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isStreaming && (
            <div className="flex items-center space-x-2 text-blue-400 text-sm animate-pulse">
                <SparklesIcon />
                <span>Gemini is thinking...</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
