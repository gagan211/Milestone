import React, { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onFinalize: () => void;
  isSubmitting?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  onFinalize,
  isSubmitting = false 
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !isSubmitting) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4 shrink-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500 font-medium">Negotiation Phase</p>
          <button
            onClick={onFinalize}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition-colors border border-green-200 shadow-sm group"
          >
            <CheckCircle size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Finalize Spec</span>
          </button>
        </div>

        <div className="relative flex items-end space-x-2 bg-gray-50 border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-black focus-within:border-black transition-all shadow-inner">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Discuss requirements, constraints, or ask questions..."
            className="flex-1 max-h-[120px] min-h-[44px] bg-transparent border-none resize-none focus:ring-0 p-2.5 text-sm text-gray-900 placeholder-gray-400"
            rows={1}
            disabled={isSubmitting}
          />
          
          <button
            onClick={handleSend}
            disabled={!message.trim() || isSubmitting}
            className={cn(
              "p-3 rounded-lg flex items-center justify-center transition-all shrink-0 h-[44px] w-[44px]",
              message.trim() && !isSubmitting
                ? "bg-black text-white hover:bg-gray-800 shadow-md transform hover:scale-105" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            <Send size={18} className={cn(message.trim() && "translate-x-[1px] -translate-y-[1px]")} />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Press <kbd className="font-sans px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500">Enter</kbd> to send, <kbd className="font-sans px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
};
