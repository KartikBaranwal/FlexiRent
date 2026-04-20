"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
  role?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  pincode?: string;
}

interface Product {
  _id: string;
  name: string;
  monthlyRent: number;
  imageUrl?: string;
  quantity?: number;
  baseRent?: number;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isHydrated: boolean;
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  aiBundle: any | null;
  setAiBundle: (bundle: any | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiBundle, setAiBundle] = useState<any | null>(null);

  // Load state from localStorage on init
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedCart = localStorage.getItem('smart_rental_cart');
      const storedWishlist = localStorage.getItem('smart_rental_wishlist');
      if (storedUser && storedUser !== 'undefined') setUser(JSON.parse(storedUser));
      if (storedCart && storedCart !== 'undefined') setCart(JSON.parse(storedCart));
      if (storedWishlist && storedWishlist !== 'undefined') setWishlist(JSON.parse(storedWishlist));
    } catch (error) {
      console.warn("Failed to parse local storage data:", error);
      // Clear potentially corrupted data
      localStorage.removeItem('user');
      localStorage.removeItem('smart_rental_cart');
      localStorage.removeItem('smart_rental_wishlist');
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  // DB Sync on login
  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      try {
        const [cartRes, favRes] = await Promise.all([
          fetch(`/api/cart/${user._id}`),
          fetch(`/api/wishlist/${user._id}`)
        ]);
        
        if (cartRes.ok) {
          const dbCartData = await cartRes.json();
          if (dbCartData.items && dbCartData.items.length > 0) {
            const dbCart = dbCartData.items.map((item: any) => {
              if(item.productId) {
                 return { ...item.productId, quantity: item.quantity };
              }
              return null;
            }).filter(Boolean);
            setCart(dbCart);
          }
        }
        
        if (favRes.ok) {
           const dbFavData = await favRes.json();
           if(dbFavData.products) {
              setWishlist(dbFavData.products);
           }
        }
      } catch (err) {
        console.error("Failed to sync user data", err);
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('smart_rental_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('smart_rental_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = async (product: Product) => {
    const exists = cart.find(i => i._id === product._id);
    if (exists) {
      showToast('This item is already in your cart.');
      return;
    }
    const newCart = [...cart, { ...product, quantity: 1 }];
    setCart(newCart);
    localStorage.setItem('smart_rental_cart', JSON.stringify(newCart));
    showToast('Cart Updated');

    if (user) {
      try {
        await fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id, productId: product._id, quantity: 1 })
        });
      } catch(e) {
        console.error("Cart update failed", e);
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    setCart((prev) => prev.filter((p) => p._id !== productId));
    if (user) {
      try {
        await fetch('/api/cart/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id, productId })
        });
      } catch(e) {
        console.error("Cart removal failed", e);
      }
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) => prev.map((p) => p._id === productId ? { ...p, quantity } : p));
  };

  const clearCart = async () => {
    setCart([]);
    if (user) {
      try {
        await fetch(`/api/cart/clear/${user._id}`, { method: 'DELETE' });
      } catch(e) {
        console.error("Cart clear failed", e);
      }
    }
  };

  const toggleWishlist = async (product: Product) => {
    let wasAdded = false;
    setWishlist((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) {
        showToast("Removed from wishlist");
        return prev.filter((p) => p._id !== product._id);
      }
      wasAdded = true;
      showToast("Added to wishlist");
      return [...prev, product];
    });

    if (user) {
      try {
        const endpoint = wasAdded ? 'add' : 'remove';
        await fetch(`/api/wishlist/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id, productId: product._id })
        });
      } catch(e) {
        console.error("Wishlist sync failed", e);
      }
    }
  };

  return (
    <AppContext.Provider value={{
      user, setUser, isHydrated,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      isAuthModalOpen, setAuthModalOpen,
      authModalMode, setAuthModalMode,
      toastMessage, showToast,
      wishlist, toggleWishlist,
      aiPrompt, setAiPrompt,
      aiBundle, setAiBundle
    }}>
      {children}
      {/* Global Production Toast */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-bottom-8 fade-in duration-300 pointer-events-none">
          <div className="bg-slate-900/95 backdrop-blur-md text-white px-6 py-4 rounded-full border border-slate-700/50 flex items-center gap-3.5 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.3)]">
            <div className="text-base">
              {toastMessage.includes('Welcome back') ? '✨' : 
               toastMessage.toLowerCase().includes('wishlist') ? '❤️' : 
               toastMessage.toLowerCase().includes('review') || toastMessage.toLowerCase().includes('feedback') || toastMessage.includes('request sent') ? '🙏' : 
               toastMessage.toLowerCase().includes('cart') ? '🛒' : '🔔'}
            </div>
            <p className="text-[15px] font-semibold tracking-wide m-0 whitespace-nowrap">
              {toastMessage}
            </p>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
