'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  discount: number; // e.g. 10 for 10%
  image: string;
  category: string;
  prescriptionRequired: boolean;
  quantity: number;
}

interface Coupon {
  code: string;
  discountPercent: number;
}

interface CartContextType {
  cart: CartItem[];
  coupon: Coupon | null;
  deliverySlot: string;
  prescriptionId: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  prescriptionRequired: boolean;
  addToCart: (product: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  setDeliverySlot: (slot: string) => void;
  setPrescriptionId: (id: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const VALID_COUPONS: { [key: string]: number } = {
  'WELCOME20': 20,
  'HEALTH10': 10,
  'DOLO15': 15,
  'SUPERMED': 25
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [deliverySlot, setDeliverySlotState] = useState<string>('Tomorrow, 9 AM - 1 PM');
  const [prescriptionId, setPrescriptionIdState] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; productName?: string } | null>(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast?.show) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load cart from localstorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('pharma_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart items:", e);
      }
    }
  }, []);

  // Save cart to localstorage on change
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('pharma_cart', JSON.stringify(newCart));
  };

  const addToCart = (product: Omit<CartItem, 'quantity'>, qty = 1) => {
    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += qty;
      saveCart(newCart);
    } else {
      saveCart([...cart, { ...product, quantity: qty }]);
    }
    setToast({ show: true, productName: product.name });
  };

  const removeFromCart = (productId: string) => {
    saveCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cart.map(item => 
      item.id === productId ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
    setCoupon(null);
    setPrescriptionIdState(null);
  };

  const applyCoupon = (code: string): boolean => {
    const uppercaseCode = code.toUpperCase().trim();
    if (VALID_COUPONS[uppercaseCode] !== undefined) {
      setCoupon({
        code: uppercaseCode,
        discountPercent: VALID_COUPONS[uppercaseCode]
      });
      return true;
    }
    return false;
  };

  const removeCoupon = () => setCoupon(null);
  const setDeliverySlot = (slot: string) => setDeliverySlotState(slot);
  const setPrescriptionId = (id: string | null) => setPrescriptionIdState(id);

  // Calculations
  const rawSubtotal = cart.reduce((sum, item) => {
    const finalPrice = item.price - (item.price * item.discount) / 100;
    return sum + finalPrice * item.quantity;
  }, 0);

  const subtotal = parseFloat(rawSubtotal.toFixed(2));
  
  const discountAmount = coupon 
    ? parseFloat(((subtotal * coupon.discountPercent) / 100).toFixed(2))
    : 0;

  const afterDiscount = subtotal - discountAmount;
  const taxAmount = parseFloat((afterDiscount * 0.18).toFixed(2)); // 18% GST standard on medicines
  
  const shippingAmount = cart.length === 0 ? 0 : afterDiscount > 500 ? 0 : 50; // Free shipping over ₹500
  
  const total = parseFloat((afterDiscount + taxAmount + shippingAmount).toFixed(2));

  const prescriptionRequired = cart.some(item => item.prescriptionRequired);

  return (
    <CartContext.Provider value={{
      cart,
      coupon,
      deliverySlot,
      prescriptionId,
      subtotal,
      discountAmount,
      taxAmount,
      shippingAmount,
      total,
      prescriptionRequired,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      setDeliverySlot,
      setPrescriptionId
    }}>
      {children}
      {toast && toast.show && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-slate-900/95 text-white pl-4 pr-5 py-3.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-800 backdrop-blur-md animate-[slideIn_0.3s_ease-out] max-w-sm">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Added to Cart</p>
            <p className="text-xs font-semibold text-white truncate max-w-[200px]">
              {toast.productName}
            </p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="flex-shrink-0 text-slate-400 hover:text-white transition-colors ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
