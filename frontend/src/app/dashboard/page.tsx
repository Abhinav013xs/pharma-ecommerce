'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation.js';
import { 
  User, 
  ShoppingBag, 
  FileText, 
  Clock, 
  Settings, 
  HelpCircle, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  ShieldAlert,
  Calendar,
  Lock,
  Mail,
  Smartphone,
  Truck
} from 'lucide-react';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  deliverySlot: string;
  createdAt: string;
  deliveryPartner?: string | null;
  trackingId?: string | null;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      image: string;
    };
  }>;
}

interface Prescription {
  id: string;
  fileUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes: string | null;
  createdAt: string;
}

interface Reminder {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  timeOfDay: string;
  isActive: boolean;
}

interface Subscription {
  id: string;
  productIds: string;
  frequencyInDays: number;
  nextBillingDate: string;
  status: string;
  discountPercentage: number;
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, logout, toggle2FA, changePassword } = useAuth();

  // Active Tab state
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

  // API Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Forms states
  const [newReminder, setNewReminder] = useState({ medicineName: '', dosage: '1 Tablet', frequency: 'Daily', timeOfDay: '08:00' });
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'Support', description: '' });
  const [newSub, setNewSub] = useState({ productIds: '["prod-metformin-500"]', frequencyInDays: 30 });
  const [passwords, setPasswords] = useState({ current: '', new: '' });

  // Notifications
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Auto redirect guest
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user]);

  // Load backend content
  const loadDashboardData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      // 1. Fetch Orders
      const orderRes = await fetch('http://localhost:5000/api/orders', { headers: { 'Authorization': `Bearer ${token}` } });
      const orderData = await orderRes.json();
      if (orderData.success) setOrders(orderData.orders);

      // 2. Fetch Prescriptions
      const prescRes = await fetch('http://localhost:5000/api/prescriptions', { headers: { 'Authorization': `Bearer ${token}` } });
      const prescData = await prescRes.json();
      if (prescData.success) setPrescriptions(prescData.prescriptions);

      // 3. Fetch Reminders
      const remRes = await fetch('http://localhost:5000/api/reminders/alarms', { headers: { 'Authorization': `Bearer ${token}` } });
      const remData = await remRes.json();
      if (remData.success) setReminders(remData.reminders);

      // 4. Fetch Subscriptions
      const subRes = await fetch('http://localhost:5000/api/reminders/subscriptions', { headers: { 'Authorization': `Bearer ${token}` } });
      const subData = await subRes.json();
      if (subData.success) setSubscriptions(subData.subscriptions);

      // 5. Fetch Support Tickets
      const ticketRes = await fetch('http://localhost:5000/api/support', { headers: { 'Authorization': `Bearer ${token}` } });
      const ticketData = await ticketRes.json();
      if (ticketData.success) setTickets(ticketData.tickets);

    } catch (e) {
      console.error("Dashboard pull failed", e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  // Reminder Submits
  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/reminders/alarms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newReminder)
      });
      const data = await res.json();
      if (data.success) {
        setReminders(prev => [...prev, data.reminder]);
        setNewReminder({ medicineName: '', dosage: '1 Tablet', frequency: 'Daily', timeOfDay: '08:00' });
        showNotification('success', "Medicine reminder alarm created.");
      }
    } catch (err) {
      showNotification('error', "Failed to schedule alarm.");
    }
  };

  const handleToggleReminder = async (remId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reminders/alarms/${remId}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReminders(prev => prev.map(r => r.id === remId ? data.reminder : r));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReminder = async (remId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reminders/alarms/${remId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReminders(prev => prev.filter(r => r.id !== remId));
        showNotification('success', "Alarm deleted.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Subscription Actions
  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/reminders/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newSub)
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions(prev => [...prev, data.subscription]);
        showNotification('success', "Auto-refill subscription set.");
      }
    } catch (err) {
      showNotification('error', "Failed to configure subscriptions.");
    }
  };

  const handleCancelSubscription = async (subId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reminders/subscriptions/${subId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions(prev => prev.map(s => s.id === subId ? data.subscription : s));
        showNotification('success', "Subscription status updated to Cancelled.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Ticket actions
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newTicket)
      });
      const data = await res.json();
      if (data.success) {
        setTickets(prev => [...prev, data.ticket]);
        setNewTicket({ subject: '', category: 'Support', description: '' });
        showNotification('success', "Support ticket opened. A technician will contact you.");
      }
    } catch (err) {
      showNotification('error', "Failed to open support request.");
    }
  };

  // Security changes
  const handle2FAToggle = async () => {
    const res = await toggle2FA();
    if (res.success) {
      showNotification('success', res.is2FAEnabled ? "Two-Factor Auth Enabled! Secret: mock_2fa_secret" : "2FA Disabled.");
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await changePassword(passwords.current, passwords.new);
    if (success) {
      setPasswords({ current: '', new: '' });
      showNotification('success', "Password updated successfully.");
    } else {
      showNotification('error', "Incorrect current password credentials.");
    }
  };

  const showNotification = (type: 'success' | 'error', msg: string) => {
    setNotif({ type, msg });
    setTimeout(() => setNotif(null), 4000);
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 bg-white border border-slate-200/60 rounded-3xl p-5 space-y-6 shadow-sm">
          
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="h-10 w-10 bg-primary/15 text-primary rounded-full flex items-center justify-center font-bold text-base">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 text-sm truncate">{user.name}</h3>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                activeTab === 'profile' ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'hover:bg-slate-50'
              }`}
            >
              <User className="h-4.5 w-4.5" />
              <span>Profile & Security</span>
            </button>

            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                activeTab === 'orders' ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <span>Order History</span>
            </button>

            <button 
              onClick={() => setActiveTab('prescriptions')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                activeTab === 'prescriptions' ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'hover:bg-slate-50'
              }`}
            >
              <FileText className="h-4.5 w-4.5" />
              <span>Uploaded Prescriptions</span>
            </button>

            <button 
              onClick={() => setActiveTab('reminders')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                activeTab === 'reminders' ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'hover:bg-slate-50'
              }`}
            >
              <Clock className="h-4.5 w-4.5" />
              <span>Medicine Alarms</span>
            </button>

            <button 
              onClick={() => setActiveTab('subscriptions')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                activeTab === 'subscriptions' ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'hover:bg-slate-50'
              }`}
            >
              <Calendar className="h-4.5 w-4.5" />
              <span>Auto-Refill Schedule</span>
            </button>

            <button 
              onClick={() => setActiveTab('support')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                activeTab === 'support' ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'hover:bg-slate-50'
              }`}
            >
              <HelpCircle className="h-4.5 w-4.5" />
              <span>Customer Support</span>
            </button>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <button 
              onClick={logout}
              className="w-full text-center py-2.5 border border-red-200 text-danger text-xs font-bold rounded-xl hover:bg-red-50 transition-colors"
            >
              Log Out Session
            </button>
          </div>
        </aside>

        {/* Dashboard Panels Area */}
        <section className="flex-1 w-full bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm min-h-[500px] relative">
          
          {/* Notifications overlays */}
          {notif && (
            <div className={`p-4 rounded-2xl text-xs font-semibold mb-6 flex items-center gap-2 shadow-md animate-in fade-in slide-in-from-top-3 ${
              notif.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' 
                : 'bg-red-50 border border-red-100 text-danger'
            }`}>
              {notif.type === 'success' ? <CheckCircle className="h-4.5 w-4.5 shrink-0" /> : <AlertCircle className="h-4.5 w-4.5 shrink-0" />}
              <span>{notif.msg}</span>
            </div>
          )}

          {loadingData && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* TAB 1: Profile & Security */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 font-heading mb-4">Patient Profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Email</span>
                    <p className="font-bold text-slate-700">{user.email}</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Phone</span>
                    <p className="font-bold text-slate-700">{user.phone || 'Not configured'}</p>
                  </div>
                </div>
              </div>

              {/* Security Center */}
              <div className="border-t border-slate-100 pt-6">
                <h2 className="text-xl font-extrabold text-slate-800 font-heading mb-4 flex items-center gap-1.5">
                  <ShieldAlert className="h-5.5 w-5.5 text-amber-500" />
                  <span>Account Security Center</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* Two factor auth */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-700">Two-Factor Authentication (2FA)</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Secure login validations. Requires a dynamic verification passcode on authentication.
                    </p>
                    <button
                      onClick={handle2FAToggle}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors shadow-sm ${
                        user.is2FAEnabled 
                          ? 'bg-slate-900 text-white hover:bg-slate-800' 
                          : 'bg-primary text-white hover:bg-primary-hover shadow-primary/10'
                      }`}
                    >
                      {user.is2FAEnabled ? 'Disable Two Factor' : 'Configure 2FA Verify'}
                    </button>
                  </div>

                  {/* Change Password form */}
                  <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-700">Change Password</h3>
                    <input
                      type="password"
                      required
                      placeholder="Current Password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-primary"
                    />
                    <input
                      type="password"
                      required
                      placeholder="New Password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-primary"
                    />
                    <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800">
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Order History */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-extrabold text-slate-800 font-heading mb-4">Your Purchase Orders</h2>
              {orders.length === 0 ? (
                <p className="text-xs text-slate-400">You haven't placed any pharmaceutical orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div key={o.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                      
                      {/* Summary details */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-3">
                        <div className="text-xs">
                          <span className="font-bold text-slate-700 block">Ref: {o.id}</span>
                          <span className="text-[10px] text-slate-400">Placed: {new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md ${
                            o.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {o.status}
                          </span>
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600">
                            ₹{o.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        {o.items.map((item) => (
                          <div key={item.id} className="flex gap-3 items-center">
                            <img src={item.product.image} className="h-10 w-10 object-cover rounded-lg border bg-white" alt="Pack" />
                            <div className="text-xs flex-grow">
                              <h4 className="font-bold text-slate-700 leading-normal">{item.product.name}</h4>
                              <p className="text-slate-400">Qty: {item.quantity} × Price: ₹{item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tracking info */}
                      {o.deliveryPartner && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 mt-3 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1">
                              <Truck className="h-4 w-4 text-blue-500" />
                              <span>Parcel Tracking Details</span>
                            </span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase">
                              {o.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500">
                            <div>
                              <strong>Delivery Partner:</strong> {o.deliveryPartner}
                            </div>
                            <div>
                              <strong>Tracking ID:</strong> <code className="text-primary font-mono bg-white px-1.5 py-0.5 rounded border">{o.trackingId}</code>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Prescriptions */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-extrabold text-slate-800 font-heading">Active Prescriptions</h2>
                <button onClick={() => router.push('/prescription')} className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Upload Doc</span>
                </button>
              </div>

              {prescriptions.length === 0 ? (
                <p className="text-xs text-slate-400">No uploads found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {prescriptions.map((pr) => (
                    <div key={pr.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">Ref: {pr.id}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          pr.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {pr.status}
                        </span>
                      </div>
                      
                      <a href={`http://localhost:5000${pr.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-semibold block">
                        View uploaded sheet
                      </a>
                      
                      {pr.notes && (
                        <p className="text-[10px] text-slate-400 italic">Notes: {pr.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Medicine Alarms */}
          {activeTab === 'reminders' && (
            <div className="space-y-8">
              
              {/* Form container */}
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="h-4.5 w-4.5 text-primary" />
                  <span>Schedule Medication Alert</span>
                </h3>
                
                <form onSubmit={handleAddReminder} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Medicine Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Metformin, Novamox..."
                      value={newReminder.medicineName}
                      onChange={(e) => setNewReminder({ ...newReminder, medicineName: e.target.value })}
                      className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg w-full focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Dosage Description</label>
                    <input
                      type="text"
                      required
                      placeholder="1 Tablet, 5ml"
                      value={newReminder.dosage}
                      onChange={(e) => setNewReminder({ ...newReminder, dosage: e.target.value })}
                      className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg w-full focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Time (24hr)</label>
                    <input
                      type="text"
                      required
                      placeholder="08:00, 20:00"
                      value={newReminder.timeOfDay}
                      onChange={(e) => setNewReminder({ ...newReminder, timeOfDay: e.target.value })}
                      className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg w-full focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button type="submit" className="py-2.5 bg-primary text-white text-xs font-bold rounded-lg shadow shadow-primary/10">
                    Add Alarm
                  </button>
                </form>
              </div>

              {/* List area */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700">Active Medication Alarms</h3>
                {reminders.length === 0 ? (
                  <p className="text-xs text-slate-400">No reminders scheduled.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {reminders.map((rem) => (
                      <div key={rem.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4 shadow-sm">
                        <div className="text-xs space-y-0.5">
                          <h4 className="font-bold text-slate-800 text-sm">{rem.medicineName}</h4>
                          <p className="text-slate-500">{rem.dosage} ({rem.frequency})</p>
                          <p className="text-primary font-semibold flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Dosing: {rem.timeOfDay}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleReminder(rem.id)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                              rem.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {rem.isActive ? 'Active' : 'Disabled'}
                          </button>
                          <button 
                            onClick={() => handleDeleteReminder(rem.id)}
                            className="p-1 text-slate-400 hover:text-danger rounded hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Auto-Refill Subscriptions */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              
              <div className="bg-slate-50 p-5 border border-slate-200/60 rounded-2xl space-y-3">
                <h3 className="text-sm font-bold text-slate-700">Configure Auto-Refills</h3>
                <p className="text-slate-400 text-xs">Receive chronic medications automatically. Subscriptions carry an automatic 10% discount.</p>
                <form onSubmit={handleAddSubscription} className="flex gap-2 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Frequency (Days)</label>
                    <select
                      value={newSub.frequencyInDays}
                      onChange={(e) => setNewSub({ ...newSub, frequencyInDays: parseInt(e.target.value) })}
                      className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg w-28 focus:outline-none"
                    >
                      <option value={30}>Every 30 Days</option>
                      <option value={60}>Every 60 Days</option>
                      <option value={90}>Every 90 Days</option>
                    </select>
                  </div>
                  <button type="submit" className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm">
                    Activate Refill
                  </button>
                </form>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700">Active Refill Subscriptions</h3>
                {subscriptions.length === 0 ? (
                  <p className="text-xs text-slate-400">No active subscriptions configured.</p>
                ) : (
                  <div className="space-y-3">
                    {subscriptions.map((s) => (
                      <div key={s.id} className="p-4 border rounded-xl flex items-center justify-between text-xs bg-white shadow-sm">
                        <div>
                          <p className="font-bold text-slate-700">Subscription Refill: {s.id}</p>
                          <p className="text-slate-400">Refill cycle: Every {s.frequencyInDays} days</p>
                          <p className="text-slate-400">Next billing date: {new Date(s.nextBillingDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${
                            s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {s.status}
                          </span>
                          {s.status === 'ACTIVE' && (
                            <button 
                              onClick={() => handleCancelSubscription(s.id)}
                              className="text-danger hover:underline font-bold"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Support Tickets */}
          {activeTab === 'support' && (
            <div className="space-y-8">
              
              {/* Form container */}
              <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-slate-700">Open Customer Support Ticket</h3>
                <form onSubmit={handleCreateTicket} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Subject</label>
                      <input
                        type="text"
                        required
                        placeholder="Incorrect dosage quantity, refund info..."
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                        className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg w-full focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                      <select
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                        className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg w-full focus:outline-none"
                      >
                        <option value="Support">Support Desk</option>
                        <option value="Delivery">Delivery & Logistics</option>
                        <option value="Payment">Payment Gateway</option>
                        <option value="Quality">Medicine Quality</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Issue Description</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="State your issues in details..."
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      className="bg-white border border-slate-200 text-xs p-3 rounded-lg w-full focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button type="submit" className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 shadow">
                    Submit Ticket
                  </button>
                </form>
              </div>

              {/* Tickets list */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700">Support Ticket Logs</h3>
                {tickets.length === 0 ? (
                  <p className="text-xs text-slate-400">No support tickets opened.</p>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((t) => (
                      <div key={t.id} className="p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-white shadow-sm gap-2">
                        <div>
                          <div className="flex gap-2 items-center mb-0.5">
                            <h4 className="font-bold text-slate-700">{t.subject}</h4>
                            <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">{t.category}</span>
                          </div>
                          <p className="text-slate-400">{t.description}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Date: {new Date(t.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`self-start sm:self-center px-2 py-0.5 text-[9px] font-bold rounded ${
                          t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </section>
      </div>

    </div>
  );
}

export default function UserDashboard() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-sm text-slate-400">Loading user profile dashboard...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
