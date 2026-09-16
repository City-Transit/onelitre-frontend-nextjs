'use client';

import { useState } from 'react';

/** A `type="password"` input with a Show/Hide toggle so users can confirm what they typed —
 * matches this codebase's icon-free convention (see mobile-nav.tsx's ✕/☰ toggle) by using a
 * plain text button rather than an eye icon. */
export function PasswordInput({
  value,
  onChange,
  className,
  required,
  minLength,
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  className: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        required={required}
        type={visible ? 'text' : 'password'}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${className} pr-14`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[12px] font-semibold text-[#8A8073] hover:text-ink"
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
