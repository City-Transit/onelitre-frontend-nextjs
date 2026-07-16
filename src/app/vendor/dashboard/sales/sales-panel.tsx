import type { SalesSummary } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function SalesPanel({ summary }: { summary: SalesSummary }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-[16px] border border-[rgba(18,33,29,0.14)] p-5">
          <div className="font-mono text-xs uppercase tracking-[0.1em] text-[#5B6B63]">
            Total revenue
          </div>
          <div className="mt-2 font-serif text-2xl font-semibold">
            {naira(summary.totalRevenue)}
          </div>
        </div>
        <div className="rounded-[16px] border border-[rgba(18,33,29,0.14)] p-5">
          <div className="font-mono text-xs uppercase tracking-[0.1em] text-[#5B6B63]">
            Orders
          </div>
          <div className="mt-2 font-serif text-2xl font-semibold">{summary.orderCount}</div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Top meals</h3>
        {summary.topMeals.length === 0 ? (
          <p className="text-sm text-[#5B6B63]">No sales yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {summary.topMeals.map((meal) => (
              <div
                key={meal.mealName}
                className="flex justify-between rounded-[10px] border border-[rgba(18,33,29,0.14)] px-4 py-3 text-sm"
              >
                <span>{meal.mealName}</span>
                <span className="font-mono">{meal.quantity} sold</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
