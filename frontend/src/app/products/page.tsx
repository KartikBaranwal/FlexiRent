"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/Input';
import { mockFallbackProducts } from '@/lib/mockData';

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
  const [categoryFilter, setCategoryFilter] = useState(() => {
    // initialise from URL param on first render
    return 'All';
  });

  // Sync category from URL query on mount / param change
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategoryFilter(cat);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url = categoryFilter === 'All' 
          ? '/api/products' 
          : `/api/products?category=${categoryFilter}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(mockFallbackProducts);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts(mockFallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryFilter]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">
        All Products
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {['All', 'Furniture', 'Appliances', 'Electronics', 'Fitness'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 hover:border-indigo-200 hover:text-indigo-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-pulse">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-80">
              <div className="h-48 bg-slate-200 w-full" />
              <div className="p-4 sm:p-5 flex-grow flex flex-col gap-3">
                <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-100 rounded-md w-full" />
                <div className="mt-auto h-10 bg-slate-200 rounded-xl w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-10 bg-slate-200 rounded-xl w-48 mb-8 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(8)].map((_, i) => <div key={i} className="h-72 bg-slate-200 rounded-2xl" />)}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}