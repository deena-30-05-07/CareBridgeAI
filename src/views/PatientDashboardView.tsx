import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Plus, 
  Compass, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  Building2
} from 'lucide-react';
import { db } from '../lib/db';
import { CareRequest, User, MissedAppointmentFollowUp, AIClassification } from '../types';
import { analyzeAccessBarrier } from '../lib/api';
import { getAppLanguage, subscribeAppLanguage, t, AppLanguage } from '../lib/i18n';

interface PatientDashboardViewProps {
  onNavigate: (route: string) => void;
  onGoBack?: () => void;
  onOpenConsent: () => void;
  onOpenTour: () => void;
}

export const PatientDashboardView: React.FC<PatientDashboardViewProps> = ({ 
  onNavigate, 
  onGoBack,
  onOpenConsent,
  onOpenTour
}) => {
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
  const [requests, setRequests] = useState<CareRequest[]>([]);
  const [followUps, setFollowUps] = useState<MissedAppointmentFollowUp[]>([]);
  const [appointments, setAppointments] = useState<ReturnType<typeof db.getAppointments>>([]);
  const [followUpDrafts, setFollowUpDrafts] = useState<Record<string, string>>({});
  const [followUpAnalyses, setFollowUpAnalyses] = useState<Record<string, AIClassification>>({});
  const [analyzingFollowUpId, setAnalyzingFollowUpId] = useState<string | null>(null);
  const [appLang, setAppLang] = useState<AppLanguage>(getAppLanguage());

  useEffect(() => {
    const load = () => {
      const current = db.getCurrentUser();
      setCurrentUser(current);

      const all = db.getRequests();
      const myCases = all.filter(req =>
        req.patientId === current.id ||
        req.patientPhone === current.phone ||
        req.patientName === current.name
      );

      setRequests(myCases);
      setFollowUps(db.getAppointmentFollowUps().filter(item => item.patientId === current.id));
      setAppointments(db.getAppointments().filter(item => item.patientId === current.id));
    };

    load();
    const unsubDb = db.subscribe(load);
    const unsubLang = subscribeAppLanguage(setAppLang);
    return () => {
      unsubDb();
      unsubLang();
    };
  }, []);

  const submitFollowUpResponse = async (followUp: MissedAppointmentFollowUp) => {
    const response = followUpDrafts[followUp.id]?.trim();
    if (!response) return;
    setAnalyzingFollowUpId(followUp.id);
    try {
      const analysis = await analyzeAccessBarrier({ inputType: 'text', text: response });
      db.savePatientFollowUpResponse(followUp.id, currentUser, response, analysis);
      setFollowUpAnalyses(current => ({ ...current, [followUp.id]: analysis }));
    } finally {
      setAnalyzingFollowUpId(null);
    }
  };

  const confirmFollowUp = (followUp: MissedAppointmentFollowUp) => {
    const requestId = db.confirmFollowUpAnalysis(followUp.id, currentUser);
    if (requestId) window.alert(`Your response is confirmed and linked to assistance case ${requestId}.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Top Prominent Back / Previous Button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <button
          onClick={onGoBack || (() => onNavigate('/'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition border border-slate-300 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-teal-700" />
          <span>{t('back', appLang)}</span>
        </button>

        <span className="text-xs font-semibold text-slate-500">
          {currentUser.name} • {currentUser.district}
        </span>
      </div>
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black">
            {appLang === 'ta' ? `வணக்கம், ${currentUser.name}!` : `Welcome, ${currentUser.name}!`}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-xl leading-relaxed">
            {t('v2cSub', appLang)}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('/patient/assistant')}
            className="px-5 py-3 bg-white hover:bg-teal-50 text-teal-900 font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mic className="w-4 h-4 text-teal-700" />
            <span>{t('navVoice2Care', appLang)}</span>
          </button>
          <button
            onClick={onOpenTour}
            className="px-4 py-3 bg-teal-800/80 hover:bg-teal-800 text-white font-bold text-xs rounded-2xl border border-teal-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('tour', appLang)}</span>
          </button>
        </div>
      </div>

      {followUps.length > 0 && <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Appointment follow-up</h2>
        {followUps.map(followUp => {
          const analysis = followUpAnalyses[followUp.id] || followUp.analysis;
          return <article key={followUp.id} className="bg-white border border-amber-200 rounded-xl p-4 space-y-3">
            <div><h3 className="font-bold text-sm">Your hospital would like to understand whether you need support</h3><p className="text-xs text-slate-600 mt-1">{followUp.promptMessage}</p><p className="text-xs text-slate-600 mt-1">You can answer in your own words. Quick replies are optional.</p></div>
            {!followUp.patientConfirmedAnalysis && <>
              <div className="flex flex-wrap gap-2">
                {['I could not afford transportation.', 'I had financial difficulties.', 'Travel was difficult because of mobility or disability.', 'I did not have someone to accompany me.', 'I had a personal or family emergency.', 'I forgot the appointment.', 'I was unwell or unable to travel.', 'Other reason — explain in my own words.'].map(choice => <button key={choice} type="button" onClick={() => setFollowUpDrafts(current => ({ ...current, [followUp.id]: [current[followUp.id], choice].filter(Boolean).join(' ') }))} className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-[11px] text-slate-700">{choice}</button>)}
              </div>
              <textarea rows={3} value={followUpDrafts[followUp.id] ?? followUp.patientResponse ?? ''} onChange={event => setFollowUpDrafts(current => ({ ...current, [followUp.id]: event.target.value }))} placeholder="Type your reason in your preferred language. You may describe more than one difficulty." className="w-full border border-slate-300 rounded-lg p-3 text-sm" />
              <div className="flex flex-wrap gap-2 items-center"><button onClick={() => submitFollowUpResponse(followUp)} disabled={!followUpDrafts[followUp.id]?.trim() || analyzingFollowUpId === followUp.id} className="px-4 py-2 bg-teal-700 text-white text-xs font-bold rounded-lg disabled:opacity-50">{analyzingFollowUpId === followUp.id ? 'Analyzing…' : followUp.patientResponse ? 'Update response analysis' : 'Send response for review'}</button><button onClick={() => onNavigate(`/patient/assistant?followup=${encodeURIComponent(followUp.id)}`)} className="px-3 py-2 border rounded-lg text-xs font-bold text-slate-700">Reply with Voice2Care</button></div>
            </>}
            {(followUp.patientResponse || analysis) && <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs"><p><strong>Your response:</strong> {followUp.patientResponse}</p><p><strong>Detected barriers:</strong> {analysis?.barriers.join(', ') || 'Analysis pending'}</p><p><strong>AI explanation:</strong> {analysis?.plainLanguageReason}</p><p className="text-slate-500">Please review this interpretation. You can correct it by sending an updated response.</p>{!followUp.patientConfirmedAnalysis && <button onClick={() => confirmFollowUp(followUp)} className="px-4 py-2 bg-teal-700 text-white font-bold rounded-lg">Confirm this analysis</button>}{followUp.patientConfirmedAnalysis && <p className="font-bold text-emerald-700">Confirmed · assistance case linked</p>}</div>}
          </article>;
        })}
      </section>}

      {/* Consent Status Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className={`w-5 h-5 ${currentUser.consentGiven ? 'text-teal-600' : 'text-amber-500'}`} />
          <div>

          {appointments.length > 0 && <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">My hospital appointments</h2>
            {appointments.map(appointment => <article key={appointment.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex flex-wrap justify-between gap-2"><strong>{appointment.hospitalName}</strong><span className="px-2 py-1 rounded bg-slate-100">{appointment.status.replaceAll('_', ' ')}</span></div>
              <p>{appointment.date} · {appointment.time}</p>
              {appointment.rescheduleRequestedDate && <p className="text-amber-800">Rescheduling requested for {appointment.rescheduleRequestedDate}; hospital confirmation is pending.</p>}
              {appointment.reminders.map(reminder => <div key={reminder.id} className="border-l-2 border-teal-500 pl-2 text-slate-600"><p>{reminder.message}</p><p className="text-[10px] text-slate-400">In-app demo · {new Date(reminder.sentAt).toLocaleString()}</p></div>)}
            </article>)}
          </section>}
            <span className="font-bold text-slate-800">
              {currentUser.consentGiven ? 'Informed Consent Active' : 'Consent Pending'}
            </span>
          </div>
        </div>
        <button
          onClick={onOpenConsent}
          className="text-xs font-bold text-teal-700 hover:text-teal-900 underline shrink-0 cursor-pointer"
        >
          {t('privacyCharter', appLang)}
        </button>
      </div>

      {/* Active Care Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {t('navTrackCare', appLang)}
          </h2>
          <button
            onClick={() => onNavigate('/patient/request')}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('requestFormTitle', appLang)}</span>
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">No Active Requests</h3>
            <button
              onClick={() => onNavigate('/patient/assistant')}
              className="mt-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              {t('navVoice2Care', appLang)}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map(req => (
              <div 
                key={req.id} 
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">ID: {req.id}</span>
                    <h3 className="font-bold text-slate-900 text-base">{req.patientName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{req.appointmentDetails?.hospitalName || 'District Headquarter Hospital'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    req.status === 'Resolved' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : req.failureFlag 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-teal-50 text-teal-800 border border-teal-200'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {req.classification.barriers.map(b => (
                    <span key={b} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold">
                      {b}
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-slate-400">Date: {req.appointmentDetails?.date || 'Scheduled'}</span>
                  <button
                    onClick={() => onNavigate('/patient/tracking')}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('trackRequestBtn', appLang)}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
