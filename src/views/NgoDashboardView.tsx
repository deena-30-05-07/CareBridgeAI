import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Accessibility, 
  Check, 
  X, 
  AlertTriangle, 
  FileText,
  Power,
  ShieldCheck,
  Send,
  ArrowLeft,
  Users,
  Plus,
  UserCheck,
  HeartHandshake,
  Sparkles
} from 'lucide-react';
import { db } from '../lib/db';
import { CareRequest, SupportProvider, User, BarrierType } from '../types';
import { getAppLanguage, subscribeAppLanguage, t, AppLanguage } from '../lib/i18n';

interface NgoDashboardViewProps {
  onNavigate: (route: string) => void;
  onGoBack?: () => void;
}

export const NgoDashboardView: React.FC<NgoDashboardViewProps> = ({ onNavigate, onGoBack }) => {
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
  const [ngoHelpers, setNgoHelpers] = useState<User[]>(db.getNgoUsers());
  const [requests, setRequests] = useState<CareRequest[]>([]);
  const [providerProfile, setProviderProfile] = useState<SupportProvider | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [appLang, setAppLang] = useState<AppLanguage>(getAppLanguage());

  // Add Helper Modal
  const [isAddHelperModalOpen, setIsAddHelperModalOpen] = useState(false);
  const [newHelperName, setNewHelperName] = useState('');
  const [newHelperPhone, setNewHelperPhone] = useState('');
  const [newHelperOrg, setNewHelperOrg] = useState('');
  const [newHelperService, setNewHelperService] = useState<BarrierType>('Transportation');

  // Decline modal state
  const [declineModalCase, setDeclineModalCase] = useState<CareRequest | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  // Record Assistance delivered modal
  const [recordAssistanceCase, setRecordAssistanceCase] = useState<CareRequest | null>(null);
  const [assistanceProofNote, setAssistanceProofNote] = useState('');

  const loadData = () => {
    const user = db.getCurrentUser();
    setCurrentUser(user);
    const helpers = db.getNgoUsers();
    setNgoHelpers(helpers);

    const allReqs = db.getRequests();
    const providers = db.getProviders();

    // Match provider by org name or phone or name, fallback to first
    let myProv = providers.find(p => 
      (user.ngoDetails && p.organizationName.toLowerCase().includes(user.ngoDetails.organizationName.toLowerCase())) ||
      p.phone === user.phone ||
      p.name.toLowerCase().includes(user.name.toLowerCase()) ||
      p.organizationName.toLowerCase().includes(user.name.toLowerCase())
    ) || providers[0];

    setProviderProfile(myProv);
    setIsAvailable(myProv.isAvailable);

    // Filter relevant cases for this provider / active organization
    const myCases = allReqs.filter(r => 
      r.assignedProviderId === myProv.id || 
      r.assignedProviderName === myProv.name ||
      (r.status === 'Assistance Arranged' && !r.assignedProviderId) ||
      (r.classification?.barriers?.some(b => myProv.barriersHandled.includes(b)))
    );
    setRequests(myCases);
  };

  useEffect(() => {
    loadData();
    const unsubDb = db.subscribe(loadData);
    const unsubLang = subscribeAppLanguage(setAppLang);
    return () => {
      unsubDb();
      unsubLang();
    };
  }, []);

  const handleToggleAvailability = () => {
    if (!providerProfile) return;
    const updated = { ...providerProfile, isAvailable: !isAvailable };
    db.saveProvider(updated);
    setIsAvailable(!isAvailable);
  };

  const handleAcceptReferral = (req: CareRequest) => {
    if (!providerProfile) return;
    db.handleProviderResponse(req.id, true, `${currentUser.name} (${providerProfile.name})`);
  };

  const handleOpenDeclineModal = (req: CareRequest) => {
    setDeclineModalCase(req);
    setDeclineReason('');
  };

  const handleConfirmDecline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineModalCase || !declineReason.trim() || !providerProfile) return;

    db.handleProviderResponse(declineModalCase.id, false, `${currentUser.name} (${providerProfile.name})`, declineReason);
    setDeclineModalCase(null);
  };

  const handleRecordAssistanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordAssistanceCase || !providerProfile) return;

    db.updateRequest(
      recordAssistanceCase.id,
      {
        status: 'Outcome Verification',
        timelineLogs: [
          ...recordAssistanceCase.timelineLogs,
          {
            status: 'Outcome Verification',
            timestamp: new Date().toISOString(),
            note: `Assistance delivered by volunteer ${currentUser.name} (${providerProfile.name}): ${assistanceProofNote || 'Direct transit/support completed.'}`,
            actor: `${currentUser.name} (${providerProfile.name})`
          }
        ]
      },
      currentUser.name,
      'ngo'
    );
    setRecordAssistanceCase(null);
    setAssistanceProofNote('');
  };

  const handleSwitchHelper = (helperId: string) => {
    db.switchUser(helperId);
  };

  const handleCreateNewHelper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHelperName.trim() || !newHelperPhone.trim()) return;

    const created = db.addNgoVolunteer({
      name: newHelperName.trim(),
      phone: newHelperPhone.trim(),
      organizationName: newHelperOrg.trim() || providerProfile?.organizationName || 'Community Care Support Network',
      services: [newHelperService, 'Transportation'],
      hasWheelchairVan: newHelperService === 'Mobility' || newHelperService === 'Transportation',
      hasSignLanguageEscort: newHelperService === 'Language' || newHelperService === 'Accessibility'
    });

    db.switchUser(created.id);
    setIsAddHelperModalOpen(false);
    setNewHelperName('');
    setNewHelperPhone('');
    setNewHelperOrg('');
  };

  if (!providerProfile) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
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
          {currentUser.name} • {providerProfile.name}
        </span>
      </div>

      {/* Role Scoped Usage Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="text-xs font-bold text-emerald-900">
            {t('myUsageOnly', appLang)} — {t('ngo', appLang)}
          </span>
        </div>
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
          {currentUser.name}
        </span>
      </div>
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {t('ngo', appLang)}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              {t('verified', appLang)} ✓
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {currentUser.name}
          </h1>
          <p className="text-sm font-semibold text-slate-700">
            {currentUser.ngoDetails?.organizationName || providerProfile.organizationName}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>{currentUser.district || providerProfile.districtsCovered.join(', ')}</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>{currentUser.phone || providerProfile.phone}</span>
            </span>
          </div>
        </div>

        {/* Operational Availability Toggle */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:items-end gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t('operationalStatus', appLang)}
          </span>
          <button
            onClick={handleToggleAvailability}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer ${
              isAvailable 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-slate-300 hover:bg-slate-400 text-slate-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isAvailable ? t('activeAccepting', appLang) : t('pausedNotAccepting', appLang)}</span>
          </button>
        </div>
      </div>

      {/* MULTIPLE NGO HELPERS & VOLUNTEERS SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                {t('activeNgoHelpers', appLang)} ({ngoHelpers.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('ngoHelperSub', appLang)}
            </p>
          </div>

          <button
            onClick={() => setIsAddHelperModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addNgoHelper', appLang)}</span>
          </button>
        </div>

        {/* Roster of NGO helpers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ngoHelpers.map((helper) => {
            const isCurrent = currentUser.id === helper.id;
            return (
              <div 
                key={helper.id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                  isCurrent 
                    ? 'border-emerald-400 bg-emerald-50/40 shadow-xs' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 block truncate">
                      {helper.name}
                    </span>
                    {isCurrent ? (
                      <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full shrink-0">
                        {t('activeSession', appLang)}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">
                        {helper.district}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-600 mt-0.5 truncate">
                    {helper.ngoDetails?.organizationName || 'Community NGO'}
                  </p>
                  
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{helper.phone}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {helper.ngoDetails?.services?.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                        {s}
                      </span>
                    ))}
                    {helper.ngoDetails?.hasWheelchairVan && (
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium">
                        Wheelchair Van
                      </span>
                    )}
                    {helper.ngoDetails?.hasSignLanguageEscort && (
                      <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-medium">
                        Sign Language
                      </span>
                    )}
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => handleSwitchHelper(helper.id)}
                      className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('switchNgoHelper', appLang)}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referred Cases Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {t('tabReferrals', appLang)} ({requests.length})
          </h2>
          <span className="text-xs text-slate-500">
            Viewing referrals handled by {currentUser.name} & partner team
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">All Referrals Processed</h3>
            <p className="text-xs text-slate-400">No pending referrals waiting for provider action.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => {
              const isAccepted = req.status === 'Assistance Arranged' || req.status === 'Outcome Verification' || req.status === 'Resolved';

              return (
                <div 
                  key={req.id} 
                  className={`bg-white rounded-3xl p-6 border shadow-xs transition space-y-4 ${
                    req.failureFlag ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">Case: {req.id}</span>
                        <h3 className="font-bold text-slate-900 text-base">{req.patientName}</h3>
                        <span className="text-xs text-slate-500">• {req.district}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Hospital: <strong>{req.appointmentDetails?.hospitalName || 'District Headquarter Hospital'}</strong> • Date: {req.appointmentDetails?.date || 'Scheduled'}
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-black self-start sm:self-auto bg-slate-100 text-slate-800">
                      {req.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Barriers:</span>
                    {req.classification.barriers.map(b => (
                      <span key={b} className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded text-xs font-semibold">
                        {b}
                      </span>
                    ))}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      Assigned Helper: <strong className="text-emerald-800">{currentUser.name}</strong> • Worker: {req.assignedWorkerName || req.workerName || 'Anitha Sundaram'}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isAccepted && (
                        <>
                          <button
                            onClick={() => handleOpenDeclineModal(req)}
                            className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            {t('declineReferral', appLang)}
                          </button>
                          <button
                            onClick={() => handleAcceptReferral(req)}
                            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>{t('acceptReferral', appLang)}</span>
                          </button>
                        </>
                      )}

                      {isAccepted && req.status !== 'Outcome Verification' && req.status !== 'Resolved' && (
                        <button
                          onClick={() => setRecordAssistanceCase(req)}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                          <span>{t('recordAssistanceBtn', appLang)}</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add New NGO Helper Modal */}
      {isAddHelperModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">{t('addNgoHelper', appLang)}</h3>
              </div>
              <button 
                onClick={() => setIsAddHelperModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Mobilize another NGO volunteer/driver to assist patients reaching hospitals.
            </p>

            <form onSubmit={handleCreateNewHelper} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('ngoHelperName', appLang)} *
                </label>
                <input
                  type="text"
                  required
                  value={newHelperName}
                  onChange={(e) => setNewHelperName(e.target.value)}
                  placeholder="e.g. S. Murugesan (Field Driver)"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('ngoHelperPhone', appLang)} *
                </label>
                <input
                  type="tel"
                  required
                  value={newHelperPhone}
                  onChange={(e) => setNewHelperPhone(e.target.value)}
                  placeholder="e.g. +91 98402 11999"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('ngoHelperOrg', appLang)}
                </label>
                <input
                  type="text"
                  value={newHelperOrg}
                  onChange={(e) => setNewHelperOrg(e.target.value)}
                  placeholder="e.g. Kaveri Seva Trust / Samarth Foundation"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('ngoHelperDomain', appLang)}
                </label>
                <select
                  value={newHelperService}
                  onChange={(e) => setNewHelperService(e.target.value as BarrierType)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Transportation">Transportation (Ambulatory & Vans)</option>
                  <option value="Mobility">Mobility & Wheelchair Lift Transit</option>
                  <option value="Financial">Financial Aid & Medical Co-pay</option>
                  <option value="Language">Language & Sign Language Escort</option>
                  <option value="Caregiver Support">Caregiver Support & Elder Care</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddHelperModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {t('cancel', appLang)}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  {t('save', appLang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decline Referral Modal */}
      {declineModalCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">{t('declineReferral', appLang)}</h3>
            <p className="text-xs text-slate-600 mb-4">
              Patient: <strong>{declineModalCase.patientName}</strong>
            </p>

            <form onSubmit={handleConfirmDecline} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('declineReasonPrompt', appLang)}
                </label>
                <textarea
                  rows={3}
                  required
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g. Drivers committed on another medical route / lack of wheelchair van on requested date..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeclineModalCase(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {t('cancel', appLang)}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  {t('confirmDecline', appLang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Assistance Delivered Modal */}
      {recordAssistanceCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-teal-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">{t('recordAssistanceBtn', appLang)}</h3>
            <p className="text-xs text-slate-600 mb-4">
              Case for: <strong>{recordAssistanceCase.patientName}</strong>
            </p>

            <form onSubmit={handleRecordAssistanceSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('assistanceNotesPrompt', appLang)}
                </label>
                <textarea
                  rows={3}
                  required
                  value={assistanceProofNote}
                  onChange={(e) => setAssistanceProofNote(e.target.value)}
                  placeholder="e.g. Round-trip wheelchair van dispatch completed; patient safely reached hospital clinic."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRecordAssistanceCase(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {t('cancel', appLang)}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  {t('save', appLang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
