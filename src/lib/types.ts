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
  createdAt: string;
  updatedAt: string;
}

export interface MealSize {
  id: string;
  litres: number;
  price: number;
  servings: number;
  note?: string | null;
}

export interface Meal {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  available?: boolean;
  vendorId?: string;
  sizes: MealSize[];
}

export type VendorStatus = 'pending' | 'approved' | 'suspended';

export interface Vendor {
  id: string;
  name: string;
  area: string;
  address?: string | null;
  contactPhone?: string | null;
  isRegisteredBusiness?: boolean;
  registrationNumber?: string | null;
  status?: VendorStatus;
  ownerId?: string | null;
  meals: Meal[];
  ratingAverage?: number | null;
  ratingCount?: number;
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
  mealSizeId?: string | null;
  mealName: string;
  litres: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  vendorReadyAt?: string | null;
}

export interface Order {
  id: string;
  customerId: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  notes?: string | null;
  subtotal: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
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
