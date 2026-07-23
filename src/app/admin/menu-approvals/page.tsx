import { serverApiFetch } from '@/lib/server-api';
import { Pagination } from '@/components/pagination';
import type { Meal, Paginated } from '@/lib/types';
import { MealApprovalsTable } from './meal-approvals-table';

export default async function AdminMenuApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? Math.max(1, Number(pageParam)) : 1;

  const res = await serverApiFetch(`/admin/meals?page=${page}&limit=20`);
  const data: Paginated<Meal> = res.ok
    ? await res.json()
    : { items: [], total: 0, page, limit: 20 };
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <div>
      <h2 className="mb-4 text-xl text-paper">Menu approvals</h2>
      <MealApprovalsTable initialMeals={data.items} />
      <Pagination
        basePath="/admin/menu-approvals"
        page={data.page}
        totalPages={totalPages}
        total={data.total}
      />
    </div>
  );
}
