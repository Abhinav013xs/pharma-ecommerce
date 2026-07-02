'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation.js';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Clipboard, FileText, ShoppingBag } from 'lucide-react';
import { BRAND_CONFIG } from '../../../utils/brandConfig';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId') || 'unknown';

  return (
    <div className="max-w-md w-full mx-auto text-center space-y-6 p-8 bg-white border border-slate-200/60 rounded-3xl shadow-xl">
      
      {/* Check icon */}
      <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-10 w-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-800 font-heading">Order Placed Successfully!</h1>
        <p className="text-xs text-slate-400">Thank you for ordering with {BRAND_CONFIG.name}. Your payment is verified.</p>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-2 text-slate-500">
        <div className="flex justify-between">
          <span>Order ID Reference:</span>
          <span className="font-bold text-slate-700">{orderId}</span>
        </div>
        <div className="flex justify-between">
          <span>Status:</span>
          <span className="font-bold text-emerald-600">Processing</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Details:</span>
          <span className="font-bold text-slate-700">Tomorrow via Express</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1.5"
        >
          <Clipboard className="h-4.5 w-4.5" />
          <span>Track Order in Dashboard</span>
        </button>
        <button
          onClick={() => router.push('/catalog')}
          className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="h-4.5 w-4.5 text-primary" />
          <span>Continue Shopping</span>
        </button>
      </div>

      <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
        Transactional invoices and SMS reminders will be dispatched shortly. Secure packaging guarantees medical compliance.
      </p>

    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="text-center py-12">
          <p className="text-sm text-slate-400">Loading receipt details...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
