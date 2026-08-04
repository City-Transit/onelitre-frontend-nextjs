import { serverApiFetch } from '@/lib/server-api';
import type { SavingsBenchmark } from '@/lib/types';
import { SavingsBenchmarkForm } from './savings-benchmark-form';

export default async function AdminSavingsBenchmarkPage() {
  const res = await serverApiFetch('/admin/savings-benchmark');

  if (res.status === 403) {
    return (
      <div>
        <h2 className="mb-4 text-xl text-paper">Savings Calculator</h2>
        <div className="rounded-[20px] bg-paper p-8 text-center text-sm text-[#5B6B63] shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          You don&apos;t have access to this section.
        </div>
      </div>
    );
  }

  const benchmark: SavingsBenchmark | null = res.ok ? await res.json() : null;

  return (
    <div>
      <h2 className="mb-4 text-xl text-paper">Savings Calculator</h2>
      <div className="rounded-[20px] bg-paper p-8 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        {benchmark ? (
          <SavingsBenchmarkForm benchmark={benchmark} />
        ) : (
          <p className="text-sm text-[#5B6B63]">Could not load the current settings.</p>
        )}
      </div>
    </div>
  );
}
