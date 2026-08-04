'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { Subscription } from '@/lib/types';

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 15;

type Phase = 'checking' | 'active' | 'pending' | 'failed';

export default function SubscriptionCallbackPage() {
  const [phase, setPhase] = useState<Phase>('checking');

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      try {
        const subscription: Subscription | null = await apiFetch('/subscriptions/me');
        if (cancelled) return;
        if (subscription?.status === 'active') {
          setPhase('active');
          return;
        }
        if (subscription?.status === 'lapsed' || subscription?.status === 'cancelled') {
          setPhase('failed');
          return;
        }
        if (attempts >= MAX_ATTEMPTS) {
          setPhase('pending');
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setPhase('pending');
      }
    }
    poll();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="bg-paper px-6 py-24 text-ink">
        <div className="mx-auto max-w-lg rounded-[16px] border border-[rgba(18,33,29,0.14)] p-8 text-center">
          {phase === 'checking' && (
            <>
              <h2 className="font-serif text-xl font-semibold">Confirming your subscription…</h2>
              <p className="mt-2 text-sm text-[#5B6B63]">This only takes a moment.</p>
            </>
          )}
          {phase === 'active' && (
            <>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-frost font-mono text-lg">
                ✓
              </div>
              <h2 className="font-serif text-xl font-semibold">Subscription active</h2>
              <p className="mt-2 text-sm text-[#5B6B63]">
                Delivery fees are now waived on every order. Manage it anytime from{' '}
                <a href="/dashboard" className="font-semibold underline">
                  your dashboard
                </a>
                .
              </p>
            </>
          )}
          {phase === 'pending' && (
            <>
              <h2 className="font-serif text-xl font-semibold">Still confirming…</h2>
              <p className="mt-2 text-sm text-[#5B6B63]">
                This is taking longer than usual. Check{' '}
                <a href="/dashboard" className="font-semibold underline">
                  your dashboard
                </a>{' '}
                in a minute — we&apos;ll update it there as soon as it clears.
              </p>
            </>
          )}
          {phase === 'failed' && (
            <>
              <h2 className="font-serif text-xl font-semibold">
                Subscription didn&apos;t activate
              </h2>
              <p className="mt-2 text-sm text-[#5B6B63]">
                Nothing was charged, or the payment didn&apos;t go through. You can try again from{' '}
                <a href="/dashboard" className="font-semibold underline">
                  your dashboard
                </a>
                .
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
