import { serverApiFetch } from '@/lib/server-api';
import { Pagination } from '@/components/pagination';
import type { Paginated, User } from '@/lib/types';

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? Math.max(1, Number(pageParam)) : 1;

  const res = await serverApiFetch(`/admin/customers?page=${page}&limit=20`);
  const data: Paginated<User> = res.ok
    ? await res.json()
    : { items: [], total: 0, page, limit: 20 };
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <div>
      <h2 className="mb-4 text-xl text-paper">Customers</h2>
      {data.items.length === 0 ? (
        <div className="rounded-[20px] bg-paper p-8 text-center text-sm text-[#5B6B63] shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          No customers yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[20px] bg-paper text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          <table className="w-full text-left text-sm">
            <thead className="font-mono text-xs uppercase tracking-wide text-[#5B6B63]">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((customer) => (
                <tr key={customer.id} className="border-t border-[rgba(18,33,29,0.1)]">
                  <td className="px-6 py-4 font-semibold">
                    {customer.firstName} {customer.lastName}
                  </td>
                  <td className="px-6 py-4 font-mono text-[#5B6B63]">{customer.phone ?? '—'}</td>
                  <td className="px-6 py-4 text-[#5B6B63]">{customer.address ?? '—'}</td>
                  <td className="px-6 py-4 font-mono text-xs text-[#5B6B63]">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        basePath="/admin/customers"
        page={data.page}
        totalPages={totalPages}
        total={data.total}
      />
    </div>
  );
}
