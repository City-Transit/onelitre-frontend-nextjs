import type { Payout } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function PayoutsPanel({ payouts }: { payouts: Payout[] }) {
  const totalPaid = payouts
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payouts
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  if (payouts.length === 0) {
    return <p className="text-sm text-[#5B6B63]">No payouts recorded yet.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-[14px] border border-[rgba(18,33,29,0.14)] p-4">
          <div className="text-xs uppercase tracking-wide text-[#8A8073]">Paid</div>
          <div className="mt-1 text-xl font-semibold text-green-700">{naira(totalPaid)}</div>
        </div>
        <div className="rounded-[14px] border border-[rgba(18,33,29,0.14)] p-4">
          <div className="text-xs uppercase tracking-wide text-[#8A8073]">Pending</div>
          <div className="mt-1 text-xl font-semibold">{naira(totalPending)}</div>
        </div>
      </div>

      <table className="w-full text-left text-sm">
        <thead className="font-mono text-xs uppercase tracking-wide text-[#5B6B63]">
          <tr>
            <th className="py-2">Type</th>
            <th className="py-2">Amount</th>
            <th className="py-2">Note</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((payout) => (
            <tr key={payout.id} className="border-t border-[rgba(18,33,29,0.1)]">
              <td className="py-3 capitalize">{payout.type}</td>
              <td className="py-3 font-semibold">{naira(payout.amount)}</td>
              <td className="py-3 text-[#5B6B63]">{payout.note ?? '—'}</td>
              <td className="py-3">
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
