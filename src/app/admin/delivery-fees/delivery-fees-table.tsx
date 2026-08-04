'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { DeliveryFee } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function DeliveryFeesTable({ initialFees }: { initialFees: DeliveryFee[] }) {
  const [fees, setFees] = useState(initialFees);
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(initialFees.map((f) => [f.id, String(f.feeNaira)])),
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  async function save(id: string) {
    const feeNaira = Number(drafts[id]);
    if (!Number.isInteger(feeNaira) || feeNaira < 0) return;
    setBusyId(id);
    const updated: DeliveryFee = await apiFetch(`/admin/delivery-fees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ feeNaira }),
    });
    setFees((prev) => prev.map((f) => (f.id === id ? updated : f)));
    setBusyId(null);
  }

  if (fees.length === 0) {
    return (
      <div className="rounded-[20px] bg-paper p-8 text-center text-sm text-[#5B6B63] shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        No delivery fee areas configured.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[20px] bg-paper text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
      <table className="w-full text-left text-sm">
        <thead className="font-mono text-xs uppercase tracking-wide text-[#5B6B63]">
          <tr>
            <th className="px-6 py-4">Area</th>
            <th className="px-6 py-4">Fee</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fees.map((fee) => {
            const isDirty = drafts[fee.id] !== String(fee.feeNaira);
            return (
              <tr key={fee.id} className="border-t border-[rgba(18,33,29,0.1)]">
                <td className="px-6 py-4 font-semibold">{fee.area}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8A8073]">₦</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={drafts[fee.id] ?? ''}
                      onChange={(e) =>
                        setDrafts((prev) => ({ ...prev, [fee.id]: e.target.value }))
                      }
                      className="w-28 rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-3 py-1.5 text-sm focus:border-paprika focus:bg-white focus:outline-none"
                    />
                    <span className="text-xs text-[#8A8073]">({naira(fee.feeNaira)} current)</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => save(fee.id)}
                    disabled={!isDirty || busyId === fee.id}
                    className="rounded-full bg-paprika-dim px-3 py-1.5 text-xs font-semibold text-white hover:bg-paprika disabled:opacity-60"
                  >
                    {busyId === fee.id ? 'Saving…' : 'Save'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
