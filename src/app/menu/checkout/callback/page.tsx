'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useCart } from '../../cart-context';
import type { Order } from '@/lib/types';

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 15;

type Phase = 'checking' | 'paid' | 'pending' | 'failed' | 'not_found';

export default function CheckoutCallbackPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { clear } = useCart();
  const [phase, setPhase] = useState<Phase>(() => (orderId ? 'checking' : 'not_found'));

  useEffect(() => {
    if (!orderId) return; // reflected in the initial state above already
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      try {
        const orders: Order[] = await apiFetch('/orders/me');
        const order = orders.find((o) => o.id === orderId);
        if (cancelled) return;
        if (!order) {
          setPhase('not_found');
          return;
        }
        if (order.paymentStatus === 'paid') {
          clear();
          setPhase('paid');
          return;
        }
        if (order.paymentStatus === 'failed') {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <section className="bg-paper px-6 py-24 text-ink">
      <div className="mx-auto max-w-lg rounded-[16px] border border-[rgba(18,33,29,0.14)] p-8 text-center">
        {phase === 'checking' && (
          <>
            <h2 className="font-serif text-xl font-semibold">Confirming your payment…</h2>
            <p className="mt-2 text-sm text-[#5B6B63]">This only takes a moment.</p>
          </>
        )}
        {phase === 'paid' && (
          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-frost font-mono text-lg">
              ✓
            </div>
            <h2 className="font-serif text-xl font-semibold">Payment confirmed</h2>
            <p className="mt-2 text-sm text-[#5B6B63]">
              Track your order from{' '}
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
              in a minute — we&apos;ll update the order there as soon as it clears.
            </p>
          </>
        )}
        {phase === 'failed' && (
          <>
            <h2 className="font-serif text-xl font-semibold">Payment didn&apos;t go through</h2>
            <p className="mt-2 text-sm text-[#5B6B63]">
              Nothing was charged. You can try again from the menu.
            </p>
          </>
        )}
        {phase === 'not_found' && (
          <>
            <h2 className="font-serif text-xl font-semibold">We couldn&apos;t find that order</h2>
            <p className="mt-2 text-sm text-[#5B6B63]">
              Check{' '}
              <a href="/dashboard" className="font-semibold underline">
                your dashboard
              </a>{' '}
              for its status.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
