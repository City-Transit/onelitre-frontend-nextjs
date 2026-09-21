'use client';

import { useState } from 'react';
import { useAddressAutocomplete } from '@/lib/use-address-autocomplete';

export function AddressAutocompleteInput({
  value,
  onChange,
  className,
  placeholder,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  className: string;
  placeholder?: string;
  required?: boolean;
}) {
  const { suggestions, search, resolve } = useAddressAutocomplete();
  const [open, setOpen] = useState(false);

  function handleChange(next: string) {
    onChange(next);
    setOpen(true);
    search(next);
  }

  async function handleSelect(prediction: google.maps.places.PlacePrediction) {
    const formattedAddress = await resolve(prediction);
    onChange(formattedAddress);
    setOpen(false);
  }

  function handleBlur() {
    // Let a click on a suggestion register (onMouseDown fires before blur) before closing.
    setTimeout(() => setOpen(false), 100);
  }

  return (
    <div className="relative">
      <input
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        autoComplete="off"
        className={className}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-white shadow-lg">
          {suggestions.map((s) => (
            <button
              key={s.placeId}
              type="button"
              onMouseDown={() => handleSelect(s.prediction)}
              className="block w-full border-b border-[rgba(18,33,29,0.08)] px-3.5 py-2.5 text-left text-sm last:border-b-0 hover:bg-paper-dim"
            >
              <div className="font-medium text-ink">{s.mainText}</div>
              {s.secondaryText && (
                <div className="text-xs text-[#8A8073]">{s.secondaryText}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
