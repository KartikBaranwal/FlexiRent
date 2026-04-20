import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { useAppContext } from '@/context/AppContext';
import { Star, Heart, ArrowRight, Zap, Package } from 'lucide-react';
import { Skeleton } from './ui/Skeleton';

interface Product {
  _id: string;
  name: string;
  description?: string;
  monthlyRent: number;
  category?: string;
  imageUrl?: string;
  rating?: number;
  stock?: number;
}

export const ProductCard = ({ product }: { product: Product }) => {
  const { wishlist, toggleWishlist } = useAppContext();
  const isWishlisted = wishlist.some(item => item._id === product._id);

  const stockRemaining = typeof product.stock === 'number' ? product.stock : 10;
  const rating = product.rating || 4.5;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:border-slate-200 transition-all duration-500 flex flex-col h-full relative p-4"
    >
      <Link href={`/products/${product._id}`} className="block relative w-full aspect-square overflow-hidden bg-slate-50 rounded-[1.8rem] cursor-pointer">
        <Image
          src={product.imageUrl || 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        <div className="absolute top-4 right-14 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-full text-[11px] font-black text-slate-900 shadow-sm flex items-center gap-1 z-20 border border-white/50">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {rating}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-4 right-4 bg-white/90 backdrop-blur-md w-9 h-9 rounded-full shadow-sm flex items-center justify-center transition-all hover:scale-110 z-20 border border-white/50 ${isWishlisted ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
        >
          <Heart className={cn("w-4.5 h-4.5 transition-colors", isWishlisted && "fill-rose-500")} />
        </button>

        {(product.rating && product.rating > 4.7) && (
          <div className="absolute top-4 left-4 bg-slate-900 text-white text-[10px] font-black px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-10 border border-slate-700 uppercase tracking-widest">
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> Trending
          </div>
        )}
      </Link>

      <div className="pt-6 px-2 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900 mb-1.5 truncate group-hover:text-slate-700 transition-colors tracking-tight">
            {product.name}
          </h3>
          <p className="text-slate-500 text-xs line-clamp-1 font-medium italic opacity-80">{product.category || 'Premium Furniture'}</p>
        </div>

        <div className="flex flex-col gap-4 mt-auto">
          <div className="flex items-center gap-3">
            {stockRemaining <= 3 && stockRemaining > 0 ? (
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" /> LIMITED: {stockRemaining} LEFT
              </span>
            ) : (
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                <Package className="w-3 h-3" /> VERIFIED STOCK
              </span>
            )}
          </div>

          <div className="flex items-end justify-between border-t border-slate-100/60 pt-5">
            <div>
              <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-widest opacity-80">Monthly Rental</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black tracking-tighter text-slate-900">₹{product.monthlyRent}</span>
                <span className="text-[11px] font-bold text-slate-400">/mo</span>
              </div>
            </div>
            <Link href={`/products/${product._id}`}>
              <Button size="icon" className="group/btn rounded-2xl bg-slate-900 text-white w-12 h-12">
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm animate-pulse">
      <Skeleton className="w-full aspect-square rounded-[1.8rem] mb-6" />
      <div className="px-2 space-y-3">
        <Skeleton variant="text" className="w-3/4 h-6" />
        <Skeleton variant="text" className="w-1/2 opacity-50" />
        <div className="pt-6 flex items-end justify-between">
          <div className="space-y-2">
            <Skeleton variant="text" className="w-16 h-3" />
            <Skeleton variant="text" className="w-24 h-8" />
          </div>
          <Skeleton className="w-12 h-12 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};
