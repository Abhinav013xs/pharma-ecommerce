'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation.js';
import { BRAND_CONFIG } from '../../utils/brandConfig';
import { 
  UploadCloud, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ShieldAlert,
  Calendar,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

interface Prescription {
  id: string;
  fileUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export default function PrescriptionPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Redirect if not signed in
  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth');
    }
  }, [user, loading]);

  const fetchPrescriptions = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/prescriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPrescriptions(data.prescriptions);
      }
    } catch (e) {
      console.warn("Failed to load prescriptions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPrescriptions();
    }
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(false);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File size exceeds 5MB limit.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !token) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('prescription', selectedFile);

    try {
      const res = await fetch('http://localhost:5000/api/prescriptions/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        setUploadSuccess(true);
        setSelectedFile(null);
        fetchPrescriptions();
      } else {
        setUploadError(data.error || "Failed to upload file.");
      }
    } catch (err) {
      setUploadError("Server connection timeout. Ensure backend is running.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Prescription Validation Manager</h1>
        <p className="text-xs text-slate-400">
          Upload PDF, JPEG, or PNG notes from your doctor. Our certified pharmacist will review and verify your files within 30 minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Drag & Drop upload panel */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
            
            <h3 className="font-heading font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <UploadCloud className="h-5 w-5 text-primary" />
              <span>Upload New Prescription</span>
            </h3>

            {/* Error notifications */}
            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-100 text-danger text-xs font-semibold rounded-xl flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Success notifications */}
            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold rounded-xl flex items-center gap-1.5">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>Upload successful! Awaiting verification.</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 hover:border-primary/50 transition-colors rounded-2xl p-6 text-center cursor-pointer relative bg-slate-50/50">
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="space-y-2.5">
                  <span className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <UploadCloud className="h-6 w-6" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">
                      {selectedFile ? selectedFile.name : 'Click to upload or drag & drop'}
                    </p>
                    <p className="text-[10px] text-slate-400">PDF, PNG, JPG, JPEG (Max size: 5MB)</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {uploading ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FileText className="h-4.5 w-4.5" />
                    <span>Upload for Verification</span>
                  </>
                )}
              </button>
            </form>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-accent" />
                <span>Validation Guidelines</span>
              </h4>
              <ul className="text-[10px] text-slate-400 space-y-1 list-disc pl-4 leading-relaxed">
                <li>Doctor's Name & Registration Number must be visible.</li>
                <li>Patient Name and date of prescription must be clearly legible.</li>
                <li>Prescription dates must be within the last 6 months.</li>
                <li>Do not crop or blur the drug lists.</li>
              </ul>
            </div>

          </div>
        </div>

        {/* Right: Upload History list */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
            
            <h3 className="font-heading font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
              Uploaded Prescriptions History
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-1">
                <FileText className="h-10 w-10 mx-auto opacity-40 mb-1" />
                <p className="text-xs font-bold text-slate-700">No Prescriptions Uploaded</p>
                <p className="text-[10px]">Your uploads will display here once verified.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((pr) => (
                  <div key={pr.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      
                      {/* Document Details */}
                      <div className="flex gap-3">
                        <span className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5" />
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Doc Reference: {pr.id}</h4>
                          <a 
                            href={`http://localhost:5000${pr.fileUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[10px] text-primary hover:underline font-semibold"
                          >
                            View Document
                          </a>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div>
                        {pr.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg border border-amber-100">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {pr.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg border border-emerald-100">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Approved</span>
                          </span>
                        )}
                        {pr.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg border border-rose-100">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </div>

                    </div>

                    {/* Review Feedback details */}
                    {(pr.verifiedBy || pr.notes) && (
                      <div className="border-t border-slate-200/60 pt-3 flex flex-col sm:flex-row justify-between gap-2 text-[10px] text-slate-400">
                        {pr.verifiedBy && (
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-3.5 w-3.5 text-slate-500" />
                            <span>Reviewed by: {pr.verifiedBy}</span>
                          </div>
                        )}
                        {pr.notes && (
                          <div className="flex items-start gap-1 flex-1 sm:max-w-[70%]">
                            <span className="font-bold text-slate-500 shrink-0">Notes:</span>
                            <p className="italic text-slate-500 leading-normal">{pr.notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="border-t border-slate-200/60 pt-2 flex justify-between text-[9px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Uploaded: {new Date(pr.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
