'use client';

import React from 'react';
import { BRAND_CONFIG } from '../../utils/brandConfig';

export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border border-slate-200/60 rounded-3xl shadow-sm text-xs leading-relaxed text-slate-600 space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-800 font-heading">Shipping & Return Policy</h1>
      <p className="text-[11px] text-slate-400">Last updated: June 26, 2026</p>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-700">1. Delivery Estimations</h3>
        <p>
          We deliver local orders within 24-48 hours. Shipping charges are ₹50 for orders below ₹500, and free for all orders above ₹500. Delivery slots can be chosen during checkout.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-700">2. Prescription Delays</h3>
        <p>
          Orders containing prescription drugs will not ship until approved by our pharmacist team. Please upload documents promptly to prevent dispatch delays.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-700">3. Return Constraints</h3>
        <p>
          Due to safety guidelines, prescription medications cannot be returned once delivered. Non-prescription OTC drugs and wellness items can be returned within 7 days in unopened, sealed packaging.
        </p>
      </section>

      <p className="text-[10px] text-slate-400 pt-4 border-t border-slate-100">
        Contact {BRAND_CONFIG.supportEmail} to coordinate returns.
      </p>
    </div>
  );
}
