import { serverApiFetch } from '@/lib/server-api';
import { Pagination } from '@/components/pagination';
import type { Order, Paginated } from '@/lib/types';
import { DispatchOrdersTable } from './dispatch-orders-table';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? Math.max(1, Number(pageParam)) : 1;

  const res = await serverApiFetch(`/admin/orders?page=${page}&limit=20`);
  const data: Paginated<Order> = res.ok
    ? await res.json()
    : { items: [], total: 0, page, limit: 20 };
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <div>
      <h2 className="mb-4 text-xl text-paper">Orders</h2>
      <DispatchOrdersTable initialOrders={data.items} />
      <Pagination
        basePath="/admin/orders"
        page={data.page}
        totalPages={totalPages}
        total={data.total}
      />
    </div>
  );
}
