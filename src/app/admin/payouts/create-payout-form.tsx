'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';

const inputClass =
  'w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-4 py-3 text-[15px] text-ink focus:border-paprika focus:bg-white focus:outline-none';

export function CreatePayoutForm() {
  const router = useRouter();
  const [vendorId, setVendorId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'advance' | 'remainder'>('advance');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch('/admin/payouts', {
        method: 'POST',
        body: JSON.stringify({
          vendorId,
          amount: Number(amount),
          type,
          note: note || undefined,
        }),
      });
      setVendorId('');
      setAmount('');
      setNote('');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not create the payout. Please check the fields and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex flex-col gap-4 rounded-[20px] bg-paper p-8 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]"
    >
      <h3 className="text-lg font-semibold">Record a payout</h3>
      <div className="flex gap-4">
        <div className="w-full">
          <label className="text-sm font-semibold">Kitchen ID</label>
          <input
            required
            placeholder="Paste the kitchen's id from their detail page"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </div>
        <div className="w-full">
          <label className="text-sm font-semibold">Amount (₦)</label>
          <input
            required
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </div>
        <div className="w-full">
          <label className="text-sm font-semibold">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'advance' | 'remainder')}
            className={`${inputClass} mt-1`}
          >
            <option value="advance">Advance</option>
            <option value="remainder">Remainder</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold">Note (optional)</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`${inputClass} mt-1`}
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-full bg-paprika-dim px-5 py-2.5 font-semibold text-white transition-all hover:bg-paprika disabled:opacity-65"
      >
        {submitting ? 'Recording…' : 'Record payout'}
      </button>
    </form>
  );
}
