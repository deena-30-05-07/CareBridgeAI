import { AIClassification } from '../types';

export interface AnalyzeAccessParams {
  inputType: 'voice' | 'text';
  text?: string;
  audioBase64?: string;
  mimeType?: string;
  priorContext?: string;
}

export async function analyzeAccessBarrier(params: AnalyzeAccessParams): Promise<AIClassification> {
  try {
    const res = await fetch('/api/gemini/analyze-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const data = await res.json();
    return {
      detectedLanguage: data.detectedLanguage || 'English',
      languageCode: data.languageCode || 'en',
      transcription: data.transcription || params.text || '',
      barriers: data.barriers || ['Transportation'],
      urgencyWarning: Boolean(data.urgencyWarning),
      urgencyReason: data.urgencyReason || null,
      plainLanguageReason: data.plainLanguageReason || 'Healthcare access barrier identified from statement.',
      explanationInPatientLanguage: data.explanationInPatientLanguage || data.transcription || '',
      needsClarification: Boolean(data.needsClarification),
      clarificationQuestion: data.clarificationQuestion || null,
      recommendedAssistanceType: data.recommendedAssistanceType || 'Community Health Worker Escort',
      confidenceScore: typeof data.confidenceScore === 'number' ? data.confidenceScore : 0.95
    };
  } catch (err: any) {
    console.warn('API call failed, falling back to local heuristic analysis:', err);
    return getLocalHeuristicAnalysis(params.text || '');
  }
}

// Fallback heuristic if server network is severed
function getLocalHeuristicAnalysis(text: string): AIClassification {
  const lower = text.toLowerCase();
  
  if (lower.includes('பஸ் காசு இல்லை') || lower.includes('மருத்துவமனைக்கு') || lower.includes('காசு') || lower.includes('tamil')) {
    return {
      detectedLanguage: 'Tamil',
      languageCode: 'ta',
      transcription: text || 'எனக்கு மருத்துவமனைக்கு போக பஸ் காசு இல்லை.',
      barriers: ['Transportation', 'Financial'],
      urgencyWarning: false,
      urgencyReason: null,
      plainLanguageReason: 'The patient cannot afford bus fare to attend their hospital consultation.',
      explanationInPatientLanguage: 'மருத்துவமனை செல்ல பேருந்து கட்டணம் செலுத்த சிரமம் உள்ளது என்று கண்டறியப்பட்டது. சரிபார்க்கப்பட்ட இலவச போக்குவரத்து சேவையை ஏற்பாடு செய்ய ஒப்புதல் அளிக்கிறீர்களா?',
      needsClarification: false,
      clarificationQuestion: null,
      recommendedAssistanceType: 'Kaveri Seva Transport Voucher',
      confidenceScore: 0.95
    };
  }

  const isEmergency = lower.includes('chest pain') || lower.includes('breathing') || lower.includes('bleeding');
  const barriers: any[] = [];
  if (lower.includes('bus') || lower.includes('travel') || lower.includes('distance')) barriers.push('Transportation');
  if (lower.includes('money') || lower.includes('afford') || lower.includes('expensive')) barriers.push('Financial');
  if (lower.includes('wheelchair') || lower.includes('walk') || lower.includes('stairs')) barriers.push('Mobility');
  if (lower.includes('alone') || lower.includes('nobody')) barriers.push('Caregiver Support');
  if (barriers.length === 0) barriers.push('Transportation', 'Financial');

  return {
    detectedLanguage: 'English',
    languageCode: 'en',
    transcription: text || 'I need help getting to the hospital for my follow-up appointment.',
    barriers: barriers,
    urgencyWarning: isEmergency,
    urgencyReason: isEmergency ? 'Acute symptoms detected. Please seek emergency medical care at 112 / 108.' : null,
    plainLanguageReason: `Identified ${barriers.join(' and ')} challenges preventing timely clinical care.`,
    explanationInPatientLanguage: `We noted that you are experiencing ${barriers.join(' & ')} access challenges. A verified community worker can assist you. Would you like to proceed?`,
    needsClarification: false,
    clarificationQuestion: null,
    recommendedAssistanceType: 'Verified Local Community Escort & Transport Pass',
    confidenceScore: 0.90
  };
}

// Text-to-speech helper for patient voice feedback
export function speakText(text: string, languageCode = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  
  const voices = window.speechSynthesis.getVoices();
  const langMatch = voices.find(v => v.lang.startsWith(languageCode) || v.lang.includes(languageCode));
  if (langMatch) {
    utterance.voice = langMatch;
  }
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}
