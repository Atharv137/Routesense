import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OperationsProvider, useOperations } from './context/OperationsContext';
import { SplashScreen } from './components/auth/SplashScreen';
import { LoginView } from './components/auth/LoginView';
import { SignUpView } from './components/auth/SignUpView';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { OfflineBanner } from './components/common/OfflineBanner';
import { QuickRoleSwitcher } from './components/common/QuickRoleSwitcher';
import { NotificationModal } from './components/common/NotificationModal';
import { ProfileView } from './components/common/ProfileView';

// Conductor Views
import { ConductorHome } from './components/conductor/ConductorHome';
import { ShiftSummaryView } from './components/conductor/ShiftSummaryView';
import { TicketHistoryView } from './components/conductor/TicketHistoryView';

// Driver Views
import { DriverHome } from './components/driver/DriverHome';
import { DriverTripView } from './components/driver/DriverTripView';
import { IncidentHistoryView } from './components/driver/IncidentHistoryView';

// Operations Views
import { OperationsDashboard } from './components/operations/OperationsDashboard';
import { LiveFleetMap } from './components/operations/LiveFleetMap';
import { AnalyticsView } from './components/operations/AnalyticsView';
import { RecurringIssuesView } from './components/operations/RecurringIssuesView';

// Passenger Views
import { PassengerHome } from './components/passenger/PassengerHome';
import { RouteSearchView } from './components/passenger/RouteSearchView';
import { PassengerTicketsView } from './components/passenger/PassengerTicketsView';
import { LiveTrackingView } from './components/passenger/LiveTrackingView';

import { Bus, ShieldAlert } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, isLoading, showSplash, dismissSplash, authError, logout } = useAuth();
  const { isOffline, offlineQueueCount, syncOfflineQueue } = useOperations();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // When user role changes: if they are viewing the profile, keep them on profile; otherwise reset to home
  useEffect(() => {
    setActiveTab(prev => (prev === 'profile' ? 'profile' : 'home'));
  }, [currentUser?.role, currentUser?.uid]);

  if (showSplash) {
    return <SplashScreen onFinish={dismissSplash} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FF8A1F] flex items-center justify-center text-white shadow-lg shadow-orange-500/25 mb-4 animate-pulse">
          <Bus className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-600">
          <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
          Verifying authenticated session...
        </div>
      </div>
    );
  }

  // Fail closed: Authorization error screen
  if (authError) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#171717] mb-2">Access Authorization Error</h2>
        <p className="text-xs text-neutral-600 max-w-sm mb-6 leading-relaxed">
          {authError}
        </p>
        <button
          onClick={logout}
          className="px-5 py-2.5 rounded-2xl bg-[#FF6B00] hover:bg-[#E55F00] text-white text-xs font-bold shadow-md shadow-orange-500/20 cursor-pointer"
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  // Not logged in -> Show Login or SignUp
  if (!currentUser) {
    return authMode === 'login' ? (
      <LoginView onSwitchToSignUp={() => setAuthMode('signup')} />
    ) : (
      <SignUpView onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  // Render role-specific screen based on role & active tab
  const renderRoleScreen = () => {
    // 1. Universal profile tab across all roles
    if (activeTab === 'profile') {
      return (
        <ProfileView
          onBack={() => setActiveTab('home')}
          onNavigateTab={setActiveTab}
        />
      );
    }

    // 2. Role-specific views based on activeTab
    switch (currentUser.role) {
      case 'operations_manager':
        if (activeTab === 'dashboard') {
          return <AnalyticsView onBack={() => setActiveTab('home')} />;
        }
        if (activeTab === 'fleet') {
          return <LiveFleetMap onBack={() => setActiveTab('home')} />;
        }
        if (activeTab === 'issues') {
          return <RecurringIssuesView onBack={() => setActiveTab('home')} />;
        }
        return <OperationsDashboard onNavigateTab={setActiveTab} />;

      case 'conductor':
        if (activeTab === 'trips') {
          return <ShiftSummaryView onBack={() => setActiveTab('home')} />;
        }
        if (activeTab === 'tickets' || activeTab === 'history') {
          return <TicketHistoryView onBack={() => setActiveTab('home')} />;
        }
        return <ConductorHome onNavigateTab={setActiveTab} />;

      case 'driver':
        if (activeTab === 'trips') {
          return <DriverTripView onBack={() => setActiveTab('home')} />;
        }
        if (activeTab === 'issues' || activeTab === 'history') {
          return <IncidentHistoryView onBack={() => setActiveTab('home')} />;
        }
        return <DriverHome onNavigateTab={setActiveTab} />;

      case 'passenger':
      default:
        if (activeTab === 'routes') {
          return <RouteSearchView onBack={() => setActiveTab('home')} />;
        }
        if (activeTab === 'tickets') {
          return <PassengerTicketsView onBack={() => setActiveTab('home')} />;
        }
        if (activeTab === 'tracking') {
          return <LiveTrackingView onBack={() => setActiveTab('home')} />;
        }
        return <PassengerHome onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col font-sans text-[#171717] antialiased selection:bg-orange-500 selection:text-white w-full overflow-x-hidden">
      {/* Offline Status Warning Bar */}
      <OfflineBanner
        isOffline={isOffline}
        pendingSyncCount={offlineQueueCount}
        onForceSync={syncOfflineQueue}
      />

      {/* App Header */}
      <Header
        onOpenNotifications={() => setShowNotificationModal(true)}
        onOpenProfile={() => setActiveTab('profile')}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 overflow-x-hidden transition-all">
        {renderRoleScreen()}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={currentUser.role}
      />

      {/* Notifications Drawer */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <OperationsProvider>
        <MainAppContent />
      </OperationsProvider>
    </AuthProvider>
  );
}

export default App;
