import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  Lock, 
  ArrowRight,
  Sparkles,
  Users,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { db } from '../lib/db';
import { UserRole, User } from '../types';
import { getAppLanguage, subscribeAppLanguage, t, AppLanguage } from '../lib/i18n';

interface AuthViewProps {
  onNavigate: (route: string) => void;
  onGoBack?: () => void;
  onOpenConsent: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onNavigate, onGoBack, onOpenConsent }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [city, setCity] = useState('Tiruchirappalli');
  const [district, setDistrict] = useState('Tiruchirappalli');
  const [consentAgreed, setConsentAgreed] = useState(true);
  const [appLang, setAppLang] = useState<AppLanguage>(getAppLanguage());
  const [ngoHelpers, setNgoHelpers] = useState<User[]>(db.getNgoUsers());
  const [showNgoSelector, setShowNgoSelector] = useState(false);

  useEffect(() => {
    const unsub = subscribeAppLanguage(setAppLang);
    setNgoHelpers(db.getNgoUsers());
    return unsub;
  }, []);

  const handleQuickLogin = (role: UserRole) => {
    if (role === 'ngo') {
      setShowNgoSelector(!showNgoSelector);
      return;
    }
    db.switchRoleQuick(role);
    if (role === 'patient') onNavigate('/patient/dashboard');
    else if (role === 'worker') onNavigate('/worker/dashboard');
    else if (role === 'admin') onNavigate('/admin/dashboard');
  };

  const handleSelectNgoHelper = (userId: string) => {
    db.switchUser(userId);
    onNavigate('/ngo/dashboard');
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newUser: User = {
      id: `user-${Date.now().toString().slice(-6)}`,
      name,
      phone,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@carebridge.demo`,
      role: selectedRole,
      hospitalName: selectedRole === 'patient' || selectedRole === 'worker' ? hospitalName : undefined,
      city: selectedRole === 'patient' || selectedRole === 'worker' ? city : undefined,
      district,
      state: 'Tamil Nadu',
      language: selectedRole === 'patient' ? 'Tamil' : 'English',
      consentGiven: consentAgreed,
      consentTimestamp: consentAgreed ? new Date().toISOString() : undefined,
      isVerified: selectedRole === 'admin' || selectedRole === 'worker' || selectedRole === 'ngo'
    };

    if (selectedRole === 'ngo') {
      newUser.ngoDetails = {
        organizationName: 'Community Volunteer Care Trust',
        services: ['Transportation', 'Mobility'],
        hasWheelchairVan: true,
        hasSignLanguageEscort: false,
        isAvailable: true
      };
    }

    db.saveUser(newUser);
    db.setCurrentUser(newUser);

    if (selectedRole === 'patient') onNavigate('/patient/dashboard');
    else if (selectedRole === 'worker') onNavigate('/worker/dashboard');
    else if (selectedRole === 'ngo') onNavigate('/ngo/dashboard');
    else if (selectedRole === 'admin') onNavigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center px-4 py-8 sm:py-10">
      <div className="w-full max-w-[520px] mx-auto">
        <div className="mb-5 flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            CareBridge<span className="text-teal-600">AI</span>
          </div>
        </div>

        <div className="bg-white rounded-[28px] border border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.08)] p-5 sm:p-6">
          <div className="flex border-b border-slate-200 pb-3 mb-5">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 text-center py-2 text-sm font-bold transition cursor-pointer ${
                !isRegister ? 'text-teal-700 border-b-2 border-teal-600' : 'text-slate-400'
              }`}
            >
              Quick Sign In
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 text-center py-2 text-sm font-bold transition cursor-pointer ${
                isRegister ? 'text-teal-700 border-b-2 border-teal-600' : 'text-slate-400'
              }`}
            >
              Register New User
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Select Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['patient', 'worker', 'ngo', 'admin'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`py-3 px-2 rounded-xl text-sm font-bold border transition cursor-pointer ${
                      selectedRole === r
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t(r, appLang)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Phone Number (10 digits) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98401 23456"
                className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {(selectedRole === 'patient' || selectedRole === 'worker') && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Hospital Name
                </label>
                <input
                  type="text"
                  required={selectedRole === 'patient' || selectedRole === 'worker'}
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Govt District Hospital"
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            )}

            {(selectedRole === 'patient' || selectedRole === 'worker') && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  City
                </label>
                <input
                  type="text"
                  required={selectedRole === 'patient' || selectedRole === 'worker'}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Tiruchirappalli"
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none"
              >
                <option value="Tiruchirappalli">Tiruchirappalli</option>
                <option value="Chennai">Chennai</option>
                <option value="Madurai">Madurai</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Salem">Salem</option>
                <option value="Thanjavur">Thanjavur</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-base font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isRegister ? 'Register & Enter Role Portal' : 'Continue to My Usage Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
