'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation.js';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  FileText, 
  AlertTriangle,
  UserCheck,
  Check,
  X,
  RefreshCw,
  Truck,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface Metrics {
  totalSales: number;
  totalOrders: number;
  pendingPrescriptions: number;
  totalUsers: number;
  lowStockCount: number;
  recentOrders: Array<{
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    user?: {
      name: string;
      email: string;
    } | null;
  }>;
}

interface PendingPrescription {
  id: string;
  fileUrl: string;
  status: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    phone: string | null;
  } | null;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  deliveryPartner?: string | null;
  trackingId?: string | null;
  user?: {
    name: string;
  } | null;
}

interface LowStockProduct {
  id: string;
  name: string;
  brand: string;
  stockCount: number;
  category: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token } = useAuth();

  // Navigation state
  const [activePanel, setActivePanel] = useState<'metrics' | 'prescriptions' | 'orders' | 'inventory'>('metrics');

  // API Data states
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [pendingPresc, setPendingPresc] = useState<PendingPrescription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Pharmacist review states
  const [reviewingPrescId, setReviewingPrescId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Redirect if not admin/pharmacist
  useEffect(() => {
    if (!user || user.role === 'USER') {
      router.push('/');
    }
  }, [user]);

  const loadAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Fetch metrics overview
      const metRes = await fetch('http://localhost:5000/api/admin/metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const metData = await metRes.json();
      if (metData.success) setMetrics(metData.metrics);

      // 2. Fetch pending prescriptions
      const prescRes = await fetch('http://localhost:5000/api/prescriptions/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const prescData = await prescRes.json();
      if (prescData.success) setPendingPresc(prescData.prescriptions);

      // 3. Fetch all orders
      const orderRes = await fetch('http://localhost:5000/api/orders/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const orderData = await orderRes.json();
      if (orderData.success) setOrders(orderData.orders);

      // 4. Fetch low stock products
      const invRes = await fetch('http://localhost:5000/api/admin/inventory-report', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const invData = await invRes.json();
      if (invData.success) setLowStock(invData.lowStockProducts);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAdminData();
    }
  }, [token]);

  // Pharmacist Verification Submits
  const handleVerifyPrescription = async (prescId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!token || reviewSubmitting) return;
    setReviewSubmitting(true);

    try {
      const res = await fetch(`http://localhost:5000/api/prescriptions/${prescId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes: reviewNotes })
      });
      const data = await res.json();
      if (data.success) {
        setReviewingPrescId(null);
        setReviewNotes('');
        loadAdminData(); // Refresh datasets
      }
    } catch (err) {
      console.error("Prescription review failed:", err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Order Delivery status updates
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, deliveryPartner?: string, trackingId?: string) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          deliveryPartner,
          trackingId
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { 
          ...o, 
          status: newStatus, 
          deliveryPartner: deliveryPartner || o.deliveryPartner,
          trackingId: trackingId || o.trackingId
        } : o));
      }
    } catch (e) {
      console.warn("Logistics status update failed:", e);
    }
  };

  if (!user || user.role === 'USER') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar panels navigation */}
        <aside className="w-full lg:w-60 shrink-0 bg-white border border-slate-200/60 rounded-3xl p-5 space-y-6 shadow-sm">
          
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-heading font-extrabold text-slate-800 text-sm">Control Console</h3>
            <p className="text-[10px] text-slate-400">Manage pharmacists reviews & logistics</p>
          </div>

          <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
            <button 
              onClick={() => setActivePanel('metrics')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                activePanel === 'metrics' ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="h-4.5 w-4.5" />
              <span>Metrics Overview</span>
            </button>

            <button 
              onClick={() => setActivePanel('prescriptions')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                activePanel === 'prescriptions' ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'hover:bg-slate-50'
              }`}
            >
              <FileText className="h-4.5 w-4.5" />
              <span>Prescription Approvals ({pendingPresc.length})</span>
            </button>

            <button 
              onClick={() => setActivePanel('orders')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                activePanel === 'orders' ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <span>Deliveries & Orders</span>
            </button>

            <button 
              onClick={() => setActivePanel('inventory')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                activePanel === 'inventory' ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="h-4.5 w-4.5" />
              <span>Inventory Logs ({lowStock.length})</span>
            </button>
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs">
            <span className="text-slate-400">Data Fetch Sync</span>
            <button onClick={loadAdminData} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
              <RefreshCw className="h-4.5 w-4.5" />
            </button>
          </div>
        </aside>

        {/* Console Workspace Area */}
        <section className="flex-grow w-full bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm min-h-[500px] relative">
          
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* PANEL 1: Metrics Overview */}
          {activePanel === 'metrics' && metrics && (
            <div className="space-y-8">
              <h2 className="text-xl font-extrabold text-slate-800 font-heading mb-6">Real-Time Metrics Overview</h2>
              
              {/* Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 border rounded-2xl space-y-1">
                  <DollarSign className="h-6 w-6 text-primary" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Revenue</span>
                  <p className="text-lg font-extrabold text-slate-800">₹{metrics.totalSales.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-slate-50 border rounded-2xl space-y-1">
                  <ShoppingBag className="h-6 w-6 text-accent" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Placed Orders</span>
                  <p className="text-lg font-extrabold text-slate-800">{metrics.totalOrders}</p>
                </div>
                <div className="p-4 bg-slate-50 border rounded-2xl space-y-1">
                  <FileText className="h-6 w-6 text-danger" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Review</span>
                  <p className="text-lg font-extrabold text-slate-800">{metrics.pendingPrescriptions}</p>
                </div>
                <div className="p-4 bg-slate-50 border rounded-2xl space-y-1">
                  <Users className="h-6 w-6 text-emerald-600" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Active Patients</span>
                  <p className="text-lg font-extrabold text-slate-800">{metrics.totalUsers}</p>
                </div>
              </div>

              {/* Recent Orders table */}
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-bold text-slate-700">Recent Transactions</h3>
                <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
                  <table className="min-w-full text-xs text-slate-500 divide-y divide-slate-100">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left">Order ID</th>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Amount</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {metrics.recentOrders.map(o => (
                        <tr key={o.id}>
                          <td className="px-4 py-3 font-bold text-slate-700">{o.id}</td>
                          <td className="px-4 py-3">{o.user ? o.user.name : 'Guest'}</td>
                          <td className="px-4 py-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-semibold">₹{o.totalAmount.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-600">{o.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PANEL 2: Prescription approvals pharmacist panel */}
          {activePanel === 'prescriptions' && (
            <div className="space-y-6">
              <h2 className="text-xl font-extrabold text-slate-800 font-heading mb-4">Pharmacist Review Console</h2>
              
              {pendingPresc.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-1">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-700">All Prescriptions Verified</p>
                  <p className="text-[10px]">Pending review queue is completely empty.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingPresc.map(pr => (
                    <div key={pr.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-4 shadow-sm flex flex-col justify-between">
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Doc Reference</span>
                            <h4 className="text-xs font-bold text-slate-700">{pr.id}</h4>
                          </div>
                          <span className="text-[10px] text-slate-400">{new Date(pr.createdAt).toLocaleDateString()}</span>
                        </div>

                        {pr.user && (
                          <div className="text-[11px] text-slate-500 leading-normal">
                            <p><strong>Patient:</strong> {pr.user.name}</p>
                            <p><strong>Email:</strong> {pr.user.email}</p>
                            {pr.user.phone && <p><strong>Phone:</strong> {pr.user.phone}</p>}
                          </div>
                        )}
                        
                        <a 
                          href={`http://localhost:5000${pr.fileUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-block text-xs text-primary hover:underline font-semibold"
                        >
                          View Uploaded Prescription File
                        </a>
                      </div>

                      {reviewingPrescId === pr.id ? (
                        <div className="space-y-3 pt-3 border-t border-slate-200">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Verification Review Notes</label>
                          <textarea
                            rows={2}
                            placeholder="Approval remarks or reason for rejection..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-xs p-2 rounded-lg focus:outline-none focus:border-primary"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerifyPrescription(pr.id, 'APPROVED')}
                              disabled={reviewSubmitting}
                              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm disabled:opacity-50"
                            >
                              <Check className="h-4 w-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleVerifyPrescription(pr.id, 'REJECTED')}
                              disabled={reviewSubmitting}
                              className="px-4 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => { setReviewingPrescId(null); setReviewNotes(''); }}
                              className="px-3 py-1.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewingPrescId(pr.id)}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                        >
                          <UserCheck className="h-4 w-4" />
                          <span>Initiate Verification Review</span>
                        </button>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PANEL 3: Deliveries & Orders list */}
          {activePanel === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-extrabold text-slate-800 font-heading mb-4">Orders & Deliveries Log</h2>
              
              {orders.length === 0 ? (
                <p className="text-xs text-slate-400">No orders registered on system databases.</p>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
                  <table className="min-w-full text-xs text-slate-500 divide-y divide-slate-100">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left">Order ID</th>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-left">Amount</th>
                        <th className="px-4 py-3 text-left">Payment</th>
                        <th className="px-4 py-3 text-left">Delivery Status</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td className="px-4 py-3 font-bold text-slate-700">{o.id}</td>
                          <td className="px-4 py-3">{o.user ? o.user.name : 'Unknown'}</td>
                          <td className="px-4 py-3 font-semibold">₹{o.totalAmount.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              o.paymentStatus === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>{o.paymentStatus}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              o.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                              o.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600' :
                              o.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                            }`}>{o.status}</span>
                            {o.deliveryPartner && (
                              <div className="text-[10px] text-slate-400 mt-1 space-y-0.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100 max-w-[160px]">
                                <div><strong>Carrier:</strong> {o.deliveryPartner}</div>
                                <div className="truncate"><strong>Tracking:</strong> <code className="text-primary font-mono">{o.trackingId}</code></div>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5 items-center">
                              {o.status === 'PROCESSING' && (
                                <div className="flex flex-col gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl w-full max-w-[200px]">
                                  <div className="text-[9px] font-bold text-slate-400 uppercase">Logistics Setup</div>
                                  <select 
                                    id={`partner-${o.id}`}
                                    className="bg-white border border-slate-200 text-[10px] p-1 rounded-md focus:outline-none"
                                    defaultValue="Delhivery"
                                  >
                                    <option value="Delhivery">Delhivery</option>
                                    <option value="Blue Dart">Blue Dart</option>
                                    <option value="FedEx">FedEx</option>
                                    <option value="DHL Express">DHL Express</option>
                                    <option value="Medicloud Express">Medicloud Express</option>
                                  </select>
                                  <input 
                                    id={`tracking-${o.id}`}
                                    type="text" 
                                    placeholder="Tracking ID"
                                    defaultValue={`MC-TRK-${Math.floor(100000 + Math.random() * 900000)}`}
                                    className="bg-white border border-slate-200 text-[10px] p-1 rounded-md focus:outline-none font-mono"
                                  />
                                  <button 
                                    onClick={() => {
                                      const partnerSelect = document.getElementById(`partner-${o.id}`) as HTMLSelectElement;
                                      const trackingInput = document.getElementById(`tracking-${o.id}`) as HTMLInputElement;
                                      handleUpdateOrderStatus(o.id, 'SHIPPED', partnerSelect.value, trackingInput.value);
                                    }}
                                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Truck className="h-3 w-3" />
                                    <span>Assign & Ship</span>
                                  </button>
                                </div>
                              )}
                              {o.status === 'SHIPPED' && (
                                <button 
                                  onClick={() => handleUpdateOrderStatus(o.id, 'DELIVERED')}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Mark Delivered</span>
                                </button>
                              )}
                              {o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && (
                                <button 
                                  onClick={() => handleUpdateOrderStatus(o.id, 'CANCELLED')}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-danger rounded-lg font-bold transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PANEL 4: Inventory logs */}
          {activePanel === 'inventory' && (
            <div className="space-y-6">
              <h2 className="text-xl font-extrabold text-slate-800 font-heading mb-4">Low-Stock Warnings Log</h2>
              
              {lowStock.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-1">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-700">Stock Levels Healthy</p>
                  <p className="text-[10px]">All inventory products have sufficient stock levels.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
                  <table className="min-w-full text-xs text-slate-500 divide-y divide-slate-100">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left">Product Name</th>
                        <th className="px-4 py-3 text-left">Brand</th>
                        <th className="px-4 py-3 text-left">Category</th>
                        <th className="px-4 py-3 text-left">Current Stock</th>
                        <th className="px-4 py-3 text-left">Status Indicator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {lowStock.map(p => (
                        <tr key={p.id}>
                          <td className="px-4 py-3 font-bold text-slate-700">{p.name}</td>
                          <td className="px-4 py-3">{p.brand}</td>
                          <td className="px-4 py-3">{p.category}</td>
                          <td className="px-4 py-3 font-bold text-slate-700">{p.stockCount}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                              p.stockCount <= 10 ? 'bg-red-50 text-danger border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}>
                              {p.stockCount <= 10 ? 'CRITICAL LOW' : 'LOW STOCK'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </section>
      </div>

    </div>
  );
}
