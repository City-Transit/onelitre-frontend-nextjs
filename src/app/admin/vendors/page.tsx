import { serverApiFetch } from '@/lib/server-api';
import { Pagination } from '@/components/pagination';
import type { Paginated, User, Vendor } from '@/lib/types';
import { VendorsTable } from './vendors-table';

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? Math.max(1, Number(pageParam)) : 1;

  const [res, meRes] = await Promise.all([
    serverApiFetch(`/admin/vendors?page=${page}&limit=20`),
    serverApiFetch('/auth/me'),
  ]);
  const data: Paginated<Vendor> = res.ok
    ? await res.json()
    : { items: [], total: 0, page, limit: 20 };
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));
  const me: User | null = meRes.ok ? await meRes.json() : null;
  const canManage = me ? me.role !== 'staff' : false;

  return (
    <div>
      <h2 className="mb-4 text-xl text-paper">Kitchens</h2>
      <VendorsTable initialVendors={data.items} canManage={canManage} />
      <Pagination
        basePath="/admin/vendors"
        page={data.page}
        totalPages={totalPages}
        total={data.total}
      />
    </div>
  );
}
