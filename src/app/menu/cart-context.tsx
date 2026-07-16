'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CART_STORAGE_KEY = 'onelitre_cart';

type Cart = Record<string, number>;

interface CartContextValue {
  cart: Cart;
  setQty: (mealSizeId: string, qty: number) => void;
  count: number;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readCart(): Cart {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({});

  useEffect(() => {
    setCart(readCart());
  }, []);

  function setQty(mealSizeId: string, qty: number) {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[mealSizeId];
      } else {
        next[mealSizeId] = qty;
      }
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function clear() {
    setCart({});
    window.localStorage.removeItem(CART_STORAGE_KEY);
  }

  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <CartContext.Provider value={{ cart, setQty, count, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
