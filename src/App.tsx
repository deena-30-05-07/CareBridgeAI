import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EmergencyBanner } from './components/EmergencyBanner';
import { DemoTourModal } from './components/DemoTourModal';
import { ConsentModal } from './components/ConsentModal';
import { LandingView } from './views/LandingView';
import { AuthView } from './views/AuthView';
import { PatientDashboardView } from './views/PatientDashboardView';
import { PatientAssistantView } from './views/PatientAssistantView';
import { PatientRequestView } from './views/PatientRequestView';
import { PatientTrackingView } from './views/PatientTrackingView';
import { WorkerDashboardView } from './views/WorkerDashboardView';
import { NgoDashboardView } from './views/NgoDashboardView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { GapMapView } from './views/GapMapView';
import { AnalyticsView } from './views/AnalyticsView';
import { db } from './lib/db';
import { Sparkles, ArrowLeft, ShieldAlert, HeartHandshake } from 'lucide-react';
import { getAppLanguage, subscribeAppLanguage, t, AppLanguage } from './lib/i18n';
import { User, UserRole } from './types';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path && path !== '/' ? path : '/auth';
    }
    return '/auth';
  });

  const [historyStack, setHistoryStack] = useState<string[]>(['/']);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [appLang, setAppLang] = useState<AppLanguage>(getAppLanguage());
  const [currentUser, setCurrentUser] = useState<User>(() => db.getCurrentUser());

  // Sync route with browser history & DB updates
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentRoute(path);
    };
    window.addEventListener('popstate', handlePopState);
    const unsubLang = subscribeAppLanguage(setAppLang);
    const unsubDb = db.subscribe(() => {
      setCurrentUser(db.getCurrentUser());
    });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      unsubLang();
      unsubDb();
    };
  }, []);

  const navigate = (route: string) => {
    const targetPath = route.split('?')[0];
    setHistoryStack(prev => [...prev, targetPath]);
    setCurrentRoute(targetPath);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoBack = () => {
    if (historyStack.length > 1) {
      const newStack = [...historyStack];
      newStack.pop(); // remove current
      const previous = newStack[newStack.length - 1] || '/auth';
      setHistoryStack(newStack);
      setCurrentRoute(previous);
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', previous);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (currentRoute !== '/auth') {
      setCurrentRoute('/auth');
      setHistoryStack(['/auth']);
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/auth');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  };

  // Determine if a route is allowed for the logged in user's role
  const isRouteAllowedForRole = (route: string, role: UserRole): boolean => {
    if (route === '/' || route === '/auth') return true;

    if (role === 'patient') {
      return route.startsWith('/patient');
    }

    if (role === 'worker') {
      return route === '/worker/dashboard' || route === '/admin/gap-map';
    }

    if (role === 'ngo') {
      return route === '/ngo/dashboard' || route === '/admin/gap-map';
    }

    if (role === 'admin') {
      return route === '/admin/dashboard' || route === '/admin/gap-map' || route === '/admin/analytics';
    }

    return true;
  };

  // Role Access Restriction Screen
  const renderRoleRestrictionScreen = () => {
    const roleHomeRoute = 
      currentUser.role === 'patient' ? '/patient/dashboard' :
      currentUser.role === 'worker' ? '/worker/dashboard' :
      currentUser.role === 'ngo' ? '/ngo/dashboard' : '/admin/dashboard';

    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">
          {t('myUsageOnly', appLang)}
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          You are currently signed in as <strong>{currentUser.name}</strong> ({t(currentUser.role, appLang)}). 
          Under role-scoped security, you only have access to features designated for your role.
        </p>
        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            onClick={() => navigate(roleHomeRoute)}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            Open My {t(currentUser.role, appLang)} Portal
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition cursor-pointer"
          >
            {t('logout', appLang)}
          </button>
        </div>
      </div>
    );
  };

  // Render view matching current route with strict role usage scoping
  const renderRouteView = () => {
    const isGuest = currentUser.id === 'guest';

    if (isGuest && currentRoute !== '/auth') {
      return <AuthView onNavigate={navigate} onGoBack={handleGoBack} onOpenConsent={() => setIsConsentOpen(true)} />;
    }

    if (!isGuest && !isRouteAllowedForRole(currentRoute, currentUser.role)) {
      return renderRoleRestrictionScreen();
    }

    switch (currentRoute) {
      case '/':
      case '/auth':
        return <AuthView onNavigate={navigate} onGoBack={handleGoBack} onOpenConsent={() => setIsConsentOpen(true)} />;
      case '/patient/dashboard':
        return (
          <PatientDashboardView 
            onNavigate={navigate} 
            onGoBack={handleGoBack}
            onOpenConsent={() => setIsConsentOpen(true)}
            onOpenTour={() => setIsTourOpen(true)}
          />
        );
      case '/patient/assistant':
        return (
          <PatientAssistantView 
            onNavigate={navigate} 
            onGoBack={handleGoBack}
            onOpenConsent={() => setIsConsentOpen(true)}
          />
        );
      case '/patient/request':
        return (
          <PatientRequestView 
            onNavigate={navigate} 
            onGoBack={handleGoBack}
            onOpenConsent={() => setIsConsentOpen(true)}
          />
        );
      case '/patient/tracking':
        return <PatientTrackingView onNavigate={navigate} onGoBack={handleGoBack} />;
      case '/worker/dashboard':
        return <WorkerDashboardView onNavigate={navigate} onGoBack={handleGoBack} />;
      case '/ngo/dashboard':
        return <NgoDashboardView onNavigate={navigate} onGoBack={handleGoBack} />;
      case '/admin/dashboard':
        return <AdminDashboardView onNavigate={navigate} onGoBack={handleGoBack} />;
      case '/admin/gap-map':
        return <GapMapView onNavigate={navigate} onGoBack={handleGoBack} />;
      case '/admin/analytics':
        return <AnalyticsView onNavigate={navigate} onGoBack={handleGoBack} />;
      default:
        return <LandingView onNavigate={navigate} onOpenTour={() => setIsTourOpen(true)} />;
    }
  };

  const showGlobalShell = currentRoute !== '/auth' && currentRoute !== '/';
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-teal-500 selection:text-white">
      
      {showGlobalShell && <EmergencyBanner />}

      {showGlobalShell && (
        <Navbar 
          currentRoute={currentRoute}
          onNavigate={navigate}
          onGoBack={handleGoBack}
          canGoBack={true}
          onOpenTour={() => setIsTourOpen(true)}
          onOpenConsent={() => setIsConsentOpen(true)}
        />
      )}

      {/* Main Route Content */}
      <main className="flex-1">
        {renderRouteView()}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 font-bold text-slate-700">
          <span>CareBridge AI</span>
          <span>•</span>
          <span>{t('noPatientLeftBehind', appLang)}</span>
        </div>
        <p className="text-[11px] text-slate-400 max-w-md mx-auto">
          Voice-first access logistics platform coordinating subsidized transit, wheelchair escorts, linguistic navigators, and micro-grants across Tamil Nadu.
        </p>
      </footer>

      {/* Tour & Privacy Modals */}
      <DemoTourModal 
        isOpen={isTourOpen} 
        onClose={() => setIsTourOpen(false)} 
        onNavigate={navigate} 
      />
      
      <ConsentModal 
        isOpen={isConsentOpen} 
        onClose={() => setIsConsentOpen(false)} 
      />

    </div>
  );
}
