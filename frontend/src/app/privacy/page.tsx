'use client';

import React from 'react';
import { BRAND_CONFIG } from '../../utils/brandConfig';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border border-slate-200/60 rounded-3xl shadow-sm text-xs leading-relaxed text-slate-600 space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-800 font-heading">Privacy Policy</h1>
      <p className="text-[11px] text-slate-400">Last updated: June 26, 2026</p>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-700">1. Information We Collect</h3>
        <p>
          We collect personal account details, shipping addresses, payment records, login history profiles, and doctor-signed prescription files to verify order authorizations and complete transactions.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-700">2. HIPAA & Healthcare Compliance</h3>
        <p>
          We employ enterprise-grade SSL encryption and secure databases to protect patient medical histories. Prescription files are viewed only by certified pharmacists during validation reviews.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-700">3. Share Data Constraints</h3>
        <p>
          Your diagnostic history, prescription sheets, and medicine lists are never shared with marketing brokers. We coordinate strictly with gateway partners (Stripe, Razorpay) and logistics handlers.
        </p>
      </section>

      <p className="text-[10px] text-slate-400 pt-4 border-t border-slate-100">
        Contact {BRAND_CONFIG.supportEmail} for details on data protection.
      </p>
    </div>
  );
}
