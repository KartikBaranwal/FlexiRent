"use client";
import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-10 sm:p-16 rounded-[3rem] shadow-xl border border-slate-100">
        <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">Terms and Conditions</h1>
        <p className="text-slate-500 mb-10 font-medium">Last Updated: October 2023</p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-slate-600 leading-relaxed font-medium">By accessing and using FlexiRent, you agree to be bound by these terms and conditions. If you do not agree, please do not use our services.</p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Rental Policy</h2>
          <p className="text-slate-600 leading-relaxed font-medium mb-4">All rentals are subject to availability and our 24-hour delivery commitment. The rental period begins on the day of delivery.</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 font-medium">
            <li>Minimum rental tenure is 1 month.</li>
            <li>Normal wear and tear is covered at no extra cost.</li>
            <li>Free maintenance and relocations are included but any major damage due to misuse may incur repair or replacement charges.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Privacy Policy</h2>
          <p className="text-slate-600 leading-relaxed font-medium">We respect your privacy and process your personal data in accordance with our data protection policy. We never sell your personal information to third parties.</p>
          <div className="mt-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wider">Data Collection</h4>
            <p className="text-sm text-slate-600">We collect information such as your name, contact details, delivery address, and payment history to provide our rental services effectively.</p>
          </div>
        </section>

        <section className="mb-12 border-t border-slate-100 pt-12 text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Need deep details?</h2>
            <p className="text-slate-500 font-medium mb-8">Download our full legal framework or contact our legal team.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-slate-900 text-white px-8 h-12 rounded-xl font-bold text-sm shadow-lg">Download PDF</button>
                <button className="bg-white border border-slate-200 text-slate-600 px-8 h-12 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">Contact Legal</button>
            </div>
        </section>
      </div>
    </div>
  );
}
