import { serverApiFetch } from '@/lib/server-api';
import type { SubscriptionPlan, User } from '@/lib/types';
import { CreateSubscriptionPlanForm } from './create-subscription-plan-form';

const ADMIN_UP: User['role'][] = ['admin', 'super_admin'];

export default async function AdminSubscriptionPlanPage() {
  const [res, meRes] = await Promise.all([
    serverApiFetch('/admin/subscription-plan'),
    serverApiFetch('/auth/me'),
  ]);

  if (res.status === 403) {
    return (
      <div>
        <h2 className="mb-4 text-xl text-paper">Subscription Plan</h2>
        <div className="rounded-[20px] bg-paper p-8 text-center text-sm text-[#5B6B63] shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          You don&apos;t have access to this section.
        </div>
      </div>
    );
  }

  const plan: SubscriptionPlan | null = res.ok ? await res.json() : null;
  const me: User | null = meRes.ok ? await meRes.json() : null;
  const canEdit = me ? ADMIN_UP.includes(me.role) : false;

  return (
    <div>
      <h2 className="mb-4 text-xl text-paper">Subscription Plan</h2>
      <div className="rounded-[20px] bg-paper p-8 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        {plan ? (
          <div className="mb-6 text-sm">
            <div className="font-semibold">{plan.name}</div>
            <div className="mt-1 text-[#5B6B63]">
              ₦{plan.priceNaira.toLocaleString('en-NG')}/month · {plan.paystackPlanCode}
            </div>
          </div>
        ) : (
          <p className="mb-6 text-sm text-[#5B6B63]">
            No plan configured yet — customers won&apos;t be able to subscribe until one exists.
          </p>
        )}
        {canEdit && <CreateSubscriptionPlanForm hasExistingPlan={Boolean(plan)} />}
      </div>
    </div>
  );
}
