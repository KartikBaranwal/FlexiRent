"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg>
);

export default function BundlesPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [dbBundles, setDbBundles] = useState<any[]>([]);
  const { addToCart, cart, showToast } = useAppContext();
  const router = useRouter();

  React.useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bundles`)
      .then(res => res.json())
      .then(data => {
        setDbBundles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleGenerate = async () => {
    if (!prompt) return;
    // Keeping button interaction visually active as requested 
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.scrollTo({ top: 600, behavior: "smooth" });
    }, 1000);
  };

  const addBundleToCart = (bundleTarget: any) => {
    if (bundleTarget && bundleTarget.items) {
      const bundleId = `bundle-${bundleTarget.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || bundleTarget._id}`;
      const exists = cart.find(i => i._id === bundleId);
      if (exists) {
        showToast("This combo is already in your cart");
        return;
      }
      
      const bundleProduct = {
        _id: bundleId,
        name: bundleTarget.name,
        monthlyRent: bundleTarget.monthlyRent || bundleTarget.price,
        imageUrl: bundleTarget.imageUrl || bundleTarget.items[0]?.imageUrl || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800',
        quantity: 1
      };
      addToCart(bundleProduct);
      router.push('/cart');
    }
  };

  return (
    <div className="min-h-[90vh] relative overflow-hidden bg-slate-50 pt-20 pb-24">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="text-center max-w-2xl mx-auto mb-16 relative">
          <div className="inline-flex items-center justify-center p-3 sm:mb-6 mb-4 bg-white text-indigo-600 rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50 transform hover:-translate-y-1 transition-transform duration-300">
             <BotIcon />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            AI Bundle <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Architect</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            Describe your lifestyle, budget, or space. Our AI will curate the perfect collection of premium rental items instantly.
          </p>
        </div>

        {/* INPUT CARD */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-3 sm:p-4 shadow-2xl shadow-indigo-100/50 border border-white mb-16 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative">
            <textarea
              className="w-full bg-white/50 border-2 border-slate-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 rounded-3xl p-6 sm:p-8 text-lg sm:text-xl text-slate-800 placeholder-slate-400 outline-none resize-none min-h-[180px] transition-all duration-300 shadow-inner"
              placeholder="E.g., 'I am a software engineer needing a complete home office setup under ₹3000/month...'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
              <Button 
                onClick={handleGenerate} 
                disabled={loading || prompt.length < 5}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl px-6 py-4 flex items-center gap-2 shadow-lg shadow-slate-900/20 transition-all hover:scale-105 active:scale-95 border-0"
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
                    <span className="font-medium">Architecting...</span>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-lg">Generate Bundle</span>
                    <SparklesIcon />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* LOADING STATE - SKELETON */}
        {loading && (
           <div className="animate-pulse bg-white/60 backdrop-blur-lg rounded-[2.5rem] p-8 sm:p-12 border border-white shadow-2xl shadow-indigo-100/40 mb-12">
              <div className="h-10 bg-indigo-100/50 rounded-full w-1/3 mb-6"></div>
              <div className="h-5 bg-slate-100 rounded-full w-2/3 mb-10"></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1, 2, 3].map(n => (
                    <div key={n} className="h-64 bg-slate-50/80 rounded-3xl border border-slate-100"></div>
                 ))}
              </div>
           </div>
        )}

        {/* RESULT CARD */}
        {/* RESULT CARD MAPPED FROM DB */}
        {!loading && dbBundles && dbBundles.length > 0 && (
          <div className="flex flex-col gap-12 mt-12">
            {dbBundles.map((bundle, index) => (
              <div key={bundle._id || index} className="transform transition-all duration-700 translate-y-0 opacity-100 animate-in fade-in slide-in-from-bottom-12">
                <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[3rem] p-1 shadow-2xl shadow-purple-500/20 relative">
                  
                  <div className="bg-white rounded-[2.8rem] p-6 sm:p-12 relative z-10 h-full">
                    
                    {/* HEADER */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 border-b border-slate-100 pb-10">
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-widest uppercase mb-5 border border-indigo-100 shadow-sm">
                          <SparklesIcon />
                          Curated Premium Collection
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                          <span className="text-slate-900">{bundle.name}</span>
                        </h2>
                        <p className="text-slate-500 text-xl font-medium">{bundle.description || 'A highly curated set seamlessly matched for your space.'}</p>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl shadow-sm min-w-[220px]">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Bundle Total</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-black text-indigo-600 tracking-tighter">₹{(bundle.monthlyRent || bundle.price || 0).toLocaleString()}</span>
                          <span className="text-slate-500 font-bold">/mo</span>
                        </div>
                      </div>
                    </div>

                    {/* ITEMS GRID */}
                    <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                      Included Premium Items
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">{bundle.items?.length || 0}</span>
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                      {bundle.items?.map((item: any, i: number) => (
                        <div 
                          key={item._id || i} 
                          className="group bg-white border-2 border-slate-50 hover:border-indigo-100 p-5 rounded-[2rem] transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-2 flex flex-col h-full"
                        >
                          <div className="aspect-square w-full rounded-2xl overflow-hidden mb-6 bg-slate-50 relative">
                            <img
                              src={item.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-between px-2">
                            <h4 className="font-bold text-slate-800 text-xl mb-3 leading-tight group-hover:text-indigo-600 transition-colors">
                              {item.name}
                            </h4>
                            <div className="flex items-center justify-between mt-auto pt-5 border-t-2 border-slate-50">
                              <p className="text-indigo-600 font-black text-xl">
                                ₹{item.monthlyRent || item.price || 0}<span className="text-sm font-bold text-slate-400">/mo</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ACTION BUTTON */}
                    <div className="flex flex-col items-end pt-8 border-t border-slate-100">
                      <div className="flex gap-4 w-full sm:justify-end">
                        <Button 
                          onClick={() => addBundleToCart(bundle)} 
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-8 px-12 rounded-[2rem] shadow-2xl shadow-blue-600/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border-0"
                        >
                          Add Entire Bundle to Cart
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </Button>
                        {/* Removed View Details link */}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-4 font-medium text-right max-w-sm">
                        * Images are for illustration purposes only. Actual products may vary.
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}