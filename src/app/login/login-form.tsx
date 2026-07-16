'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/api';
import type { User } from '@/lib/types';

const DASHBOARD_BY_ROLE: Record<User['role'], string> = {
  customer: '/dashboard',
  vendor: '/vendor/dashboard',
  staff: '/admin',
  supervisor: '/admin',
  admin: '/admin',
  super_admin: '/admin',
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVendor = searchParams.get('role') === 'vendor';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user: User = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      router.push(DASHBOARD_BY_ROLE[user.role]);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError && (err.status === 401 || err.status === 400)
          ? `Invalid ${isVendor ? 'email' : 'phone number'} or password.`
          : 'Something went wrong. Please try again.',
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-[20px] bg-paper p-10 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <h1 className="text-2xl font-semibold">{isVendor ? 'Vendor login' : 'Log in'}</h1>
        <p className="mt-2 text-sm text-[#5B6B63]">
          {isVendor
            ? 'Welcome back — sign in to your kitchen dashboard.'
            : 'Welcome back to Onelitre.ng.'}
        </p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <label className="font-semibold text-[14.5px]">
              {isVendor ? 'Email' : 'Phone number'}
            </label>
            <input
              required
              type={isVendor ? 'email' : 'tel'}
              placeholder={isVendor ? 'you@business.com' : '0801 234 5678'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-4 py-[15px] text-[15px] text-ink focus:border-paprika focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,118,43,0.14)] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="font-semibold text-[14.5px]">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-4 py-[15px] text-[15px] text-ink focus:border-paprika focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,118,43,0.14)] focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-full bg-paprika-dim px-5 py-[17px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-paprika disabled:translate-y-0 disabled:opacity-65"
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[#5B6B63]">
          Don&apos;t have an account?{' '}
          <Link
            href={isVendor ? '/register?role=vendor' : '/register'}
            className="font-semibold text-ink underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
