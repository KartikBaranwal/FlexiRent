"use client";
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  monthlyRent: number;
  category: string;
  imageUrl: string;
  stock: number;
  rating: number;
}

const EMPTY_FORM = {
  name: '',
  description: '',
  monthlyRent: '',
  category: '',
  imageUrl: '',
  stock: '10',
};

export default function AdminProducts() {
  const { user: adminUser } = useAppContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const headers = {
    Authorization: `Bearer ${adminUser?.token}`,
    'Content-Type': 'application/json',
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, { headers });
      if (!res.ok) throw new Error('Failed to load products');
      setProducts(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (adminUser?.token) fetchProducts(); }, [adminUser]);

  const openAdd = () => {
    setEditProduct(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description,
      monthlyRent: String(p.monthlyRent),
      category: p.category,
      imageUrl: p.imageUrl,
      stock: String(p.stock),
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.monthlyRent || !form.category || !form.imageUrl || !form.description) {
      setFormError('Please fill all required fields.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const body = {
        name: form.name,
        description: form.description,
        monthlyRent: Number(form.monthlyRent),
        category: form.category,
        imageUrl: form.imageUrl,
        stock: Number(form.stock) || 10,
      };
      const url = editProduct ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${editProduct._id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`;
      const method = editProduct ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Save failed');
      const saved = await res.json();
      if (editProduct) {
        setProducts((prev) => prev.map((p) => (p._id === saved._id ? saved : p)));
      } else {
        setProducts((prev) => [saved, ...prev]);
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Delete failed');
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setConfirmId(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Products</h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">{products.length} total products</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-60 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 transition-colors"
          />
          <button
            onClick={openAdd}
            className="bg-zinc-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-100 animate-pulse rounded-2xl h-64" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-zinc-200 text-zinc-400 text-sm font-medium">
              No products found.
            </div>
          ) : (
            filtered.map((p) => (
              <div key={p._id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-[4/3] overflow-hidden bg-zinc-100">
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 leading-tight">{p.name}</h3>
                      <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">{p.category}</p>
                    </div>
                    <span className="text-sm font-black text-zinc-900 shrink-0">₹{p.monthlyRent}/mo</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium line-clamp-2 mb-4">{p.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-400">Stock: {p.stock}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-xs font-bold text-zinc-600 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
                      >
                        Edit
                      </button>
                      {confirmId === p._id ? (
                        <>
                          <button
                            onClick={() => handleDelete(p._id)}
                            disabled={deletingId === p._id}
                            className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {deletingId === p._id ? '...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="text-xs font-bold text-zinc-400 hover:text-zinc-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmId(p._id)}
                          className="text-xs font-bold text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 px-3 py-1.5 rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-zinc-900">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl mb-5">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              {[
                { key: 'name', label: 'Product Name *', placeholder: 'e.g. Smart TV 55"' },
                { key: 'category', label: 'Category *', placeholder: 'e.g. Electronics' },
                { key: 'imageUrl', label: 'Image URL *', placeholder: 'https://...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-all"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Monthly Rent (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 800"
                    value={form.monthlyRent}
                    onChange={(e) => setForm((f) => ({ ...f, monthlyRent: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Stock</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="10"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">Description *</label>
                <textarea
                  rows={3}
                  placeholder="Product description..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
