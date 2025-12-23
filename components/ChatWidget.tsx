
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NeumorphicCard from './NeumorphicCard';
import { chatWithAI } from '../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

interface ChatWidgetProps {
  contextData: any;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Assalamualaikum... Saya **UNI AI**. Ada yang bisa saya bantu terkait data LPH UNISMA hari ini?\n\n*Silakan tanyakan tentang sertifikasi, jadwal, atau struktur internal.* \n\nWassalamualaikum.',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const aiResponseText = await chatWithAI(input, contextData);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponseText || "Maaf, saya tidak dapat memproses permintaan tersebut.",
      sender: 'ai',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[450px] h-[600px] flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
          <NeumorphicCard className="flex-1 flex flex-col p-0 overflow-hidden border border-white/40 shadow-2xl bg-[#E0E5EC]/95 backdrop-blur-lg">
            {/* Header */}
            <div className="p-4 bg-indigo-500 text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-black text-sm leading-none">UNI AI Assistant</h3>
                  <span className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Sistem Informasi LPH</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-[#E0E5EC]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm ${msg.sender === 'user' ? 'bg-indigo-100 text-indigo-500' : 'bg-white text-slate-400'}`}>
                      {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-4 rounded-3xl text-[13px] leading-relaxed font-medium shadow-sm prose-custom ${
                      msg.sender === 'user' 
                        ? 'neu-inset bg-indigo-50 text-slate-700' 
                        : 'neu-flat bg-white text-slate-600 border border-white/50'
                    }`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                     <div className="shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center bg-white text-slate-400">
                        <Bot size={16} />
                     </div>
                     <div className="p-4 rounded-3xl neu-flat bg-white flex gap-1.5 items-center">
                        <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                     </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/30 backdrop-blur-sm border-t border-white/40">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-3"
              >
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ketik pertanyaan Anda..."
                  className="flex-1 p-3.5 neu-inset rounded-2xl outline-none text-[13px] font-bold text-slate-600 bg-[#E0E5EC]"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-3.5 bg-indigo-500 text-white rounded-2xl neu-button shadow-md active:scale-90 transition-transform disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </NeumorphicCard>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-2xl shadow-xl transition-all duration-300 active:scale-90 flex items-center gap-3 ${
          isOpen ? 'bg-rose-500 text-white rotate-90' : 'bg-indigo-500 text-white'
        } neu-button border border-white/20`}
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
        {!isOpen && <span className="font-black text-sm uppercase tracking-widest hidden sm:block pr-2">Tanya UNI AI</span>}
      </button>
    </div>
  );
};

export default ChatWidget;
