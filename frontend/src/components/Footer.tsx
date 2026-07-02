'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BRAND_CONFIG } from '../utils/brandConfig';
import { 
  ShieldCheck, 
  Mail, 
  Send, 
  MapPin, 
  Phone, 
  Lock, 
  Heart,
  FileText
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubsubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubsubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-4 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-extrabold text-lg">
                M
              </span>
              <span className="font-heading font-bold text-lg text-white tracking-tight">
                {BRAND_CONFIG.name}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {BRAND_CONFIG.slogan}
            </p>
            <div className="space-y-2 text-sm text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>{BRAND_CONFIG.hotline}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <span className="truncate">{BRAND_CONFIG.supportEmail}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-xs">{BRAND_CONFIG.address}</span>
              </div>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div>
            <h4 className="font-heading font-bold text-white text-sm tracking-wide uppercase mb-4">
              Shop Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/catalog?category=Prescription+Medicines" className="hover:text-primary transition-colors">
                  Prescription Drugs
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=OTC+Medicines" className="hover:text-primary transition-colors">
                  Over-the-Counter (OTC)
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=Diabetes+Care" className="hover:text-primary transition-colors">
                  Diabetes Control
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=Medical+Devices" className="hover:text-primary transition-colors">
                  Healthcare Devices
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=Ayurveda" className="hover:text-primary transition-colors">
                  Ayurvedic & Herbal
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Center */}
          <div>
            <h4 className="font-heading font-bold text-white text-sm tracking-wide uppercase mb-4">
              Patient Care
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/prescription" className="hover:text-primary transition-colors">
                  Upload Prescription
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  User Dashboard & Profile
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=reminders" className="hover:text-primary transition-colors">
                  Medicine Reminders
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=support" className="hover:text-primary transition-colors">
                  Create Support Ticket
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-white text-sm tracking-wide uppercase">
              Join Newsletter
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Subscribe to receive healthcare advice, updates on chronic drug management, and seasonal health offers.
            </p>
            {subscribed ? (
              <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-400 text-xs rounded-xl flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Thank you! Subsubscribed successfully.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 focus:bg-slate-700 text-xs text-white placeholder-slate-500 px-3 py-2.5 rounded-xl border border-transparent focus:border-primary focus:outline-none flex-1"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white p-2.5 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
            
            {/* Certifications and trust icons */}
            <div className="flex gap-3 pt-3">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase bg-slate-800 px-2 py-1 rounded-md border border-slate-700/60">
                <Lock className="h-3 w-3 text-primary" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase bg-slate-800 px-2 py-1 rounded-md border border-slate-700/60">
                <ShieldCheck className="h-3 w-3 text-accent" />
                <span>HIPAA Secured</span>
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Medical Disclaimer Footnote */}
        <div className="border-t border-slate-800 pt-8 pb-6 text-slate-500 space-y-4">
          <p className="text-[11px] leading-relaxed text-justify">
            {BRAND_CONFIG.medDisclaimer}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p className="text-slate-400 font-medium">
              {BRAND_CONFIG.complianceNotice}
            </p>
            <div className="flex items-center gap-2">
              {/* Payment partner mockup logos */}
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-800 rounded border border-slate-700">Stripe</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-800 rounded border border-slate-700">Razorpay</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-800 rounded border border-slate-700">PayPal</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-800 rounded border border-slate-700">COD</span>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="border-t border-slate-800/40 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600">
          <p>© {new Date().getFullYear()} {BRAND_CONFIG.name}. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/shipping" className="hover:underline">Shipping & Return Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
