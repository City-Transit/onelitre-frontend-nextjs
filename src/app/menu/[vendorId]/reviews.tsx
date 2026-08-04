'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { Paginated, Review } from '@/lib/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Read-only — reviews are written from a delivered order in the customer's order history
 * (dashboard), not from the vendor's own page. */
export function Reviews({ vendorId }: { vendorId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/vendors/${vendorId}/reviews`)
      .then((data: Paginated<Review>) => setReviews(data.items))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [vendorId]);

  return (
    <div className="mt-16 border-t border-line pt-10">
      <h2 className="text-2xl text-paper">Reviews</h2>

      <div className="mt-6 flex flex-col gap-5">
        {!loading && reviews.length === 0 && (
          <p className="text-sm text-muted">
            No reviews yet — order to be the first (you can review from your order history once
            it&apos;s delivered).
          </p>
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
