'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Payout } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function PayoutsTable({
  initialPayouts,
  canManage,
}: {
  initialPayouts: Payout[];
  canManage: boolean;
}) {
  const [payouts, setPayouts] = useState(initialPayouts);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function markPaid(payoutId: string) {
    setBusyId(payoutId);
    const updated: Payout = await apiFetch(`/admin/payouts/${payoutId}/mark-paid`, {
      method: 'PATCH',
    });
    setPayouts((prev) => prev.map((p) => (p.id === payoutId ? updated : p)));
    setBusyId(null);
  }

  if (payouts.length === 0) {
    return (
      <div className="rounded-[20px] bg-paper p-8 text-center text-sm text-[#5B6B63] shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        No payouts recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[20px] bg-paper text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
      <table className="w-full text-left text-sm">
        <thead className="font-mono text-xs uppercase tracking-wide text-[#5B6B63]">
          <tr>
            <th className="px-6 py-4">Kitchen</th>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4">Note</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((payout) => (
            <tr key={payout.id} className="border-t border-[rgba(18,33,29,0.1)]">
              <td className="px-6 py-4 font-semibold">{payout.vendor?.name ?? payout.vendorId}</td>
              <td className="px-6 py-4 capitalize text-[#5B6B63]">{payout.type}</td>
              <td className="px-6 py-4 font-semibold whitespace-nowrap">{naira(payout.amount)}</td>
              <td className="px-6 py-4 text-[#5B6B63]">{payout.note ?? '—'}</td>
              <td className="px-6 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    payout.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-paper-dim text-[#5B6B63]'
                  }`}
                >
                  {payout.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                {payout.status === 'pending' && canManage ? (
                  <button
                    onClick={() => markPaid(payout.id)}
                    disabled={busyId === payout.id}
                    className="rounded-full bg-paprika-dim px-3 py-1.5 text-xs font-semibold text-white hover:bg-paprika disabled:opacity-60"
                  >
                    Mark paid
                  </button>
                ) : (
                  <span className="text-xs text-[#8A8073]">
                    {payout.paidAt && formatDate(payout.paidAt)}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
