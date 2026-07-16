import type { Order, OrderStatus } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Placed',
  ready_for_delivery: 'Ready for delivery',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function MyOrders({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <p className="text-sm text-[#5B6B63]">
        No orders yet — head to the{' '}
        <a href="/menu" className="font-semibold underline">
          menu
        </a>{' '}
        to place your first one.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-[10px] border border-[rgba(18,33,29,0.14)] p-5">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</div>
            <span className="rounded-full bg-paper-dim px-3 py-1 text-xs font-semibold">
              {STATUS_LABEL[order.status]}
            </span>
          </div>
          <div className="mt-2 text-sm text-[#5B6B63]">
            Delivery: {order.deliveryDate} · {order.deliveryTimeSlot}
          </div>
          <ul className="mt-3 flex flex-col gap-1 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.mealName} — {item.litres}L × {item.quantity}
                </span>
                <span>{naira(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-[rgba(18,33,29,0.14)] pt-3 font-semibold">
            <span>Total</span>
            <span>{naira(order.subtotal)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
