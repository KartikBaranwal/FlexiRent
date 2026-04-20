"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { useAppContext } from '@/context/AppContext';
import { ShoppingBag, User as UserIcon, Menu, X, LayoutGrid, LogOut, Settings, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const { user, setUser, cart, setAuthModalOpen, setAuthModalMode } = useAppContext();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-500">
      <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/40 dark:border-slate-800/40 shadow-sm" />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center md:w-1/4">
            <Link href="/" className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 bg-white dark:bg-slate-900 rounded-sm rotate-45" />
              </div>
              <span>Flexi<span className="text-slate-400">Rent</span></span>
            </Link>
          </div>

          <div className="hidden md:flex items-center justify-center flex-1">
            <Link 
              href="/products" 
              className={cn(
                "group flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 border shadow-sm",
                pathname === '/products' 
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white" 
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-100 dark:border-slate-700 hover:border-slate-200"
              )}
            >
              <LayoutGrid className={cn("w-4 h-4 transition-transform group-hover:rotate-12", pathname === '/products' ? "text-slate-300 dark:text-slate-600" : "text-slate-400")} />
              Browse Inventory
            </Link>
          </div>

          <div className="flex items-center justify-end md:w-1/4 space-x-4">
            <ThemeToggle />
            
            <Link href="/cart" className="relative group p-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
              <ShoppingBag className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {user && cart.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-indigo-600 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-in zoom-in duration-300">
                  {cart.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="group flex items-center gap-2 p-1 focus:outline-none"
                >
                  <div className="h-10 w-10 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-800 border-2 border-white shadow-sm transition-all group-hover:border-slate-200 group-hover:scale-105 active:scale-95">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-5 h-5" />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-4 w-64 bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 p-2"
                      >
                        <div className="px-5 py-4 mb-2 bg-slate-50/50 rounded-[1.5rem] border border-slate-100/50">
                          <p className="text-sm font-black text-slate-900 truncate">{user?.name || 'Member'}</p>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider truncate mt-0.5">{user?.email}</p>
                        </div>
                        <div className="space-y-1">
                          <Link href="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-[1.2rem] font-bold transition-all">
                            <CreditCard className="w-4 h-4 opacity-50" />
                            Subscriptions
                          </Link>
                          {user?.role === 'admin' && (
                            <Link href="/admin/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 rounded-[1.2rem] font-bold transition-all">
                              <Settings className="w-4 h-4" />
                              Admin Console
                            </Link>
                          )}
                          <div className="h-px bg-slate-100 my-2 mx-4" />
                          <button 
                            onClick={() => { setUser(null); setIsProfileOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 rounded-[1.2rem] font-bold transition-all"
                          >
                            <LogOut className="w-4 h-4 opacity-70" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  className="px-4 text-slate-600 hover:text-slate-900"
                  onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
                >
                  Log in
                </Button>
                <Button 
                  variant="primary" 
                  className="px-6 rounded-[1.2rem] font-black"
                  onClick={() => { setAuthModalMode('signup'); setAuthModalOpen(true); }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
