import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  Bell,
  Globe,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Bus,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Check,
  ShieldAlert,
  Send,
  KeyRound,
  Edit2,
  Save,
  X,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOperations } from '../../context/OperationsContext';
import { UserRole } from '../../types';

interface ProfileViewProps {
  onBack?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onNavigateTab }) => {
  const {
    currentUser,
    firebaseUser,
    logout,
    loginAsRole,
    resetPassword,
    resendVerificationEmail,
    updateUserProfile,
    isDemoMode,
  } = useAuth();
  const { isOffline, toggleOfflineMode, tickets, incidents } = useOperations();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState<'en' | 'mr' | 'hi'>('en');

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [profileActionStatus, setProfileActionStatus] = useState<{
    type?: 'success' | 'error';
    message?: string;
  }>({});
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isSendingVerify, setIsSendingVerify] = useState(false);

  const roleTitles: Record<UserRole, string> = {
    operations_manager: 'Operations Manager',
    conductor: 'Bus Conductor',
    driver: 'Fleet Driver',
    passenger: 'Commuter / Passenger',
  };

  const personas = [
    {
      role: 'operations_manager' as UserRole,
      label: 'Operations',
      name: 'Priya Sharma',
      desc: 'Live fleet GPS, delay heatmaps & analytics',
      icon: ShieldCheck,
      badgeBg: 'bg-orange-50 text-[#FF6B00]',
    },
    {
      role: 'conductor' as UserRole,
      label: 'Conductor',
      name: 'Anita Deshmukh',
      desc: '10s ticket logging & shift reconciliation',
      icon: Users,
      badgeBg: 'bg-emerald-50 text-[#22A06B]',
    },
    {
      role: 'driver' as UserRole,
      label: 'Fleet Driver',
      name: 'Ramesh Patil',
      desc: 'Speedometer, live trips & incident logs',
      icon: Bus,
      badgeBg: 'bg-blue-50 text-blue-600',
    },
    {
      role: 'passenger' as UserRole,
      label: 'Passenger',
      name: 'Aarav Kulkarni',
      desc: 'Live tracking, digital QR passes & Razorpay',
      icon: Sparkles,
      badgeBg: 'bg-purple-50 text-purple-600',
    },
  ];

  const getRoleAssignmentInfo = () => {
    switch (currentUser?.role) {
      case 'operations_manager':
        return {
          location: 'Command Center: Shivaji Nagar Central Depot',
          duty: 'Shift: Morning Dispatch (06:00 - 15:00)',
          assignment: 'Fleet Scope: 4 Corridors (84 Buses)',
        };
      case 'conductor':
        return {
          location: 'Assigned Depot: Shivaji Nagar Depot',
          duty: 'Active Shift: Morning Peak (06:00 - 14:00)',
          assignment: `Assignment: ${currentUser.routeAssigned ? 'Route ' + currentUser.routeAssigned.replace('route_', '') : 'Route 101'} • Bus MH12 QK 9021`,
        };
      case 'driver':
        return {
          location: 'Assigned Depot: Shivaji Nagar Depot',
          duty: 'Active Shift: Morning Dispatch (06:00 - 14:00)',
          assignment: `Assignment: ${currentUser.routeAssigned ? 'Route ' + currentUser.routeAssigned.replace('route_', '') : 'Route 101'} • Bus MH12 QK 9021`,
        };
      case 'passenger':
      default:
        return {
          location: 'Primary Transit Hub: Swargate / Pune Station',
          duty: 'Transit Pass: Monthly Pass (Active)',
          assignment: 'Frequent Corridor: Route 101 (Express)',
        };
    }
  };

  const getRoleStats = () => {
    switch (currentUser?.role) {
      case 'operations_manager':
        return [
          { label: 'Trips Monitored', value: '124', change: '+4% today' },
          { label: 'On-Time Index', value: '71%', change: 'Target: 75%' },
          { label: 'Open Incidents', value: `${incidents.filter(i => i.status === 'open').length || 12}`, change: 'Active' },
          { label: 'Depots Active', value: '4', change: 'Region 1' },
        ];
      case 'conductor':
        return [
          { label: 'Tickets Issued Today', value: `${tickets.length || 86}`, change: '+18% vs avg' },
          { label: 'Cash Collected', value: '₹3,420', change: 'Shift #1' },
          { label: 'Active Route', value: '101', change: 'Pune - Swargate' },
          { label: 'Pass Scans', value: '24', change: 'Digital QR' },
        ];
      case 'driver':
        return [
          { label: 'Completed Trips', value: '6', change: 'Today' },
          { label: 'Distance Covered', value: '142 km', change: 'Route 101' },
          { label: 'Safety Rating', value: '4.9 ★', change: 'Top 5%' },
          { label: 'Assigned Bus', value: 'MH12 QK 9021', change: 'Electric AC' },
        ];
      case 'passenger':
      default:
        return [
          { label: 'Wallet Balance', value: '₹350', change: 'Auto-topup on' },
          { label: 'Active Passes', value: '1', change: 'Monthly Pass' },
          { label: 'Trips Taken', value: '18', change: 'This Month' },
          { label: 'CO2 Saved', value: '14.2 kg', change: 'Eco Hero' },
        ];
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setProfileActionStatus({ type: 'error', message: 'Name cannot be empty.' });
      return;
    }
    const res = await updateUserProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
    });
    if (res.success) {
      setIsEditing(false);
      setProfileActionStatus({ type: 'success', message: 'Profile updated in Firestore!' });
      setTimeout(() => setProfileActionStatus({}), 3000);
    } else {
      setProfileActionStatus({ type: 'error', message: res.error || 'Failed to update profile.' });
    }
  };

  const handleSendResetPassword = async () => {
    if (!currentUser?.email) return;
    setIsSendingReset(true);
    const res = await resetPassword(currentUser.email);
    setIsSendingReset(false);
    if (res.success) {
      setProfileActionStatus({
        type: 'success',
        message: `Password reset email sent to ${currentUser.email}`,
      });
      setTimeout(() => setProfileActionStatus({}), 4000);
    } else {
      setProfileActionStatus({ type: 'error', message: res.error || 'Could not send reset email.' });
    }
  };

  const handleSendVerification = async () => {
    setIsSendingVerify(true);
    const res = await resendVerificationEmail();
    setIsSendingVerify(false);
    if (res.success) {
      setProfileActionStatus({
        type: 'success',
        message: 'Verification link sent to your registered email address.',
      });
      setTimeout(() => setProfileActionStatus({}), 4000);
    } else {
      setProfileActionStatus({ type: 'error', message: res.error || 'Could not send verification email.' });
    }
  };

  const stats = getRoleStats();
  const assignmentInfo = getRoleAssignmentInfo();
  const currentRole = currentUser?.role || 'passenger';
  const isEmailVerified = firebaseUser?.emailVerified ?? currentUser?.emailVerified ?? false;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto pb-28 md:pb-12 animate-in fade-in duration-200 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-[#6B6B6B] hover:text-[#171717] transition-colors cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight truncate">
              User Profile & Authentication
            </h1>
            <p className="text-xs text-[#6B6B6B] truncate">Account credentials, session security & role management</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-3.5 py-1.5 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Action Status Notification Banner */}
      {profileActionStatus.message && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            profileActionStatus.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          {profileActionStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{profileActionStatus.message}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-[24px] p-5 sm:p-8 shadow-xs border border-gray-100 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Avatar Container */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-orange-50 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
              <img
                src={currentUser?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser?.name || 'Priya')}`}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#22A06B] border-2 border-white flex items-center justify-center shadow-xs"
              title="Active & Online"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-2 min-w-0 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-neutral-300 text-base font-bold text-[#171717] focus:border-[#FF6B00] outline-hidden"
                      placeholder="Full Name"
                    />
                    <button
                      onClick={handleSaveProfile}
                      className="p-1.5 rounded-xl bg-[#FF6B00] text-white hover:bg-[#E55F00] cursor-pointer"
                      title="Save Name"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(currentUser?.name || '');
                      }}
                      className="p-1.5 rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-[#171717] truncate">
                      {currentUser?.name || 'RouteSense User'}
                    </h2>
                    <button
                      onClick={() => {
                        setEditName(currentUser?.name || '');
                        setEditPhone(currentUser?.phone || '');
                        setIsEditing(true);
                      }}
                      className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-1">
                  <span className="px-2.5 py-0.5 bg-[#FF6B00]/10 text-[#FF6B00] text-xs font-bold rounded-full border border-[#FF6B00]/20">
                    {roleTitles[currentRole]}
                  </span>
                  <span className="px-2.5 py-0.5 bg-gray-100 text-neutral-600 text-[11px] font-semibold rounded-full font-mono">
                    ID: {currentUser?.employeeId || (currentUser?.role === 'passenger' ? 'PASS-9821' : currentUser?.uid || 'USR-01')}
                  </span>
                  {isEmailVerified ? (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Email Verified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-amber-600" />
                      Unverified Email
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons: Password reset & Email Verification */}
              <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0">
                {!isEmailVerified && firebaseUser && (
                  <button
                    onClick={handleSendVerification}
                    disabled={isSendingVerify}
                    className="px-2.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSendingVerify ? 'Sending...' : 'Verify Email'}</span>
                  </button>
                )}
                {currentUser?.email && (
                  <button
                    onClick={handleSendResetPassword}
                    disabled={isSendingReset}
                    className="px-2.5 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <KeyRound className="w-3 h-3 text-neutral-500" />
                    <span>{isSendingReset ? 'Sending...' : 'Reset Password'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Role & Auth Metadata details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#6B6B6B] pt-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">{currentUser?.email || 'user@routesense.in'}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 truncate">
                <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="+91 Phone"
                    className="px-2 py-0.5 rounded-lg border border-neutral-300 text-xs text-[#171717] outline-hidden"
                  />
                ) : (
                  <span className="truncate">{currentUser?.phone || 'No phone added'}</span>
                )}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 truncate">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">{assignmentInfo.location}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 truncate">
                <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">{assignmentInfo.duty}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 truncate sm:col-span-2">
                <Briefcase className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">{assignmentInfo.assignment}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Stats Grid - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {stats.map((st, i) => (
          <div key={i} className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 shadow-2xs">
            <span className="text-[11px] font-medium text-[#6B6B6B] block truncate">{st.label}</span>
            <div className="text-lg sm:text-2xl font-black text-[#171717] mt-1">{st.value}</div>
            <span className="text-[10px] font-semibold text-[#22A06B] block mt-0.5 truncate">{st.change}</span>
          </div>
        ))}
      </div>

      {/* Quick Role Switcher Persona Showcase Card (DEV ONLY) */}
      {isDemoMode && (
        <div className="bg-white rounded-[24px] p-4 sm:p-6 shadow-xs border border-gray-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h3 className="text-base font-extrabold text-[#171717] flex items-center gap-2">
                <span>Switch Role Profile</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FF6B00]/10 text-[#FF6B00] rounded-full">
                  Dev Demo Mode
                </span>
              </h3>
              <p className="text-xs text-[#6B6B6B]">Dev testing only: switch local UI view across personas</p>
            </div>
          </div>

          {/* 4 Persona Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {personas.map(p => {
              const isSelected = currentRole === p.role;
              const Icon = p.icon;

              return (
                <button
                  key={p.role}
                  onClick={() => loginAsRole(p.role)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'border-[#FF6B00] bg-orange-50/40 ring-1 ring-[#FF6B00]/40 shadow-xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#FF6B00] text-white shadow-xs' : p.badgeBg}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-[#FF6B00] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-200" />
                      )}
                    </div>

                    <span className={`text-xs font-bold block ${isSelected ? 'text-[#FF6B00]' : 'text-[#171717]'}`}>
                      {p.name}
                    </span>
                    <span className="text-[10px] font-semibold text-[#6B6B6B] block">
                      {p.label}
                    </span>
                  </div>

                  <p className="text-[9px] text-[#6B6B6B] mt-2 line-clamp-2 leading-tight">
                    {p.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Action Button: Jump to Dashboard for the current role */}
          <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[#6B6B6B] text-center sm:text-left">
              Currently active as <span className="font-bold text-[#171717]">{currentUser?.name}</span> ({roleTitles[currentRole]})
            </div>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('home')}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>Open {roleTitles[currentRole]} Workspace</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Settings & System Preferences */}
      <div className="bg-white rounded-[24px] p-4 sm:p-6 shadow-xs border border-gray-100 space-y-3">
        <h3 className="text-base font-bold text-[#171717]">System Preferences & Connectivity</h3>

        <div className="divide-y divide-gray-100">
          {/* Network Simulation Toggle */}
          <div className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-[#22A06B]" />}
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-[#171717] block truncate">Network Connectivity</span>
                <span className="text-[11px] text-[#6B6B6B] block truncate">
                  {isOffline ? 'Simulating field network outage' : 'Connected to live cloud depot'}
                </span>
              </div>
            </div>
            <button
              onClick={toggleOfflineMode}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                isOffline
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-gray-100 text-[#171717] border-gray-200 hover:bg-gray-200'
              }`}
            >
              {isOffline ? 'Offline' : 'Online'}
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-[#171717] block truncate">Operations Alerts</span>
                <span className="text-[11px] text-[#6B6B6B] block truncate">Receive real-time delay updates</span>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                notificationsEnabled ? 'bg-[#FF6B00]' : 'bg-gray-200'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  notificationsEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Language Selection */}
          <div className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-[#171717] block truncate">Regional Language</span>
                <span className="text-[11px] text-[#6B6B6B] block truncate">Transit localization</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shrink-0">
              {(
                [
                  { code: 'en', label: 'EN' },
                  { code: 'mr', label: 'मराठी' },
                  { code: 'hi', label: 'हिंदी' },
                ] as const
              ).map(l => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-2 py-0.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    language === l.code ? 'bg-white text-[#171717] shadow-xs' : 'text-[#6B6B6B] hover:text-[#171717]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* App Version Info */}
      <div className="text-center text-xs text-[#6B6B6B] space-y-0.5 pt-1">
        <p className="font-semibold text-neutral-500">RouteSense Platform v2.4.1</p>
        <p className="text-[11px]">Firebase Cloud Firestore Secured • Latency: 24ms</p>
      </div>
    </div>
  );
};
