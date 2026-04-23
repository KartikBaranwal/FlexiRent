"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/Button';
import { useAppContext } from '@/context/AppContext';

export const Navbar = () => {
  const { user, setUser, cart, setAuthModalOpen, setAuthModalMode } = useAppContext();
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full glass border-b border-slate-200/50 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center md:w-1/3">
            <Link href="/" className="text-2xl font-black text-slate-900 tracking-tighter">
              Flexi<span className="text-slate-500">Rent</span>
            </Link>
          </div>

          {/* Center: Nav */}
          {pathname !== '/products' && (
            <div className="hidden md:flex items-center justify-center w-1/3">
              <Link href="/products" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-2xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm border border-slate-200">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                Browse Catalog
              </Link>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center justify-end w-full md:w-1/3 space-x-4 sm:space-x-6">
            <Link href="/cart" className="relative text-slate-800 hover:text-slate-500 transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              {user && cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cart.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-3 focus:outline-none">
                  <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-800 border-2 border-slate-200 shadow-sm transition-transform group-hover:scale-105" title={user?.name || 'User'}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-50 bg-slate-50">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div className="p-2">
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl font-medium transition-colors">
                      My Dashboard
                    </Link>
                    {user?.role === 'admin' && (
                      <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-violet-700 hover:bg-violet-50 hover:text-violet-800 rounded-xl font-medium transition-colors mt-1">
                        ⚙️ Admin Panel
                      </Link>
                    )}
                    <button onClick={() => setUser(null)} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition-colors mt-1">
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Button variant="ghost" className="px-2 sm:px-4" onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}>Log in</Button>
                <Button variant="primary" className="px-3 sm:px-4" onClick={() => { setAuthModalMode('signup'); setAuthModalOpen(true); }}>Sign up</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
