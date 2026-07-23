import { notFound } from 'next/navigation';
import { serverApiFetch } from '@/lib/server-api';
import type { Order, Paginated, User } from '@/lib/types';
import { CustomerDetailPanel } from './customer-detail-panel';

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [customerRes, ordersRes] = await Promise.all([
    serverApiFetch(`/admin/customers/${id}`),
    serverApiFetch(`/admin/customers/${id}/orders?limit=100`),
  ]);
  if (customerRes.status === 404) notFound();
  if (!customerRes.ok) notFound();

  const customer: User = await customerRes.json();
  const orders: Paginated<Order> = ordersRes.ok
    ? await ordersRes.json()
    : { items: [], total: 0, page: 1, limit: 100 };

  return (
    <div>
      <h2 className="mb-4 text-xl text-paper">
        {customer.firstName} {customer.lastName}
      </h2>
      <CustomerDetailPanel customer={customer} orders={orders.items} />
    </div>
  );
}
