import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="mt-20">

      <div className="bg-slate-900 pt-16 pb-8 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trust Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shadow-inner border border-slate-700">🚚</div>
              <div><p className="text-white font-bold">Free Delivery</p><p className="text-slate-500 text-sm">In 24 hours</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shadow-inner border border-slate-700">💳</div>
              <div><p className="text-white font-bold">No Deposit</p><p className="text-slate-500 text-sm">Zero hidden fees</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shadow-inner border border-slate-700">🔄</div>
              <div><p className="text-white font-bold">Cancel Anytime</p><p className="text-slate-500 text-sm">Ultimate flexibility</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shadow-inner border border-slate-700">👥</div>
              <div><p className="text-white font-bold">1000+ Users</p><p className="text-slate-500 text-sm">Trusted community</p></div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-4 tracking-tight">
                Smart Rental AI.
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs md:max-w-sm">
                Pioneering the future of flexible living. Rent premium furniture, appliances, and smart devices curated by Artificial Intelligence.
              </p>
            </div>

            <div className="lg:col-span-1">
              <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Categories</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link href="/products" className="hover:text-white transition-colors">Packages & Combos</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors">Living Room</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors">Appliances</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors">Work From Home</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-1">
              <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">Support</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link href="/support" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Delivery FAQs</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            <div className="col-span-2 lg:col-span-2 lg:pl-8 lg:border-l border-slate-800">
              <h4 className="text-white font-bold mb-4 tracking-wider text-sm uppercase">Stay Updated</h4>
              <p className="text-slate-400 text-sm mb-4">Subscribe for exclusive updates.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Enter your email" className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white w-full focus:outline-none focus:border-indigo-500 transition-colors" />
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors">Go</button>
              </div>
              <div className="flex gap-4 mt-8">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 hover:-translate-y-1 transition-all font-bold">𝕏</a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 hover:-translate-y-1 transition-all font-bold">in</a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 hover:-translate-y-1 transition-all font-bold">ig</a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-500 text-center md:text-left font-medium">
              &copy; {new Date().getFullYear()} FlexiRent. Built for the modern lifestyle.
            </p>
            <div className="flex gap-4 mt-6 md:mt-0 font-bold text-slate-600 tracking-widest text-xs uppercase">
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
