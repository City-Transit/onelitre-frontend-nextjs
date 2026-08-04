'use client';

import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import type { Subscription, SubscriptionPlan } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function SubscriptionPanel() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [sub, activePlan] = await Promise.all([
          apiFetch('/subscriptions/me'),
          apiFetch('/subscriptions/plan'),
        ]);
        setSubscription(sub);
        setPlan(activePlan);
      } catch {
        // leave both null — panel just won't render actionable content below
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function subscribe() {
    setError(null);
    setBusy(true);
    try {
      const { authorizationUrl }: { authorizationUrl: string } = await apiFetch(
        '/subscriptions',
        { method: 'POST' },
      );
      window.location.assign(authorizationUrl);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
      );
      setBusy(false);
    }
  }

  async function cancel() {
    setError(null);
    setBusy(true);
    try {
      const updated: Subscription = await apiFetch('/subscriptions/cancel', {
        method: 'POST',
      });
      setSubscription(updated);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading || !plan) return null;

  const isActive = subscription?.status === 'active';

  return (
    <div className="mt-8 rounded-[20px] bg-paper p-8 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
      <h2 className="text-xl font-semibold">Delivery subscription</h2>
      {isActive ? (
        <>
          <p className="mt-2 text-sm text-[#5B6B63]">
            You&apos;re subscribed — delivery fees are waived on every order.
          </p>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          <button
            onClick={cancel}
            disabled={busy}
            className="mt-4 rounded-full border border-red-700/30 px-5 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-60"
          >
            {busy ? 'Cancelling…' : 'Cancel subscription'}
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#5B6B63]">
            Subscribe for {naira(plan.priceNaira)}/month and never pay a delivery fee.
          </p>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          <button
            onClick={subscribe}
            disabled={busy}
            className="mt-4 rounded-full bg-paprika-dim px-5 py-2.5 text-sm font-semibold text-white hover:bg-paprika disabled:opacity-60"
          >
            {busy ? 'Redirecting to payment…' : 'Subscribe'}
          </button>
        </>
      )}
    </div>
  );
}
