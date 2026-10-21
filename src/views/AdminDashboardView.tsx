import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  AlertTriangle, 
  Users, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Search, 
  MapPin, 
  BarChart3, 
  Clock, 
  Filter, 
  Check,
  ArrowLeft
} from 'lucide-react';
import { db } from '../lib/db';
import { SupportProvider, CareRequest, AuditLogEntry, User } from '../types';
import { getAppLanguage, subscribeAppLanguage, t, AppLanguage } from '../lib/i18n';

interface AdminDashboardViewProps {
  onNavigate: (route: string) => void;
  onGoBack?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate, onGoBack }) => {
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
  const [providers, setProviders] = useState<SupportProvider[]>([]);
  const [requests, setRequests] = useState<CareRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'providers' | 'unresolved' | 'audit_logs'>('providers');
  const [appLang, setAppLang] = useState<AppLanguage>(getAppLanguage());

  // Search & filter for audit logs
  const [logSearch, setLogSearch] = useState('');
  const [logFilterRole, setLogFilterRole] = useState('all');

  useEffect(() => {
    const load = () => {
      setProviders(db.getProviders());
      setRequests(db.getRequests());
      setAuditLogs(db.getAuditLogs());
      setCurrentUser(db.getCurrentUser());
    };
    load();
    const unsubDb = db.subscribe(load);
    const unsubLang = subscribeAppLanguage(setAppLang);
    return () => {
      unsubDb();
      unsubLang();
    };
  }, []);

  const handleToggleVerification = (provider: SupportProvider) => {
    db.toggleProviderVerification(provider.id, !provider.isVerified, currentUser.name || 'Dr. Priya Varma');
  };

  const unresolvedCases = requests.filter(r => r.failureFlag || (r.status !== 'Resolved' && r.repeatBarrierDetected));

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.actorName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase());
    const matchesRole = logFilterRole === 'all' || log.actorRole === logFilterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Top Prominent Back / Previous Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <button
          onClick={onGoBack || (() => onNavigate('/'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition border border-slate-300 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-teal-700" />
          <span>{t('back', appLang)}</span>
        </button>

        <span className="text-xs font-semibold text-slate-500">
          {currentUser.name} • {t('admin', appLang)}
        </span>
      </div>
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
                {t('admin', appLang)} Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {t('adminTitle', appLang)}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {t('adminSub', appLang)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('/admin/gap-map')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-600 flex items-center gap-1.5 transition cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>{t('navGapMap', appLang)}</span>
            </button>
            <button
              onClick={() => onNavigate('/admin/analytics')}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('navAnalytics', appLang)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'providers'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{t('tabPartners', appLang)} ({providers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('unresolved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'unresolved'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('tabFailures', appLang)} ({unresolvedCases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'audit_logs'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t('tabAudit', appLang)} ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Providers Verification */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map(prov => (
              <div 
                key={prov.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{prov.name}</h3>
                      <p className="text-xs text-slate-500">{prov.organizationName}</p>
                    </div>
                    {prov.isVerified ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('verified', appLang)}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{t('unverified', appLang)}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px]">
                      Districts: {prov.districtsCovered.join(', ')}
                    </span>
                    {prov.hasWheelchairSupport && (
                      <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded text-[11px] font-semibold">
                        Wheelchair Accessible
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Status: {prov.isAvailable ? t('active', appLang) : 'Paused'}</span>
                  <button
                    onClick={() => handleToggleVerification(prov)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      prov.isVerified 
                        ? 'border border-rose-300 text-rose-700 hover:bg-rose-50' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {prov.isVerified ? t('unverifyPartner', appLang) : t('verifyPartner', appLang)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Unresolved Cases & Failure SLA Monitor */}
      {activeTab === 'unresolved' && (
        <div className="space-y-4">
          {unresolvedCases.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Zero active service failures across the district.</p>
            </div>
          ) : (
            unresolvedCases.map(req => (
              <div 
                key={req.id} 
                className="bg-white rounded-3xl p-6 border-2 border-rose-300 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
                      {t('failureDetected', appLang)}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{req.patientName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">District: {req.district}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800">
                    SLA Alert
                  </span>
                </div>

                <div className="p-3 bg-rose-50 rounded-xl text-xs text-rose-900">
                  <strong>Interruption Note:</strong> {req.failureReason || 'Provider unable to fulfill assistance.'}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500">Coordinating Worker: {req.assignedWorkerName || req.workerName || 'Anitha Sundaram'}</span>
                  <button
                    onClick={() => {
                      db.switchRoleQuick('worker');
                      onNavigate(`/worker/dashboard?focus=${req.id}`);
                    }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Open in Worker Desk
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Immutable System Audit Logs */}
      {activeTab === 'audit_logs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              {t('auditLogsTitle', appLang)}
            </h3>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder={t('search', appLang)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <select
                value={logFilterRole}
                onChange={(e) => setLogFilterRole(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer"
              >
                <option value="all">{t('all', appLang)}</option>
                <option value="patient">Patient</option>
                <option value="worker">Worker</option>
                <option value="ngo">NGO</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {filteredLogs.map(log => (
              <div key={log.id} className="py-2.5 flex items-start justify-between text-xs gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-mono text-slate-600">
                      {log.actorName} ({log.actorRole})
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
