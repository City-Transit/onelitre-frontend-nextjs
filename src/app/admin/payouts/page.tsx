import { serverApiFetch } from '@/lib/server-api';
import { Pagination } from '@/components/pagination';
import type { Paginated, Payout, User } from '@/lib/types';
import { CreatePayoutForm } from './create-payout-form';
import { PayoutsTable } from './payouts-table';

export default async function AdminPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? Math.max(1, Number(pageParam)) : 1;

  const [res, meRes] = await Promise.all([
    serverApiFetch(`/admin/payouts?page=${page}&limit=20`),
    serverApiFetch('/auth/me'),
  ]);
  const data: Paginated<Payout> = res.ok
    ? await res.json()
    : { items: [], total: 0, page, limit: 20 };
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));
  const me: User | null = meRes.ok ? await meRes.json() : null;
  const canCreate = me?.role === 'admin' || me?.role === 'super_admin';

  return (
    <div>
      <h2 className="mb-2 text-xl text-paper">Payouts</h2>
      <p className="mb-4 text-sm text-muted">
        Tracking only — records what&apos;s owed, doesn&apos;t move money. Real disbursement
        needs the payment integration.
      </p>
      {canCreate && <CreatePayoutForm />}
      <PayoutsTable initialPayouts={data.items} canManage={canCreate} />
      <Pagination
        basePath="/admin/payouts"
        page={data.page}
        totalPages={totalPages}
        total={data.total}
      />
    </div>
  );
}
