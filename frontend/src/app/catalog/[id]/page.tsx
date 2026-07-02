'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation.js';
import { useCart } from '../../../context/CartContext';
import { 
  Star, 
  ShoppingBag, 
  ChevronRight, 
  UploadCloud, 
  Heart, 
  Share2, 
  FileText,
  AlertTriangle,
  Info,
  Check
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  genericName?: string;
  manufacturer?: string;
  composition?: string;
  uses?: string;
  benefits?: string;
  dosage?: string;
  sideEffects?: string;
  warnings?: string;
  drugInteractions?: string;
  storageInfo?: string;
  prescriptionRequired: boolean;
  price: number;
  discount: number;
  rating: number;
  ratingCount: number;
  image: string;
  category: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'uses' | 'safety' | 'warnings'>('uses');
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadProductData = async () => {
      try {
        setLoading(true);
        // Load active product details
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to load product detail. Status: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
          
          // Load other items in the same category
          const catRes = await fetch(`http://localhost:5000/api/products?category=${encodeURIComponent(data.product.category)}`);
          if (catRes.ok) {
            const catData = await catRes.json();
            if (catData.success) {
              // Filter out current product and grab up to 3 similar items
              setSimilarProducts(catData.products.filter((p: Product) => p.id !== id).slice(0, 3));
            }
          }
        }
      } catch (err) {
        console.warn("Error loading product detail:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      discount: product.discount,
      image: product.image,
      category: product.category,
      prescriptionRequired: product.prescriptionRequired
    }, quantity);
    
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      discount: product.discount,
      image: product.image,
      category: product.category,
      prescriptionRequired: product.prescriptionRequired
    }, quantity);
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Retrieving medical composition data...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-danger mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800 font-heading">Product Not Found</h2>
        <p className="text-slate-500 text-sm">The medicine details are missing or the item was removed from inventory.</p>
        <button onClick={() => router.push('/catalog')} className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-lg shadow">
          Return to Catalog
        </button>
      </div>
    );
  }

  const finalPrice = product.price - (product.price * product.discount) / 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-8 font-medium">
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>Home</span>
        <ChevronRight className="h-3 w-3" />
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/catalog')}>Catalog</span>
        <ChevronRight className="h-3 w-3" />
        <span className="hover:underline cursor-pointer" onClick={() => router.push(`/catalog?category=${encodeURIComponent(product.category)}`)}>{product.category}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-600 truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        
        {/* Left Side: Product Image Display */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full bg-white rounded-3xl border border-slate-200/60 p-8 flex items-center justify-center h-96 relative shadow-sm">
            <img 
              src={product.image} 
              alt={product.name} 
              className="h-72 object-contain mix-blend-multiply"
            />
            {product.prescriptionRequired && (
              <span className="absolute top-4 left-4 bg-red-50 text-danger text-xs font-bold px-3 py-1 rounded-lg border border-red-100 flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Prescription Required</span>
              </span>
            )}
            
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button 
                onClick={() => setWishlistAdded(!wishlistAdded)}
                className={`p-2.5 rounded-full border shadow-sm transition-colors ${
                  wishlistAdded ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                }`}
              >
                <Heart className={`h-4.5 w-4.5 ${wishlistAdded ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm">
                <Share2 className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
          
          <div className="mt-4 p-4.5 bg-sky-50 border border-sky-100/50 rounded-2xl w-full flex items-start gap-2.5">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Storage Note:</strong> {product.storageInfo || "Store in a cool dry place below 30°C. Keep away from direct sunlight and moisture."}
            </p>
          </div>
        </div>

        {/* Right Side: Product Details & Cart controls */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{product.brand}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading leading-tight">{product.name}</h1>
            
            {product.genericName && (
              <p className="text-xs text-slate-500 font-medium italic">Generic Composition: {product.genericName}</p>
            )}
            {product.manufacturer && (
              <p className="text-xs text-slate-400">Manufacturer: {product.manufacturer}</p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-500 text-sm font-bold bg-amber-50 px-2.5 py-1 rounded-lg">
              <Star className="h-4 w-4 fill-current" />
              <span>{product.rating}</span>
            </div>
            <span className="text-xs text-slate-400">({product.ratingCount} user ratings & reviews)</span>
          </div>

          {/* Price details */}
          <div className="p-5 bg-white border border-slate-200/60 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900">₹{finalPrice.toFixed(2)}</span>
              {product.discount > 0 && (
                <>
                  <span className="text-sm text-slate-400 line-through">MRP ₹{product.price.toFixed(2)}</span>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                    {product.discount}% discount applied
                  </span>
                </>
              )}
            </div>

            <p className="text-[10px] text-slate-400 leading-none">Inclusive of all local taxes & GST.</p>
          </div>

          {/* Prescription Warning Box */}
          {product.prescriptionRequired && (
            <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-danger">Prescription Needed</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  This medication is classified as Rx-only. To purchase, you must upload a doctor-signed note during checkout. A certified pharmacist will review the upload.
                </p>
                <Link href="/prescription" className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline pt-1">
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Verify prescription now</span>
                </Link>
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shrink-0">
              <button 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="px-3 py-2 text-slate-500 hover:bg-slate-100 font-bold text-sm"
              >
                -
              </button>
              <span className="px-5 py-2 font-bold text-sm text-slate-800">{quantity}</span>
              <button 
                onClick={() => setQuantity(prev => prev + 1)}
                className="px-3 py-2 text-slate-500 hover:bg-slate-100 font-bold text-sm"
              >
                +
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={handleAddToCart}
                className={`py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all ${
                  cartAdded 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm'
                }`}
              >
                {cartAdded ? <Check className="h-4.5 w-4.5" /> : <ShoppingBag className="h-4.5 w-4.5" />}
                <span>{cartAdded ? 'Added!' : 'Add to Cart'}</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-lg transition-all text-center"
              >
                Buy Now
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs Area for Medical Information */}
      <div className="border-b border-slate-200 mb-6 flex gap-4">
        <button
          onClick={() => setActiveTab('uses')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'uses' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Uses & Benefits
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'safety' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Side Effects & Dosage
        </button>
        <button
          onClick={() => setActiveTab('warnings')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'warnings' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Safety Warnings
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm mb-16 min-h-48 text-xs leading-relaxed text-slate-600 space-y-4">
        {activeTab === 'uses' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Primary Indications</h4>
              <p>{product.uses || "Indications are not fully defined. Take as prescribed by your practitioner."}</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Therapeutic Benefits</h4>
              <p>{product.benefits || "Provides target physiological relief based on direct composition components."}</p>
            </div>
            {product.composition && (
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">Active Composition</h4>
                <p>{product.composition}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Possible Side Effects</h4>
              <p>{product.sideEffects || "Mild nausea, headache, or stomach discomfort. Report critical details to your physician."}</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">General Dosage Directions</h4>
              <p>{product.dosage || "To be consumed exactly as advised by the prescribing doctor."}</p>
            </div>
          </div>
        )}

        {activeTab === 'warnings' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-danger text-sm mb-1">Critical Precautions</h4>
              <p>{product.warnings || "Read the container manual instructions carefully before consumption."}</p>
            </div>
            {product.drugInteractions && (
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">Known Drug Interactions</h4>
                <p>{product.drugInteractions}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related Products Carousel Section */}
      {similarProducts.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xl font-bold text-slate-800 font-heading mb-6">Related Healthcare Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {similarProducts.map((p) => (
              <div 
                key={p.id}
                onClick={() => router.push(`/catalog/${p.id}`)}
                className="bg-white rounded-2xl border border-slate-200/60 p-4 hover:shadow-md transition-shadow cursor-pointer flex gap-4 items-center"
              >
                <img src={p.image} className="h-16 w-16 object-contain shrink-0 mix-blend-multiply" alt={p.name} />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{p.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{p.brand}</p>
                  <p className="text-xs font-bold text-primary mt-1">₹{(p.price - (p.price * p.discount) / 100).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
