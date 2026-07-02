'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation.js';
import { useAuth } from '../../context/AuthContext';
import { BRAND_CONFIG } from '../../utils/brandConfig';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ShieldCheck, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { login, register, googleLogin, error, clearError } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleTabChange = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    clearError();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    let success = false;
    if (activeTab === 'signin') {
      success = await login(formData.email, formData.password);
    } else {
      success = await register(formData.name, formData.email, formData.password, formData.phone);
    }

    setLoading(false);
    if (success) {
      router.push('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    clearError();
    // Simulate Google Login callback
    const dummyGoogleId = Math.random().toString(36).substring(2, 12);
    const success = await googleLogin(
      formData.email || "demo.user@gmail.com",
      formData.name || "Alex Mercer",
      dummyGoogleId
    );
    setLoading(false);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Page Titles */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold font-heading text-slate-800">
            Welcome to {BRAND_CONFIG.name}
          </h2>
          <p className="text-xs text-slate-400">
            {activeTab === 'signin' ? 'Sign in to access your profile & refills' : 'Register your medical profile profile'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border border-slate-100 p-1 rounded-xl bg-slate-50">
          <button
            onClick={() => handleTabChange('signin')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'signin' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => handleTabChange('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'signup' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Auth Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-danger text-xs font-medium rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Details */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'signup' && (
            <>
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    name="name"
                    placeholder="Dr. John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3 pl-9 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-primary"
                  />
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3 pl-9 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-primary"
                  />
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 pl-9 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-primary"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
              {activeTab === 'signin' && (
                <span className="text-[10px] text-primary hover:underline cursor-pointer">Forgot?</span>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                required
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 pl-9 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:border-primary"
              />
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="h-4.5 w-4.5" />
                <span>{activeTab === 'signin' ? 'Sign In Securely' : 'Complete Setup'}</span>
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative flex items-center justify-center py-2">
          <div className="border-t border-slate-100 w-full" />
          <span className="absolute bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or Continue With</span>
        </div>

        {/* OAuth Buttons */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          {/* Simple flat google icon vector logo layout */}
          <span className="text-sm">🌐</span>
          <span>Google Login</span>
        </button>

      </div>
    </div>
  );
}
