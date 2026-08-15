'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/api';
import { setSessionTokens } from '@/lib/session';
import type { User } from '@/lib/types';

const inputClass =
  'w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-4 py-[15px] text-[15px] text-ink focus:border-paprika focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,118,43,0.14)] focus:outline-none';

type Step = 'phone' | 'reset';

/** Customer-only — vendor accounts have no phone number on file, so there's nothing to send an
 * SMS OTP to. Two steps in one page rather than separate routes, matching how the rest of this
 * app's auth forms are structured (single-page, local step state). */
export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { message }: { message: string } = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      setNotice(message);
      setStep('reset');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    try {
      const { message }: { message: string } = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      setNotice(message);
    } catch {
      setError('Something went wrong. Please try again.');
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { user, accessToken, refreshToken }: {
        user: User;
        accessToken: string;
        refreshToken: string;
      } = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ phone, code, newPassword }),
      });
      setSessionTokens(accessToken, refreshToken);
      router.push(user.role === 'customer' ? '/menu' : '/dashboard');
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

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-[20px] bg-paper p-10 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        {step === 'phone' ? (
          <>
            <h1 className="text-2xl font-semibold">Forgot password</h1>
            <p className="mt-2 text-sm text-[#5B6B63]">
              Enter the phone number on your account and we&apos;ll text you a reset code.
            </p>
            <form onSubmit={handleRequestCode} className="mt-8 flex flex-col gap-5">
              <div className="flex flex-col gap-2.5">
                <label className="font-semibold text-[14.5px]">Phone number</label>
                <input
                  required
                  type="tel"
                  placeholder="0801 234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
              </div>
              {error && <p className="text-sm text-red-700">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="mt-1 rounded-full bg-paprika-dim px-5 py-[17px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-paprika disabled:translate-y-0 disabled:opacity-65"
              >
                {submitting ? 'Sending…' : 'Send reset code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Enter your code</h1>
            {notice && <p className="mt-2 text-sm text-[#5B6B63]">{notice}</p>}
            <form onSubmit={handleResetPassword} className="mt-8 flex flex-col gap-5">
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
              <div className="flex flex-col gap-2.5">
                <label className="font-semibold text-[14.5px]">New password</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="font-semibold text-[14.5px]">Confirm new password</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              {error && <p className="text-sm text-red-700">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="mt-1 rounded-full bg-paprika-dim px-5 py-[17px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-paprika disabled:translate-y-0 disabled:opacity-65"
              >
                {submitting ? 'Resetting…' : 'Reset password'}
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
          </>
        )}
        <p className="mt-6 text-center text-sm text-[#5B6B63]">
          <Link href="/login" className="font-semibold text-ink underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
