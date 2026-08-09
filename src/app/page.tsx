import { SiteHeader } from '@/components/site-header';
import { FaqAccordion } from '@/components/faq-accordion';
import { SavingsCalculator } from '@/components/savings-calculator';
import { HeroCityPicker } from './hero-city-picker';

const TAGS = [
  { name: 'Ogbono Stew', portions: '4 PORTIONS', price: '₦6,500', className: 'top-0 left-[10%] rotate-[-6deg] z-30' },
  { name: 'Peppered Turkey', portions: '6 PORTIONS', price: '₦9,000', className: 'top-[120px] left-[38%] rotate-[4deg] z-20' },
  { name: 'Efo Riro', portions: '4 PORTIONS', price: '₦5,800', className: 'top-[255px] left-[6%] rotate-[3deg] z-10' },
];

const STEPS = [
  {
    idx: '01',
    title: 'Browse vetted kitchens',
    desc: 'Compare kitchens by cuisine, price, and ratings — every kitchen is quality-checked before listing.',
    check: 'Discovery',
  },
  {
    idx: '02',
    title: 'Order your bulk pack',
    desc: 'Pick proteins, soups and stews sized for a week or a month — built around what you actually eat.',
    check: 'Ordering',
  },
  {
    idx: '03',
    title: 'Schedule delivery',
    desc: 'On demand, not fixed — your pack arrives freezer-ready, whenever suits your week.',
    check: 'Delivery',
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <section className="relative overflow-hidden px-6 py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-14 md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-6 flex items-center gap-2.5 font-mono text-[12.5px] uppercase tracking-[0.14em] text-frost">
              <span className="h-px w-[22px] bg-frost" />
              Launching soon in Lagos
            </div>
            <h1 className="text-[clamp(40px,5.4vw,68px)] leading-[1.02] text-paper">
              Cook once.
              <br />
              Eat all <em className="text-paprika italic">month.</em>
            </h1>
            <p className="mt-6 max-w-[480px] text-lg leading-relaxed text-muted">
              Bulk, freezer-ready meals from vetted kitchens near you — home-cooked quality
              without the time or skill it takes to make it yourself.
            </p>
            <HeroCityPicker />
          </div>

          <div className="relative hidden h-[460px] md:block" aria-hidden="true">
            {TAGS.map((tag) => (
              <div
                key={tag.name}
                className={`absolute w-[250px] rounded-[3px] border border-[rgba(18,33,29,0.08)] bg-paper px-[18px] pb-3.5 pt-4 text-ink shadow-[0_18px_34px_rgba(0,0,0,0.35)] transition-transform duration-500 hover:z-40 hover:rotate-0 hover:-translate-y-1 ${tag.className}`}
              >
                <div className="pr-4.5 font-serif text-[17px] font-medium">{tag.name}</div>
                <div className="mt-2 flex justify-between border-t border-dashed border-[rgba(18,33,29,0.2)] pt-2 font-mono text-[11px] text-paprika-dim">
                  <span>{tag.portions}</span>
                  <span>{tag.price}</span>
                </div>
              </div>
            ))}
            <div className="absolute top-[245px] left-[56%] z-20 w-[250px] rotate-[-4deg] rounded-[3px] bg-ink px-[18px] pb-3.5 pt-4 text-paper shadow-[0_18px_34px_rgba(0,0,0,0.35)] transition-transform duration-500 hover:z-40 hover:rotate-0 hover:-translate-y-1">
              <div className="pr-4.5 font-serif text-[17px] font-medium">Your monthly pack</div>
              <div className="mt-2 flex justify-between border-t border-dashed border-line pt-2 font-mono text-[11px] text-frost">
                <span>20 MEALS</span>
                <span>₦45,000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SavingsCalculator />

      <section className="bg-bg px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-13 max-w-[600px]">
            <div className="mb-5 flex items-center gap-2.5 font-mono text-[12.5px] uppercase tracking-[0.14em] text-frost">
              <span className="h-px w-[22px] bg-frost" />
              How it works
            </div>
            <h2 className="text-[clamp(30px,3.4vw,42px)] leading-[1.1] text-paper">
              From kitchen to your freezer.
            </h2>
          </div>
          <div className="overflow-hidden rounded-[3px] border border-line">
            {STEPS.map((step) => (
              <div
                key={step.idx}
                className="grid grid-cols-[44px_1fr] items-center gap-5 border-b border-line px-7 py-6 last:border-b-0 sm:grid-cols-[70px_1fr_auto]"
              >
                <div className="font-mono text-[13px] text-frost">{step.idx}</div>
                <div>
                  <h3 className="mb-1.5 text-xl font-medium text-paper">{step.title}</h3>
                  <p className="max-w-[520px] text-[14.5px] leading-relaxed text-muted">
                    {step.desc}
                  </p>
                </div>
                <div className="col-span-2 mt-2 w-fit rounded-full bg-frost px-2.5 py-1.5 font-mono text-[11px] text-bg sm:col-span-1 sm:mt-0">
                  {step.check}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 max-w-[600px]">
            <div className="mb-5 flex items-center gap-2.5 font-mono text-[12.5px] uppercase tracking-[0.14em] text-frost">
              <span className="h-px w-[22px] bg-frost" />
              Questions
            </div>
            <h2 className="text-[clamp(30px,3.4vw,42px)] leading-[1.1] text-paper">
              Before you sign up.
            </h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      <footer className="border-t border-line bg-bg-alt px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-2.5 font-serif text-[17px] font-semibold">
            <span className="inline-block h-[9px] w-[9px] rounded-full bg-paprika" />
            Onelitre.ng
          </div>
          <div className="font-mono text-xs text-muted">hello@onelitre.ng · Lagos, Nigeria</div>
        </div>
      </footer>
    </>
  );
}
