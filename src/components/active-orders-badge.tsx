import Link from 'next/link';

/** Lets a customer see they've got an order in flight without visiting the dashboard — see
 * OrdersService.countActiveForCustomer for what counts as "active" (anything short of
 * delivered/cancelled). */
export function ActiveOrdersBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-1.5 rounded-[3px] border border-line px-4 py-2.5 font-mono text-[13px] font-bold text-paper transition-colors hover:border-frost hover:text-frost"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-frost opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-frost" />
      </span>
      {count} active {count === 1 ? 'order' : 'orders'}
    </Link>
  );
}
