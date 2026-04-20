"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useAppContext } from '@/context/AppContext';

interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}

// Static seed reviews with mixed ratings for realism
const SEED_REVIEWS: Review[] = [
  { id: 'r1', user: 'Arjun M.', avatar: 'A', rating: 5, text: 'Delivered on time and in perfect condition. Highly recommended!', date: '12 Mar 2025', verified: true },
  { id: 'r2', user: 'Priya S.', avatar: 'P', rating: 5, text: 'Great quality for the price. Fits my space perfectly.', date: '28 Feb 2025', verified: true },
  { id: 'r3', user: 'Ravi K.', avatar: 'R', rating: 5, text: 'The zero-deposit model is a game changer. Will renew for sure.', date: '14 Jan 2025', verified: true },
  { id: 'r4', user: 'Amit Ghosh', avatar: 'A', rating: 4, text: 'Very good product, slightly delayed delivery but worth it.', date: '05 Jan 2025', verified: true },
];

const CATEGORY_REVIEWS: Record<string, any[]> = {
  furniture: [
    { user: 'Amit R.', rating: 5, text: 'Beautiful finish and very sturdy. Transformed my living room!', date: '10 Mar 2025' },
    { user: 'Neha P.', rating: 5, text: 'Super comfortable and high quality materials. Worth every penny.', date: '02 Mar 2025' },
    { user: 'Sneha L.', rating: 5, text: 'Elegant design, exactly as pictured. Delivery was quick.', date: '20 Feb 2025' },
    { user: 'Rahul V.', rating: 4, text: 'Good quality furniture, though assembly took a bit of time.', date: '15 Feb 2025' }
  ],
  appliances: [
    { user: 'Suresh V.', rating: 5, text: 'Energy efficient and very quiet. Works like a charm!', date: '15 Mar 2025' },
    { user: 'Meera K.', rating: 5, text: 'Sleek design and excellent cooling. Best rental experience.', date: '05 Mar 2025' },
    { user: 'Karthik S.', rating: 5, text: 'Very reliable and has all the latest features. Satisfied!', date: '25 Feb 2025' },
    { user: 'Pooja M.', rating: 4, text: 'Great appliance, works well but the cord could be longer.', date: '10 Feb 2025' }
  ],
  fitness: [
    { user: 'Raj G.', rating: 5, text: 'Stable and robust build. Great for intense daily workouts.', date: '12 Mar 2025' },
    { user: 'Simran C.', rating: 5, text: 'Compact and powerful. The display tracking is very accurate.', date: '08 Mar 2025' },
    { user: 'Vikram B.', rating: 5, text: 'Professional grade equipment at a fraction of the cost.', date: '01 Mar 2025' },
    { user: 'Anjali D.', rating: 4, text: 'Good for home use, bit bulky to move around.', date: '20 Feb 2025' }
  ]
};

const AVATAR_COLORS = ['bg-indigo-100 text-indigo-700', 'bg-purple-100 text-purple-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700'];

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const labels: Record<number, string> = {
    5: 'Excellent',
    4: 'Very Good',
    3: 'Good',
    2: 'Poor',
    1: 'Very Poor'
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="text-3xl transition-transform hover:scale-125 focus:outline-none"
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <span className={(hovered || value) >= star ? 'text-yellow-400' : 'text-slate-300'}>★</span>
          </button>
        ))}
      </div>
      {(hovered || value) > 0 && (
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
          {labels[hovered || value]}
        </span>
      )}
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} className={`text-base ${rating >= star ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
      ))}
    </div>
  );
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  category?: string;
  averageRating?: number;
  canReview?: boolean;
}

export function ProductReviews({ productId, productName, category = '', averageRating, canReview = false }: ProductReviewsProps) {
  const { user, showToast } = useAppContext();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Load persisted reviews
    const persisted = localStorage.getItem(`smart_rental_reviews_${productId}`);
    if (persisted) {
      try {
        setReviews(JSON.parse(persisted));
        return;
      } catch (e) { }
    }

    // Default seed fallback
    const cat = category.toLowerCase();
    let specific: any[] = [];
    if (cat.includes('furniture')) specific = CATEGORY_REVIEWS.furniture;
    else if (cat.includes('appliance')) specific = CATEGORY_REVIEWS.appliances;
    else if (cat.includes('fitness')) specific = CATEGORY_REVIEWS.fitness;

    if (specific.length > 0) {
      setReviews(specific.map((r, i) => ({
        id: `sr${i}_${productId}`,
        user: r.user,
        avatar: r.user.charAt(0),
        rating: r.rating,
        text: r.text,
        date: r.date,
        verified: true
      })));
    } else {
      setReviews(SEED_REVIEWS);
    }
  }, [productId, category]);

  const handleStartReview = () => {
    setShowForm(true);
  };

  // Use passed averageRating or fallback to calculated one
  const displayRating = averageRating || (reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    const newReview: Review = {
      id: `r${Date.now()}`,
      user: user?.name || 'You',
      avatar: user?.name?.charAt(0) || 'Y',
      rating,
      text,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      verified: true,
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`smart_rental_reviews_${productId}`, JSON.stringify(updated));

    setShowForm(false);
    setRating(0);
    setText('');
    setSubmitted(true);
    showToast("Thanks for your review! Your feedback helps other renters.");
  };

  return (
    <div className="mt-10 bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">Few Customer Reviews</h3>
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={`text-lg ${displayRating >= s ? 'text-yellow-400' : displayRating >= s - 0.5 ? 'text-yellow-300' : 'text-slate-200'}`}>★</span>
              ))}
            </div>
            <span className="text-2xl font-black text-slate-900">{displayRating.toFixed(1)}</span>
          </div>
        </div>
        {!submitted && !showForm && canReview && (
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleStartReview}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-md"
            >
              <span>✏️</span> Write a Review
            </button>
          </div>
        )}
        {submitted && (
          <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
            <span>✅</span> Review submitted!
          </div>
        )}
      </div>

      {/* Write Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-slate-50 rounded-2xl p-6 border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4">{productName}</h4>
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Your Rating *</p>
            <StarSelector value={rating} onChange={setRating} />
          </div>
          <div className="mb-5">
            <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider block">Your Review (optional)</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Tell others what you think..."
              rows={3}
              className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={rating === 0} className="rounded-xl px-6 py-2.5 text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border-0 transition-all">
              Submit
            </Button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="grid md:grid-cols-2 gap-5">
        {reviews.map((review, i) => (
          <div key={review.id} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                  {review.avatar}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm leading-tight">{review.user}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{review.date}</span>
            </div>
            <StarDisplay rating={review.rating} />
            {review.text && (
              <p className="text-sm text-slate-600 font-medium mt-3 leading-relaxed">"{review.text}"</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact review button for Dashboard My Rentals section
export function DashboardWriteReview({ productName, productId }: { productName: string; productId: string }) {
  const { user, showToast } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleStart = () => {
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    const newReview = {
      id: `r${Date.now()}`,
      user: user?.name || 'You',
      avatar: user?.name?.charAt(0) || 'Y',
      rating,
      text,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      verified: true,
    };

    let existing: any[] = [];
    try { existing = JSON.parse(localStorage.getItem(`smart_rental_reviews_${productId}`) || '[]'); } catch (e) { existing = []; }
    localStorage.setItem(`smart_rental_reviews_${productId}`, JSON.stringify([newReview, ...existing]));

    showToast("Thanks for your review! Your feedback helps other renters.");
    setShowForm(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-end">
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
          ✅ Reviewed
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {!showForm && (
        <>
          <button
            onClick={handleStart}
            className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 active:scale-95 transition-all flex items-center gap-1"
          >
            ✏️ Write Review
          </button>
        </>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-md animate-in fade-in slide-in-from-top-1 duration-200 w-full max-w-sm">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">{productName}</p>
          <StarSelector value={rating} onChange={setRating} />
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Optional comment..."
            rows={2}
            className="w-full mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
          />
          <div className="flex gap-2 mt-3">
            <button type="submit" disabled={rating === 0} className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-slate-800">
              Submit
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
