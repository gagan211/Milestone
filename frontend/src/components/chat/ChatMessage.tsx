import React from 'react';
import { cn } from '../../lib/utils';
import { Bot, User, UserCircle } from 'lucide-react';

export type ChatRole = 'client' | 'developer' | 'ai';

export interface Message {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser }) => {
  const isAI = message.role === 'ai';
  
  // Format timestamp (e.g. "10:42 AM")
  const timeString = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cn("flex w-full mb-6", isCurrentUser ? "justify-end" : "justify-start")}>
      {!isCurrentUser && (
        <div className="flex-shrink-0 mr-3 mt-1">
          {isAI ? (
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
              <Bot size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
              {message.role === 'client' ? <User size={18} /> : <UserCircle size={18} />}
            </div>
          )}
        </div>
      )}

      <div className={cn(
        "flex flex-col max-w-[75%]", 
        isCurrentUser ? "items-end" : "items-start"
      )}>
        {!isCurrentUser && (
          <span className="text-xs font-medium text-gray-500 mb-1 ml-1 capitalize">
            {message.role}
          </span>
        )}
        
        <div className={cn(
          "px-4 py-2.5 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed",
          isCurrentUser 
            ? "bg-black text-white rounded-tr-sm" 
            : isAI 
              ? "bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-tl-sm"
              : "bg-white border border-gray-200 text-gray-900 rounded-tl-sm"
        )}>
          {message.content}
        </div>
        
        <span className="text-[10px] text-gray-400 mt-1 font-medium px-1">
          {timeString}
        </span>
      </div>
    </div>
  );
};
