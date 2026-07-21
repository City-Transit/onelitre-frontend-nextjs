import { formatDate } from '@/lib/format';
import type { Order, User } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

const STATUS_LABEL: Record<string, string> = {
  placed: 'Placed',
  ready_for_delivery: 'Ready for delivery',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function OrdersTable({ orders, emptyLabel }: { orders: Order[]; emptyLabel: string }) {
  if (orders.length === 0) {
    return <p className="mt-2 text-sm text-[#5B6B63]">{emptyLabel}</p>;
  }
  return (
    <div className="mt-3 overflow-x-auto rounded-[14px] border border-[rgba(18,33,29,0.1)]">
      <table className="w-full text-left text-sm">
        <thead className="font-mono text-xs uppercase tracking-wide text-[#5B6B63]">
          <tr>
            <th className="px-4 py-3">Placed</th>
            <th className="px-4 py-3">Vendor(s)</th>
            <th className="px-4 py-3">Date / time</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-[rgba(18,33,29,0.1)]">
              <td className="px-4 py-3 whitespace-nowrap text-[#5B6B63]">
                {formatDate(order.createdAt)}
              </td>
              <td className="px-4 py-3">
                {[...new Set(order.items.map((item) => item.vendor?.name ?? item.vendorId))].join(
                  ', ',
                )}
              </td>
              <td className="px-4 py-3 text-[#5B6B63] whitespace-nowrap">
                {order.deliveryDate} · {order.deliveryTimeSlot}
              </td>
              <td className="px-4 py-3 font-semibold whitespace-nowrap">
                {naira(order.subtotal)}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-paper-dim px-3 py-1 text-xs font-semibold">
                  {STATUS_LABEL[order.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CustomerDetailPanel({ customer, orders }: { customer: User; orders: Order[] }) {
  const completed = orders.filter((o) => o.status === 'delivered');
  const notCompleted = orders.filter((o) => o.status !== 'delivered');

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[20px] bg-paper p-6 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <h3 className="font-semibold">Customer details</h3>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase text-[#8A8073]">Phone</dt>
            <dd>{customer.phone ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[#8A8073]">Email</dt>
            <dd>{customer.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[#8A8073]">Address</dt>
            <dd>{customer.address ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[#8A8073]">Joined</dt>
            <dd>{formatDate(customer.createdAt)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-[20px] bg-paper p-6 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <h3 className="font-semibold">Completed orders ({completed.length})</h3>
        <OrdersTable orders={completed} emptyLabel="No completed orders yet." />
      </div>

      <div className="rounded-[20px] bg-paper p-6 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <h3 className="font-semibold">Orders not completed ({notCompleted.length})</h3>
        <OrdersTable orders={notCompleted} emptyLabel="Nothing outstanding." />
      </div>
    </div>
  );
}
