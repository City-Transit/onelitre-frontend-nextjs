'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';

const inputClass =
  'w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-4 py-3 text-[15px] text-ink focus:border-paprika focus:bg-white focus:outline-none';

export function CreateSubscriptionPlanForm({
  hasExistingPlan,
}: {
  hasExistingPlan: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [priceNaira, setPriceNaira] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch('/admin/subscription-plan', {
        method: 'POST',
        body: JSON.stringify({ name, priceNaira: Number(priceNaira) }),
      });
      setName('');
      setPriceNaira('');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong creating the plan. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">
        {hasExistingPlan ? 'Replace the current plan' : 'Create the first plan'}
      </h3>
      {hasExistingPlan && (
        <p className="text-xs text-[#8A8073]">
          Existing subscribers stay on their current plan/price — Paystack doesn&apos;t migrate
          live subscriptions. This only affects new subscribers going forward.
        </p>
      )}
      <div className="flex gap-4">
        <div className="w-full">
          <label className="text-sm font-semibold">Name</label>
          <input
            required
            placeholder="Onelitre Delivery Plus"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </div>
        <div className="w-full">
          <label className="text-sm font-semibold">Price (₦/month)</label>
          <input
            required
            type="number"
            min={1}
            step={1}
            value={priceNaira}
            onChange={(e) => setPriceNaira(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-full bg-paprika-dim px-5 py-2.5 font-semibold text-white transition-all hover:bg-paprika disabled:opacity-65"
      >
        {submitting ? 'Creating…' : 'Create plan'}
      </button>
    </form>
  );
}
