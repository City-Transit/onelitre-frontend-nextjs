import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/server-api';
import type { Payout } from '@/lib/types';
import { PayoutsPanel } from './payouts-panel';

export default async function VendorPayoutsPage() {
  const res = await serverApiFetch('/vendor/payouts');
  if (!res.ok) {
    redirect('/login');
  }
  const payouts: Payout[] = await res.json();

  return (
    <div>
      <h2 className="mb-2 text-xl text-paper">Payouts</h2>
      <p className="mb-4 text-sm text-muted">
        A record of what Onelitre owes and has paid you — not an automatic transfer.
      </p>
      <div className="rounded-[20px] bg-paper p-8 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <PayoutsPanel payouts={payouts} />
      </div>
    </div>
  );
}
