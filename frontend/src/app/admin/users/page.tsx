"use client";
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  city?: string;
  createdAt: string;
}

export default function AdminUsers() {
  const { user: adminUser } = useAppContext();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const headers = { Authorization: `Bearer ${adminUser?.token}` };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers });
      if (!res.ok) throw new Error('Failed to load users');
      setUsers(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (adminUser?.token) fetchUsers(); }, [adminUser]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Delete failed');
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setConfirmId(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Users</h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">{users.length} total accounts</p>
        </div>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 transition-colors"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-zinc-100 animate-pulse rounded-xl h-14" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-6 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Name</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Email</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Role</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-widest">City</th>
                <th className="text-left px-6 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Joined</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 text-sm font-medium">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-zinc-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 font-medium">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                        u.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-medium">{u.city || '—'}</td>
                    <td className="px-6 py-4 text-zinc-400 font-medium text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u._id === adminUser?._id ? (
                        <span className="text-xs text-zinc-300 font-medium">You</span>
                      ) : confirmId === u._id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs text-zinc-500 font-medium">Confirm?</span>
                          <button
                            onClick={() => handleDelete(u._id)}
                            disabled={deletingId === u._id}
                            className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {deletingId === u._id ? 'Deleting...' : 'Yes, Delete'}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="text-xs font-bold text-zinc-500 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(u._id)}
                          className="text-xs font-bold text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 px-3 py-1.5 rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
