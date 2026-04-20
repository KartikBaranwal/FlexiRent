"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ProductCard';
import { DashboardWriteReview } from '@/components/ProductReviews';

export default function DashboardPage() {
  const { user, setUser, wishlist, showToast, setAuthModalOpen, setAuthModalMode } = useAppContext();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editLine1, setEditLine1] = useState('');
  const [editLine2, setEditLine2] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [addressError, setAddressError] = useState('');

  // Modal local states
  const [repairModal, setRepairModal] = useState(false);
  const [swapModal, setSwapModal] = useState(false);
  const [relocateModal, setRelocateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [repairIssue, setRepairIssue] = useState('');
  const [repairDesc, setRepairDesc] = useState('');
  const [swapTarget, setSwapTarget] = useState('');
  const [relocateAddress, setRelocateAddress] = useState('');
  const [relocateDate, setRelocateDate] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Initialize Edit Profile states when entering tab or user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditCity(user.city || 'Metro City');
      setEditLine1(user.addressLine1 || '');
      setEditLine2(user.addressLine2 || '');
      setEditPincode(user.pincode || '');
    }
  }, [user, isEditingProfile]);

  const saveProfile = () => {
    if (user) {
      setUser({
        ...user,
        name: editName,
        email: editEmail,
        city: editCity,
        addressLine1: editLine1,
        addressLine2: editLine2,
        pincode: editPincode
      });
      setIsEditingProfile(false);
    }
  };

  const submitRepair = async () => {
    if (!selectedItem?._id) return;

    if (repairDesc.trim().length < 50) {
      showToast('Please provide a malfunction description of at least 50 letters.');
      return;
    }

    setModalLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${selectedItem._id}/repair`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repairNote: `${repairIssue}: ${repairDesc}` }),
      });
      if (!res.ok) throw new Error('Repair request failed');
      const updatedOrder = await res.json();
      
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      setRepairModal(false);
      showToast('Repair request sent. A technician will contact you shortly.');
      setRepairIssue(''); setRepairDesc('');
    } catch (err) {
      console.error(err);
      showToast('Failed to submit repair request.');
    } finally {
      setModalLoading(false);
    }
  };

  const submitSwap = async () => {
    if (!selectedItem?._id) return;
    const options = getCurrentOptions();
    const selectedOption = options.find((o: any) => o.name === swapTarget);
    if (!selectedOption) return;

    setModalLoading(true);
    try {
      // newMonthlyRent: use the option's absolute rent (not addRent on top of already-swapped rent)
      const newMonthlyRent = selectedOption.rent;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${selectedItem._id}/swap`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newItem: {
            name: selectedOption.name,
            imageUrl: (selectedOption as any).img || selectedItem.items?.[0]?.imageUrl || '',
            qty: 1,
          },
          newMonthlyRent,
        }),
      });

      if (!res.ok) throw new Error('Swap request failed');
      const { order: updatedOrder, newTransactions } = await res.json();

      // Update orders state — replace with server response (source of truth)
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));

      // Fix: keep txns that are for a DIFFERENT order, OR for this order but already PAID
      // De Morgan: !(A || B) && !C  →  keep if orderId doesn't match, or if it does match but status=paid
      setTransactions(prev => [
        ...prev.filter(t => {
          const tOrderId = typeof t.orderId === 'string' ? t.orderId : t.orderId?._id;
          const isThisOrder = tOrderId === updatedOrder._id;
          return !isThisOrder || t.status === 'paid';  // keep if different order OR already paid
        }),
        ...newTransactions,
      ]);

      setSwapModal(false);
      showToast(`Swap confirmed! ${selectedOption.name} will be delivered within 24 hours.`);
      setSwapTarget('');
    } catch (err) {
      console.error(err);
      showToast('Swap request failed. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const submitRelocate = async () => {
    if (!selectedItem?._id) return;
    setModalLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${selectedItem._id}/relocate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relocateAddress, relocateDate }),
      });
      if (!res.ok) throw new Error('Relocation request failed');
      const updatedOrder = await res.json();

      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      setRelocateModal(false);
      showToast('Relocation scheduled. Our logistics team will call to confirm the timeline.');
      setRelocateAddress(''); setRelocateDate('');
    } catch (err) {
      console.error(err);
      showToast('Failed to submit relocation request.');
    } finally {
      setModalLoading(false);
    }
  };

  const getSwapOptions = (itemName: string = '') => {
    const lower = itemName.toLowerCase();
    if (lower.includes('cooler') || lower.includes('ac')) {
      return [
        { name: '1.5 Ton Split AC', rent: 800, addRent: 350, img: 'https://plus.unsplash.com/premium_photo-1679943423706-570c6462f9a4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YWlyJTIwY29uZGl0aW9uZXJ8ZW58MHx8MHx8fDA%3D' },
        { name: 'Tower Air Cooler', rent: 300, addRent: -150, img: 'https://media.istockphoto.com/id/820247780/photo/evaporative-air-cooler-fan.webp?a=1&b=1&s=612x612&w=0&k=20&c=7717-g_T094h6toCXMhWIc2AF7rtCGPgFg8vDPEMTu0=' },
        { name: 'Desert Cooler Pro', rent: 550, addRent: 100, img: '/desert_air_cooler.png' }
      ];
    }
    if (lower.includes('sofa') || lower.includes('chair')) {
      return [
        { name: 'Premium Leather Sofa', rent: 1500, addRent: 300 },
        { name: 'Minimalist Fabric Sofa', rent: 1200, addRent: 0 },
        { name: 'L-Shape Sectional', rent: 1700, addRent: 500 }
      ];
    }
    if (lower.includes('bed') || lower.includes('mattress')) {
      return [
        { name: 'King Size Smart Bed', rent: 1200, addRent: 400 },
        { name: 'Queen Storage Bed', rent: 800, addRent: 0 },
        { name: 'Single Foam Bed', rent: 400, addRent: -400 }
      ];
    }
    if (lower.includes('tv') || lower.includes('television')) {
      return [
        { name: '65" OLED Smart TV', rent: 2000, addRent: 800 },
        { name: '55" QLED TV', rent: 1500, addRent: 300 },
        { name: '43" LED TV', rent: 800, addRent: -400 }
      ];
    }
    return [
      { name: `Premium ${itemName}`, rent: 500, addRent: 200 },
      { name: `Compact ${itemName}`, rent: 300, addRent: -150 }
    ];
  };

  // getSwapOptions is defined above. Compute currentOptions lazily (inside modal / submit) to avoid stale closure.
  const getCurrentOptions = () =>
    selectedItem?.items ? getSwapOptions(selectedItem.items[0]?.name) : [];

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [ordersRes, txnsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/user/${user._id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/user/${user._id}`),
        ]);

        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data);
        } else {
          setOrders([]);
        }

        if (txnsRes.ok) {
          setTransactions(await txnsRes.json());
        } else {
          setTransactions([]);
        }
      } catch (e) {
        console.error('Dashboard data fetch failed', e);
        setOrders([]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const cancelRequest = async (orderId: string, type: 'repair' | 'relocate' | 'swap') => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/cancel-request`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error('Cancel request failed');
      const data = await res.json();
      const updatedOrder = data.order || data;
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));

      if (type === 'swap' && data.newTransactions) {
        setTransactions(prev => [
          ...prev.filter(t => {
            const tOrderId = typeof t.orderId === 'string' ? t.orderId : t.orderId?._id;
            return !(tOrderId === updatedOrder._id && t.status === 'pending');
          }),
          ...data.newTransactions,
        ]);
      }
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} request cancelled.`);
    } catch (err) {
      console.error(err);
      showToast('Failed to cancel request.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    router.push('/');
  };

  const handleCancelRental = async (orderId: string) => {
    if (!user) return;
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    const cancellationFee = order.totalMonthlyRent || 0;
    if (cancellationFee < 1) {
      showToast('Unable to determine cancellation fee.');
      return;
    }

    setCancellingId(orderId);
    try {
      // 1. Load Razorpay SDK
      const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
          if ((window as any).Razorpay) return resolve(true);
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Payment gateway failed to load. Please check your internet connection.');
      }

      // 2. Create Razorpay order for the cancellation fee
      const payRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cancellationFee }),
      });
      if (!payRes.ok) throw new Error('Failed to initiate cancellation payment.');
      const razorpayOrder = await payRes.json();

      // 3. Open Razorpay checkout
      const rzp = new (window as any).Razorpay({
        key: 'rzp_test_SYcYnaLzuZmq1B',
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'FlexiRent',
        description: `Cancellation Fee — ${order.items?.[0]?.name || 'Rental'}`,
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            // 4. Verify payment
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user._id,
                amount: cancellationFee,
              }),
            });
            if (!verifyRes.ok) throw new Error('Payment verification failed.');

            // 5. Payment verified → proceed with cancellation
            const cancelRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/cancel-rental`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user._id }),
            });
            if (!cancelRes.ok) {
              const errData = await cancelRes.json().catch(() => ({}));
              throw new Error(errData.message || 'Cancellation failed after payment.');
            }
            const cancelData = await cancelRes.json();
            const updatedOrder = cancelData.order || cancelData;
            setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
            setTransactions(prev => {
              const updated = prev.map(t => {
                const tOrderId = typeof t.orderId === 'string' ? t.orderId : t.orderId?._id;
                if (tOrderId === updatedOrder._id && t.status === 'pending') {
                  return { ...t, status: 'cancelled' };
                }
                return t;
              });
              // Add the real cancellation fee transaction from the backend
              if (cancelData.cancellationTransaction) {
                updated.unshift(cancelData.cancellationTransaction);
              }
              return updated;
            });
            showToast('Rental cancelled successfully. Cancellation fee processed.');
          } catch (err: any) {
            console.error(err);
            showToast(err.message || 'Cancellation failed after payment.');
          } finally {
            setCancellingId(null);
            setCancelConfirmId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setCancellingId(null);
            showToast('Cancellation payment was not completed.');
          },
        },
        theme: { color: '#18181b' },
      });

      rzp.open();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to process cancellation.');
      setCancellingId(null);
      setCancelConfirmId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center bg-zinc-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 max-w-md w-full text-center animate-in fade-in zoom-in duration-500">
          <div className="text-4xl mb-6 text-zinc-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2 tracking-tight">Authentication Required</h2>
          <p className="text-sm text-zinc-500 mb-8 font-medium">Please log in securely to access your dashboard.</p>
          <Button className="w-full text-sm font-semibold shadow-sm" onClick={() => {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          }}
          >
            Login to Continue
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-[72px] flex justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mt-20"></div>
      </div>
    );
  }

  const activeRequests = orders.filter(o => o.repairStatus || o.swapStatus || o.relocateStatus).map(o => {
    const issues = [];
    if (o.repairStatus) issues.push({ type: 'Repair', status: o.repairStatus, date: o.createdAt });
    if (o.swapStatus) issues.push({ type: 'Swap', status: o.swapStatus, date: o.createdAt, targetName: o.swapTargetName });
    if (o.relocateStatus) issues.push({ type: 'Relocate', status: o.relocateStatus, date: o.createdAt });
    return { order: o, issues };
  });

  const isDateInRentalDuration = (dateStr: string, item: any) => {
    if (!dateStr || !item) return false;
    const selected = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const orderDate = new Date(item.createdAt);
    const endOfRental = new Date(orderDate.setMonth(orderDate.getMonth() + (item.rentalDurationMonths || 1)));
    
    return selected >= today && selected <= endOfRental;
  };
  
  const isRelocateValid = relocateAddress.trim() !== '' && isDateInRentalDuration(relocateDate, selectedItem);

  return (
    <div className="min-h-screen pt-[72px] flex flex-col md:flex-row bg-[#FAFAFA]">
      <aside className="w-full md:w-[260px] bg-white border-r border-zinc-200/80 px-4 py-8 flex flex-col md:min-h-[calc(100vh-72px)] md:sticky md:top-[72px] md:h-[calc(100vh-72px)] z-10 shrink-0">
        <div className="mb-8 hidden md:flex items-center gap-3 px-3">
          <div className="w-10 h-10 bg-zinc-900 text-white rounded-lg flex items-center justify-center text-lg font-bold shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight truncate">{user.name}</h2>
            <p className="text-[11px] text-zinc-500 font-medium truncate uppercase tracking-widest">Personal Account</p>
          </div>
        </div>

        <p className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 hidden md:block">Menu</p>
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Overview
          </button>
          <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            My Rentals
          </button>
          <button onClick={() => setActiveTab('payments')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'payments' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            Payments
          </button>
          <button onClick={() => setActiveTab('requests')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'requests' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            Requests History
          </button>

          <p className="px-3 pt-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 hidden md:block">Personal</p>
          <button onClick={() => setActiveTab('wishlist')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'wishlist' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            My Wishlist
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Profile Settings
          </button>
        </nav>

        <div className="mt-auto pt-6 hidden md:block">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-500 hover:bg-rose-50 hover:text-rose-600 w-full transition-all border border-transparent">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 max-w-[1000px] w-full pb-20">
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-6">Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200/80 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50 tracking-wide uppercase">Active</span>
                </div>
                <p className="text-zinc-500 font-medium mb-0.5 text-xs tracking-wide uppercase">Rented Items</p>
                <p className="text-3xl font-bold text-zinc-900 tracking-tight">{orders.filter(o => o.status === 'active').length}</p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200/80 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 tracking-wide uppercase">All Paid</span>
                </div>
                <p className="text-zinc-500 font-medium mb-0.5 text-xs tracking-wide uppercase">Monthly Outflow</p>
                <p className="text-3xl font-bold text-zinc-900 tracking-tight">₹{orders.filter(o => o.status === 'active').reduce((s, o) => s + (o.totalMonthlyRent || 0), 0)}</p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200/80 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 tracking-wide uppercase">Verified</span>
                </div>
                <p className="text-zinc-500 font-medium mb-0.5 text-xs tracking-wide uppercase">Delivery Zone</p>
                <p className="text-xl font-bold text-zinc-900 tracking-tight">{user.city || 'Metro City'}</p>
              </div>
            </div>

            <div className="bg-zinc-900 p-8 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-zinc-800 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-1 tracking-tight">Need technical support?</h3>
                <p className="text-zinc-400 font-medium text-sm">Initiate repairs or swap your device directly from the rentals panel.</p>
              </div>
              <Button onClick={() => setActiveTab('orders')} className="relative z-10 w-full sm:w-auto rounded-xl px-6 h-12 bg-white text-zinc-900 hover:bg-zinc-100 shadow-sm shrink-0 font-bold text-sm">
                Manage Rentals
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (() => {
          const activeOrders = orders.filter(o => o.status === 'active');
          const statusColors: Record<string, string> = {
            active: 'text-emerald-700 bg-emerald-50 border-emerald-200/50',
            completed: 'text-zinc-500 bg-zinc-100 border-zinc-200',
            cancelled: 'text-rose-600 bg-rose-50 border-rose-200',
            pending: 'text-amber-700 bg-amber-50 border-amber-200',
          };
          return (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-6">My Rentals</h1>
              {activeOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-zinc-200/80 shadow-sm">
                  <div className="w-12 h-12 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">📦</div>
                  <p className="text-zinc-500 font-medium text-sm mb-1">No active rentals.</p>
                  <p className="text-zinc-400 text-xs mb-4">Items you rent will appear here.</p>
                  <Button onClick={() => router.push('/products')}>Explore Products</Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeOrders.map((order) => {
                    const displayName = order.swapTargetName || order.items[0]?.name || 'Rental Item';
                    // Support both old (productId.imageUrl) and new (imageUrl direct on item) structures
                    const displayImage = order.swapTargetImage
                      || order.items[0]?.imageUrl
                      || order.items[0]?.productId?.imageUrl;
                    const statusKey = (order.status || 'active').toLowerCase();
                    const statusLabel = statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
                    const orderDate = order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—';
                    return (
                      <div key={order._id} className="bg-white border border-zinc-100 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 hover:shadow-xl hover:border-zinc-200 transition-all duration-300 relative group">
                        <div className="w-full sm:w-32 aspect-square flex-shrink-0 bg-zinc-50 rounded-[1.5rem] overflow-hidden border border-zinc-100 shadow-inner">
                          {displayImage
                            ? <img src={displayImage} className="w-full h-full object-cover" alt={displayName} />
                            : <div className="w-full h-full flex items-center justify-center text-4xl text-zinc-200">📦</div>
                          }
                        </div>
                        <div className="flex-1 w-full min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-lg font-bold text-zinc-900 tracking-tight truncate">{displayName}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${statusColors[statusKey] || statusColors.active}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-1">
                            Ref: {order._id.slice(-8).toUpperCase()} &middot; {order.rentalDurationMonths || 1} Month{(order.rentalDurationMonths || 1) > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-zinc-400 font-medium mb-5">Ordered: {orderDate}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 px-4 rounded-md border border-zinc-200 font-bold text-xs" onClick={() => { setSelectedItem(order); setRepairModal(true); }}>Repair</Button>
                            {order.swapUsed ? (
                              <Button variant="outline" size="sm" className="h-8 px-4 rounded-md border border-zinc-100 font-bold text-xs text-zinc-300 cursor-not-allowed" disabled onClick={() => showToast('You can only swap once per item.')}>Swapped</Button>
                            ) : (
                              <Button variant="outline" size="sm" className="h-8 px-4 rounded-md border border-zinc-200 font-bold text-xs" onClick={() => { setSelectedItem(order); setSwapModal(true); }}>Swap</Button>
                            )}
                            <Button variant="outline" size="sm" className="h-8 px-4 rounded-md border border-zinc-200 font-bold text-xs" onClick={() => { setSelectedItem(order); setRelocateModal(true); }}>Relocate</Button>
                            <DashboardWriteReview productName={displayName} productId={order._id} />
                            {order.swapUsed ? (
                              <button
                                onClick={() => showToast('Swapped items cannot be cancelled. Please contact support for assistance.')}
                                className="h-8 px-4 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-400 font-bold text-xs cursor-not-allowed"
                              >
                                Cancel Rental
                              </button>
                            ) : (
                              <button
                                onClick={() => setCancelConfirmId(order._id)}
                                disabled={cancellingId === order._id}
                                className="h-8 px-4 rounded-md border border-rose-200 bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {cancellingId === order._id ? 'Cancelling...' : 'Cancel Rental'}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="block text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-1">Monthly</span>
                          <span className="text-2xl font-black text-zinc-900 tracking-tight">₹{order.totalMonthlyRent || '—'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}


        {activeTab === 'profile' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-6">Profile Settings</h1>
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Full Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} disabled={!isEditingProfile} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-800 focus:bg-white focus:border-zinc-900 outline-none transition-all disabled:opacity-70" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Email Address</label>
                  <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} disabled={!isEditingProfile} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-800 focus:bg-white focus:border-zinc-900 outline-none transition-all disabled:opacity-70" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">City</label>
                  <input type="text" value={editCity} onChange={e => setEditCity(e.target.value)} disabled={!isEditingProfile} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-800 focus:bg-white focus:border-zinc-900 outline-none transition-all disabled:opacity-70" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Pincode</label>
                  <input type="text" value={editPincode} onChange={e => setEditPincode(e.target.value)} disabled={!isEditingProfile} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-800 focus:bg-white focus:border-zinc-900 outline-none transition-all disabled:opacity-70" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">House No / Flat No / Building Name</label>
                  <input type="text" value={editLine1} onChange={e => setEditLine1(e.target.value)} disabled={!isEditingProfile} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-800 focus:bg-white focus:border-zinc-900 outline-none transition-all disabled:opacity-70" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Street / Area / Locality</label>
                  <input type="text" value={editLine2} onChange={e => setEditLine2(e.target.value)} disabled={!isEditingProfile} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-800 focus:bg-white focus:border-zinc-900 outline-none transition-all disabled:opacity-70" />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                {isEditingProfile ? (
                  <>
                    <Button variant="ghost" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                    <Button onClick={saveProfile}>Save Changes</Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditingProfile(true)}>Edit Profile</Button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-6">My Wishlist</h1>
            {wishlist.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-zinc-200/80 shadow-sm">
                <p className="text-zinc-500 font-medium text-sm">Your wishlist is empty.</p>
                <Button onClick={() => router.push('/products')} className="mt-4">Browse Catalog</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (() => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // ── Fixed date label: floor months, correct grammar, no '1 months away' ──
          const getTimeLabel = (dueDateRaw: string): { label: string; urgency: string } => {
            const now = new Date();
            const due = new Date(dueDateRaw);
            const diffTime = due.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const months = Math.floor(diffDays / 30);
            if (diffDays < 0) return { label: 'Overdue', urgency: 'overdue' };
            if (diffDays === 0) return { label: 'Due Today', urgency: 'today' };
            if (diffDays < 30) return { label: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`, urgency: 'immediate' };
            if (months === 1) return { label: '1 month away', urgency: 'future' };
            return { label: `${months} months away`, urgency: 'future' };
          };

          // ── orderId → item name fallback map (for old transactions without itemName) ──
          const orderItemMap: Record<string, string> = {};
          orders.forEach((o: any) => { if (o._id) orderItemMap[o._id] = o.swapTargetName || o.items?.[0]?.name || ''; });
          const getItemName = (t: any): string => {
            // Prefer itemName stamped on the transaction (always fresh after a swap)
            if (t.itemName) return t.itemName;
            const oid = typeof t.orderId === 'string' ? t.orderId : (t.orderId?._id || '');
            return orderItemMap[oid] || '';
          };

          // ── Pay Now: PATCH /api/transactions/:id/pay → optimistic UI update ──
          const handlePayNow = async (txnId: string) => {
            if (payingId) return;
            setPayingId(txnId);
            try {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${txnId}/pay`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
              });
              if (!res.ok) throw new Error('Payment failed');
              const updated = await res.json();
              setTransactions(prev =>
                prev.map(t => t._id === txnId
                  ? { ...t, status: 'paid', paidAt: updated.paidAt || new Date().toISOString() }
                  : t
                )
              );
              showToast('Payment successful! ✅');
            } catch {
              showToast('Payment failed. Please try again.');
            } finally {
              setPayingId(null);
            }
          };

          const urgencyBadgeClass: Record<string, string> = {
            overdue: 'bg-rose-500/30 text-rose-200 border border-rose-400/30',
            today: 'bg-amber-400/30 text-amber-200 border border-amber-400/30',
            immediate: 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/20',
            future: 'bg-white/10 text-white/60 border border-white/10',
          };

          const pendingTxns = transactions
            .filter((t: any) => t.status === 'pending')
            .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
          const paidTxns = transactions
            .filter((t: any) => t.status === 'paid')
            .sort((a: any, b: any) => new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime());

          const immediate = pendingTxns.filter((t: any) => ['overdue', 'today', 'immediate'].includes(getTimeLabel(t.dueDate).urgency));
          const upcoming = pendingTxns.filter((t: any) => {
            const diffDays = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return diffDays >= 30 && diffDays <= 90;
          });
          const later = pendingTxns.filter((t: any) => {
            const diffDays = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return diffDays > 90;
          });

          if (loading) return (
            <div className="animate-in fade-in duration-300 space-y-8">
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Payments</h1>
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="bg-zinc-100 animate-pulse rounded-2xl h-40" />)}
              </div>
              <div className="bg-zinc-100 animate-pulse rounded-2xl h-52" />
            </div>
          );

          return (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Payments</h1>

              {/* ── UPCOMING PAYMENTS ── */}
              {pendingTxns.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-slate-700 font-bold text-base mb-1">All Clear!</p>
                  <p className="text-xs text-slate-400 font-medium">You have no upcoming payments. Enjoy the break 🎉</p>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* ── HERO: Next Payment Due ── */}
                  {immediate.length > 0 && (() => {
                    const next = immediate[0];
                    const { label, urgency } = getTimeLabel(next.dueDate);
                    const formattedDue = new Date(next.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                    const heroItemName = getItemName(next);
                    const glowClass = urgency === 'overdue' ? 'shadow-[0_0_40px_-8px_rgba(239,68,68,0.4)]'
                      : urgency === 'today' ? 'shadow-[0_0_40px_-8px_rgba(251,191,36,0.35)]'
                        : 'shadow-[0_0_40px_-8px_rgba(99,102,241,0.35)]';
                    const ringClass = urgency === 'overdue' ? 'ring-1 ring-rose-500/30'
                      : urgency === 'today' ? 'ring-1 ring-amber-400/30'
                        : 'ring-1 ring-indigo-500/20';

                    return (
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Next Payment Due
                        </p>
                        <div className={`bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-7 text-white relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${glowClass} ${ringClass}`}>
                          {/* Decorative blobs */}
                          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                          <div className="relative z-10">
                            {/* Header row */}
                            <div className="flex items-center justify-between mb-5">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                                    {next.type === 'deposit' ? 'Security Deposit' : 'Monthly Rent'}
                                  </span>
                                  {heroItemName && (
                                    <p className="text-[11px] text-white/50 font-medium mt-0.5 truncate max-w-[220px]">{heroItemName}</p>
                                  )}
                                </div>
                              </div>
                              <span className={`text-[11px] font-bold px-3 py-1 rounded-full tracking-wide ${urgencyBadgeClass[urgency]}`}>
                                {label}
                              </span>
                            </div>

                            {/* Amount */}
                            <p className="text-4xl font-black tracking-tight mb-1">₹{next.amount.toLocaleString('en-IN')}</p>
                            <div className="flex items-center gap-1.5 text-slate-300 mb-6">
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              <p className="text-sm font-medium">Due on {formattedDue}</p>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-white/10 mb-5" />

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handlePayNow(next._id)}
                                disabled={!!payingId}
                                className="flex-1 bg-white text-zinc-900 hover:bg-zinc-100 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all font-black text-sm py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2"
                              >
                                {payingId === next._id ? (
                                  <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Processing...
                                  </>
                                ) : 'Pay Now'}
                              </button>
                              <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/15 text-center shrink-0">
                                <span className="text-xs font-bold text-white/70 block leading-tight">Auto-Pay</span>
                                <span className="text-[10px] text-white/40 font-medium">Enabled</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Secondary immediate payments */}
                        {immediate.slice(1).map(t => {
                          const { label, urgency } = getTimeLabel(t.dueDate);
                          const fd = new Date(t.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                          const itemName = getItemName(t);
                          return (
                            <div key={t._id} className="mt-3 bg-white border border-zinc-200 rounded-xl px-5 py-4 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                  <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-zinc-900">
                                    {t.type === 'deposit' ? 'Security Deposit' : 'Monthly Rent'}
                                    {itemName && <span className="font-normal text-zinc-500"> — {itemName}</span>}
                                  </p>
                                  <p className="text-xs text-zinc-400 font-medium flex items-center gap-1 mt-0.5">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    {fd}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handlePayNow(t._id)}
                                  disabled={!!payingId}
                                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                                >
                                  {payingId === t._id && (
                                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                  )}
                                  {payingId === t._id ? 'Processing...' : 'Pay Now'}
                                </button>
                                <span className="text-base font-black text-zinc-900">₹{t.amount.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* ── UPCOMING (1–3 months) ── */}
                  {upcoming.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Upcoming — Next 3 Months
                      </p>
                      <div className="space-y-2">
                        {upcoming.map(t => {
                          const { label } = getTimeLabel(t.dueDate);
                          const fd = new Date(t.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                          const upcomingItemName = getItemName(t);
                          return (
                            <div key={t._id} className="bg-white border border-zinc-100 rounded-xl px-5 py-3.5 flex items-center justify-between hover:border-zinc-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                                  <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-zinc-700">
                                    {t.type === 'deposit' ? 'Security Deposit' : 'Monthly Rent'}
                                    {upcomingItemName && <span className="font-normal text-zinc-400"> — {upcomingItemName}</span>}
                                  </p>
                                  <p className="text-xs text-zinc-400 font-medium">{fd}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 border border-zinc-100 px-2.5 py-1 rounded-full">{label}</span>
                                <span className="text-sm font-bold text-zinc-600">₹{t.amount.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── LATER (3+ months) — Collapsed ── */}
                  {later.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Later — {later.length} payment{later.length === 1 ? '' : 's'} scheduled
                      </p>
                      <div className="bg-zinc-50 border border-zinc-100 rounded-xl divide-y divide-zinc-100">
                        {later.map(t => {
                          const fd = new Date(t.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                          const { label } = getTimeLabel(t.dueDate);
                          const laterItemName = getItemName(t);
                          return (
                            <div key={t._id} className="px-5 py-3 flex items-center justify-between hover:bg-white/70 transition-colors rounded-xl">
                              <div className="flex items-center gap-2">
                                <svg className="w-3.5 h-3.5 text-zinc-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p className="text-xs text-zinc-500 font-medium">
                                  {t.type === 'deposit' ? 'Deposit' : 'Rent'}{laterItemName && ` · ${laterItemName}`} — {fd}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-400 font-medium">{label}</span>
                                <span className="text-xs font-bold text-zinc-500">₹{t.amount.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── PAST TRANSACTIONS TABLE ── */}
              <div>
                <h2 className="text-lg font-bold text-zinc-900 tracking-tight mb-4">Past Transactions</h2>
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Transaction / Invoice</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Description</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {paidTxns.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-16 text-center">
                            <div className="w-12 h-12 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">💸</div>
                            <p className="text-zinc-500 font-bold text-sm">No transaction history found.</p>
                          </td>
                        </tr>
                      ) : (
                        paidTxns.map((t) => {
                          const dateStr = new Date(t.paidAt || t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                          const invoiceSuffix = t.type === 'deposit' ? 'DEP' : t.type === 'cancellation' ? 'CAN' : 'RNT';
                          const invoiceId = `TXN-${t._id.slice(-8).toUpperCase()}-${invoiceSuffix}`;
                          return (
                            <tr key={t._id} className="hover:bg-zinc-50 transition-colors">
                              <td className="px-6 py-4 text-sm text-zinc-600 font-medium">{dateStr}</td>
                              <td className="px-6 py-4 text-sm text-zinc-900 font-mono text-xs font-bold">{invoiceId}</td>
                              <td className="px-6 py-4">
                                {t.type === 'cancellation' ? (
                                  <>
                                    <p className="text-sm text-rose-600 font-bold">Cancellation Fee</p>
                                    {getItemName(t) && <p className="text-xs text-rose-500 font-semibold">{getItemName(t)}</p>}
                                    <p className="text-xs text-zinc-500 font-medium">Early termination charge — 1 month rent</p>
                                  </>
                                ) : t.type === 'deposit' ? (
                                  <>
                                    <p className="text-sm text-zinc-900 font-bold">Security Deposit</p>
                                    {getItemName(t) && <p className="text-xs text-indigo-600 font-semibold">{getItemName(t)}</p>}
                                    <p className="text-xs text-zinc-500 font-medium">Refundable after end of tenure</p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm text-zinc-900 font-bold">Monthly Rent</p>
                                    {getItemName(t) && <p className="text-xs text-indigo-600 font-semibold">{getItemName(t)}</p>}
                                    <p className="text-xs text-zinc-500 font-medium">Rental payment — advance</p>
                                  </>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-zinc-900 font-black">₹{t.amount.toLocaleString('en-IN')}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50 uppercase">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                  Paid
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {activeTab === 'requests' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-6">Service Requests</h1>
            {activeRequests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-zinc-200/80 shadow-sm">
                <p className="text-zinc-500 font-medium text-sm">No active service requests found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeRequests.map((req, i) => (
                  <div key={i} className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-zinc-900">{req.order.items[0]?.name}</h3>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{req.order._id}</p>
                    </div>
                    <div className="space-y-3">
                      {req.issues.map((issue: any, j: number) => (
                        <div key={j} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs font-bold uppercase">{issue.type.charAt(0)}</div>
                            <div>
                              <p className="text-xs font-bold text-zinc-900">{issue.type} Request</p>
                              <p className="text-[10px] text-zinc-500 font-medium">{new Date(issue.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${issue.status === 'Cancelled' ? 'bg-zinc-100 text-zinc-500 border-zinc-200' : 'bg-amber-50 text-amber-700 border-amber-200/50'}`}>
                              {issue.status}
                            </span>
                            {issue.status !== 'Cancelled' && issue.type !== 'Swap' && (
                              <button onClick={() => cancelRequest(req.order._id, issue.type.toLowerCase() as any)} className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline transition-colors">Cancel</button>
                            )}
                            {issue.status !== 'Cancelled' && issue.type === 'Swap' && (
                              <span className="text-[10px] font-medium text-zinc-400 italic">Irreversible</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* SERVICE MODALS */}
      {repairModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl scale-in-center border border-zinc-200/50">
            <h3 className="text-lg font-bold text-zinc-900 mb-1 tracking-tight">Request Service</h3>
            <p className="text-xs text-zinc-500 font-medium mb-5">A technician will evaluate the issue locally.</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Issue Type</label>
                <select className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-800 focus:border-zinc-900 focus:bg-white transition-all outline-none" value={repairIssue} onChange={e => setRepairIssue(e.target.value)}>
                  <option value="">Select Category</option>
                  <option value="Damage">Physical Damage</option>
                  <option value="Malfunction">Technical Malfunction</option>
                  <option value="Wear">Normal Wear & Tear</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Description (Mandatory)</label>
                <textarea className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium focus:border-zinc-900 focus:bg-white transition-all outline-none resize-none h-20 text-zinc-800 placeholder:text-zinc-400" placeholder="Brief details..." value={repairDesc} onChange={e => setRepairDesc(e.target.value)}></textarea>
                {repairDesc.trim().length > 0 && repairDesc.trim().length < 50 && (
                  <p className="text-red-500 text-[10px] font-bold mt-1.5">Description must be at least 50 letters long.</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-md h-9 text-xs font-bold border-zinc-200" onClick={() => { setRepairModal(false); }}>Cancel</Button>
              <Button
                className={`flex-1 rounded-md h-9 text-xs font-bold shadow-sm transition-all ${(!repairIssue || repairDesc.trim().length < 50 || modalLoading) ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border-0' : 'bg-zinc-900 hover:bg-zinc-800 text-white border-0'}`}
                onClick={submitRepair}
                disabled={!repairIssue || repairDesc.trim().length < 50 || modalLoading}
              >
                {modalLoading ? 'Sending...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {swapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl scale-in-center border border-zinc-200/50">
            <h3 className="text-lg font-bold text-zinc-900 mb-1 tracking-tight">Swap Item</h3>
            <p className="text-xs text-zinc-500 font-medium mb-2">Select a replacement device.</p>
            <div className="bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-2 mb-5 flex items-start gap-2">
              <svg className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              <p className="text-[11px] text-amber-800 font-semibold leading-snug">This action is <span className="font-black">irreversible</span>. You can only swap once per item.</p>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Replacement Device</label>
                <select className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-800 focus:border-zinc-900 focus:bg-white transition-all outline-none" value={swapTarget} onChange={e => setSwapTarget(e.target.value)}>
                  <option value="">Choose an alternative...</option>
                  {getCurrentOptions().map((opt: any) => (
                    <option key={opt.name} value={opt.name}>
                      {opt.name} — ₹{opt.rent}/mo
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-md h-9 text-xs font-bold border-zinc-200" onClick={() => setSwapModal(false)}>Cancel</Button>
              <Button
                className={`flex-1 rounded-md h-9 text-xs font-bold shadow-sm transition-all ${(!swapTarget || modalLoading) ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border-0' : 'bg-zinc-900 hover:bg-zinc-800 text-white border-0'}`}
                onClick={submitSwap}
                disabled={!swapTarget || modalLoading}
              >
                {modalLoading ? 'Processing...' : 'Confirm Swap'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {relocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl scale-in-center border border-zinc-200/50">
            <h3 className="text-lg font-bold text-zinc-900 mb-1 tracking-tight">Schedule Relocation</h3>
            <p className="text-xs text-zinc-500 font-medium mb-5">Safe packing and moving services.</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">New Full Address (Mandatory)</label>
                <textarea className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium focus:border-zinc-900 focus:bg-white transition-all outline-none resize-none h-16 text-zinc-800 placeholder:text-zinc-400" placeholder="Apt, Street, Area..." value={relocateAddress} onChange={e => setRelocateAddress(e.target.value)}></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Preferred Date</label>
                <input type="date" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-semibold focus:border-zinc-900 focus:bg-white transition-all outline-none text-zinc-800" value={relocateDate} onChange={e => setRelocateDate(e.target.value)} />
                {!isDateInRentalDuration(relocateDate, selectedItem) && relocateDate !== '' && (
                  <p className="text-red-500 text-[10px] font-bold mt-1.5">Date out of rental duration</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-md h-9 text-xs font-bold border-zinc-200" onClick={() => setRelocateModal(false)}>Cancel</Button>
              <button
                onClick={submitRelocate}
                disabled={!isRelocateValid || modalLoading}
                className={`flex-1 rounded-md h-9 text-xs font-bold shadow-sm transition-all ${!isRelocateValid || modalLoading ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border-0' : 'bg-zinc-900 hover:bg-zinc-800 text-white border-0'}`}
              >
                {modalLoading ? 'Scheduling...' : 'Schedule Move'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL RENTAL CONFIRMATION DIALOG */}
      {cancelConfirmId && (() => {
        const cancelOrder = orders.find(o => o._id === cancelConfirmId);
        const fee = cancelOrder?.totalMonthlyRent || 0;
        const itemName = cancelOrder?.swapTargetName || cancelOrder?.items?.[0]?.name || 'Rental Item';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl p-7 max-w-md w-full shadow-2xl scale-in-center border border-zinc-200/50">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Terminate Rental Agreement</h3>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">Early termination for <span className="text-zinc-700 font-semibold">{itemName}</span></p>
                </div>
              </div>

              <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 mb-5 space-y-3">
                <p className="text-sm text-zinc-600 font-medium leading-relaxed">
                  As per our rental policy, early cancellation requires a <span className="text-zinc-900 font-bold">one-month rental fee</span> as a termination charge. This covers logistics, inspection, and restocking costs.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-200/70">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Cancellation Fee</span>
                  <span className="text-xl font-black text-zinc-900 tracking-tight">₹{fee.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 font-medium leading-relaxed mb-6">
                Upon payment, your rental will be terminated immediately. All future pending payments will be voided and the product will be scheduled for pickup. This action is irreversible.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setCancelConfirmId(null)}
                  className="flex-1 rounded-xl h-10 text-xs font-bold border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-all"
                >
                  Keep Rental
                </button>
                <button
                  onClick={() => handleCancelRental(cancelConfirmId)}
                  disabled={!!cancellingId}
                  className="flex-1 rounded-xl h-10 text-xs font-bold shadow-sm transition-all bg-rose-600 hover:bg-rose-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {cancellingId ? (
                    <>
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Processing...
                    </>
                  ) : `Pay ₹${fee.toLocaleString('en-IN')} & Cancel`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
