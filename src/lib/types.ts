export type Role = 'customer' | 'vendor' | 'staff' | 'supervisor' | 'admin' | 'super_admin';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface User {
  id: string;
  phone?: string | null;
  email?: string | null;
  role: Role;
  isActive?: boolean;
  firstName: string;
  lastName: string;
  address?: string | null;
  area?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MealApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface MealSize {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  available?: boolean;
  approvalStatus?: MealApprovalStatus;
  rejectionReason?: string | null;
  photoRequested?: boolean;
  litres: number;
  price: number;
  servings: number;
  note?: string | null;
  /** Vendor's self-certified price on their own channels — platform price should stay within 10% of this. */
  ownChannelPrice?: number | null;
  vendorId?: string;
  vendor?: { id: string; name: string };
}

export type VendorStatus = 'pending' | 'approved' | 'suspended' | 'paused' | 'offboarded';

export interface Badge {
  id: string;
  name: string;
  label: string;
}

export interface Vendor {
  id: string;
  name: string;
  area?: string | null;
  address?: string | null;
  contactPhone?: string | null;
  cuisines?: string[] | null;
  badges?: Badge[];
  estimatedPrepMinutes?: number | null;
  estimatedDeliveryMinutes?: number | null;
  contractAcceptedAt?: string | null;
  contractDeclinedAt?: string | null;
  contractSignatureName?: string | null;
  contractSignedVersion?: string | null;
  status?: VendorStatus;
  ownerId?: string | null;
  meals: MealSize[];
  ratingAverage?: number | null;
  ratingCount?: number;
  profileComplete?: boolean;
  /** Set once CAC + food safety are both verified — unlocks the higher advance rate. NIN is a separate onboarding requirement, not part of this badge. */
  certifiedAt?: string | null;
  payoutBankCode?: string | null;
  payoutAccountNumber?: string | null;
  payoutAccountName?: string | null;
  /** Set when status is 'paused' — reverts to 'approved' automatically once this passes. */
  pausedUntil?: string | null;
  lastActiveAt?: string | null;
  /** Set once 60+ days dormant — clears (and requires re-verification) once activity resumes. */
  dormancyRiskAt?: string | null;
  /** Custom-negotiated payout split — all three set together overrides the standard/certified default. */
  customAdvancePct?: number | null;
  customRemainderPct?: number | null;
  customCommissionPct?: number | null;
  /** The split actually in effect for this vendor right now — custom override, else certified/standard. */
  effectiveSplit: EffectiveSplit;
}

export interface EffectiveSplit {
  advancePct: number;
  remainderPct: number;
  commissionPct: number;
}

export type VendorDocumentType = 'nin' | 'cac' | 'food_safety';
export type VendorDocumentStatus = 'pending' | 'verified' | 'rejected';

export interface VendorDocument {
  id: string;
  vendorId: string;
  type: VendorDocumentType;
  fileUrl?: string | null;
  value?: string | null;
  status: VendorDocumentStatus;
  reviewerNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  vendorId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customer: { firstName: string; lastName: string };
}

export type OrderStatus =
  | 'placed'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  vendorId: string;
  vendor?: { id: string; name: string };
  mealSizeId?: string | null;
  mealName: string;
  litres: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  vendorReadyAt?: string | null;
  acceptDeadlineAt: string;
  vendorAcceptedAt?: string | null;
  vendorRejectedAt?: string | null;
  vendorRejectionReason?: string | null;
}

export type OrderPaymentStatus = 'pending' | 'paid' | 'failed';
export type DisputeOutcome = 'upheld' | 'dismissed';

export interface Order {
  id: string;
  customerId: string;
  deliveryAddress: string;
  deliveryArea?: string | null;
  area?: string | null;
  deliveryDate: string;
  deliveryTimeSlot: string;
  notes?: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  deliveryConfirmedAt?: string | null;
  deliveryPhotoUrl?: string | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  disputeRaisedAt?: string | null;
  disputeReason?: string | null;
  disputeResolvedAt?: string | null;
  disputeOutcome?: DisputeOutcome | null;
  createdAt: string;
  items: OrderItem[];
}

export interface DeliveryFee {
  id: string;
  area: string;
  feeNaira: number;
  updatedAt: string;
}

export type SubscriptionStatus = 'pending' | 'active' | 'lapsed' | 'cancelled';

export interface Subscription {
  id: string;
  customerId: string;
  planCode: string;
  status: SubscriptionStatus;
  currentPeriodEnd?: string | null;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  paystackPlanCode: string;
  priceNaira: number;
  isActive: boolean;
  createdAt: string;
}

export type PayoutType = 'advance' | 'remainder';
export type PayoutStatus = 'pending' | 'paid';

export interface Payout {
  id: string;
  vendorId: string;
  vendor?: { id: string; name: string };
  amount: number;
  type: PayoutType;
  status: PayoutStatus;
  note?: string | null;
  orderId?: string | null;
  createdAt: string;
  paidAt?: string | null;
}

export interface VendorOrderGroup {
  order: Pick<
    Order,
    'id' | 'deliveryAddress' | 'deliveryDate' | 'deliveryTimeSlot' | 'status' | 'createdAt'
  >;
  items: OrderItem[];
}

export interface SalesSummary {
  totalRevenue: number;
  orderCount: number;
  topMeals: { mealName: string; quantity: number }[];
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorRole: Role;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export type WalkthroughStatus = 'pending' | 'passed' | 'failed';

export interface WalkthroughChecklistAnswer {
  key: string;
  passed: boolean;
}

export interface VendorWalkthrough {
  id: string;
  vendorId: string;
  videoUrl: string;
  status: WalkthroughStatus;
  checklist?: WalkthroughChecklistAnswer[] | null;
  reviewerNote?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export type VendorIncidentType = 'safety' | 'quality' | 'fraud';
export type VendorIncidentConsequence = 'warning' | 'paused' | 'suspended' | 'offboarded';

export interface VendorIncident {
  id: string;
  vendorId: string;
  type: VendorIncidentType;
  reason: string;
  orderId?: string | null;
  consequence: VendorIncidentConsequence;
  pauseDays?: number | null;
  raisedById?: string | null;
  createdAt: string;
}
