'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation.js';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { BRAND_CONFIG } from '../utils/brandConfig';
import { 
  ShoppingBag, 
  UploadCloud, 
  User as UserIcon, 
  Search, 
  Sparkles, 
  LogOut, 
  Grid, 
  ChevronDown, 
  Menu, 
  X,
  PhoneCall
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll for applying background shadows
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAiSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}&ai=true`);
    } else {
      router.push('/catalog?ai=true');
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 shadow-md backdrop-blur-md py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-md shadow-primary/20">
              <span className="font-heading font-extrabold text-xl">M</span>
            </span>
            <span className="font-heading font-bold text-xl tracking-tight hidden sm:block bg-gradient-to-r from-dark to-primary-hover bg-clip-text text-transparent">
              {BRAND_CONFIG.name}
            </span>
          </Link>

          {/* Smart Search Bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-lg relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search medicines, health supplements, devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-sm text-dark placeholder-slate-400 pl-10 pr-24 py-2.5 rounded-full border border-transparent focus:border-primary focus:outline-none transition-all"
              />
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              
              <button 
                type="button"
                onClick={handleAiSearch}
                className="absolute right-2.5 top-1.5 px-3 py-1 bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent text-white text-xs font-medium rounded-full shadow-sm flex items-center gap-1 transition-all"
              >
                <Sparkles className="h-3 w-3" />
                <span>AI Ask</span>
              </button>
            </div>
          </form>

          {/* Navigation Links & Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/catalog" className={`text-sm font-medium hover:text-primary transition-colors ${pathname === '/catalog' ? 'text-primary' : 'text-slate-600'}`}>
              Shop Medicines
            </Link>
            
            {/* Support hotline info */}
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
              <PhoneCall className="h-3.5 w-3.5 text-accent" />
              <span>{BRAND_CONFIG.hotline}</span>
            </div>

            {/* Upload Prescription */}
            <Link href="/prescription" className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all">
              <UploadCloud className="h-4 w-4" />
              <span>Upload Prescription</span>
            </Link>
          </div>

          {/* User & Cart Icons */}
          <div className="flex items-center gap-3">
            {/* Cart Badge */}
            <Link href="/cart" className="relative p-2.5 bg-slate-100 hover:bg-slate-200/80 rounded-full transition-colors text-slate-700">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth/Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1 p-1 bg-slate-100 hover:bg-slate-200/80 rounded-full pr-3 transition-colors"
                >
                  <span className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 max-w-[80px] truncate hidden sm:inline-block">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="h-3 w-3 text-slate-500 hidden sm:inline-block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-3">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs text-slate-400 font-medium">Logged in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-md">
                        {user.role}
                      </span>
                    </div>

                    <Link 
                      href="/dashboard" 
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>User Dashboard</span>
                    </Link>

                    {user.role !== 'USER' && (
                      <Link 
                        href="/admin" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <Grid className="h-4 w-4 text-accent" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <button 
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors border-t border-slate-50 mt-1 text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/auth" 
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-full shadow-md shadow-primary/20 hover:shadow-lg transition-all"
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-4 shadow-lg animate-in slide-in-from-top-5 w-full absolute left-0">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative w-full">
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 pl-10 pr-20 py-2 rounded-full border border-transparent focus:outline-none focus:bg-white focus:border-primary text-sm"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <button 
              type="button"
              onClick={handleAiSearch}
              className="absolute right-1.5 top-1 px-2.5 py-1 bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold rounded-full flex items-center gap-0.5"
            >
              <Sparkles className="h-3 w-3" />
              <span>AI</span>
            </button>
          </form>

          <div className="flex flex-col gap-3 font-medium text-slate-700">
            <Link href="/catalog" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary py-1 border-b border-slate-50">
              Shop Catalog
            </Link>
            <Link href="/prescription" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-full justify-center text-sm">
              <UploadCloud className="h-4 w-4" />
              <span>Upload Prescription</span>
            </Link>
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs font-semibold bg-slate-50 px-3 py-2 rounded-full">
              <PhoneCall className="h-3.5 w-3.5 text-accent" />
              <span>Hotline: {BRAND_CONFIG.hotline}</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
