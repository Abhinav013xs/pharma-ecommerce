'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation.js';
import { useCart } from '../../context/CartContext';
import { 
  Filter, 
  Search, 
  Star, 
  RotateCcw, 
  FileText,
  AlertCircle,
  Plus
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

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  // State values
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [prescriptionRequired, setPrescriptionRequired] = useState<boolean | null>(null);
  const [sort, setSort] = useState('popularity');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const categories = [
    "Prescription Medicines",
    "OTC Medicines",
    "Personal Care",
    "Diabetes Care",
    "Heart Care",
    "Baby Care",
    "Nutrition",
    "Vitamins",
    "Ayurveda",
    "Medical Devices"
  ];

  // Sync state with URL search params when they change
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  // Fetch from backend
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = `?sort=${sort}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (selectedCategory) query += `&category=${encodeURIComponent(selectedCategory)}`;
      if (prescriptionRequired !== null) query += `&prescription=${prescriptionRequired}`;
      if (minPrice) query += `&minPrice=${minPrice}`;
      if (maxPrice) query += `&maxPrice=${maxPrice}`;

      const res = await fetch(`http://localhost:5000/api/products${query}`);
      const data = await res.json();
      
      if (data.success) {
        setProducts(data.products);
      } else {
        setError("Failed to fetch matching medical catalog items.");
      }
    } catch (err) {
      setError("Unable to connect to healthcare inventory servers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams, selectedCategory, prescriptionRequired, sort]);

  const handleApplyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setPrescriptionRequired(null);
    setMinPrice('');
    setMaxPrice('');
    setSort('popularity');
    router.push('/catalog');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-dark tracking-tight">Medicine & Healthcare Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">Browse and filter verified pharmaceutical stock.</p>
        </div>

        {/* Sort drop downs */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold shrink-0">Sort By:</span>
          <select 
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary"
          >
            <option value="popularity">Popularity</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Filter Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
            
            {/* Filter Title */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                <Filter className="h-4.5 w-4.5 text-primary" />
                <span>Filters</span>
              </span>
              <button 
                onClick={handleResetFilters}
                className="text-[11px] text-slate-400 hover:text-danger font-semibold flex items-center gap-0.5"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Keyword Search Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search Keyword</label>
              <form onSubmit={(e) => { e.preventDefault(); fetchProducts(); }} className="relative">
                <input
                  type="text"
                  placeholder="Enter name, generic..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white text-xs pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:border-primary"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </form>
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categories</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === '' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === cat ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Prescription Warning Filters */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prescription Status</label>
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="prescription"
                    checked={prescriptionRequired === null}
                    onChange={() => setPrescriptionRequired(null)}
                    className="accent-primary"
                  />
                  <span>Show All</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="prescription"
                    checked={prescriptionRequired === true}
                    onChange={() => setPrescriptionRequired(true)}
                    className="accent-primary"
                  />
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-danger shrink-0" />
                    <span>Rx Only</span>
                  </span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="radio"
                    name="prescription"
                    checked={prescriptionRequired === false}
                    onChange={() => setPrescriptionRequired(false)}
                    className="accent-primary"
                  />
                  <span>OTC (No Rx)</span>
                </label>
              </div>
            </div>

            {/* Price Filter range */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price Range (₹)</label>
              <form onSubmit={handleApplyPriceFilter} className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none w-full text-center"
                />
                <span className="text-slate-400 self-center">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none w-full text-center"
                />
                <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 rounded-lg">Go</button>
              </form>
            </div>

          </div>
        </aside>

        {/* Right Side: Products Grid */}
        <section className="lg:col-span-9">
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-4 h-80 space-y-4 animate-pulse">
                  <div className="w-full h-40 bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-8 bg-slate-100 rounded-lg w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
              <AlertCircle className="h-10 w-10 text-danger mx-auto" />
              <h3 className="font-bold text-slate-800">Connection Error</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">{error}</p>
              <button onClick={fetchProducts} className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-md mt-2">
                Retry Connection
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/60 shadow-sm space-y-2">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-800">No Products Found</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">We couldn't find any medications matching your filter selections.</p>
              <button onClick={handleResetFilters} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg mt-2">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div key={prod.id} className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                  
                  {/* Image wrapper */}
                  <div className="relative p-4 bg-slate-50/50 flex items-center justify-center h-44 shrink-0">
                    <img 
                      src={prod.image} 
                      alt={prod.name}
                      className="h-36 object-contain mix-blend-multiply hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => router.push(`/catalog/${prod.id}`)}
                    />
                    
                    {prod.prescriptionRequired && (
                      <span className="absolute top-3 left-3 bg-red-50 text-danger text-[10px] font-bold px-2 py-0.5 rounded-md border border-red-100 flex items-center gap-1 shadow-sm">
                        <FileText className="h-3 w-3" />
                        <span>Rx Required</span>
                      </span>
                    )}

                    {prod.discount > 0 && (
                      <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {prod.discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                    <div>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">{prod.brand}</p>
                      <h4 
                        onClick={() => router.push(`/catalog/${prod.id}`)}
                        className="text-sm font-bold text-slate-800 line-clamp-2 hover:text-primary transition-colors cursor-pointer"
                      >
                        {prod.name}
                      </h4>
                      {prod.genericName && (
                        <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">({prod.genericName})</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 line-through">
                          {prod.discount > 0 ? `₹${prod.price.toFixed(2)}` : ''}
                        </span>
                        <p className="text-sm font-extrabold text-slate-800">
                          ₹{(prod.price - (prod.price * prod.discount) / 100).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-md">
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
                      className="w-full py-2 bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </section>
      </div>

    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-sm text-slate-400">Loading catalog layout components...</p>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
