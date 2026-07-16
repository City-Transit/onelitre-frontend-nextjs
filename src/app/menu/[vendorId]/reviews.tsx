'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import type { Paginated, Review } from '@/lib/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function Reviews({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/vendors/${vendorId}/reviews`)
      .then((data: Paginated<Review>) => setReviews(data.items))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [vendorId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const review = await apiFetch(`/vendors/${vendorId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment: comment || undefined }),
      });
      setReviews((prev) => [review, ...prev.filter((r) => r.id !== review.id)]);
      setShowForm(false);
      setComment('');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login');
        return;
      }
      if (err instanceof ApiError && err.status === 403) {
        setError('Only customers who’ve received an order from this vendor can leave a review.');
      } else {
        setError('Something went wrong submitting your review. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-16 border-t border-line pt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl text-paper">Reviews</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-full border border-line px-4 py-2 font-mono text-[12.5px] text-paper transition-colors hover:border-frost hover:text-frost"
          >
            Write a review
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-line bg-bg-alt p-5">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`text-2xl ${n <= rating ? 'text-paprika' : 'text-muted'}`}
                aria-label={`${n} star${n === 1 ? '' : 's'}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            placeholder="Tell other customers what you thought (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-3 w-full rounded-[10px] border border-line bg-bg px-4 py-3 text-[15px] text-paper placeholder:text-muted focus:border-frost focus:outline-none"
          />
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          <div className="mt-3 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-paprika-dim px-5 py-2.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-paprika disabled:translate-y-0 disabled:opacity-65"
            >
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
              className="rounded-full border border-line px-5 py-2.5 font-semibold text-paper"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 flex flex-col gap-5">
        {!loading && reviews.length === 0 && (
          <p className="text-sm text-muted">No reviews yet — be the first to order and review.</p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-paper">
                {review.customer.firstName} {review.customer.lastName[0]}.
              </span>
              <span className="font-mono text-xs text-muted">{formatDate(review.createdAt)}</span>
            </div>
            <div className="mt-1 text-paprika">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
            {review.comment && <p className="mt-2 text-sm text-muted">{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
