import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppLanguage = 'en' | 'ta';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string) => string;
}

const translations: Record<AppLanguage, Record<string, string>> = {
  en: {
    // Common & Nav
    back: '← Back',
    tour: 'Tour',
    online: 'Online',
    offline: 'Offline',
    selectRole: 'Select Role',
    privacyCharter: 'Privacy Charter',
    emergencyProtocol: 'Emergency Protocol: CareBridge AI coordinates access logistics, not medical diagnosis.',
    ambulance108: 'Ambulance: 108',
    national112: 'National Helpline: 112',
    noPatientLeftBehind: 'No Patient Left Behind',
    resetDb: 'Reset Demo Database',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    yes: 'Yes',
    no: 'No',
    submit: 'Submit',

    // Nav Items
    navVoice2Care: 'Voice2Care',
    navTrackCare: 'Track Care',
    navWorkerDesk: 'Worker Desk',
    navNgoPortal: 'NGO Portal',
    navAdminDesk: 'Admin Desk',
    navGapMap: 'Barrier Gap Map',
    navAnalytics: 'Analytics',

    // Roles
    rolePatient: 'Patient',
    roleWorker: 'Health Worker',
    roleNgo: 'Support NGO',
    roleAdmin: 'Admin',

    // Landing Page
    landingHeroTitle: 'CareBridge AI — No Patient Left Behind',
    landingHeroSub: 'A voice-first, multilingual AI healthcare ACCESS coordination platform. We identify why patients miss care—bus fare, wheelchair transit, language gaps, or isolated living—and coordinate verified NGO assistance until attendance is proven.',
    zeroDiagnosis: 'Zero-Diagnosis Guarantee: We coordinate logistics, never medical treatment.',
    startVoiceBtn: 'Start Voice2Care (Tamil / 8 Languages)',
    evaluateTourBtn: 'Evaluate Demo Scenarios',
    quickLakshmiPrompt: 'Quick Run: Lakshmi (65, Tamil) — "எனக்கு மருத்துவமனைக்கு போக பஸ் காசு இல்லை."',
    barriersHeading: 'Solving Real Access Barriers, Not Just Sending Reminders',
    workspacesHeading: 'Role Workspaces',
    launchVoice: 'Launch Voice2Care',
    openWorkerDesk: 'Worker Desk',
    openNgoQueue: 'Provider Queue',
    openAdminConsole: 'Admin Console',

    // Barrier Names
    barrierTransportation: 'Transportation',
    barrierFinancial: 'Financial',
    barrierMobility: 'Mobility',
    barrierAccessibility: 'Accessibility',
    barrierLanguage: 'Language',
    barrierCaregiverSupport: 'Caregiver Support',
    barrierCaregiver: 'Caregiver',
    barrierInvisiblePatients: 'Invisible Patients',
    barrierOther: 'Other',

    // Voice2Care Assistant
    voiceHeaderTitle: 'Speak in Your Mother Tongue',
    lakshmiDemoBtn: 'Lakshmi Demo (Tamil)',
    tapToSpeak: 'Tap to Speak',
    tapToStop: 'Tap to Stop',
    recordingAudio: 'Recording Audio',
    speakInstruction: 'Click microphone to record, or type your reason below',
    orType: 'Or Type Your Situation',
    placeholderInput: 'e.g. எனக்கு மருத்துவமனைக்கு போக பஸ் காசு இல்லை / I cannot walk to clinic...',
    analyzeBtn: 'Analyze',
    presetHeading: 'Preset Language Options:',
    processingVoice: 'CareBridge AI is processing speech & detecting access barriers...',
    checkingLogistics: 'Checking linguistic nuance, transportation logistics, and financial schemes',
    detectedLangLabel: 'Detected Language:',
    wrongLangBtn: '(Wrong language? Correct here)',
    whatYouSaid: 'What You Said:',
    identifiedBarriersLabel: 'Identified Healthcare Access Barriers:',
    summaryInLang: 'Summary in Your Language',
    listenAudio: 'Listen Audio',
    readingOutLoud: 'Reading Out Loud...',
    recommendedScheme: 'Recommended Support Scheme:',
    verifiedNgoMatch: 'Verified NGO Partner Match',
    confirmAccuracy: 'Confirm request accuracy:',
    confirmCreateBtn: 'Confirm & Create Request',
    requestCreatedTitle: 'Care Request Created!',
    caseRef: 'Case Reference:',
    trackRequestBtn: 'Track Request in Care Rescue',
    nextWorkerStepBtn: 'Next Step: Open Worker Desk to Review & Assign',

    // Care Rescue Tracking
    trackingTitle: 'Assistance & Verification Journey',
    trackingSub: 'Real-time status of your ride, financial subsidy, and hospital accompaniment.',
    currentStage: 'Current Stage',
    progressPipeline: 'Care Rescue Progress Pipeline',
    stageSubmitted: 'Submitted',
    stageUnderReview: 'Under Review',
    stageWorkerAssigned: 'Worker Assigned',
    stageAssistanceArranged: 'Assistance Arranged',
    stageOutcomeVerification: 'Outcome Verification',
    stageResolved: 'Resolved',
    assignedWorkerLabel: 'Assigned Community Health Worker',
    assignedProviderLabel: 'Assigned Support Provider (NGO)',
    awaitingAcceptance: 'Awaiting NGO Acceptance',
    acceptedDispatched: '✓ Referral Accepted & Dispatched',
    completeOutcomeBtn: 'Complete Outcome Verification',
    outcomeVerifiedTitle: 'Verified Outcome Evidence Recorded',
    needReopen: 'Need to Re-open Case?',
    timelineTitle: 'Timestamped Case Activity Logs',
    q1Label: '1. Did the support provider contact you?',
    q2Label: '2. Did you receive the promised help?',
    q3Label: '3. Did you attend the appointment?',
    q4Label: '4. Is the access problem resolved?',
    feedbackOptional: 'Optional Feedback Notes:',
    saveOutcomeBtn: 'Save Outcome Evidence',

    // Worker Dashboard
    workerTitle: 'Field Worker & ASHA Coordination Desk',
    workerSub: 'Review AI barrier classifications, verify patient needs, match certified NGOs, rescue failed cases, and register invisible patients.',
    registerInvisibleBtn: 'Register Invisible Patient',
    syncDraftsBtn: 'Sync Drafts',
    tabPending: 'Action Required / Failures',
    tabActive: 'In Coordination',
    tabResolved: 'Resolved Evidence',
    tabOffline: 'Offline Queue (PWA)',
    tabIntake: '+ Invisible Patient Intake',
    searchPlaceholder: 'Search by patient name, case ID, district...',
    matchAssignBtn: 'Match & Assign Provider',
    reassignBtn: 'Reassign Provider',
    correctAIBtn: 'Correct AI Classification',

    // NGO Portal
    ngoTitle: 'Assigned Patient Referrals',
    operationalAvailability: 'Operational Availability:',
    acceptReferralBtn: 'Accept Referral',
    declineReferralBtn: 'Decline Referral',
    recordAssistanceBtn: 'Record Assistance Delivered',

    // Admin Console
    adminTitle: 'System Administration & Partner Verification',
    adminSub: 'Inspect provider background verifications, monitor support failures, inspect immutable audit logs, and oversee health equity.',
    approveVerifyPartner: 'Approve & Verify Partner',
    revokeVerification: 'Revoke Verification',

    // Gap Map & Analytics
    gapMapTitle: 'Healthcare Barrier Gap Map',
    gapMapSub: 'District-level aggregates only. Precise patient locations are mathematically suppressed.',
    allBarriersOption: 'All Barriers (Total Cases)',
    analyticsTitle: 'Anonymized Healthcare Access Analytics',
    analyticsSub: 'Real-time aggregate telemetry on barrier elimination and verified clinical attendance.',
    demoDataWarning: '⚠️ ALL METRICS ARE SIMULATED DEMO DATA',
    totalCoordinated: 'Total Coordinated',
    verifiedResolution: 'Verified Resolution',
    invisiblePatientsCount: 'Invisible Patients',
    failureRecovery: 'Failure Recovery'
  },
  ta: {
    // Common & Nav
    back: '← பின்செல்க',
    tour: 'வழிகாட்டி',
    online: 'இணையத்தில்',
    offline: 'ஆஃப்லைன்',
    selectRole: 'பங்கு தேர்வு',
    privacyCharter: 'தனியுரிமை கொள்கை',
    emergencyProtocol: 'அவசர வழிகாட்டல்: CareBridge AI மருத்துவ சிகிச்சை வழங்கி அல்ல; அணுகல் தடைகளை ஒருங்கிணைக்கும் தளம் மட்டுமே.',
    ambulance108: 'ஆம்புலன்ஸ்: 108',
    national112: 'தேசிய அவசர உதவி: 112',
    noPatientLeftBehind: 'எந்த நோயாளியும் விடுபடக்கூடாது',
    resetDb: 'மாதிரி தரவை மீட்டமை',
    close: 'மூடுக',
    cancel: 'ரத்துசெய்',
    confirm: 'உறுதிசெய்',
    save: 'சேமிக்க',
    yes: 'ஆம்',
    no: 'இல்லை',
    submit: 'சமர்ப்பிக்க',

    // Nav Items
    navVoice2Care: 'குரல் வழி உதவி',
    navTrackCare: 'சிகிச்சை கண்காணிப்பு',
    navWorkerDesk: 'களப்பணியாளர் தளம்',
    navNgoPortal: 'தன்னார்வ உதவி தளம்',
    navAdminDesk: 'நிர்வாகி தளம்',
    navGapMap: 'குறைபாடு வரைபடம்',
    navAnalytics: 'புள்ளிவிவரங்கள்',

    // Roles
    rolePatient: 'நோயாளி',
    roleWorker: 'சுகாதார பணியாளர்',
    roleNgo: 'உதவி நிறுவனம் (NGO)',
    roleAdmin: 'மாவட்ட நிர்வாகி',

    // Landing Page
    landingHeroTitle: 'CareBridge AI — எந்த நோயாளியும் விடுபடக்கூடாது',
    landingHeroSub: 'குரல் வழி, பலமொழி AI மருத்துவ அணுகல் ஒருங்கிணைப்பு தளம். நோயாளிகளால் ஏன் மருத்துவமனைக்கு வர முடியவில்லை—பேருந்து கட்டணமின்மை, சக்கர நாற்காலி தேவை, மொழி இடைவெளி, அல்லது ஆதரவின்மை—என்பதை கண்டறிந்து சரிபார்க்கப்பட்ட உதவிகளை ஒருங்கிணைக்கிறோம்.',
    zeroDiagnosis: 'மருத்துவ சிகிச்சை அல்ல: இது மருத்துவ பரிசோதனை அல்ல, பயண மற்றும் சமூக தடைகளுக்கான உதவி.',
    startVoiceBtn: 'குரல் வழி உதவி தொடங்கு (தமிழ் / 8 மொழிகள்)',
    evaluateTourBtn: 'மாதிரி காட்சிகளை காண்க',
    quickLakshmiPrompt: 'விரைவு சோதனை: லட்சுமி (65, தமிழ்) — "எனக்கு மருத்துவமனைக்கு போக பஸ் காசு இல்லை."',
    barriersHeading: 'நினைவூட்டல் மட்டுமல்ல, உண்மையான அணுகல் தடைகளை தீர்க்கிறோம்',
    workspacesHeading: 'பணி தளங்கள்',
    launchVoice: 'குரல் உதவி தொடங்கு',
    openWorkerDesk: 'பணியாளர் தளம்',
    openNgoQueue: 'உதவி வரிசை',
    openAdminConsole: 'நிர்வாகி தளம்',

    // Barrier Names
    barrierTransportation: 'போக்குவரத்து',
    barrierFinancial: 'பொருளாதாரம் / கட்டணம்',
    barrierMobility: 'நடைபயிற்சி / சக்கர நாற்காலி',
    barrierAccessibility: 'அணுகல் வசதி',
    barrierLanguage: 'மொழிப் பிரச்சனை',
    barrierCaregiverSupport: 'துணை உதவி',
    barrierCaregiver: 'துணை உதவி',
    barrierInvisiblePatients: 'புதிய நோயாளிகள்',
    barrierOther: 'இதர தடைகள்',

    // Voice2Care Assistant
    voiceHeaderTitle: 'உங்கள் தாய்மொழியில் பேசுங்கள்',
    lakshmiDemoBtn: 'லட்சுமி மாதிரி (தமிழ்)',
    tapToSpeak: 'பேச அழுத்தவும்',
    tapToStop: 'நிறுத்த அழுத்தவும்',
    recordingAudio: 'குரல் பதிவு செய்யப்படுகிறது',
    speakInstruction: 'பேச மைக்ரோஃபோனைத் தொடவும் அல்லது கீழே தட்டச்சு செய்யவும்',
    orType: 'அல்லது உங்கள் சிக்கலை தட்டச்சு செய்யுங்கள்',
    placeholderInput: 'எ.கா: எனக்கு மருத்துவமனைக்கு போக பஸ் காசு இல்லை...',
    analyzeBtn: 'ஆராய்க',
    presetHeading: 'மாதிரி மொழி தேர்வுகள்:',
    processingVoice: 'CareBridge AI குரலை ஆராய்ந்து அணுகல் தடைகளை கண்டறிகிறது...',
    checkingLogistics: 'மொழி, போக்குவரத்து வசதிகள் மற்றும் அரசு உதவிகளை சரிபார்க்கிறது',
    detectedLangLabel: 'கண்டறியப்பட்ட மொழி:',
    wrongLangBtn: '(தவறான மொழியா? மாற்றுக)',
    whatYouSaid: 'நீங்கள் கூறியது:',
    identifiedBarriersLabel: 'கண்டறியப்பட்ட அணுகல் தடைகள்:',
    summaryInLang: 'உங்கள் மொழியில் விளக்கம்',
    listenAudio: 'குரல் கேட்க',
    readingOutLoud: 'வாசிக்கப்படுகிறது...',
    recommendedScheme: 'பரிந்துரைக்கப்படும் உதவி திட்டம்:',
    verifiedNgoMatch: 'சரிபார்க்கப்பட்ட NGO உதவி இணைப்பு',
    confirmAccuracy: 'விளக்கத்தை உறுதிப்படுத்தவும்:',
    confirmCreateBtn: 'உறுதிசெய்து கோரிக்கை அனுப்பு',
    requestCreatedTitle: 'உதவி கோரிக்கை உருவாக்கப்பட்டது!',
    caseRef: 'கோரிக்கை எண்:',
    trackRequestBtn: 'சிகிச்சை நிலையை கண்காணிக்கவும்',
    nextWorkerStepBtn: 'அடுத்த கட்டம்: பணியாளர் தளத்திற்கு செல்லவும்',

    // Care Rescue Tracking
    trackingTitle: 'உதவி மற்றும் உறுதிப்படுத்தல் பயணம்',
    trackingSub: 'வாகனம், நிதி உதவி மற்றும் மருத்துவமனை துணையின் நிகழ்நேர நிலை.',
    currentStage: 'தற்போதைய நிலை',
    progressPipeline: 'உதவி முன்னேற்ற நிலை',
    stageSubmitted: 'சமர்ப்பிக்கப்பட்டது',
    stageUnderReview: 'பரிசீலனையில்',
    stageWorkerAssigned: 'பணியாளர் நியமிக்கப்பட்டார்',
    stageAssistanceArranged: 'உதவி ஏற்பாடு செய்யப்பட்டது',
    stageOutcomeVerification: 'முடிவு சரிபார்ப்பு',
    stageResolved: 'முழுமையாக தீர்க்கப்பட்டது',
    assignedWorkerLabel: 'நியமிக்கப்பட்ட ஆஷா சுகாதார பணியாளர்',
    assignedProviderLabel: 'நியமிக்கப்பட்ட உதவி நிறுவனம் (NGO)',
    awaitingAcceptance: 'உதவி நிறுவன ஏற்புக்கு காத்திருக்கிறது',
    acceptedDispatched: '✓ உதவி ஏற்கப்பட்டு வாகனம் அனுப்பப்பட்டது',
    completeOutcomeBtn: 'முடிவு சரிபார்ப்பை பூர்த்தி செய்க',
    outcomeVerifiedTitle: 'சரிபார்க்கப்பட்ட முடிவு பதிவு செய்யப்பட்டது',
    needReopen: 'கோரிக்கையை மீண்டும் திறக்க வேண்டுமா?',
    timelineTitle: 'நேரக்குறிப்புடன் கூடிய நிகழ்வு பதிவுகள்',
    q1Label: '1. உதவி நிறுவனம் / ஓட்டுநர் உங்களை தொடர்பு கொண்டாரா?',
    q2Label: '2. வாக்களிக்கப்பட்ட உதவி (வாகனம்/சீட்டு) கிடைத்ததா?',
    q3Label: '3. நீங்கள் மருத்துவமனை பரிசோதனைக்கு சென்றீர்களா?',
    q4Label: '4. உங்கள் அணுகல் சிக்கல் தீர்க்கப்பட்டதா?',
    feedbackOptional: 'கூடுதல் கருத்துக்கள் (விருப்பப்பட்டால்):',
    saveOutcomeBtn: 'சரிபார்ப்பு முடிவை சேமிக்கவும்',

    // Worker Dashboard
    workerTitle: 'களப்பணியாளர் & ஆஷா ஒருங்கிணைப்பு தளம்',
    workerSub: 'AI தடைகளை சரிபார்க்கவும், சக்கர நாற்காலி வாகனங்களை இணைக்கவும், இதுவரை மருத்துவமனை செல்லாத புதிய நோயாளிகளை பதிவு செய்யவும்.',
    registerInvisibleBtn: 'புதிய நோயாளியை பதிவு செய்க',
    syncDraftsBtn: 'வரைவுகளை ஒத்திசைக்க',
    tabPending: 'நடவடிக்கை தேவை / தோல்விகள்',
    tabActive: 'ஒருங்கிணைப்பில் உள்ளவை',
    tabResolved: 'தீர்க்கப்பட்ட வழக்குகள்',
    tabOffline: 'ஆஃப்லைன் வரிசை (PWA)',
    tabIntake: '+ புதிய நோயாளி பதிவு',
    searchPlaceholder: 'நோயாளி பெயர், எண், மாவட்டம் கொண்டு தேடவும்...',
    matchAssignBtn: 'உதவி நிறுவனத்தை இணைக்கவும்',
    reassignBtn: 'மாற்று நிறுவனத்தை இணைக்க',
    correctAIBtn: 'AI தடைகளை திருத்துக',

    // NGO Portal
    ngoTitle: 'ஒதுக்கப்பட்ட நோயாளி கோரிக்கைகள்',
    operationalAvailability: 'சேவை கிடைக்கும் நிலை:',
    acceptReferralBtn: 'கோரிக்கையை ஏற்கவும்',
    declineReferralBtn: 'கோரிக்கையை நிராகரிக்க',
    recordAssistanceBtn: 'உதவி வழங்கியதை பதிவு செய்க',

    // Admin Console
    adminTitle: 'மாவட்ட நிர்வாகம் & கூட்டாளர் சரிபார்ப்பு',
    adminSub: 'உதவி நிறுவனங்களை சரிபார்க்கவும், தோல்விகளை கண்காணிக்கவும், தணிக்கை பதிவுகளை ஆராயவும்.',
    approveVerifyPartner: 'சரிபார்த்து அங்கீகரிக்கவும்',
    revokeVerification: 'அங்கீகாரத்தை ரத்துசெய்',

    // Gap Map & Analytics
    gapMapTitle: 'சுகாதார அணுகல் குறைபாடு வரைபடம்',
    gapMapSub: 'மாவட்ட அளவிலான மொத்த தகவல்கள் மட்டுமே. நோயாளியின் முகவரி பாதுகாக்கப்படும்.',
    allBarriersOption: 'அனைத்து தடைகளும் (மொத்த வழக்குகள்)',
    analyticsTitle: 'அடையாளம் நீக்கப்பட்ட சுகாதார அணுகல் புள்ளிவிவரங்கள்',
    analyticsSub: 'தடைகளை அகற்றுதல் மற்றும் சரிபார்க்கப்பட்ட சிகிச்சை வருகை குறித்த நிகழ்நேர புள்ளிவிவரங்கள்.',
    demoDataWarning: '⚠️ அனைத்து புள்ளிவிவரங்களும் மாதிரி தரவுகள் மட்டுமே',
    totalCoordinated: 'மொத்தம் ஒருங்கிணைக்கப்பட்டவை',
    verifiedResolution: 'உறுதிப்படுத்தப்பட்ட தீர்வு விகிதம்',
    invisiblePatientsCount: 'புதிய நோயாளிகள்',
    failureRecovery: 'மீட்கப்பட்ட வழக்குகள்'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('carebridge_lang') as AppLanguage;
      if (saved === 'en' || saved === 'ta') return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('carebridge_lang', lang);
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
