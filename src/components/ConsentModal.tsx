import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { db } from '../lib/db';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsentConfirmed?: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onClose, onConsentConfirmed }) => {
  const [agreedToStorage, setAgreedToStorage] = useState(true);
  const [agreedToPartnerSharing, setAgreedToPartnerSharing] = useState(true);
  const currentUser = db.getCurrentUser();

  if (!isOpen) return null;

  const handleAccept = () => {
    if (!agreedToStorage || !agreedToPartnerSharing) return;
    const user = {
      ...currentUser,
      consentGiven: true,
      consentTimestamp: new Date().toISOString()
    };
    db.saveUser(user);
    db.setCurrentUser(user);
    db.addAuditLog(user.name, user.role, 'INFORMED_CONSENT_GRANTED', 'Patient granted explicit consent for access coordination & partner referral.');
    onConsentConfirmed?.();
    onClose();
  };

  const handleWithdraw = () => {
    const user = {
      ...currentUser,
      consentGiven: false,
      consentTimestamp: undefined
    };
    db.saveUser(user);
    db.setCurrentUser(user);
    db.addAuditLog(user.name, user.role, 'CONSENT_WITHDRAWN', 'Patient revoked prior consent.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Informed Consent & Privacy Charter</h3>
              <p className="text-xs text-slate-500">CareBridge AI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-sm text-slate-600 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-5">
          <p className="font-medium text-slate-800">
            Before coordinating hospital access support, please review how your information is handled:
          </p>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>No Clinical Diagnosis:</strong> CareBridge AI coordinates logistics and social barriers only. We never provide medical advice or prescriptions.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>Verified Support Matching:</strong> Your district and accessibility needs are shared strictly with verified local NGOs or transport providers to arrange your ride or escort.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>Right to Withdraw:</strong> You can withdraw consent anytime. Your exact home address is never published or exposed on any public map.</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={agreedToStorage}
              onChange={(e) => setAgreedToStorage(e.target.checked)}
              className="mt-1 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <span className="text-xs text-slate-700">
              I agree to allow CareBridge AI to securely store my access barrier details for case coordination.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={agreedToPartnerSharing}
              onChange={(e) => setAgreedToPartnerSharing(e.target.checked)}
              className="mt-1 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <span className="text-xs text-slate-700">
              I authorize verified community health workers and registered NGOs to receive my referral for hospital assistance.
            </span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          {currentUser.consentGiven && (
            <button
              onClick={handleWithdraw}
              type="button"
              className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              Withdraw Previous Consent
            </button>
          )}
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAccept}
            disabled={!agreedToStorage || !agreedToPartnerSharing}
            type="button"
            className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition"
          >
            Confirm & Proceed
          </button>
        </div>
      </div>
    </div>
  );
};
