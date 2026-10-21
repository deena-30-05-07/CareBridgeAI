import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Send, 
  CheckCircle2, 
  Accessibility, 
  AlertTriangle, 
  ArrowLeft,
  Building2,
  Calendar,
  FileCheck
} from 'lucide-react';
import { db } from '../lib/db';
import { BarrierType, CareRequest, User } from '../types';
import { getAppLanguage, subscribeAppLanguage, t, AppLanguage } from '../lib/i18n';

interface PatientRequestViewProps {
  onNavigate: (route: string) => void;
  onGoBack?: () => void;
  onOpenConsent: () => void;
}

export const PatientRequestView: React.FC<PatientRequestViewProps> = ({ onNavigate, onGoBack, onOpenConsent }) => {
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
  const [inputText, setInputText] = useState('');
  const [selectedBarriers, setSelectedBarriers] = useState<BarrierType[]>(['Transportation']);
  const [requiresWheelchair, setRequiresWheelchair] = useState(false);
  const [requiresSignLanguage, setRequiresSignLanguage] = useState(false);
  const [hospitalName, setHospitalName] = useState('Govt District Headquarter Hospital');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdId, setCreatedId] = useState('');
  const [appLang, setAppLang] = useState<AppLanguage>(getAppLanguage());

  useEffect(() => {
    const unsubDb = db.subscribe(() => {
      setCurrentUser(db.getCurrentUser());
    });
    const unsubLang = subscribeAppLanguage(setAppLang);
    return () => {
      unsubDb();
      unsubLang();
    };
  }, []);

  const handleToggleBarrier = (b: BarrierType) => {
    if (selectedBarriers.includes(b)) {
      setSelectedBarriers(selectedBarriers.filter(item => item !== b));
    } else {
      setSelectedBarriers([...selectedBarriers, b]);
    }
  };

  const barrierTranslationMap: Record<BarrierType, string> = {
    'Financial': t('barrierFinancial', appLang),
    'Transportation': t('barrierTransportation', appLang),
    'Mobility': t('barrierMobility', appLang),
    'Accessibility': t('barrierAccessibility', appLang),
    'Language': t('barrierLanguage', appLang),
    'Caregiver Support': t('barrierCaregiver', appLang),
    'Other': t('barrierOther', appLang)
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.consentGiven) {
      onOpenConsent();
      return;
    }
    if (!inputText.trim() || selectedBarriers.length === 0) return;

    const newId = `req-man-${Date.now().toString().slice(-6)}`;
    const newRequest: CareRequest = {
      id: newId,
      patientId: currentUser.id,
      patientName: currentUser.name || 'Lakshmi Ramasamy',
      patientAge: 65,
      patientPhone: currentUser.phone || '+91 98401 23456',
      district: currentUser.district || 'Tiruchirappalli',
      state: currentUser.state || 'Tamil Nadu',
      originalInput: inputText,
      inputType: 'text',
      classification: {
        detectedLanguage: appLang === 'ta' ? 'Tamil' : 'English',
        languageCode: appLang === 'ta' ? 'ta' : 'en',
        transcription: inputText,
        barriers: selectedBarriers,
        urgencyWarning: false,
        urgencyReason: null,
        plainLanguageReason: `Patient submission for ${selectedBarriers.join(' & ')}.`,
        explanationInPatientLanguage: 'Your access assistance request has been queued.',
        needsClarification: false,
        clarificationQuestion: null,
        recommendedAssistanceType: 'Coordinated Transit Voucher & Verified NGO Support',
        confidenceScore: 0.98
      },
      status: 'Submitted',
      appointmentDetails: {
        hospitalName,
        specialty: 'Clinical Consultation',
        date: appointmentDate
      },
      timelineLogs: [
        {
          status: 'Submitted',
          timestamp: new Date().toISOString(),
          note: `Access assistance request filed. Barriers: ${selectedBarriers.join(', ')}`,
          actor: currentUser.name
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.createRequest(newRequest);
    setCreatedId(newId);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-black text-slate-900">{t('requestEnqueuedTitle', appLang)}</h2>
        <p className="text-xs text-slate-600">
          Case ID: <strong className="font-mono text-teal-800">{createdId}</strong>.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => onNavigate('/patient/tracking')}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            {t('trackRequestBtn', appLang)}
          </button>
          <button
            onClick={() => onNavigate('/patient/dashboard')}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
          >
            {t('backToDashboard', appLang)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Prominent Back / Previous Button at top */}
      <div className="flex items-center gap-3">
        <button
          onClick={onGoBack || (() => onNavigate('/patient/dashboard'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition border border-slate-300 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-teal-700" />
          <span>{t('back', appLang)}</span>
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {t('requestFormTitle', appLang)}
          </h1>
          <p className="text-xs text-slate-500">
            {t('requestFormSub', appLang)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">
            {t('explainProblemLabel', appLang)}
          </label>
          <textarea
            rows={3}
            required
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('typePlaceholder', appLang)}
            className="w-full text-xs p-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Clean Barrier Options WITHOUT verbose explanations */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-2">
            {t('selectBarriersLabel', appLang)}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(['Transportation', 'Financial', 'Mobility', 'Accessibility', 'Language', 'Caregiver Support', 'Other'] as BarrierType[]).map(b => (
              <button
                key={b}
                type="button"
                onClick={() => handleToggleBarrier(b)}
                className={`p-2.5 rounded-xl text-xs font-bold border text-left transition cursor-pointer ${
                  selectedBarriers.includes(b)
                    ? 'bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-200'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {barrierTranslationMap[b] || b}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Accessibility Checkbox Options (No verbose explanations) */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={requiresWheelchair}
              onChange={(e) => setRequiresWheelchair(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded"
            />
            <span className="text-xs font-bold text-slate-800">{t('wheelchairOption', appLang)}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={requiresSignLanguage}
              onChange={(e) => setRequiresSignLanguage(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded"
            />
            <span className="text-xs font-bold text-slate-800">{t('signLanguageOption', appLang)}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t('hospitalLabel', appLang)}
            </label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t('dateLabel', appLang)}
            </label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-200">
          <button
            type="button"
            onClick={onGoBack || (() => onNavigate('/patient/dashboard'))}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            {t('cancel', appLang)}
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('submitRequestBtn', appLang)}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
