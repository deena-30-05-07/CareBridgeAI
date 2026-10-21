import React, { useState, useEffect } from 'react';
import { AlertTriangle, PhoneCall, ShieldCheck } from 'lucide-react';
import { getAppLanguage, subscribeAppLanguage, t, AppLanguage } from '../lib/i18n';

export const EmergencyBanner: React.FC = () => {
  const [lang, setLang] = useState<AppLanguage>(getAppLanguage());

  useEffect(() => {
    return subscribeAppLanguage(setLang);
  }, []);

  return (
    <aside aria-label="Emergency Medical Guidance" className="bg-amber-600 text-white px-4 py-2 text-xs md:text-sm font-medium flex flex-wrap items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-2 max-w-4xl">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-100" />
        <span className="text-white font-medium text-[11px] sm:text-xs">
          {t('emergencyWarning', lang)}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a 
          href="tel:108"
          className="inline-flex items-center gap-1 bg-white text-amber-900 font-bold px-2.5 py-1 rounded-lg text-xs hover:bg-amber-50 transition shadow-xs"
        >
          <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
          <span>{t('call108', lang)}</span>
        </a>
        <a 
          href="tel:112"
          className="inline-flex items-center gap-1 bg-amber-950 text-white font-bold px-2.5 py-1 rounded-lg text-xs hover:bg-black transition shadow-xs"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('call112', lang)}</span>
        </a>
      </div>
    </aside>
  );
};
