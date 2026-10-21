import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Languages, 
  Clock,
  PieChart as PieIcon,
  ArrowLeft
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { db } from '../lib/db';
import { getAppLanguage, subscribeAppLanguage, t, AppLanguage } from '../lib/i18n';

interface AnalyticsViewProps {
  onNavigate?: (route: string) => void;
  onGoBack?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onNavigate, onGoBack }) => {
  const [appLang, setAppLang] = useState<AppLanguage>(getAppLanguage());

  useEffect(() => {
    return subscribeAppLanguage(setAppLang);
  }, []);

  const barrierData = [
    { name: 'Transportation', cases: 88, fill: '#0d9488' },
    { name: 'Financial', cases: 72, fill: '#0284c7' },
    { name: 'Mobility', cases: 39, fill: '#f59e0b' },
    { name: 'Accessibility', cases: 28, fill: '#8b5cf6' },
    { name: 'Language', cases: 21, fill: '#ec4899' },
    { name: 'Caregiver', cases: 19, fill: '#10b981' }
  ];

  const languageData = [
    { name: 'Tamil', value: 48, color: '#0d9488' },
    { name: 'Hindi', value: 24, color: '#0284c7' },
    { name: 'Telugu', value: 12, color: '#f59e0b' },
    { name: 'English', value: 9, color: '#64748b' },
    { name: 'Malayalam', value: 4, color: '#8b5cf6' },
    { name: 'Kannada', value: 3, color: '#ec4899' }
  ];

  const resolutionFunnel = [
    { stage: 'Submitted', count: 124 },
    { stage: 'Under Review', count: 118 },
    { stage: 'Worker Assigned', count: 112 },
    { stage: 'Assistance Arranged', count: 104 },
    { stage: 'Outcome Verified', count: 96 },
    { stage: 'Resolved', count: 91 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Top Prominent Back / Previous Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <button
          onClick={onGoBack || (() => onNavigate?.('/admin/dashboard'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition border border-slate-300 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-teal-700" />
          <span>{t('back', appLang)}</span>
        </button>

      </div>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t('navAnalytics', appLang)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t('analyticsTitle', appLang)}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('analyticsSub', appLang)}
          </p>
        </div>

        <div className="bg-amber-100 border border-amber-300 px-3.5 py-1.5 rounded-xl text-xs font-black text-amber-900 self-start sm:self-auto">
          ⚠️ DEMO DATA
        </div>
      </div>

      {/* KPI Headline Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Barrier Inquiries</span>
          <span className="text-3xl font-black text-slate-900 block mt-1">267</span>
          <span className="text-[11px] text-teal-700 font-semibold mt-1 block">8 Indian Languages</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Assistance Resolution Rate</span>
          <span className="text-3xl font-black text-emerald-600 block mt-1">94.8%</span>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Verified Clinic Visits</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Interrupted Case SLA</span>
          <span className="text-3xl font-black text-rose-600 block mt-1">100%</span>
          <span className="text-[11px] text-rose-700 font-semibold mt-1 block">Auto-escalated within 2h</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Invisible Patients Bridged</span>
          <span className="text-3xl font-black text-purple-600 block mt-1">68</span>
          <span className="text-[11px] text-purple-700 font-semibold mt-1 block">First-time access cases</span>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Barrier Frequency */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            {t('barrierDistribution', appLang)}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barrierData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="cases" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Language breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            {t('languageBreakdown', appLang)}
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
