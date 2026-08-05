'use client';

import { useEffect, useRef, useState } from 'react';

export interface MultiSelectOption {
  value: string;
  label: string;
}

/** A `<select>` can't do multi-select without ctrl/cmd-click, which nobody discovers on their
 * own — this is a checkbox popover styled to sit alongside the native selects in the same
 * filter bar, for filters where "match any of these" is the natural behavior (certification,
 * dietary requirements) rather than a single exclusive value (price bucket, rating, etc). */
export function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggle(value: string) {
    onChange(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value],
    );
  }

  const summary =
    selected.length === 0
      ? label
      : selected.length === 1
        ? (options.find((o) => o.value === selected[0])?.label ?? label)
        : `${selected.length} selected`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-[3px] border border-line bg-bg-alt px-3 py-2.5 text-[13.5px] text-paper focus:border-frost focus:outline-none"
      >
        {summary}
        <span className="text-muted">▾</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-1.5 max-h-64 min-w-[210px] overflow-y-auto rounded-[3px] border border-line bg-bg-alt p-1.5 shadow-lg">
          {options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded-[3px] px-2.5 py-2 text-[13.5px] text-paper hover:bg-bg"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(opt.value)}
                  className="accent-frost"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
