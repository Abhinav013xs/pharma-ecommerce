'use client';

import React from 'react';
import { BRAND_CONFIG } from '../../utils/brandConfig';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white border border-slate-200/60 rounded-3xl shadow-sm text-xs leading-relaxed text-slate-600 space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-800 font-heading">Terms & Conditions</h1>
      <p className="text-[11px] text-slate-400">Last updated: June 26, 2026</p>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-700">1. Agreement to Terms</h3>
        <p>
          By accessing or using the {BRAND_CONFIG.name} platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-700">2. Medical Disclaimer</h3>
        <p>
          {BRAND_CONFIG.medDisclaimer}
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-700">3. Prescription Refill Policy</h3>
        <p>
          Certain products cataloged on our platform require a valid prescription issued by a licensed healthcare practitioner. Orders for Rx-only medications will remain suspended in "Pending review" status until inspected and approved by a certified pharmacist.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-700">4. Accounts and Security</h3>
        <p>
          Users are responsible for safeguarding login details. Enabling Two-Factor Authentication (2FA) is highly recommended for patient record security. We log login histories to protect account security.
        </p>
      </section>

      <p className="text-[10px] text-slate-400 pt-4 border-t border-slate-100">
        Contact {BRAND_CONFIG.supportEmail} for policy questions.
      </p>
    </div>
  );
}
