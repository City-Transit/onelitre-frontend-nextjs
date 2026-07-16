import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/server-api';
import type { SalesSummary } from '@/lib/types';
import { SalesPanel } from './sales-panel';

export default async function VendorSalesPage() {
  const res = await serverApiFetch('/vendor/sales-summary');
  if (!res.ok) {
    redirect('/login');
  }
  const summary: SalesSummary = await res.json();

  return (
    <div>
      <h2 className="mb-4 text-xl text-paper">Sales</h2>
      <div className="rounded-[20px] bg-paper p-8 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <SalesPanel summary={summary} />
      </div>
    </div>
  );
}
