'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { BRAND_CONFIG } from '../utils/brandConfig';
import { 
  FileText, 
  ShieldCheck, 
  Clock, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  Star, 
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Bot,
  Send,
  X,
  Plus,
  Search
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  genericName?: string;
  prescriptionRequired: boolean;
  price: number;
  discount: number;
  rating: number;
  ratingCount: number;
  image: string;
  category: string;
}

const CATEGORIES = [
  { name: "Prescription Medicines", description: "Rx Drugs & Antibiotics", icon: "💊", color: "from-blue-500/10 to-blue-500/5", border: "border-blue-100" },
  { name: "OTC Medicines", description: "Fever, Cold & Cough", icon: "🌡️", color: "from-sky-500/10 to-sky-500/5", border: "border-sky-100" },
  { name: "Diabetes Care", description: "Strips, Meters & Insulins", icon: "🩸", color: "from-red-500/10 to-red-500/5", border: "border-red-100" },
  { name: "Heart Care", description: "Statins & Blood Thinners", icon: "❤️", color: "from-rose-500/10 to-rose-500/5", border: "border-rose-100" },
  { name: "Ayurveda", description: "Ashwagandha & Herbs", icon: "🌿", color: "from-teal-500/10 to-teal-500/5", border: "border-teal-100" },
  { name: "Medical Devices", description: "BP & Pulse Monitors", icon: "🎛️", color: "from-emerald-500/10 to-emerald-500/5", border: "border-emerald-100" },
  { name: "Nutrition", description: "Protein & Supplements", icon: "🥛", color: "from-amber-500/10 to-amber-500/5", border: "border-amber-100" },
  { name: "Personal Care", description: "Creams, Facewash & Skin", icon: "🧴", color: "from-purple-500/10 to-purple-500/5", border: "border-purple-100" }
];

const ARTICLES = [
  { id: "art-1", title: "Managing Type-2 Diabetes: Diet & Care Guidelines", category: "Diabetes", readTime: "5 min read", date: "June 24, 2026", image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&auto=format&fit=crop&q=60" },
  { id: "art-2", title: "Why Evolutionary Adaptogens like Ashwagandha Reduce Stress", category: "Ayurveda", readTime: "4 min read", date: "June 20, 2026", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&auto=format&fit=crop&q=60" },
  { id: "art-3", title: "Understanding Blood Pressure Readings: Systolic vs Diastolic", category: "Heart Health", readTime: "7 min read", date: "June 15, 2026", image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&auto=format&fit=crop&q=60" }
];

export default function HomePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI Chat Assistant State
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; products?: Product[] }>>([
    { sender: 'bot', text: `Hello! I am your ${BRAND_CONFIG.shortName} AI Assistant. How can I help you today? You can describe your symptoms (e.g. "I have a dry cough and fever") to search for recommendations.` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Customer Reviews State
  const [reviews, setReviews] = useState([
    {
      id: 1,
      rating: 5,
      comment: "Finding my diabetes medicines in local shops was always a struggle. Medicloud makes refills automatic. My prescriptions are stored safely and they remind me before my pills run out.",
      name: "Robert Miller",
      title: "Diabetes Patient, Chicago",
      initials: "RM",
      bgColor: "bg-primary/10 text-primary"
    },
    {
      id: 2,
      rating: 5,
      comment: "The AI Search symptom analyzer is incredibly helpful. I asked about cholesterol drugs, it gave me clinical details, and allowed me to upload my doctor's note for immediate pharmacist validation.",
      name: "Emily Laurent",
      title: "Heart Patient, Austin",
      initials: "EL",
      bgColor: "bg-accent/10 text-accent"
    },
    {
      id: 3,
      rating: 5,
      comment: "Extremely fast and reliable. My pulse oximeter arrived within 16 hours. Excellent secure checkout, Stripe invoices are sent instantly, and support resolves queries in minutes.",
      name: "Jonathon Davis",
      title: "OTC Customer, Miami",
      initials: "JD",
      bgColor: "bg-purple-100 text-purple-600"
    }
  ]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    const initials = newReviewName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    const colors = [
      "bg-primary/10 text-primary",
      "bg-accent/10 text-accent",
      "bg-purple-100 text-purple-600",
      "bg-emerald-100 text-emerald-600",
      "bg-amber-100 text-amber-600"
    ];
    const randomColor = colors[reviews.length % colors.length];

    const newRev = {
      id: Date.now(),
      rating: newReviewRating,
      comment: newReviewComment,
      name: newReviewName,
      title: newReviewTitle || "Customer",
      initials: initials,
      bgColor: randomColor
    };

    setReviews(prev => [newRev, ...prev]);
    setNewReviewName('');
    setNewReviewTitle('');
    setNewReviewComment('');
    setNewReviewRating(5);
    setShowReviewForm(false);
  };

  // Fetch featured products
  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => {
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error("Invalid response or non-JSON content");
      })
      .then(data => {
        if (data.success) {
          // Select first 4 products as featured
          setFeaturedProducts(data.products.slice(0, 4));
        }
      })
      .catch(err => console.warn("Error loading products:", err))
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setSendingChat(true);

    try {
      const res = await fetch(`http://localhost:5000/api/products/search/ai?query=${encodeURIComponent(userText)}`);
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, { 
          sender: 'bot', 
          text: `${data.aiAnalysis}\n\n_${data.disclaimer}_`,
          products: data.suggestedProducts
        }]);
      } else {
        setChatMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I encountered an issue analyzing your query. Please consult a physical practitioner." }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: "Service connection timeout. Please verify backend state." }]);
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-teal-50/30 pt-10 pb-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                <Sparkles className="h-3 w-3" />
                <span>Next-Gen Premium Digital Pharmacy</span>
              </span>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-dark leading-tight">
                Trusted Healthcare <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Delivered To Your Doorstep
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {BRAND_CONFIG.subSlogan}
              </p>

              {/* In-hero Search Container */}
              <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto lg:mx-0 relative mt-4">
                <div className="flex flex-col sm:flex-row gap-2.5 p-1.5 bg-white shadow-xl rounded-2xl sm:rounded-full border border-slate-100">
                  <div className="relative flex-grow pl-4 py-2 sm:py-0 flex items-center">
                    <Search className="h-5 w-5 text-slate-400 shrink-0 mr-2" />
                    <input
                      type="text"
                      placeholder="Search Amoxicillin, Metformin, Dolo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent focus:outline-none text-sm text-dark placeholder-slate-400 w-full"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-6 py-3 rounded-xl sm:rounded-full transition-all shadow-md shadow-primary/20 shrink-0"
                  >
                    Search Catalog
                  </button>
                </div>

                {/* Popular Tags */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-3.5 text-xs text-slate-400 font-medium">
                  <span>Popular:</span>
                  <Link href="/catalog?search=Metformin" className="bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-full text-slate-600 transition-colors">Metformin</Link>
                  <Link href="/catalog?search=Amoxicillin" className="bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-full text-slate-600 transition-colors">Amoxicillin</Link>
                  <Link href="/catalog?search=Dolo" className="bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-full text-slate-600 transition-colors">Dolo 650</Link>
                  <Link href="/catalog?search=Ashwagandha" className="bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-full text-slate-600 transition-colors">Ashwagandha</Link>
                </div>
              </form>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <Link 
                  href="/catalog" 
                  className="px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full shadow-lg flex items-center gap-1.5 transition-all"
                >
                  <span>Shop Medicines</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link 
                  href="/prescription" 
                  className="px-7 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-full shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Upload Prescription</span>
                </Link>
              </div>
            </div>

            {/* Right Graphics Mockup (Apple/Stripe Premium look) */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-3xl blur-2xl -z-10 transform scale-95" />
              
              <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-6 max-w-sm mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><ShieldCheck className="h-5 w-5" /></span>
                    <span className="text-xs font-bold text-slate-700">Rx Verified Order</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">Active Refill</span>
                </div>

                <div className="flex gap-4">
                  <img 
                    src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&auto=format&fit=crop&q=60" 
                    alt="Medicine Pack" 
                    className="h-16 w-16 rounded-xl object-cover border border-slate-100 bg-slate-50"
                  />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">Metformin Glycomet 500mg</h4>
                    <p className="text-xs text-slate-400">Prescription Required</p>
                    <p className="text-xs font-bold text-primary">₹132.00 <span className="text-slate-400 line-through text-[10px]">₹150</span></p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Dosage Reminder</span>
                    <span className="text-slate-800 font-semibold">08:00 AM, 08:00 PM</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Delivery Estimate</span>
                    <span className="text-emerald-600 font-semibold">Tomorrow, 10:00 AM</span>
                  </div>
                </div>

                <Link href="/catalog" className="block text-center w-full py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent text-white text-xs font-bold rounded-xl transition-all shadow-md">
                  Express Checkout
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. TRUST BANNER (Licensed / Authentic) */}
      <section className="bg-slate-900 text-white py-8 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center space-y-1">
              <span className="h-10 w-10 rounded-full bg-slate-800 text-primary flex items-center justify-center mb-1"><ShieldCheck className="h-6 w-6" /></span>
              <h4 className="text-sm font-bold">100% Authentic</h4>
              <p className="text-[11px] text-slate-400">Direct from licensed suppliers</p>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <span className="h-10 w-10 rounded-full bg-slate-800 text-accent flex items-center justify-center mb-1"><Clock className="h-6 w-6" /></span>
              <h4 className="text-sm font-bold">Fast Home Delivery</h4>
              <p className="text-[11px] text-slate-400">Within 24-48 hours locally</p>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <span className="h-10 w-10 rounded-full bg-slate-800 text-amber-500 flex items-center justify-center mb-1"><FileText className="h-6 w-6" /></span>
              <h4 className="text-sm font-bold">Pharmacist Verified</h4>
              <p className="text-[11px] text-slate-400">Double-checked medical safety</p>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <span className="h-10 w-10 rounded-full bg-slate-800 text-emerald-500 flex items-center justify-center mb-1"><Lock className="h-6 w-6" /></span>
              <h4 className="text-sm font-bold">Secure Transactions</h4>
              <p className="text-[11px] text-slate-400">Stripe and Razorpay encrypted</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HEALTH CATEGORIES */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-extrabold text-dark tracking-tight">Browse Healthcare Categories</h2>
            <p className="text-slate-500 text-sm">Find chronic medications, home devices, and daily wellness nutrition essentials.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, idx) => (
              <Link 
                href={`/catalog?category=${encodeURIComponent(cat.name)}`} 
                key={idx}
                className={`group p-5 bg-gradient-to-br ${cat.color} rounded-2xl border ${cat.border} hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-36`}
              >
                <div className="text-3xl">{cat.icon}</div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors flex items-center gap-1">
                    <span>{cat.name}</span>
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1" />
                  </h4>
                  <p className="text-[11px] text-slate-400">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section className="py-16 bg-bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight flex items-center gap-2 justify-center sm:justify-start">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span>Trending Medicines & Wellness Products</span>
              </h2>
              <p className="text-slate-500 text-sm">Top-rated items and chronic disease control drugs recommended by medical reviews.</p>
            </div>
            <Link href="/catalog" className="text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 shrink-0">
              <span>View Full Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-4 h-80 space-y-4 animate-pulse">
                  <div className="w-full h-40 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-8 bg-slate-200 rounded-lg w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((prod) => (
                <div key={prod.id} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                  
                  {/* Top Image area */}
                  <div className="relative group p-4 bg-slate-50/50 flex items-center justify-center">
                    <img 
                      src={prod.image} 
                      alt={prod.name}
                      className="h-36 object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {prod.prescriptionRequired && (
                      <span className="absolute top-3 left-3 bg-red-50 text-danger text-[10px] font-bold px-2 py-0.5 rounded-md border border-red-100 flex items-center gap-1 shadow-sm">
                        <FileText className="h-3 w-3" />
                        <span>Rx Required</span>
                      </span>
                    )}

                    {prod.discount > 0 && (
                      <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {prod.discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{prod.brand}</p>
                      <Link href={`/catalog/${prod.id}`} className="block mt-0.5">
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1 hover:text-primary transition-colors">
                          {prod.name}
                        </h4>
                      </Link>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{prod.category}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2">
                      <div className="space-y-0.5">
                        <span className="text-xs text-slate-400 line-through">
                          {prod.discount > 0 ? `₹${prod.price.toFixed(2)}` : ''}
                        </span>
                        <p className="text-sm font-extrabold text-slate-800">
                          ₹{(prod.price - (prod.price * prod.discount) / 100).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>{prod.rating}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart({
                        id: prod.id,
                        name: prod.name,
                        brand: prod.brand,
                        price: prod.price,
                        discount: prod.discount,
                        image: prod.image,
                        category: prod.category,
                        prescriptionRequired: prod.prescriptionRequired
                      })}
                      className="w-full mt-3 py-2 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. HEALTH BLOG */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-extrabold text-dark tracking-tight">Health & Wellness Blog</h2>
            <p className="text-slate-500 text-sm">Read clinical articles and wellness advice verified by medical professionals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ARTICLES.map((art) => (
              <div key={art.id} className="bg-slate-50 rounded-2xl border border-slate-200/50 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
                <img 
                  src={art.image} 
                  alt={art.title} 
                  className="h-48 w-full object-cover bg-slate-200"
                />
                <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-md">{art.category}</span>
                      <span>{art.readTime}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 leading-snug">{art.title}</h4>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-3 text-[11px] text-slate-400">
                    <span>{art.date}</span>
                    <span className="text-primary font-semibold flex items-center gap-0.5 hover:underline cursor-pointer">
                      <span>Read Full</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS */}
      <section className="py-16 bg-bg-light border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-3xl font-extrabold text-dark tracking-tight">Customer Reviews</h2>
              <p className="text-slate-500 text-sm">Verified feedback from real patients and customers.</p>
            </div>
            <button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-md hover:bg-primary-hover transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Write a Review</span>
            </button>
          </div>

          {/* Submit Review Form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-10 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 max-w-xl mx-auto animate-[slideIn_0.3s_ease-out]">
              <h3 className="text-sm font-bold text-slate-800">Submit Your Experience</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Your Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    placeholder="e.g. Robert Miller"
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Condition or Tag</label>
                  <input 
                    type="text" 
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    placeholder="e.g. Heart Patient, Austin"
                    className="w-full bg-slate-50 border border-slate-200 text-xs p-2 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star className={`h-5 w-5 ${star <= newReviewRating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Your Review *</label>
                <textarea 
                  rows={3} 
                  required 
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Share your experience with our ordering system, AI symptom search, or delivery times..."
                  className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Post Review
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow animate-[slideIn_0.3s_ease-out]">
                <div className="space-y-3">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <span className={`h-9 w-9 rounded-full ${rev.bgColor} flex items-center justify-center font-bold text-xs`}>
                    {rev.initials}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{rev.name}</h5>
                    <p className="text-[10px] text-slate-400">{rev.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FLOATING AI HEALTH CHAT ASSISTANT */}
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {aiChatOpen ? (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-80 sm:w-96 h-[480px] flex flex-col justify-between overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-primary to-accent text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <div>
                    <h4 className="text-xs font-bold font-heading">{BRAND_CONFIG.name} AI Assistant</h4>
                    <p className="text-[9px] text-slate-100 opacity-90">Medical Guidance Support</p>
                  </div>
                </div>
                <button onClick={() => setAiChatOpen(false)} className="text-white/80 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Chat Message Box */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-200/60 rounded-tl-none shadow-sm'
                    }`}>
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {/* AI Search Suggested Products */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="mt-3.5 pt-2.5 border-t border-slate-100 space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Suggested Medication:</p>
                          {msg.products.map(p => (
                            <div key={p.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <img src={p.image} className="h-8 w-8 object-cover rounded" alt={p.name} />
                              <div className="flex-grow min-w-0">
                                <h5 className="text-[11px] font-bold text-slate-700 truncate">{p.name}</h5>
                                <span className="text-[9px] text-slate-400">₹{p.price}</span>
                              </div>
                              <button 
                                onClick={() => addToCart({
                                  id: p.id,
                                  name: p.name,
                                  brand: p.brand,
                                  price: p.price,
                                  discount: p.discount,
                                  image: p.image,
                                  category: p.category,
                                  prescriptionRequired: p.prescriptionRequired
                                })}
                                className="p-1 bg-primary text-white rounded-full hover:bg-primary-hover shrink-0"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {sendingChat && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs pl-2">
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span>AI checking symptoms...</span>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={sendChatMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2">
                <input
                  type="text"
                  placeholder="Describe your cold, fever, diabetes query..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="bg-slate-50 text-xs px-3 py-2.5 rounded-full border border-slate-100 focus:bg-white focus:border-primary focus:outline-none flex-grow"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || sendingChat}
                  className="bg-primary hover:bg-primary-hover text-white p-2.5 rounded-full shadow-md shadow-primary/10 transition-colors shrink-0 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAiChatOpen(true)}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent text-white p-4 rounded-full shadow-2xl flex items-center gap-2 hover:shadow-primary/30 transition-all border border-white/20"
            >
              <Bot className="h-6 w-6 animate-pulse" />
              <span className="text-xs font-bold font-heading pr-1">AI Health Chat</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
