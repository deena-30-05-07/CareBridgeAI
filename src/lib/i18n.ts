// Universal Internationalization (i18n) Engine for CareBridge AI
// Supports Tamil (தமிழ்) and English (EN) for the entire web application

export type AppLanguage = 'en' | 'ta';

const LANG_STORAGE_KEY = 'carebridge_app_language';

let currentAppLanguage: AppLanguage = (() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'ta' || saved === 'en') return saved;
  }
  return 'en';
})();

type Listener = (lang: AppLanguage) => void;
const listeners: Listener[] = [];

export function getAppLanguage(): AppLanguage {
  return currentAppLanguage;
}

export function setAppLanguage(lang: AppLanguage) {
  currentAppLanguage = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }
  listeners.forEach(fn => fn(lang));
}

export function subscribeAppLanguage(fn: Listener): () => void {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export const translations = {
  en: {
    // Nav & General Controls
    back: '← Previous / Back',
    backShort: '← Back',
    next: 'Next →',
    previousStep: '← Previous Step',
    nextStep: 'Next Step →',
    cancel: 'Cancel',
    confirm: 'Confirm',
    submit: 'Submit',
    save: 'Save',
    close: 'Close',
    search: 'Search...',
    filter: 'Filter',
    all: 'All',
    yes: 'Yes',
    no: 'No',
    active: 'Active',
    verified: 'Verified',
    unverified: 'Unverified',
    online: 'Online',
    offline: 'Offline',
    tour: 'Tour',
    resetData: 'Reset Demo Database',
    privacyCharter: 'Privacy Charter & Consent',
    noPatientLeftBehind: 'No Patient Left Behind',
    tagline: 'Voice-First AI Healthcare Access Coordination Platform',
    
    // Emergency Banner
    emergencyWarning: 'Medical Emergency Guidance: If you experience acute symptoms (chest pain, severe breathlessness, uncontrolled bleeding), call 108 Ambulance or 112 immediately. CareBridge AI is an access logistics tool and does not provide clinical diagnoses.',
    call108: 'Dial 108 Ambulance',
    call112: 'Dial 112 Emergency',

    // Roles
    patient: 'Patient',
    worker: 'Health Worker',
    ngo: 'Support NGO',
    admin: 'District Admin',
    selectRole: 'Select Role',
    enterAs: 'Enter as',
    
    // Navigation Items
    navVoice2Care: 'Voice2Care',
    navTrackCare: 'Track Care',
    navWorkerDesk: 'Worker Desk',
    navNgoPortal: 'NGO Portal',
    navAdminDesk: 'Admin Desk',
    navGapMap: 'Barrier Gap Map',
    navAnalytics: 'Analytics',
    navLogin: 'Login / Switch',
    
    // Barriers
    barrierFinancial: 'Financial',
    barrierTransportation: 'Transportation',
    barrierMobility: 'Mobility',
    barrierAccessibility: 'Accessibility',
    barrierLanguage: 'Language',
    barrierCaregiver: 'Caregiver Support',
    barrierOther: 'Other',
    
    // Care Rescue 6 Stages
    stageSubmitted: 'Submitted',
    stageUnderReview: 'Under Review',
    stageWorkerAssigned: 'Worker Assigned',
    stageAssistanceArranged: 'Assistance Arranged',
    stageOutcomeVerification: 'Outcome Verification',
    stageResolved: 'Resolved',

    // Voice2Care Assistant View
    v2cTitle: 'Voice2Care Assistant',
    v2cSub: 'Speak in your language. AI identifies access barriers and coordinates verified support.',
    tapToSpeak: 'Tap to Speak',
    tapToStop: 'Tap to Stop',
    speakHint: 'Click microphone to record, or type your reason below',
    recordingAudio: 'Recording Audio...',
    typeSituation: 'Or Type Your Situation',
    typePlaceholder: 'e.g. I have a hospital appointment but cannot afford bus fare and have knee pain...',
    analyze: 'Analyze',
    analyzingText: 'Analyzing your healthcare access barriers...',
    presetOptions: 'Preset Language Options:',
    detectedLanguage: 'Detected Language',
    confidence: 'AI Confidence',
    whatYouSaid: 'What You Said',
    identifiedBarriers: 'Identified Access Barriers',
    summaryInLanguage: 'Summary in Your Language',
    listenAudio: 'Listen Audio',
    recommendedScheme: 'Recommended Support Scheme',
    confirmAndCreate: 'Confirm & Create Request',
    cancelRespeak: 'Cancel / Re-speak',
    requestCreatedTitle: 'Care Request Created!',
    trackRequestBtn: 'Track Request in Care Rescue',
    openWorkerDeskBtn: 'Next Step: Open Worker Desk to Review',
    potentialEmergency: 'Potential Acute Emergency Detected',
    
    // Patient Request View
    requestFormTitle: 'Submit Healthcare Access Request',
    requestFormSub: 'Specify the logistical or social challenges preventing your hospital attendance.',
    explainProblemLabel: 'Explain the Problem in Your Words *',
    selectBarriersLabel: 'Select Barriers (Multiple Allowed) *',
    hospitalLabel: 'Hospital / Clinic Name',
    dateLabel: 'Appointment Date',
    wheelchairOption: 'Requires Wheelchair Accessible Vehicle',
    signLanguageOption: 'Requires Sign Language / Dialect Escort',
    submitRequestBtn: 'Submit Access Request',
    requestEnqueuedTitle: 'Request Enqueued!',
    backToDashboard: 'Back to Dashboard',
    
    // Tracking View
    trackingTitle: 'Assistance & Verification Journey',
    trackingSub: 'Real-time status of your ride, financial subsidy, and hospital accompaniment.',
    casesList: 'Cases:',
    failureDetected: 'Support Failure Detected',
    failureSub: 'Assigned provider was unable to fulfill assistance. Escalated to healthcare worker for reassignment.',
    reassignBtn: 'Reassign Provider Now',
    careRescuePipeline: 'Care Rescue Progress Pipeline',
    appointmentDetails: 'Appointment Details',
    assignedProvider: 'Assigned Support Provider',
    assignedWorker: 'Coordinating Health Worker',
    journeyTimeline: 'Verified Care Journey Timeline',
    verifyOutcomeBtn: 'Complete 4-Question Outcome Verification',
    reopenCaseBtn: 'Reopen Case',
    reopenTitle: 'Reopen Unresolved Case',
    reopenPrompt: 'State the reason to alert the healthcare worker:',
    
    // Outcome Verification Survey Modal
    outcomeSurveyTitle: 'Outcome Evidence Verification',
    outcomeSurveySub: 'Verify whether promised assistance actually arrived and resolved your barrier.',
    q1: '1. Did the assigned support provider contact you?',
    q2: '2. Did you receive the promised assistance (ride, funds, escort)?',
    q3: '3. Did you successfully attend your hospital appointment?',
    q4: '4. Is your healthcare access problem resolved?',
    optionalFeedback: 'Feedback Notes:',
    saveOutcomeBtn: 'Save Outcome Evidence',

    // Worker Dashboard
    workerTitle: 'Healthcare Worker Field Desk',
    workerSub: 'Review AI classifications, match verified providers, register invisible patients, and sync offline drafts.',
    tabPending: 'Pending Review',
    tabActive: 'Active Cases',
    tabResolved: 'Resolved',
    tabOffline: 'Offline Drafts',
    tabRegister: 'Register Patient',
    searchCases: 'Search by patient name, district, or ID...',
    allBarriers: 'All Barriers',
    pwaSyncAll: 'Sync All to Cloud',
    repeatBarrierAlert: 'Repeat Barrier Alert',
    repeatBarrierDesc: '2+ cases with identical barrier in 90 days. Recommend long-term support program.',
    reviewAIClassification: 'Review & Verify AI Classification',
    assignProviderBtn: 'Match & Assign Provider',
    correctAIBtn: 'Override AI',
    registerNewPatientTitle: 'Invisible Patient Registration (With Consent)',
    registerNewPatientSub: 'Register individuals without prior hospital records to bridge them into care.',
    patientFullName: 'Patient Full Name *',
    patientAge: 'Age *',
    patientPhone: 'Phone Number *',
    district: 'District',
    patientNotes: 'Access Notes & Situation',
    workerConsentCert: 'Worker Certification: Informed verbal consent obtained from patient.',
    saveOnline: 'Save & Enqueue Online',
    saveOffline: 'Save as Offline Draft (PWA)',

    // Provider Assignment Modal
    assignModalTitle: 'Assign Verified Support Provider',
    selectAndDispatch: 'Select & Dispatch',

    // NGO Dashboard
    ngoTitle: 'NGO Support Provider Portal',
    ngoSub: 'Accept/decline referrals, record delivered assistance, and manage field availability.',
    tabReferrals: 'Referred Cases',
    tabDelivered: 'Assistance Delivered',
    tabServices: 'Services & Profile',
    acceptReferral: 'Accept Referral',
    declineReferral: 'Decline Referral',
    declineReasonPrompt: 'Mandatory Decline Reason (Required):',
    confirmDecline: 'Confirm Decline',
    recordAssistanceBtn: 'Record Assistance Delivered',
    assistanceNotesPrompt: 'Service Confirmation Notes:',
    operationalStatus: 'Operational Availability:',
    activeAccepting: 'Active — Accepting Referrals',
    pausedNotAccepting: 'Paused — At Capacity',

    // Admin Dashboard
    adminTitle: 'District Healthcare Administrator Desk',
    adminSub: 'Monitor access failures, approve community partners, inspect audit logs, and analyze district equity.',
    tabPartners: 'Service Partners',
    tabFailures: 'Failure Alerts & SLAs',
    tabAudit: 'Audit Trail',
    verifyPartner: 'Verify Provider',
    unverifyPartner: 'Revoke Verification',
    failureMonitor: 'Unresolved Cases & SLA Breach Monitor',
    auditLogsTitle: 'Immutable System Audit Logs',

    // Gap Map View
    mapTitle: 'District Healthcare Access Barrier Map',
    mapSub: 'Aggregated district barriers across Tamil Nadu. Small groups (<5) suppressed for privacy.',
    privacyNote: 'Privacy Notice: All locations aggregated at district level. Groups <5 suppressed to prevent re-identification.',
    casesReported: 'Access Cases Reported',
    topBarriers: 'Top Barriers',

    // Analytics View
    analyticsTitle: 'Healthcare Barrier Intelligence & Analytics',
    analyticsSub: 'Transparent data on root access obstacles, resolution rates, and incoming language patterns.',
    barrierDistribution: 'Access Barrier Frequency',
    resolutionFunnel: 'Care Rescue Resolution Funnel',
    languageBreakdown: 'Patient Inflow Languages',

    // Role-Scoped Access & Multiple NGO Helpers
    myUsageOnly: 'Role-Scoped Access: Showing only features for your active role',
    roleRestrictedNotice: 'Access Restricted: You are logged in as a {role}. You can only access your role\'s specific usage tools.',
    logout: 'Log Out / Switch User',
    activeNgoHelpers: 'NGO Helpers & Partner Volunteers',
    ngoHelperSub: 'Multiple volunteer responders mobilized to coordinate transport, wheelchair vans, interpretation & financial grants.',
    addNgoHelper: '+ Add NGO Helper',
    switchNgoHelper: 'Switch Active Helper',
    activeSession: 'Active Helper',
    ngoHelperName: 'Helper / Volunteer Name',
    ngoHelperPhone: 'Phone Number',
    ngoHelperOrg: 'Organization / NGO Trust',
    ngoHelperDomain: 'Assigned Support Domain',
    ngoHelperAddedSuccess: 'New NGO helper registered successfully and ready to assist patients!'
  },
  
  ta: {
    // Nav & General Controls
    back: '← முந்தையது / பின்செல்',
    backShort: '← பின்செல்',
    next: 'அடுத்து →',
    previousStep: '← முந்தைய படி',
    nextStep: 'அடுத்த படி →',
    cancel: 'ரத்து',
    confirm: 'உறுதிசெய்',
    submit: 'சமர்ப்பி',
    save: 'சேமி',
    close: 'மூடு',
    search: 'தேடுக...',
    filter: 'வடிகட்டி',
    all: 'அனைத்தும்',
    yes: 'ஆம்',
    no: 'இல்லை',
    active: 'செயலில்',
    verified: 'சரிபார்க்கப்பட்டது',
    unverified: 'சரிபார்க்கப்படாதது',
    online: 'இணையத்தில்',
    offline: 'இணைப்பின்றி (ஆஃப்லைன்)',
    tour: 'வழிகாட்டி',
    resetData: 'தரவு மீட்டமை',
    privacyCharter: 'தனியுரிமை & ஒப்புதல்',
    noPatientLeftBehind: 'எந்த நோயாளியும் விடுபடக்கூடாது',
    tagline: 'குரல் வழி AI சுகாதார அணுகல் ஒருங்கிணைப்பு தளம்',
    
    // Emergency Banner
    emergencyWarning: 'அவசர மருத்துவ வழிகாட்டல்: மாரடைப்பு, கடுமையான மூச்சுத்திணறல், அதிக இரத்தப்போக்கு போன்ற அவசர அறிகுறிகள் இருந்தால் உடனடியாக 108 ஆம்புலன்ஸ் அல்லது 112 தேசிய அவசர எண்ணை அழைக்கவும். CareBridge AI என்பது மருத்துவ அணுகல் உதவிக்கான தளம் மட்டுமே; இது மருத்துவ சிகிச்சை பரிந்துரைக்காது.',
    call108: '108 ஆம்புலன்ஸ் அழை',
    call112: '112 அவசர உதவி அழை',

    // Roles
    patient: 'நோயாளி',
    worker: 'சுகாதார பணியாளர்',
    ngo: 'உதவி நிறுவனம் (NGO)',
    admin: 'மாவட்ட நிர்வாகி',
    selectRole: 'பங்கைத் தேர்ந்தெடுக்கவும்',
    enterAs: 'உள்நுழைக:',
    
    // Navigation Items
    navVoice2Care: 'குரல் வழி உதவி',
    navTrackCare: 'நிலையை அறிதல்',
    navWorkerDesk: 'பணியாளர் தளம்',
    navNgoPortal: 'NGO தளம்',
    navAdminDesk: 'நிர்வாகி தளம்',
    navGapMap: 'தடைகள் வரைபடம்',
    navAnalytics: 'பகுப்பாய்வு',
    navLogin: 'உள்நுழைவு',
    
    // Barriers
    barrierFinancial: 'நிதி தட்டுப்பாடு',
    barrierTransportation: 'போக்குவரத்து',
    barrierMobility: 'நடமாட்டம் / உடல் குறைபாடு',
    barrierAccessibility: 'அணுகல்தன்மை',
    barrierLanguage: 'மொழி புரியாத நிலை',
    barrierCaregiver: 'பராமரிப்பாளர் இல்லாமை',
    barrierOther: 'பிற காரணங்கள்',
    
    // Care Rescue 6 Stages
    stageSubmitted: 'சமர்ப்பிக்கப்பட்டது',
    stageUnderReview: 'ஆய்வில் உள்ளது',
    stageWorkerAssigned: 'பணியாளர் நியமிக்கப்பட்டார்',
    stageAssistanceArranged: 'உதவி ஏற்பாடு செய்யப்பட்டது',
    stageOutcomeVerification: 'முடிவு சரிபார்ப்பு',
    stageResolved: 'தீர்க்கப்பட்டது',

    // Voice2Care Assistant View
    v2cTitle: 'குரல் வழி உதவி (Voice2Care)',
    v2cSub: 'உங்கள் சொந்த மொழியில் பேசுங்கள். AI உங்கள் அணுகல் தடையை கண்டறிந்து உதவி ஏற்பாடு செய்யும்.',
    tapToSpeak: 'பேச அழுத்தவும்',
    tapToStop: 'நிறுத்த அழுத்தவும்',
    speakHint: 'மைக்ரோஃபோனை அழுத்தி பேசவும் அல்லது கீழே தட்டச்சு செய்யவும்',
    recordingAudio: 'குரல் பதிவு செய்யப்படுகிறது...',
    typeSituation: 'அல்லது உங்கள் சூழ்நிலையை தட்டச்சு செய்யவும்',
    typePlaceholder: 'உதாரணம்: எனக்கு மருத்துவமனைக்கு போக பஸ் காசு இல்லை, முழங்கால் வலி இருக்கிறது...',
    analyze: 'பகுப்பாய்வு செய்',
    analyzingText: 'உங்கள் சுகாதார அணுகல் தடைகளை பகுப்பாய்வு செய்கிறது...',
    presetOptions: 'மாதிரி மொழிகள்:',
    detectedLanguage: 'கண்டறியப்பட்ட மொழி',
    confidence: 'AI துல்லியம்',
    whatYouSaid: 'நீங்கள் கூறியது',
    identifiedBarriers: 'கண்டறியப்பட்ட அணுகல் தடைகள்',
    summaryInLanguage: 'உங்கள் மொழியில் விளக்கம்',
    listenAudio: 'குரல் கேட்க',
    recommendedScheme: 'பரிந்துரைக்கப்பட்ட உதவி திட்டம்',
    confirmAndCreate: 'உறுதிசெய்து சமர்ப்பி',
    cancelRespeak: 'ரத்து / மீண்டும் பேசு',
    requestCreatedTitle: 'உதவி கோரிக்கை உருவாக்கப்பட்டது!',
    trackRequestBtn: 'நிலையை கண்காணிக்கவும்',
    openWorkerDeskBtn: 'அடுத்த படி: பணியாளர் மேசையை திறக்கவும்',
    potentialEmergency: 'அவசர மருத்துவ ஆபத்து கண்டறியப்பட்டது',

    // Patient Request View
    requestFormTitle: 'மருத்துவ அணுகல் உதவி கோரிக்கை',
    requestFormSub: 'மருத்துவமனை செல்ல முடியாததற்கான தடையை நேரடியாக பதிவு செய்யவும்.',
    explainProblemLabel: 'சிக்கலை உங்கள் வார்த்தைகளில் விளக்குங்கள் *',
    selectBarriersLabel: 'தடைகளை தேர்ந்தெடுக்கவும் *',
    hospitalLabel: 'மருத்துவமனை பெயர்',
    dateLabel: 'சிகிச்சை நாள்',
    wheelchairOption: 'சக்கர நாற்காலி வசதியுள்ள வாகனம் தேவை',
    signLanguageOption: 'சைகை மொழி / மொழிபெயர்ப்பாளர் தேவை',
    submitRequestBtn: 'உதவி கோரிக்கையை சமர்ப்பிக்கவும்',
    requestEnqueuedTitle: 'கோரிக்கை பதிவு செய்யப்பட்டது!',
    backToDashboard: 'முகப்புக்கு திரும்புக',
    
    // Tracking View
    trackingTitle: 'உதவி பயணம் & சரிபார்ப்பு',
    trackingSub: 'வாகனம், நிதி உதவி மற்றும் மருத்துவமனை துணையின் நேரடி நிலை.',
    casesList: 'கோரிக்கைகள்:',
    failureDetected: 'உதவி தடைப்பட்டது கண்டறியப்பட்டது',
    failureSub: 'ஒதுக்கப்பட்ட நிறுவனத்தால் உதவி வழங்க முடியவில்லை. சுகாதார பணியாளருக்கு மாற்றப்பட்டுள்ளது.',
    reassignBtn: 'புதிய உதவி வழங்குநரை ஒதுக்கு',
    careRescuePipeline: 'உதவி முன்னேற்ற நிலைகள்',
    appointmentDetails: 'சிகிச்சை விவரங்கள்',
    assignedProvider: 'ஒதுக்கப்பட்ட உதவி நிறுவனம்',
    assignedWorker: 'ஒருங்கிணைக்கும் சுகாதார பணியாளர்',
    journeyTimeline: 'சரிபார்க்கப்பட்ட நிகழ்வுகள் காலவரிசை',
    verifyOutcomeBtn: '4-கேள்வி முடிவு சரிபார்ப்பை பூர்த்தி செய்',
    reopenCaseBtn: 'வழக்கை மீண்டும் திறக்க',
    reopenTitle: 'தீர்க்கப்படாத வழக்கை மீண்டும் திறக்க',
    reopenPrompt: 'காரணத்தை குறிப்பிடவும்:',
    
    // Outcome Verification Survey Modal
    outcomeSurveyTitle: 'முடிவு சரிபார்ப்பு படிவம்',
    outcomeSurveySub: 'உறுதிசெய்யப்பட்ட உதவி உண்மையில் கிடைத்ததா என்பதை சரிபார்க்கவும்.',
    q1: '1. ஒதுக்கப்பட்ட உதவி நிறுவனம் உங்களை தொடர்பு கொண்டதா?',
    q2: '2. வாக்குறுதியளிக்கப்பட்ட உதவி (வாகனம், நிதி, துணை) உங்களுக்கு கிடைத்ததா?',
    q3: '3. நீங்கள் மருத்துவமனை சிகிச்சைக்கு சென்றீர்களா?',
    q4: '4. உங்கள் மருத்துவ அணுகல் பிரச்சனை தீர்க்கப்பட்டதா?',
    optionalFeedback: 'உங்கள் கருத்துக்கள்:',
    saveOutcomeBtn: 'முடிவை சேமிக்கவும்',

    // Worker Dashboard
    workerTitle: 'சுகாதார பணியாளர் தளம்',
    workerSub: 'AI வகைப்பாட்டை சரிபார்த்தல், உதவி வழங்குநர் ஒதுக்கீடு, புதிய நோயாளிகள் பதிவு மற்றும் ஆஃப்லைன் ஒத்திசைவு.',
    tabPending: 'ஆய்வில் உள்ளவை',
    tabActive: 'செயலில் உள்ளவை',
    tabResolved: 'தீர்க்கப்பட்டவை',
    tabOffline: 'ஆஃப்லைன் பதிவுகள்',
    tabRegister: 'நோயாளி பதிவு',
    searchCases: 'பெயர், மாவட்டம் அல்லது எண் மூலம் தேடுக...',
    allBarriers: 'அனைத்து தடைகளும்',
    pwaSyncAll: 'அனைத்தையும் மேகக்கணிக்கு ஒத்திசை',
    repeatBarrierAlert: 'மீண்டும் ஏற்படும் தடை எச்சரிக்கை',
    repeatBarrierDesc: '90 நாட்களில் 2 முறை இதே தடை ஏற்பட்டுள்ளது. நீண்டகால உதவி தேவை.',
    reviewAIClassification: 'AI வகைப்பாட்டை சரிபார்க்கவும்',
    assignProviderBtn: 'உதவி நிறுவனத்தை ஒதுக்கு',
    correctAIBtn: 'AI திருத்தம் செய்',
    registerNewPatientTitle: 'புதிய நோயாளி பதிவு (ஒப்புதலுடன்)',
    registerNewPatientSub: 'முன்பு மருத்துவமனை செல்லாத நபர்களை கண்டறிந்து உதவி பெற பதிவு செய்தல்.',
    patientFullName: 'நோயாளி முழு பெயர் *',
    patientAge: 'வயது *',
    patientPhone: 'தொலைபேசி எண் *',
    district: 'மாவட்டம்',
    patientNotes: 'அணுகல் சூழ்நிலை குறிப்புகள்',
    workerConsentCert: 'பணியாளர் உறுதிமொழி: நோயாளியிடம் வாய்மொழி ஒப்புதல் பெறப்பட்டது.',
    saveOnline: 'இணையத்தில் சேமிக்கவும்',
    saveOffline: 'ஆஃப்லைனில் சேமி (PWA)',

    // Provider Assignment Modal
    assignModalTitle: 'சரிபார்க்கப்பட்ட உதவி நிறுவனத்தை ஒதுக்கு',
    selectAndDispatch: 'தேர்ந்தெடுத்து அனுப்புக',

    // NGO Dashboard
    ngoTitle: 'NGO உதவி வழங்குநர் தளம்',
    ngoSub: 'பரிந்துரைகளை ஏற்றுக்கொள்வது/நிராகரிப்பது, வழங்கப்பட்ட உதவிகளை பதிவு செய்தல்.',
    tabReferrals: 'பரிந்துரைக்கப்பட்டவை',
    tabDelivered: 'வழங்கப்பட்ட உதவிகள்',
    tabServices: 'சேவைகள் & சுயவிவரம்',
    acceptReferral: 'பரிந்துரையை ஏற்றுக்கொள்',
    declineReferral: 'நிராகரி',
    declineReasonPrompt: 'நிராகரிப்பதற்கான காரணம் (கட்டாயம்):',
    confirmDecline: 'நிராகரிப்பை உறுதிசெய்',
    recordAssistanceBtn: 'உதவி வழங்கியதை பதிவு செய்',
    assistanceNotesPrompt: 'சேவை விவர குறிப்புகள்:',
    operationalStatus: 'சேவை கிடைக்கும் நிலை:',
    activeAccepting: 'செயலில் — உதவிகள் வழங்க தயாராக உள்ளது',
    pausedNotAccepting: 'தற்காலிகமாக நிறுத்தம்',

    // Admin Dashboard
    adminTitle: 'மாவட்ட சுகாதார நிர்வாகி தளம்',
    adminSub: 'அணுகல் தோல்விகளை கண்காணித்தல், உதவி அமைப்புகளை சரிபார்த்தல், தணிக்கை பதிவுகளை ஆய்வு செய்தல்.',
    tabPartners: 'சேவை அமைப்புகள்',
    tabFailures: 'தோல்வி எச்சரிக்கைகள்',
    tabAudit: 'தணிக்கை பதிவுகள்',
    verifyPartner: 'நிறுவனத்தை அங்கீகரி',
    unverifyPartner: 'அங்கீகாரத்தை ரத்துசெய்',
    failureMonitor: 'தீர்க்கப்படாத வழக்குகள் & SLA எச்சரிக்கைகள்',
    auditLogsTitle: 'கணினி தணிக்கை பதிவுகள்',

    // Gap Map View
    mapTitle: 'மாவட்ட சுகாதார அணுகல் தடைகள் வரைபடம்',
    mapSub: 'தமிழ்நாடு மாவட்ட வாரியான சுகாதார அணுகல் தடைகள். தனியுரிமைக்காக சிறிய குழுக்கள் (<5) மறைக்கப்பட்டுள்ளன.',
    privacyNote: 'தனியுரிமை குறிப்பு: தனிப்பட்ட முகவரிகள் எதுவும் காட்டப்படாது. மாவட்ட அளவிலான கூட்டுத் தரவு மட்டுமே.',
    casesReported: 'பதிவான அணுகல் வழக்குகள்',
    topBarriers: 'முக்கிய தடைகள்',

    // Analytics View
    analyticsTitle: 'சுகாதார தடைகள் பகுப்பாய்வு',
    analyticsSub: 'மூலக் காரணங்கள், தீர்வு விகிதங்கள் மற்றும் மொழி விநியோகம் குறித்த வெளிப்படையான புள்ளிவிவரங்கள்.',
    barrierDistribution: 'அணுகல் தடை வகைப்பாடு',
    resolutionFunnel: 'தீர்வு நிலைகள் புனல்',
    languageBreakdown: 'நோயாளிகள் பயன்படுத்திய மொழிகள்',

    // Role-Scoped Access & Multiple NGO Helpers
    myUsageOnly: 'உங்கள் பாத்திரத்திற்கான பயன்பாட்டு அம்சங்கள் மட்டுமே காட்டப்படுகின்றன',
    roleRestrictedNotice: 'அணுகல் கட்டுப்பாடு: நீங்கள் {role} ஆக உள்நுழைந்துள்ளீர்கள். உங்கள் பயன்பாட்டிற்கான கருவிகளை மட்டுமே பயன்படுத்த முடியும்.',
    logout: 'வெளியேறு / பயனரை மாற்று',
    activeNgoHelpers: 'தன்னார்வ உதவிக்குழு & பல உதவியாளர்கள்',
    ngoHelperSub: 'நோயாளிகளுக்கு உதவ போக்குவரத்து, சக்கர நாற்காலி வேன், மொழிபெயர்ப்பு மற்றும் நிதி உதவி வழங்கும் பல தன்னார்வலர்கள்.',
    addNgoHelper: '+ புதிய தன்னார்வலரைச் சேர்',
    switchNgoHelper: 'உதவியாளரை மாற்று',
    activeSession: 'செயலில் உள்ள உதவியாளர்',
    ngoHelperName: 'உதவியாளர் / தன்னார்வலர் பெயர்',
    ngoHelperPhone: 'தொலைபேசி எண்',
    ngoHelperOrg: 'அமைப்பு / அறக்கட்டளை',
    ngoHelperDomain: 'ஒதுக்கப்பட்ட உதவி பிரிவு',
    ngoHelperAddedSuccess: 'புதிய தன்னார்வலர் வெற்றிகரமாக பதிவு செய்யப்பட்டார்! இப்போது நோயாளிகளுக்கு உதவ தயாராக உள்ளார்.'
  }
};

// Helper hook / translation function
export function t(key: keyof typeof translations.en, lang?: AppLanguage): string {
  const selectedLang = lang || currentAppLanguage;
  const dict = translations[selectedLang] || translations.en;
  return dict[key] || translations.en[key] || key;
}
