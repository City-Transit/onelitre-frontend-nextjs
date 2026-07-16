'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await apiFetch('/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loggingOut}
      className="rounded-[3px] border border-line px-4 py-2.5 font-mono text-[13px] font-bold text-paper transition-all hover:border-frost hover:text-frost disabled:opacity-60"
    >
      {loggingOut ? 'Logging out…' : 'Log out'}
    </button>
  );
}
