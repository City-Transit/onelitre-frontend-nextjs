'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { NIGERIAN_BANKS } from '@/lib/nigerian-banks';
import type { Vendor } from '@/lib/types';

const inputClass =
  'w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-3 py-2.5 text-[14px] text-ink focus:border-paprika focus:bg-white focus:outline-none';

export function PayoutAccountPanel({ vendor }: { vendor: Vendor }) {
  const router = useRouter();
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch('/vendor/payout-account', {
        method: 'POST',
        body: JSON.stringify({ bankCode, accountNumber }),
      });
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong saving your payout account. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#5B6B63]">
        This is where your advance and remainder payouts (vendor contract §4) are sent. We verify
        it with your bank before saving.
      </p>

      {vendor.payoutAccountName ? (
        <div className="rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim p-4 text-sm">
          <div className="font-semibold">{vendor.payoutAccountName}</div>
          <div className="mt-1 text-[#5B6B63]">
            {NIGERIAN_BANKS.find((b) => b.code === vendor.payoutBankCode)?.name ??
              vendor.payoutBankCode}{' '}
            — {vendor.payoutAccountNumber}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#8A8073]">No payout account on file yet.</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <label className="text-sm font-semibold">Bank</label>
          <select
            required
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Select your bank
            </option>
            {NIGERIAN_BANKS.map((b) => (
              <option key={b.code} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <label className="text-sm font-semibold">Account number</label>
          <input
            required
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            placeholder="0123456789"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-paprika-dim px-5 py-2.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-paprika disabled:translate-y-0 disabled:opacity-65"
        >
          {submitting ? 'Verifying…' : vendor.payoutAccountName ? 'Update account' : 'Save account'}
        </button>
      </form>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
