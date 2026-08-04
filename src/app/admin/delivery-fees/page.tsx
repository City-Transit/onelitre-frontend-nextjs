import { serverApiFetch } from '@/lib/server-api';
import type { DeliveryFee } from '@/lib/types';
import { DeliveryFeesTable } from './delivery-fees-table';

export default async function AdminDeliveryFeesPage() {
  const res = await serverApiFetch('/admin/delivery-fees');

  if (res.status === 403) {
    return (
      <div>
        <h2 className="mb-4 text-xl text-paper">Delivery Fees</h2>
        <div className="rounded-[20px] bg-paper p-8 text-center text-sm text-[#5B6B63] shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          You don&apos;t have access to this section.
        </div>
      </div>
    );
  }

  const fees: DeliveryFee[] = res.ok ? await res.json() : [];

  return (
    <div>
      <h2 className="mb-4 text-xl text-paper">Delivery Fees</h2>
      <DeliveryFeesTable initialFees={fees} />
    </div>
  );
}
