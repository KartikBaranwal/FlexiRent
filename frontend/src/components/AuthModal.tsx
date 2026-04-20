import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { Mail, Lock, User, MapPin, CheckCircle2 } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, setAuthModalOpen, authModalMode, setAuthModalMode, setUser, clearCart, showToast, user: currentUser } = useAppContext();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    if (!isAuthModalOpen) {
      setEmail('');
      setPassword('');
      setName('');
      setCity('Bangalore');
      setError('');
      setTermsAccepted(false);
      setShowPassword(false);
      setAddressLine1('');
      setAddressLine2('');
      setPincode('');
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (authModalMode === 'signup' && city === 'Other') {
      setError('Service currently available only in metro cities');
      setLoading(false);
      return;
    }

    try {
      const endpoint = authModalMode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const body: any = authModalMode === 'signup' 
        ? { name, email, password, city, addressLine1, addressLine2, pincode } 
        : { email, password };

      const res = await api.post(endpoint, body);
      const data = res.data;

      if (authModalMode === 'signup') {
        clearCart();
      }
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser({
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        token: data.token,
        role: data.user.role || 'user',
        city: data.user.city || (authModalMode === 'signup' ? city : currentUser?.city) || 'Bangalore',
        addressLine1: data.user.addressLine1 || (authModalMode === 'signup' ? body.addressLine1 : currentUser?.addressLine1) || '',
        addressLine2: data.user.addressLine2 || (authModalMode === 'signup' ? body.addressLine2 : currentUser?.addressLine2) || '',
        pincode: data.user.pincode || (authModalMode === 'signup' ? body.pincode : currentUser?.pincode) || ''
      });
      
      setAuthModalOpen(false);
      if (authModalMode === 'login') {
        showToast(`Welcome back, ${data.user.name}!`);
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        }
      } else {
        showToast("Account created successfully. Welcome to FlexiRent!");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Authentication failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={() => setAuthModalOpen(false)}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
        <button 
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <h2 className="text-3xl font-black text-slate-900 mb-2 text-center tracking-tight">
          {authModalMode === 'login' ? 'Welcome Back' : 'Join FlexiRent'}
        </h2>
        <p className="text-slate-500 text-center text-sm mb-8 px-4">
          {authModalMode === 'login' 
            ? 'Sign in to manage your rentals and curated spaces.' 
            : 'Premium furniture and appliances on your own terms.'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {authModalMode === 'signup' && (
            <>
              <div>
                <input 
                  type="text" 
                  required
                  className="w-full border-slate-200 border bg-slate-50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm font-medium placeholder:font-normal"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                <select 
                  className="w-full border-slate-200 border bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-no-repeat bg-[right_1rem_center]"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Other">Other City...</option>
                </select>
                {city === 'Other' && (
                  <p className="text-red-500 text-xs font-bold mt-2 bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-1.5">
                    <span className="text-base text-red-500">📍</span> Service currently available only in metro cities
                  </p>
                )}
              </div>
              
              {city !== 'Other' && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                  <input 
                    type="text" 
                    required={authModalMode === 'signup'}
                    className="w-full border-slate-200 border bg-slate-50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm font-medium placeholder:font-normal"
                    placeholder="House No / Flat No / Building Name"
                    value={addressLine1}
                    onChange={e => setAddressLine1(e.target.value)}
                  />
                  <input 
                    type="text" 
                    required={authModalMode === 'signup'}
                    className="w-full border-slate-200 border bg-slate-50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm font-medium placeholder:font-normal"
                    placeholder="Street / Area / Locality"
                    value={addressLine2}
                    onChange={e => setAddressLine2(e.target.value)}
                  />
                  <input 
                    type="text" 
                    required={authModalMode === 'signup'}
                    pattern="\d{6}"
                    maxLength={6}
                    className="w-full border-slate-200 border bg-slate-50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm font-medium placeholder:font-normal"
                    placeholder="Pincode (6 digits)"
                    value={pincode}
                    onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              )}
            </>
          )}
          <div>
            <input 
              type="email" 
              required
              className="w-full border-slate-200 border bg-slate-50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm font-medium placeholder:font-normal"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              required
              className="w-full border-slate-200 border bg-slate-50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm font-medium placeholder:font-normal pr-12"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {authModalMode === 'signup' && (
            <div className="flex items-center gap-2 mt-1">
              <input 
                type="checkbox" 
                id="terms" 
                checked={termsAccepted} 
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 text-slate-900 accent-slate-900 rounded border-slate-300 focus:ring-slate-900"
              />
              <label htmlFor="terms" className="text-sm text-slate-600">
                I agree with Terms and Conditions
              </label>
            </div>
          )}

          <Button type="submit" disabled={loading || (authModalMode === 'signup' && !termsAccepted)} className="w-full mt-1 py-3 text-base bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-200 text-white font-black overflow-hidden relative group disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Processing...' : (authModalMode === 'login' ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500">
          {authModalMode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setAuthModalMode('signup')} className="text-indigo-600 font-semibold hover:underline">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setAuthModalMode('login')} className="text-indigo-600 font-semibold hover:underline">
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
