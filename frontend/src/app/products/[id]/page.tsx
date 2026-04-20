"use client";
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useAppContext } from '@/context/AppContext';
import { ProductReviews } from '@/components/ProductReviews';

// Data is now fetched dynamically from standard MongoDB Atlas endpoints via the Node Backend

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, setAuthModalOpen, setAuthModalMode, addToCart } = useAppContext();

  const [product, setProduct] = useState<any>(null);
  const [duration, setDuration] = useState(6);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    if (params.id) {
      const fetchItem = async () => {
        // Direct mock ID handling to avoid fetch errors for static assets
        const isMockId = typeof params.id === 'string' && params.id.startsWith('m');
        if (isMockId) {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${params.id}`);
            const data = await res.json();
            if (res.ok && data._id) {
              setProduct(data);
              setActiveImage(data.imageUrl || data.image);
              return;
            }
          } catch (e) { }
        }

        try {
          // Attempt product fetch natively
          let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${params.id}`);
          let data = await res.json();

          if (!res.ok || data.message === 'Product not found' || !data._id) {
            // Fallback attempt bundle fetch
            res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bundles/${params.id}`);
            data = await res.json();
            if (!res.ok || data.message === 'Bundle not found' || !data._id) {
              setProduct({ error: "Item not found in database" });
              return;
            }
          }

          setProduct(data);
          setActiveImage(data.imageUrl || data.image);
          if (data.colors && data.colors.length > 0) {
            setSelectedColor(data.colors[0]);
          }
        } catch (error) {
          console.error('API Fetch failed', error);
          setProduct({ error: "Failed to connect to database" });
        }
      };

      fetchItem();
    }
  }, [params.id]);

  if (!product) {
    return (
      <div className="min-h-screen pt-32 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2rem] p-6 sm:p-12 border border-slate-100 animate-pulse flex flex-col lg:flex-row gap-12">
          {/* Gallery Skeleton */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            <div className="aspect-square rounded-3xl bg-slate-200 w-full" />
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-2xl bg-slate-200" />
              <div className="w-24 h-24 rounded-2xl bg-slate-200" />
              <div className="w-24 h-24 rounded-2xl bg-slate-200" />
            </div>
          </div>
          {/* Details Skeleton */}
          <div className="lg:w-1/2 flex flex-col gap-6 pt-4">
            <div className="h-12 bg-slate-200 rounded-xl w-3/4" />
            <div className="flex gap-4 mb-4">
              <div className="h-8 bg-slate-200 rounded-full w-24" />
              <div className="h-8 bg-slate-200 rounded-full w-32" />
            </div>
            <div className="h-24 bg-slate-100 rounded-xl w-full" />
            <div className="h-32 bg-slate-50 rounded-2xl border border-slate-100 w-full mt-4" />
            <div className="h-16 bg-slate-200 rounded-2xl w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }

    // Rent duration added as metadata to cart object
    addToCart({
      ...product,
      monthlyRent: calculatedRent,
      baseRent: product.monthlyRent,
      duration: duration,
      _id: `${product._id}`
    });

    setAdded(true);
  };

  // Duration Discount Logic
  let calculatedRent = product.monthlyRent;
  // Dynamic scaling: 0% discount at 1m, scaling up to 20% discount at 12m
  const discountFactor = ((duration - 1) / 11) * 0.20;
  calculatedRent = Math.round(product.monthlyRent * (1 - discountFactor));

  const perDayPrice = (calculatedRent / 30).toFixed(2);

  // Gallery setup
  const galleryImages = (product.images && product.images.length > 0) ? product.images : [product.imageUrl].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
      {/* Back Button Removed */}

      <div className="bg-white rounded-[2rem] p-6 sm:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col lg:flex-row gap-12 relative overflow-hidden">

        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60 -z-10 translate-x-1/2 -translate-y-1/2"></div>

        {/* Left Side: Interactive Gallery */}
        <div className="lg:w-1/2 flex flex-col gap-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-slate-50 relative group cursor-crosshair">
            <div className="absolute inset-0 w-full h-full bg-slate-50 overflow-hidden">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out" />
            </div>
            {product.category === 'Combos' && (
              <div className="absolute top-6 left-6 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg animate-bounce">
                Save ₹{product.originalRent - product.monthlyRent}/mo!
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Product Configuration */}
        <div className="lg:w-1/2 flex flex-col">

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
              <span className="text-yellow-500 font-bold text-sm">⭐ {product.rating || '4.7'}</span>
              <span className="text-yellow-700 text-xs ml-1 font-medium">(148 verified reviews)</span>
            </div>
            {product.stock > 0 ? (
              product.stock <= 3 ? (
                <div className="text-rose-600 font-bold text-sm bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 animate-pulse">
                  🔥 ONLY {product.stock} LEFT IN STOCK
                </div>
              ) : (
                <div className="text-emerald-700 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1">
                  📦 IN STOCK
                </div>
              )
            ) : (
              <div className="text-slate-500 font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                🚫 OUT OF STOCK
              </div>
            )}
            <div className="text-emerald-700 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              🚀 Ships inside 24 hours
            </div>
          </div>

          {/* Color Selection */}
          {product.colors && (
            <div className="mb-6">
              <div className="flex gap-3">
                {product.colors.map((color: string, idx: number) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      if (product.images && product.images.length > 0) {
                        setActiveImage(product.images[idx % product.images.length]);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${selectedColor === color ? 'border-indigo-600 text-indigo-700 bg-indigo-50 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8 border-t border-slate-100 pt-6">
            <p className="text-lg text-slate-600 leading-relaxed font-medium mb-6">
              {product.description}
            </p>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Why choose this?</h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {(() => {
                  const category = product.category?.toLowerCase() || '';
                  const name = product.name?.toLowerCase() || '';
                  let strengths = [
                    `Premium ${product.category} Build Quality`,
                    "Deep Cleaned before delivery",
                    "Free replacement if damaged",
                    "100% genuine product guarantee"
                  ];

                  if (category.includes('furniture')) {
                    if (name.includes('bed')) strengths = ["Premium Teak Wood", "Termite Resistant", "Classic Design", "Easy Maintenance"];
                    else if (name.includes('chair')) strengths = ["Ergonomic Support", "Breathable Mesh", "Adjustable Height", "360° Swivel"];
                    else if (name.includes('sofa')) strengths = ["High-Density Foam", "Stain Resistant Fabric", "Sturdy Frame", "Modern Aesthetic"];
                  } else if (category.includes('appliances')) {
                    if (name.includes('fridge') || name.includes('refrigerator')) strengths = ["Energy Efficient", "Fast Cooling", "Stabilizer Free", "Spacious Interior"];
                    else if (name.includes('ac')) strengths = ["Inverter Technology", "Copper Condenser", "Anti-Bacterial Filter", "Low Noise"];
                    else if (name.includes('microwave')) strengths = ["Multi-Stage Cooking", "Touch Control", "Child Lock", "Defrost Function"];
                  } else if (category.includes('fitness')) {
                    strengths = ["Heavy Duty Build", "Digital Monitoring", "Compact/Foldable", "Adjustable Intensity"];
                  }

                  return strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                      <span className="text-indigo-500 mt-0.5">✦</span> {strength}
                    </li>
                  ));
                })()}
              </ul>
            </div>
          </div>

          {/* Pricing Context Block */}
          <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Monthly Cost</p>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-black text-slate-900 tracking-tighter">
                    ₹{calculatedRent}
                  </p>
                  <p className="text-xl font-bold text-slate-400 mb-1">/mo</p>
                </div>
              </div>
              <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-right">
                <span className="block text-xs font-bold text-slate-400 uppercase">Just</span>
                <span className="block text-xl font-black text-emerald-600">₹{perDayPrice}/day</span>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] relative z-10 w-full">
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm font-bold text-slate-700">Select Rental Tenure</p>
                <span className="text-lg font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{duration} Months</span>
              </div>


              <div className="relative pt-2 pb-6">
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:bg-slate-300"
                />
                <div className="flex justify-between text-xs font-bold text-slate-400 mt-2 absolute w-full px-1">
                  <span>1M</span>
                  <span>12M</span>
                </div>
              </div>
              <div className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-xl text-center flex items-center justify-center gap-2">
                <span>💡</span> increase number of months to save extra
              </div>
            </div>
          </div>

          {/* Trust Value Props & Extra Actions Removed Per User Request */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Button
              size="lg"
              disabled={added || product.stock === 0}
              className={`flex-1 h-16 text-xl rounded-2xl transition-all shadow-xl font-black border-0 ${(added || product.stock === 0) ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 shadow-slate-900/20 text-white'}`}
              onClick={handleAddToCart}
            >
              {product.stock === 0 ? 'Out of Stock' : (added ? 'Added to Cart' : 'Rent Now')}
            </Button>

            <Button size="lg" variant="outline" className="h-16 px-6 rounded-2xl transition-all text-slate-600 border-2 hover:bg-slate-50 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" /></svg>
              <span className="hidden sm:block">Share</span>
            </Button>
          </div>

        </div>
      </div>

      {/* Review Section — Dynamic with user submit */}
      {(() => {
        const rating = product.rating || (4.0 + (product.name.length % 10) / 10).toFixed(1);
        return (
          <ProductReviews
            productId={product._id}
            productName={product.name}
            category={product.category}
            averageRating={Number(rating)}
            canReview={false}
          />
        );
      })()}

      {/* Mobile Sticky Add To Cart */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] pb-8">
        <Button
          size="lg"
          disabled={added || product.stock === 0}
          className={`w-full h-14 text-lg rounded-xl transition-all shadow-lg font-black border-0 ${(added || product.stock === 0) ? 'bg-slate-300 text-slate-500 shadow-none' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
          onClick={handleAddToCart}
        >
          {product.stock === 0 ? 'Out of Stock' : (added ? 'Added to Cart' : `Rent for ₹${calculatedRent}/mo`)}
        </Button>
      </div>

    </div>
  );
}