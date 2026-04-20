"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

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
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  showToast: (msg: string) => void;
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
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiBundle, setAiBundle] = useState<any | null>(null);

  const showToast = (msg: string) => {
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes('success') || lowerMsg.includes('✨') || lowerMsg.includes('welcome') || lowerMsg.includes('added')) {
      toast.success(msg);
    } else if (lowerMsg.includes('fail') || lowerMsg.includes('error') || lowerMsg.includes('invalid')) {
      toast.error(msg);
    } else {
      toast(msg);
    }
  };

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
      localStorage.removeItem('user');
      localStorage.removeItem('smart_rental_cart');
      localStorage.removeItem('smart_rental_wishlist');
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else if (isHydrated) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user, isHydrated]);

  // DB Sync on login
  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      try {
        const [cartRes, favRes] = await Promise.all([
          api.get(`/api/cart/${user._id}`),
          api.get(`/api/wishlist/${user._id}`)
        ]);
        
        if (cartRes.data?.items) {
          const dbCart = cartRes.data.items.map((item: any) => {
            if(item.productId) {
               return { ...item.productId, quantity: item.quantity };
            }
            return null;
          }).filter(Boolean);
          setCart(dbCart);
        }
        
        if (favRes.data?.products) {
          setWishlist(favRes.data.products);
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
    showToast('✨ Added to cart successfully');

    if (user) {
      try {
        await api.post('/api/cart/add', { userId: user._id, productId: product._id, quantity: 1 });
      } catch(e) {
        console.error("Cart update failed", e);
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    setCart((prev) => prev.filter((p) => p._id !== productId));
    if (user) {
      try {
        await api.post('/api/cart/remove', { userId: user._id, productId });
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
        await api.delete(`/api/cart/clear/${user._id}`);
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
      showToast("❤️ Added to wishlist");
      return [...prev, product];
    });

    if (user) {
      try {
        const endpoint = wasAdded ? 'add' : 'remove';
        await api.post(`/api/wishlist/${endpoint}`, { userId: user._id, productId: product._id });
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
      wishlist, toggleWishlist,
      showToast,
      aiPrompt, setAiPrompt,
      aiBundle, setAiBundle
    }}>
      {children}
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
