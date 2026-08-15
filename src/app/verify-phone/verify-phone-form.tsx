'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { setSessionTokens } from '@/lib/session';
import type { User } from '@/lib/types';

const DASHBOARD_BY_ROLE: Record<User['role'], string> = {
  customer: '/menu',
  vendor: '/vendor/dashboard',
  staff: '/admin',
  supervisor: '/admin',
  admin: '/admin',
  super_admin: '/admin',
};

const inputClass =
  'w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-4 py-[15px] text-[15px] text-ink focus:border-paprika focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,118,43,0.14)] focus:outline-none';

/** Landed on after registration or a login attempt against an unverified account — in both
 * cases the backend has already sent the first OTP by the time this page renders, so this only
 * needs to collect the code (plus offer a resend). */
export function VerifyPhoneForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') ?? '';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { user, accessToken, refreshToken }: {
        user: User;
        accessToken: string;
        refreshToken: string;
      } = await apiFetch('/auth/verify-phone', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      });
      setSessionTokens(accessToken, refreshToken);
      router.push(DASHBOARD_BY_ROLE[user.role]);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? 'That code is invalid or has expired. Request a new one and try again.'
          : 'Something went wrong. Please try again.',
      );
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    try {
      const { message }: { message: string } = await apiFetch('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      setNotice(message);
    } catch {
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-[20px] bg-paper p-10 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <h1 className="text-2xl font-semibold">Verify your phone</h1>
        <p className="mt-2 text-sm text-[#5B6B63]">
          {phone
            ? `We texted a 6-digit code to ${phone}.`
            : 'Enter the 6-digit code we texted you.'}
        </p>
        {notice && <p className="mt-2 text-sm text-[#5B6B63]">{notice}</p>}
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <label className="font-semibold text-[14.5px]">6-digit code</label>
            <input
              required
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className={inputClass}
            />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-full bg-paprika-dim px-5 py-[17px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-paprika disabled:translate-y-0 disabled:opacity-65"
          >
            {submitting ? 'Verifying…' : 'Verify'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[#5B6B63]">
          Didn&apos;t get a code?{' '}
          <button
            type="button"
            onClick={handleResend}
            className="font-semibold text-ink underline"
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}
