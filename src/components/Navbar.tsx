import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Mic, 
  MapPin, 
  BarChart3, 
  ShieldCheck, 
  Users, 
  Building2, 
  Wifi, 
  WifiOff, 
  Sparkles, 
  ChevronDown, 
  Menu, 
  X,
  Compass,
  FileCheck,
  Languages,
  ArrowLeft,
  Plus,
  LogOut,
  UserCheck
} from 'lucide-react';
import { db } from '../lib/db';
import { UserRole, User } from '../types';
import { getAppLanguage, setAppLanguage, subscribeAppLanguage, t, AppLanguage } from '../lib/i18n';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onGoBack: () => void;
  canGoBack: boolean;
  onOpenTour: () => void;
  onOpenConsent: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onGoBack,
  canGoBack,
  onOpenTour,
  onOpenConsent
}) => {
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
  const [ngoUsers, setNgoUsers] = useState<User[]>(db.getNgoUsers());
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [appLang, setAppLangState] = useState<AppLanguage>(getAppLanguage());

  useEffect(() => {
    const unsubDb = db.subscribe(() => {
      setCurrentUser(db.getCurrentUser());
      setNgoUsers(db.getNgoUsers());
    });

    const unsubLang = subscribeAppLanguage((lang) => {
      setAppLangState(lang);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubDb();
      unsubLang();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    db.switchRoleQuick(role);
    setRoleDropdownOpen(false);
    if (role === 'patient') onNavigate('/patient/dashboard');
    else if (role === 'worker') onNavigate('/worker/dashboard');
    else if (role === 'ngo') onNavigate('/ngo/dashboard');
    else if (role === 'admin') onNavigate('/admin/dashboard');
  };

  const handleSwitchNgoUser = (userId: string) => {
    db.switchUser(userId);
    setRoleDropdownOpen(false);
    onNavigate('/ngo/dashboard');
  };

  const handleLogout = () => {
    db.logout();
    setRoleDropdownOpen(false);
    onNavigate('/auth');
  };

  const toggleLanguage = () => {
    const nextLang = appLang === 'en' ? 'ta' : 'en';
    setAppLanguage(nextLang);
  };

  // Strictly Role-Scoped Nav Items: Each logged in user only sees their own usage part!
  const getRoleNavItems = () => {
    switch (currentUser.role) {
      case 'patient':
        return [
          { label: t('navVoice2Care', appLang), route: '/patient/assistant', icon: Mic },
          { label: t('navTrackCare', appLang), route: '/patient/tracking', icon: Compass },
          { label: appLang === 'ta' ? 'புதிய உதவி கோரிக்கை' : 'New Request', route: '/patient/request', icon: Plus },
          { label: appLang === 'ta' ? 'நோயாளி தளம்' : 'My Requests', route: '/patient/dashboard', icon: HeartHandshake }
        ];
      case 'worker':
        return [
          { label: t('navWorkerDesk', appLang), route: '/worker/dashboard', icon: Users },
          { label: t('navGapMap', appLang), route: '/admin/gap-map', icon: MapPin }
        ];
      case 'ngo':
        return [
          { label: t('navNgoPortal', appLang), route: '/ngo/dashboard', icon: Building2 },
          { label: t('navGapMap', appLang), route: '/admin/gap-map', icon: MapPin }
        ];
      case 'admin':
        return [
          { label: t('navAdminDesk', appLang), route: '/admin/dashboard', icon: ShieldCheck },
          { label: t('navGapMap', appLang), route: '/admin/gap-map', icon: MapPin },
          { label: t('navAnalytics', appLang), route: '/admin/analytics', icon: BarChart3 }
        ];
      default:
        return [
          { label: t('navVoice2Care', appLang), route: '/patient/assistant', icon: Mic }
        ];
    }
  };

  const navItems = getRoleNavItems();

  const roleLabels: Record<UserRole, { title: string; color: string; bg: string }> = {
    patient: { title: t('patient', appLang), color: 'bg-teal-500', bg: 'bg-teal-50 text-teal-800 border-teal-200' },
    worker: { title: t('worker', appLang), color: 'bg-blue-600', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
    ngo: { title: t('ngo', appLang), color: 'bg-emerald-600', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    admin: { title: t('admin', appLang), color: 'bg-purple-600', bg: 'bg-purple-50 text-purple-800 border-purple-200' }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Previous / Back button + Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Always visible Previous / Back button */}
            <button
              onClick={onGoBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:border-teal-300 text-slate-800 text-xs font-black transition border border-slate-300 shadow-xs cursor-pointer"
              title="Go to previous page"
            >
              <ArrowLeft className="w-4 h-4 text-teal-700" />
              <span>{t('backShort', appLang)}</span>
            </button>

            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                    CareBridge<span className="text-teal-600 font-black">AI</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation - Strictly Role-Scoped */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => onNavigate(item.route)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isActive 
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-300 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Universal Language Switcher Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-teal-600 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-black transition shadow-xs cursor-pointer"
              title="Switch language between Tamil and English"
            >
              <Languages className="w-4 h-4 text-teal-700" />
              <span>{appLang === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Tour Button */}
            <button
              onClick={onOpenTour}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              title="Launch Guided Evaluation Scenarios"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">{t('tour', appLang)}</span>
            </button>

            {/* Online/Offline Status */}
            <div 
              className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('online', appLang)}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('offline', appLang)}</span>
                </>
              )}
            </div>

            {/* Role & User Badge + Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-300 hover:border-teal-400 bg-slate-50 hover:bg-white text-slate-800 text-xs font-bold transition shadow-xs cursor-pointer"
                title="Switch active user or change role"
              >
                <div className={`w-2.5 h-2.5 rounded-full ${roleLabels[currentUser.role]?.color || 'bg-slate-400'}`} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-slate-400 leading-none uppercase font-black">
                    {roleLabels[currentUser.role]?.title}
                  </span>
                  <span className="font-bold text-slate-900 truncate max-w-[110px] sm:max-w-[140px] leading-tight">
                    {currentUser.name}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 divide-y divide-slate-100">
                  
                  {/* Active user information badge */}
                  <div className="px-3.5 py-2.5 bg-slate-50">
                    <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider block">
                      {t('myUsageOnly', appLang)}
                    </span>
                    <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${roleLabels[currentUser.role]?.color}`} />
                      <span>{roleLabels[currentUser.role]?.title}</span>
                      <span>•</span>
                      <span>{currentUser.district}</span>
                    </p>
                  </div>

                  {/* Multiple NGO Helpers Quick Switch (when in NGO role or browsing helpers) */}
                  {currentUser.role === 'ngo' && (
                    <div className="py-2 px-3">
                      <div className="flex items-center justify-between pb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {t('activeNgoHelpers', appLang)} ({ngoUsers.length})
                        </span>
                      </div>
                      <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                        {ngoUsers.map((ngo) => {
                          const isCurrent = currentUser.id === ngo.id;
                          return (
                            <button
                              key={ngo.id}
                              onClick={() => handleSwitchNgoUser(ngo.id)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                                isCurrent 
                                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200' 
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <div className="truncate mr-2">
                                <span className="block truncate font-semibold">{ngo.name}</span>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {ngo.ngoDetails?.organizationName || 'NGO Partner'}
                                </span>
                              </div>
                              {isCurrent && (
                                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black shrink-0">
                                  {t('active', appLang)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Switch to Other Roles */}
                  <div className="py-2 px-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {t('selectRole', appLang)}
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['patient', 'worker', 'ngo', 'admin'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => handleRoleSelect(r)}
                          className={`text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer border ${
                            currentUser.role === r 
                              ? `${roleLabels[r].bg} font-black` 
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${roleLabels[r].color}`} />
                            <span className="truncate">{roleLabels[r].title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action items: Privacy and Logout/Switch User */}
                  <div className="py-2 px-3 space-y-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left py-1.5 px-2 rounded-xl text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 font-bold transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>{t('logout', appLang)}</span>
                    </button>

                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onOpenConsent();
                      }}
                      className="w-full text-left py-1 px-2 rounded-lg text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck className="w-3 h-3 text-slate-400" />
                      <span>{t('privacyCharter', appLang)}</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-100 space-y-2">
            
            {/* Active user role banner in mobile */}
            <div className="px-3 py-2 bg-slate-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  {roleLabels[currentUser.role]?.title}
                </span>
                <span className="text-xs font-bold text-slate-900">{currentUser.name}</span>
              </div>
              <button
                onClick={toggleLanguage}
                className="px-2.5 py-1 bg-teal-600 text-white rounded-lg text-xs font-black cursor-pointer"
              >
                {appLang === 'en' ? 'தமிழ்' : 'English'}
              </button>
            </div>

            {/* Mobile Nav Items strictly for current role */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.route;
                return (
                  <button
                    key={item.route}
                    onClick={() => {
                      onNavigate(item.route);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isActive ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-teal-600" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Logout / Switch User */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-700 bg-rose-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout', appLang)}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
