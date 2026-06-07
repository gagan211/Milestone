import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MessageSquareText } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { ChatMessage } from '../components/chat/ChatMessage';
import type { Message, ChatRole } from '../components/chat/ChatMessage';
import { ChatInput } from '../components/chat/ChatInput';
import { toast } from 'sonner';

export default function MilestoneChat() {
  const { projectId, milestoneId } = useParams<{ projectId: string, milestoneId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mock initial data
  useEffect(() => {
    // In a real app, this would fetch from GET /api/projects/:projectId/milestones/:milestoneId/chat
    const initialMessages: Message[] = [
      {
        id: '1',
        role: 'ai',
        content: 'Welcome to the negotiation chat for this milestone. Discuss the requirements here, and when both parties are aligned, click "Finalize Spec".',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        role: 'client',
        content: 'I need the backend to return the profile data in a specific JSON format matching the layout blocks.',
        timestamp: new Date(Date.now() - 3000000).toISOString()
      },
      {
        id: '3',
        role: 'developer',
        content: 'Sure, I can map the database JSONB field directly to the response payload. Should the profile be publicly viewable without authentication?',
        timestamp: new Date(Date.now() - 2500000).toISOString()
      }
    ];
    setMessages(initialMessages);
  }, [projectId, milestoneId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (content: string) => {
    // Determine role based on session. Hardcoded to developer for now as a mock.
    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'developer' as ChatRole, 
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMsg]);

    // Simulate AI interjection occasionally
    if (Math.random() > 0.7) {
      setIsSubmitting(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + 'ai',
          role: 'ai',
          content: 'Just clarifying: does this mean the feature requires real-time updates or just manual refresh?',
          timestamp: new Date().toISOString()
        }]);
        setIsSubmitting(false);
      }, 1500);
    }
  };

  const handleFinalize = () => {
    toast.success('Spec finalization requested. The AI is generating the benchmark draft...', {
      description: 'You will be able to review the JSON draft before it locks.'
    });
    // In a real app, this would trigger POST /api/milestones/:id/finalize
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Header Context */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to={`/projects/${projectId}`}
              className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <MessageSquareText size={16} className="text-blue-600" />
                <h1 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Milestone Negotiation</h1>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Discussing requirements before locking the spec</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8" ref={scrollRef}>
        <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
          {messages.map(msg => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              isCurrentUser={msg.role === 'developer'} // Mocking current user as developer
            />
          ))}
        </div>
      </div>

      {/* Input Area */}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        onFinalize={handleFinalize}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
