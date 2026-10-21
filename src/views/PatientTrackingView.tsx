import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  Building2, 
  Calendar, 
  MapPin, 
  RefreshCw, 
  RotateCcw, 
  Check, 
  X,
  FileCheck,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { db } from '../lib/db';
import { CareRequest, CaseStatus, User } from '../types';
import { getAppLanguage, subscribeAppLanguage, t, AppLanguage } from '../lib/i18n';

interface PatientTrackingViewProps {
  onNavigate: (route: string) => void;
  onGoBack?: () => void;
}

const STAGES: CaseStatus[] = [
  'Submitted',
  'Under Review',
  'Worker Assigned',
  'Assistance Arranged',
  'Outcome Verification',
  'Resolved'
];

export const PatientTrackingView: React.FC<PatientTrackingViewProps> = ({ onNavigate, onGoBack }) => {
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
  const [requests, setRequests] = useState<CareRequest[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [appLang, setAppLang] = useState<AppLanguage>(getAppLanguage());

  // Outcome verification survey modal
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyAnswers, setSurveyAnswers] = useState({
    providerContacted: true,
    receivedAssistance: true,
    attendedAppointment: true,
    isProblemResolved: true,
    patientNotes: ''
  });

  // Reopen modal
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  useEffect(() => {
    const loadData = () => {
      const current = db.getCurrentUser();
      setCurrentUser(current);

      const allReqs = db.getRequests();
      const myReqs = allReqs.filter(req =>
        req.patientId === current.id ||
        req.patientPhone === current.phone ||
        req.patientName === current.name
      );

      setRequests(myReqs);

      if (myReqs.length > 0) {
        setSelectedCaseId(prevSelected => prevSelected && myReqs.some(req => req.id === prevSelected) ? prevSelected : myReqs[0].id);
      } else {
        setSelectedCaseId('');
      }
    };

    loadData();
    const unsubDb = db.subscribe(loadData);
    const unsubLang = subscribeAppLanguage(setAppLang);
    return () => {
      unsubDb();
      unsubLang();
    };
  }, []);

  const activeCase = requests.find(r => r.id === selectedCaseId) || requests[0];

  const getStageIndex = (status: CaseStatus) => {
    return STAGES.indexOf(status);
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase) return;

    db.submitOutcomeVerification(
      activeCase.id,
      surveyAnswers,
      currentUser.name || 'Lakshmi Ramasamy'
    );
    setShowSurveyModal(false);
  };

  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase || !reopenReason.trim()) return;

    db.reopenCase(
      activeCase.id,
      reopenReason,
      currentUser.name || 'Lakshmi Ramasamy'
    );
    setShowReopenModal(false);
    setReopenReason('');
  };

  const stageTranslationMap: Record<CaseStatus, string> = {
    'Submitted': t('stageSubmitted', appLang),
    'Under Review': t('stageUnderReview', appLang),
    'Worker Assigned': t('stageWorkerAssigned', appLang),
    'Assistance Arranged': t('stageAssistanceArranged', appLang),
    'Outcome Verification': t('stageOutcomeVerification', appLang),
    'Resolved': t('stageResolved', appLang)
  };

  if (!activeCase) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition border border-slate-300 shadow-xs mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-teal-700" />
            <span>{t('back', appLang)}</span>
          </button>
        )}
        <h2 className="text-xl font-bold text-slate-800">No Care Requests Found</h2>
        <p className="text-sm text-slate-500">You have not submitted an access assistance request yet.</p>
        <button
          onClick={() => onNavigate('/patient/assistant')}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl cursor-pointer"
        >
          {t('v2cTitle', appLang)}
        </button>
      </div>
    );
  }

  const currentStageIdx = getStageIndex(activeCase.status);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Top Prominent Back / Previous Button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <button
          onClick={onGoBack || (() => onNavigate('/patient/dashboard'))}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition border border-slate-300 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-teal-700" />
          <span>{t('back', appLang)}</span>
        </button>

        <span className="text-xs font-semibold text-slate-500">
          Case: <strong className="font-mono text-teal-800">{activeCase.id}</strong>
        </span>
      </div>

      {/* Title & Case Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            {t('navTrackCare', appLang)}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t('trackingTitle', appLang)}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('trackingSub', appLang)}
          </p>
        </div>

        {/* Case selector tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 shrink-0">{t('casesList', appLang)}</span>
          {requests.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedCaseId(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border cursor-pointer ${
                selectedCaseId === r.id 
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {r.patientName.split(' ')[0]} ({r.id})
            </button>
          ))}
        </div>
      </div>

      {/* Support Failure Notification Banner */}
      {activeCase.failureFlag && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-block px-2 py-0.5 rounded bg-rose-200 text-rose-900 text-[10px] font-black uppercase tracking-wider mb-1">
                {t('failureDetected', appLang)}
              </div>
              <h3 className="text-base font-bold text-rose-950">
                {t('failureSub', appLang)}
              </h3>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                {activeCase.failureReason || 'Provider was unable to fulfill assistance. Case escalated to healthcare worker.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-rose-200">
            <button
              onClick={() => {
                db.switchRoleQuick('worker');
                onNavigate(`/worker/dashboard?focus=${activeCase.id}`);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              {t('reassignBtn', appLang)}
            </button>
          </div>
        </div>
      )}

      {/* Case Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{activeCase.patientName}</h2>
              <span className="text-xs text-slate-400">• Age {activeCase.patientAge} • {activeCase.district}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {activeCase.classification.barriers.map(b => (
                <span key={b} className="px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-md text-xs font-bold">
                  {b}
                </span>
              ))}
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                {activeCase.classification.detectedLanguage}
              </span>
              {activeCase.repeatBarrierDetected && (
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-md text-xs font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" /> {t('repeatBarrierAlert', appLang)}
                </span>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black mt-1 ${
              activeCase.status === 'Resolved' 
                ? 'bg-emerald-100 text-emerald-800' 
                : activeCase.failureFlag 
                  ? 'bg-rose-100 text-rose-800' 
                  : 'bg-teal-100 text-teal-900'
            }`}>
              {stageTranslationMap[activeCase.status] || activeCase.status}
            </span>
          </div>
        </div>

        {/* 6-Stage Care Rescue Timeline Tracker */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
            {t('careRescuePipeline', appLang)}
          </h3>

          <div className="relative">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {STAGES.map((st, idx) => {
                const isCompleted = idx < currentStageIdx || activeCase.status === 'Resolved';
                const isCurrent = idx === currentStageIdx && activeCase.status !== 'Resolved';
                const isUpcoming = idx > currentStageIdx;

                return (
                  <div 
                    key={st}
                    className={`rounded-2xl p-3 border transition flex flex-col justify-between ${
                      isCompleted 
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900' 
                        : isCurrent 
                          ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-200' 
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-teal-100' : 'text-slate-400'}`}>
                        0{idx + 1}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </div>
                    <div className="text-xs font-bold leading-tight">
                      {stageTranslationMap[st]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold mb-1">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>{t('appointmentDetails', appLang)}</span>
            </div>
            <p className="text-xs font-bold text-slate-900">{activeCase.appointmentDetails?.hospitalName || 'District Headquarter Hospital'}</p>
            <p className="text-xs text-slate-500 mt-0.5">Date: {activeCase.appointmentDetails?.date || 'Scheduled'}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold mb-1">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>{t('assignedProvider', appLang)}</span>
            </div>
            <p className="text-xs font-bold text-slate-900">{activeCase.assignedProviderName || 'Awaiting Worker Assignment'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{activeCase.classification.recommendedAssistanceType}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold mb-1">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>{t('assignedWorker', appLang)}</span>
            </div>
            <p className="text-xs font-bold text-slate-900">{activeCase.assignedWorkerName || activeCase.workerName || 'Anitha Sundaram (ASHA)'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{activeCase.district} Sector</p>
          </div>

        </div>

        {/* Timeline Logs */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            {t('journeyTimeline', appLang)}
          </h3>
          <div className="space-y-3">
            {activeCase.timelineLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{stageTranslationMap[log.status] || log.status}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {log.actor && <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded font-medium">by {log.actor}</span>}
                  </div>
                  <p className="text-slate-600 mt-0.5">{log.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions: Outcome Verification & Reopen */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          
          <button
            onClick={() => setShowReopenModal(true)}
            className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-rose-50 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('reopenCaseBtn', appLang)}</span>
          </button>

          <button
            onClick={() => setShowSurveyModal(true)}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>{t('verifyOutcomeBtn', appLang)}</span>
          </button>

        </div>

      </div>

      {/* Outcome Evidence Modal (Clean options without verbose clutter) */}
      {showSurveyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-teal-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t('outcomeSurveyTitle', appLang)}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{t('outcomeSurveySub', appLang)}</p>
              </div>
              <button onClick={() => setShowSurveyModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSurveySubmit} className="space-y-4">
              
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  {t('q1', appLang)}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-bold">
                    <input 
                      type="radio" 
                      name="q1" 
                      checked={surveyAnswers.providerContacted === true}
                      onChange={() => setSurveyAnswers({...surveyAnswers, providerContacted: true})}
                    />
                    <span>{t('yes', appLang)}</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-bold">
                    <input 
                      type="radio" 
                      name="q1" 
                      checked={surveyAnswers.providerContacted === false}
                      onChange={() => setSurveyAnswers({...surveyAnswers, providerContacted: false})}
                    />
                    <span>{t('no', appLang)}</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  {t('q2', appLang)}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-bold">
                    <input 
                      type="radio" 
                      name="q2" 
                      checked={surveyAnswers.receivedAssistance === true}
                      onChange={() => setSurveyAnswers({...surveyAnswers, receivedAssistance: true})}
                    />
                    <span>{t('yes', appLang)}</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-bold">
                    <input 
                      type="radio" 
                      name="q2" 
                      checked={surveyAnswers.receivedAssistance === false}
                      onChange={() => setSurveyAnswers({...surveyAnswers, receivedAssistance: false})}
                    />
                    <span>{t('no', appLang)}</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  {t('q3', appLang)}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-bold">
                    <input 
                      type="radio" 
                      name="q3" 
                      checked={surveyAnswers.attendedAppointment === true}
                      onChange={() => setSurveyAnswers({...surveyAnswers, attendedAppointment: true})}
                    />
                    <span>{t('yes', appLang)}</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-bold">
                    <input 
                      type="radio" 
                      name="q3" 
                      checked={surveyAnswers.attendedAppointment === false}
                      onChange={() => setSurveyAnswers({...surveyAnswers, attendedAppointment: false})}
                    />
                    <span>{t('no', appLang)}</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  {t('q4', appLang)}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-bold">
                    <input 
                      type="radio" 
                      name="q4" 
                      checked={surveyAnswers.isProblemResolved === true}
                      onChange={() => setSurveyAnswers({...surveyAnswers, isProblemResolved: true})}
                    />
                    <span>{t('yes', appLang)}</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-bold">
                    <input 
                      type="radio" 
                      name="q4" 
                      checked={surveyAnswers.isProblemResolved === false}
                      onChange={() => setSurveyAnswers({...surveyAnswers, isProblemResolved: false})}
                    />
                    <span>{t('no', appLang)}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('optionalFeedback', appLang)}
                </label>
                <textarea
                  rows={2}
                  value={surveyAnswers.patientNotes}
                  onChange={(e) => setSurveyAnswers({...surveyAnswers, patientNotes: e.target.value})}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSurveyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {t('cancel', appLang)}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  {t('saveOutcomeBtn', appLang)}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Reopen Case Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">{t('reopenTitle', appLang)}</h3>
            <p className="text-xs text-slate-600 mb-4">
              {t('reopenPrompt', appLang)}
            </p>
            <form onSubmit={handleReopenSubmit} className="space-y-4">
              <textarea
                rows={3}
                required
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReopenModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {t('cancel', appLang)}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  {t('reopenCaseBtn', appLang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
