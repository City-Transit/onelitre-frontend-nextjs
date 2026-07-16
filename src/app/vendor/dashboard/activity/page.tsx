import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/server-api';
import { Pagination } from '@/components/pagination';
import type { AuditLogEntry, Paginated } from '@/lib/types';

export default async function VendorActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? Math.max(1, Number(pageParam)) : 1;

  const res = await serverApiFetch(`/vendor/activity?page=${page}&limit=20`);
  if (!res.ok) {
    redirect('/login');
  }
  const data: Paginated<AuditLogEntry> = await res.json();
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <div>
      <h2 className="mb-4 text-xl text-paper">Activity</h2>
      {data.items.length === 0 ? (
        <div className="rounded-[20px] bg-paper p-8 text-center text-sm text-[#5B6B63] shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          No activity yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[20px] bg-paper text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          <table className="w-full text-left text-sm">
            <thead className="font-mono text-xs uppercase tracking-wide text-[#5B6B63]">
              <tr>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">By</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">When</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((entry) => (
                <tr key={entry.id} className="border-t border-[rgba(18,33,29,0.1)]">
                  <td className="px-6 py-4 font-mono">{entry.action}</td>
                  <td className="px-6 py-4 text-[#5B6B63]">
                    {entry.actorRole === 'vendor' ? 'You' : entry.actorRole}
                  </td>
                  <td className="px-6 py-4 text-[#5B6B63]">{entry.entityType}</td>
                  <td className="px-6 py-4 font-mono text-xs text-[#5B6B63]">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        basePath="/vendor/dashboard/activity"
        page={data.page}
        totalPages={totalPages}
        total={data.total}
      />
    </div>
  );
}
