/**
 * Draft vendor terms — placeholder copy so vendors have something real to read before
 * accepting/declining. Not reviewed by a lawyer; replace with actual counsel-approved terms
 * before this is treated as binding.
 */
export const VENDOR_CONTRACT_VERSION = '2026-07-18-draft';

export const VENDOR_CONTRACT_SECTIONS: { heading: string; body: string }[] = [
  {
    heading: '1. What Onelitre does',
    body: 'Onelitre lists your kitchen and meals on the platform, takes customer orders on your behalf, and handles delivery of completed orders. You are responsible for preparing and packaging meals to the standard described in your listings.',
  },
  {
    heading: '2. Listing standards',
    body: 'Every meal listing needs a clear, accurate photo (your own, or requested from Onelitre for a flat fee) and goes through a review before it appears publicly. Any change to a listing — price, size, photo, or description — is re-reviewed before it goes live again.',
  },
  {
    heading: '3. Order acceptance',
    body: 'You must accept or reject each incoming order within the posted response window. Orders you don’t respond to in time may be flagged for follow-up. Rejecting an order should be reserved for genuine unavailability (e.g. out of stock).',
  },
  {
    heading: '4. Payments and payouts',
    body: 'Customers pay Onelitre 100% of the order value upfront — you are not paid by the customer directly. Onelitre pays your share out of that amount in two parts. Standard kitchens receive 40% of the order value as an advance, and the remaining 40% within 24 hours of confirmed delivery; Onelitre retains a 20% platform commission. Certified kitchens (see §8) receive 60% as an advance and 20% within 24 hours of confirmed delivery, on the same 20% commission. Payout method and schedule details are confirmed separately from this agreement.',
  },
  {
    heading: '5. Delivery confirmation and disputes',
    body: 'The 24-hour window for your delivery-triggered payout starts when delivery is confirmed through the rider/delivery flow (photo, timestamp, and location), not when the customer says so. If no dispute is raised against an order within that 24-hour window, your remaining payout for it is released automatically. If a dispute is raised, that portion of your payout is held until Onelitre resolves it — and an upheld dispute counts as a quality strike (§10).',
  },
  {
    heading: '6. Identity verification',
    body: 'Before your kitchen can be approved and go live, you must provide a NIN and a BVN, each verified against government/financial records. This is a baseline requirement for every kitchen and is separate from Certified status (§8) — it doesn’t affect your advance rate, only whether you can operate on the platform at all. Providing false identity information is grounds for suspension.',
  },
  {
    heading: '7. Kitchen walkthrough',
    body: 'You must submit a short video walkthrough of your kitchen (prep area, storage, handwashing station) before approval. Onelitre reviews it against a basic hygiene checklist; a failed review means you’ll need to resubmit before your kitchen can go live.',
  },
  {
    heading: '8. Certified status',
    body: 'You’ll be asked to provide a CAC registration (if registered) and a food safety certificate, reviewed by the Onelitre team and possibly checked against government registries. A kitchen becomes "Certified" once both are verified, which unlocks the higher advance rate described in §4; until then you’re paid at the Standard rate.',
  },
  {
    heading: '9. Re-verification',
    body: 'Verified documents (§6, §8) are re-checked periodically — roughly every 6 months — and you’ll need to re-verify sooner if: a dispute against your kitchen is upheld (§10), or your kitchen goes 60+ days without any activity (an order action, listing change, or profile update). Until re-verification clears, your Certified status (if any) is paused and shows as unverified again.',
  },
  {
    heading: '10. Dispute tiers and consequences',
    body: 'Not all issues are treated the same. A confirmed food-safety incident results in immediate suspension. A single confirmed fraud finding results in permanent offboarding — no warning tier. Quality disputes (e.g. wrong order, poor packaging) escalate: the 1st confirmed quality dispute in a rolling 6-month window is a warning, the 2nd is a 30–60 day pause, and the 3rd is permanent offboarding.',
  },
  {
    heading: '11. Price parity',
    body: 'Your price on Onelitre should not be more than 10% above what you charge for the same item through your own channels (WhatsApp, in-person, etc.). You self-certify your own-channel price for each listing; Onelitre monitors this on a complaint basis rather than blocking listings automatically, and repeated, confirmed violations may result in a quality dispute (§10).',
  },
  {
    heading: '12. Ending this agreement',
    body: 'Either party may end this arrangement at any time. Onelitre may suspend or offboard a kitchen immediately for food-safety concerns, fraud, repeated order rejections, or verification issues, per the tiers in §10.',
  },
];
