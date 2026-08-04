'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const CART_STORAGE_PREFIX = 'onelitre_cart_';
/** Abandoned guest carts (nobody signed in) clear themselves out after a day. */
const GUEST_CART_TTL_MS = 24 * 60 * 60 * 1000;

type Cart = Record<string, number>;

interface CartState {
  items: Cart;
  /** Every item in the cart belongs to this vendor — one kitchen per order (see checkout). */
  vendorId: string | null;
}

interface StoredCart extends CartState {
  savedAt: number;
}

interface CartContextValue {
  cart: Cart;
  vendorId: string | null;
  /** Returns false (and prompts to clear the cart) if `vendorId` differs from what's already in it. */
  setQty: (mealSizeId: string, qty: number, vendorId: string) => boolean;
  count: number;
  clear: () => void;
  /** Drops any cart items whose id isn't in `validIds` — self-heals if a listing was deleted,
   * unapproved, or the id went stale (e.g. a local dev database reseed) since it was added. */
  prune: (validIds: Set<string>) => void;
  /** Drawer open state lives here (rather than a separate context) so any component — the header
   * button, a "view basket" link, etc. — can open it without its own provider. */
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const EMPTY_STATE: CartState = { items: {}, vendorId: null };

const CartContext = createContext<CartContextValue | null>(null);

function storageKey(userId: string | null): string {
  return `${CART_STORAGE_PREFIX}${userId ?? 'guest'}`;
}

function readCart(userId: string | null): CartState {
  if (typeof window === 'undefined') return EMPTY_STATE;
  const key = storageKey(userId);
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return EMPTY_STATE;
    const stored: StoredCart = JSON.parse(raw);
    if (userId === null && Date.now() - stored.savedAt > GUEST_CART_TTL_MS) {
      window.localStorage.removeItem(key);
      return EMPTY_STATE;
    }
    return { items: stored.items ?? {}, vendorId: stored.vendorId ?? null };
  } catch {
    return EMPTY_STATE;
  }
}

/**
 * Keyed by signed-in user id (or `guest` when signed out) so switching accounts on the same
 * browser never shows someone else's cart, and guest carts expire instead of lingering forever.
 * Also enforces one vendor per cart — orders can only ever have a single pickup point, which is
 * what makes a per-order delivery fee possible.
 */
export function CartProvider({
  userId,
  children,
}: {
  userId: string | null;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<CartState>(EMPTY_STATE);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setState(readCart(userId));
  }, [userId]);

  function persist(next: CartState) {
    const stored: StoredCart = { ...next, savedAt: Date.now() };
    window.localStorage.setItem(storageKey(userId), JSON.stringify(stored));
  }

  function setQty(mealSizeId: string, qty: number, itemVendorId: string): boolean {
    if (qty > 0 && state.vendorId && state.vendorId !== itemVendorId) {
      const confirmed = window.confirm(
        'Your cart has items from another kitchen. Onelitre orders can only be from one kitchen at a time — clear your cart and start a new order here?',
      );
      if (!confirmed) return false;
      const next: CartState = { items: { [mealSizeId]: qty }, vendorId: itemVendorId };
      persist(next);
      setState(next);
      return true;
    }

    const items = { ...state.items };
    if (qty <= 0) {
      delete items[mealSizeId];
    } else {
      items[mealSizeId] = qty;
    }
    const next: CartState = {
      items,
      vendorId: Object.keys(items).length > 0 ? itemVendorId : null,
    };
    persist(next);
    setState(next);
    return true;
  }

  function clear() {
    setState(EMPTY_STATE);
    window.localStorage.removeItem(storageKey(userId));
  }

  const prune = useCallback(
    (validIds: Set<string>) => {
      setState((prev) => {
        const entries = Object.entries(prev.items).filter(([id]) => validIds.has(id));
        if (entries.length === Object.keys(prev.items).length) return prev;
        const items = Object.fromEntries(entries);
        const next: CartState = {
          items,
          vendorId: Object.keys(items).length > 0 ? prev.vendorId : null,
        };
        const stored: StoredCart = { ...next, savedAt: Date.now() };
        window.localStorage.setItem(storageKey(userId), JSON.stringify(stored));
        return next;
      });
    },
    [userId],
  );

  const count = Object.values(state.items).reduce((sum, qty) => sum + qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart: state.items,
        vendorId: state.vendorId,
        setQty,
        count,
        clear,
        prune,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
