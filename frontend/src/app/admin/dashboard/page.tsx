"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';

interface Stats {
  totalUsers: number;
  totalProducts: number;
  activeRentals: number;
  totalRentals: number;
}

const StatCard = ({
  label, value, icon, color,
}: { label: string; value: number | string; icon: React.ReactNode; color: string }) => (
  <div className="bg-white rounded-2xl border border-zinc-200 p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-3xl font-black text-zinc-900 tracking-tight">{value}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const { user } = useAppContext();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.token) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        setStats(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500 font-medium mt-1">Welcome back, {user?.name}. Here's what's happening.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-100 animate-pulse rounded-2xl h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard
            label="Total Users"
            value={stats?.totalUsers ?? 0}
            color="bg-indigo-50 text-indigo-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <StatCard
            label="Total Products"
            value={stats?.totalProducts ?? 0}
            color="bg-emerald-50 text-emerald-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            }
          />
          <StatCard
            label="Active Rentals"
            value={stats?.activeRentals ?? 0}
            color="bg-amber-50 text-amber-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            }
          />
          <StatCard
            label="Total Rentals"
            value={stats?.totalRentals ?? 0}
            color="bg-rose-50 text-rose-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            }
          />
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'Manage Users', href: '/admin/users', desc: 'View and delete user accounts', color: 'bg-indigo-600' },
          { label: 'Manage Products', href: '/admin/products', desc: 'Add, edit or remove products', color: 'bg-emerald-600' },
          { label: 'Manage Rentals', href: '/admin/rentals', desc: 'Update rental statuses', color: 'bg-amber-600' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-md transition-all group"
          >
            <div className={`w-10 h-10 ${item.color} rounded-xl mb-4 flex items-center justify-center`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-sm font-bold text-zinc-900 group-hover:text-zinc-700 transition-colors">{item.label}</p>
            <p className="text-xs text-zinc-500 font-medium mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
