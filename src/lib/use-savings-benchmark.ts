'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from './api';
import type { SavingsBenchmark } from './types';

/** Shared across every savings-calculator placement (homepage, menu page, basket, checkout) so
 * each one doesn't duplicate the same fetch/error-handling boilerplate. */
export function useSavingsBenchmark(): SavingsBenchmark | null {
  const [benchmark, setBenchmark] = useState<SavingsBenchmark | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch('/savings-benchmark')
      .then((b: SavingsBenchmark) => {
        if (!cancelled) setBenchmark(b);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return benchmark;
}
