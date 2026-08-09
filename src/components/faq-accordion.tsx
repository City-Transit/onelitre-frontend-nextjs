'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'What is Onelitre.ng?',
    a: 'A platform that aggregates vetted kitchens who prepare bulk, freezer-ready meals — ordered on demand and delivered in one drop, instead of paying for a single meal every day.',
  },
  {
    q: 'When do you launch?',
    a: "We're onboarding our first kitchens and customers now. Waitlist members get early access before the public launch in Lagos.",
  },
  {
    q: 'Which cities are you starting in?',
    a: 'Lagos first. Abuja and Port Harcourt follow once the model is proven — join the waitlist to be notified when we expand to your city.',
  },
  {
    q: 'How does kitchen vetting work?',
    a: 'Every kitchen is reviewed for food quality, hygiene, and reliability before being listed. We start with a small number of kitchens to keep quality high.',
  },
  {
    q: 'Is there a cost to join the waitlist?',
    a: "No — joining is free for both customers and kitchens. We'll only reach out when there's real access to offer.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="border-t border-line">
      {FAQS.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q} className="border-b border-line">
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between py-6 text-left font-serif text-[19px] font-medium text-paper"
            >
              {item.q}
              <span
                className={`ml-5 shrink-0 font-mono text-lg text-frost transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
              >
                +
              </span>
            </button>
            {open && (
              <p className="max-w-xl pb-6 text-[14.5px] leading-relaxed text-muted">{item.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
