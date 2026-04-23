"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAppContext } from '@/context/AppContext';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, user, setAuthModalOpen, setAuthModalMode } = useAppContext();

  // Initialize duration from the most recently added item or default to 3
  const [duration, setDuration] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('smart_rental_cart');
      if (storedCart) {
        try {
          const parsed = JSON.parse(storedCart);
          if (parsed.length > 0 && parsed[parsed.length - 1].duration) {
            return parsed[parsed.length - 1].duration;
          }
        } catch (e) { }
      }
    }
    return 3;
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Removed Authentication Required wrapper

  const discountFactor = ((duration - 1) / 11) * 0.20;
  const getScaledRent = (item: any) => {
    const base = item.baseRent || item.monthlyRent;
    return Math.round(base * (1 - discountFactor));
  };

  const monthlyTotal = cart.reduce((sum, item) => sum + (getScaledRent(item) * (item.quantity || 1)), 0);
  const depositTotal = monthlyTotal * 2; // Assuming 2 months rent as deposit

  const handlePayment = async () => {
    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      // Dynamically load razorpay script
      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      const totalAmount = Math.round(monthlyTotal + depositTotal);
      console.log(`Frontend initiating payment for initial charge: ₹${totalAmount} (Deposit + 1st month)`);
      
      // 1. Create Razorpay Order in Backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount })
      });
      console.log("Response ok:", res ? res.ok : 'unknown');
      
      const razorpayOrder = res ? await res.json() : null;
      console.log("Razorpay Order Data:", razorpayOrder);

      if (!res || !res.ok || !razorpayOrder) {
        let errorMessage = "Failed to create payment order on server.";
        if (razorpayOrder && razorpayOrder.error) {
          errorMessage = typeof razorpayOrder.error === 'string' ? razorpayOrder.error : JSON.stringify(razorpayOrder.error);
        } else if (res) {
          try {
            errorMessage += ` Status: ${res.status}`;
          } catch (e) {
            errorMessage += ` Status: Unknown`;
          }
        }
        throw new Error(errorMessage);
      }

      // 2. Configure Razorpay Options
      const options = {
        key: "rzp_test_SYcYnaLzuZmq1B", // Using provided test key
        amount: razorpayOrder.amount, // Already in paise from backend
        currency: "INR",
        name: "FlexiRent",
        description: `Security Deposit + 1st Month Rent`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          // 3. Verify Payment and Record in DB
          try {
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user?._id,
                amount: totalAmount
              })
            });

            if (!verifyRes.ok) throw new Error("Payment verification failed");

            // 4. Save Final Order to DB
            const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user?._id,
                items: cart,
                totalAmount: totalAmount,
                totalMonthlyRent: monthlyTotal,
                rentalDurationMonths: duration,
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
              })
            });

            if (orderRes.ok) {
              setSuccess(true);
              clearCart();
            } else {
              alert("Order confirmed but saving failed. Please contact support.");
            }
          } catch (err) {
            console.error("Order completion error:", err);
            alert("Verification failed. Please contact support if amount was deducted.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#0f172a" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Checkout failed", error);
      alert("Payment initialization failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100 max-w-md w-full text-center border border-slate-100 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm border border-green-200">
            ✓
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Order Confirmed!</h2>
          <p className="text-slate-600 mb-8 font-medium">Your rental items are being packaged and will be delivered shortly.</p>
          <Button className="w-full text-lg shadow-md" onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Your Cart</h1>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 px-4 py-2 rounded-xl bg-rose-50 border border-rose-100 transition-all active:scale-95"
          >
            🗑️ Clear Cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
          <div className="text-6xl mb-4 opacity-50">🛒</div>
          <p className="text-xl text-slate-500 mb-6 font-medium">Your cart is feeling a bit empty.</p>
          <Button onClick={() => router.push('/products')}>Browse Catalog</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div key={item._id} className="flex flex-col sm:flex-row bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm items-center gap-6 group hover:shadow-md transition-all">
                <div className="relative w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-slate-50 shadow-inner">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{item.name}</h3>
                  <p className="text-indigo-600 font-semibold text-lg">₹{getScaledRent(item)} <span className="text-sm text-slate-400 font-normal">/mo</span></p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1 border border-slate-100">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-white hover:shadow-sm transition-all font-bold"
                    onClick={() => updateQuantity(item._id, Math.max(1, (item.quantity || 1) - 1))}
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-bold text-slate-700">{item.quantity || 1}</span>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-white hover:shadow-sm transition-all font-bold"
                    onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="w-px h-8 bg-slate-100 hidden sm:block"></div>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="px-4 py-2 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors font-semibold text-sm border border-transparent hover:border-rose-100 flex items-center gap-2"
                >
                  <span className="text-lg">×</span> Remove
                </button>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 h-fit sticky top-28">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Order Summary</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-600 font-medium text-lg">
                <span>Monthly Rent</span>
                <span className="text-slate-900 font-bold">₹{monthlyTotal}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium text-lg">
                <span>Refundable Deposit</span>
                <span className="text-slate-900 font-bold">₹{depositTotal}</span>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-sm font-bold text-slate-700">Select Rental Duration</label>
                  <span className="text-md font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{duration} Months</span>
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
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 mb-4 mt-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Pay Now</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Security Deposit (refundable)</span>
                  <span className="text-slate-900 font-bold">₹{depositTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">1st Month Rent (advance)</span>
                  <span className="text-slate-900 font-bold">₹{monthlyTotal}</span>
                </div>
              </div>
              <div className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                <span className="font-bold text-indigo-900">Initial Payment</span>
                <span className="text-2xl font-extrabold text-indigo-600">₹{monthlyTotal + depositTotal}</span>
              </div>
              <p className="text-xs text-slate-500 mt-3 text-center tracking-wide font-medium">
                Security deposit + first month&apos;s rent
              </p>
            </div>

            {duration > 1 && (
              <div className="bg-amber-50 border border-amber-200/60 rounded-xl px-4 py-3 mb-6 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <p className="text-xs text-amber-800 font-bold leading-snug">Remaining {duration - 1} month{duration - 1 > 1 ? 's' : ''} will be billed individually</p>
                  <p className="text-[11px] text-amber-700/70 font-medium mt-0.5">₹{monthlyTotal}/month — payable from your Dashboard &gt; Payments section each month.</p>
                </div>
              </div>
            )}

            {/* Delivery Location Check */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8">
              <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span className="text-indigo-600 text-lg">📍</span> {user?.addressLine1 ? 'Delivery Address' : 'Delivery City'}:
              </h4>
              <div className="text-xs text-slate-600 font-bold leading-relaxed mb-3">
                {user?.addressLine1 ? (
                  <>
                    <p>{user.addressLine1}</p>
                    <p>{user.addressLine2}</p>
                    <p>{user.city} - {user.pincode}</p>
                  </>
                ) : (
                  <p>{user?.city || 'Your Metro City'}</p>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Standard delivery & assembly within 24 hours is included free of cost.
              </p>
            </div>

            <Button
              className="w-full text-lg py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all font-black bg-slate-900 hover:bg-slate-800"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? 'Initializing...' : `Pay ₹${monthlyTotal + depositTotal} Now \u2192`}
            </Button>

            <Button
              variant="outline"
              className="w-full text-base py-6 mt-4 rounded-2xl border-2 hover:bg-slate-50 transition-all font-bold text-slate-700"
              onClick={() => router.push('/')}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
