import React, { useState, useRef, useEffect } from 'react';
import { chatbotAPI } from '../api';
import { MessageSquare, X, Send, Bot, User, Loader2, GraduationCap, MapPin, IndianRupee, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      text: "Hi! I'm the Path2Campus AI assistant. I can help you find colleges based on your rank, or answer any questions about admissions, careers, and engineering. \n\nTry asking:\n* 'Best CSE colleges for 5000 rank in EAPCET'\n* 'How to prepare for JoSAA counseling?'\n* 'Which is better: CSE or ECE?'",
      colleges: [] 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Auto-detect exam context if possible
      const exam = userMsg.toLowerCase().includes('josaa') || userMsg.toLowerCase().includes('nit') || userMsg.toLowerCase().includes('iit') ? 'josaa' : 'eapcet';
      
      const res = await chatbotAPI.send(userMsg, exam);
      
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: res.data.response,
        colleges: res.data.colleges || [],
        exam: res.data.parsedQuery?.exam || exam
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: 'Oops! I encountered an error. Please make sure the Groq API key is set correctly in the backend .env file.',
        colleges: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-50 group border-4 border-white"
      >
        <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-[400px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300" style={{height: '600px', maxHeight: 'calc(100vh - 100px)'}}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 p-5 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Campus Buddy</h3>
            <div className="flex items-center gap-1.5 text-xs text-blue-100">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online | Powered by Groq
            </div>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-md">
                <Bot size={16}/>
              </div>
            )}
            <div className="flex flex-col gap-2 max-w-[85%]">
              <div className={`rounded-2xl p-4 text-sm shadow-sm ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none prose prose-slate prose-sm'
              }`}>
                {m.role === 'user' ? m.text : <ReactMarkdown>{m.text}</ReactMarkdown>}
              </div>

              {/* College Results rendering */}
              {m.colleges && m.colleges.length > 0 && (
                <div className="flex flex-col gap-2 mt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Top Recommendations</span>
                  <div className="flex flex-col gap-2">
                    {m.colleges.map((c, idx) => (
                      <Link 
                        key={idx}
                        to={`/${m.exam}/college/${c._id}`}
                        className="bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-400 hover:shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-slate-800 text-xs line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {c.institute_name || c.institute}
                          </h4>
                          <ExternalLink size={12} className="text-slate-400 flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">
                          <GraduationCap size={12} />
                          <span className="truncate">{c.branch_name || c.program_name}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {c.cutoff ? `Cutoff: ${c.cutoff}` : c.closing_rank ? `Rank: ${c.closing_rank}` : 'Available'}
                          </div>
                          {c.tuition_fee && (
                             <div className="flex items-center gap-0.5 text-[10px] text-slate-600">
                               <IndianRupee size={10} />
                               {(c.tuition_fee / 1000).toFixed(0)}k
                             </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0 mt-1">
                <User size={16}/>
              </div>
            )}
          </div>
        ))}
        {loading && (
           <div className="flex gap-3 justify-start">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
               <Bot size={16}/>
             </div>
             <div className="bg-white border border-slate-200 rounded-2xl py-3 px-4 shadow-sm flex items-center gap-2">
               <Loader2 size={16} className="text-blue-600 animate-spin" />
               <span className="text-xs text-slate-500 font-medium italic">Buddy is thinking...</span>
             </div>
           </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about colleges..." 
            className="w-full pl-4 pr-12 py-3.5 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-slate-700"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()} 
            className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
          Path2Campus AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
