import { 
  CareRequest, 
  SupportProvider, 
  User, 
  UserRole,
  AuditLogEntry, 
  OfflineDraft, 
  DistrictMetric, 
  BarrierType,
  CaseStatus,
  PatientAppointment,
  AppointmentStatus,
  AppointmentReminder,
  MissedAppointmentFollowUp,
  AIClassification
} from '../types';

// Storage keys
const STORAGE_PREFIX = 'carebridge_';
const KEYS = {
  REQUESTS: `${STORAGE_PREFIX}requests`,
  PROVIDERS: `${STORAGE_PREFIX}providers`,
  USERS: `${STORAGE_PREFIX}users`,
  CURRENT_USER: `${STORAGE_PREFIX}current_user`,
  AUTH_SESSION: `${STORAGE_PREFIX}auth_session_active`,
  AUDIT_LOGS: `${STORAGE_PREFIX}audit_logs`,
  OFFLINE_DRAFTS: `${STORAGE_PREFIX}offline_drafts`,
  APPOINTMENTS: `${STORAGE_PREFIX}appointments`,
  APPOINTMENT_FOLLOWUPS: `${STORAGE_PREFIX}appointment_followups`
};

// Initial Demo Seed Data
const GUEST_USER: User = {
  id: 'guest',
  name: 'Guest User',
  phone: '',
  email: '',
  role: 'patient',
  district: '',
  state: '',
  language: 'English',
  consentGiven: false
};

const SEED_USERS: User[] = [
  {
    id: 'user-lakshmi',
    name: 'Lakshmi Ramasamy',
    phone: '+91 98401 23456',
    email: 'lakshmi.demo@carebridge.org',
    role: 'patient',
    district: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    language: 'Tamil',
    consentGiven: true,
    consentTimestamp: '2026-03-01T08:00:00Z',
    isFirstTimePatient: false,
    accessibilityNeeds: {
      requiresWheelchair: false,
      visualImpairment: false,
      hearingImpairment: false,
      requiresSignLanguage: false,
      bedridden: false
    }
  },
  {
    id: 'user-worker-anitha',
    name: 'Anitha Sundaram',
    phone: '+91 98402 34567',
    email: 'anitha.sundaram@ashaworker.org',
    role: 'worker',
    hospitalName: 'Mahatma Gandhi Memorial Govt Hospital, Trichy',
    district: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    language: 'Tamil',
    consentGiven: true,
    isVerified: true
  },
  {
    id: 'user-ngo-kaveri',
    name: 'Ramesh Kumar (Kaveri Seva Trust)',
    phone: '+91 98403 45678',
    email: 'ramesh.kumar@kaverisevatrust.org',
    role: 'ngo',
    district: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    language: 'Tamil',
    consentGiven: true,
    isVerified: true,
    ngoDetails: {
      organizationName: 'Kaveri Rural Health & Transport Trust',
      services: ['Transportation', 'Financial', 'Mobility'],
      hasWheelchairVan: true,
      hasSignLanguageEscort: false,
      isAvailable: true
    }
  },
  {
    id: 'user-ngo-samarth',
    name: 'Meenakshi Sundaram (Samarth Disabled Care)',
    phone: '+91 98408 11223',
    email: 'meenakshi@samarthmobility.org',
    role: 'ngo',
    district: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    language: 'Tamil',
    consentGiven: true,
    isVerified: true,
    ngoDetails: {
      organizationName: 'Samarth Disabled Care Foundation',
      services: ['Mobility', 'Accessibility', 'Transportation'],
      hasWheelchairVan: true,
      hasSignLanguageEscort: true,
      isAvailable: true
    }
  },
  {
    id: 'user-ngo-arogya',
    name: 'Dr. Senthil Nathan (Arogya Nidhi Med-Fund)',
    phone: '+91 98409 33445',
    email: 'senthil@arogyatrust.in',
    role: 'ngo',
    district: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    language: 'Tamil',
    consentGiven: true,
    isVerified: true,
    ngoDetails: {
      organizationName: 'Arogya Community Trust',
      services: ['Financial'],
      hasWheelchairVan: false,
      hasSignLanguageEscort: false,
      isAvailable: true
    }
  },
  {
    id: 'user-ngo-vani',
    name: 'Deepa Krishnan (Vani Bhasha Health Bridge)',
    phone: '+91 98405 55667',
    email: 'deepa@vanibhasha.org',
    role: 'ngo',
    district: 'Chennai',
    state: 'Tamil Nadu',
    language: 'Tamil',
    consentGiven: true,
    isVerified: true,
    ngoDetails: {
      organizationName: 'Linguistic Health Bridge Network',
      services: ['Language', 'Caregiver Support'],
      hasWheelchairVan: false,
      hasSignLanguageEscort: true,
      isAvailable: true
    }
  },
  {
    id: 'user-ngo-anbu',
    name: 'Pastor John (Anbu Illam Care Network)',
    phone: '+91 98406 77889',
    email: 'john@anbuillamtrust.org',
    role: 'ngo',
    district: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    language: 'Tamil',
    consentGiven: true,
    isVerified: true,
    ngoDetails: {
      organizationName: 'Anbu Illam Community Care Network',
      services: ['Caregiver Support', 'Mobility'],
      hasWheelchairVan: true,
      hasSignLanguageEscort: false,
      isAvailable: true
    }
  },
  {
    id: 'user-admin-priya',
    name: 'Dr. Priya Varma',
    phone: '+91 98404 56789',
    email: 'admin.priya@swasthbharat.gov.in',
    role: 'admin',
    district: 'Chennai',
    state: 'Tamil Nadu',
    language: 'English',
    consentGiven: true,
    isVerified: true
  }
];

const SEED_PROVIDERS: SupportProvider[] = [
  {
    id: 'prov-kaveri-transport',
    name: 'Kaveri Seva Transport Wing',
    organizationName: 'Kaveri Rural Health & Transport Trust',
    type: 'NGO',
    phone: '+91 98403 45678',
    email: 'dispatch@kaveriseva.org',
    districtsCovered: ['Tiruchirappalli', 'Thanjavur', 'Karur', 'Salem'],
    barriersHandled: ['Transportation', 'Financial'],
    hasWheelchairSupport: true,
    hasSignLanguageSupport: false,
    isVerified: true,
    isAvailable: true,
    rating: 4.9,
    activeCasesCount: 3,
    description: 'Provides free patient auto/van transit vouchers and volunteer accompaniment to District Government Hospitals.'
  },
  {
    id: 'prov-samarth-mobility',
    name: 'Samarth Accessible Transit',
    organizationName: 'Samarth Disabled Care Foundation',
    type: 'NGO',
    phone: '+91 98408 11223',
    email: 'support@samarthmobility.org',
    districtsCovered: ['Chennai', 'Tiruchirappalli', 'Coimbatore', 'Madurai'],
    barriersHandled: ['Mobility', 'Accessibility', 'Transportation'],
    hasWheelchairSupport: true,
    hasSignLanguageSupport: true,
    isVerified: true,
    isAvailable: true,
    rating: 4.8,
    activeCasesCount: 2,
    description: 'Specialized hydraulic wheelchair lift vans, patient bed-to-seat escorts, and sign language hospital interpreters.'
  },
  {
    id: 'prov-arogya-sahaya',
    name: 'Arogya Nidhi Med-Fund',
    organizationName: 'Arogya Community Trust',
    type: 'Community Trust',
    phone: '+91 98409 33445',
    email: 'aid@arogyatrust.in',
    districtsCovered: ['Tiruchirappalli', 'Madurai', 'Dindigul'],
    barriersHandled: ['Financial'],
    hasWheelchairSupport: false,
    hasSignLanguageSupport: false,
    isVerified: true,
    isAvailable: true,
    rating: 4.7,
    activeCasesCount: 5,
    description: 'Micro-grants for diagnostic test co-pays, insulin supplies, and essential chronic condition prescriptions.'
  },
  {
    id: 'prov-sahayata-lang',
    name: 'Vani Bhasha Sahayata',
    organizationName: 'Linguistic Health Bridge Network',
    type: 'Volunteer Network',
    phone: '+91 98405 55667',
    email: 'contact@vanibhasha.org',
    districtsCovered: ['Chennai', 'Coimbatore', 'Tiruchirappalli'],
    barriersHandled: ['Language', 'Caregiver Support'],
    hasWheelchairSupport: false,
    hasSignLanguageSupport: true,
    isVerified: true,
    isAvailable: true,
    rating: 4.6,
    activeCasesCount: 1,
    description: 'Bilingual health navigators who accompany non-native migrants and elderly patients to hospital counters.'
  },
  {
    id: 'prov-rapid-auto',
    name: 'Rural Auto Care Net (Unverified Demo)',
    organizationName: 'Local Auto Drivers Union Support',
    type: 'Community Trust',
    phone: '+91 98407 99001',
    email: 'localunion@demo.com',
    districtsCovered: ['Tiruchirappalli'],
    barriersHandled: ['Transportation'],
    hasWheelchairSupport: false,
    hasSignLanguageSupport: false,
    isVerified: false, // Intentionally unverified for testing Admin verification flow!
    isAvailable: true,
    rating: 3.8,
    activeCasesCount: 0,
    description: 'Local driver volunteer network pending background safety verification by health administration.'
  }
];

const SEED_REQUESTS: CareRequest[] = [
  // 1. Lakshmi's case - Ready for Demonstration
  {
    id: 'req-lakshmi-001',
    patientId: 'user-lakshmi',
    patientName: 'Lakshmi Ramasamy',
    patientAge: 65,
    patientPhone: '+91 98401 23456',
    district: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    originalInput: 'எனக்கு மருத்துவமனைக்கு போக பஸ் காசு இல்லை.',
    inputType: 'voice',
    classification: {
      detectedLanguage: 'Tamil',
      languageCode: 'ta',
      transcription: 'எனக்கு மருத்துவமனைக்கு போக பஸ் காசு இல்லை.',
      barriers: ['Transportation', 'Financial'],
      urgencyWarning: false,
      urgencyReason: null,
      plainLanguageReason: 'The patient cannot afford bus fare to attend their monthly diabetes management appointment at the Taluk hospital.',
      explanationInPatientLanguage: 'உங்களுக்கு மருத்துவமனை செல்ல பேருந்து கட்டணம் செலுத்த சிரமம் உள்ளது என்று தெரிவிக்கப்பட்டது. சரிபார்க்கப்பட்ட இலவச போக்குவரத்து சேவையை ஏற்பாடு செய்ய ஒப்புதல் அளிக்கிறீர்களா?',
      needsClarification: false,
      clarificationQuestion: null,
      recommendedAssistanceType: 'Subsidized NGO Patient Van Transit & Volunteer Token',
      confidenceScore: 0.96,
      correctedByHuman: false
    },
    status: 'Submitted',
    appointmentDetails: {
      hospitalName: 'Mahatma Gandhi Memorial Govt Hospital, Trichy',
      specialty: 'Endocrinology / Chronic Diabetes Follow-up',
      date: '2026-10-20'
    },
    timelineLogs: [
      {
        status: 'Submitted',
        timestamp: '2026-10-14T07:15:00Z',
        note: 'Patient submitted access barrier via Voice2Care (Tamil detected).',
        actor: 'Lakshmi Ramasamy (Patient)'
      }
    ],
    repeatBarrierDetected: false,
    createdAt: '2026-10-14T07:15:00Z',
    updatedAt: '2026-10-14T07:15:00Z'
  },
  // 2. A failed-assistance case that got flagged and needs reassignment
  {
    id: 'req-fail-case-002',
    patientId: 'user-murugan',
    patientName: 'Murugan Selvam',
    patientAge: 72,
    patientPhone: '+91 98409 87654',
    district: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    originalInput: 'I am unable to walk to the bus stop due to severe knee pain, and no auto was available.',
    inputType: 'text',
    classification: {
      detectedLanguage: 'English',
      languageCode: 'en',
      transcription: 'I am unable to walk to the bus stop due to severe knee pain, and no auto was available.',
      barriers: ['Mobility', 'Transportation'],
      urgencyWarning: false,
      urgencyReason: null,
      plainLanguageReason: 'Patient has severe osteoarthritic mobility impairment and lacks point-to-point transit.',
      explanationInPatientLanguage: 'We noted that walking is difficult and you require doorstep pickup assistance.',
      needsClarification: false,
      clarificationQuestion: null,
      recommendedAssistanceType: 'Door-to-door mobility van',
      confidenceScore: 0.94
    },
    status: 'Assistance Arranged',
    workerId: 'user-worker-anitha',
    workerName: 'Anitha Sundaram',
    assignedProviderId: 'prov-kaveri-transport',
    assignedProviderName: 'Kaveri Seva Transport Wing',
    providerAccepted: true,
    failureFlag: true,
    failureReason: 'SUPPORT FAILURE DETECTED: Assigned driver experienced vehicle breakdown and did not arrive for scheduled dialysis pickup. Patient notified worker. Reassignment required immediately.',
    timelineLogs: [
      {
        status: 'Submitted',
        timestamp: '2026-10-12T09:00:00Z',
        note: 'Care request filed by patient for dialysis transportation.',
        actor: 'Murugan Selvam'
      },
      {
        status: 'Under Review',
        timestamp: '2026-10-12T09:30:00Z',
        note: 'Worker Anitha validated mobility requirement.',
        actor: 'Anitha Sundaram (Worker)'
      },
      {
        status: 'Assistance Arranged',
        timestamp: '2026-10-12T10:15:00Z',
        note: 'Assigned to Kaveri Seva Transport Wing. Provider accepted.',
        actor: 'Anitha Sundaram (Worker)'
      },
      {
        status: 'Assistance Arranged',
        timestamp: '2026-10-13T08:45:00Z',
        note: 'SUPPORT FAILURE FLAGGED: Provider failed to arrive for scheduled pickup. Alerted worker.',
        actor: 'System Care-Rescue Watchdog'
      }
    ],
    repeatBarrierDetected: true,
    repeatBarrierNotes: 'Notice: Murugan has had 3 transportation failures in 60 days. Chronic long-term mobility pass recommended.',
    createdAt: '2026-10-12T09:00:00Z',
    updatedAt: '2026-10-13T08:45:00Z'
  },
  // 3. Invisible Patient Discovery Case (Registered by worker with consent, first-time hospital access)
  {
    id: 'req-invisible-003',
    patientId: 'user-marimuthu',
    patientName: 'Marimuthu Kalimuthu',
    patientAge: 58,
    patientPhone: '+91 98405 67890',
    district: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    originalInput: 'Never attended a hospital in 20 years. Suspected cataract with high blurriness; afraid of hospital registration counters and paperwork.',
    inputType: 'text',
    classification: {
      detectedLanguage: 'English',
      languageCode: 'en',
      transcription: 'Never attended a hospital in 20 years. Suspected cataract with high blurriness; afraid of hospital registration counters and paperwork.',
      barriers: ['Accessibility', 'Caregiver Support', 'Financial'],
      urgencyWarning: false,
      urgencyReason: null,
      plainLanguageReason: 'First-time hospital attendee with visual impairment and functional illiteracy regarding OPD admission procedures.',
      explanationInPatientLanguage: 'You have been enrolled under Invisible Patient Outreach with informed consent for your first eye checkup.',
      needsClarification: false,
      clarificationQuestion: null,
      recommendedAssistanceType: 'ASHA Guided Hospital Escort & Free AB-PMJAY enrollment help',
      confidenceScore: 0.98
    },
    status: 'Under Review',
    workerId: 'user-worker-anitha',
    workerName: 'Anitha Sundaram',
    isFirstTimeRegistration: true,
    timelineLogs: [
      {
        status: 'Submitted',
        timestamp: '2026-10-13T14:20:00Z',
        note: 'Discovered during rural hamlet door-to-door survey. Informed oral and biometric consent recorded.',
        actor: 'Anitha Sundaram (Healthcare Worker)'
      },
      {
        status: 'Under Review',
        timestamp: '2026-10-13T14:30:00Z',
        note: 'Assessing eligibility for free Chief Minister Comprehensive Health Insurance scheme.',
        actor: 'Anitha Sundaram (Healthcare Worker)'
      }
    ],
    repeatBarrierDetected: false,
    createdAt: '2026-10-13T14:20:00Z',
    updatedAt: '2026-10-13T14:30:00Z'
  },
  // 4. Fully Resolved Case with Verified Outcome Evidence
  {
    id: 'req-resolved-004',
    patientId: 'user-kavitha',
    patientName: 'Kavitha Nathan',
    patientAge: 44,
    patientPhone: '+91 98407 12389',
    district: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    originalInput: 'Required wheelchair accessible vehicle for prenatal ultrasound checkup; local bus has steep steps.',
    inputType: 'text',
    classification: {
      detectedLanguage: 'English',
      languageCode: 'en',
      transcription: 'Required wheelchair accessible vehicle for prenatal ultrasound checkup; local bus has steep steps.',
      barriers: ['Mobility', 'Transportation'],
      urgencyWarning: false,
      urgencyReason: null,
      plainLanguageReason: 'High-risk maternity patient with spinal mobility limitation needing accessible transit.',
      explanationInPatientLanguage: 'Wheelchair lift van coordinated successfully.',
      needsClarification: false,
      clarificationQuestion: null,
      recommendedAssistanceType: 'Samarth Accessible Transit Van',
      confidenceScore: 0.95
    },
    status: 'Resolved',
    workerId: 'user-worker-anitha',
    workerName: 'Anitha Sundaram',
    assignedProviderId: 'prov-samarth-mobility',
    assignedProviderName: 'Samarth Accessible Transit',
    providerAccepted: true,
    outcomeSurvey: {
      providerContacted: true,
      receivedPromisedHelp: true,
      attendedAppointment: true,
      isProblemResolved: true,
      patientNotes: 'The van arrived 15 minutes early with an assistive ramp. Driver helped me safely into the clinic room. Wonderful service!',
      submittedAt: '2026-10-11T16:30:00Z'
    },
    timelineLogs: [
      {
        status: 'Submitted',
        timestamp: '2026-10-10T10:00:00Z',
        note: 'Maternity access request submitted.',
        actor: 'Kavitha Nathan'
      },
      {
        status: 'Worker Assigned',
        timestamp: '2026-10-10T10:30:00Z',
        note: 'Worker verified wheelchair van requirement.',
        actor: 'Anitha Sundaram'
      },
      {
        status: 'Assistance Arranged',
        timestamp: '2026-10-10T11:00:00Z',
        note: 'Samarth Transit dispatched wheelchair vehicle.',
        actor: 'Samarth Accessible Transit'
      },
      {
        status: 'Outcome Verification',
        timestamp: '2026-10-11T14:00:00Z',
        note: 'Verification survey sent to patient phone.',
        actor: 'System Automated Followup'
      },
      {
        status: 'Resolved',
        timestamp: '2026-10-11T16:30:00Z',
        note: 'Patient confirmed successful appointment attendance and resolution.',
        actor: 'Kavitha Nathan (Patient Verified)'
      }
    ],
    repeatBarrierDetected: false,
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-11T16:30:00Z'
  }
];

const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-14T07:15:00Z',
    actorName: 'Lakshmi Ramasamy',
    actorRole: 'patient',
    action: 'CARE_REQUEST_CREATED',
    caseId: 'req-lakshmi-001',
    details: 'Created voice-based access request in Tamil (Barriers: Transportation, Financial).'
  },
  {
    id: 'log-2',
    timestamp: '2026-10-13T08:45:00Z',
    actorName: 'System Watchdog',
    actorRole: 'admin',
    action: 'SUPPORT_FAILURE_FLAGGED',
    caseId: 'req-fail-case-002',
    details: 'Provider Kaveri Seva missed scheduled transport arrival. Case escalated to Worker queue.'
  },
  {
    id: 'log-3',
    timestamp: '2026-10-11T16:30:00Z',
    actorName: 'Kavitha Nathan',
    actorRole: 'patient',
    action: 'OUTCOME_VERIFIED_RESOLVED',
    caseId: 'req-resolved-004',
    details: 'Patient confirmed verified attendance at hospital with 4/4 positive survey score.'
  }
];

// District geography coordinates for Gap Map (Tamil Nadu & neighboring key districts)
export const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number; state: string }> = {
  'Tiruchirappalli': { lat: 10.7905, lng: 78.7047, state: 'Tamil Nadu' },
  'Chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  'Madurai': { lat: 9.9252, lng: 78.1198, state: 'Tamil Nadu' },
  'Coimbatore': { lat: 11.0168, lng: 76.9558, state: 'Tamil Nadu' },
  'Salem': { lat: 11.6643, lng: 78.1460, state: 'Tamil Nadu' },
  'Thanjavur': { lat: 10.7870, lng: 79.1378, state: 'Tamil Nadu' },
  'Tirunelveli': { lat: 8.7139, lng: 77.7567, state: 'Tamil Nadu' },
  'Vellore': { lat: 12.9165, lng: 79.1325, state: 'Tamil Nadu' },
  'Dindigul': { lat: 10.3673, lng: 77.9803, state: 'Tamil Nadu' },
  'Bengaluru Urban': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'Mumbai Suburban': { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' }
};

class CareBridgeDB {
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    const storedUsersData = localStorage.getItem(KEYS.USERS);
    if (!storedUsersData) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
    } else {
      try {
        const existingUsers: User[] = JSON.parse(storedUsersData);
        let updated = false;
        SEED_USERS.forEach(seedUser => {
          if (!existingUsers.some(u => u.id === seedUser.id)) {
            existingUsers.push(seedUser);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(KEYS.USERS, JSON.stringify(existingUsers));
        }
      } catch (e) {
        console.error('Error merging seed users:', e);
      }
    }
    if (!localStorage.getItem(KEYS.PROVIDERS)) {
      localStorage.setItem(KEYS.PROVIDERS, JSON.stringify(SEED_PROVIDERS));
    }
    if (!localStorage.getItem(KEYS.REQUESTS)) {
      localStorage.setItem(KEYS.REQUESTS, JSON.stringify(SEED_REQUESTS));
    }
    if (!localStorage.getItem(KEYS.AUDIT_LOGS)) {
      localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(SEED_AUDIT_LOGS));
    }
    if (!localStorage.getItem(KEYS.OFFLINE_DRAFTS)) {
      localStorage.setItem(KEYS.OFFLINE_DRAFTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.CURRENT_USER)) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(GUEST_USER));
    }
    if (!localStorage.getItem(KEYS.AUTH_SESSION)) {
      localStorage.setItem(KEYS.AUTH_SESSION, 'false');
    }
  }

  // Subscribe to DB updates
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (e) {
        console.error('DB listener error:', e);
      }
    });
  }

  public resetAllToDemo(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(KEYS.PROVIDERS, JSON.stringify(SEED_PROVIDERS));
    localStorage.setItem(KEYS.REQUESTS, JSON.stringify(SEED_REQUESTS));
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(SEED_AUDIT_LOGS));
    localStorage.setItem(KEYS.OFFLINE_DRAFTS, JSON.stringify([]));
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(GUEST_USER));
    localStorage.setItem(KEYS.AUTH_SESSION, 'false');
    this.notify();
  }

  // Current User / Auth
  public getCurrentUser(): User {
    if (typeof window === 'undefined') return GUEST_USER;
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    if (!data) return GUEST_USER;

    try {
      const parsed = JSON.parse(data);
      if (parsed && parsed.id) {
        const authSessionActive = localStorage.getItem(KEYS.AUTH_SESSION) === 'true';
        const isLegacyDemoUser = parsed.id === 'user-lakshmi' && !authSessionActive;
        return isLegacyDemoUser ? GUEST_USER : parsed;
      }
    } catch {
      // fall through to guest user below
    }

    return GUEST_USER;
  }

  public setCurrentUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(KEYS.AUTH_SESSION, user.id === 'guest' ? 'false' : 'true');
    if (user.id !== 'guest') {
      this.addAuditLog(user.name, user.role, 'USER_LOGIN_SWITCH', `Switched active session to ${user.name} (${user.role})`);
    }
    this.notify();
  }

  public logout(): void {
    this.setCurrentUser(GUEST_USER);
  }

  public switchUser(userId: string): boolean {
    const users = this.getUsers();
    const match = users.find(u => u.id === userId);
    if (match) {
      this.setCurrentUser(match);
      return true;
    }
    return false;
  }

  public switchRoleQuick(role: UserRole | string, preferredUserId?: string): void {
    const users = this.getUsers();
    if (preferredUserId) {
      const specific = users.find(u => u.id === preferredUserId && u.role === role);
      if (specific) {
        this.setCurrentUser(specific);
        return;
      }
    }
    const match = users.find(u => u.role === role);
    if (match) {
      this.setCurrentUser(match);
    }
  }

  public getNgoUsers(): User[] {
    return this.getUsers().filter(u => u.role === 'ngo');
  }

  public addNgoVolunteer(helper: {
    name: string;
    phone: string;
    organizationName?: string;
    services?: BarrierType[];
    hasWheelchairVan?: boolean;
    hasSignLanguageEscort?: boolean;
    district?: string;
  }): User {
    const newHelper: User = {
      id: `user-ngo-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: helper.name,
      phone: helper.phone,
      email: `${helper.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@ngonetwork.org`,
      role: 'ngo',
      district: helper.district || 'Tiruchirappalli',
      state: 'Tamil Nadu',
      language: 'Tamil',
      consentGiven: true,
      isVerified: true,
      ngoDetails: {
        organizationName: helper.organizationName || 'Community Care Support Network',
        services: helper.services && helper.services.length > 0 ? helper.services : ['Transportation', 'Mobility'],
        hasWheelchairVan: helper.hasWheelchairVan ?? true,
        hasSignLanguageEscort: helper.hasSignLanguageEscort ?? false,
        isAvailable: true
      }
    };
    this.saveUser(newHelper);
    this.addAuditLog(helper.name, 'ngo', 'NGO_HELPER_REGISTERED', `New NGO helper mobilized: ${helper.name}`);
    return newHelper;
  }

  // Users
  public getUsers(): User[] {
    if (typeof window === 'undefined') return SEED_USERS;
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : SEED_USERS;
  }

  public saveUser(user: User): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    this.notify();
  }

  // Requests
  public getRequests(): CareRequest[] {
    if (typeof window === 'undefined') return SEED_REQUESTS;
    const data = localStorage.getItem(KEYS.REQUESTS);
    return data ? JSON.parse(data) : SEED_REQUESTS;
  }

  public getRequestById(id: string): CareRequest | undefined {
    return this.getRequests().find(r => r.id === id);
  }

  public createRequest(req: CareRequest): void {
    const requests = this.getRequests();

    // Check repeat barriers (Feature 9)
    const repeatInfo = this.checkRepeatBarriers(req.patientPhone, req.classification.barriers);
    if (repeatInfo.hasRepeat) {
      req.repeatBarrierDetected = true;
      req.repeatBarrierNotes = `Alert: Patient encountered ${repeatInfo.repeatedBarriers.join(', ')} in ${repeatInfo.priorCasesCount} previous cases within 90 days. Recommend permanent support linkage.`;
    }

    requests.unshift(req);
    localStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests));

    if (req.appointmentDetails?.date && req.appointmentDetails.hospitalName) {
      const appointments = this.getAppointments();
      const appointmentId = req.appointmentId || `appt-${req.id}`;
      if (!appointments.some(appointment => appointment.id === appointmentId)) {
        appointments.unshift({
          id: appointmentId,
          requestId: req.id,
          patientId: req.patientId,
          patientName: req.patientName,
          patientAge: req.patientAge,
          patientPhone: req.patientPhone,
          hospitalId: req.hospitalId || this.hospitalIdForName(req.appointmentDetails.hospitalName),
          hospitalName: req.appointmentDetails.hospitalName,
          workerId: req.workerId,
          workerName: req.assignedWorkerName || req.workerName,
          district: req.district,
          date: req.appointmentDetails.date,
          time: req.appointmentDetails.time || '10:00',
          status: 'scheduled',
          reminders: [],
          updatedAt: req.updatedAt
        });
        localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));
      }
    }
    
    this.addAuditLog(
      req.patientName,
      'patient',
      'CARE_REQUEST_CREATED',
      `Filed request ${req.id} in ${req.district} for ${req.classification.barriers.join(', ')}`,
      req.id
    );
    this.notify();
  }

  private hospitalIdForName(name: string): string {
    return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  public getAppointments(): PatientAppointment[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(KEYS.APPOINTMENTS);
    if (stored) return JSON.parse(stored) as PatientAppointment[];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
    const appointments = this.getRequests()
      .filter(request => request.appointmentDetails?.date && request.appointmentDetails.hospitalName)
      .map(request => {
        const hospitalName = request.appointmentDetails!.hospitalName;
        return {
          id: request.appointmentId || `appt-${request.id}`,
          requestId: request.id,
          patientId: request.patientId,
          patientName: request.patientName,
          patientAge: request.patientAge,
          patientPhone: request.patientPhone,
          hospitalId: request.hospitalId || this.hospitalIdForName(hospitalName),
          hospitalName,
          workerId: request.workerId,
          workerName: request.assignedWorkerName || request.workerName,
          district: request.district,
          date: request.appointmentDetails!.date,
          time: request.appointmentDetails!.time || '10:00',
          status: request.appointmentDetails!.date < today ? 'attendance_unconfirmed' as const : 'scheduled' as const,
          reminders: [],
          updatedAt: request.updatedAt
        };
      });
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));
    return appointments;
  }

  public getHospitalAppointments(worker: User): PatientAppointment[] {
    if (worker.role !== 'worker' || !worker.hospitalName?.trim()) return [];
    const hospitalId = this.hospitalIdForName(worker.hospitalName);
    return this.getAppointments().filter(appointment => appointment.hospitalId === hospitalId);
  }

  public updateAppointment(id: string, updates: Partial<PatientAppointment>, actorName: string): void {
    const appointments = this.getAppointments();
    const index = appointments.findIndex(appointment => appointment.id === id);
    if (index === -1) return;
    const actor = this.getCurrentUser();
    if (actor.role !== 'worker' || !actor.hospitalName?.trim() || this.hospitalIdForName(actor.hospitalName) !== appointments[index].hospitalId) return;
    appointments[index] = { ...appointments[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));
    this.addAuditLog(actorName, 'worker', 'APPOINTMENT_UPDATED', `Appointment ${id} updated: ${Object.keys(updates).join(', ')}`, appointments[index].requestId);
    this.notify();
  }

  public sendAppointmentReminder(id: string, worker: User, forceResend = false): boolean {
    const appointment = this.getAppointments().find(item => item.id === id);
    if (!appointment || worker.role !== 'worker' || worker.hospitalName?.trim().toLowerCase() !== appointment.hospitalName.trim().toLowerCase()) return false;
    const patient = this.getUsers().find(user => user.id === appointment.patientId);
    if (!patient?.consentGiven) return false;
    if (!forceResend && appointment.reminders.some(reminder => reminder.sentAt.slice(0, 10) === new Date().toISOString().slice(0, 10))) return false;

    const dateLabel = new Date(`${appointment.date}T${appointment.time}`).toLocaleString(patient.language === 'Tamil' ? 'ta-IN' : 'en-IN', {
      dateStyle: 'long', timeStyle: 'short'
    });
    const message = patient.language === 'Tamil'
      ? `வணக்கம் ${patient.name}, ${dateLabel} அன்று ${appointment.hospitalName} மருத்துவமனையில் உங்கள் சந்திப்பு திட்டமிடப்பட்டுள்ளது. பயண அல்லது பிற உதவி தேவைப்பட்டால் CareBridge AI மூலம் கோரலாம்.`
      : `Hello ${patient.name}, your hospital appointment is scheduled for ${dateLabel} at ${appointment.hospitalName}. Request help through CareBridge AI if you need transportation or other support.`;
    const reminder: AppointmentReminder = {
      id: `rem-${Date.now().toString(36)}`,
      sentAt: new Date().toISOString(),
      sentBy: worker.name,
      channel: 'in_app_demo',
      deliveryStatus: 'demo_message',
      message
    };
    this.updateAppointment(id, { reminders: [...appointment.reminders, reminder] }, worker.name);
    return true;
  }

  public getAppointmentFollowUps(): MissedAppointmentFollowUp[] {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(KEYS.APPOINTMENT_FOLLOWUPS) || '[]') as MissedAppointmentFollowUp[];
  }

  public requestMissedAppointmentReason(appointmentId: string, worker: User): boolean {
    const appointment = this.getAppointments().find(item => item.id === appointmentId);
    if (!appointment || appointment.status !== 'missed' || worker.role !== 'worker' || worker.hospitalName?.trim().toLowerCase() !== appointment.hospitalName.trim().toLowerCase()) return false;
    const followUps = this.getAppointmentFollowUps();
    if (followUps.some(item => item.appointmentId === appointmentId)) return false;
    const patient = this.getUsers().find(user => user.id === appointment.patientId);
    if (!patient?.consentGiven) return false;
    const promptMessage = patient.language === 'Tamil'
      ? `வணக்கம் ${patient.name}, உங்கள் மருத்துவமனை சந்திப்பிற்கு வர முடியவில்லை என்பதை கவனித்தோம். உங்களுக்கு ஏதேனும் உதவி தேவையா என்பதை அறிய விரும்புகிறோம். மருத்துவமனைக்கு வருவதில் என்ன சிரமம் ஏற்பட்டது என்பதைச் சொல்ல முடியுமா?`
      : `Hello ${patient.name}, we noticed that you could not attend your scheduled hospital appointment. We would like to understand whether you need any assistance. Could you tell us what prevented you from visiting the hospital?`;
    const followUp: MissedAppointmentFollowUp = {
      id: `followup-${Date.now().toString(36)}`,
      appointmentId,
      requestId: appointment.requestId,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      hospitalId: appointment.hospitalId,
      workerId: worker.id,
      workerName: worker.name,
      createdAt: new Date().toISOString(),
      messageSentAt: new Date().toISOString(),
      promptMessage
    };
    followUps.unshift(followUp);
    localStorage.setItem(KEYS.APPOINTMENT_FOLLOWUPS, JSON.stringify(followUps));
    this.addAuditLog(worker.name, 'worker', 'MISSED_APPOINTMENT_FOLLOWUP_REQUESTED', `Reason requested for appointment ${appointmentId}`, appointment.requestId);
    this.notify();
    return true;
  }

  public savePatientFollowUpResponse(id: string, patient: User, response: string, analysis: AIClassification): void {
    const followUps = this.getAppointmentFollowUps();
    const index = followUps.findIndex(item => item.id === id && item.patientId === patient.id);
    if (index === -1) return;
    followUps[index] = { ...followUps[index], patientResponse: response, responseReceivedAt: new Date().toISOString(), analysis, patientConfirmedAnalysis: false };
    localStorage.setItem(KEYS.APPOINTMENT_FOLLOWUPS, JSON.stringify(followUps));
    this.notify();
  }

  public confirmFollowUpAnalysis(id: string, patient: User): string | undefined {
    const followUps = this.getAppointmentFollowUps();
    const followUp = followUps.find(item => item.id === id && item.patientId === patient.id);
    if (!followUp?.patientResponse || !followUp.analysis || followUp.patientConfirmedAnalysis === true) return undefined;
    const appointment = this.getAppointments().find(item => item.id === followUp.appointmentId);
    const linkedRequest = this.getRequestById(followUp.requestId);
    let assistanceRequestId = linkedRequest?.id;
    if (linkedRequest) {
      this.updateRequest(linkedRequest.id, {
        classification: followUp.analysis,
        originalInput: followUp.patientResponse,
        appointmentId: followUp.appointmentId,
        hospitalId: followUp.hospitalId
      }, patient.name, 'patient');
    } else if (appointment) {
      assistanceRequestId = `req-followup-${Date.now().toString(36)}`;
      const now = new Date().toISOString();
      this.createRequest({
        id: assistanceRequestId,
        patientId: patient.id,
        patientName: patient.name,
        patientAge: appointment.patientAge || 0,
        patientPhone: patient.phone,
        district: appointment.district,
        state: patient.state,
        originalInput: followUp.patientResponse,
        inputType: 'text',
        classification: followUp.analysis,
        status: 'Submitted',
        appointmentId: appointment.id,
        hospitalId: appointment.hospitalId,
        appointmentDetails: { hospitalName: appointment.hospitalName, specialty: 'Appointment follow-up', date: appointment.date, time: appointment.time },
        timelineLogs: [{ status: 'Submitted', timestamp: now, note: `Patient-confirmed missed appointment response linked to ${appointment.id}.`, actor: patient.name }],
        createdAt: now,
        updatedAt: now
      });
    }
    if (!assistanceRequestId) return undefined;
    const index = followUps.findIndex(item => item.id === id);
    followUps[index] = { ...followUps[index], patientConfirmedAnalysis: true, assistanceRequestId };
    localStorage.setItem(KEYS.APPOINTMENT_FOLLOWUPS, JSON.stringify(followUps));
    this.notify();
    return assistanceRequestId;
  }

  public updateRequest(id: string, updates: Partial<CareRequest>, actor = 'System', actorRole = 'worker'): void {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) return;

    const prev = requests[index];
    const updated: CareRequest = {
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // If status changed, push timestamped timeline log
    if (updates.status && updates.status !== prev.status) {
      const note = updates.failureFlag 
        ? `Failure flagged: ${updates.failureReason}` 
        : `Status transitioned from ${prev.status} to ${updates.status}`;
      
      updated.timelineLogs = [
        ...prev.timelineLogs,
        {
          status: updates.status,
          timestamp: new Date().toISOString(),
          note,
          actor: `${actor} (${actorRole})`
        }
      ];
    }

    requests[index] = updated;
    localStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests));

    this.addAuditLog(actor, actorRole as any, 'CARE_REQUEST_UPDATED', `Case ${id} updated to status ${updated.status}`, id);
    this.notify();
  }

  // Assign worker
  public assignWorker(caseId: string, workerId: string, workerName: string): void {
    const req = this.getRequestById(caseId);
    if (!req) return;

    this.updateRequest(
      caseId,
      {
        status: 'Under Review',
        workerId,
        workerName,
        timelineLogs: [
          ...req.timelineLogs,
          {
            status: 'Under Review',
            timestamp: new Date().toISOString(),
            note: `Case assigned to Community Health Worker ${workerName} for barrier verification.`,
            actor: workerName
          }
        ]
      },
      workerName,
      'worker'
    );
  }

  // Assign Support Provider
  public assignProvider(caseId: string, providerId: string, providerName: string, workerName: string): void {
    const req = this.getRequestById(caseId);
    if (!req) return;

    this.updateRequest(
      caseId,
      {
        status: 'Assistance Arranged',
        assignedProviderId: providerId,
        assignedProviderName: providerName,
        providerAccepted: undefined, // Pending NGO response
        failureFlag: false,
        failureReason: undefined,
        timelineLogs: [
          ...req.timelineLogs,
          {
            status: 'Assistance Arranged',
            timestamp: new Date().toISOString(),
            note: `Assigned verified assistance provider: ${providerName}. Awaiting provider acceptance.`,
            actor: workerName
          }
        ]
      },
      workerName,
      'worker'
    );
  }

  // NGO accepts or declines referral
  public handleProviderResponse(caseId: string, accepted: boolean, providerName: string, declineReason?: string): void {
    const req = this.getRequestById(caseId);
    if (!req) return;

    if (accepted) {
      this.updateRequest(
        caseId,
        {
          providerAccepted: true,
          timelineLogs: [
            ...req.timelineLogs,
            {
              status: req.status,
              timestamp: new Date().toISOString(),
              note: `${providerName} accepted referral and scheduled assistance dispatch.`,
              actor: providerName
            }
          ]
        },
        providerName,
        'ngo'
      );
    } else {
      // Must require decline reason
      this.updateRequest(
        caseId,
        {
          providerAccepted: false,
          providerDeclineReason: declineReason || 'Provider at maximum capacity.',
          status: 'Under Review', // Return to worker queue
          timelineLogs: [
            ...req.timelineLogs,
            {
              status: 'Under Review',
              timestamp: new Date().toISOString(),
              note: `${providerName} declined referral. Reason: "${declineReason || 'Capacity full'}". Returned to Worker for reassignment.`,
              actor: providerName
            }
          ]
        },
        providerName,
        'ngo'
      );
    }
  }

  // Support Failure Detection (Feature 4)
  public flagSupportFailure(caseId: string, reason: string, reporterName: string): void {
    const req = this.getRequestById(caseId);
    if (!req) return;

    this.updateRequest(
      caseId,
      {
        failureFlag: true,
        failureReason: reason,
        status: 'Under Review', // Return immediately to worker queue
        timelineLogs: [
          ...req.timelineLogs,
          {
            status: 'Under Review',
            timestamp: new Date().toISOString(),
            note: `CRITICAL SUPPORT FAILURE: ${reason}. Case re-queued for immediate reassignment.`,
            actor: reporterName
          }
        ]
      },
      reporterName,
      'worker'
    );
  }

  // Human correction of AI classification (Feature 11)
  public correctAIClassification(
    caseId: string, 
    newBarriers: BarrierType[], 
    reasonText: string, 
    workerName: string
  ): void {
    const req = this.getRequestById(caseId);
    if (!req) return;

    const previousBarriers = [...req.classification.barriers];
    const updatedClassification = {
      ...req.classification,
      barriers: newBarriers,
      plainLanguageReason: reasonText,
      correctedByHuman: true,
      humanCorrectionNotes: `Corrected by ${workerName}. Prior barriers: [${previousBarriers.join(', ')}]. Updated to: [${newBarriers.join(', ')}].`
    };

    this.updateRequest(
      caseId,
      {
        classification: updatedClassification,
        timelineLogs: [
          ...req.timelineLogs,
          {
            status: req.status,
            timestamp: new Date().toISOString(),
            note: `AI classification corrected by worker: Changed [${previousBarriers.join(', ')}] to [${newBarriers.join(', ')}]. Reason: ${reasonText}`,
            actor: workerName
          }
        ]
      },
      workerName,
      'worker'
    );
  }

  // Verified Outcome Evidence (Feature 12)
  public submitOutcomeEvidence(
    caseId: string, 
    answers: {
      providerContacted: boolean;
      receivedPromisedHelp: boolean;
      attendedAppointment: boolean;
      isProblemResolved: boolean;
      patientNotes?: string;
    },
    patientName: string
  ): void {
    const req = this.getRequestById(caseId);
    if (!req) return;

    const isFullyResolved = answers.isProblemResolved && answers.attendedAppointment;
    const finalStatus: CaseStatus = isFullyResolved ? 'Resolved' : 'Under Review';

    this.updateRequest(
      caseId,
      {
        status: finalStatus,
        outcomeSurvey: {
          ...answers,
          submittedAt: new Date().toISOString()
        },
        failureFlag: !isFullyResolved,
        failureReason: !isFullyResolved ? 'Patient reported that care attendance or problem resolution was not achieved in outcome verification.' : undefined,
        timelineLogs: [
          ...req.timelineLogs,
          {
            status: finalStatus,
            timestamp: new Date().toISOString(),
            note: isFullyResolved 
              ? `Patient verified outcome: Attended appointment and problem resolved. Case successfully marked RESOLVED.`
              : `Outcome verification failed: Patient reported issues. Case re-opened for worker follow-up.`,
            actor: patientName
          }
        ]
      },
      patientName,
      'patient'
    );
  }

  public submitOutcomeVerification(
    caseId: string,
    answers: {
      providerContacted: boolean;
      receivedAssistance?: boolean;
      receivedPromisedHelp?: boolean;
      attendedAppointment: boolean;
      isProblemResolved: boolean;
      patientNotes?: string;
    },
    patientName: string
  ): void {
    this.submitOutcomeEvidence(
      caseId,
      {
        providerContacted: answers.providerContacted,
        receivedPromisedHelp: answers.receivedAssistance ?? answers.receivedPromisedHelp ?? true,
        attendedAppointment: answers.attendedAppointment,
        isProblemResolved: answers.isProblemResolved,
        patientNotes: answers.patientNotes
      },
      patientName
    );
  }

  // Re-open case
  public reopenCase(caseId: string, reason: string, actorName: string): void {
    const req = this.getRequestById(caseId);
    if (!req) return;

    this.updateRequest(
      caseId,
      {
        status: 'Under Review',
        failureFlag: true,
        failureReason: `Case Re-opened: ${reason}`,
        timelineLogs: [
          ...req.timelineLogs,
          {
            status: 'Under Review',
            timestamp: new Date().toISOString(),
            note: `Case REOPENED: ${reason}`,
            actor: actorName
          }
        ]
      },
      actorName,
      'worker'
    );
  }

  // Repeat Barrier Intelligence (Feature 9): 2+ cases with same barrier in 90 days
  public checkRepeatBarriers(patientPhone: string, currentBarriers: BarrierType[]): {
    hasRepeat: boolean;
    repeatedBarriers: BarrierType[];
    priorCasesCount: number;
  } {
    const requests = this.getRequests();
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

    const patientPastCases = requests.filter(r => 
      r.patientPhone === patientPhone && 
      new Date(r.createdAt).getTime() >= ninetyDaysAgo
    );

    const barrierOccurrences: Record<string, number> = {};
    patientPastCases.forEach(c => {
      c.classification.barriers.forEach(b => {
        barrierOccurrences[b] = (barrierOccurrences[b] || 0) + 1;
      });
    });

    const repeated = currentBarriers.filter(b => (barrierOccurrences[b] || 0) >= 2);

    return {
      hasRepeat: repeated.length > 0,
      repeatedBarriers: repeated,
      priorCasesCount: patientPastCases.length
    };
  }

  // Smart Provider Matching (Feature 3 & 7)
  public matchProviders(
    barriers: BarrierType[], 
    district: string, 
    accessibility?: { requiresWheelchair?: boolean; requiresSignLanguage?: boolean }
  ): SupportProvider[] {
    const providers = this.getProviders();

    return providers.filter(prov => {
      // Must be verified by admin
      if (!prov.isVerified) return false;
      // Must be available
      if (!prov.isAvailable) return false;
      // Must cover the district
      const coversDistrict = prov.districtsCovered.some(d => d.toLowerCase() === district.toLowerCase());
      if (!coversDistrict) return false;
      // Must handle at least one barrier
      const handlesBarrier = barriers.some(b => prov.barriersHandled.includes(b));
      if (!handlesBarrier) return false;

      // Smart accessibility matching: wheelchair user is NEVER matched to non-wheelchair transit
      if (accessibility?.requiresWheelchair && barriers.includes('Transportation')) {
        if (!prov.hasWheelchairSupport) return false;
      }
      if (accessibility?.requiresSignLanguage && barriers.includes('Language')) {
        if (!prov.hasSignLanguageSupport) return false;
      }

      return true;
    });
  }

  // Providers
  public getProviders(): SupportProvider[] {
    if (typeof window === 'undefined') return SEED_PROVIDERS;
    const data = localStorage.getItem(KEYS.PROVIDERS);
    return data ? JSON.parse(data) : SEED_PROVIDERS;
  }

  public saveProvider(provider: SupportProvider): void {
    const list = this.getProviders();
    const idx = list.findIndex(p => p.id === provider.id);
    if (idx >= 0) {
      list[idx] = provider;
    } else {
      list.push(provider);
    }
    localStorage.setItem(KEYS.PROVIDERS, JSON.stringify(list));
    this.notify();
  }

  public toggleProviderVerification(providerId: string, verified: boolean, adminName: string): void {
    const list = this.getProviders();
    const prov = list.find(p => p.id === providerId);
    if (prov) {
      prov.isVerified = verified;
      localStorage.setItem(KEYS.PROVIDERS, JSON.stringify(list));
      this.addAuditLog(adminName, 'admin', 'PROVIDER_VERIFICATION_TOGGLE', `${prov.name} verification status set to ${verified}`);
      this.notify();
    }
  }

  // Audit Logs
  public getAuditLogs(): AuditLogEntry[] {
    if (typeof window === 'undefined') return SEED_AUDIT_LOGS;
    const data = localStorage.getItem(KEYS.AUDIT_LOGS);
    return data ? JSON.parse(data) : SEED_AUDIT_LOGS;
  }

  public addAuditLog(actorName: string, actorRole: any, action: string, details: string, caseId?: string): void {
    const logs = this.getAuditLogs();
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorName,
      actorRole,
      action,
      caseId,
      details
    };
    logs.unshift(entry);
    if (logs.length > 200) logs.pop();
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs));
    }
  }

  // Offline Drafts (Feature 10)
  public getOfflineDrafts(): OfflineDraft[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(KEYS.OFFLINE_DRAFTS);
    return data ? JSON.parse(data) : [];
  }

  public saveOfflineDraft(draft: Partial<OfflineDraft> & { patientName: string }): void {
    const drafts = this.getOfflineDrafts();
    const fullDraft: OfflineDraft = {
      localId: draft.localId || `draft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: draft.createdAt || new Date().toISOString(),
      patientName: draft.patientName,
      patientAge: draft.patientAge ?? draft.age ?? 60,
      age: draft.patientAge ?? draft.age ?? 60,
      patientPhone: draft.patientPhone || '+91 94421 00000',
      district: draft.district || 'Tiruchirappalli',
      notes: draft.notes || '',
      barriers: draft.barriers || ['Transportation', 'Financial'],
      accessibility: draft.accessibility || {
        requiresWheelchair: false,
        visualImpairment: false,
        hearingImpairment: false,
        requiresSignLanguage: false,
        bedridden: false
      },
      consentObtained: draft.consentObtained ?? true,
      synced: draft.synced ?? false
    };

    const idx = drafts.findIndex(d => d.localId === fullDraft.localId);
    if (idx >= 0) {
      drafts[idx] = fullDraft;
    } else {
      drafts.unshift(fullDraft);
    }
    localStorage.setItem(KEYS.OFFLINE_DRAFTS, JSON.stringify(drafts));
    this.notify();
  }

  public syncOfflineDrafts(worker?: User): number {
    const activeWorker = worker || this.getCurrentUser();
    const drafts = this.getOfflineDrafts();
    const unsynced = drafts.filter(d => !d.synced);
    
    unsynced.forEach(draft => {
      const newRequest: CareRequest = {
        id: `req-synced-${draft.localId.slice(-8)}`,
        patientId: `user-offline-${draft.localId.slice(-6)}`,
        patientName: draft.patientName,
        patientAge: draft.patientAge,
        patientPhone: draft.patientPhone,
        district: draft.district,
        state: 'Tamil Nadu',
        originalInput: draft.notes,
        inputType: 'text',
        classification: {
          detectedLanguage: 'English',
          languageCode: 'en',
          transcription: draft.notes,
          barriers: draft.barriers.length ? draft.barriers : ['Financial', 'Transportation'],
          urgencyWarning: false,
          urgencyReason: null,
          plainLanguageReason: 'Case recorded offline by Healthcare Worker and synced upon network reconnection.',
          explanationInPatientLanguage: 'Case recorded and synced successfully.',
          needsClarification: false,
          clarificationQuestion: null,
          recommendedAssistanceType: 'Offline worker direct community assistance referral',
          confidenceScore: 0.90
        },
        status: 'Under Review',
        workerId: activeWorker.id,
        workerName: activeWorker.name,
        assignedWorkerName: activeWorker.name,
        isFirstTimeRegistration: true,
        timelineLogs: [
          {
            status: 'Submitted',
            timestamp: draft.createdAt,
            note: 'Captured in remote village offline mode by worker with verbal consent.',
            actor: activeWorker.name
          },
          {
            status: 'Under Review',
            timestamp: new Date().toISOString(),
            note: 'Synchronized to CareBridge cloud data store.',
            actor: 'Offline Sync Agent'
          }
        ],
        createdAt: draft.createdAt,
        updatedAt: new Date().toISOString()
      };

      this.createRequest(newRequest);
      draft.synced = true;
    });

    localStorage.setItem(KEYS.OFFLINE_DRAFTS, JSON.stringify(drafts));
    this.notify();
    return unsynced.length;
  }

  // Gap Map & Aggregates (Feature 8)
  // District-level aggregates only; no precise patient locations; suppress/merge < 5 cases
  public getDistrictMetrics(): DistrictMetric[] {
    const requests = this.getRequests();
    const districtMap: Record<string, {
      total: number;
      resolved: number;
      unresolved: number;
      active: number;
      barriers: Record<BarrierType, number>;
    }> = {};

    // Initialize all known districts
    Object.keys(DISTRICT_COORDINATES).forEach(dist => {
      districtMap[dist] = {
        total: 0,
        resolved: 0,
        unresolved: 0,
        active: 0,
        barriers: {
          'Financial': 0,
          'Transportation': 0,
          'Mobility': 0,
          'Accessibility': 0,
          'Language': 0,
          'Caregiver Support': 0,
          'Other': 0
        }
      };
    });

    // Populate actuals
    requests.forEach(req => {
      const d = req.district || 'Tiruchirappalli';
      if (!districtMap[d]) {
        districtMap[d] = {
          total: 0,
          resolved: 0,
          unresolved: 0,
          active: 0,
          barriers: {
            'Financial': 0,
            'Transportation': 0,
            'Mobility': 0,
            'Accessibility': 0,
            'Language': 0,
            'Caregiver Support': 0,
            'Other': 0
          }
        };
      }

      districtMap[d].total += 1;
      if (req.status === 'Resolved') {
        districtMap[d].resolved += 1;
      } else if (req.failureFlag) {
        districtMap[d].unresolved += 1;
      } else {
        districtMap[d].active += 1;
      }

      req.classification.barriers.forEach(b => {
        if (districtMap[d].barriers[b] !== undefined) {
          districtMap[d].barriers[b] += 1;
        }
      });
    });

    // Add synthetic realistic baseline numbers for broader visualization in demo mode
    // (Marked clearly as aggregate demo data)
    const baseDistricts = [
      { name: 'Tiruchirappalli', addTotal: 18, res: 12, unres: 3, trans: 14, fin: 11, mob: 6 },
      { name: 'Madurai', addTotal: 24, res: 15, unres: 4, trans: 19, fin: 17, mob: 8 },
      { name: 'Chennai', addTotal: 32, res: 22, unres: 3, trans: 21, fin: 19, mob: 14 },
      { name: 'Coimbatore', addTotal: 14, res: 9, unres: 2, trans: 9, fin: 8, mob: 4 },
      { name: 'Salem', addTotal: 11, res: 7, unres: 2, trans: 8, fin: 7, mob: 3 },
      { name: 'Thanjavur', addTotal: 8, res: 5, unres: 1, trans: 6, fin: 5, mob: 2 },
      { name: 'Vellore', addTotal: 3, res: 1, unres: 1, trans: 2, fin: 2, mob: 1 } // Will test privacy suppression < 5!
    ];

    baseDistricts.forEach(b => {
      if (districtMap[b.name]) {
        districtMap[b.name].total += b.addTotal;
        districtMap[b.name].resolved += b.res;
        districtMap[b.name].unresolved += b.unres;
        districtMap[b.name].active += (b.addTotal - b.res - b.unres);
        districtMap[b.name].barriers['Transportation'] += b.trans;
        districtMap[b.name].barriers['Financial'] += b.fin;
        districtMap[b.name].barriers['Mobility'] += b.mob;
      }
    });

    return Object.keys(districtMap).map(dist => {
      const item = districtMap[dist];
      const coords = DISTRICT_COORDINATES[dist] || { lat: 10.7905, lng: 78.7047, state: 'Tamil Nadu' };
      // Strict privacy rule: if total < 5, suppress details to protect patient confidentiality
      const isSuppressed = item.total < 5 && item.total > 0;

      return {
        district: dist,
        state: coords.state,
        lat: coords.lat,
        lng: coords.lng,
        totalCases: item.total,
        resolvedCases: item.resolved,
        unresolvedCases: item.unresolved,
        activeCases: item.active,
        barriers: item.barriers,
        isSuppressed
      };
    });
  }
}

export const db = new CareBridgeDB();
