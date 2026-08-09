export const CUISINE_OPTIONS = [
  'Nigerian',
  'Swallow & Soups',
  'Rice & Grains',
  'Proteins & Sides',
  'Small Chops',
  'Drinks & Smoothies',
  'Continental',
  'Other',
];

export const PREP_TIME_OPTIONS = [
  { value: 30, label: 'Under 30 min' },
  { value: 45, label: '30–45 min' },
  { value: 60, label: '45–60 min' },
  { value: 90, label: '60–90 min' },
];

/** Vendor's own dispatch/logistics estimate — combined with prep time to bucket the
 * customer-facing "delivery time" (see DELIVERY_TIME_BUCKETS below). */
export const DELIVERY_TIME_OPTIONS = [
  { value: 60, label: 'Under 1 hour' },
  { value: 180, label: '1–3 hours' },
  { value: 360, label: '3–6 hours' },
  { value: 720, label: '6–12 hours' },
  { value: 1440, label: '12–24 hours' },
];

/** Padding added on top of prep + dispatch time before bucketing, so the bucket we show
 * customers doesn't under-promise against the vendor's own (optimistic) estimates. */
export const DELIVERY_TIME_BUFFER_MINUTES = 60;

/** Customer-facing "delivery time" buckets — what's shown/filtered on the menu browser.
 * Ordered ascending; `maxMinutes` is the upper bound of prep + dispatch + buffer for that bucket. */
export const DELIVERY_TIME_BUCKETS = [
  { value: 'under-3h', label: 'Under 3 hours', maxMinutes: 180 },
  { value: '3-6h', label: '3-6 hours', maxMinutes: 360 },
  { value: '6-12h', label: '6-12 hours', maxMinutes: 720 },
  { value: '12-24h', label: '12-24hours', maxMinutes: 1440 },
  { value: 'up-to-48h', label: 'Up to 48 hours', maxMinutes: 2880 },
];

/** Total estimated minutes (prep + vendor's dispatch estimate + buffer), or null if either
 * half hasn't been set by the vendor yet. */
export function getEstimatedDeliveryMinutes(vendor: {
  estimatedPrepMinutes?: number | null;
  estimatedDeliveryMinutes?: number | null;
}): number | null {
  if (vendor.estimatedPrepMinutes == null || vendor.estimatedDeliveryMinutes == null) {
    return null;
  }
  return (
    vendor.estimatedPrepMinutes +
    vendor.estimatedDeliveryMinutes +
    DELIVERY_TIME_BUFFER_MINUTES
  );
}

/** Which customer-facing bucket a total estimated-minutes value falls into, or null if it
 * exceeds even the widest bucket. */
export function getDeliveryTimeBucket(totalMinutes: number) {
  return DELIVERY_TIME_BUCKETS.find((b) => totalMinutes <= b.maxMinutes) ?? null;
}

/** "500+" once past 500 ratings, exact count otherwise — shared by the browse cards and the
 * vendor detail page header so the format never drifts between the two. */
export function formatRatingCount(n: number): string {
  return n > 500 ? '500+' : String(n);
}

/** Shared by the vendor-browse filter bar (bucketing vendors by their cheapest item) and the
 * individual vendor page's filter bar (bucketing that vendor's own items directly). */
export const PRICE_BUCKETS = [
  { value: 'under-20k', label: 'Under ₦20,000', test: (p: number) => p < 20000 },
  { value: '20k-40k', label: '₦20,000–₦40,000', test: (p: number) => p >= 20000 && p <= 40000 },
  { value: 'over-40k', label: 'Above ₦40,000', test: (p: number) => p > 40000 },
];

export const RATING_BUCKETS = [
  { value: '4.5', label: '4.5+ stars', min: 4.5 },
  { value: '4', label: '4+ stars', min: 4 },
  { value: '3.5', label: '3.5+ stars', min: 3.5 },
];

export const CERTIFIED_BADGE_ID = 'certified';

/** Self-declared per-dish attributes — not admin-verified, unlike vendor-level Badges
 * (Certified/Halal-as-certification/OneLitre+ above). A single dish can carry several at once.
 * Keep in sync with web/backend/src/vendors/dto/meal-size.dto.ts's DIETARY_TAGS. */
export const DIETARY_TAGS = [
  'Gluten Free',
  'Halal',
  'Organic',
  'Kosher',
  'Vegan friendly',
  'Vegan',
  'Vegetarian',
] as const;
