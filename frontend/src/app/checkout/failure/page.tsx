'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation.js';
import Link from 'next/link';
import { XCircle, RefreshCw, PhoneCall, AlertTriangle } from 'lucide-react';
import { BRAND_CONFIG } from '../../../utils/brandConfig';

function FailureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId') || 'unknown';

  return (
    <div className="max-w-md w-full mx-auto text-center space-y-6 p-8 bg-white border border-slate-200/60 rounded-3xl shadow-xl">
      
      {/* Failure icon */}
      <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
        <XCircle className="h-10 w-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-800 font-heading">Payment Failed</h1>
        <p className="text-xs text-slate-400">The gateway transaction was declined or timed out. Order {orderId} is currently unpaid.</p>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-2 text-slate-500">
        <h4 className="font-bold text-slate-700 flex items-center gap-1">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          <span>Troubleshooting Tips:</span>
        </h4>
        <ul className="text-left space-y-1 list-disc pl-4 text-slate-500">
          <li>Verify credit card balance or UPI limits.</li>
          <li>Check that the OTP/2FA details were typed correctly.</li>
          <li>Select a different payment provider (Razorpay/COD).</li>
        </ul>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={() => router.push('/cart')}
          className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="h-4.5 w-4.5" />
          <span>Return to Cart & Retry</span>
        </button>
        <button
          onClick={() => router.push('/dashboard?tab=support')}
          className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
        >
          <PhoneCall className="h-4.5 w-4.5 text-accent" />
          <span>Contact Support Desk</span>
        </button>
      </div>

      <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
        If funds were debited, a reverse refund credit will settle automatically within 2-3 business days. Hotline: {BRAND_CONFIG.hotline}.
      </p>

    </div>
  );
}

export default function CheckoutFailurePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="text-center py-12">
          <p className="text-sm text-slate-400">Loading order error details...</p>
        </div>
      }>
        <FailureContent />
      </Suspense>
    </div>
  );
}
