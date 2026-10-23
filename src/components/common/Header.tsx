import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  Home,
  MapPin,
  Ticket,
  Clock,
  User as UserIcon,
  AlertTriangle,
  LayoutDashboard,
  Navigation,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOperations } from '../../context/OperationsContext';
import { UserRole } from '../../types';
import { QuickRoleSwitcher } from './QuickRoleSwitcher';
import { NotificationModal } from './NotificationModal';
import { GeminiCopilotModal } from './GeminiCopilotModal';

interface HeaderProps {
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenProfile,
  activeTab = 'home',
  onTabChange,
}) => {
  const { currentUser } = useAuth();
  const { unreadNotificationCount } = useOperations();
  const [internalShowNotifs, setInternalShowNotifs] = useState(false);
  const [showGeminiCopilot, setShowGeminiCopilot] = useState(false);

  const role: UserRole = currentUser?.role || 'passenger';

  const getNavItems = () => {
    switch (role) {
      case 'conductor':
        return [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'trips', label: 'Trips', icon: Navigation },
          { id: 'tickets', label: 'Tickets', icon: Ticket },
          { id: 'history', label: 'History', icon: Clock },
          { id: 'profile', label: 'Profile', icon: UserIcon },
        ];
      case 'driver':
        return [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'trips', label: 'Trips', icon: Navigation },
          { id: 'issues', label: 'Issues', icon: AlertTriangle },
          { id: 'history', label: 'History', icon: Clock },
          { id: 'profile', label: 'Profile', icon: UserIcon },
        ];
      case 'operations_manager':
        return [
          { id: 'home', label: 'Overview', icon: Home },
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'fleet', label: 'Live Map', icon: MapPin },
          { id: 'issues', label: 'Incidents', icon: AlertTriangle },
          { id: 'profile', label: 'Profile', icon: UserIcon },
        ];
      case 'passenger':
      default:
        return [
          { id: 'home', label: 'Home', icon: Home },
          { id: 'routes', label: 'Routes', icon: Compass },
          { id: 'tickets', label: 'Tickets', icon: Ticket },
          { id: 'tracking', label: 'Tracking', icon: MapPin },
          { id: 'profile', label: 'Profile', icon: UserIcon },
        ];
    }
  };

  const navItems = getNavItems();

  const handleOpenNotifications = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      setInternalShowNotifs(true);
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
      <header className="h-16 sm:h-20 bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-30 transition-all w-full px-3 sm:px-6 md:px-8">
        <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
          {/* Brand & Context */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FF6B00] rounded-xl flex items-center justify-center text-white shadow-xs shrink-0">
              <svg
                width="18"
                height="18"
                className="sm:w-[22px] sm:h-[22px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-xl font-extrabold tracking-tight text-[#171717] block leading-tight">
                RouteSense
              </span>
              <p className="text-[11px] text-[#6B6B6B] hidden md:block truncate">
                {currentUser?.name || 'Priya'} • {currentDateFormatted}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Same items, labels & icons as mobile BottomNav) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange?.(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'text-[#FF6B00] bg-orange-50/90 shadow-2xs'
                      : 'text-[#6B6B6B] hover:text-[#171717] hover:bg-neutral-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B00]' : 'text-[#6B6B6B]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: [AI Copilot] [Notifications] [Profile] [Passenger ▼] */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* 1. Single AI Copilot Button */}
            <button
              onClick={() => setShowGeminiCopilot(true)}
              title="AI Copilot"
              aria-label="AI Copilot"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-50 hover:bg-orange-100/90 text-[#FF6B00] border border-orange-200/90 shadow-2xs flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
            >
              <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#FF6B00]" />
            </button>

            {/* 2. Notification Bell */}
            <button
              onClick={handleOpenNotifications}
              title="Notifications"
              aria-label="Notifications"
              className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-[#171717] border border-gray-100 shadow-2xs flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#6B6B6B]" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF6B00] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* 3. User Avatar - Profile Link */}
            <button
              onClick={onOpenProfile}
              title="Profile"
              aria-label="Profile"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FF6B00]/10 border-2 border-white shadow-2xs flex items-center justify-center overflow-hidden shrink-0 hover:ring-2 hover:ring-[#FF6B00]/40 transition-all cursor-pointer"
            >
              <img
                src={currentUser?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || 'Priya'}`}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </button>

            {/* 4. Passenger / Role Dropdown Selector */}
            <QuickRoleSwitcher />
          </div>
        </div>
      </header>

      {/* Internal Notification Modal */}
      <NotificationModal
        isOpen={internalShowNotifs}
        onClose={() => setInternalShowNotifs(false)}
      />

      {/* Gemini Transit Copilot Modal */}
      <GeminiCopilotModal
        isOpen={showGeminiCopilot}
        onClose={() => setShowGeminiCopilot(false)}
      />
    </>
  );
};
