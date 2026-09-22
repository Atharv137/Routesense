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

const MainAppContent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const { isOffline, offlineQueueCount, syncOfflineQueue } = useOperations();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // When user role changes: if they are viewing the profile, keep them on profile; otherwise reset to home
  useEffect(() => {
    setActiveTab(prev => (prev === 'profile' ? 'profile' : 'home'));
  }, [currentUser?.role, currentUser?.uid]);

  if (isLoading) {
    return <SplashScreen onFinish={() => {}} />;
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
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-6 overflow-x-hidden">
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
