"use client";
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';

interface Rental {
  _id: string;
  userId: { _id: string; name: string; email: string } | null;
  items: { name: string; imageUrl?: string }[];
  totalMonthlyRent: number;
  rentalDurationMonths: number;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['pending', 'active', 'completed', 'cancelled'];

const statusStyle: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

export default function AdminRentals() {
  const { user: adminUser } = useAppContext();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const headers = {
    Authorization: `Bearer ${adminUser?.token}`,
    'Content-Type': 'application/json',
  };

  const fetchRentals = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/rentals`, { headers });
      if (!res.ok) throw new Error('Failed to load rentals');
      setRentals(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (adminUser?.token) fetchRentals(); }, [adminUser]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/rentals/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Status update failed');
      const updated = await res.json();
      setRentals((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = rentals.filter((r) => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const itemName = r.items?.[0]?.name?.toLowerCase() || '';
    const userName = r.userId?.name?.toLowerCase() || '';
    const matchSearch =
      !search ||
      itemName.includes(search.toLowerCase()) ||
      userName.includes(search.toLowerCase()) ||
      r._id.includes(search);
    return matchStatus && matchSearch;
  });

  const countByStatus = (s: string) => rentals.filter((r) => r.status === s).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Rentals</h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">{rentals.length} total orders</p>
        </div>
        <input
          type="text"
          placeholder="Search by item, user or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 transition-colors"
        />
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {['all', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
              filterStatus === s
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-700'
            }`}
          >
            {s === 'all' ? `All (${rentals.length})` : `${s} (${countByStatus(s)})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-zinc-100 animate-pulse rounded-2xl h-24" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200 text-zinc-400 text-sm font-medium">
              No rentals found.
            </div>
          ) : (
            filtered.map((r) => {
              const itemName = r.items?.[0]?.name || 'Rental Item';
              const itemImage = r.items?.[0]?.imageUrl;
              const orderDate = new Date(r.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              });
              return (
                <div
                  key={r._id}
                  className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 flex items-center gap-5 hover:shadow-md transition-all"
                >
                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl bg-zinc-100 overflow-hidden flex items-center justify-center shrink-0 border border-zinc-100">
                    {itemImage ? (
                      <img src={itemImage} alt={itemName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl text-zinc-300">📦</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="text-sm font-bold text-zinc-900 truncate">{itemName}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${statusStyle[r.status] || statusStyle.active}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-medium">
                      ID: {r._id.slice(-8).toUpperCase()} &middot; {orderDate} &middot; {r.rentalDurationMonths || 1} month{(r.rentalDurationMonths || 1) > 1 ? 's' : ''}
                    </p>
                    {r.userId && (
                      <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                        👤 {r.userId.name} &middot; {r.userId.email}
                      </p>
                    )}
                  </div>

                  {/* Rent */}
                  <div className="text-right shrink-0 mr-4">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Monthly</span>
                    <span className="text-lg font-black text-zinc-900">₹{r.totalMonthlyRent || '—'}</span>
                  </div>

                  {/* Status select */}
                  <div className="shrink-0">
                    <select
                      value={r.status}
                      disabled={updatingId === r._id}
                      onChange={(e) => handleStatusChange(r._id, e.target.value)}
                      className="text-xs font-bold bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 outline-none focus:border-zinc-400 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    {updatingId === r._id && (
                      <p className="text-[10px] text-zinc-400 font-medium text-center mt-1">Saving...</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
