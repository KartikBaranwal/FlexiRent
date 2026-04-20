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
import { mockFallbackProducts } from '@/lib/mockData';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const products = Array.isArray(data) ? data : [];
        setDbProducts(products.slice(0, 8)); // Show more real products
      })
      .catch(err => {
        console.error("Home products fetch failed", err);
        setDbProducts([]);
      })
      .finally(() => setLoading(false));

    fetch('/api/bundles')
      .then(res => res.json())
      .then(data => {
        const bundles = Array.isArray(data) ? data : [];
        // Sort so 1BHK appears first
        bundles.sort((a: any, b: any) => {
          const aIs1BHK = a.name?.toLowerCase().includes('1bhk') ? -1 : 0;
          const bIs1BHK = b.name?.toLowerCase().includes('1bhk') ? -1 : 0;
          return aIs1BHK - bIs1BHK;
        });
        setDbBundles(bundles);
      })
      .catch(err => setDbBundles([]));
  }, []);

  const handleGenerate = async (overridePrompt?: string) => {
    const activePrompt = (typeof overridePrompt === 'string' ? overridePrompt : aiPrompt);
    if (!activePrompt.trim()) return;
    setAiPrompt(activePrompt);

    setIsGenerating(true);
    setBundle(null);
    const lowerReq = activePrompt.toLowerCase();

    // Strict intercept for Phase 6 Presets
    if (lowerReq.includes('student')) {
      setBundle({
        bundleName: "Student Starter Kit",
        message: "Optimized desk, seating, and sleeping arrangement for strict academic budgets.",
        items: [
          { _id: "m2", name: "Ergonomic Task Chair", imageUrl: "https://images.unsplash.com/photo-1688578735352-9a6f2ac3b70a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZXJnb25vbWljJTIwY2hhaXJ8ZW58MHx8MHx8fDA%3D", monthlyRent: 200 },
          { _id: "m18", name: "Executive Study Desk", imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=200", monthlyRent: 300 },
          { _id: "m1", name: "Single Bed", imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=200", monthlyRent: 500 }
        ],
        totalMonthlyRent: 1000,
        imageUrl: "https://plus.unsplash.com/premium_photo-1725667824810-cbf1ad00a7e1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8U1RVREVOVCUyMFNFVFVQfGVufDB8fDB8fHww"
      });
      setIsGenerating(false);
      setTimeout(() => document.getElementById('generated-bundle')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      return;
    }
    if (lowerReq.includes('wfh') || lowerReq.includes('work from home')) {
      setBundle({
        bundleName: "Professional WFH Setup",
        message: "Premium ergonomic chair and a heavy-duty office desk for maximum productivity.",
        items: [
          { _id: "m2", name: "Premium Ergonomic Chair", imageUrl: "https://images.unsplash.com/photo-1688578735352-9a6f2ac3b70a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZXJnb25vbWljJTIwY2hhaXJ8ZW58MHx8MHx8fDA%3D", monthlyRent: 300 },
          { _id: "m18", name: "Executive Office Desk", imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=200", monthlyRent: 400 }
        ],
        totalMonthlyRent: 700,
        imageUrl: "https://images.unsplash.com/photo-1652352530301-dc807f7113a4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHdvcmslMjBmcm9tJTIwaG9tZSUyMFNFVFVQfGVufDB8fDB8fHww"
      });
      setIsGenerating(false);
      setTimeout(() => document.getElementById('generated-bundle')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      return;
    }

    if (lowerReq.includes('full') || lowerReq.includes('home')) {
      setBundle({
        bundleName: "Full Home Ultimate Bundle",
        message: "The comprehensive 8-item setup for a complete living experience.",
        items: [
          { _id: "m1", name: "King Bed", imageUrl: "https://images.unsplash.com/photo-1505693419173-42b9218a5c10?w=800&auto=format&fit=crop", monthlyRent: 850 },
          { _id: "m10", name: "Wardrobe", imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop", monthlyRent: 800 },
          { _id: "m12", name: "Sofa", imageUrl: "https://images.unsplash.com/photo-1705028877445-88d4d7fa5569?w=800&auto=format&fit=crop", monthlyRent: 1100 },
          { _id: "m8", name: "Mattress", imageUrl: "https://images.unsplash.com/photo-1759176171634-674f37841636?w=800&auto=format&fit=crop", monthlyRent: 500 },
          { _id: "m3", name: "Fridge", imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop", monthlyRent: 950 },
          { _id: "m16", name: "Washer", imageUrl: "https://media.istockphoto.com/id/1137138120/photo/photo-of-white-washing-machine-with-soft-and-fresh-bright-towels-on-top-standing-isolated.webp?w=800&auto=format&fit=crop", monthlyRent: 800 },
          { _id: "m4", name: "Split AC", imageUrl: "https://plus.unsplash.com/premium_photo-1679943423706-570c6462f9a4?w=800&auto=format&fit=crop", monthlyRent: 1200 },
          { _id: "m17", name: "LED TV", imageUrl: "https://plus.unsplash.com/premium_photo-1683133215610-854ad000bba1?w=800&auto=format&fit=crop", monthlyRent: 900 }
        ],
        totalMonthlyRent: 5999
      });
      setIsGenerating(false);
      setTimeout(() => document.getElementById('generated-bundle')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      return;
    }

    if (lowerReq.includes('living')) {
      setBundle({
        bundleName: "Premium Living Room",
        message: "The ultimate entertainment and luxury living experience with high-end appliances.",
        items: [
          { _id: "m12", name: "Premium L-Sofa", imageUrl: "https://images.unsplash.com/photo-1705028877408-209f583a5008?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bCUyMHNoYXBlZCUyMHNvZmF8ZW58MHx8MHx8fDA%3D", monthlyRent: 1200 },
          { _id: "m4", name: "Split AC 1.5T", imageUrl: "https://plus.unsplash.com/premium_photo-1679943423706-570c6462f9a4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YWlyJTIwY29uZGl0aW9uZXJ8ZW58MHx8MHx8fDA%3D", monthlyRent: 1500 },
          { _id: "m17", name: "LED Smart TV", imageUrl: "https://plus.unsplash.com/premium_photo-1683133215610-854ad000bba1?w=800&auto=format&fit=crop", monthlyRent: 900 }
        ],
        totalMonthlyRent: 3600,
        imageUrl: "https://plus.unsplash.com/premium_photo-1661947938915-2f442827e32c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJlbWl1bSUyMGxpdmluZyUyMHJvb20lMjB3aXRoJTIwdHZ8ZW58MHx8MHx8fDA%3D"
      });
      setIsGenerating(false);
      setTimeout(() => document.getElementById('generated-bundle')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      return;
    }

    try {
      const res = await fetch('/api/ai/generate-bundle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements: activePrompt })
      });
      const data = await res.json();
      setBundle(data);
    } catch (err) {
      console.error(err);

      let mockName = "Smart Custom Bundle";
      let mockItems = [];
      const lowerReq = activePrompt.toLowerCase();

      if (lowerReq.includes("student")) {
        mockName = "Student Starter Kit";
        mockItems = mockFallbackProducts.filter(p => ["Bed", "Desk", "Chair", "Cycle"].some(n => p.name.includes(n)));
        if (mockItems.length === 0) mockItems = mockFallbackProducts.slice(0, 3);
      } else if (lowerReq.includes("wfh") || lowerReq.includes("work")) {
        mockName = "WFH Pro Setup";
        mockItems = mockFallbackProducts.filter(p => ["Chair", "Desk"].some(n => p.name.includes(n)));
        if (mockItems.length === 0) mockItems = [mockFallbackProducts.find(p => p._id === 'm2'), mockFallbackProducts.find(p => p._id === 'm18')].filter(Boolean);
      } else {
        mockName = "FlexiRent Discovery Array";
        mockItems = mockFallbackProducts.slice(1, 4);
      }

      setBundle({
        bundleName: mockName,
        message: "Here is a perfectly curated setup seamlessly matched to your parameters.",
        items: mockItems,
        totalMonthlyRent: mockItems.reduce((acc, it) => acc + (it.monthlyRent || 0), 0)
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        document.getElementById('generated-bundle')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
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
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Split Hero Section */}
      <section className="pt-32 pb-16 bg-slate-50 relative overflow-hidden">
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
                  className="flex-1 group flex items-center justify-center gap-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-black rounded-[2rem] py-4 px-6 transition-all duration-300 hover:shadow-lg active:scale-[0.98] shadow-md"
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-100 group-hover:border-slate-200 transition-colors shadow-sm">
                    <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="Appliances" />
                  </div>
                  <div className="flex flex-col items-start translate-y-0.5">
                    <h3 className="text-sm font-black text-slate-900 leading-tight whitespace-nowrap tracking-tight uppercase group-hover:text-indigo-600 transition-colors">Explore Appliances</h3>
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest text-left">TVs, ACs and More</p>
                  </div>
                </a>
                <a
                  href="/products?category=Furniture"
                  className="flex-1 group flex items-center justify-center gap-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-black rounded-[2rem] py-4 px-6 transition-all duration-300 hover:shadow-lg active:scale-[0.98] shadow-md"
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-100 group-hover:border-slate-200 transition-colors shadow-sm">
                    <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="Furniture" />
                  </div>
                  <div className="flex flex-col items-start translate-y-0.5">
                    <h3 className="text-sm font-black text-slate-900 leading-tight whitespace-nowrap tracking-tight uppercase group-hover:text-indigo-600 transition-colors">Explore Furniture</h3>
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest text-left">Beds, Sofas and More</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-16 pb-12 bg-slate-50 relative z-10">
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
              <div key={dbBundle._id} className="relative mx-auto w-full animate-slide-up bg-white p-8 sm:p-10 rounded-[3rem] premium-shadow border border-slate-100/50 transition-transform duration-500 flex flex-col md:flex-row gap-10 items-center hover:scale-[1.01]">

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
                    <button onClick={() => setShowComboItems(showComboItems === dbBundle._id ? null : dbBundle._id)} className="text-slate-600 font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between w-full hover:bg-slate-200 transition-colors">
                      <span>View Included Items ({dbBundle.items?.length || 0})</span>
                      <span className={`transform transition-transform duration-300 ${showComboItems === dbBundle._id ? 'rotate-180' : 'rotate-0'}`}>▼</span>
                    </button>
                    <div className={`grid grid-cols-2 gap-2 p-3 bg-white rounded-xl border border-slate-100 shadow-inner overflow-hidden transition-all duration-300 origin-top ${showComboItems === dbBundle._id ? 'max-h-64 mt-2 opacity-100 scale-100' : 'max-h-0 mt-0 opacity-0 scale-95 border-none p-0'}`}>
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
                          <div key={item._id || i} className="flex items-center gap-2 text-sm text-slate-700 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                            <span className="text-lg flex-shrink-0">{emoji}</span> <span className="truncate">{itemName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-end justify-between mb-8 pb-6 border-b border-slate-200">
                    <div>
                      {savings > 0 && <span className="block text-sm text-slate-400 font-bold line-through mb-1">₹{originalRent.toLocaleString()}/mo</span>}
                      <span className="block text-4xl font-black text-slate-900 leading-none">₹{price.toLocaleString()}<span className="text-base text-slate-500 font-bold">/mo</span></span>
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
      <section className="py-12 bg-slate-900 text-white relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-4 tracking-tight">Why Choose FlexiRent?</h2>
            <p className="text-slate-400 font-medium text-lg">Experience the modern, stress-free alternative to buying furniture.</p>
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
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4" id="trending">Trending Items</h2>
              <p className="text-slate-600">Premium furniture and appliances ready for delivery.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12 animate-in fade-in duration-700">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-slate-100 border-dashed">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                <p className="text-slate-500">We couldn't find any trending items right now.</p>
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
      <section id="ai-generator" className="py-12 bg-slate-50 relative z-10 px-4 pt-12">
        <div className="max-w-7xl mx-auto mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Design Your Ideal Space with AI</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">Don't see a combo that perfectly fits your home? Tell our AI architect what you're looking for, and it will instantly construct a personalized rental bundle just for you.</p>
        </div>
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-6 sm:p-12 premium-shadow border border-slate-100 transform hover:-translate-y-1 transition-all duration-500">
          <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
            <span className="bg-slate-950 w-12 h-12 flex items-center justify-center rounded-2xl text-white text-xl shadow-lg border border-slate-800">✨</span>
            Describe your ideal space
          </h2>
          <div className="relative">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. A cozy bedroom setup under ₹1500 with a study desk, chair, and a wardrobe..."
              className="w-full h-36 p-6 bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-lg text-slate-900 transition-all placeholder:text-slate-400"
            />
            <Button
              disabled={!mounted || isGenerating || !aiPrompt.trim()}
              onClick={() => handleGenerate()}
              className={`absolute bottom-6 right-6 rounded-2xl px-10 py-5 font-black transition-all shadow-xl text-lg border-0 ${(!mounted || isGenerating || !aiPrompt.trim()) ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none' : 'bg-slate-950 hover:bg-slate-800 text-white active:scale-95'}`}
            >
              {isGenerating ? 'Architecting...' : 'Build Selection \u2192'}
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">Try:</span>
            <button onClick={() => setAiPrompt('Complete Work From Home setup under ₹1500')} className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors font-medium border border-indigo-100">💻 WFH setup under ₹1500</button>
            <button onClick={() => setAiPrompt('Student and budget under ₹1000 per month')} className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors font-medium border border-indigo-100">🎓 Student budget</button>
            <button onClick={() => setAiPrompt('Premium living room with smart TV and L-sofa')} className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors font-medium border border-indigo-100">🛋️ Premium living room</button>
          </div>

          {isGenerating && (
            <div className="mt-10 flex flex-col items-center justify-center p-10 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6" />
              <p className="text-indigo-900 font-bold text-lg">Curating the perfect bundle...</p>
              <p className="text-slate-500 mt-2">Analyzing thousands of catalog combinations for your space</p>
            </div>
          )}
        </div>
      </section>

      {/* Embedded Bundle Result */}
      {bundle && (
        <section id="generated-bundle" className="py-16 bg-slate-50 animate-in fade-in duration-500 slide-in-from-bottom-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 sm:p-16 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-16 opacity-10 text-9xl">✨</div>
              <h3 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight">{bundle.bundleName}</h3>
              <p className="text-slate-300 text-xl mb-12 max-w-2xl leading-relaxed">{bundle.message}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {bundle.items?.map((item: any, idx: number) => {
                  const itemId = item._id || item.id;
                  return (
                    <Link key={idx} href={`/products/${itemId}`} className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 flex gap-5 items-center border border-white/20 hover:bg-white/20 transition-all hover:scale-105 group">
                      <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover shadow-inner group-hover:brightness-110" />
                      <div>
                        <h4 className="font-bold line-clamp-2 leading-tight mb-1 group-hover:text-slate-200 transition-colors uppercase tracking-tight text-xs">{item.name}</h4>
                        <p className="text-slate-400 font-bold text-xs">₹{item.monthlyRent}<span className="opacity-70 ml-0.5">/mo</span></p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
                <div>
                  <span className="text-slate-400 text-sm font-bold uppercase tracking-widest block mb-2">Total Monthly Rent</span>
                  <span className="text-5xl font-black tracking-tighter text-white">₹{bundle.totalMonthlyRent}</span>
                </div>
                <Button size="lg" className="h-16 px-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xl font-black w-full sm:w-auto shadow-2xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 border-0" onClick={addBundleToCart}>
                  Rent Now
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-12 tracking-tight">Loved by thousands of renters</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-slate-50 p-8 rounded-3xl animate-in slide-in-from-bottom-5 border border-slate-100 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 right-0 p-6 text-indigo-500/10 text-6xl font-serif">"</div>
              <div className="flex text-yellow-400 mb-4 text-xl tracking-widest">★★★★★</div>
              <p className="text-slate-700 font-medium mb-8 relative z-10 leading-relaxed">"Got my entire home office setup delivered the very next day. The AI suggested exactly what I needed under ₹1500/month. So much better than hunting for used furniture!"</p>
              <div className="flex items-center gap-4 mt-auto">
                <img src="https://i.pravatar.cc/100?img=1" className="w-12 h-12 rounded-full ring-2 ring-white shadow-md grayscale opacity-90 group-hover:grayscale-0 transition-all" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">Priya S.</p>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Software Engineer</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl animate-in slide-in-from-bottom-5 delay-150 border border-slate-100 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform flex flex-col justify-between">
              <div>
                <div className="absolute top-0 right-0 p-6 text-indigo-500/10 text-6xl font-serif">"</div>
                <div className="flex text-yellow-400 mb-4 text-xl tracking-widest">★★★★★</div>
                <p className="text-slate-700 font-medium mb-8 relative z-10 leading-relaxed">"The Master Bedroom Combo saved me 20% compared to renting items individually. The delivery team was incredibly professional and assembled the bed in 10 minutes."</p>
              </div>
              <div className="flex items-center gap-4">
                <img src="https://i.pravatar.cc/100?img=2" className="w-12 h-12 rounded-full ring-2 ring-white shadow-md grayscale opacity-90 group-hover:grayscale-0 transition-all" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">Rahul M.</p>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Student & Creator</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl animate-in slide-in-from-bottom-5 delay-300 border border-slate-100 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform flex flex-col justify-between">
              <div>
                <div className="absolute top-0 right-0 p-6 text-indigo-500/10 text-6xl font-serif">"</div>
                <div className="flex text-yellow-400 mb-4 text-xl tracking-widest">★★★★★</div>
                <p className="text-slate-700 font-medium mb-8 relative z-10 leading-relaxed">"Zero deposit and free delivery is incredible. Returning my TV when I moved cities was just a single manual click in the dashboard. FlexiRent is the absolute future of living."</p>
              </div>
              <div className="flex items-center gap-4">
                <img src="https://i.pravatar.cc/100?img=3" className="w-12 h-12 rounded-full ring-2 ring-white shadow-md grayscale opacity-90 group-hover:grayscale-0 transition-all" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">Ananya T.</p>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Design Lead</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

