'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation.js';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { 
  MapPin, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  FileText,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Truck
} from 'lucide-react';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface Prescription {
  id: string;
  fileUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { 
    cart, 
    coupon, 
    total, 
    prescriptionRequired, 
    deliverySlot, 
    setDeliverySlot,
    clearCart 
  } = useCart();

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });

  // Prescription State
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('');

  // General Page state
  const [paymentMethod, setPaymentMethod] = useState('STRIPE');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Redirect if guest
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user]);

  // Load User Addresses and Prescriptions
  const loadAddressAndPrescriptions = async () => {
    if (!token) return;
    try {
      // 1. Fetch addresses
      const addrRes = await fetch('http://localhost:5000/api/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const addrData = await addrRes.json();
      if (addrData.success) {
        setAddresses(addrData.addresses);
        // Pre-select default address if exists
        const defaultAddr = addrData.addresses.find((a: Address) => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        else if (addrData.addresses.length > 0) setSelectedAddressId(addrData.addresses[0].id);
      }

      // 2. Fetch approved prescriptions
      const prescRes = await fetch('http://localhost:5000/api/prescriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const prescData = await prescRes.json();
      if (prescData.success) {
        // Filter only approved ones for linking
        const approved = prescData.prescriptions.filter((p: Prescription) => p.status === 'APPROVED');
        setPrescriptions(approved);
        if (approved.length > 0) setSelectedPrescriptionId(approved[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) {
      loadAddressAndPrescriptions();
    }
  }, [token]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(prev => [...prev, data.address]);
        setSelectedAddressId(data.address.id);
        setShowAddressForm(false);
        setNewAddress({ label: 'Home', street: '', city: '', state: '', zipCode: '', isDefault: false });
      }
    } catch (err) {
      console.error("Failed to add address:", err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setCheckoutError("Please select a delivery address.");
      return;
    }

    if (prescriptionRequired && !selectedPrescriptionId) {
      setCheckoutError("Prescription-required items are in your cart. You must select an APPROVED prescription.");
      return;
    }

    setPlacingOrder(true);
    setCheckoutError(null);

    const orderPayload = {
      items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
      addressId: selectedAddressId,
      prescriptionId: prescriptionRequired ? selectedPrescriptionId : null,
      paymentMethod,
      deliverySlot
    };

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();

      if (data.success) {
        const orderId = data.order.id;

        // If online payment, simulate payment success verification callback
        if (paymentMethod === 'STRIPE' || paymentMethod === 'RAZORPAY') {
          const payRes = await fetch(`http://localhost:5000/api/orders/${orderId}/pay`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ paymentId: `ch_mock_${Math.random().toString(36).substr(2, 9)}` })
          });
          const payData = await payRes.json();
          if (!payData.success) {
            router.push(`/checkout/failure?orderId=${orderId}`);
            setPlacingOrder(false);
            return;
          }
        }

        clearCart();
        router.push(`/checkout/success?orderId=${orderId}`);
      } else {
        setCheckoutError(data.error || "Failed to submit order checkout.");
      }
    } catch (err) {
      setCheckoutError("Connection error while completing checkout. Try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const deliverySlots = [
    "Tomorrow, 9 AM - 1 PM",
    "Tomorrow, 2 PM - 6 PM",
    "Day After, 9 AM - 1 PM",
    "Day After, 2 PM - 6 PM"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <h1 className="text-3xl font-extrabold text-slate-900 font-heading mb-8">Secure E-Commerce Checkout</h1>

      {checkoutError && (
        <div className="p-4 bg-red-50 border border-red-100 text-danger text-sm font-semibold rounded-2xl mb-6 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{checkoutError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Columns: Checkout Sections */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. Address Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Select Shipping Address</span>
            </h3>

            {addresses.length === 0 ? (
              <p className="text-xs text-slate-400">No delivery addresses configured. Add one below.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((a) => (
                  <label 
                    key={a.id} 
                    className={`p-4 rounded-2xl border cursor-pointer flex gap-3 transition-all ${
                      selectedAddressId === a.id 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedAddress"
                      checked={selectedAddressId === a.id}
                      onChange={() => setSelectedAddressId(a.id)}
                      className="accent-primary shrink-0 mt-1"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-700 block mb-0.5">{a.label}</span>
                      <p className="text-slate-500 leading-normal">{a.street}</p>
                      <p className="text-slate-500">{a.city}, {a.state} - {a.zipCode}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Add Address button */}
            {!showAddressForm ? (
              <button 
                onClick={() => setShowAddressForm(true)}
                className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline pt-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add new shipping address</span>
              </button>
            ) : (
              <form onSubmit={handleAddAddress} className="border border-slate-200 p-4 rounded-2xl space-y-4 bg-slate-50">
                <h4 className="text-xs font-bold text-slate-700">New Address Details</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="Flat, Building, Street details"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg w-full focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">City</label>
                    <input
                      type="text"
                      required
                      placeholder="Springfield"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg w-full focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">State</label>
                    <input
                      type="text"
                      required
                      placeholder="Illinois"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg w-full focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Zip Code</label>
                    <input
                      type="text"
                      required
                      placeholder="62704"
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                      className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg w-full focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Address Type</label>
                    <select
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg w-full focus:outline-none focus:border-primary font-medium text-slate-700"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button 
                    type="button" 
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg shadow-md shadow-primary/10"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 2. Prescription Validation Link (Mandatory if rxRequired) */}
          {prescriptionRequired && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-danger" />
                <span>Link Verified Prescription</span>
              </h3>

              {prescriptions.length === 0 ? (
                <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl space-y-3">
                  <p className="text-xs text-slate-600 leading-normal">
                    No approved prescriptions found on your account. To proceed, please upload a prescription document first and wait for pharmacist validation.
                  </p>
                  <button 
                    onClick={() => router.push('/prescription')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow"
                  >
                    Upload Prescription File
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">Select one of your previously approved prescriptions to link to this order:</p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {prescriptions.map((pr) => (
                      <label 
                        key={pr.id}
                        className={`p-3.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                          selectedPrescriptionId === pr.id 
                            ? 'border-emerald-500 bg-emerald-50/50' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="selectedPresc"
                            checked={selectedPrescriptionId === pr.id}
                            onChange={() => setSelectedPrescriptionId(pr.id)}
                            className="accent-emerald-600 shrink-0"
                          />
                          <div className="text-xs">
                            <span className="font-bold text-slate-700 block">Rx Document ID: {pr.id}</span>
                            <span className="text-[10px] text-slate-400">Approved: {new Date(pr.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">Verified</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Delivery Slot Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Truck className="h-5 w-5 text-accent" />
              <span>Select Delivery Slot</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deliverySlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => setDeliverySlot(slot)}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all text-left ${
                    deliverySlot === slot 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Calendar className="h-4 w-4 inline mr-1.5 shrink-0" />
                  <span>{slot}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Payment Options */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-slate-700" />
              <span>Select Payment Method</span>
            </h3>

            <div className="space-y-2.5">
              <label className={`p-3.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                paymentMethod === 'STRIPE' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payOpt"
                    checked={paymentMethod === 'STRIPE'}
                    onChange={() => setPaymentMethod('STRIPE')}
                    className="accent-primary"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">Stripe Gateway</span>
                    <span className="text-[10px] text-slate-400">Credit, Debit card, and Apple Pay secure mock.</span>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded border">Stripe</span>
              </label>

              <label className={`p-3.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                paymentMethod === 'RAZORPAY' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payOpt"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="accent-primary"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">Razorpay / Net Banking</span>
                    <span className="text-[10px] text-slate-400">UPI, Net Banking, and GPay mockup.</span>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded border">Razorpay</span>
              </label>

              <label className={`p-3.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payOpt"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-primary"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">Cash on Delivery (COD)</span>
                    <span className="text-[10px] text-slate-400">Pay cash/card to courier upon medicine delivery.</span>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded border">COD</span>
              </label>
            </div>
          </div>

        </div>

        {/* Right Columns: Totals Block */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Checkout Totals</h3>
            
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[70%]">{item.name} (x{item.quantity})</span>
                  <span>₹{((item.price - (item.price * item.discount / 100)) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-700">Grand Total</span>
              <span className="text-2xl font-extrabold text-primary">₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || (prescriptionRequired && prescriptions.length === 0)}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {placingOrder ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-4.5 w-4.5" />
                  <span>Place & Pay Order</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              By placing the order you agree to our standard healthcare return terms.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
