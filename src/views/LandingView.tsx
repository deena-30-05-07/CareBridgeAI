import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  HeartHandshake, 
  MapPin, 
  ShieldCheck, 
  Users, 
  Building2, 
  ArrowRight, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  AlertTriangle,
  Bus,
  Coins,
  Accessibility,
  Languages,
  UserPlus,
  Shield,
  UserCheck
} from 'lucide-react';
import { db } from '../lib/db';
import { User, UserRole } from '../types';
import { getAppLanguage, subscribeAppLanguage, t, AppLanguage } from '../lib/i18n';

interface LandingViewProps {
  onNavigate: (route: string) => void;
  onOpenTour: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate, onOpenTour }) => {
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
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

  const handleOpenMyPortal = () => {
    if (currentUser.role === 'patient') onNavigate('/patient/dashboard');
    else if (currentUser.role === 'worker') onNavigate('/worker/dashboard');
    else if (currentUser.role === 'ngo') onNavigate('/ngo/dashboard');
    else if (currentUser.role === 'admin') onNavigate('/admin/dashboard');
  };

  const getMyPortalRoute = () => {
    if (currentUser.role === 'patient') return '/patient/dashboard';
    if (currentUser.role === 'worker') return '/worker/dashboard';
    if (currentUser.role === 'ngo') return '/ngo/dashboard';
    return '/admin/dashboard';
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* Active User Session Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-white border border-teal-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-700 block tracking-wider">
                {t('myUsageOnly', appLang)}
              </span>
              <p className="text-sm font-extrabold text-slate-900">
                {currentUser.name} <span className="font-normal text-slate-500">({t(currentUser.role, appLang)})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleOpenMyPortal}
              className="flex-1 sm:flex-none px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Open {t(currentUser.role, appLang)} Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('/auth')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition cursor-pointer"
            >
              Switch User
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-4 pb-12 sm:pt-8 sm:pb-16 bg-gradient-to-b from-teal-50/70 via-white to-slate-50 border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              CareBridge AI — <br className="hidden sm:inline" />
              <span className="text-teal-600">{t('noPatientLeftBehind', appLang)}</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              {t('tagline', appLang)}
            </p>

            <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 max-w-xl mx-auto shadow-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Zero-Diagnosis Guarantee:</strong> We coordinate logistics, never medical treatment.
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleOpenMyPortal}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Go to My {t(currentUser.role, appLang)} Dashboard</span>
              </button>

              <button
                onClick={onOpenTour}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{t('tour', appLang)}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Quick Demo Audio Test for Patient */}
            {currentUser.role === 'patient' && (
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/patient/assistant')}
                  className="inline-flex items-center gap-2 text-xs text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3.5 py-1.5 rounded-full transition cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Lakshmi (65, Tamil): <strong>"எனக்கு மருத்துவமனைக்கு போக பஸ் காசு இல்லை."</strong></span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Access Barriers Tackled */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Solving Real Access Barriers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Eliminating logistical and social obstacles to ensure timely clinical care.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { title: t('barrierTransportation', appLang), icon: Bus, color: 'text-blue-600 bg-blue-50' },
            { title: t('barrierFinancial', appLang), icon: Coins, color: 'text-emerald-600 bg-emerald-50' },
            { title: t('barrierMobility', appLang), icon: Accessibility, color: 'text-amber-600 bg-amber-50' },
            { title: t('barrierLanguage', appLang), icon: Languages, color: 'text-purple-600 bg-purple-50' },
            { title: t('barrierCaregiver', appLang), icon: Users, color: 'text-rose-600 bg-rose-50' },
            { title: 'Invisible Bridging', icon: UserPlus, color: 'text-teal-600 bg-teal-50' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs">{item.title}</h3>
              </div>
            );
          })}
        </div>
      </section>

      {/* Role-Specific Portal Launcher */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Multi-Role Coordination Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Each logged in user accesses only their designated tools and usage part.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Patient Card */}
          <div 
            onClick={() => {
              db.switchRoleQuick('patient');
              onNavigate('/patient/dashboard');
            }}
            className={`rounded-3xl p-6 border shadow-xs transition cursor-pointer flex flex-col justify-between ${
              currentUser.role === 'patient' 
                ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20' 
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                {currentUser.role === 'patient' && (
                  <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold">
                    Active Session
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('patient', appLang)}</h3>
              <p className="text-xs text-slate-500 mt-1">Voice2Care assistant, transportation request, and tracking care resolution.</p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 text-xs font-bold text-teal-700 flex items-center gap-1">
              <span>{currentUser.role === 'patient' ? 'Open Patient Tools' : `${t('enterAs', appLang)} ${t('patient', appLang)}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Worker Card */}
          <div 
            onClick={() => {
              db.switchRoleQuick('worker');
              onNavigate('/worker/dashboard');
            }}
            className={`rounded-3xl p-6 border shadow-xs transition cursor-pointer flex flex-col justify-between ${
              currentUser.role === 'worker' 
                ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20' 
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                {currentUser.role === 'worker' && (
                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                    Active Session
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('worker', appLang)}</h3>
              <p className="text-xs text-slate-500 mt-1">Queue review, triage, provider assignment, and offline case synchronization.</p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 text-xs font-bold text-blue-700 flex items-center gap-1">
              <span>{currentUser.role === 'worker' ? 'Open Worker Desk' : `${t('enterAs', appLang)} ${t('worker', appLang)}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* NGO Card */}
          <div 
            onClick={() => {
              db.switchRoleQuick('ngo');
              onNavigate('/ngo/dashboard');
            }}
            className={`rounded-3xl p-6 border shadow-xs transition cursor-pointer flex flex-col justify-between ${
              currentUser.role === 'ngo' 
                ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20' 
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                {currentUser.role === 'ngo' && (
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                    Active Session
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('ngo', appLang)} (Multiple Helpers)</h3>
              <p className="text-xs text-slate-500 mt-1">Accept referrals, dispatch vans/helpers, record assistance, and manage volunteer team.</p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span>{currentUser.role === 'ngo' ? 'Open NGO Portal' : `${t('enterAs', appLang)} ${t('ngo', appLang)}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Admin Card */}
          <div 
            onClick={() => {
              db.switchRoleQuick('admin');
              onNavigate('/admin/dashboard');
            }}
            className={`rounded-3xl p-6 border shadow-xs transition cursor-pointer flex flex-col justify-between ${
              currentUser.role === 'admin' 
                ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20' 
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                {currentUser.role === 'admin' && (
                  <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">
                    Active Session
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('admin', appLang)}</h3>
              <p className="text-xs text-slate-500 mt-1">Partner safety vetting, SLA escalation watchdog, audit logs, and analytics.</p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 text-xs font-bold text-purple-700 flex items-center gap-1">
              <span>{currentUser.role === 'admin' ? 'Open Admin Desk' : `${t('enterAs', appLang)} ${t('admin', appLang)}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
