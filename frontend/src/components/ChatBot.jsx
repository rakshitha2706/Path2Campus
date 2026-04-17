import React, { useState, useRef, useEffect } from 'react';
import { chatbotAPI } from '../api';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I am the Path2Campus AI assistant. Try asking: "Best CSE colleges under 30k rank in EAPCET" or "NITs under 10000 rank in JoSAA"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState('eapcet');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Auto-detect exam from input, default to current 
      const e = userMsg.toLowerCase().includes('josaa') || userMsg.toLowerCase().includes('nit') || userMsg.toLowerCase().includes('iit') ? 'josaa' : 'eapcet';
      
      const res = await chatbotAPI.send(userMsg, e);
      let botResp = res.data.response;
      
      if (res.data.colleges && res.data.colleges.length > 0) {
        botResp += '\n\nTop matches:\n' + res.data.colleges.map((c, i) => `${i+1}. ${c.institute_name || c.institute} - ${c.branch_name || c.program_name}`).join('\n');
      }

      setMessages(prev => [...prev, { role: 'bot', text: botResp }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Oops! Something went wrong connecting to my brain. Try again?' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-transform z-50 animate-pulse-glow"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-slide-in" style={{height: '500px', maxHeight: 'calc(100vh - 48px)'}}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          <Bot size={20} /> AI Assistant
        </div>
        <button onClick={() => setIsOpen(false)} className="text-blue-100 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'bot' && <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0"><Bot size={16}/></div>}
            <div className={`max-w-[80%] rounded-2xl p-3 text-sm whitespace-pre-wrap ${
              m.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex gap-3 justify-start">
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Bot size={16}/></div>
             <div className="bg-white border border-slate-200 rounded-2xl py-3 px-4 shadow-sm flex gap-1">
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
             </div>
           </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything..." 
          className="flex-1 form-input text-sm rounded-full bg-slate-50"
        />
        <button type="submit" disabled={loading||!input.trim()} className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-50">
           <Send size={16} className="-ml-0.5 mt-0.5" />
        </button>
      </form>
    </div>
  );
}
