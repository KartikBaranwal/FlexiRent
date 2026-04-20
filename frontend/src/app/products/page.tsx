"use client";
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { Input } from '@/components/ui/Input';
import { Search, Filter, PackageX, Layers, ChevronRight } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface Product {
  _id: string;
  name: string;
  description: string;
  monthlyRent: number;
  category: string;
  imageUrl: string;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  
  const [categoryFilter, setCategoryFilter] = useState(() => {
    return searchParams.get('category') || 'All';
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url = categoryFilter === 'All'
          ? `/api/products`
          : `/api/products?category=${categoryFilter}`;

        const res = await api.get(url);
        if (res.data && Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                            p.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesSearch;
    });
  }, [products, debouncedSearch]);

  const categories = ['All', 'Furniture', 'Appliances', 'Electronics', 'Fitness'];

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">
              <Layers className="w-4 h-4" />
              <span>Catalog</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Premium <span className="text-slate-400 dark:text-slate-500">Inventory</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-sm font-bold text-slate-500">
            <span>Home</span>
            <ChevronRight className="w-4 h-4 opacity-30" />
            <span className="text-slate-900 dark:text-white">Products</span>
            {categoryFilter !== 'All' && (
              <>
                <ChevronRight className="w-4 h-4 opacity-30" />
                <span className="text-indigo-600 dark:text-indigo-400">{categoryFilter}</span>
              </>
            )}
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm mb-12">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3">
              <Input
                type="text"
                placeholder="Find furniture, appliances..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="w-5 h-5" />}
                className="bg-slate-50/50 dark:bg-slate-950/50 border-transparent hover:bg-slate-50 dark:hover:bg-slate-950"
              />
            </div>

            <div className="flex-1 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 mr-2 text-slate-400 dark:text-slate-500">
                <Filter className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">Filter:</span>
              </div>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-[13px] font-black transition-all duration-300",
                    categoryFilter === cat
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-white/5 scale-105"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Display Section */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-700">
                {filteredProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <PackageX className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Matching Items</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm text-center font-medium opacity-80 mb-8">
                  We couldn't find any products matching your current search or filter criteria. 
                  Try adjusting your keywords.
                </p>
                <Button variant="outline" onClick={() => { setSearch(''); setCategoryFilter('All'); }}>
                  Clear all filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-6 py-24 bg-slate-50 dark:bg-slate-950">
          <div className="h-12 bg-slate-100 dark:bg-slate-900 rounded-2xl w-64 mb-12 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}