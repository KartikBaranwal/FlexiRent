"use client";
import React from 'react';
import { Button } from '@/components/ui/Button';

export default function SupportPage() {
  const faqs = [
    {
      q: "How does the rental process work?",
      a: "Simply browse our catalog, select your items, choose a rental tenure, and checkout. We deliver and assemble everything for free within 48 hours."
    },
    {
      q: "Is there a security deposit?",
      a: "No! FlexiRent is a zero-deposit platform. You only pay the monthly rent and a small one-time processing fee at checkout."
    },
    {
      q: "Can I swap items if I change my mind?",
      a: "Yes! You can request a swap directly from your dashboard. Our team will deliver the new item and pick up the old one."
    },
    {
      q: "What happens if I damage an item?",
      a: "We cover minor wear and tear for free. For significant damage, our technician will assess the repair cost, which is usually covered by our basic protection plan."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-32 pb-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-black mb-6 tracking-tighter">How can we help?</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">Search our knowledge base or get in touch with our 24/7 support team.</p>
          
          <div className="mt-10 max-w-xl mx-auto relative">
            <input type="text" placeholder="Search for help..." className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            <button className="absolute right-3 top-3 bg-indigo-600 p-2 rounded-xl">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:shadow-xl transition-all">
            <div className="text-3xl mb-4">🚚</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Order & Delivery</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Everything you need to know about placing an order and our 48-hour delivery guarantee.</p>
          </div>
          <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:shadow-xl transition-all">
            <div className="text-3xl mb-4">🛠️</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Maintenance & Swaps</h3>
            <p className="text-slate-600 text-sm leading-relaxed">How to request repairs, cleaning, or swap your items for something new as your life changes.</p>
          </div>
          <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:shadow-xl transition-all">
            <div className="text-3xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Billing & Account</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Manage your monthly payments, update your profile, and understand our zero-deposit policy.</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-10 text-center tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h4>
                <p className="text-slate-600 font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 bg-indigo-600 rounded-[3rem] p-10 sm:p-16 text-white text-center shadow-2xl shadow-indigo-200">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Still have questions?</h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">Our support team is available 24/7 to help you with any issues or queries.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="border-white text-white hover:bg-white/10 px-10 h-14 rounded-2xl font-bold text-lg">Contact Support</Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10 px-10 h-14 rounded-2xl font-bold text-lg">Send an Email</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
