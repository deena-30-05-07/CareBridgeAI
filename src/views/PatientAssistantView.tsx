import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck, 
  PhoneCall, 
  Send,
  Check,
  ArrowLeft
} from 'lucide-react';
import { analyzeAccessBarrier, speakText } from '../lib/api';
import { db } from '../lib/db';
import { AIClassification, CareRequest, User } from '../types';
import { getAppLanguage, subscribeAppLanguage, t, AppLanguage } from '../lib/i18n';

interface PatientAssistantViewProps {
  onNavigate: (route: string) => void;
  onGoBack?: () => void;
  onOpenConsent: () => void;
}

export const PatientAssistantView: React.FC<PatientAssistantViewProps> = ({
  onNavigate,
  onGoBack,
  onOpenConsent
}) => {
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [classification, setClassification] = useState<AIClassification | null>(null);
  const [isCreatedSuccess, setIsCreatedSuccess] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isEditingLanguage, setIsEditingLanguage] = useState(false);
  const [appLang, setAppLang] = useState<AppLanguage>(getAppLanguage());
  const followUpId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('followup') : null;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const unsubDb = db.subscribe(() => {
      setCurrentUser(db.getCurrentUser());
    });
    const unsubLang = subscribeAppLanguage(setAppLang);

    return () => {
      unsubDb();
      unsubLang();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await processAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(sec => sec + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission not granted or unsupported:', err);
      alert('Microphone access could not be initialized. Please type your situation below.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const processAudioBlob = async (blob: Blob) => {
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        const res = await analyzeAccessBarrier({
          inputType: 'voice',
          audioBase64: base64Audio,
          mimeType: blob.type
        });
        setClassification(res);
        setIsAnalyzing(false);
      };
    } catch (err) {
      console.error('Audio processing error:', err);
      setIsAnalyzing(false);
    }
  };

  const handleTextSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await analyzeAccessBarrier({
        inputType: 'text',
        text: inputText
      });
      setClassification(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePlayVoiceExplanation = () => {
    if (!classification) return;
    setIsPlayingAudio(true);
    speakText(classification.explanationInPatientLanguage, classification.languageCode);
    setTimeout(() => setIsPlayingAudio(false), 3000);
  };

  const handleConfirmAndCreateRequest = () => {
    if (!classification) return;

    if (!currentUser.consentGiven) {
      onOpenConsent();
      return;
    }

    if (followUpId) {
      db.savePatientFollowUpResponse(followUpId, currentUser, classification.transcription || inputText, classification);
      const linkedRequestId = db.confirmFollowUpAnalysis(followUpId, currentUser);
      if (!linkedRequestId) return;
      setCreatedCaseId(linkedRequestId);
      setIsCreatedSuccess(true);
      return;
    }

    const newReqId = `req-${Date.now().toString().slice(-6)}`;
    const newRequest: CareRequest = {
      id: newReqId,
      patientId: currentUser.id,
      patientName: currentUser.name || 'Lakshmi Ramasamy',
      patientAge: 65,
      patientPhone: currentUser.phone || '+91 98401 23456',
      district: currentUser.district || 'Tiruchirappalli',
      state: currentUser.state || 'Tamil Nadu',
      originalInput: classification.transcription || inputText,
      inputType: isRecording ? 'voice' : 'text',
      classification,
      status: 'Submitted',
      appointmentDetails: {
        hospitalName: 'Govt District Headquarter Hospital, Tiruchirappalli',
        specialty: 'Clinical Review & Consultation',
        date: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0]
      },
      timelineLogs: [
        {
          status: 'Submitted',
          timestamp: new Date().toISOString(),
          note: `Voice2Care request filed. Barriers detected: ${classification.barriers.join(', ')}`,
          actor: currentUser.name
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.createRequest(newRequest);
    setCreatedCaseId(newReqId);
    setIsCreatedSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Top Prominent Back / Previous Option */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <button
          onClick={onGoBack || (() => onNavigate('/patient/dashboard'))}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition border border-slate-300 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-teal-700" />
          <span>{t('back', appLang)}</span>
        </button>

        <span className="text-xs text-slate-500 font-semibold">
          {currentUser.name} ({currentUser.district})
        </span>
      </div>

      {/* Main Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('v2cTitle', appLang)}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {t('v2cSub', appLang)}
        </p>
      </div>

      {/* Voice & Input Panel */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Voice recorder control */}
        <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-teal-100 rounded-3xl bg-teal-50/30">
          
          <button
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-lg cursor-pointer ${
              isRecording 
                ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200' 
                : 'bg-teal-600 hover:bg-teal-700 text-white ring-8 ring-teal-100'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-8 h-8" />
                <span className="text-[10px] font-bold mt-1">{t('tapToStop', appLang)}</span>
              </>
            ) : (
              <>
                <Mic className="w-8 h-8" />
                <span className="text-[10px] font-bold mt-1">{t('tapToSpeak', appLang)}</span>
              </>
            )}
          </button>

          <div className="mt-4 text-center">
            {isRecording ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-rose-600 flex items-center justify-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                  {t('recordingAudio', appLang)} ({recordingSeconds}s)
                </p>
              </div>
            ) : (
              <p className="text-xs font-medium text-slate-500">
                {t('speakHint', appLang)}
              </p>
            )}
          </div>
        </div>

        {/* Text Input Option */}
        <form onSubmit={handleTextSubmit} className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {t('typeSituation', appLang)}
          </label>
          <div className="flex gap-2">
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('typePlaceholder', appLang)}
              className="w-full text-sm p-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={isAnalyzing || !inputText.trim()}
              className="shrink-0 px-5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{t('analyze', appLang)}</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Clean Preset Options without verbose explanations */}
        <div className="pt-2">
          <p className="text-xs font-semibold text-slate-400 mb-2">{t('presetOptions', appLang)}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setInputText('எனக்கு மருத்துவமனைக்கு போக பஸ் காசு இல்லை, முழங்கால் வலி இருக்கிறது.');
              }}
              className="text-xs px-3.5 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 rounded-xl font-bold transition border border-slate-200 cursor-pointer"
            >
              தமிழ் (Tamil)
            </button>
            <button
              type="button"
              onClick={() => {
                setInputText('I have an appointment next week but cannot afford travel fare and need wheelchair transport.');
              }}
              className="text-xs px-3.5 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 rounded-xl font-bold transition border border-slate-200 cursor-pointer"
            >
              English
            </button>
            <button
              type="button"
              onClick={() => {
                setInputText('मैं चल नहीं सकता और अस्पताल में व्हीलचेयर की कोई सुविधा नहीं है।');
              }}
              className="text-xs px-3.5 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 rounded-xl font-bold transition border border-slate-200 cursor-pointer"
            >
              हिंदी (Hindi)
            </button>
          </div>
        </div>

      </div>

      {/* Loading state */}
      {isAnalyzing && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-sm font-bold text-slate-800">
            {t('analyzingText', appLang)}
          </p>
        </div>
      )}

      {/* Analysis Output Section - CLEAN without verbose clutter */}
      {classification && !isAnalyzing && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-teal-500/80 shadow-lg space-y-6 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Emergency Alert (if detected) */}
          {classification.urgencyWarning && (
            <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-sm">{t('potentialEmergency', appLang)}</h4>
                <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                  {classification.urgencyReason || 'The symptoms described may require urgent medical evaluation.'}
                </p>
                <div className="flex gap-2 mt-3">
                  <a href="tel:108" className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{t('call108', appLang)}</span>
                  </a>
                  <a href="tel:112" className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('call112', appLang)}</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Language & Transcription Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('detectedLanguage', appLang)}:
              </span>
              <span className="font-extrabold text-teal-800 text-sm bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                {classification.detectedLanguage}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingLanguage(!isEditingLanguage)}
                className="text-xs text-slate-500 hover:text-teal-700 underline ml-2 cursor-pointer"
              >
                (Change)
              </button>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              {t('confidence', appLang)}: {(classification.confidenceScore * 100).toFixed(0)}%
            </div>
          </div>

          {/* User correction of detected language if needed */}
          {isEditingLanguage && (
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-2">
              {['Tamil', 'English', 'Hindi', 'Telugu', 'Malayalam', 'Kannada', 'Marathi', 'Bengali'].map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setClassification({ ...classification, detectedLanguage: lang });
                    setIsEditingLanguage(false);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition cursor-pointer ${
                    classification.detectedLanguage === lang 
                      ? 'bg-teal-600 text-white border-teal-600' 
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}

          {/* Patient Transcription */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {t('whatYouSaid', appLang)}:
            </span>
            <p className="text-base text-slate-900 font-medium italic">
              "{classification.transcription}"
            </p>
          </div>

          {/* Clean Identified Barriers (No cluttered explanation) */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              {t('identifiedBarriers', appLang)}:
            </span>
            <div className="flex flex-wrap gap-2">
              {classification.barriers.map((barrier) => (
                <span
                  key={barrier}
                  className="px-3 py-1.5 rounded-xl font-black text-xs bg-teal-100 text-teal-900 border border-teal-300 flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>{barrier}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Audio Explanation Button */}
          <div className="flex items-center justify-between p-4 bg-teal-50 rounded-2xl border border-teal-200">
            <div className="text-xs font-bold text-teal-900">
              {t('summaryInLanguage', appLang)}:
            </div>
            <button
              type="button"
              onClick={handlePlayVoiceExplanation}
              disabled={isPlayingAudio}
              className="text-xs font-bold text-teal-800 bg-white hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce text-teal-600' : ''}`} />
              <span>{isPlayingAudio ? 'Playing...' : t('listenAudio', appLang)}</span>
            </button>
          </div>

          {/* Recommended Scheme */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
                {t('recommendedScheme', appLang)}:
              </span>
              <p className="text-xs font-bold text-blue-950 mt-0.5">
                {classification.recommendedAssistanceType}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-200 text-blue-900">
              {t('verified', appLang)}
            </span>
          </div>

          {/* Confirmation & Previous Options */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setClassification(null)}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('cancelRespeak', appLang)}</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmAndCreateRequest}
              className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('confirmAndCreate', appLang)}</span>
            </button>
          </div>

        </div>
      )}

      {/* Success Modal */}
      {isCreatedSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-teal-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              {t('requestCreatedTitle', appLang)}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Case Reference: <strong className="font-mono text-teal-800">{createdCaseId}</strong>.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onNavigate('/patient/tracking')}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('trackRequestBtn', appLang)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  db.switchRoleQuick('worker');
                  onNavigate('/worker/dashboard');
                }}
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                {t('openWorkerDeskBtn', appLang)}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
