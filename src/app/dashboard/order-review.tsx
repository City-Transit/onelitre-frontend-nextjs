'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import type { Order, Review } from '@/lib/types';

/** Reviews are per-order — only shown once an order is delivered, and only for that specific
 * order (not a general "review this vendor" affordance). */
export function OrderReview({ order }: { order: Order }) {
  const [review, setReview] = useState<Review | null>(order.review ?? null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(review?.rating ?? 5);
  const [comment, setComment] = useState(review?.comment ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (order.status !== 'delivered') return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const saved: Review = await apiFetch(`/orders/${order.id}/review`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment: comment || undefined }),
      });
      setReview(saved);
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong submitting your review. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (review && !showForm) {
    return (
      <div className="mt-3 border-t border-[rgba(18,33,29,0.14)] pt-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="text-paprika">
            {'★'.repeat(review.rating)}
            {'☆'.repeat(5 - review.rating)}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="font-mono text-xs font-semibold underline"
          >
            Edit review
          </button>
        </div>
        {review.comment && <p className="mt-1 text-[#5B6B63]">{review.comment}</p>}
      </div>
    );
  }

  return (
    <div className="mt-3 border-t border-[rgba(18,33,29,0.14)] pt-3 text-sm">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="font-mono text-xs font-semibold underline"
        >
          Leave a review
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`text-xl ${n <= rating ? 'text-paprika' : 'text-[#8A8073]'}`}
                aria-label={`${n} star${n === 1 ? '' : 's'}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            rows={2}
            placeholder="Tell other customers what you thought (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-red-700">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-paprika-dim px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-paprika disabled:opacity-65"
            >
              {submitting ? 'Saving…' : 'Submit review'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
              className="text-xs text-[#5B6B63]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
