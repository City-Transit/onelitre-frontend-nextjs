import { serverApiFetch } from '@/lib/server-api';
import { Pagination } from '@/components/pagination';
import type { Paginated, User } from '@/lib/types';
import { CreateTeamForm } from './create-team-form';
import { TeamTable } from './team-table';

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? Math.max(1, Number(pageParam)) : 1;

  const [res, meRes] = await Promise.all([
    serverApiFetch(`/admin/team?page=${page}&limit=20`),
    serverApiFetch('/auth/me'),
  ]);

  if (res.status === 403) {
    return (
      <div>
        <h2 className="mb-4 text-xl text-paper">Team</h2>
        <div className="rounded-[20px] bg-paper p-8 text-center text-sm text-[#5B6B63] shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          You don&apos;t have access to this section.
        </div>
      </div>
    );
  }

  const data: Paginated<User> = res.ok
    ? await res.json()
    : { items: [], total: 0, page, limit: 20 };
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));
  const me: User | null = meRes.ok ? await meRes.json() : null;

  return (
    <div>
      <h2 className="mb-4 text-xl text-paper">Team</h2>
      {me && <CreateTeamForm viewerRole={me.role} />}
      <TeamTable
        initialMembers={data.items}
        currentUserId={me?.id ?? ''}
        canDeactivate={me?.role === 'super_admin'}
      />
      <Pagination basePath="/admin/team" page={data.page} totalPages={totalPages} total={data.total} />
    </div>
  );
}
