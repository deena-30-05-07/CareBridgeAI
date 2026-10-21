import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Plus, 
  Edit3, 
  RotateCw, 
  Wifi, 
  WifiOff, 
  Search, 
  Filter, 
  ArrowRight, 
  Sparkles, 
  Check, 
  X,
  ShieldAlert,
  UserPlus,
  Accessibility,
  Save,
  Clock,
  Compass,
  FileCheck,
  ArrowLeft
} from 'lucide-react';
import { db } from '../lib/db';
import { CareRequest, SupportProvider, User, BarrierType, OfflineDraft, AccessibilityProfile, PatientAppointment, MissedAppointmentFollowUp } from '../types';
import { getAppLanguage, subscribeAppLanguage, t, AppLanguage } from '../lib/i18n';

interface WorkerDashboardViewProps {
  onNavigate: (route: string) => void;
  onGoBack?: () => void;
}

interface AppointmentTableProps {
  appointments: PatientAppointment[];
  currentUser: User;
  onReminder: (appointment: PatientAppointment, forceResend?: boolean) => void;
  onAttendance: (appointment: PatientAppointment, status: 'completed' | 'missed' | 'attendance_unconfirmed') => void;
  onRequestReason: (appointment: PatientAppointment) => void;
  onReschedule: (appointment: PatientAppointment) => void;
  onPatient: (appointment: PatientAppointment) => void;
}

const AppointmentTable: React.FC<AppointmentTableProps> = ({ appointments, onReminder, onAttendance, onRequestReason, onReschedule, onPatient }) => (
  <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
    <table className="w-full text-left text-xs">
      <thead className="bg-slate-50 text-slate-500">
        <tr><th className="p-3">Patient</th><th className="p-3">Date / Time</th><th className="p-3">Status</th><th className="p-3">Reminders</th><th className="p-3">Actions</th></tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {appointments.map(appointment => (
          <tr key={appointment.id}>
            <td className="p-3"><strong className="text-slate-800">{appointment.patientName}</strong><span className="block text-slate-400">{appointment.patientId}</span></td>
            <td className="p-3 whitespace-nowrap">{appointment.date} · {appointment.time}</td>
            <td className="p-3"><span className="rounded px-2 py-1 bg-slate-100 text-slate-700">{appointment.status.replaceAll('_', ' ')}</span></td>
            <td className="p-3">{appointment.reminders.length} · demo</td>
            <td className="p-3"><div className="flex flex-wrap gap-1.5">
              <button onClick={() => onPatient(appointment)} className="px-2 py-1 border rounded text-slate-700">View Patient</button>
              <button onClick={() => window.alert(`Appointment ${appointment.id}\n${appointment.hospitalName}\n${appointment.date} at ${appointment.time}\nStatus: ${appointment.status.replaceAll('_', ' ')}\nAttendance review: ${appointment.attendanceReviewedAt ? new Date(appointment.attendanceReviewedAt).toLocaleString() : 'Not reviewed'}`)} className="px-2 py-1 border rounded text-slate-700">View Appointment</button>
              {appointment.patientPhone && <a href={`tel:${appointment.patientPhone}`} className="px-2 py-1 border rounded text-slate-700">Contact Patient</a>}
              {appointment.reminders.length > 0 && <button onClick={() => window.alert(appointment.reminders.map(reminder => `${new Date(reminder.sentAt).toLocaleString()} · ${reminder.deliveryStatus}\n${reminder.message}`).join('\n\n'))} className="px-2 py-1 border rounded text-slate-700">Reminder History</button>}
              <button onClick={() => onReminder(appointment, appointment.reminders.length > 0)} className="px-2 py-1 bg-teal-700 text-white rounded">{appointment.reminders.length ? 'Resend Reminder' : 'Send Reminder'}</button>
              {appointment.status === 'attendance_unconfirmed' && <>
                <button onClick={() => onAttendance(appointment, 'completed')} className="px-2 py-1 border border-emerald-300 text-emerald-800 rounded">Confirm attended</button>
                <button onClick={() => onAttendance(appointment, 'missed')} className="px-2 py-1 border border-rose-300 text-rose-800 rounded">Confirm missed</button>
              </>}
              {appointment.status === 'missed' && <>
                <button onClick={() => onRequestReason(appointment)} className="px-2 py-1 border border-amber-300 text-amber-900 rounded">Request reason</button>
                <button onClick={() => onReschedule(appointment)} className="px-2 py-1 border rounded text-slate-700">Request reschedule</button>
              </>}
            </div></td>
          </tr>
        ))}
        {appointments.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">No hospital appointments in this view.</td></tr>}
      </tbody>
    </table>
  </div>
);

export const WorkerDashboardView: React.FC<WorkerDashboardViewProps> = ({ onNavigate, onGoBack }) => {
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
  const [requests, setRequests] = useState<CareRequest[]>([]);
  const [providers, setProviders] = useState<SupportProvider[]>([]);
  const [drafts, setDrafts] = useState<OfflineDraft[]>([]);
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [followUps, setFollowUps] = useState<MissedAppointmentFollowUp[]>([]);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'resolved' | 'offline_drafts' | 'register_invisible' | 'overview' | 'patients' | 'today' | 'upcoming' | 'missed' | 'responses' | 'schemes' | 'reports'>('overview');
  const [appLang, setAppLang] = useState<AppLanguage>(getAppLanguage());

  // Modals
  const [assignModalCase, setAssignModalCase] = useState<CareRequest | null>(null);
  const [correctionModalCase, setCorrectionModalCase] = useState<CareRequest | null>(null);
  const [correctionBarriers, setCorrectionBarriers] = useState<BarrierType[]>([]);
  const [correctionReason, setCorrectionReason] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [barrierFilter, setBarrierFilter] = useState<string>('all');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');
  const [appointmentDateFilter, setAppointmentDateFilter] = useState('');
  const [assistanceFilter, setAssistanceFilter] = useState('all');

  // Invisible Patient Registration Form State
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: 60,
    phone: '',
    district: 'Tiruchirappalli',
    notes: '',
    barriers: ['Transportation', 'Financial'] as BarrierType[],
    accessibility: {
      requiresWheelchair: false,
      visualImpairment: false,
      hearingImpairment: false,
      requiresSignLanguage: false,
      bedridden: false
    } as AccessibilityProfile,
    consentObtained: true
  });

  useEffect(() => {
    const load = () => {
      const user = db.getCurrentUser();
      setRequests(db.getRequests().filter(request =>
        request.workerId === user.id ||
        request.appointmentDetails?.hospitalName?.trim().toLowerCase() === user.hospitalName?.trim().toLowerCase()
      ));
      setProviders(db.getProviders());
      setDrafts(db.getOfflineDrafts());
      setCurrentUser(user);
      setAppointments(db.getHospitalAppointments(user));
      setFollowUps(db.getAppointmentFollowUps().filter(followUp =>
        db.getHospitalAppointments(user).some(appointment => appointment.id === followUp.appointmentId)
      ));
    };
    load();
    const unsubDb = db.subscribe(load);
    const unsubLang = subscribeAppLanguage(setAppLang);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if focused on specific case via query params
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const focusCaseId = urlParams.get('focus');
      if (focusCaseId) {
        const found = db.getRequestById(focusCaseId);
        if (found) {
          setAssignModalCase(found);
        }
      }
    }

    return () => {
      unsubDb();
      unsubLang();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBarrier = barrierFilter === 'all' || r.classification.barriers.includes(barrierFilter as any);

    if (activeTab === 'pending') {
      return matchesSearch && matchesBarrier && (r.status === 'Submitted' || r.status === 'Under Review' || r.failureFlag);
    } else if (activeTab === 'active') {
      return matchesSearch && matchesBarrier && (r.status === 'Worker Assigned' || r.status === 'Assistance Arranged' || r.status === 'Outcome Verification') && !r.failureFlag;
    } else if (activeTab === 'resolved') {
      return matchesSearch && matchesBarrier && r.status === 'Resolved';
    }
    return matchesSearch && matchesBarrier;
  });

  const handleOpenAssignModal = (req: CareRequest) => {
    setAssignModalCase(req);
  };

  const handleAssignProvider = (provider: SupportProvider) => {
    if (!assignModalCase) return;
    db.assignProvider(
      assignModalCase.id, 
      provider.id, 
      provider.name, 
      currentUser.name || 'Anitha Sundaram'
    );
    setAssignModalCase(null);
  };

  const handleOpenCorrectionModal = (req: CareRequest) => {
    setCorrectionModalCase(req);
    setCorrectionBarriers([...req.classification.barriers]);
    setCorrectionReason(req.classification.plainLanguageReason);
  };

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionModalCase) return;

    db.correctAIClassification(
      correctionModalCase.id,
      correctionBarriers,
      correctionReason,
      currentUser.name || 'Anitha Sundaram'
    );
    setCorrectionModalCase(null);
  };

  // Invisible Patient Registration (Feature 6 & 10)
  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name.trim()) return;

    if (isOnline) {
      const patientId = `pt-inv-${Date.now().toString().slice(-5)}`;
      const reqId = `req-inv-${Date.now().toString().slice(-5)}`;

      const createdPatient: User = {
        id: patientId,
        name: newPatient.name,
        phone: newPatient.phone || '+91 94421 00000',
        email: `${newPatient.name.toLowerCase().replace(/\s+/g, '')}@carebridge.demo`,
        district: newPatient.district,
        state: 'Tamil Nadu',
        role: 'patient',
        hospitalName: currentUser.hospitalName,
        city: currentUser.city,
        language: 'Tamil',
        consentGiven: true,
        consentTimestamp: new Date().toISOString(),
        isVerified: true
      };
      db.saveUser(createdPatient);

      const createdRequest: CareRequest = {
        id: reqId,
        patientId,
        patientName: newPatient.name,
        patientAge: newPatient.age,
        patientPhone: newPatient.phone,
        district: newPatient.district,
        state: 'Tamil Nadu',
        originalInput: `Worker field registration: ${newPatient.notes || 'First-time hospital bridging'}`,
        inputType: 'text',
        classification: {
          detectedLanguage: 'Tamil',
          languageCode: 'ta',
          transcription: newPatient.notes || 'First-time access need',
          barriers: newPatient.barriers,
          urgencyWarning: false,
          urgencyReason: null,
          plainLanguageReason: `ASHA Field worker identified ${newPatient.barriers.join(', ')} barriers.`,
          explanationInPatientLanguage: 'புதிய நோயாளி உதவி கோரிக்கை உருவாக்கப்பட்டது.',
          needsClarification: false,
          clarificationQuestion: null,
          recommendedAssistanceType: 'Dedicated Community Accompaniment & Mobility Support',
          confidenceScore: 0.99
        },
        status: 'Submitted',
        workerId: currentUser.id,
        workerName: currentUser.name,
        assignedWorkerName: currentUser.name,
        hospitalId: currentUser.hospitalName?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        appointmentDetails: {
          hospitalName: currentUser.hospitalName || 'Hospital assignment required',
          specialty: 'Primary Access & Health Assessment',
          date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
          time: '10:00'
        },
        timelineLogs: [
          {
            status: 'Submitted',
            timestamp: new Date().toISOString(),
            note: `Invisible patient discovered and registered by healthcare worker ${currentUser.name}`,
            actor: currentUser.name
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.createRequest(createdRequest);
      alert(`Patient "${newPatient.name}" registered and case queued.`);
    } else {
      // Save as PWA offline draft
      db.saveOfflineDraft({
        patientName: newPatient.name,
        patientAge: newPatient.age,
        patientPhone: newPatient.phone,
        district: newPatient.district,
        notes: newPatient.notes,
        barriers: newPatient.barriers,
        accessibility: newPatient.accessibility,
        consentObtained: true
      });
      alert(`Network offline. Record saved securely as local PWA draft.`);
    }

    setNewPatient({
      name: '',
      age: 60,
      phone: '',
      district: 'Tiruchirappalli',
      notes: '',
      barriers: ['Transportation', 'Financial'],
      accessibility: {
        requiresWheelchair: false,
        visualImpairment: false,
        hearingImpairment: false,
        requiresSignLanguage: false,
        bedridden: false
      },
      consentObtained: true
    });
    setActiveTab('pending');
  };

  const handleSyncDraftsNow = () => {
    db.syncOfflineDrafts();
    alert('All offline drafts synchronized to cloud database.');
  };

  const today = new Date().toISOString().slice(0, 10);
  const todayAppointments = appointments.filter(appointment => appointment.date === today);
  const upcomingAppointments = appointments.filter(appointment => appointment.date > today && appointment.status === 'scheduled');
  const missedAppointments = appointments.filter(appointment => appointment.status === 'missed');
  const hospitalPatients = Array.from(new Map(appointments.map(appointment => [appointment.patientId, appointment])).values());

  const handleAttendanceReview = (appointment: PatientAppointment, status: 'completed' | 'missed' | 'attendance_unconfirmed') => {
    db.updateAppointment(appointment.id, { status, attendanceReviewedAt: new Date().toISOString() }, currentUser.name);
    const request = db.getRequestById(appointment.requestId);
    if (request) {
      db.updateRequest(request.id, {
        timelineLogs: [...request.timelineLogs, {
          status: request.status,
          timestamp: new Date().toISOString(),
          note: `Appointment attendance reviewed by ${currentUser.name}: ${status.replaceAll('_', ' ')}.`,
          actor: currentUser.name
        }]
      }, currentUser.name, 'worker');
    }
  };

  const handleSendReminder = (appointment: PatientAppointment, forceResend = false) => {
    const sent = db.sendAppointmentReminder(appointment.id, currentUser, forceResend);
    if (!sent) window.alert('Reminder not sent. Check patient consent, hospital access, and whether a reminder was already sent today.');
  };

  const handleBulkReminders = () => {
    let sentCount = 0;
    upcomingAppointments.forEach(appointment => {
      if (db.sendAppointmentReminder(appointment.id, currentUser)) sentCount += 1;
    });
    window.alert(`${sentCount} in-app demo reminder(s) recorded. No SMS or WhatsApp was sent.`);
  };

  const handleRequestReason = (appointment: PatientAppointment) => {
    if (!db.requestMissedAppointmentReason(appointment.id, currentUser)) {
      window.alert('Follow-up was not created. Confirm attendance is marked missed and patient communication consent is active.');
    }
  };

  const handleRescheduleRequest = (appointment: PatientAppointment) => {
    const requestedDate = window.prompt('Enter the patient preferred new date (YYYY-MM-DD). Hospital staff must confirm the available slot.');
    if (!requestedDate || !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) return;
    db.updateAppointment(appointment.id, { status: 'reschedule_requested', rescheduleRequestedDate: requestedDate }, currentUser.name);
  };

  const matchingAppointments = activeTab === 'patients' ? appointments :
    activeTab === 'today' ? todayAppointments :
    activeTab === 'upcoming' ? upcomingAppointments :
    activeTab === 'missed' ? missedAppointments : appointments;
  const filteredAppointments = matchingAppointments.filter(appointment =>
    `${appointment.patientName} ${appointment.patientId}`.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (appointmentStatusFilter === 'all' || appointment.status === appointmentStatusFilter) &&
    (!appointmentDateFilter || appointment.date === appointmentDateFilter)
  );

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
          {currentUser.name} • {currentUser.hospitalName || 'Hospital assignment required'}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              {t('worker', appLang)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              {currentUser.hospitalName || 'Hospital assignment required'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t('workerTitle', appLang)}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('workerSub', appLang)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {drafts.some(d => !d.synced) && (
            <button
              onClick={handleSyncDraftsNow}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>{t('pwaSyncAll', appLang)} ({drafts.filter(d => !d.synced).length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('register_invisible')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('tabRegister', appLang)}</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {[
          ['overview', 'Overview'], ['patients', 'All Patients'], ['today', "Today's Appointments"],
          ['upcoming', 'Upcoming'], ['missed', 'Missed Appointments'], ['responses', 'Follow-Up Tracking'],
          ['pending', 'Assistance Requests'], ['active', 'NGO Referrals'], ['schemes', 'Financial Support'], ['reports', 'Reports']
        ].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`shrink-0 px-3 py-2 text-xs font-bold border-b-2 ${activeTab === tab ? 'border-teal-600 text-teal-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Hospital access overview</h2>
              <p className="text-xs text-slate-500">{currentUser.hospitalName || 'No hospital assigned'} · Local demo records · Messages are not sent by SMS or WhatsApp</p>
            </div>
            <button onClick={handleBulkReminders} disabled={upcomingAppointments.length === 0}
              className="px-3 py-2 bg-teal-700 text-white text-xs font-bold rounded-lg disabled:opacity-40">Send upcoming reminders</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ['Total Patients', hospitalPatients.length], ["Today's Appointments", todayAppointments.length],
              ['Upcoming Appointments', upcomingAppointments.length], ['Completed Appointments', appointments.filter(appointment => appointment.status === 'completed').length],
              ['Missed Appointments', missedAppointments.length],
              ['Awaiting Responses', followUps.filter(item => !item.patientResponse).length],
              ['Assistance Needed', requests.filter(request => request.status !== 'Resolved').length],
              ['Pending NGO Referrals', requests.filter(request => request.status === 'Worker Assigned' && request.assignedProviderId).length],
              ['Successfully Assisted Patients', new Set(requests.filter(request => request.status === 'Resolved').map(request => request.patientId)).size]
            ].map(([label, count]) => (
              <div key={label} className="bg-white border border-slate-200 p-4 rounded-lg">
                <p className="text-[11px] text-slate-500">{label}</p><strong className="text-2xl text-slate-900">{count}</strong>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
            Attendance is never inferred as missed automatically. Past appointments without a recorded review remain Attendance Unconfirmed.
          </div>
          <h3 className="font-bold text-sm text-slate-800">Next appointments</h3>
          <AppointmentTable appointments={[...todayAppointments, ...upcomingAppointments].slice(0, 5)}
            onReminder={handleSendReminder} onAttendance={handleAttendanceReview} onRequestReason={handleRequestReason}
            onReschedule={handleRescheduleRequest} onPatient={(appointment) => window.alert(`${appointment.patientName}\nPatient ID: ${appointment.patientId}\nAge: ${appointment.patientAge ?? 'Not recorded'}\nHospital: ${appointment.hospitalName}`)} currentUser={currentUser} />
        </section>
      )}

      {activeTab === 'patients' && (
        <section className="space-y-3">
          <div><h2 className="text-lg font-bold">All Patients</h2><p className="text-xs text-slate-500">Patient directory derived from appointments at {currentUser.hospitalName || 'your assigned hospital'}.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search patient name or ID" className="p-2 text-xs border border-slate-300 rounded-lg" />
            <input type="date" value={appointmentDateFilter} onChange={event => setAppointmentDateFilter(event.target.value)} className="p-2 text-xs border border-slate-300 rounded-lg" />
            <select value={assistanceFilter} onChange={event => setAssistanceFilter(event.target.value)} className="p-2 text-xs border border-slate-300 rounded-lg"><option value="all">All assistance statuses</option><option value="none">No request</option><option value="Submitted">Submitted</option><option value="Under Review">Under Review</option><option value="Assistance Arranged">Assistance Arranged</option><option value="Resolved">Resolved</option></select>
          </div>
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Patient ID / Name</th><th className="p-3">Age</th><th className="p-3">Contact</th><th className="p-3">Next Appointment</th><th className="p-3">Assistance</th><th className="p-3">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{hospitalPatients.filter(appointment => `${appointment.patientName} ${appointment.patientId}`.toLowerCase().includes(searchQuery.toLowerCase()) && (!appointmentDateFilter || appointments.some(item => item.patientId === appointment.patientId && item.date === appointmentDateFilter))).filter(patient => {
                const statuses = requests.filter(request => request.patientId === patient.patientId).map(request => request.status);
                return assistanceFilter === 'all' || (assistanceFilter === 'none' ? statuses.length === 0 : statuses.includes(assistanceFilter as CareRequest['status']));
              }).map(patient => {
                const patientAppointments = appointments.filter(appointment => appointment.patientId === patient.patientId).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
                const next = patientAppointments.find(appointment => appointment.status === 'scheduled' || appointment.status === 'attendance_unconfirmed');
                const patientCases = requests.filter(request => request.patientId === patient.patientId);
                return <tr key={patient.patientId}><td className="p-3"><strong>{patient.patientName}</strong><span className="block text-slate-400">{patient.patientId}</span></td><td className="p-3">{patient.patientAge ?? 'Not recorded'}</td><td className="p-3">{patient.patientPhone || 'Not recorded'}</td><td className="p-3">{next ? `${next.date} · ${next.time} · ${next.status.replaceAll('_', ' ')}` : 'No upcoming appointment'}</td><td className="p-3">{patientCases.length ? patientCases.map(item => item.status).join(', ') : 'No request'}</td><td className="p-3"><button onClick={() => window.alert(`Patient: ${patient.patientName}\nID: ${patient.patientId}\nAppointments: ${patientAppointments.length}\nCare requests: ${patientCases.length}\nHospital: ${patient.hospitalName}`)} className="px-2 py-1 border rounded">Profile & history</button></td></tr>;
              })}</tbody>
            </table>
          </div>
        </section>
      )}

      {(activeTab === 'today' || activeTab === 'upcoming' || activeTab === 'missed') && (
        <section className="space-y-3">
          <div><h2 className="text-lg font-bold">{activeTab === 'today' ? "Today's Appointments" : activeTab === 'missed' ? 'Missed Appointments' : 'Upcoming Appointments'}</h2><p className="text-xs text-slate-500">Actions are recorded in the local demo system. Confirm attendance before requesting a missed-visit reason.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search patient name or ID" className="p-2 text-xs border border-slate-300 rounded-lg" />
            <input type="date" value={appointmentDateFilter} onChange={event => setAppointmentDateFilter(event.target.value)} className="p-2 text-xs border border-slate-300 rounded-lg" />
            <select value={appointmentStatusFilter} onChange={event => setAppointmentStatusFilter(event.target.value)} className="p-2 text-xs border border-slate-300 rounded-lg"><option value="all">All appointment statuses</option><option value="scheduled">Scheduled</option><option value="attendance_unconfirmed">Attendance Unconfirmed</option><option value="completed">Completed</option><option value="missed">Missed</option><option value="reschedule_requested">Reschedule Requested</option></select>
          </div>
          <AppointmentTable appointments={filteredAppointments}
            onReminder={handleSendReminder} onAttendance={handleAttendanceReview} onRequestReason={handleRequestReason} onReschedule={handleRescheduleRequest}
            onPatient={(appointment) => window.alert(`${appointment.patientName}\nPatient ID: ${appointment.patientId}\nPhone: ${appointment.patientPhone || 'Not recorded'}\nHospital: ${appointment.hospitalName}`)} currentUser={currentUser} />
          {activeTab === 'missed' && <p className="text-[11px] text-slate-500">Unreviewed past appointments remain in Attendance Unconfirmed and are not listed as missed.</p>}
        </section>
      )}

      {activeTab === 'responses' && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Patient Follow-Up Status</h2>
          {followUps.length === 0 ? <div className="bg-white border border-slate-200 rounded-lg p-6 text-xs text-slate-500">No missed-appointment follow-ups yet. Confirm an appointment as missed, then request a patient reason.</div> : followUps.map(followUp => (
            <article key={followUp.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
              <div className="flex flex-wrap justify-between gap-2"><strong>{followUp.patientName}</strong><span className="text-slate-500">Requested {new Date(followUp.messageSentAt).toLocaleString()}</span></div>
              <p>Status: {followUp.patientResponse ? 'Patient responded · AI analysis available for review' : 'Awaiting patient response'}</p>
              {followUp.patientResponse && <><p><strong>Response:</strong> {followUp.patientResponse}</p><p><strong>Detected barriers:</strong> {followUp.analysis?.barriers.join(', ') || 'Not analyzed'}</p><p><strong>AI explanation:</strong> {followUp.analysis?.plainLanguageReason}</p><p>Patient confirmed: {followUp.patientConfirmedAnalysis ? 'Yes' : 'Pending'}</p></>}
              {followUp.assistanceRequestId && <button onClick={() => { setSearchQuery(followUp.patientName); setActiveTab('pending'); }} className="px-3 py-1.5 border rounded text-teal-800">Open linked assistance case</button>}
            </article>
          ))}
        </section>
      )}

      {activeTab === 'schemes' && (
        <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-2">
          <h2 className="text-lg font-bold">Financial Support Recommendations</h2>
          <p className="text-sm text-slate-700">No maintained, verified scheme directory is configured in this installation. Scheme names, benefits, eligibility, and application links are intentionally not generated without validated source records.</p>
          <p className="text-xs text-slate-500">Review barriers from the linked assistance case and confirm any scheme information with an official source before sharing it with a patient.</p>
        </section>
      )}

      {activeTab === 'reports' && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Hospital Follow-Up Analytics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['Appointment records', appointments.length], ['Attendance unconfirmed', appointments.filter(item => item.status === 'attendance_unconfirmed').length],
              ['Completed', appointments.filter(item => item.status === 'completed').length], ['Missed', missedAppointments.length],
              ['Reminders recorded', appointments.reduce((total, item) => total + item.reminders.length, 0)],
              ['Patient responses', followUps.filter(item => Boolean(item.patientResponse)).length],
              ['Assistance linked', followUps.filter(item => Boolean(item.assistanceRequestId)).length],
              ['Reschedule requests', appointments.filter(item => item.status === 'reschedule_requested').length]
            ].map(([label, value]) => <div key={label} className="bg-white border border-slate-200 rounded-lg p-4"><span className="text-xs text-slate-500">{label}</span><strong className="block text-2xl">{value}</strong></div>)}
          </div>
          <p className="text-[11px] text-slate-500">Counts reflect local demo records for this worker's assigned hospital only.</p>
        </section>
      )}

      {/* Navigation Tabs */}
      {!(['overview', 'patients', 'today', 'upcoming', 'missed', 'responses', 'schemes', 'reports'] as string[]).includes(activeTab) && <>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>{t('tabPending', appLang)}</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
            {requests.filter(r => r.status === 'Submitted' || r.status === 'Under Review' || r.failureFlag).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'active'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>{t('tabActive', appLang)}</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
            {requests.filter(r => (r.status === 'Worker Assigned' || r.status === 'Assistance Arranged' || r.status === 'Outcome Verification') && !r.failureFlag).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('resolved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'resolved'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>{t('tabResolved', appLang)}</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
            {requests.filter(r => r.status === 'Resolved').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('offline_drafts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'offline_drafts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>{t('tabOffline', appLang)}</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">{drafts.length}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      {activeTab !== 'register_invisible' && activeTab !== 'offline_drafts' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchCases', appLang)}
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={barrierFilter}
              onChange={(e) => setBarrierFilter(e.target.value)}
              className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-medium cursor-pointer"
            >
              <option value="all">{t('allBarriers', appLang)}</option>
              <option value="Transportation">Transportation</option>
              <option value="Financial">Financial</option>
              <option value="Mobility">Mobility</option>
              <option value="Accessibility">Accessibility</option>
              <option value="Language">Language</option>
              <option value="Caregiver Support">Caregiver Support</option>
            </select>
          </div>
        </div>
      )}

      </>}

      {/* View: Register Invisible Patient Form */}
      {activeTab === 'register_invisible' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-3xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {t('registerNewPatientTitle', appLang)}
              </h2>
              <p className="text-xs text-slate-500">
                {t('registerNewPatientSub', appLang)}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('pending')}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              {t('cancel', appLang)}
            </button>
          </div>

          <form onSubmit={handleRegisterPatient} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('patientFullName', appLang)}
                </label>
                <input
                  type="text"
                  required
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('patientPhone', appLang)}
                </label>
                <input
                  type="text"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('patientAge', appLang)}
                </label>
                <input
                  type="number"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({...newPatient, age: parseInt(e.target.value) || 50})}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('district', appLang)}
                </label>
                <input
                  type="text"
                  value={newPatient.district}
                  onChange={(e) => setNewPatient({...newPatient, district: e.target.value})}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {t('patientNotes', appLang)}
              </label>
              <textarea
                rows={2}
                value={newPatient.notes}
                onChange={(e) => setNewPatient({...newPatient, notes: e.target.value})}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={newPatient.consentObtained}
                  onChange={(e) => setNewPatient({...newPatient, consentObtained: e.target.checked})}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span className="text-xs font-bold text-amber-900">
                  {t('workerConsentCert', appLang)}
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                {t('cancel', appLang)}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                {isOnline ? t('saveOnline', appLang) : t('saveOffline', appLang)}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* View: Offline Drafts Queue */}
      {activeTab === 'offline_drafts' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                PWA Offline Field Records
              </h2>
            </div>
            <button
              onClick={handleSyncDraftsNow}
              disabled={!isOnline || drafts.every(d => d.synced)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>{t('pwaSyncAll', appLang)}</span>
            </button>
          </div>

          {drafts.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center italic">
              No offline drafts in local device storage.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {drafts.map(d => (
                <div key={d.localId} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-800">{d.patientName}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{d.notes}</p>
                  </div>
                  <div>
                    {d.synced ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                        ✓ Synced
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                        Pending Sync
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View: Requests List */}
      {activeTab !== 'register_invisible' && activeTab !== 'offline_drafts' && (
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <p className="text-sm font-semibold text-slate-400">No care requests matching criteria.</p>
            </div>
          ) : (
            filteredRequests.map(req => (
              <div 
                key={req.id}
                className={`bg-white rounded-3xl p-6 border shadow-xs transition hover:shadow-md space-y-4 ${
                  req.failureFlag 
                    ? 'border-2 border-rose-400 bg-rose-50/20' 
                    : req.repeatBarrierDetected 
                      ? 'border-amber-300' 
                      : 'border-slate-200'
                }`}
              >
                {/* Failure Banner inside card */}
                {req.failureFlag && (
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between gap-3 text-xs text-rose-900">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <strong>{t('failureDetected', appLang)}:</strong> {req.failureReason}
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenAssignModal(req)}
                      className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg text-xs cursor-pointer"
                    >
                      {t('reassignBtn', appLang)}
                    </button>
                  </div>
                )}

                {/* Repeat Barrier Notification */}
                {req.repeatBarrierDetected && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <strong>{t('repeatBarrierAlert', appLang)}:</strong> {t('repeatBarrierDesc', appLang)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">ID: {req.id}</span>
                      <h3 className="font-bold text-slate-900 text-base">{req.patientName}</h3>
                      <span className="text-xs text-slate-400">({req.district})</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 italic">
                      "{req.originalInput}"
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-black self-start sm:self-auto bg-slate-100 text-slate-800">
                    {req.status}
                  </span>
                </div>

                {/* AI Classification Summary */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">{t('identifiedBarriers', appLang)}:</span>
                    {req.classification.barriers.map(b => (
                      <span key={b} className="px-2 py-0.5 bg-teal-100 text-teal-900 font-bold rounded">
                        {b}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenCorrectionModal(req)}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t('correctAIBtn', appLang)}</span>
                    </button>
                    <button
                      onClick={() => handleOpenAssignModal(req)}
                      className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{t('assignProviderBtn', appLang)}</span>
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* Provider Matching Modal - CLEAN options WITHOUT verbose explanations */}
      {assignModalCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-teal-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {t('assignModalTitle', appLang)}: {assignModalCase.patientName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  District: <strong>{assignModalCase.district}</strong> • Barriers: {assignModalCase.classification.barriers.join(', ')}
                </p>
              </div>
              <button 
                onClick={() => setAssignModalCase(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clean Providers List WITHOUT verbose explanatory paragraphs */}
            <div className="space-y-3">
              {db.matchProviders(assignModalCase.classification.barriers, assignModalCase.district).map(prov => (
                <div 
                  key={prov.id}
                  className="border border-slate-200 hover:border-teal-400 bg-white rounded-2xl p-4 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{prov.name}</h4>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {t('verified', appLang)} ✓
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {prov.hasWheelchairSupport && (
                        <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded text-[10px] font-bold flex items-center gap-1">
                          <Accessibility className="w-3 h-3" /> Wheelchair Van
                        </span>
                      )}
                      {prov.hasSignLanguageSupport && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded text-[10px] font-bold">
                          Sign Language Escort
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                        Districts: {prov.districtsCovered.join(', ')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAssignProvider(prov)}
                    className="shrink-0 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    {t('selectAndDispatch', appLang)}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setAssignModalCase(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                {t('close', appLang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Correction Modal */}
      {correctionModalCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-teal-200">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {t('reviewAIClassification', appLang)}
              </h3>
              <button 
                onClick={() => setCorrectionModalCase(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCorrection} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                "{correctionModalCase.originalInput}"
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Select applicable verified barriers:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Transportation', 'Financial', 'Mobility', 'Accessibility', 'Language', 'Caregiver Support', 'Other'] as BarrierType[]).map(b => (
                    <label key={b} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={correctionBarriers.includes(b)}
                        onChange={(e) => {
                          if (e.target.checked) setCorrectionBarriers([...correctionBarriers, b]);
                          else setCorrectionBarriers(correctionBarriers.filter(item => item !== b));
                        }}
                        className="rounded text-teal-600"
                      />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Worker Explanation Notes:
                </label>
                <textarea
                  rows={2}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCorrectionModalCase(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {t('cancel', appLang)}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
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
