'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation.js';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  FileText, 
  AlertTriangle,
  Gift,
  X,
  Plus
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cart,
    coupon,
    subtotal,
    discountAmount,
    taxAmount,
    shippingAmount,
    total,
    prescriptionRequired,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponInput.trim()) return;

    const success = applyCoupon(couponInput);
    if (success) {
      setCouponInput('');
    } else {
      setCouponError("Invalid promo code. Try WELCOME20 or HEALTH10");
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      router.push('/auth');
    } else {
      router.push('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="h-16 w-16 bg-sky-50 text-primary rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 font-heading">Your Cart is Empty</h2>
        <p className="text-slate-500 text-xs max-w-sm mx-auto">Add prescription medications, supplements, or medical devices to begin your order.</p>
        <Link href="/catalog" className="inline-flex items-center gap-1.5 px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-full shadow-md shadow-primary/10">
          <span>Browse Medicines</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <h1 className="text-3xl font-extrabold text-slate-900 font-heading mb-8">Shopping Cart Summary</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Prescription Warning banner */}
          {prescriptionRequired && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-800">Prescription Upload Required</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Your cart contains medications that require doctor prescriptions. You will be prompted to upload prescription files in the checkout stage.
                </p>
              </div>
            </div>
          )}

          {/* List of items */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm divide-y divide-slate-100">
            {cart.map((item) => {
              const finalPrice = item.price - (item.price * item.discount) / 100;
              return (
                <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  
                  {/* Product Details */}
                  <div className="flex gap-4 min-w-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="h-16 w-16 object-contain rounded-xl border border-slate-100 bg-slate-50 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.brand}</p>
                      <h4 className="text-sm font-bold text-slate-800 truncate">{item.name}</h4>
                      
                      <div className="flex items-center gap-2 mt-1">
                        {item.prescriptionRequired && (
                          <span className="text-[10px] text-danger font-semibold bg-red-50 px-1.5 py-0.5 rounded border border-red-100 flex items-center gap-0.5">
                            <FileText className="h-3 w-3" />
                            <span>Rx</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">{item.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    
                    {/* Quantity selectors */}
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shrink-0">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 font-bold"
                      >
                        -
                      </button>
                      <span className="px-3.5 py-1 text-xs font-bold text-slate-800">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Price and Delete */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-800">₹{(finalPrice * item.quantity).toFixed(2)}</p>
                        {item.discount > 0 && (
                          <p className="text-[9px] text-emerald-600">Saved ₹{((item.price * item.discount / 100) * item.quantity).toFixed(2)}</p>
                        )}
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-slate-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Right: Order Summary Block */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Coupon Code Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Gift className="h-4.5 w-4.5 text-primary" />
              <span>Apply Offer Coupon</span>
            </h4>
            
            {coupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl flex items-center justify-between">
                <span>Code '{coupon.code}' Applied ({coupon.discountPercent}% Off)</span>
                <button onClick={removeCoupon} className="p-0.5 text-emerald-600 hover:bg-emerald-100 rounded">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="WELCOME20, HEALTH10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:bg-white focus:outline-none focus:border-primary flex-grow uppercase"
                  />
                  <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 rounded-xl font-bold">Apply</button>
                </div>
                {couponError && <p className="text-[10px] text-danger font-medium">{couponError}</p>}
              </form>
            )}
          </div>

          {/* Pricing breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Bill Details</h3>
            
            <div className="space-y-2.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Cart Subtotal</span>
                <span className="text-slate-800 font-medium">₹{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Promo Discount</span>
                  <span>- ₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST Tax (18% Healthcare Standard)</span>
                <span className="text-slate-800 font-medium">₹{taxAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery & Shipping Charges</span>
                <span className="text-slate-800 font-medium">
                  {shippingAmount === 0 ? 'FREE' : `₹${shippingAmount.toFixed(2)}`}
                </span>
              </div>
              {shippingAmount > 0 && (
                <p className="text-[10px] text-slate-400">Add ₹{(500 - (subtotal - discountAmount)).toFixed(2)} more for FREE delivery!</p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-800">Total Amount To Pay</span>
              <span className="text-2xl font-extrabold text-primary">₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <span>{user ? 'Proceed to Checkout' : 'Login to Order'}</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
