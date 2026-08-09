'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/api';
import { setSessionTokens } from '@/lib/session';

type RegisterRole = 'customer' | 'vendor';

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<RegisterRole>(
    searchParams.get('role') === 'vendor' ? 'vendor' : 'customer',
  );
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { accessToken, refreshToken } = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(
          role === 'vendor'
            ? { role, firstName, lastName, email, businessName, password }
            : { role, firstName, lastName, phone, email, password },
        ),
      });
      setSessionTokens(accessToken, refreshToken);
      router.push(role === 'vendor' ? '/vendor/dashboard' : '/menu');
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(
          err.message?.toLowerCase().includes('email')
            ? 'That email is already registered.'
            : 'That phone number is already registered.',
        );
      } else if (err instanceof ApiError && err.status === 400) {
        setError(
          role === 'vendor'
            ? 'Enter a valid email address and Nigerian phone number.'
            : 'Enter a valid Nigerian phone number and email address.',
        );
      } else {
        setError('Something went wrong. Please try again.');
      }
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-4 py-[15px] text-[15px] text-ink focus:border-paprika focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,118,43,0.14)] focus:outline-none';

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-[20px] bg-paper p-10 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-2 text-sm text-[#5B6B63]">
          Join Onelitre.ng to order bulk, freezer-ready meals from vetted kitchens — or list
          your kitchen.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <label className="font-semibold text-[14.5px]">I&apos;m joining as a</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`rounded-[10px] border px-4 py-3.5 font-semibold transition-colors ${
                  role === 'customer'
                    ? 'border-ink bg-ink text-paper'
                    : 'border-[rgba(18,33,29,0.14)] bg-paper-dim text-ink'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('vendor')}
                className={`rounded-[10px] border px-4 py-3.5 font-semibold transition-colors ${
                  role === 'vendor'
                    ? 'border-ink bg-ink text-paper'
                    : 'border-[rgba(18,33,29,0.14)] bg-paper-dim text-ink'
                }`}
              >
                Kitchen
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex w-full flex-col gap-2.5">
              <label className="font-semibold text-[14.5px]">First name</label>
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex w-full flex-col gap-2.5">
              <label className="font-semibold text-[14.5px]">Last name</label>
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          {role === 'vendor' && (
            <p className="-mt-3 text-xs text-[#8A8073]">
              Use the name of the person registering this business — we use it to verify your
              kitchen.
            </p>
          )}

          {role === 'vendor' ? (
            <>
              <div className="flex flex-col gap-2.5">
                <label className="font-semibold text-[14.5px]">Kitchen / business name</label>
                <input
                  required
                  placeholder="Mama Nkechi's Kitchen"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="font-semibold text-[14.5px]">Business email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <p className="-mt-2 text-xs text-[#8A8073]">
                You&apos;ll fill in your kitchen&apos;s address, contact, and cuisine details
                from your dashboard before you can list meals.
              </p>
            </>
          ) : (
            <>
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
              <div className="flex flex-col gap-2.5">
                <label className="font-semibold text-[14.5px]">Email address</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-2.5">
            <label className="font-semibold text-[14.5px]">Password</label>
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <div className="text-xs text-[#8A8073]">Minimum 8 characters.</div>
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="font-semibold text-[14.5px]">Confirm password</label>
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
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[#5B6B63]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-ink underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
