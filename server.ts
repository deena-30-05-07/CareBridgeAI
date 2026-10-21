import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '20mb' }));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Barrier Classification & Multilingual Voice2Care Endpoint
app.post('/api/gemini/analyze-access', async (req: Request, res: Response) => {
  try {
    const { inputType, text, audioBase64, mimeType, priorContext } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Emergency symptom regex detector as immediate safety check
    const rawInput = (text || '').toLowerCase();
    const urgentSignals = [
      'chest pain',
      'heart attack',
      'cannot breathe',
      'breathing difficulty',
      'severe bleeding',
      'unconscious',
      'நெஞ்சு வலி', // Tamil chest pain
      'மூச்சு திணறல்', // Tamil breathing difficulty
      'छाती में दर्द', // Hindi chest pain
      'सांस लेने में तकलीफ', // Hindi breathing
      'గుండె నొప్పి' // Telugu chest pain
    ];

    const hasImmediateEmergency = urgentSignals.some(s => rawInput.includes(s));

    if (!apiKey) {
      // Deterministic high-fidelity fallback for DEMO MODE if no API key is present
      return handleDemoFallback(text, hasImmediateEmergency, res);
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are CareBridge AI, a healthcare access coordination assistant for Bharat (India).
STRICT SAFETY BOUNDARIES:
- You are NOT a doctor or diagnostic tool.
- You must NEVER diagnose diseases, prescribe medication, or evaluate medical urgency.
- If the patient mentions severe acute symptoms (e.g. acute chest pain, sudden paralysis, severe bleeding, difficulty breathing), immediately set urgencyWarning=true and explain that they should call emergency services (112 or 108 in India).
- Your role is to identify HEALTHCARE ACCESS BARRIERS: Why can't the patient reach or receive care?
Barrier categories:
1. "Financial": cannot afford treatment, medicines, consultation, hospital fees, loss of daily wages.
2. "Transportation": no bus money, hospital is too far, no transport available in village, road blocked.
3. "Mobility": bedridden, frail elderly, wheelchair user, amputation, severe arthritis, cannot walk stairs.
4. "Accessibility": visually impaired, hearing impaired, wheelchair ramps missing, illiterate/cannot read forms.
5. "Language": cannot communicate with hospital staff, speaks tribal/minority dialect, non-local language.
6. "Caregiver Support": alone, elderly living by themselves, needs someone to accompany to hospital, child care issue.
7. "Other": lost paperwork, fear/distrust, hospital schedule clashes with survival needs.

Languages supported: Tamil, English, Hindi, Telugu, Malayalam, Kannada, Marathi, Bengali.
Auto-detect the language from the user's speech or text. Provide the explanation in the user's exact language so they can verify before request creation.`;

    const contents: any[] = [];

    if ((inputType === 'audio' || inputType === 'voice') && audioBase64) {
      contents.push({
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: audioBase64
        }
      });
      contents.push({
        text: 'Listen carefully to this patient speaking in their native Indian language. Transcribe what they said exactly, detect the language, identify their healthcare access barriers, and formulate an explanation in their language. Prior context: ' + (priorContext || 'none')
      });
    } else {
      contents.push({
        text: `Patient input: "${text}"\nPrior context: ${priorContext || 'none'}\nAnalyze access barriers according to instructions.`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLanguage: { type: Type.STRING, description: 'E.g. Tamil, Hindi, English, Telugu, Kannada, Malayalam, Marathi, Bengali' },
            languageCode: { type: Type.STRING, description: 'E.g. ta, hi, en, te, kn, ml, mr, bn' },
            transcription: { type: Type.STRING, description: 'Exact transcription in original script' },
            barriers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Selected from: Financial, Transportation, Mobility, Accessibility, Language, Caregiver Support, Other'
            },
            urgencyWarning: { type: Type.BOOLEAN, description: 'True if acute emergency warning is triggered' },
            urgencyReason: { type: Type.STRING, description: 'Why emergency 108/112 was flagged, if applicable' },
            plainLanguageReason: { type: Type.STRING, description: 'Simple 1-sentence reasoning in English for workers/admins' },
            explanationInPatientLanguage: { type: Type.STRING, description: 'Compassionate, clear summary in patient detected language explaining what barriers were found and asking them to confirm' },
            needsClarification: { type: Type.BOOLEAN, description: 'True ONLY if the barrier is fundamentally ambiguous' },
            clarificationQuestion: { type: Type.STRING, description: 'One single short question in patient language if needsClarification is true' },
            recommendedAssistanceType: { type: Type.STRING, description: 'Recommended verified NGO/public scheme assistance' },
            confidenceScore: { type: Type.NUMBER, description: '0.0 to 1.0 confidence score' }
          },
          required: [
            'detectedLanguage',
            'languageCode',
            'transcription',
            'barriers',
            'urgencyWarning',
            'plainLanguageReason',
            'explanationInPatientLanguage',
            'needsClarification',
            'recommendedAssistanceType',
            'confidenceScore'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    if (hasImmediateEmergency) {
      parsed.urgencyWarning = true;
      parsed.urgencyReason = 'Acute symptom mention detected. Emergency protocol 112/108 advised.';
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Error in analyze-access endpoint:', error);
    // Graceful fallback to demo mode on API error
    return handleDemoFallback(req.body.text || '', false, res, error.message);
  }
});

function handleDemoFallback(text: string, emergencyFlag: boolean, res: Response, debugError?: string) {
  const lower = (text || '').toLowerCase();

  // Lakshmi test scenario
  if (lower.includes('பஸ் காசு இல்லை') || lower.includes('மருத்துவமனைக்கு போக') || lower.includes('lakshmi') || lower.includes('tamil')) {
    return res.json({
      detectedLanguage: 'Tamil',
      languageCode: 'ta',
      transcription: text || 'எனக்கு மருத்துவமனைக்கு போக பஸ் காசு இல்லை.',
      barriers: ['Transportation', 'Financial'],
      urgencyWarning: emergencyFlag,
      urgencyReason: emergencyFlag ? 'Medical emergency advisory active' : null,
      plainLanguageReason: 'The patient explicitly stated that they lack money for bus fare to travel to the hospital.',
      explanationInPatientLanguage: 'உங்களுக்கு மருத்துவமனை செல்வதற்கான போக்குவரத்து கட்டணம் செலுத்துவதில் சிரமம் இருப்பதாக கண்டறியப்பட்டுள்ளது. உங்களுக்கு உதவ சரிபார்க்கப்பட்ட இலவச போக்குவரத்து சேவையை ஏற்பாடு செய்ய விரும்புகிறோம். இதை உறுதிப்படுத்துகிறீர்களா?',
      needsClarification: false,
      clarificationQuestion: null,
      recommendedAssistanceType: 'Subsidized/Free NGO Patient Transport & Community Health Worker Transit Token',
      confidenceScore: 0.96,
      isDemoFallback: true,
      debugMessage: debugError ? `Fallback used: ${debugError}` : 'Demo AI engine mode active'
    });
  }

  // Hindi wheelchair / mobility scenario
  if (lower.includes('व्हीलचेयर') || lower.includes('पैदल') || lower.includes('चल नहीं') || lower.includes('hindi') || lower.includes('सीढ़ी')) {
    return res.json({
      detectedLanguage: 'Hindi',
      languageCode: 'hi',
      transcription: text || 'मैं चल नहीं सकता और अस्पताल में व्हीलचेयर का कोई रास्ता नहीं है।',
      barriers: ['Mobility', 'Accessibility'],
      urgencyWarning: emergencyFlag,
      urgencyReason: emergencyFlag ? 'Medical emergency advisory active' : null,
      plainLanguageReason: 'The patient mentioned severe mobility limitations and hospital physical accessibility barriers.',
      explanationInPatientLanguage: 'हमने समझा है कि आपको चलने में कठिनाई है और व्हीलचेयर सुलभ सहायता की आवश्यकता है। क्या आप हमारे सत्यापित सहायक द्वारा सहायता प्राप्त करने की पुष्टि करते हैं?',
      needsClarification: false,
      clarificationQuestion: null,
      recommendedAssistanceType: 'Wheelchair-accessible medical van and hospital escort escort',
      confidenceScore: 0.94,
      isDemoFallback: true
    });
  }

  // General fallback
  const isEmergency = emergencyFlag || lower.includes('chest pain') || lower.includes('bleeding');
  const barriers: string[] = [];
  if (lower.includes('bus') || lower.includes('distance') || lower.includes('auto') || lower.includes('travel')) barriers.push('Transportation');
  if (lower.includes('money') || lower.includes('cost') || lower.includes('fee') || lower.includes('afford')) barriers.push('Financial');
  if (lower.includes('alone') || lower.includes('nobody') || lower.includes('caregiver')) barriers.push('Caregiver Support');
  if (lower.includes('language') || lower.includes('understand')) barriers.push('Language');
  if (lower.includes('wheelchair') || lower.includes('walk') || lower.includes('stairs')) barriers.push('Mobility');
  if (barriers.length === 0) barriers.push('Financial', 'Transportation');

  return res.json({
    detectedLanguage: 'English',
    languageCode: 'en',
    transcription: text || 'I need help getting to the district hospital for my checkup.',
    barriers: barriers,
    urgencyWarning: isEmergency,
    urgencyReason: isEmergency ? 'Emergency symptoms mentioned. Please dial 112 / 108.' : null,
    plainLanguageReason: `Identified ${barriers.join(' and ')} challenges preventing hospital attendance based on patient's statement.`,
    explanationInPatientLanguage: `We noticed that you are facing ${barriers.join(' & ')} challenges in reaching the clinic. We can coordinate with a verified local community partner to assist you. Do you confirm this?`,
    needsClarification: false,
    clarificationQuestion: null,
    recommendedAssistanceType: 'Verified Community Health Worker & Patient Transport Voucher',
    confidenceScore: 0.91,
    isDemoFallback: true
  });
}

// Vite middleware or static serving
async function setupViteOrStatic() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`CareBridge AI server running on port ${port} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

setupViteOrStatic();
