import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  UserCheck, 
  Building2, 
  AlertTriangle, 
  MapPin, 
  X,
  Volume2
} from 'lucide-react';
import { db } from '../lib/db';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const handleStartLakshmiScenario = () => {
    // Switch active role to Patient Lakshmi
    db.switchRoleQuick('patient');
    onNavigate('/patient/assistant?demo=lakshmi');
    onClose();
  };

  const handleGoToWorkerReassignment = () => {
    // Switch to Worker Anitha
    db.switchRoleQuick('worker');
    onNavigate('/worker/dashboard?focus=req-fail-case-002');
    onClose();
  };

  const handleGoToNgoQueue = () => {
    // Switch to NGO Kaveri Seva Trust
    db.switchRoleQuick('ngo');
    onNavigate('/ngo/dashboard');
    onClose();
  };

  const handleGoToGapMap = () => {
    onNavigate('/admin/gap-map');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-teal-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-1">
                DEMO WALKTHROUGH & EVALUATION
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Core Evaluation Scenarios
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-6">
          CareBridge AI coordinates healthcare <strong>access barriers</strong> without diagnosing or prescribing. 
          Select any interactive walkthrough below to experience the end-to-end journey:
        </p>

        <div className="space-y-3">
          {/* Scenario 1: Lakshmi Tamil Voice2Care */}
          <div className="border border-teal-200 bg-teal-50/50 rounded-2xl p-4 hover:border-teal-400 transition">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Lakshmi's Tamil Voice2Care</h3>
                  <span className="text-xs text-teal-800 font-medium">Auto-detection • Financial + Transit barriers</span>
                </div>
              </div>
              <button
                onClick={handleStartLakshmiScenario}
                className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <span>Launch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scenario 2: Support Failure Detection & Reassignment */}
          <div className="border border-rose-200 bg-rose-50/40 rounded-2xl p-4 hover:border-rose-300 transition">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Support Failure & Reassignment</h3>
                  <span className="text-xs text-rose-800 font-medium">Van breakdown • Auto-reassignment</span>
                </div>
              </div>
              <button
                onClick={handleGoToWorkerReassignment}
                className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <span>Fix Case</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scenario 3: NGO Referral Response */}
          <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-4 hover:border-blue-300 transition">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">NGO Referral Desk</h3>
                  <span className="text-xs text-blue-800 font-medium">Accept or decline referral with reason</span>
                </div>
              </div>
              <button
                onClick={handleGoToNgoQueue}
                className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <span>Open NGO</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scenario 4: Healthcare Barrier Gap Map */}
          <div className="border border-slate-200 bg-slate-50 rounded-2xl p-4 hover:border-slate-300 transition">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">4</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Barrier Gap Map</h3>
                  <span className="text-xs text-slate-600 font-medium">District aggregates • Privacy suppression</span>
                </div>
              </div>
              <button
                onClick={handleGoToGapMap}
                className="shrink-0 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <span>View Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              db.resetAllToDemo();
              alert('Demo database reset to original pristine state!');
            }}
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
          >
            Reset Database to Clean Demo State
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
