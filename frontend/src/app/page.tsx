"use client";
declare global {
  interface Window {
    Razorpay: any;
  }
}
import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Search, Sparkles, Wand2, ArrowRight, ShieldCheck, Truck, RefreshCcw, Star, PackageSearch, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

const HeroCarousel = dynamic(() => import('@/components/HeroCarousel'), { ssr: false });

export default function Home() {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(4);

  // DB State
  const [dbProducts, setDbProducts] = useState<any[]>([]); // Start empty
  const [loading, setLoading] = useState(true);
  const [dbBundles, setDbBundles] = useState<any[]>([]);

  const [showComboItems, setShowComboItems] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { addToCart, cart, setAuthModalOpen, user, showToast, aiPrompt, setAiPrompt, aiBundle: bundle, setAiBundle: setBundle } = useAppContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLoading(true);
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
    
    fetch(`${baseUrl}/api/products`)
      .then(res => {
        if (!res.headers.get("content-type")?.includes("application/json")) throw new Error("Invalid response type");
        return res.json();
      })
      .then(data => {
        const products = Array.isArray(data) ? data : [];
        setDbProducts(products.slice(0, 8));
      })
      .catch(err => {
        console.error("Home products fetch failed", err);
        setDbProducts([]);
      });

    fetch(`${baseUrl}/api/bundles`)
      .then(res => {
        if (!res.headers.get("content-type")?.includes("application/json")) throw new Error("Invalid response type");
        return res.json();
      })
      .then(data => {
        const bundles = Array.isArray(data) ? data : [];
        bundles.sort((a: any, b: any) => {
          const aIs1BHK = a.name?.toLowerCase().includes('1bhk') ? -1 : 0;
          const bIs1BHK = b.name?.toLowerCase().includes('1bhk') ? -1 : 0;
          return aIs1BHK - bIs1BHK;
        });
        setDbBundles(bundles);
      })
      .catch(err => {
        console.error("Home bundles fetch failed", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (overridePrompt?: string) => {
    const activePrompt = (typeof overridePrompt === 'string' ? overridePrompt : aiPrompt);
    if (!activePrompt.trim()) return;
    setAiPrompt(activePrompt);

    setIsGenerating(true);
    setBundle(null);

    try {
      const res = await api.post('/api/ai/generate-bundle', { requirements: activePrompt });
      const data = res.data;
      
      setBundle(data);
      
      if (data && data.items && data.items.length > 0) {
        setTimeout(() => {
          document.getElementById('generated-bundle')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    } catch (err) {
      console.error(err);
      showToast("Our AI Architect is refining its blueprints. Please try again in 15 seconds.");
      setBundle(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const addBundleToCart = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (bundle && bundle.items) {
      const bundleId = `bundle-${bundle.bundleName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const exists = cart?.find(i => i._id === bundleId);
      if (exists) {
        showToast("This combo is already in your cart");
        return;
      }

      const bundleProduct = {
        _id: bundleId,
        name: bundle.bundleName,
        monthlyRent: bundle.totalMonthlyRent,
        imageUrl: bundle.imageUrl || bundle.items[0]?.imageUrl || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80',
        quantity: 1
      };
      addToCart(bundleProduct);
      showToast('✨ Entire setup added to your cart as a single package!');
    }
  };


  const addDynamicBundleToCart = (targetBundle: any) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const comboProduct = {
      _id: targetBundle._id,
      name: targetBundle.name,
      monthlyRent: targetBundle.monthlyRent || targetBundle.price,
      imageUrl: targetBundle.imageUrl || targetBundle.items?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800',
      quantity: 1
    };
    const exists = cart?.find(i => i._id === comboProduct._id);
    if (exists) {
      showToast("This combo is already in your cart");
      return;
    }
    addToCart(comboProduct);
    router.push('/cart');
  };

  const filteredProducts = dbProducts.filter(p => !p.name.toLowerCase().includes('shoe rack'));

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Split Hero Section */}
      <section className="pt-32 pb-16 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">

            {/* LEFT: Dark Brand Block */}
            <div className="w-full lg:w-1/2 relative rounded-[3rem] overflow-hidden flex flex-col justify-end p-10 sm:p-14 min-h-[420px] lg:min-h-[500px] bg-slate-950 shadow-2xl">
              <div className="absolute inset-0 pointer-events-none">
                <div style={{
                  position: 'absolute', bottom: '10%', left: '10%',
                  width: '70%', height: '60%',
                  background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.2) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                }} />
              </div>

              <div className="relative z-10">
                <div className={`inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-8 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                  {mounted && (
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0s' }} />
                      <span>Quality Products</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0s' }} />
                      <span>Free Delivery</span>
                    </div>
                  )}
                </div>

                <h1 className="text-5xl sm:text-7xl font-black text-white leading-[0.95] mb-6 tracking-tighter">
                  Rent<br />
                  Smarter.<br />
                  <span className="text-slate-400">Live Better.</span>
                </h1>

                <p className="text-slate-400 text-base max-w-sm font-medium leading-relaxed mb-10">
                  Premium furniture &amp; appliances on flexible monthly terms. Upgrade, swap, or return — whenever life changes.
                </p>

                <div className="flex items-center gap-4">
                  <a href="/products" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold px-7 py-3.5 rounded-2xl text-sm transition-all duration-300 shadow-xl shadow-slate-900/40 hover:-translate-y-1">
                    Browse Catalog →
                  </a>
                  <div className="hidden sm:flex items-center gap-2 text-slate-500 text-xs font-bold">
                    <span className="text-slate-400">★★★★★</span>
                    <span>4.8 · 2.4k+ renters</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Carousel + Categories */}
            <div className="w-full lg:w-1/2 flex flex-col items-center gap-10">
              {/* Circular Carousel */}
              <div className="flex justify-center w-full">
                <HeroCarousel />
              </div>

              {/* Compact Category Quick Nav - Single Line Pill Layout */}
              <div className="flex flex-col sm:flex-row gap-4 w-full px-4 sm:px-0 mt-2">
                <a
                  href="/products?category=Appliances"
                  className="flex-1 group flex items-center justify-center gap-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white rounded-[2rem] py-4 px-6 transition-all duration-300 hover:shadow-lg active:scale-[0.98] shadow-md"
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-600 group-hover:border-slate-200 dark:group-hover:border-slate-500 transition-colors shadow-sm">
                    <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="Appliances" />
                  </div>
                  <div className="flex flex-col items-start translate-y-0.5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight whitespace-nowrap tracking-tight uppercase group-hover:text-indigo-600 transition-colors">Explore Appliances</h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest text-left">TVs, ACs and More</p>
                  </div>
                </a>
                <a
                  href="/products?category=Furniture"
                  className="flex-1 group flex items-center justify-center gap-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white rounded-[2rem] py-4 px-6 transition-all duration-300 hover:shadow-lg active:scale-[0.98] shadow-md"
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-600 group-hover:border-slate-200 dark:group-hover:border-slate-500 transition-colors shadow-sm">
                    <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="Furniture" />
                  </div>
                  <div className="flex flex-col items-start translate-y-0.5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight whitespace-nowrap tracking-tight uppercase group-hover:text-indigo-600 transition-colors">Explore Furniture</h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest text-left">Beds, Sofas and More</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-16 pb-12 bg-slate-50 dark:bg-slate-950 relative z-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
          {(!dbBundles || dbBundles.length === 0) && !loading && (
            <div className="text-center text-slate-500 py-10 font-medium">No curated bundles found.</div>
          )}
          {dbBundles.map((dbBundle, index) => {
            const sumOfItems = dbBundle.items?.reduce((sum: number, item: any) => sum + (item.monthlyRent || 0), 0) || 0;
            const originalRent = dbBundle.originalRent || sumOfItems || dbBundle.price || dbBundle.monthlyRent;
            const price = dbBundle.monthlyRent || dbBundle.price || 0;
            const savings = originalRent > price ? originalRent - price : 0;

            const fallbackImage = dbBundle.items?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&auto=format&fit=crop';

            return (
              <div key={dbBundle._id} className="relative mx-auto w-full animate-slide-up bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[3rem] premium-shadow border border-slate-100 dark:border-slate-800 transition-all duration-500 flex flex-col md:flex-row gap-10 items-center hover:scale-[1.01]">

                {(dbBundle.tag || index === 0) && (
                  <div className="absolute -top-5 -left-5 bg-slate-900 text-white text-sm font-black px-6 py-3 rounded-full shadow-lg transform -rotate-6 z-10 flex items-center gap-2">
                    <span className="text-amber-400 text-lg">⚡</span> {dbBundle.tag || "Popular Combo"}
                  </div>
                )}

                <div className="w-full md:w-1/2">
                  <a href={`/bundle/${dbBundle._id}`} className="block relative cursor-pointer group">
                    <img src={dbBundle.imageUrl || fallbackImage} alt={dbBundle.name} className="w-full h-72 object-cover rounded-3xl shadow-md group-hover:scale-[1.02] transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors rounded-3xl z-10"></div>
                  </a>
                </div>

                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <h3 className="text-3xl font-black text-slate-900 mb-2">
                    <span className="text-slate-900">{dbBundle.name}</span>
                  </h3>
                  <div className="mb-8">
                    <button onClick={() => setShowComboItems(showComboItems === dbBundle._id ? null : dbBundle._id)} className="text-slate-600 dark:text-slate-300 font-bold text-sm bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between w-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <span>View Included Items ({dbBundle.items?.length || 0})</span>
                      <span className={`transform transition-transform duration-300 ${showComboItems === dbBundle._id ? 'rotate-180' : 'rotate-0'}`}>▼</span>
                    </button>
                    <div className={`grid grid-cols-2 gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner overflow-hidden transition-all duration-300 origin-top ${showComboItems === dbBundle._id ? 'max-h-64 mt-2 opacity-100 scale-100' : 'max-h-0 mt-0 opacity-0 scale-95 border-none p-0'}`}>
                      {dbBundle.items?.map((item: any, i: number) => {
                        let emoji = '✨';
                        const itemName = item.name || item;
                        const lowerName = itemName.toLowerCase();
                        if (lowerName.includes('bed')) emoji = '🛏️';
                        else if (lowerName.includes('mattress')) emoji = '😴';
                        else if (lowerName.includes('wardrobe')) emoji = '👕';
                        else if (lowerName.includes('sofa')) emoji = '🛋️';
                        else if (lowerName.includes('fridge') || lowerName.includes('refrigerator') || lowerName.includes('ac ') || lowerName.includes('cooler') || lowerName.includes('appliance')) emoji = '❄️';
                        else if (lowerName.includes('washing machine') || lowerName.includes('washer')) emoji = '🧺';
                        else if (lowerName.includes('tv') || lowerName.includes('television')) emoji = '📺';
                        else if (lowerName.includes('chair') || lowerName.includes('desk')) emoji = '🪑';
                        else if (lowerName.includes('microwave') || lowerName.includes('oven')) emoji = '♨️';

                        return (
                          <div key={item._id || i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                            <span className="text-lg flex-shrink-0">{emoji}</span> <span className="truncate">{itemName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-end justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      {savings > 0 && <span className="block text-sm text-slate-400 font-bold line-through mb-1">₹{originalRent.toLocaleString()}/mo</span>}
                      <span className="block text-4xl font-black text-slate-900 dark:text-white leading-none">₹{price.toLocaleString()}<span className="text-base text-slate-500 font-bold">/mo</span></span>
                    </div>
                    {savings > 0 && (
                      <div className="text-right">
                        <span className="text-xs text-emerald-700 font-black bg-emerald-100 px-3 py-1.5 rounded-lg">Save ₹{savings.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 w-full">
                    <Button className="w-full py-6 rounded-2xl text-lg font-bold shadow-lg shadow-slate-200 bg-slate-900 hover:bg-slate-800 text-white transition-all transform hover:-translate-y-1" onClick={() => addDynamicBundleToCart(dbBundle)}>
                      Add Entire Combo
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center mt-3 font-medium">
                    * Images are for illustration purposes only. Actual products may vary.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why FlexiRent Modern Grid */}
      <section className="py-24 bg-slate-900 text-white relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 tracking-tight">The Modern Living Standard</h2>
            <p className="text-slate-400 font-medium text-lg">Experience the stress-free alternative to traditional ownership.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-[2rem] p-8 text-center hover:bg-slate-800 transition-colors">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-bold text-white mb-2">No Big Upfront Costs</h3>
              <p className="text-sm text-slate-400">Keep your cash. Pay a small refundable deposit and avoid spending ₹50,000+ when moving in.</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-[2rem] p-8 text-center hover:bg-slate-800 transition-colors">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-lg font-bold text-white mb-2">Total Flexibility</h3>
              <p className="text-sm text-slate-400">Upgrade your TV or swap out that sofa seamlessly as your lifestyle evolves.</p>
            </div>
            <div className="bg-slate-800/10 backdrop-blur-xl border border-slate-700/30 rounded-[2rem] p-8 text-center relative overflow-hidden group hover:bg-slate-800/20 transition-all">
              <div className="text-4xl mb-4 relative z-10">🚚</div>
              <h3 className="text-lg font-bold text-slate-100 mb-2 relative z-10">Free Relocation</h3>
              <p className="text-sm text-slate-400 relative z-10">Moving? We'll pack, move, and assemble your rental items at your new place for free.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Section (Dynamically Filtered) */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight" id="trending">Selection of the Month</h2>
              <p className="text-slate-500 font-medium">Curated furniture and appliances ready for instant delivery.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12 animate-in fade-in duration-700">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 border-dashed">
                <div className="text-4xl mb-6 opacity-30">🔍</div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No items discovered yet</h3>
                <p className="text-slate-500 font-medium">Our inventory is being updated. Check back in a few minutes.</p>
              </div>
            ) : (
              filteredProducts.slice(0, visibleCount).map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Inline AI Generator */}
      <section id="ai-generator" className="py-24 bg-white dark:bg-slate-900/50 relative z-10 px-6 transition-colors">
        <div className="max-w-7xl mx-auto mb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest mb-6 border border-indigo-100 dark:border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
            <span>AI Interior Architect</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Curate Your <span className="text-slate-400 dark:text-slate-500">Perfect Setup.</span></h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Describe your ideal living space or budget constraints. Our Architect will cross-reference thousands of combinations to build your custom package in seconds.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-slate-50 dark:bg-slate-900/80 rounded-[4rem] p-8 sm:p-12 border border-slate-100 dark:border-slate-800 relative overflow-hidden group shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 dark:bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-4">
            <div className="bg-slate-900 dark:bg-white w-12 h-12 flex items-center justify-center rounded-2xl text-white dark:text-slate-900 shadow-xl">
              <Wand2 className="w-6 h-6" />
            </div>
            Describe your requirements
          </h2>
          
          <div className="relative z-10">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. A premium Work-from-Home setup under ₹2,000 including a high-end monitor and ergonomic chair..."
              className="w-full h-44 p-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] resize-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600/50 text-xl text-slate-900 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-sm"
            />
            <Button
              disabled={!mounted || isGenerating || !aiPrompt.trim()}
              onClick={() => handleGenerate()}
              className="absolute bottom-6 right-6 px-10 py-5 rounded-[1.5rem] text-lg font-black bg-slate-950 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
            >
              {isGenerating ? 'Architecting...' : 'Build Custom Bundle \u2192'}
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 items-center">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-2">Quick Blueprints:</span>
            <button onClick={() => setAiPrompt('Complete Work From Home setup under ₹1500')} className="text-[13px] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all font-bold border border-slate-200/50 dark:border-slate-700 shadow-sm">💻 WFH under ₹1500</button>
            <button onClick={() => setAiPrompt('Compact studio apartment essentials for a student on a budget')} className="text-[13px] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all font-bold border border-slate-200/50 dark:border-slate-700 shadow-sm">🎓 Student Essentials</button>
          </div>

          {isGenerating && (
            <div className="mt-12 flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur-md rounded-[3rem] border border-white relative z-20 overflow-hidden">
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
              <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-6 relative z-10" />
              <p className="text-slate-900 font-black text-xl relative z-10">Architecting your space...</p>
              <p className="text-slate-500 mt-2 font-medium relative z-10 text-center">Optimizing inventory, matching styles, and calculating your exclusive discount.</p>
            </div>
          )}
        </div>
      </section>

      {/* Embedded Bundle Result or Empty State */}
      {(bundle || isGenerating) && (
        <section id="generated-bundle" className="py-24 bg-slate-900 relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="max-w-6xl mx-auto px-6">
            {!bundle && isGenerating ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 border-4 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-8" />
                <h3 className="text-2xl font-black text-white">Finalizing your custom blueprint...</h3>
              </div>
            ) : bundle && bundle.items && bundle.items.length > 0 ? (
              <div className="bg-slate-800/40 backdrop-blur-3xl rounded-[4rem] p-10 sm:p-20 text-white shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-8 border border-indigo-500/30">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Exclusive Architect Selection</span>
                  </div>
                  
                  <h3 className="text-5xl sm:text-6xl font-black mb-8 tracking-tighter leading-[0.9]">{bundle.bundleName}</h3>
                  <p className="text-slate-300 text-xl mb-16 max-w-2xl leading-relaxed font-medium">✨ {bundle.message}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {bundle.items.map((item: any, idx: number) => (
                      <Link key={idx} href={`/products/${item._id || item.id}`} className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 flex gap-6 items-center border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] group">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-sm line-clamp-1 mb-1 tracking-tight">{item.name}</h4>
                          <p className="text-indigo-400 font-black text-sm">₹{item.monthlyRent}<span className="text-[10px] opacity-60 ml-1">/mo</span></p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-white shadow-2xl p-10 rounded-[3rem]">
                    <div className="text-slate-900">
                      <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-70">Total Package Rent</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-6xl font-black tracking-tighter">₹{bundle.totalMonthlyRent}</span>
                        <span className="text-lg font-bold opacity-40">/mo</span>
                      </div>
                    </div>
                    <Button size="lg" className="h-20 px-16 rounded-3xl text-2xl font-black w-full md:w-auto shadow-[0_20px_50px_-10px_rgba(30,58,138,0.3)]" onClick={addBundleToCart}>
                      Rent Setup Now
                    </Button>
                  </div>
                  
                  <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-8 opacity-50">
                    <div className="flex items-center gap-2 text-xs font-bold whitespace-nowrap"><Truck className="w-4 h-4" /> 24hr Fast Delivery</div>
                    <div className="flex items-center gap-2 text-xs font-bold whitespace-nowrap"><RefreshCcw className="w-4 h-4" /> 7-Day Easy Returns</div>
                    <div className="flex items-center gap-2 text-xs font-bold whitespace-nowrap"><ShieldCheck className="w-4 h-4" /> 100% Quality Insured</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto bg-slate-800/40 backdrop-blur-3xl rounded-[4rem] p-16 text-center border border-white/5">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
                  <PackageSearch className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">No Bundle Found</h3>
                <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">
                  Our Architect couldn't find a perfect combination matching those exact criteria in our current inventory. Try broadening your requirements or increasing your target budget slightly.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-2xl px-10 h-14" onClick={() => setAiPrompt('')}>
                    Clear Strategy
                  </Button>
                  <Button className="rounded-2xl px-10 h-14" onClick={() => document.getElementById('ai-generator')?.scrollIntoView({ behavior: 'smooth' })}>
                    Revise Description
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-24 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-16 tracking-tight">Voices of the Community</h2>
          <div className="grid md:grid-cols-3 gap-10 text-left">
            <div className="bg-slate-50 dark:bg-slate-950/50 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:-translate-y-2 transition-all">
              <div className="absolute top-0 right-0 p-8 text-indigo-500/10 text-7xl font-serif">"</div>
              <div className="flex text-yellow-400 mb-6 text-xl tracking-widest">★★★★★</div>
              <p className="text-slate-700 dark:text-slate-300 font-medium mb-10 relative z-10 leading-relaxed text-lg italic">"Got my entire home office setup delivered the very next day. The AI Architect suggested exactly what I needed under ₹1500/month. No more hunting for used furniture!"</p>
              <div className="flex items-center gap-4 mt-auto border-t border-slate-100 dark:border-slate-800 pt-8">
                <img src="https://i.pravatar.cc/100?img=1" className="w-14 h-14 rounded-2xl ring-2 ring-white dark:ring-slate-800 shadow-xl" />
                <div>
                  <p className="font-black text-slate-900 dark:text-white text-base">Priya Sharma</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Senior Engineer</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/50 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:-translate-y-2 transition-all flex flex-col justify-between">
              <div>
                <div className="absolute top-0 right-0 p-8 text-indigo-500/10 text-7xl font-serif">"</div>
                <div className="flex text-yellow-400 mb-6 text-xl tracking-widest">★★★★★</div>
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-10 relative z-10 leading-relaxed text-lg italic">"The Master Bedroom Combo saved me 20% compared to renting items individually. The delivery team was incredibly professional and assembled the bed in record time."</p>
              </div>
              <div className="flex items-center gap-4 mt-auto border-t border-slate-100 dark:border-slate-800 pt-8">
                <img src="https://i.pravatar.cc/100?img=2" className="w-14 h-14 rounded-2xl ring-2 ring-white dark:ring-slate-800 shadow-xl" />
                <div>
                  <p className="font-black text-slate-900 dark:text-white text-base">Rahul Malhotra</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Product Lead</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/50 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:-translate-y-2 transition-all flex flex-col justify-between">
              <div>
                <div className="absolute top-0 right-0 p-8 text-indigo-500/10 text-7xl font-serif">"</div>
                <div className="flex text-yellow-400 mb-6 text-xl tracking-widest">★★★★★</div>
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-10 relative z-10 leading-relaxed text-lg italic">"Zero deposit and free delivery is a game changer for urban professionals. Managing my subscriptions is just a single click. This is the absolute future of living."</p>
              </div>
              <div className="flex items-center gap-4 mt-auto border-t border-slate-100 dark:border-slate-800 pt-8">
                <img src="https://i.pravatar.cc/100?img=3" className="w-14 h-14 rounded-2xl ring-2 ring-white dark:ring-slate-800 shadow-xl" />
                <div>
                  <p className="font-black text-slate-900 dark:text-white text-base">Ananya Tiwari</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Creative Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

