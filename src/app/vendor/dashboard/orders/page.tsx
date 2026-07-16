import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/server-api';
import { Pagination } from '@/components/pagination';
import type { Paginated, VendorOrderGroup } from '@/lib/types';
import { OrdersPanel } from './orders-panel';

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? Math.max(1, Number(pageParam)) : 1;

  const res = await serverApiFetch(`/vendor/orders?page=${page}&limit=10`);
  if (!res.ok) {
    redirect('/login');
  }
  const data: Paginated<VendorOrderGroup> = await res.json();
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <div>
      <h2 className="mb-4 text-xl text-paper">Orders</h2>
      <OrdersPanel initialGroups={data.items} />
      <Pagination
        basePath="/vendor/dashboard/orders"
        page={data.page}
        totalPages={totalPages}
        total={data.total}
      />
    </div>
  );
}
