import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/Button';
import { useAppContext } from '@/context/AppContext';

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

  // Realism values based on product to remain stable per-item without DB changes
  const stockRemaining = typeof product.stock === 'number' ? product.stock : 10;
  const rating = product.rating || 4.5;

  return (
    <div className="group bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full relative">
      <Link href={`/products/${product._id}`} className="block relative w-full aspect-[4/3] overflow-hidden bg-slate-50 cursor-pointer">
        <Image
          src={product.imageUrl || 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover group-hover:scale-110 group-hover:opacity-90 transition-all duration-700 ease-out"
        />



        <div className="absolute top-4 right-14 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1 z-20">
          <span className="text-yellow-500">⭐</span> {rating}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-4 right-4 bg-white/95 backdrop-blur-md w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-all hover:scale-110 z-20 ${isWishlisted ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'}`}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
        {(product.rating && product.rating > 4.7) && (
          <div className="absolute top-4 left-4 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 z-10 border border-slate-700">
            <span className="text-amber-400">⚡</span> Trending
          </div>
        )}
      </Link>
      <div className="p-4 sm:p-5 flex flex-col flex-grow relative bg-white z-10">
        <h3 className="text-lg font-bold text-slate-900 mb-1 truncate transition-colors">{product.name}</h3>
        <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-grow">{product.description}</p>

        <div className="flex flex-col gap-3 mt-auto">
          {/* Urgency & Realism Signals */}
          <div className="flex flex-col gap-1 mb-1">
            {/* Delivery text removed */}
            {stockRemaining === 0 && (
              <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                <span>🚫</span> Out of Stock
              </div>
            )}
            {stockRemaining > 0 && stockRemaining <= 3 && (
              <div className="text-[10px] font-bold text-rose-500 flex items-center gap-1.5 animate-pulse">
                <span>🔥</span> Only {stockRemaining} left in stock
              </div>
            )}
            {stockRemaining > 3 && (
              <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1.5">
                <span>📦</span> In Stock
              </div>
            )}
          </div>

          <div className="flex items-end justify-between border-t border-slate-100 pt-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">Monthly</p>
              <p className="text-xl font-black tracking-tight text-slate-900">
                ₹{product.monthlyRent} <span className="text-[10px] font-bold text-slate-400 tracking-normal">/mo</span>
              </p>
            </div>
            <Link href={`/products/${product._id}`} className="w-[120px]">
              <Button className="w-full text-[11px] font-bold py-2.5 rounded-xl bg-slate-900 group-hover:bg-slate-800 active:scale-95 text-white transition-all duration-200 border-0 shadow-md hover:shadow-lg">
                View &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-sm flex flex-col h-full animate-pulse">
      <div className="w-full aspect-[4/3] bg-slate-100" />
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <div className="h-6 bg-slate-100 rounded-md w-3/4 mb-3" />
        <div className="h-4 bg-slate-50 rounded-md w-full mb-2" />
        <div className="h-4 bg-slate-50 rounded-md w-2/3 mb-6" />
        <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
          <div className="space-y-2">
            <div className="h-3 bg-slate-50 rounded-md w-12" />
            <div className="h-6 bg-slate-100 rounded-md w-20" />
          </div>
          <div className="h-10 bg-slate-100 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
};
