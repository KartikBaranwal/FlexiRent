"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import { useAppContext } from '@/context/AppContext';



export const ChatWidget = () => {
  const { user, addToCart, showToast } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string, bundleAction?: any }[]>([
    { role: 'ai', content: "Hey there, how can I help you?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    const tooltipTimer = setTimeout(() => {
      if (!isOpen) setShowTooltip(true);
    }, 4000);

    const openTimer = setTimeout(() => {
      // setIsOpen(true); User requested not to auto open until clicked
      setShowTooltip(false);
    }, 15000);

    return () => {
      clearTimeout(tooltipTimer);
      clearTimeout(openTimer);
    };
  }, []);

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText })
      });
      const data = await res.json();
      
      const newMsg: any = { role: 'ai', content: data.reply || "I couldn't quite understand that." };
      if (data.items && data.items.length > 0) {
         newMsg.bundleAction = { items: data.items };
      }
      setMessages(prev => [...prev, newMsg]);
    } catch(e) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting to my servers right now." }]);
    }
    
    setIsTyping(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {showTooltip && !isOpen && (
          <div className="bg-slate-900 border border-slate-700 text-white text-sm font-bold px-4 py-2 rounded-2xl mb-4 shadow-xl animate-in slide-in-from-right-10 fade-in duration-500 relative">
            Need help setting up your home?
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-slate-900 rotate-45 border-r border-b border-slate-700"></div>
          </div>
        )}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          className={`group flex items-center gap-2 h-12 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? 'bg-slate-800 text-white rotate-90 scale-90 w-12 justify-center' : 'bg-slate-900 text-white hover:scale-105 hover:shadow-2xl ring-[4px] ring-indigo-50/50 px-5'}`}
        >
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <>
              <span className="text-xl relative">💬</span>
              <span className="font-bold hidden sm:block whitespace-nowrap overflow-hidden pr-1 text-sm">Ask AI Architect</span>
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-28 right-6 w-[360px] sm:w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 flex flex-col h-[600px] max-h-[75vh] transition-all transform origin-bottom-right animate-in zoom-in-95 duration-200">
          <div className="bg-slate-900 p-6 text-white flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center">
              <div className="relative mr-4 bg-indigo-600 p-2 rounded-xl shadow-inner border border-indigo-500">
                <span className="text-2xl block relative z-10">✦</span>
              </div>
              <div>
                <h3 className="font-bold tracking-wide text-lg text-white">FlexiRent Concierge</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                  <p className="text-xs text-slate-300 font-bold tracking-widest uppercase">Active</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-slate-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50 relative scroll-smooth">


            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm shadow-sm ${msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-br-sm'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm font-medium'
                  }`}>
                  <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                  {msg.bundleAction && msg.bundleAction.items && (
                    <div className="mt-4 pt-4 border-t border-slate-200/20 space-y-2">
                      {msg.bundleAction.items.map((item: any) => (
                        <Link key={item._id} href={`/products/${item._id}`} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group">
                          <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                          <span className="text-xs font-bold text-indigo-600">₹{item.monthlyRent}/mo</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 text-slate-500 rounded-3xl rounded-bl-sm px-5 py-4 text-sm flex space-x-2 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-slate-300 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2.5 h-2.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          <div className="p-4 bg-white border-t border-slate-100 shadow-lg">
            <div className="relative flex items-center">
              <input
                type="text"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400 font-bold"
                placeholder="Ask for recommendations..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                className="absolute right-2.5 w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md"
                onClick={() => handleSend()}
                disabled={!input.trim()}
              >
                <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
