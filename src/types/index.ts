export type UserRole = 'patient' | 'worker' | 'ngo' | 'admin';

export type BarrierType = 
  | 'Financial'
  | 'Transportation'
  | 'Mobility'
  | 'Accessibility'
  | 'Language'
  | 'Caregiver Support'
  | 'Other';

export type CaseStatus = 
  | 'Submitted'
  | 'Under Review'
  | 'Worker Assigned'
  | 'Assistance Arranged'
  | 'Outcome Verification'
  | 'Resolved';

export interface AccessibilityProfile {
  requiresWheelchair: boolean;
  visualImpairment: boolean;
  hearingImpairment: boolean;
  requiresSignLanguage: boolean;
  bedridden: boolean;
  otherDetails?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  hospitalName?: string;
  city?: string;
  district: string;
  state: string;
  language: string;
  consentGiven: boolean;
  consentTimestamp?: string;
  isFirstTimePatient?: boolean;
  accessibilityNeeds?: AccessibilityProfile;
  isVerified?: boolean; // For workers & NGOs approved by Admin
  ngoDetails?: {
    organizationName: string;
    services: BarrierType[];
    hasWheelchairVan: boolean;
    hasSignLanguageEscort: boolean;
    isAvailable: boolean;
  };
}

export interface TimelineEvent {
  status: CaseStatus;
  timestamp: string;
  note: string;
  actor: string;
}

export interface OutcomeSurvey {
  providerContacted: boolean | null;
  receivedPromisedHelp: boolean | null;
  attendedAppointment: boolean | null;
  isProblemResolved: boolean | null;
  patientNotes?: string;
  submittedAt?: string;
  reopenedReason?: string;
}

export interface AIClassification {
  detectedLanguage: string;
  languageCode: string;
  transcription: string;
  barriers: BarrierType[];
  urgencyWarning: boolean;
  urgencyReason: string | null;
  plainLanguageReason: string;
  explanationInPatientLanguage: string;
  needsClarification: boolean;
  clarificationQuestion: string | null;
  recommendedAssistanceType: string;
  confidenceScore: number;
  correctedByHuman?: boolean;
  humanCorrectionNotes?: string;
}

export type AppointmentStatus = 'scheduled' | 'checked_in' | 'completed' | 'missed' | 'attendance_unconfirmed' | 'cancelled' | 'reschedule_requested';

export interface AppointmentReminder {
  id: string;
  sentAt: string;
  sentBy: string;
  channel: 'in_app_demo';
  deliveryStatus: 'demo_message';
  message: string;
}

export interface PatientAppointment {
  id: string;
  requestId: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientPhone?: string;
  hospitalId: string;
  hospitalName: string;
  workerId?: string;
  workerName?: string;
  district: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  attendanceReviewedAt?: string;
  reminders: AppointmentReminder[];
  rescheduleRequestedDate?: string;
  updatedAt: string;
}

export interface MissedAppointmentFollowUp {
  id: string;
  appointmentId: string;
  requestId: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  workerId: string;
  workerName: string;
  createdAt: string;
  messageSentAt: string;
  promptMessage: string;
  patientResponse?: string;
  responseReceivedAt?: string;
  analysis?: AIClassification;
  patientConfirmedAnalysis?: boolean;
  assistanceRequestId?: string;
}

export interface CareRequest {
  id: string; // client UUID
  patientId: string;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  district: string;
  state: string;
  originalInput: string;
  inputType: 'voice' | 'text';
  classification: AIClassification;
  status: CaseStatus;
  workerId?: string;
  workerName?: string;
  assignedWorkerName?: string;
  assignedProviderId?: string;
  assignedProviderName?: string;
  providerAccepted?: boolean;
  providerDeclineReason?: string;
  failureFlag?: boolean;
  failureReason?: string;
  timelineLogs: TimelineEvent[];
  outcomeSurvey?: OutcomeSurvey;
  isFirstTimeRegistration?: boolean;
  repeatBarrierDetected?: boolean;
  repeatBarrierNotes?: string;
  appointmentDetails?: {
    hospitalName: string;
    specialty: string;
    date: string;
    time?: string;
  };
  appointmentId?: string;
  hospitalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportProvider {
  id: string;
  name: string;
  organizationName: string;
  type: 'NGO' | 'Community Trust' | 'Govt Transport Scheme' | 'Volunteer Network';
  phone: string;
  email: string;
  districtsCovered: string[];
  barriersHandled: BarrierType[];
  hasWheelchairSupport: boolean;
  hasSignLanguageSupport: boolean;
  isVerified: boolean;
  isAvailable: boolean;
  rating: number;
  activeCasesCount: number;
  description: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  caseId?: string;
  details: string;
}

export interface OfflineDraft {
  localId: string;
  createdAt: string;
  patientName: string;
  patientAge: number;
  age?: number;
  patientPhone: string;
  district: string;
  notes: string;
  barriers: BarrierType[];
  accessibility: AccessibilityProfile;
  consentObtained: boolean;
  synced: boolean;
}

export interface DistrictMetric {
  district: string;
  state: string;
  lat: number;
  lng: number;
  totalCases: number;
  resolvedCases: number;
  unresolvedCases: number;
  activeCases: number;
  barriers: Record<BarrierType, number>;
  isSuppressed: boolean; // privacy rule: < 5 cases
}
